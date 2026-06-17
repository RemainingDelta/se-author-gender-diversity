const LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#trends', label: 'Trends' },
  { href: '#topics', label: 'Topics' },
  { href: '#venues', label: 'Venues' },
  { href: '#methodology', label: 'Methodology' },
]

export default function Nav() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(11,11,13,0.85)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontFamily: 'IBM Plex Sans',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text)',
            }}
          >
            SE Gender Diversity
          </span>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--text)' }}>
            2008–2023
          </span>
        </div>
        <div style={{ display: 'flex', gap: 28, overflowX: 'auto' }}>
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 13,
                color: 'var(--text)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--female)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text)')}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
