import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { GameAction, GameSpec, GameState, Meter, Meters, Scene } from '../types'
import { trackChoice, trackGameComplete, trackGameStart, trackMeterUpdate, trackPage } from '../lib/analytics'

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

const initialMeters: Meters = { customer: 50, team: 50, growth: 50 }

const initialState: GameState = {
  status: 'idle',
  spec: null,
  sceneId: null,
  meters: initialMeters,
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'load_start':
      return { ...state, status: 'loading', error: undefined }
    case 'load_success':
      return { ...state, status: 'ready', spec: action.spec, sceneId: action.spec.start }
    case 'load_error':
      return { ...state, status: 'error', error: action.error }
    case 'start':
      if (!state.spec) return state
      return { ...state, status: 'ready', sceneId: state.spec.start, meters: { ...initialMeters } }
    case 'choose': {
      if (!state.spec || !state.sceneId) return state
      const current: Scene | undefined = state.spec.scenes[state.sceneId]
      if (!current || current.type !== 'choices') return state
      const choice = current.choices.find((c) => c.id === action.choiceId)
      if (!choice) return state

      const nextMeters: Meters = { ...state.meters }
      if (choice.effect) {
        for (const [k, delta] of Object.entries(choice.effect)) {
          const key = k as Meter
          const d = Number(delta ?? 0) || 0
          const newValue = clamp((nextMeters[key] ?? 50) + d)
          trackMeterUpdate(key, d, newValue)
          nextMeters[key] = newValue
        }
      }

      const nextScene = state.spec.scenes[choice.next]
      const status = nextScene?.type === 'result' ? 'completed' : state.status
      // Track events
      if (state.sceneId === state.spec.start) {
        trackGameStart()
      }
      trackChoice(state.sceneId, { id: choice.id, label: choice.label, next: choice.next })
      if (status === 'completed') {
        const total = nextMeters.customer + nextMeters.team + nextMeters.growth
        trackGameComplete(total)
      }

      return {
        ...state,
        meters: nextMeters,
        lastFeedback: choice.feedback,
        sceneId: choice.next,
        status,
      }
    }
    case 'minigame_complete': {
      if (!state.spec) return state
      const nextMeters: Meters = { ...state.meters }
      if (action.effect) {
        for (const [k, delta] of Object.entries(action.effect)) {
          const key = k as Meter
          const d = Number(delta ?? 0) || 0
          const newValue = clamp((nextMeters[key] ?? 50) + d)
          trackMeterUpdate(key, d, newValue)
          nextMeters[key] = newValue
        }
      }
      const nextScene = state.spec.scenes[action.next]
      const status = nextScene?.type === 'result' ? 'completed' : state.status
      if (status === 'completed') {
        const total = nextMeters.customer + nextMeters.team + nextMeters.growth
        trackGameComplete(total)
      }
      return {
        ...state,
        meters: nextMeters,
        lastFeedback: action.feedback,
        sceneId: action.next,
        status,
      }
    }
    default:
      return state
  }
}

type GameContextType = {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  scene: Scene | null
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load spec.json from public
  useEffect(() => {
    let aborted = false
    const load = async () => {
      dispatch({ type: 'load_start' })
      try {
        const res = await fetch('/content/game.json', { cache: 'no-store' })
        if (!res.ok) throw new Error(String(res.status))
        const spec = (await res.json()) as GameSpec
        if (!aborted) dispatch({ type: 'load_success', spec })
      } catch (e: any) {
        if (!aborted) dispatch({ type: 'load_error', error: e?.message ?? 'load failed' })
      }
    }
    load()
    return () => {
      aborted = true
    }
  }, [])

  const scene = useMemo(() => {
    if (!state.spec || !state.sceneId) return null
    return state.spec.scenes[state.sceneId] ?? null
  }, [state.spec, state.sceneId])

  const value = useMemo(() => ({ state, dispatch, scene }), [state, scene])
  // Track page view on scene change
  useEffect(() => {
    if (state.sceneId) trackPage(String(state.sceneId))
  }, [state.sceneId])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
