export const MAX_CONSTRUCTION_AREA_SQ_FT = 100_000

export function estimateConstructionStartingPrice(area: number, rate = 1750): number | null {
  if (!Number.isFinite(area) || area <= 0 || area > MAX_CONSTRUCTION_AREA_SQ_FT ||
      Number(area.toFixed(2)) !== area || !Number.isFinite(rate) || rate <= 0) return null
  const amount = area * rate
  return Number.isSafeInteger(amount) ? amount : null
}
