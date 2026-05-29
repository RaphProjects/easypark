<script setup>
import { computed, reactive, ref } from 'vue'
import {
  Activity,
  Banknote,
  Car,
  FileDown,
  LogIn,
  LogOut,
  ParkingCircle,
  Plus,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-vue-next'
import { FEATURES, SPOT_STATUSES, VEHICLE_TYPES } from './domain'
import { removeSpot, resetDemo, saveSpot, saveSubscription, simulateEntry, simulateExit, state } from './store'

const statusLabels = {
  available: 'Disponible',
  occupied: 'Occupee',
  reserved: 'Reservee',
  out_of_service: 'Hors service',
}

const filters = reactive({ status: 'all', vehicleType: 'all', feature: 'all', zone: 'all' })
const entryForm = reactive({ plate: '', vehicleType: 'voiture', eligibility: [] })
const exitForm = reactive({ plate: '' })
const spotForm = reactive(emptySpot())
const subscriptionForm = reactive(emptySubscription())
const message = ref('')
const error = ref('')

function emptySpot() {
  return { id: null, number: '', zone: 'Centre', row: 'Rang A', vehicleType: 'voiture', status: 'available', features: [] }
}

function emptySubscription() {
  const now = new Date()
  const end = new Date(now)
  end.setMonth(end.getMonth() + 1)
  return {
    id: null,
    holderName: '',
    plate: '',
    vehicleType: 'voiture',
    plan: 'monthly',
    startsAt: now.toISOString().slice(0, 10),
    endsAt: end.toISOString().slice(0, 10),
    status: 'active',
  }
}

function run(action, success) {
  try {
    error.value = ''
    const result = action()
    message.value = success(result)
  } catch (exception) {
    message.value = ''
    error.value = exception.message
  }
}

const zones = computed(() => [...new Set(state.spots.map((spot) => spot.zone))])
const filteredSpots = computed(() =>
  state.spots.filter((spot) => {
    if (filters.status !== 'all' && spot.status !== filters.status) return false
    if (filters.vehicleType !== 'all' && spot.vehicleType !== filters.vehicleType) return false
    if (filters.feature !== 'all' && !spot.features.includes(filters.feature)) return false
    if (filters.zone !== 'all' && spot.zone !== filters.zone) return false
    return true
  })
)

const activeSessions = computed(() => state.sessions.filter((session) => session.status === 'active'))
const closedToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return state.sessions.filter((session) => session.exitedAt?.startsWith(today))
})
const revenueToday = computed(() => closedToday.value.reduce((sum, session) => sum + Number(session.amount || 0), 0))
const occupationRate = computed(() => {
  const usable = state.spots.filter((spot) => spot.status !== 'out_of_service').length || 1
  return Math.round((activeSessions.value.length / usable) * 100)
})
const expiredSubscriptions = computed(() => state.subscriptions.filter((subscription) => new Date(subscription.endsAt) < new Date()).length)

function submitEntry() {
  run(
    () => simulateEntry(entryForm),
    (session) => `Entree enregistree : ${session.plate} sur la place ${session.spotNumber}.`
  )
  entryForm.plate = ''
  entryForm.eligibility = []
}

function submitExit() {
  run(
    () => simulateExit(exitForm.plate),
    (invoice) => `Sortie enregistree : facture ${invoice.reference} de ${formatMoney(invoice.amount)}.`
  )
  exitForm.plate = ''
}

function editSpot(spot) {
  Object.assign(spotForm, { ...spot, features: [...spot.features] })
}

function submitSpot() {
  run(
    () => saveSpot(spotForm),
    () => `Place ${spotForm.number.toUpperCase()} enregistree.`
  )
  Object.assign(spotForm, emptySpot())
}

function deleteSpot(id) {
  run(
    () => removeSpot(id),
    () => 'Place supprimee.'
  )
}

function submitSubscription() {
  run(
    () =>
      saveSubscription({
        ...subscriptionForm,
        startsAt: new Date(subscriptionForm.startsAt).toISOString(),
        endsAt: new Date(subscriptionForm.endsAt).toISOString(),
      }),
    () => `Abonnement ${subscriptionForm.plate.toUpperCase()} enregistre.`
  )
  Object.assign(subscriptionForm, emptySubscription())
}

function exportInvoices() {
  const header = 'reference,type,plaque,montant,statut,date'
  const rows = state.invoices.map((invoice) =>
    [invoice.reference, invoice.kind, invoice.plate, invoice.amount, invoice.status, invoice.issuedAt].join(',')
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'factures-easypark.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

function formatMoney(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))
}
</script>

