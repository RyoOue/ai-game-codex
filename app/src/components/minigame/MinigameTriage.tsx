import { useMemo, useState } from 'react'
import { useGame } from '../../game/state'
import type { MinigameScene, TriageTicket } from '../../types'

type Priority = 'P1' | 'P2' | 'P3'
const priorities: Priority[] = ['P1', 'P2', 'P3']

export function MinigameTriage({ scene }: { scene: MinigameScene }) {
  const { dispatch } = useGame()
  const [assign, setAssign] = useState<Record<string, Priority | undefined>>({})

  const allAssigned = scene.tickets.every((t) => !!assign[t.id])

  const onCycle = (id: string) => {
    setAssign((prev) => {
      const current = prev[id]
      const next = priorities[(current ? priorities.indexOf(current) + 1 : 0) % priorities.length]
      return { ...prev, [id]: next }
    })
  }

  const score = useMemo(() => {
    let correct = 0
    for (const t of scene.tickets) {
      if (assign[t.id] === t.correct) correct++
    }
    return { correct, total: scene.tickets.length }
  }, [assign, scene.tickets])

  const submit = () => {
    const growth = Math.round((score.correct / score.total) * 20) // 0〜20
    const feedback = `優先度の判定: ${score.correct}/${score.total} 件正解（学習・成長 +${growth}）`
    dispatch({ type: 'minigame_complete', next: scene.next, effect: { growth }, feedback })
  }

  return (
    <section>
      {scene.title && <h2 style={{ marginBottom: 8 }}>{scene.title}</h2>}
      {scene.body && <p style={{ color: '#444', lineHeight: 1.8 }}>{scene.body}</p>}

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {scene.tickets.map((t) => (
          <TicketItem key={t.id} ticket={t} value={assign[t.id]} onCycle={() => onCycle(t.id)} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
        <button onClick={submit} disabled={!allAssigned} style={{ padding: '10px 16px' }}>
          提出する
        </button>
        <span style={{ color: '#666', fontSize: 14 }}>
          正解 {score.correct}/{score.total}
        </span>
      </div>
    </section>
  )
}

function TicketItem({ ticket, value, onCycle }: { ticket: TriageTicket; value?: Priority; onCycle: () => void }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <div style={{ fontWeight: 600 }}>{ticket.title}</div>
      {ticket.hint && <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{ticket.hint}</div>}
      <div style={{ marginTop: 8 }}>
        <label style={{ fontSize: 12, color: '#555', marginRight: 8 }}>優先度</label>
        <button onClick={onCycle} aria-label="優先度を切替" style={{ padding: '6px 10px' }}>
          {value ?? '未設定'}
        </button>
      </div>
    </div>
  )
}

