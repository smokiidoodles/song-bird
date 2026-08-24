// Simple mock producers/studios for brainstorming
const mockProducers = {
  'artist-tems': [{ name: 'GuiltyBeatz', country: 'Ghana' }],
  'artist-stromae': [{ name: 'Orelsan', country: 'France' }],
  'artist-rosalia': [{ name: 'El Guincho', country: 'Spain' }],
  'artist-khruangbin': [{ name: 'Khruangbin (self-produced)', country: 'USA' }],
  'artist-burna-boy': [{ name: 'Leriq', country: 'Nigeria' }],
  'artist-mitski': [{ name: 'Patrick Hyland', country: 'USA' }],
}

const mockStudios = {
  'artist-tems': [{ name: 'Lagos Studio A', country: 'Nigeria' }],
  'artist-stromae': [{ name: 'Brussels Studio X', country: 'Belgium' }],
  'artist-rosalia': [{ name: 'Madrid Studio M', country: 'Spain' }],
  'artist-khruangbin': [{ name: 'Houston Studio H', country: 'USA' }],
  'artist-burna-boy': [{ name: 'Lagos Studio B', country: 'Nigeria' }],
  'artist-mitski': [{ name: 'NYC Studio N', country: 'USA' }],
}

export function getProducersForArtist(spotifyId) {
  return mockProducers[spotifyId] ?? []
}

export function getStudiosForArtist(spotifyId) {
  return mockStudios[spotifyId] ?? []
}

export function buildArtistRelationshipGraph(artists) {
  const nodes = []
  const edges = []

  // Add artist nodes
  artists.forEach((artist) => {
    nodes.push({
      id: artist.spotifyId,
      type: 'artist',
      label: artist.name,
      country: artist.country,
      region: artist.region,
    })
  })

  // Add producer nodes and edges
  const producerMap = new Map()
  artists.forEach((artist) => {
    const producers = getProducersForArtist(artist.spotifyId)
    producers.forEach((p) => {
      const key = `producer:${p.name}`
      if (!producerMap.has(key)) {
        producerMap.set(key, {
          id: key,
          type: 'producer',
          label: p.name,
          country: p.country,
        })
      }
      edges.push({
        source: artist.spotifyId,
        target: key,
        relation: 'produced_by',
      })
    })
  })
  producerMap.forEach((node) => nodes.push(node))

  // Add studio nodes and edges
  const studioMap = new Map()
  artists.forEach((artist) => {
    const studios = getStudiosForArtist(artist.spotifyId)
    studios.forEach((s) => {
      const key = `studio:${s.name}`
      if (!studioMap.has(key)) {
        studioMap.set(key, {
          id: key,
          type: 'studio',
          label: s.name,
          country: s.country,
        })
      }
      edges.push({
        source: artist.spotifyId,
        target: key,
        relation: 'recorded_at',
      })
    })
  })
  studioMap.forEach((node) => nodes.push(node))

  // Add country nodes and edges
  const countryMap = new Map()
  artists.forEach((artist) => {
    const key = `country:${artist.country}`
    if (!countryMap.has(key)) {
      countryMap.set(key, {
        id: key,
        type: 'country',
        label: artist.country,
        region: artist.region,
      })
    }
    edges.push({
      source: artist.spotifyId,
      target: key,
      relation: 'from_country',
    })
  })
  countryMap.forEach((node) => nodes.push(node))

  // Add same-country edges between artists
  const artistsByCountry = {}
  artists.forEach((artist) => {
    const key = artist.country
    if (!artistsByCountry[key]) artistsByCountry[key] = []
    artistsByCountry[key].push(artist)
  })

  Object.values(artistsByCountry).forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        edges.push({
          source: group[i].spotifyId,
          target: group[j].spotifyId,
          relation: 'same_country',
        })
      }
    }
  })

  return { nodes, edges }
}