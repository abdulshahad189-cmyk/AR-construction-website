import { describe, expect, it } from 'vitest'
import {
  estimateConstructionStartingPrice,
  HOUSE_CONSTRUCTION_STAGES,
  validateHouseConstructionEnquiry,
} from '../../shared/validation'
import {
  defaultHouseConstructionPackage,
  isHouseConstructionPackage,
  parseHouseConstructionPackage,
} from './house-construction-data'

const validEnquiry = {
  full_name: 'Asha Rao',
  phone: '+91 98765 43210',
  construction_locality: 'Miyapur, Hyderabad',
  plot_area: 1800,
  built_up_area: 2400,
  floors: 2,
  project_stage: HOUSE_CONSTRUCTION_STAGES[1],
  budget_range: 'To be discussed',
  message: 'We are planning a family home on our plot.',
  consent: true,
}

describe('house construction estimate', () => {
  it('calculates the area times the advertised starting rate', () => {
    expect(estimateConstructionStartingPrice(1500)).toBe(2_625_000)
    expect(estimateConstructionStartingPrice(1500, 2000)).toBe(3_000_000)
  })

  it('rejects empty, non-finite, non-positive, over-limit and over-precision areas', () => {
    for (const area of [Number.NaN, Number.POSITIVE_INFINITY, 0, -1, 100_000.01, 1.234]) {
      expect(estimateConstructionStartingPrice(area)).toBeNull()
    }
  })
})

describe('house construction enquiry validation', () => {
  it('accepts a complete construction quotation request', () => {
    expect(validateHouseConstructionEnquiry(validEnquiry)).toBeNull()
  })

  it('rejects invalid areas, floor count, stage, budget and missing consent', () => {
    expect(validateHouseConstructionEnquiry({ ...validEnquiry, plot_area: 0 })).toContain('plot area')
    expect(validateHouseConstructionEnquiry({ ...validEnquiry, built_up_area: 100_001 })).toContain('built-up area')
    expect(validateHouseConstructionEnquiry({ ...validEnquiry, floors: 1.5 })).toContain('whole number')
    expect(validateHouseConstructionEnquiry({ ...validEnquiry, project_stage: 'Unrecognized' })).toContain('stage')
    expect(validateHouseConstructionEnquiry({ ...validEnquiry, budget_range: 'Unknown amount' })).toContain('budget')
    expect(validateHouseConstructionEnquiry({ ...validEnquiry, consent: false })).toContain('consent')
  })
})

describe('house construction package configuration', () => {
  it('keeps unapproved package items unconfirmed by default', () => {
    expect(defaultHouseConstructionPackage.startingRate).toBe(1750)
    expect(defaultHouseConstructionPackage.scopeItems.every(item => item.status === 'to_confirm')).toBe(true)
    expect(defaultHouseConstructionPackage.separatelyQuotedCandidates.every(item => item.status === 'to_confirm')).toBe(true)
  })

  it('validates and parses administrator-edited package JSON', () => {
    const serialized = JSON.stringify(defaultHouseConstructionPackage)
    expect(isHouseConstructionPackage(JSON.parse(serialized))).toBe(true)
    expect(parseHouseConstructionPackage(serialized)).toEqual(defaultHouseConstructionPackage)
    expect(() => parseHouseConstructionPackage('{')).toThrow('valid JSON')
    expect(() => parseHouseConstructionPackage(JSON.stringify({ startingRate: -1 }))).toThrow('invalid')
  })
})
