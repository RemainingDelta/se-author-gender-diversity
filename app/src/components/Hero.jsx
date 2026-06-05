const VENUE_COLORS = {
  ICSE: 'var(--icse)',
  ECSA: 'var(--ecsa)',
  MSR: 'var(--msr)',
  ICSME: 'var(--icsme)',
}
export default function Hero({ aggregates }) {
  const all = aggregates['All']

  const stats = [
    { value: '6,732', label: 'Total papers', note: 'across all 4 venues' },
    {
      value: all.total_authors.toLocaleString(),
      label: 'Total author appearances',
      note: 'across 6,732 papers',
    },
    { value: '249', label: 'Research topics', note: 'via OpenAlex' },
    { value: '16', label: 'Years covered', note: '2008–2023' },
  ]

  return (
    <header
      style={{
        paddingTop: 96,
        paddingBottom: 64,
        maxWidth: 1200,
        margin: '0 auto',
        padding: '96px 24px 64px',
      }}
    >
      {/* Venue tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        {Object.entries(VENUE_COLORS).map(([venue, color]) => (
          <span
            key={venue}
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: 12,
              fontWeight: 500,
              color,
              border: `1px solid ${color}`,
              padding: '3px 10px',
              borderRadius: 4,
            }}
          >
            {venue}
          </span>
        ))}
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          lineHeight: 1.1,
          margin: '0 0 20px',
          color: 'var(--text)',
          maxWidth: 800,
        }}
      >
        Gender Representation in SE Research
      </h1>
      <p
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: 16,
          color: 'var(--muted)',
          maxWidth: 680,
          lineHeight: 1.7,
          marginBottom: 48,
        }}
      >
        An analysis of female-presenting authorship across four major software engineering venues —
        ICSE, ECSA, MSR, and ICSME — using name-based gender inference via genderize.io. Labels
        reflect inferred perceived gender, not identity.
      </p>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {stats.map(({ value, label, note }) => (
          <div
            key={label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '20px 24px',
            }}
          >
            <div
              style={{
                fontFamily: 'IBM Plex Mono',
                fontSize: 32,
                fontWeight: 500,
                color: 'var(--female)',
                marginBottom: 6,
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 13,
                color: 'var(--text)',
                marginBottom: 4,
              }}
            >
              {label}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--muted)' }}>
              {note}
            </div>
          </div>
        ))}
      </div>
    </header>
  )
}
