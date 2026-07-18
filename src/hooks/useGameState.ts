import { useState, useCallback } from 'react'
import { GameState, Note, ErrorType, Notation, Clef } from '../types'
import { midiToNote } from '../utils/midiToNote'
import { analyzeError } from '../utils/errorAnalysis'
import { addWeakNote, getWeakNotes } from '../utils/weakPool'
import { getLessonPool } from '../data/lessons'

const SESSION_TARGET = 10

function loadNotation(): Notation {
  if (typeof window === 'undefined') return 'american'
  return (localStorage.getItem('piano-notation') as Notation) ?? 'american'
}

const INITIAL_STATE: GameState = {
  notation: loadNotation(),
  phase: 'idle',
  currentNote: null,
  lastAnswerCorrect: null,
  lastAnswerMidi: null,
  lastErrorType: null,
  recovering: false,
  streak: 0,
  bestStreak: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  lessonId: 'lines',
  showNoteName: false,
  sessionTarget: SESSION_TARGET,
  startTime: null,
  isMuted: false,
  noteShownAt: 0,
  responseTimes: [],
  lastCorrectNote: null,
  isTimed: false,
  clef: 'treble',
}

function selectNote(lessonId: string, excludeMidi?: number): Note {
  const pool = getLessonPool(lessonId)
  const filtered = pool.length > 1 ? pool.filter(m => m !== excludeMidi) : pool
  const weak = getWeakNotes().filter(m => filtered.includes(m))
  // ponytail: 2:1 bias for weak notes, simple random switch
  const src = weak.length > 0 && Math.random() < 0.66 ? weak : filtered
  const midi = src[Math.floor(Math.random() * src.length)]
  return midiToNote(midi)
}

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)

  const startGame = useCallback((target?: number) => {
    setState(prev => {
      const note = selectNote(prev.lessonId)
      return {
        ...prev, phase: 'waiting', currentNote: note,
        streak: 0, bestStreak: 0, totalAttempts: 0, correctAttempts: 0,
        lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null,
        startTime: Date.now(), recovering: false,
        sessionTarget: target ?? SESSION_TARGET,
        noteShownAt: Date.now(), responseTimes: [], lastCorrectNote: null,
      }
    })
  }, [])

  const submitAnswer = useCallback((midi: number) => {
    setState(prev => {
      if (prev.phase === 'waiting' && prev.currentNote) {
        const isCorrect = midi === prev.currentNote.midi
        // Track the target note that was missed (not the wrong key pressed)
        if (!isCorrect) addWeakNote(prev.currentNote.midi)
        const newStreak = isCorrect ? prev.streak + 1 : 0
        const newTotal = prev.totalAttempts + 1
        const newCorrect = prev.correctAttempts + (isCorrect ? 1 : 0)
        const newBestStreak = Math.max(prev.bestStreak, newStreak)
        const sessionDone = newTotal >= prev.sessionTarget

        const errorType: ErrorType | null = isCorrect ? null : analyzeError(prev.currentNote, midi)
        const responseTime = Date.now() - prev.noteShownAt

        return {
          ...prev,
          phase: sessionDone ? 'levelComplete' : 'feedback',
          lastAnswerCorrect: isCorrect,
          lastAnswerMidi: midi,
          lastErrorType: errorType,
          recovering: !isCorrect && !sessionDone,
          streak: newStreak,
          bestStreak: newBestStreak,
          totalAttempts: newTotal,
          correctAttempts: newCorrect,
          responseTimes: [...prev.responseTimes, responseTime],
          lastCorrectNote: isCorrect ? null : prev.currentNote,
        }
      }
      if (prev.phase === 'feedback' && prev.recovering && !prev.lastAnswerCorrect && prev.currentNote) {
        if (midi !== prev.currentNote.midi) return prev
        const responseTime = Date.now() - prev.noteShownAt
        return {
          ...prev,
          lastAnswerCorrect: true,
          lastAnswerMidi: midi,
          lastErrorType: null,
          recovering: false,
          correctAttempts: prev.correctAttempts + 1,
          responseTimes: [...prev.responseTimes, responseTime],
        }
      }
      return prev
    })
  }, [])

  const nextNote = useCallback(() => {
    setState(prev => {
      const note = selectNote(prev.lessonId, prev.currentNote?.midi)
      return { ...prev, phase: 'waiting', currentNote: note, lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null, recovering: false, noteShownAt: Date.now(), lastCorrectNote: null }
    })
  }, [])

  const setLesson = useCallback((lessonId: string) => {
    setState(prev => ({ ...prev, lessonId }))
  }, [])

  const setSessionTarget = useCallback((target: number) => {
    setState(prev => ({ ...prev, sessionTarget: target }))
  }, [])

  const setShowNoteName = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showNoteName: show }))
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    setState(prev => ({ ...prev, isMuted: muted }))
  }, [])

  const setTimed = useCallback((timed: boolean) => {
    setState(prev => ({ ...prev, isTimed: timed }))
  }, [])

  const setNotation = useCallback((notation: Notation) => {
    localStorage.setItem('piano-notation', notation)
    setState(prev => ({ ...prev, notation }))
  }, [])

  const restartGame = useCallback(() => {
    setState(prev => {
      const note = selectNote(prev.lessonId)
      return {
        ...prev, phase: 'waiting', currentNote: note,
        streak: 0, bestStreak: 0, totalAttempts: 0, correctAttempts: 0,
        lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null,
        startTime: Date.now(), recovering: false,
        noteShownAt: Date.now(), responseTimes: [], lastCorrectNote: null,
      }
    })
  }, [])

  const setCustomPool = useCallback((pool: number[] | undefined) => {
    setState(prev => ({ ...prev, customPool: pool }))
  }, [])

  const setClef = useCallback((clef: Clef) => {
    setState(prev => ({ ...prev, clef }))
  }, [])

  return {
    state, startGame, submitAnswer, nextNote,
    setLesson, setSessionTarget, setShowNoteName, setMuted, setTimed, setNotation, restartGame,
    setCustomPool, setClef,
  }
}
