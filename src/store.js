import { reactive, watch } from 'vue'
import {
  calculateParkingAmount,
  defaultSettings,
  findActiveSubscription,
  findCompatibleSpot,
  normalizePlate,
  seedData,
  uid,
} from './domain'

const STORAGE_KEY = 'easypark-mairie-state'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved ? { ...seedData(), ...saved, settings: { ...defaultSettings, ...saved.settings } } : seedData()
  } catch {
    return seedData()
  }
}

export const state = reactive(loadState())

watch(
  state,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true }
)

export function resetDemo() {
  Object.assign(state, seedData())
}

function audit(action, details) {
  state.audit.unshift({ id: uid('audit'), at: new Date().toISOString(), action, details })
}

export function saveSpot(spot) {
  const payload = {
    ...spot,
    number: String(spot.number || '').trim().toUpperCase(),
    features: Array.isArray(spot.features) ? spot.features : [],
  }
  if (!payload.number) throw new Error('Le numero de place est obligatoire.')
  if (state.spots.some((item) => item.number === payload.number && item.id !== payload.id)) {
    throw new Error('Ce numero de place existe deja.')
  }
  if (payload.id) {
    const index = state.spots.findIndex((item) => item.id === payload.id)
    state.spots[index] = payload
    audit('Place modifiee', payload.number)
    return
  }
  state.spots.push({ ...payload, id: uid('spot'), status: payload.status || 'available' })
  audit('Place creee', payload.number)
}

export function removeSpot(id) {
  const spot = state.spots.find((item) => item.id === id)
  if (!spot || spot.status === 'occupied') throw new Error('Impossible de supprimer une place occupee.')
  state.spots = state.spots.filter((item) => item.id !== id)
  audit('Place supprimee', spot.number)
}

export function simulateEntry({ plate, vehicleType, eligibility = [] }) {
  const normalizedPlate = normalizePlate(plate)
  if (!normalizedPlate) throw new Error('La plaque est obligatoire.')
  if (state.sessions.some((session) => session.plate === normalizedPlate && session.status === 'active')) {
    throw new Error('Ce vehicule est deja stationne.')
  }
  const spot = findCompatibleSpot(state.spots, vehicleType, eligibility)
  if (!spot) throw new Error('Aucune place compatible disponible pour ce vehicule et ses droits.')
  const subscription = findActiveSubscription(state.subscriptions, normalizedPlate)
  const session = {
    id: uid('session'),
    plate: normalizedPlate,
    vehicleType,
    spotId: spot.id,
    spotNumber: spot.number,
    enteredAt: new Date().toISOString(),
    exitedAt: null,
    durationMinutes: null,
    amount: 0,
    status: 'active',
    subscriptionId: subscription?.id || null,
    eligibility,
  }
  state.vehicles.unshift({ id: uid('vehicle'), plate: normalizedPlate, vehicleType, ownerName: subscription?.holderName || '' })
  state.sessions.unshift(session)
  spot.status = 'occupied'
  audit('Entree vehicule', `${normalizedPlate} vers ${spot.number}`)
  return session
}

export function simulateExit(plate) {
  const normalizedPlate = normalizePlate(plate)
  const session = state.sessions.find((item) => item.plate === normalizedPlate && item.status === 'active')
  if (!session) throw new Error('Aucune session active pour cette plaque.')
  const exitedAt = new Date().toISOString()
  const subscription = state.subscriptions.find((item) => item.id === session.subscriptionId)
  const amount = calculateParkingAmount(session.enteredAt, exitedAt, state.settings, Boolean(subscription))
  const durationMinutes = Math.max(1, Math.ceil((new Date(exitedAt) - new Date(session.enteredAt)) / 60000))
  Object.assign(session, { exitedAt, amount, durationMinutes, status: 'closed' })
  const spot = state.spots.find((item) => item.id === session.spotId)
  if (spot) spot.status = 'available'
  const invoice = {
    id: uid('invoice'),
    reference: `FAC-${new Date().getFullYear()}-${String(state.invoices.length + 1).padStart(4, '0')}`,
    kind: subscription ? 'abonnement' : 'horaire',
    plate: normalizedPlate,
    amount,
    status: amount === 0 ? 'paid' : 'pending',
    issuedAt: exitedAt,
    sessionId: session.id,
  }
  state.invoices.unshift(invoice)
  audit('Sortie vehicule', `${normalizedPlate}, facture ${invoice.reference}`)
  return invoice
}

export function saveSubscription(subscription) {
  const payload = { ...subscription, plate: normalizePlate(subscription.plate) }
  if (!payload.holderName || !payload.plate) throw new Error('Le titulaire et la plaque sont obligatoires.')
  if (payload.id) {
    const index = state.subscriptions.findIndex((item) => item.id === payload.id)
    state.subscriptions[index] = payload
    audit('Abonnement modifie', payload.plate)
    return
  }
  state.subscriptions.unshift({ ...payload, id: uid('sub'), status: payload.status || 'active' })
  audit('Abonnement cree', payload.plate)
}
