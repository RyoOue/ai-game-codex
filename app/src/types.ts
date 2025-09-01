export type Meter = 'customer' | 'team' | 'growth'

export type Effect = Partial<Record<Meter, number>>

export type Choice = {
  id: string
  label: string
  effect?: Effect
  feedback?: string
  next: string
}

// ----- Scenes -----
export type BaseScene = {
  id: string
  type: 'text' | 'choices' | 'minigame' | 'result'
  title?: string
  body?: string
}

export type TextScene = BaseScene & {
  type: 'text'
  choices?: Choice[] // Next button定義用
}

export type ChoicesScene = BaseScene & {
  type: 'choices'
  choices: Choice[]
}

export type TriageTicket = {
  id: string
  title: string
  hint?: string
  correct: 'P1' | 'P2' | 'P3'
}

export type MinigameScene = BaseScene & {
  type: 'minigame'
  next: string
  tickets: TriageTicket[]
}

export type ResultScene = BaseScene & {
  type: 'result'
}

export type Scene = TextScene | ChoicesScene | MinigameScene | ResultScene

export type GameSpec = {
  start: string
  scenes: Record<string, Scene>
}

export type Meters = Record<Meter, number>

export type GameState = {
  status: 'idle' | 'loading' | 'ready' | 'completed' | 'error'
  spec: GameSpec | null
  sceneId: string | null
  meters: Meters
  lastFeedback?: string
  error?: string
}

export type GameAction =
  | { type: 'load_start' }
  | { type: 'load_success'; spec: GameSpec }
  | { type: 'load_error'; error: string }
  | { type: 'start' }
  | { type: 'choose'; choiceId: string }
  | { type: 'minigame_complete'; next: string; effect?: Effect; feedback?: string }
