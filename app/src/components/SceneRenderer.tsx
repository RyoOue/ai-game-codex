import { useGame } from '../game/state'
import type { Scene } from '../types'

export function SceneRenderer() {
  const { state, dispatch, scene } = useGame()

  if (state.status === 'loading' || !scene) {
    return <p>読み込み中…</p>
  }
  if (state.status === 'error') {
    return <p>読み込みに失敗しました。リロードしてください。</p>
  }

  switch (scene.type) {
    case 'text':
      return <TextScene scene={scene} onNext={(id) => dispatch({ type: 'choose', choiceId: id })} />
    case 'choices':
      return <ChoicesScene scene={scene} onChoose={(id) => dispatch({ type: 'choose', choiceId: id })} feedback={state.lastFeedback} />
    case 'result':
      return <ResultScene />
    default:
      return <p>未対応のシーンタイプです。</p>
  }
}

function TextScene({ scene, onNext }: { scene: Scene; onNext: (id: string) => void }) {
  const first = scene.choices?.[0]
  return (
    <section>
      {scene.title && <h2 style={{ marginBottom: 8 }}>{scene.title}</h2>}
      {scene.body && <p style={{ color: '#444', lineHeight: 1.8 }}>{scene.body}</p>}
      <div style={{ marginTop: 16 }}>
        <button onClick={() => first && onNext(first.id)} style={{ padding: '10px 16px' }} disabled={!first}>
          {first?.label ?? '進む'}
        </button>
      </div>
    </section>
  )
}

function ChoicesScene({ scene, onChoose, feedback }: { scene: Scene; onChoose: (id: string) => void; feedback?: string }) {
  return (
    <section>
      {scene.title && <h2 style={{ marginBottom: 8 }}>{scene.title}</h2>}
      {scene.body && <p style={{ color: '#444', lineHeight: 1.8 }}>{scene.body}</p>}
      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {scene.choices?.map((c) => (
          <button key={c.id} onClick={() => onChoose(c.id)} style={{ padding: '10px 16px', textAlign: 'left' }}>
            {c.label}
          </button>
        ))}
      </div>
      {feedback && (
        <p style={{ marginTop: 12, color: '#666', fontSize: 14 }}>ヒント: {feedback}</p>
      )}
    </section>
  )
}

function ResultScene() {
  const { state } = useGame()
  const total = state.meters.customer + state.meters.team + state.meters.growth
  return (
    <section>
      <h2 style={{ marginBottom: 8 }}>結果</h2>
      <p style={{ color: '#444', lineHeight: 1.8 }}>骨組み版のため、メーターの合計を表示します。</p>
      <p style={{ marginTop: 8 }}>合計スコア: {total}</p>
      <div style={{ marginTop: 16 }}>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ textDecoration: 'none' }}>
          <button style={{ padding: '10px 16px' }}>説明会を予約する（ダミー）</button>
        </a>
      </div>
    </section>
  )
}

