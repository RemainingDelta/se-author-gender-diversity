const NOTES = [
  {
    title: 'Proxy inference, not ground truth',
    body: 'Name-based gender inference estimates perceived gender from first names using the genderize.io API. It does not measure gender identity. The labels "female-presenting" and "male-presenting" reflect inferred perception only and should not be interpreted as statements about a researcher\'s identity.',
  },
  {
    title: 'Probability threshold',
    body: 'genderize.io results with a confidence probability below 0.70 are classified as "unclassified". Results for names with no data in the genderize.io database are labelled "unknown". Neither group is counted in percentage denominators throughout this dashboard.',
  },
  {
    title: 'Name origin bias',
    body: 'The genderize.io model performs less reliably on names from East Asian, South Asian, African, and other non-Western naming traditions. This introduces systematic undercounting or misclassification for authors from these regions, likely skewing apparent representation figures.',
  },
  {
    title: 'Non-binary identities not captured',
    body: 'The inference model is binary. Non-binary, genderqueer, and other gender identities are not represented in these labels. This is a fundamental limitation of name-based inference and should be considered when interpreting results.',
  },
  {
    title: 'Author disambiguation',
    body: 'DBLP occasionally merges distinct authors under a single disambiguated name (e.g., "Ting Liu 0001"). Where this occurs, the gender signal for the merged entry may be unreliable. Disambiguation numbers are stripped before genderization.',
  },
  {
    title: 'Database coverage effects',
    body: 'Apparent increases in female-presenting authorship over time may partly reflect improved name coverage in DBLP and genderize.io, or changes in author name reporting conventions, rather than solely real changes in community representation.',
  },
]

export default function SectionMethodology() {
  return (
    <section id="methodology" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 120px' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '40px 48px',
      }}>
        <h2 style={{ fontSize: 28, margin: '0 0 32px', color: 'var(--text)' }}>
          Methodological Notes & Limitations
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {NOTES.map(({ title, body }) => (
            <div key={title}>
              <div style={{ fontFamily: 'IBM Plex Sans', fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>
                {title}
              </div>
              <p style={{ fontFamily: 'IBM Plex Sans', fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
        <div style={{
          fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--muted)',
          borderTop: '1px solid var(--border)', marginTop: 36, paddingTop: 20,
        }}>
          10,822 unique author names genderized via genderize.io Basic plan. Data covers 2008–2023 across ICSE, ECSA, MSR, and ICSME.
        </div>
      </div>
    </section>
  )
}
