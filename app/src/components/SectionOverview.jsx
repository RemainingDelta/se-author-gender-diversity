import { pct } from '../utils/stats'

const VENUES = ['ICSE', 'ECSA', 'MSR', 'ICSME']
const VENUE_COLOR = {
  ICSE: 'var(--icse)',
  ECSA: 'var(--ecsa)',
  MSR: 'var(--msr)',
  ICSME: 'var(--icsme)',
}
const VENUE_FULL = {
  ICSE: "Int'l Conference on Software Engineering",
  ECSA: 'European Conference on Software Architecture',
  MSR: 'Mining Software Repositories',
  ICSME: "Int'l Conference on Software Maintenance and Evolution",
}

function StackedBar({ female, male, unclassified, unknown, total }) {
  const segments = [
    { key: 'female', value: female, color: 'var(--female)' },
    { key: 'male', value: male, color: 'var(--male)' },
    { key: 'unclassified', value: unclassified, color: 'var(--unclassified)' },
    { key: 'unknown', value: unknown, color: 'var(--unknown)' },
  ]
  return (
    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1 }}>
      {segments.map(({ key, value, color }) => (
        <div
          key={key}
          style={{ flex: value / total, background: color, minWidth: value > 0 ? 2 : 0 }}
        />
      ))}
    </div>
  )
}

function VenueCard({ venue, totals }) {
  const color = VENUE_COLOR[venue]
  const known = totals.female_presenting + totals.male_presenting + totals.unclassified
  const femalePct = pct(totals.female_presenting, known)
  const malePct = pct(totals.male_presenting, known)
  const firstKnown =
    (totals.first_author_female_presenting ?? 0) +
    (totals.first_author_male_presenting ?? 0) +
    (totals.first_author_unclassified ?? 0)
  const firstFemalePct = pct(totals.first_author_female_presenting ?? 0, firstKnown)
  const firstMalePct = pct(totals.first_author_male_presenting ?? 0, firstKnown)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${color}`,
        borderRadius: 8,
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 600, color }}>
          {venue}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: 12,
          color: 'var(--text)',
          marginBottom: 20,
        }}
      >
        {VENUE_FULL[venue]}
      </div>

      <div style={{ display: 'flex', gap: 24, marginBottom: 4 }}>
        <div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: 36,
              fontWeight: 500,
              color: 'var(--female)',
            }}
          >
            {femalePct.toFixed(1)}%
          </div>
          <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 11, color: 'var(--text)' }}>
            female-presenting
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: 36,
              fontWeight: 500,
              color: 'var(--male)',
            }}
          >
            {malePct.toFixed(1)}%
          </div>
          <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 11, color: 'var(--text)' }}>
            male-presenting
          </div>
        </div>
      </div>

      <StackedBar
        female={totals.female_presenting}
        male={totals.male_presenting}
        unclassified={totals.unclassified}
        unknown={totals.unknown}
        total={totals.total_authors}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--text)' }}>
          {totals.total_authors.toLocaleString()} appearances
        </span>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--text)' }}>
          {firstFemalePct.toFixed(1)}% ♀ / {firstMalePct.toFixed(1)}% ♂ first author
        </span>
      </div>
    </div>
  )
}

export default function SectionOverview({ yearlyStats, aggregates }) {
  const venueTotals = {}
  for (const venue of VENUES) {
    const base = {
      ...aggregates[venue],
      first_author_female_presenting: 0,
      first_author_male_presenting: 0,
      first_author_unclassified: 0,
      first_author_unknown: 0,
      first_author_total: 0,
    }
    for (const yr of Object.values(yearlyStats[venue])) {
      base.first_author_female_presenting += yr.first_author_female_presenting
      base.first_author_male_presenting += yr.first_author_male_presenting
      base.first_author_unclassified += yr.first_author_unclassified
      base.first_author_unknown += yr.first_author_unknown
      base.first_author_total += yr.first_author_total
    }
    venueTotals[venue] = base
  }

  return (
    <section id="overview" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--text)' }}>Overview</h2>
      <p
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: 14,
          color: 'var(--muted)',
          marginBottom: 40,
        }}
      >
        Aggregated across all years per venue.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {VENUES.map((venue) => (
          <VenueCard key={venue} venue={venue} totals={venueTotals[venue]} />
        ))}
      </div>
    </section>
  )
}
