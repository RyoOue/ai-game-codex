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

  const onDropTo = (target: Priority | 'UNASSIGNED') => (e: React.DragEvent) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return
    setAssign((prev) => {
      const next = { ...prev }
      if (target === 'UNASSIGNED') {
        delete next[id]
      } else {
        next[id] = target
      }
      return next
    })
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
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

      {/* DnDボード */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 12,
          marginTop: 12,
          alignItems: 'start',
        }}
      >
        <DropColumn
          title="未設定"
          onDrop={onDropTo('UNASSIGNED')}
          onDragOver={onDragOver}
          hint="ドラッグでここに戻す"
        >
          {scene.tickets
            .filter((t) => !assign[t.id])
            .map((t) => (
              <DraggableTicket key={t.id} ticket={t} value={assign[t.id]} onCycle={() => onCycle(t.id)} />
            ))}
        </DropColumn>

        {(['P1', 'P2', 'P3'] as Priority[]).map((p) => (
          <DropColumn key={p} title={p} onDrop={onDropTo(p)} onDragOver={onDragOver}>
            {scene.tickets
              .filter((t) => assign[t.id] === p)
              .map((t) => (
                <DraggableTicket key={t.id} ticket={t} value={assign[t.id]} onCycle={() => onCycle(t.id)} />
              ))}
          </DropColumn>
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

function DraggableTicket({ ticket, value, onCycle }: { ticket: TriageTicket; value?: Priority; onCycle: () => void }) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', ticket.id)
    e.dataTransfer.effectAllowed = 'move'
  }
  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#fff' }}
      aria-grabbed="true"
    >
      <div style={{ fontWeight: 600 }}>{ticket.title}</div>
      {ticket.hint && <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{ticket.hint}</div>}
      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#555' }}>優先度:</span>
        <button onClick={onCycle} aria-label="優先度を切替" style={{ padding: '6px 10px' }}>
          {value ?? '未設定'}
        </button>
      </div>
    </div>
  )
}

function DropColumn({ title, children, onDrop, onDragOver, hint }: { title: string; children: React.ReactNode; onDrop: (e: React.DragEvent) => void; onDragOver: (e: React.DragEvent) => void; hint?: string }) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      aria-dropeffect="move"
      style={{
        minHeight: 120,
        background: '#f9fafb',
        border: '2px dashed #e1e4e8',
        borderRadius: 8,
        padding: 8,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      {hint && <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{hint}</div>}
      <div style={{ display: 'grid', gap: 8 }}>{children}</div>
    </div>
  )
}
