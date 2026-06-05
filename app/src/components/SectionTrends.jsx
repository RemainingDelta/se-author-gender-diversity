import { useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { computeTrendsData } from '../utils/stats'

const ALL_VENUES = ['ICSE', 'ECSA', 'MSR', 'ICSME']
const VENUE_COLOR = { ICSE: '#6e9cf5', ECSA: '#52c97a', MSR: '#f5a84a', ICSME: '#d47be8' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface-hi)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '10px 14px', fontFamily: 'IBM Plex Mono', fontSize: 12,
    }}>
      <div style={{ color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      {payload.filter(p => p.value != null).map(p => (
        <div key={p.dataKey} style={{ color: VENUE_COLOR[p.dataKey], marginBottom: 2 }}>
          {p.dataKey}: {p.value.toFixed(1)}%
        </div>
      ))}
    </div>
  )
}

export default function SectionTrends({ yearlyStats }) {
  const [activeVenues, setActiveVenues] = useState(new Set(ALL_VENUES))
  const [firstAuthorOnly, setFirstAuthorOnly] = useState(false)

  function toggleVenue(venue) {
    setActiveVenues(prev => {
      if (prev.has(venue) && prev.size === 1) return prev
      const next = new Set(prev)
      next.has(venue) ? next.delete(venue) : next.add(venue)
      return next
    })
  }

  const venues = ALL_VENUES.filter(v => activeVenues.has(v))
  const data = computeTrendsData(yearlyStats, venues, firstAuthorOnly)

  return (
    <section id="trends" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--text)' }}>
        Female-Presenting Authors Over Time
      </h2>
      <p style={{ fontFamily: 'IBM Plex Sans', fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
        Percentage of female-presenting authors per year (unknown excluded from denominator).
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32, alignItems: 'center' }}>
        {ALL_VENUES.map(venue => {
          const active = activeVenues.has(venue)
          return (
            <button key={venue} onClick={() => toggleVenue(venue)} style={{
              fontFamily: 'IBM Plex Mono', fontSize: 12, fontWeight: 500,
              padding: '5px 14px', borderRadius: 4, cursor: 'pointer',
              border: `1px solid ${VENUE_COLOR[venue]}`,
              background: active ? VENUE_COLOR[venue] + '33' : 'transparent',
              color: active ? VENUE_COLOR[venue] : 'var(--muted)',
              transition: 'all 0.15s',
            }}>
              {venue}
            </button>
          )
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          {['All Authors', 'First Author'].map((label, i) => {
            const active = i === 0 ? !firstAuthorOnly : firstAuthorOnly
            return (
              <button key={label} onClick={() => setFirstAuthorOnly(i === 1)} style={{
                fontFamily: 'IBM Plex Sans', fontSize: 12, padding: '5px 14px',
                background: active ? 'var(--surface-hi)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--muted)',
                border: 'none', cursor: 'pointer',
              }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="year" stroke="var(--muted)" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--muted)' }} />
          <YAxis
            domain={[0, 40]}
            tickFormatter={v => `${v}%`}
            stroke="var(--muted)"
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--muted)' }}
            label={{ value: '% female-presenting', angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          {venues.map(venue => (
            <Line
              key={venue}
              type="monotone"
              dataKey={venue}
              stroke={VENUE_COLOR[venue]}
              strokeWidth={2}
              dot={{ r: 3, fill: VENUE_COLOR[venue] }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 16, paddingLeft: 8 }}>
        {venues.map(venue => (
          <div key={venue} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 3, borderRadius: 2, background: VENUE_COLOR[venue] }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--muted)' }}>{venue}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
