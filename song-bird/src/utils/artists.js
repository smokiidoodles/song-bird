export function formatFollowers(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return `${count}`
}

export function formatTempo(tempo) {
  return `${Math.round(tempo)} BPM`
}

export function toPercent(value) {
  return `${Math.round(value * 100)}%`
}