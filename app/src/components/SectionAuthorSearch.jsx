import { useState, useMemo } from 'react'
import { pct } from '../utils/stats'

const VENUES = ['ICSE', 'ECSA', 'MSR', 'ICSME']
const VENUE_COLOR = { ICSE: '#6e9cf5', ECSA: '#52c97a', MSR: '#f5a84a', ICSME: '#d47be8' }

const GENDER_COLOR = {
  'female-presenting': 'var(--female)',
  'male-presenting': 'var(--male)',
  unclassified: 'var(--unclassified)',
  unknown: 'var(--muted)',
}

function AuthorPanel({ name, venueAuthors }) {
  // Collect all entries for this author across venues
  const entries = []
  for (const venue of VENUES) {
    const record = venueAuthors[venue]?.[name]
    if (record) entries.push({ venue, ...record })
  }
  if (!entries.length) return null

  const primary = entries[0]
  const venuesFound = entries.map((e) => e.venue)

  // Aggregate topics across venues
  const topicCounts = {}
  for (const e of entries) {
    for (const t of e.associated_topics ?? []) {
      topicCounts[t] = (topicCounts[t] ?? 0) + 1
    }
  }
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Authorship positions across venues
  const allPositions = entries.flatMap((e) => e.authorship_positions ?? [])
  const firstCount = allPositions.filter((p) => p === 0).length
  const lastCount = allPositions.filter((p) => p === 1).length
  const middleCount = allPositions.length - firstCount - lastCount

  // Collaborator genders (aggregate)
  const collab = { female_presenting: 0, male_presenting: 0, unclassified: 0, unknown: 0 }
  for (const e of entries) {
    const cg = e.collaborator_genders ?? {}
    collab.female_presenting += cg.female_presenting ?? 0
    collab.male_presenting += cg.male_presenting ?? 0
    collab.unclassified += cg.unclassified ?? 0
    collab.unknown += cg.unknown ?? 0
  }
  const collabTotal =
    collab.female_presenting + collab.male_presenting + collab.unclassified + collab.unknown

  const color = GENDER_COLOR[primary.gender_label] ?? 'var(--muted)'

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        padding: '24px',
        marginTop: 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontFamily: 'Playfair Display', fontSize: 22, color: 'var(--text)' }}>
          {name}
        </span>
        <span
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 12,
            color,
            padding: '2px 8px',
            border: `1px solid ${color}`,
            borderRadius: 4,
          }}
        >
          {primary.gender_label}
        </span>
        {venuesFound.map((v) => (
          <span
            key={v}
            style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: VENUE_COLOR[v] }}
          >
            {v}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
        }}
      >
        {/* Top topics */}
        <div>
          <div
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 11,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Top Topics
          </div>
          {topTopics.length ? (
            topTopics.map(([topic, count]) => (
              <div
                key={topic}
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 12,
                  color: 'var(--text)',
                  marginBottom: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    color: 'var(--muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {topic}
                </span>
                <span
                  style={{
                    fontFamily: 'IBM Plex Mono',
                    fontSize: 11,
                    color: 'var(--muted)',
                    flexShrink: 0,
                  }}
                >
                  ×{count}
                </span>
              </div>
            ))
          ) : (
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>None</span>
          )}
        </div>

        {/* Authorship positions */}
        <div>
          <div
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 11,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Authorship Position ({allPositions.length} papers)
          </div>
          {[
            ['First', firstCount],
            ['Middle', middleCount],
            ['Last', lastCount],
          ].map(([label, count]) => (
            <div key={label} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 12, color: 'var(--muted)' }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--text)' }}>
                  {count}
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct(count, allPositions.length)}%`,
                    background: color,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Collaborator genders */}
        <div>
          <div
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 11,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Collaborator Genders
          </div>
          {[
            ['Female-presenting', collab.female_presenting, 'var(--female)'],
            ['Male-presenting', collab.male_presenting, 'var(--male)'],
            ['Unclassified', collab.unclassified, 'var(--unclassified)'],
            ['Unknown', collab.unknown, 'var(--muted)'],
          ].map(([label, count, barColor]) => (
            <div key={label} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 12, color: 'var(--muted)' }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--text)' }}>
                  {count}
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct(count, collabTotal)}%`,
                    background: barColor,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SectionAuthorSearch({ venueAuthors }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)

  // Build flat name list once
  const allNames = useMemo(() => {
    const names = new Set()
    for (const venue of VENUES) {
      for (const name of Object.keys(venueAuthors[venue] ?? {})) {
        names.add(name)
      }
    }
    return [...names].sort()
  }, [venueAuthors])

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 10)
  }, [query, allNames])

  function selectAuthor(name) {
    setSelected(name)
    setQuery(name)
    setOpen(false)
  }

  return (
    <section id="search" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--text)' }}>Author Search</h2>
      <p
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: 14,
          color: 'var(--muted)',
          marginBottom: 32,
        }}
      >
        Look up any author across all venues to see their gender label, topics, and authorship
        profile.
      </p>

      <div style={{ position: 'relative', maxWidth: 520 }}>
        <input
          type="text"
          value={query}
          placeholder="Search by author name…"
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '10px 14px',
            fontFamily: 'IBM Plex Sans',
            fontSize: 14,
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        {open && matches.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 10,
              background: 'var(--surface-hi)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              marginTop: 4,
              overflow: 'hidden',
            }}
          >
            {matches.map((name) => (
              <div
                key={name}
                onMouseDown={() => selectAuthor(name)}
                style={{
                  padding: '9px 14px',
                  cursor: 'pointer',
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 13,
                  color: 'var(--text)',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <AuthorPanel name={selected} venueAuthors={venueAuthors} />}
    </section>
  )
}
