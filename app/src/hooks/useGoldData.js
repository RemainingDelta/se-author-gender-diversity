import { useState, useEffect } from 'react'

export function useGoldData() {
  const [state, setState] = useState({
    yearlyStats: null,
    topicStats: null,
    venueAuthors: null,
    loading: true,
  })

  useEffect(() => {
    const venues = ['ICSE', 'ECSA', 'MSR', 'ICSME']
    Promise.all([
      fetch('/data/yearly_stats.json').then((r) => r.json()),
      fetch('/data/topic_stats.json').then((r) => r.json()),
      ...venues.map((v) => fetch(`/data/${v}.json`).then((r) => r.json())),
    ]).then(([yearlyStats, topicStats, ...authorFiles]) => {
      const venueAuthors = Object.fromEntries(venues.map((v, i) => [v, authorFiles[i]]))
      setState({ yearlyStats, topicStats, venueAuthors, loading: false })
    })
  }, [])

  return state
}
