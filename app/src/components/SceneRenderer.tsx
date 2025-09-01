import { useGame } from '../game/state'
import type { MinigameScene, TextScene as TTextScene, ChoicesScene as TChoicesScene } from '../types'
import { MinigameTriage } from './minigame/MinigameTriage'
import { trackCta } from '../lib/analytics'

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
      return <TextScene scene={scene as TTextScene} onNext={(id) => dispatch({ type: 'choose', choiceId: id })} />
    case 'choices':
      return <ChoicesScene scene={scene as TChoicesScene} onChoose={(id) => dispatch({ type: 'choose', choiceId: id })} feedback={state.lastFeedback} />
    case 'minigame':
      return <MinigameTriage scene={scene as MinigameScene} />
    case 'result':
      return <ResultScene />
    default:
      return <p>未対応のシーンタイプです。</p>
  }
}

function TextScene({ scene, onNext }: { scene: TTextScene; onNext: (id: string) => void }) {
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

function ChoicesScene({ scene, onChoose, feedback }: { scene: TChoicesScene; onChoose: (id: string) => void; feedback?: string }) {
  return (
    <section>
      {scene.title && <h2 style={{ marginBottom: 8 }}>{scene.title}</h2>}
      {scene.body && <p style={{ color: '#444', lineHeight: 1.8 }}>{scene.body}</p>}
      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {scene.choices?.map((c: TChoicesScene['choices'][number]) => (
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
  const params = new URLSearchParams({
    score_total: String(total),
    customer: String(state.meters.customer),
    team: String(state.meters.team),
    growth: String(state.meters.growth),
    utm_source: 'game',
    utm_medium: 'cta',
    utm_campaign: 'ses_mvp',
  })
  const reserveHref = `reserve/?${params.toString()}`
  return (
    <section>
      <h2 style={{ marginBottom: 8 }}>結果</h2>
      <p style={{ color: '#444', lineHeight: 1.8 }}>骨組み版のため、メーターの合計を表示します。</p>
      <p style={{ marginTop: 8 }}>合計スコア: {total}</p>
      <div style={{ marginTop: 16 }}>
        <a href={reserveHref} onClick={() => { trackCta('result') }} style={{ textDecoration: 'none' }}>
          <button style={{ padding: '10px 16px' }}>説明会を予約する</button>
        </a>
      </div>
    </section>
  )
}
