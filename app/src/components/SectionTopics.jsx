import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { computeTopicsData } from '../utils/stats'

const VENUES = ['All', 'ICSE', 'ECSA', 'MSR', 'ICSME']
const VENUE_COLOR = { ICSE: '#6e9cf5', ECSA: '#52c97a', MSR: '#f5a84a', ICSME: '#d47be8' }

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{
      background: 'var(--surface-hi)', border: '1px solid var(--border)',
      borderRadius: 6, padding: '10px 14px', fontFamily: 'IBM Plex Mono', fontSize: 11,
      maxWidth: 280,
    }}>
      <div style={{ color: 'var(--text)', marginBottom: 8, fontFamily: 'IBM Plex Sans', fontSize: 12, lineHeight: 1.4 }}>{d.topic}</div>
      <div style={{ color: 'var(--female)' }}>Female-presenting: {d.female} ({d.femalePct.toFixed(1)}%)</div>
      <div style={{ color: 'var(--male)' }}>Male-presenting: {d.male} ({d.malePct.toFixed(1)}%)</div>
      <div style={{ color: 'var(--unclassified)' }}>Unclassified: {d.unclassified} ({d.unclassifiedPct.toFixed(1)}%)</div>
      <div style={{ color: 'var(--muted)', marginTop: 4 }}>Total (known): {d.total}</div>
    </div>
  )
}

export default function SectionTopics({ topicStats }) {
  const [venue, setVenue] = useState('All')
  const [sortBy, setSortBy] = useState('total')
  const data = computeTopicsData(topicStats, venue, sortBy).map(d => ({
    ...d,
    topicShort: d.topic,
  }))

  const chartHeight = Math.max(400, data.length * 32)

  return (
    <section id="topics" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
      <h2 style={{ fontSize: 32, margin: '0 0 8px', color: 'var(--text)' }}>
        Gender Distribution by Research Topic
      </h2>
      <p style={{ fontFamily: 'IBM Plex Sans', fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
        Top 20 topics by author count. Unknown excluded from bars.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          {VENUES.map(v => (
            <button key={v} onClick={() => setVenue(v)} style={{
              fontFamily: 'IBM Plex Mono', fontSize: 12, padding: '5px 14px',
              background: venue === v ? 'var(--surface-hi)' : 'transparent',
              color: venue === v ? (VENUE_COLOR[v] ?? 'var(--text)') : 'var(--muted)',
              border: 'none', cursor: 'pointer',
            }}>
              {v}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          {[['total', 'By volume'], ['femalePct', 'By female %']].map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)} style={{
              fontFamily: 'IBM Plex Sans', fontSize: 12, padding: '5px 14px',
              background: sortBy === key ? 'var(--surface-hi)' : 'transparent',
              color: sortBy === key ? 'var(--text)' : 'var(--muted)',
              border: 'none', cursor: 'pointer',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>


      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 16 }}>
        {[
          { color: 'var(--female)',       label: 'Female-presenting' },
          { color: 'var(--male)',         label: 'Male-presenting' },
          { color: 'var(--unclassified)', label: 'Unclassified' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ overflowY: 'auto' }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={v => `${v}%`}
              stroke="var(--muted)" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
            />
            <YAxis
              type="category" dataKey="topicShort" width={360}
              tick={{ fontFamily: 'IBM Plex Sans', fontSize: 11, fill: 'var(--muted)', textAnchor: 'start' }}
              tickFormatter={v => v}
              dx={-355}
              stroke="none"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="femalePct"       stackId="a" fill="var(--female)"       name="Female-presenting" />
            <Bar dataKey="malePct"         stackId="a" fill="var(--male)"         name="Male-presenting" />
            <Bar dataKey="unclassifiedPct" stackId="a" fill="var(--unclassified)" name="Unclassified" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
