export function pct(numerator, denominator) {
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

export function venueAggregate(yearlyStats) {
  const result = {}
  const all = {
    total_authors: 0,
    female_presenting: 0,
    male_presenting: 0,
    unclassified: 0,
    unknown: 0,
  }

  for (const venue of Object.keys(yearlyStats)) {
    const totals = {
      total_authors: 0,
      female_presenting: 0,
      male_presenting: 0,
      unclassified: 0,
      unknown: 0,
    }
    for (const year of Object.values(yearlyStats[venue])) {
      totals.total_authors += year.total_authors
      totals.female_presenting += year.female_presenting
      totals.male_presenting += year.male_presenting
      totals.unclassified += year.unclassified
      totals.unknown += year.unknown
    }
    result[venue] = totals
    all.total_authors += totals.total_authors
    all.female_presenting += totals.female_presenting
    all.male_presenting += totals.male_presenting
    all.unclassified += totals.unclassified
    all.unknown += totals.unknown
  }

  result['All'] = all
  return result
}

// gender: 'female' | 'male' | 'all'
export function computeTrendsData(yearlyStats, venues, firstAuthorOnly, gender = 'female') {
  const prefix = firstAuthorOnly ? 'first_author_' : ''
  const years = Array.from({ length: 16 }, (_, i) => 2008 + i)

  return years.map((year) => {
    const row = { year }
    for (const venue of venues) {
      const yearData = yearlyStats[venue]?.[String(year)]
      if (!yearData) {
        row[venue] = undefined
        if (gender === 'all') row[`${venue}_m`] = undefined
      } else {
        const female = yearData[`${prefix}female_presenting`]
        const male = yearData[`${prefix}male_presenting`]
        const unclass = yearData[`${prefix}unclassified`]
        const known = female + male + unclass
        if (gender === 'all') {
          row[venue] = pct(female, known)
          row[`${venue}_m`] = pct(male, known)
        } else {
          row[venue] = pct(gender === 'male' ? male : female, known)
        }
      }
    }
    return row
  })
}

export function computeTopicsData(topicStats, venue, sortBy, minSize = 30) {
  const rows = []

  for (const [topic, venueData] of Object.entries(topicStats)) {
    let female = 0,
      male = 0,
      unclassified = 0,
      unknown = 0

    if (venue === 'All') {
      for (const v of Object.values(venueData)) {
        female += v.female_presenting ?? 0
        male += v.male_presenting ?? 0
        unclassified += v.unclassified ?? 0
        unknown += v.unknown ?? 0
      }
    } else {
      const v = venueData[venue]
      if (!v) continue
      female = v.female_presenting
      male = v.male_presenting
      unclassified = v.unclassified
      unknown = v.unknown
    }

    const known = female + male + unclassified
    if (known < minSize) continue

    rows.push({
      topic,
      female,
      male,
      unclassified,
      unknown,
      total: known,
      femalePct: pct(female, known),
      malePct: pct(male, known),
      unclassifiedPct: pct(unclassified, known),
    })
  }

  if (sortBy === 'femalePct') {
    rows.sort((a, b) => b.femalePct - a.femalePct)
  } else {
    rows.sort((a, b) => b.total - a.total)
  }

  return rows.slice(0, 20)
}
