export type Meter = 'customer' | 'team' | 'growth'

export type Effect = Partial<Record<Meter, number>>

export type Choice = {
  id: string
  label: string
  effect?: Effect
  feedback?: string
  next: string
}

export type Scene = {
  id: string
  type: 'text' | 'choices' | 'minigame' | 'result'
  title?: string
  body?: string
  choices?: Choice[]
}

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

