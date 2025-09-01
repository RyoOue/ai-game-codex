# SES業界・職種理解ゲーム 設計書

本書は、MVP版ゲームの体験設計・画面設計・技術設計をまとめる。

## 1. 体験コンセプト
- コンセプト: 「1日の“現場体験”でSESの実像に触れる」
- 参考: ノベル×分岐（ベンチマークに準拠）＋ミニゲーム1つ
- 成果: 3つのメーター（顧客満足/チームワーク/学習・成長）が選択で変動し、結果画面で可視化

## 2. 構成（5〜10分）
- Onboarding（導入/操作説明）: 1画面
- Chapter 1 「案件キックオフ」: 要件ヒアリングと期待値調整（2〜3画面）
- Chapter 2 「現場対応」: バグトリアージ・報告/相談（ミニゲーム含む、4〜6画面）
- Chapter 3 「ふりかえり」: 成長と評価、サポート体制紹介（2〜3画面）
- Result & CTA: 成績と学び、説明会予約導線（1〜2画面）

## 3. 画面フロー（概要）
1) Onboarding → 2) C1-選択① → 3) C1-選択② → 4) C2-ミニゲーム開始 → 5) C2-報告分岐 → 6) C3-ふりかえり → 7) Result/CTA

## 4. シーン詳細（例）
- Chapter 1: 「要件すり合わせ」
  - 選択: A) まず顧客の背景と目的を聞く（推奨） / B) すぐ工数見積り / C) 仕様書待ち
  - 影響: Aで顧客満足+、学習+。Bは一時的に満足+だが後にブレ。Cはタイムロス。
- Chapter 2: 「バグトリアージ」（ミニゲーム）
  - 形式: 3分以内に5件のチケットを優先度（P1/P2/P3）へドラッグ&ドロップ
  - 判定: 概要・再現性・影響範囲のヒント文を読んで分類。正解に応じてメーター変動。
  - 直後の選択: 進捗報告のスタンス（事実/対策/相談）を選び、チームワークに影響。
- Chapter 3: 「ふりかえりと評価」
  - 選択: A) 学びを言語化し次回の行動に落とす / B) 成果だけを強調 / C) ミスを個人で抱える
  - 影響: Aで学習・成長+、チームワーク+。B/Cは将来リスクの示唆。

## 5. スコアリング/メーター仕様
- メーター: 顧客満足、チームワーク、学習・成長（0〜100）
- 初期値: 50。選択/正誤で±5〜15変動。ミニゲームは±20まで。
- 結果ランク: S/A/B/C（合計スコアとバランスで判定）
- フィードバック: 主要な選択に対して「良い理由/リスク」を1〜2文で表示

## 6. UI/UX仕様
- レイアウト: スマホ縦を基本。上部に進行バー、下部に選択肢。本文は大きめ行間。
- 操作: タップ中心。ドラッグ&ドロップはモバイルでも扱いやすい領域/余白。
- 読みやすさ: 文字サイズ16〜18px以上、濃色背景上の白テキストは避ける。
- 表示時間: 1画面目安20〜40秒で読み切り。
- アクセシビリティ: コントラスト比4.5:1、フォーカス可視、アニメはreduce-motion対応。

## 7. コンテンツスクリプト（骨子）
- Onboarding: 「あなたはSESエンジニアとして新規案件に参画…」操作説明、メーター紹介。
- C1: 顧客の目的/背景→見積もりの前に“前提の一致”を学ぶ。
- C2: トリアージ→報告（事実/影響/対策/要支援）。「一人ではない」チーム支援/レビューを強調。
- C3: ふりかえり→評価観点（プロセス/協働/学び）。会社の育成/評価制度を自然に挿入。
- Result: あなたの強み/次に伸ばせる点→説明会で「実案件の事例紹介/育成制度」を案内しCTA。

## 8. 技術設計（MVP）
- フロント: TypeScript + React + Vite（静的サイト）
- 状態管理: Reactの`useReducer`/Context。章・選択・メーター値を集中管理。
- ルーティング: 単一ページ内のステップ遷移（URLはクエリでシェア可）
- コンテンツ: JSON定義（テキスト/選択肢/効果量/ヒント）。非エンジニア更新可能。
- 計測: GA4（`gtag`）でイベント発火。データレイヤを関数に集約。
- ビルド/配信: GitHub Pages/Cloudflare Pages。画像は軽量（WebP/SVG）。

## 9. データモデル（例）
```ts
type Meter = 'customer' | 'team' | 'growth';
type Effect = Partial<Record<Meter, number>>;
type Choice = { id: string; label: string; effect: Effect; feedback: string; next: string };
type Scene = { id: string; type: 'text'|'choices'|'minigame'; title?: string; body?: string; choices?: Choice[] };
type GameSpec = { start: string; scenes: Record<string, Scene> };
```

## 10. 状態遷移（擬似コード）
```ts
state = { sceneId: spec.start, meters: {customer:50,team:50,growth:50} }
onChoice(choice){
  apply(choice.effect)
  track('choice_select', {scene: state.sceneId, choice: choice.id})
  state.sceneId = choice.next
}
```

## 11. 計測イベント（詳細）
- page_view: `page`（onboarding/c1/.../result）
- game_start / game_complete: `elapsed_sec`, `score_total`
- choice_select: `scene`, `choice_id`, `label`
- meter_update: `meter`, `delta`, `value`
- minigame_start / minigame_complete: `score`, `accuracy`
- cta_click: `position`（header/result）

## 12. 品質/パフォーマンス
- 画像は遅延読み込み、フォントはシステムフォント優先
- バンドル分割なし（MVPは単一）だがベンダを極小化
- 重要操作は200ms以内に応答

## 13. クリエイティブ/スタイル
- 色: 信頼（ブルー系）＋成長（グリーン系）＋強調（オレンジ）
- イラスト: シンプルな線画/モノライン。写真を使う場合は権利確認。
- 文体: 「〜です/ます」。断定しすぎず、根拠とバランスを提示。

## 14. 予約導線（CTA）
- ボタン: 「説明会を予約する」固定配置（結果画面は大ボタン）
- 遷移: 外部予約フォーム（TimeRex/Googleフォーム等）。パラメータでスコア/流入元を連携可能。

## 15. 将来拡張
- A/Bテスト（CTA位置/文言/色）
- ペルソナ別ストーリー（新卒/中途/未経験）
- 追加ミニゲーム（要件定義ミニワーク/見積もりトレードオフ）
- ローカライズ/英語版

