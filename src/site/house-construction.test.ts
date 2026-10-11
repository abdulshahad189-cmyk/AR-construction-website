import { describe, expect, it } from 'vitest'
import { estimateConstructionStartingPrice } from '../../shared/validation'
import { defaultHouseConstructionPackage } from './house-construction-data'

describe('house construction estimate', () => {
  it('calculates area times the advertised starting rate', () => {
    expect(estimateConstructionStartingPrice(1500)).toBe(2_625_000)
    expect(estimateConstructionStartingPrice(1500, 2000)).toBe(3_000_000)
  })

  it('rejects invalid areas and rates', () => {
    for (const area of [Number.NaN, Number.POSITIVE_INFINITY, 0, -1, 100_000.01, 1.234]) {
      expect(estimateConstructionStartingPrice(area)).toBeNull()
    }
    expect(estimateConstructionStartingPrice(100, 0)).toBeNull()
  })
})

describe('static house construction package', () => {
  it('keeps unconfirmed package items clearly marked', () => {
    expect(defaultHouseConstructionPackage.startingRate).toBe(1750)
    expect(defaultHouseConstructionPackage.scopeItems.every(item => item.status === 'to_confirm')).toBe(true)
    expect(defaultHouseConstructionPackage.separatelyQuotedCandidates.every(item => item.status === 'to_confirm')).toBe(true)
  })
})
