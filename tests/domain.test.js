import assert from 'node:assert/strict'
import {
  calculateParkingAmount,
  defaultSettings,
  findActiveSubscription,
  findCompatibleSpot,
  isSubscriptionActive,
  normalizePlate,
} from '../src/domain.js'

const start = '2026-05-29T10:00:00.000Z'
const end = '2026-05-29T11:15:00.000Z'

assert.equal(normalizePlate(' ab 123 cd '), 'AB-123-CD')
assert.equal(calculateParkingAmount(start, end, { ...defaultSettings, hourlyRate: 2, freeMinutes: 15 }), 2)
assert.equal(calculateParkingAmount(start, end, defaultSettings, true), 0)

const subscription = {
  plate: 'AB-123-CD',
  status: 'active',
  startsAt: '2026-05-01T00:00:00.000Z',
  endsAt: '2026-06-01T00:00:00.000Z',
}
assert.equal(isSubscriptionActive(subscription, '2026-05-29T12:00:00.000Z'), true)
assert.equal(isSubscriptionActive({ ...subscription, status: 'suspended' }, '2026-05-29T12:00:00.000Z'), false)
assert.equal(findActiveSubscription([subscription], 'ab 123 cd', '2026-05-29T12:00:00.000Z'), subscription)

const spot = findCompatibleSpot([
  { number: 'A01', status: 'occupied', vehicleType: 'voiture' },
  { number: 'M01', status: 'available', vehicleType: 'moto' },
], 'moto')
assert.equal(spot.number, 'M01')

console.log('Domain tests passed')
