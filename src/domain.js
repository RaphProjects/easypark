export const VEHICLE_TYPES = ['voiture', 'moto', 'utilitaire']
export const SPOT_STATUSES = ['available', 'occupied', 'reserved', 'out_of_service']
export const FEATURES = ['pmr', 'famille', 'electrique', 'livraison', 'service mairie']

export const defaultSettings = {
  hourlyRate: 2.4,
  freeMinutes: 15,
  monthlySubscriptionPrice: 45,
  annualSubscriptionPrice: 480,
  municipalityName: 'Mairie de Centre-Ville',
}

export function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function normalizePlate(plate) {
  return String(plate || '').trim().toUpperCase().replace(/\s+/g, '-')
}

export function minutesBetween(startIso, endIso) {
  return Math.max(0, Math.ceil((new Date(endIso) - new Date(startIso)) / 60000))
}

export function calculateParkingAmount(startIso, endIso, settings = defaultSettings, hasActiveSubscription = false) {
  if (hasActiveSubscription) return 0
  const minutes = minutesBetween(startIso, endIso)
  const billableMinutes = Math.max(0, minutes - Number(settings.freeMinutes || 0))
  return Number(((billableMinutes / 60) * Number(settings.hourlyRate || 0)).toFixed(2))
}

export function isSubscriptionActive(subscription, at = new Date()) {
  if (!subscription || subscription.status !== 'active') return false
  const now = new Date(at)
  return new Date(subscription.startsAt) <= now && now <= new Date(subscription.endsAt)
}

export function findActiveSubscription(subscriptions, plate, at = new Date()) {
  const normalized = normalizePlate(plate)
  return subscriptions.find((subscription) => normalizePlate(subscription.plate) === normalized && isSubscriptionActive(subscription, at))
}

export function findCompatibleSpot(spots, vehicleType) {
  return spots.find((spot) => spot.status === 'available' && spot.vehicleType === vehicleType)
}

export function seedData() {
  const spots = [
    ['A01', 'Centre', 'Rang A', 'voiture', []],
    ['A02', 'Centre', 'Rang A', 'voiture', ['pmr']],
    ['A03', 'Centre', 'Rang A', 'voiture', ['famille']],
    ['A04', 'Centre', 'Rang A', 'voiture', ['electrique']],
    ['B01', 'Mairie', 'Rang B', 'voiture', ['service mairie']],
    ['B02', 'Mairie', 'Rang B', 'utilitaire', ['livraison']],
    ['M01', 'Deux roues', 'Rang M', 'moto', []],
    ['M02', 'Deux roues', 'Rang M', 'moto', []],
    ['C01', 'Centre', 'Rang C', 'voiture', []],
    ['C02', 'Centre', 'Rang C', 'voiture', []],
  ].map(([number, zone, row, vehicleType, features]) => ({
    id: uid('spot'),
    number,
    zone,
    row,
    vehicleType,
    features,
    status: 'available',
  }))

  return {
    role: 'admin',
    settings: { ...defaultSettings },
    spots,
    vehicles: [],
    sessions: [],
    subscriptions: [
      {
        id: uid('sub'),
        holderName: 'Association des commercants',
        plate: 'AB-123-CD',
        vehicleType: 'voiture',
        plan: 'monthly',
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'active',
      },
    ],
    invoices: [],
    audit: [],
  }
}
