import type { Meters } from '../types'

export function MeterBar({ meters }: { meters: Meters }) {
  const items: { key: keyof Meters; label: string; color: string }[] = [
    { key: 'customer', label: '顧客満足', color: '#2b90d9' },
    { key: 'team', label: 'チームワーク', color: '#7bb661' },
    { key: 'growth', label: '学習・成長', color: '#f39c12' },
  ]
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map(({ key, label, color }) => (
        <div key={key}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{label}: {meters[key]}</div>
          <div style={{ background: '#eee', height: 8, borderRadius: 999 }}>
            <div
              style={{
                width: `${meters[key]}%`,
                transition: 'width 200ms ease',
                height: '100%',
                background: color,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

