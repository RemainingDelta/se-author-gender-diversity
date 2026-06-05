import * as Slider from '@radix-ui/react-slider'

export default function RangeSlider({ label, min, max, step = 1, value, onValueChange, formatValue }) {
  const fmt = formatValue ?? (v => v)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <Slider.Root
        min={min} max={max} step={step}
        value={value} onValueChange={onValueChange}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, height: 20, touchAction: 'none', userSelect: 'none' }}
      >
        <Slider.Track style={{ position: 'relative', flexGrow: 1, height: 3, background: 'var(--border)', borderRadius: 9999 }}>
          <Slider.Range style={{ position: 'absolute', height: '100%', background: 'var(--muted)', borderRadius: 9999 }} />
        </Slider.Track>
        {value.map((_, i) => (
          <Slider.Thumb
            key={i}
            style={{
              display: 'block', width: 14, height: 14, borderRadius: '50%',
              background: 'var(--text)', border: '2px solid var(--border)',
              cursor: 'grab', outline: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--female)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--text)'}
          />
        ))}
      </Slider.Root>
      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--text)', minWidth: 90, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {value.length === 2 ? `${fmt(value[0])} – ${fmt(value[1])}` : fmt(value[0])}
      </span>
    </div>
  )
}