<template>
  <main class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <ParkingCircle />
        <div>
          <strong>EasyPark</strong>
          <span>{{ state.settings.municipalityName }}</span>
        </div>
      </div>
      <nav>
        <a href="#dashboard"><Activity /> Tableau de bord</a>
        <a href="#parking"><Car /> Parc de places</a>
        <a href="#operations"><LogIn /> Entrees / sorties</a>
        <a href="#subscriptions"><Users /> Abonnements</a>
        <a href="#billing"><Banknote /> Facturation</a>
        <a href="#settings"><Settings /> Configuration</a>
      </nav>
      <button class="ghost" @click="resetDemo"><RotateCcw /> Reinitialiser demo</button>
    </aside>

    <section class="workspace">
      <div class="ambient fx-one"></div>
      <div class="ambient fx-two"></div>
      <div class="ambient fx-three"></div>

      <header class="topbar">
        <div>
          <p>Back-office mairie</p>
          <h1>Gestion du parking municipal</h1>
        </div>
        <div class="role-pill"><ShieldCheck size="18" /> Role {{ state.role }}</div>
      </header>

      <div v-if="message" class="notice success">{{ message }}</div>
      <div v-if="error" class="notice danger">{{ error }}</div>

      <section id="dashboard" class="metrics">
        <article><span>Occupation</span><strong>{{ occupationRate }}%</strong><small>{{ activeSessions.length }} vehicules stationnes</small></article>
        <article><span>Recettes jour</span><strong>{{ formatMoney(revenueToday) }}</strong><small>{{ closedToday.length }} sorties aujourd'hui</small></article>
        <article><span>Abonnements</span><strong>{{ state.subscriptions.length }}</strong><small>{{ expiredSubscriptions }} expires</small></article>
        <article><span>Hors service</span><strong>{{ state.spots.filter((spot) => spot.status === 'out_of_service').length }}</strong><small>places indisponibles</small></article>
      </section>

      <section id="parking" class="panel">
        <div class="section-title">
          <div>
            <p>Visualisation</p>
            <h2>Parc de places</h2>
          </div>
          <div class="filters">
            <select v-model="filters.status"><option value="all">Tous statuts</option><option v-for="status in SPOT_STATUSES" :key="status" :value="status">{{ statusLabels[status] }}</option></select>
            <select v-model="filters.vehicleType"><option value="all">Tous types</option><option v-for="type in VEHICLE_TYPES" :key="type" :value="type">{{ type }}</option></select>
            <select v-model="filters.feature"><option value="all">Toutes options</option><option v-for="feature in FEATURES" :key="feature" :value="feature">{{ feature }}</option></select>
            <select v-model="filters.zone"><option value="all">Toutes zones</option><option v-for="zone in zones" :key="zone" :value="zone">{{ zone }}</option></select>
          </div>
        </div>
        <div class="parking-grid">
          <button v-for="spot in filteredSpots" :key="spot.id" class="spot" :class="spot.status" @click="editSpot(spot)">
            <strong>{{ spot.number }}</strong>
            <span>{{ spot.vehicleType }}</span>
            <small>{{ statusLabels[spot.status] }}</small>
            <em>{{ spot.features.join(' · ') || spot.zone }}</em>
          </button>
        </div>
      </section>

      <section class="two-columns">
        <form class="panel form-panel" @submit.prevent="submitSpot">
          <div class="section-title">
            <div>
              <p>CRUD</p>
              <h2>{{ spotForm.id ? 'Modifier une place' : 'Nouvelle place' }}</h2>
            </div>
          </div>
          <div class="form-grid">
            <label>Numero<input v-model="spotForm.number" required /></label>
            <label>Zone<input v-model="spotForm.zone" required /></label>
            <label>Rang<input v-model="spotForm.row" required /></label>
            <label>Type<select v-model="spotForm.vehicleType"><option v-for="type in VEHICLE_TYPES" :key="type">{{ type }}</option></select></label>
            <label>Statut<select v-model="spotForm.status"><option v-for="status in SPOT_STATUSES" :key="status" :value="status">{{ statusLabels[status] }}</option></select></label>
          </div>
          <div class="chips">
            <label v-for="feature in FEATURES" :key="feature"><input v-model="spotForm.features" type="checkbox" :value="feature" />{{ feature }}</label>
          </div>
          <div class="actions">
            <button type="submit"><Save size="18" /> Enregistrer</button>
            <button type="button" class="ghost" @click="Object.assign(spotForm, emptySpot())"><Plus size="18" /> Nouveau</button>
            <button v-if="spotForm.id" type="button" class="danger-button" @click="deleteSpot(spotForm.id)"><Trash2 size="18" /> Supprimer</button>
          </div>
        </form>

        <section id="operations" class="panel form-panel">
          <div class="section-title">
            <div>
              <p>Simulation</p>
              <h2>Entrees / sorties</h2>
            </div>
          </div>
          <form class="operation" @submit.prevent="submitEntry">
            <input v-model="entryForm.plate" placeholder="Plaque AB-123-CD" required />
            <select v-model="entryForm.vehicleType"><option v-for="type in VEHICLE_TYPES" :key="type">{{ type }}</option></select>
            <button><LogIn size="18" /> Entree</button>
          </form>
          <div class="chips compact-chips">
            <label><input v-model="entryForm.eligibility" type="checkbox" value="pmr" />Carte PMR</label>
            <label><input v-model="entryForm.eligibility" type="checkbox" value="famille" />Famille</label>
            <label><input v-model="entryForm.eligibility" type="checkbox" value="livraison" />Livraison</label>
            <label><input v-model="entryForm.eligibility" type="checkbox" value="service mairie" />Service mairie</label>
          </div>
          <form class="operation" @submit.prevent="submitExit">
            <input v-model="exitForm.plate" placeholder="Plaque a sortir" required />
            <button><LogOut size="18" /> Sortie</button>
          </form>
          <div class="table compact">
            <div v-for="session in activeSessions" :key="session.id" class="row">
              <strong>{{ session.plate }}</strong><span>{{ session.spotNumber }}</span><small>{{ new Date(session.enteredAt).toLocaleTimeString('fr-FR') }}</small>
            </div>
          </div>
        </section>
      </section>

      <section id="subscriptions" class="two-columns">
        <form class="panel form-panel" @submit.prevent="submitSubscription">
          <div class="section-title"><div><p>Gestion</p><h2>Abonnements</h2></div></div>
          <div class="form-grid">
            <label>Titulaire<input v-model="subscriptionForm.holderName" required /></label>
            <label>Plaque<input v-model="subscriptionForm.plate" required /></label>
            <label>Type vehicule<select v-model="subscriptionForm.vehicleType"><option v-for="type in VEHICLE_TYPES" :key="type">{{ type }}</option></select></label>
            <label>Formule<select v-model="subscriptionForm.plan"><option value="monthly">Mensuel</option><option value="annual">Annuel</option></select></label>
            <label>Debut<input v-model="subscriptionForm.startsAt" type="date" /></label>
            <label>Fin<input v-model="subscriptionForm.endsAt" type="date" /></label>
          </div>
          <button><Save size="18" /> Enregistrer abonnement</button>
        </form>
        <section class="panel">
          <div class="section-title"><div><p>Actifs</p><h2>Liste abonnements</h2></div></div>
          <div class="table">
            <div v-for="subscription in state.subscriptions" :key="subscription.id" class="row">
              <strong>{{ subscription.plate }}</strong><span>{{ subscription.holderName }}</span><small>{{ subscription.plan }} · {{ subscription.status }}</small>
            </div>
          </div>
        </section>
      </section>

      <section id="billing" class="panel">
        <div class="section-title">
          <div><p>Recus</p><h2>Facturation</h2></div>
          <button class="ghost" @click="exportInvoices"><FileDown size="18" /> Export CSV</button>
        </div>
        <div class="table">
          <div v-for="invoice in state.invoices" :key="invoice.id" class="row">
            <strong>{{ invoice.reference }}</strong><span>{{ invoice.plate }} · {{ invoice.kind }}</span><small>{{ formatMoney(invoice.amount) }} · {{ invoice.status }}</small>
          </div>
          <p v-if="!state.invoices.length" class="empty">Aucune facture pour le moment.</p>
        </div>
      </section>

      <section id="settings" class="panel form-panel">
        <div class="section-title"><div><p>Parametres</p><h2>Tarifs et mairie</h2></div></div>
        <div class="form-grid">
          <label>Nom mairie<input v-model="state.settings.municipalityName" /></label>
          <label>Tarif horaire (€)<input v-model.number="state.settings.hourlyRate" type="number" min="0" step="0.1" /></label>
          <label>Minutes gratuites<input v-model.number="state.settings.freeMinutes" type="number" min="0" /></label>
          <label>Abonnement mensuel (€)<input v-model.number="state.settings.monthlySubscriptionPrice" type="number" min="0" /></label>
        </div>
      </section>
    </section>
  </main>
</template>
