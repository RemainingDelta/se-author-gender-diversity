import { useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { computeTrendsData } from '../utils/stats'
import RangeSlider from './RangeSlider'

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
  const [gender, setGender] = useState('female')
  const [yearRange, setYearRange] = useState([2008, 2023])

  function toggleVenue(venue) {
    setActiveVenues(prev => {
      if (prev.has(venue) && prev.size === 1) return prev
      const next = new Set(prev)
      next.has(venue) ? next.delete(venue) : next.add(venue)
      return next
    })
  }

  const venues = ALL_VENUES.filter(v => activeVenues.has(v))
  const allData = computeTrendsData(yearlyStats, venues, firstAuthorOnly, gender)
  const data = allData.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1])
  const activeColor = gender === 'male' ? 'var(--male)' : 'var(--female)'
  const activeLabel = gender === 'male' ? 'male-presenting' : gender === 'all' ? 'female & male-presenting' : 'female-presenting'

  return (
    <section id="trends" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--text)' }}>
        Female-Presenting Authors Over Time
      </h2>
      <p style={{ fontFamily: 'IBM Plex Sans', fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
        Percentage of <span style={{ color: activeColor }}>{activeLabel}</span> authors per year (unknown excluded from denominator).
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {[['All', 'all'], ['Male', 'male'], ['Female', 'female']].map(([label, val]) => (
              <button key={val} onClick={() => setGender(val)} style={{
                fontFamily: 'IBM Plex Sans', fontSize: 12, padding: '5px 14px',
                background: gender === val ? 'var(--surface-hi)' : 'transparent',
                color: gender === val ? (val === 'male' ? 'var(--male)' : val === 'female' ? 'var(--female)' : 'var(--text)') : 'var(--muted)',
                border: 'none', cursor: 'pointer',
              }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
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
      </div>

      <div style={{ marginBottom: 32 }}>
        <RangeSlider label="Years" min={2008} max={2023} value={yearRange} onValueChange={setYearRange} />
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="year" stroke="var(--muted)" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--muted)' }} />
          <YAxis
            domain={[0, gender === 'female' ? 40 : 100]}
            tickFormatter={v => `${v}%`}
            stroke="var(--muted)"
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--muted)' }}
            label={{ value: `% ${activeLabel}`, angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          {venues.map(venue => (
            <Line key={venue} type="monotone" dataKey={venue}
              stroke={VENUE_COLOR[venue]} strokeWidth={2}
              dot={{ r: 3, fill: VENUE_COLOR[venue] }} connectNulls={false}
            />
          ))}
          {gender === 'all' && venues.map(venue => (
            <Line key={`${venue}_m`} type="monotone" dataKey={`${venue}_m`}
              stroke={VENUE_COLOR[venue]} strokeWidth={2} strokeDasharray="5 3"
              dot={{ r: 3, fill: VENUE_COLOR[venue] }} connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', gap: 12, marginTop: 24 }}>
        {venues.map(venue => (
          <div key={venue} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 4, borderRadius: 2, background: VENUE_COLOR[venue], flexShrink: 0 }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: 'var(--text)' }}>
              {venue}{gender === 'all' ? ' ♀' : ''}
            </span>
          </div>
        ))}
        {gender === 'all' && venues.map(venue => (
          <div key={`${venue}_m`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 4, background: `repeating-linear-gradient(90deg, ${VENUE_COLOR[venue]} 0 6px, transparent 6px 9px)`, flexShrink: 0 }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: 'var(--text)' }}>{venue} ♂</span>
          </div>
        ))}
      </div>
    </section>
  )
}
