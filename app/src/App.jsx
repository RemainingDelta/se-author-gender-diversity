import { useGoldData } from './hooks/useGoldData'
import { venueAggregate } from './utils/stats'
import Nav from './components/Nav'
import Hero from './components/Hero'
import SectionOverview from './components/SectionOverview'
import SectionTrends from './components/SectionTrends'
import SectionTopics from './components/SectionTopics'
import SectionVenues from './components/SectionVenues'
import SectionMethodology from './components/SectionMethodology'

const LEGEND = [
  { color: 'var(--female)',       label: 'Female-presenting',  note: 'probability ≥ 0.70' },
  { color: 'var(--male)',         label: 'Male-presenting',    note: 'probability ≥ 0.70' },
  { color: 'var(--unclassified)', label: 'Unclassified',       note: 'probability < 0.70' },
  { color: 'var(--unknown)',      label: 'Unknown',            note: 'no genderize.io data' },
]

export default function App() {
  const { yearlyStats, topicStats, venueAuthors, loading } = useGoldData()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--muted)' }}>
        Loading data…
      </div>
    )
  }

  const aggregates = venueAggregate(yearlyStats)

  return (
    <>
      <Nav />
      <Hero yearlyStats={yearlyStats} venueAuthors={venueAuthors} aggregates={aggregates} />

      {/* Global Legend */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          {LEGEND.map(({ color, label, note }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 13, color: 'var(--text)' }}>{label}</span>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--muted)' }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionOverview yearlyStats={yearlyStats} aggregates={aggregates} />
      <SectionTrends yearlyStats={yearlyStats} />
      <SectionTopics topicStats={topicStats} />
      <SectionVenues yearlyStats={yearlyStats} />
      <SectionMethodology />
    </>
  )
}
