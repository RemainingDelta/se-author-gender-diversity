import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { computeTrendsData } from '../utils/stats'

const VENUES = ['ICSE', 'ECSA', 'MSR', 'ICSME']
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

export default function SectionVenues({ yearlyStats }) {
  const [firstAuthorOnly, setFirstAuthorOnly] = useState(false)
  const data = computeTrendsData(yearlyStats, VENUES, firstAuthorOnly)

  return (
    <section id="venues" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--text)' }}>Venue Comparison</h2>
      <p style={{ fontFamily: 'IBM Plex Sans', fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
        Female-presenting % side by side across all venues. Gaps indicate missing data.
      </p>

      {/* Toggle */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', gap: 0, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
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

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="year" stroke="var(--muted)" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--muted)' }} />
          <YAxis
            domain={[0, 40]} tickFormatter={v => `${v}%`}
            stroke="var(--muted)" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--muted)' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          {VENUES.map(venue => (
            <Bar key={venue} dataKey={venue} fill={VENUE_COLOR[venue]} maxBarSize={16} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 16, paddingLeft: 8 }}>
        {VENUES.map(venue => (
          <div key={venue} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: VENUE_COLOR[venue] }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--muted)' }}>{venue}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
