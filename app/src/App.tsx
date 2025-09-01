import './App.css'

function App() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ marginBottom: 8 }}>SES業界・職種理解ゲーム（MVP）</h1>
      <p style={{ color: '#555', lineHeight: 1.8 }}>
        5〜10分で遊べる、ノベル×分岐＋ミニゲームの教育的な体験を目指すプロトタイプです。
        現在は雛形実装段階のため、トップ画面のみ表示しています。
      </p>
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>ドキュメント</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            <a href="../requirements.md" target="_blank" rel="noreferrer">
              要件書（requirements.md）
            </a>
          </li>
          <li>
            <a href="../design.md" target="_blank" rel="noreferrer">
              設計書（design.md）
            </a>
          </li>
          <li>
            <a href="../task.md" target="_blank" rel="noreferrer">
              実装計画（task.md）
            </a>
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>次の一歩</h2>
        <ol style={{ lineHeight: 1.8 }}>
          <li>コンテンツJSONの雛形追加</li>
          <li>シーン遷移/メーターUIの実装</li>
          <li>ミニゲーム（トリアージ）の最小版</li>
        </ol>
      </section>

      <div style={{ marginTop: 24 }}>
        <button disabled style={{ padding: '10px 16px', opacity: 0.6 }}>
          ゲーム開始（準備中）
        </button>
      </div>
    </main>
  )
}

export default App
