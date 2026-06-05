import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { computeTrendsData } from '../utils/stats'
import RangeSlider from './RangeSlider'

const VENUES = ['ICSE', 'ECSA', 'MSR', 'ICSME']
const VENUE_COLOR = { ICSE: '#6e9cf5', ECSA: '#52c97a', MSR: '#f5a84a', ICSME: '#d47be8' }

function BarTooltip({ active, payload, label, gender }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface-hi)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '10px 14px', fontFamily: 'IBM Plex Mono', fontSize: 12,
    }}>
      <div style={{ color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      {payload.filter(p => p.value != null).map(p => {
        const isMale = p.dataKey.endsWith('_m')
        const venue = isMale ? p.dataKey.replace('_m', '') : p.dataKey
        return (
          <div key={p.dataKey} style={{ color: VENUE_COLOR[venue], opacity: isMale ? 0.65 : 1, marginBottom: 2 }}>
            {venue}{gender === 'all' ? (isMale ? ' ♂' : ' ♀') : ''}: {p.value.toFixed(1)}%
          </div>
        )
      })}
    </div>
  )
}


export default function SectionVenues({ yearlyStats }) {
  const [firstAuthorOnly, setFirstAuthorOnly] = useState(false)
  const [gender, setGender] = useState('female')
  const [yearRange, setYearRange] = useState([2008, 2023])

  const allData = computeTrendsData(yearlyStats, VENUES, firstAuthorOnly, gender)
  const data = allData.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1])

  return (
    <section id="venues" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--text)' }}>Venue Comparison</h2>
      <p style={{ fontFamily: 'IBM Plex Sans', fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
        Author gender representation side by side across all venues. Gaps indicate missing data.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          {[['All', 'all'], ['Male', 'male'], ['Female', 'female']].map(([label, val]) => (
            <button key={val} onClick={() => setGender(val)} style={{
              fontFamily: 'IBM Plex Sans', fontSize: 12, padding: '5px 14px',
              background: gender === val ? 'var(--surface-hi)' : 'transparent',
              color: gender === val ? (val === 'male' ? 'var(--male)' : val === 'female' ? 'var(--female)' : '#a78bfa') : 'var(--muted)',
              border: 'none', cursor: 'pointer',
            }}>
              {label}
            </button>
          ))}
        </div>
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

      <div style={{ marginBottom: 32 }}>
        <RangeSlider label="Years" min={2008} max={2023} value={yearRange} onValueChange={setYearRange} />
      </div>

      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: gender === 'male' ? 'var(--male)' : gender === 'all' ? '#a78bfa' : 'var(--female)', marginBottom: 6 }}>
        % {gender === 'male' ? 'male-presenting' : gender === 'all' ? 'female & male-presenting' : 'female-presenting'}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="year" stroke="var(--muted)" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--muted)' }} />
          <YAxis
            domain={[0, gender === 'female' ? 40 : 100]} tickFormatter={v => `${v}%`}
            stroke="var(--muted)" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: 'var(--muted)' }}
          />
          <Tooltip content={<BarTooltip gender={gender} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          {VENUES.map(venue => (
            <Bar key={venue} dataKey={venue} fill={VENUE_COLOR[venue]} maxBarSize={12} />
          ))}
          {gender === 'all' && VENUES.map(venue => (
            <Bar key={`${venue}_m`} dataKey={`${venue}_m`} fill={VENUE_COLOR[venue]} maxBarSize={12} opacity={0.35} />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', gap: 12, marginTop: 24 }}>
        {VENUES.map(venue => (
          <div key={venue} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, background: VENUE_COLOR[venue], flexShrink: 0 }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: 'var(--text)' }}>
              {venue}{gender === 'all' ? ' ♀' : ''}
            </span>
          </div>
        ))}
        {gender === 'all' && VENUES.map(venue => (
          <div key={`${venue}_m`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, background: VENUE_COLOR[venue], opacity: 0.35, flexShrink: 0 }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: 'var(--text)' }}>{venue} ♂</span>
          </div>
        ))}
      </div>
    </section>
  )
}
