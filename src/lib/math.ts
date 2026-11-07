export const DIMS = [
  { id: 'economic', name: 'Economic Order', left: 'Command / Planned', right: 'Market / Private', color: '#1e3a8a' },
  { id: 'authority', name: 'Authority & Order', left: 'Libertarian', right: 'Authoritarian', color: '#dc2626' },
  { id: 'globalism', name: 'Global vs National', left: 'Internationalist', right: 'Nationalist', color: '#059669' },
  { id: 'progress', name: 'Social Progress', left: 'Progressive', right: 'Traditional', color: '#7c3aed' },
  { id: 'civic', name: 'Civic & Spiritual', left: 'Secular', right: 'Religious', color: '#d97706' },
  { id: 'equality', name: 'Equality vs Hierarchy', left: 'Egalitarian', right: 'Hierarchical', color: '#0891b2' },
  { id: 'intervention', name: 'Foreign Intervention', left: 'Non-interventionist', right: 'Interventionist', color: '#be185d' },
  { id: 'technocracy', name: 'Technocracy vs Populism', left: 'Technocratic', right: 'Populist', color: '#6b21a8' },
  { id: 'environment', name: 'Environment vs Development', left: 'Environmental', right: 'Developmental', color: '#15803d' },
  { id: 'urban_rural', name: 'Urban vs Rural', left: 'Urban-focused', right: 'Rural-focused', color: '#b45309' },
  { id: 'collectivism', name: 'Collectivism vs Individualism', left: 'Collectivist', right: 'Individualist', color: '#0ea5e9' },
  { id: 'pace', name: 'Pace of Change', left: 'Reformist', right: 'Revolutionary', color: '#db2777' },
  { id: 'religion_state', name: 'Religion & State', left: 'Strict Separation', right: 'State Religion', color: '#7c2d12' },
  { id: 'denomination', name: 'Religious Tradition', left: 'None / Atheist', right: 'Established Denomination', color: '#92400e' },
]

const DIM_BY_ID: Record<string, typeof DIMS[number]> = {}
DIMS.forEach((d) => {
  DIM_BY_ID[d.id] = d
})

export { DIM_BY_ID }

export function s(
  e: number, a: number, g: number, p: number, c: number,
  eq: number, int: number, tec: number, env: number,
  urb: number, col: number, pace: number,
  rel: number, den: number
) {
  return {
    economic: e, authority: a, globalism: g, progress: p, civic: c,
    equality: eq, intervention: int, technocracy: tec, environment: env,
    urban_rural: urb, collectivism: col, pace: pace,
    religion_state: rel, denomination: den,
  }
}

export function dot(a: Record<string, number>, b: Record<string, number>): number {
  let s = 0
  for (const k of Object.keys(a)) s += a[k] * b[k]
  return s
}

export function mag(a: Record<string, number>): number {
  return Math.sqrt(Object.values(a).reduce((s, v) => s + v * v, 0))
}

export function cosSim(a: Record<string, number>, b: Record<string, number>): number {
  const m = mag(a) * mag(b)
  return m === 0 ? 0 : dot(a, b) / m
}

export function matchPct(a: Record<string, number>, b: Record<string, number>): number {
  return Math.round(((cosSim(a, b) + 1) / 2) * 100)
}

export function normalize(raw: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const k of Object.keys(raw)) {
    out[k] = Math.max(-3, Math.min(3, raw[k]))
  }
  return out
}

export const DIM_LEFT: Record<string, string> = {
  economic: 'Command / Planned', authority: 'Libertarian', globalism: 'Internationalist',
  progress: 'Progressive', civic: 'Secular', equality: 'Egalitarian',
  intervention: 'Non-interventionist', technocracy: 'Technocratic',
  environment: 'Environmental', urban_rural: 'Urban-focused',
  collectivism: 'Collectivist', pace: 'Reformist',
  religion_state: 'Strict Separation', denomination: 'None / Atheist',
}

export const DIM_RIGHT: Record<string, string> = {
  economic: 'Market / Private', authority: 'Authoritarian', globalism: 'Nationalist',
  progress: 'Traditional', civic: 'Religious', equality: 'Hierarchical',
  intervention: 'Interventionist', technocracy: 'Populist',
  environment: 'Developmental', urban_rural: 'Rural-focused',
  collectivism: 'Individualist', pace: 'Revolutionary',
  religion_state: 'State Religion', denomination: 'Established Denomination',
}
