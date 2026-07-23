import { LESSONS, type Lesson } from '../data/lessons'
import type { Notation } from '../types'
import { displayNoteName } from './notation'
import { midiToNote } from './midiToNote'
import { getSessions, type SessionRecord } from './sessionHistory'
import { getWeakNotes } from './weakPool'

export type RoadmapStatus = 'done' | 'current' | 'locked'

export interface RoadmapStep {
  id: string
  title: string
  desc: string
  status: RoadmapStatus
  /** 0–100, only meaningful when status === 'current' */
  progress: number
}

export interface RankInfo {
  name: string
  progress: number
}

export interface DashboardComputed {
  score: string
  totalNotes: string
  goldBadges: number
  totalTime: string
  weeklyPrecision: number
  /** 7 values (Mon→Sun), accuracy 0–100 or null if no practice that day */
  weeklyAccuracies: Array<number | null>
  /** 7 booleans Mon→Sun: practiced that day */
  practiceDays: boolean[]
  challengingNotes: string[]
  userLevel: number
  rank: RankInfo
  roadmap: RoadmapStep[]
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Monday 00:00 of the week containing `d` (local time). */
function startOfWeekMonday(d: Date): Date {
  const day = d.getDay() // 0 Sun … 6 Sat
  const mondayOffset = day === 0 ? -6 : 1 - day
  const mon = startOfDay(d)
  mon.setDate(mon.getDate() + mondayOffset)
  return mon
}

function formatTotalTime(ms: number): string {
  if (ms <= 0) return '0s'
  const sec = Math.floor(ms / 1000)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function isMastered(lesson: Lesson, sessions: SessionRecord[]): boolean {
  return sessions.some(
    s =>
      s.lessonId === lesson.id &&
      s.accuracy / 100 >= lesson.mastery.minAccuracy &&
      s.notes >= lesson.mastery.minNotes,
  )
}

function bestAccuracyForLesson(lessonId: string, sessions: SessionRecord[]): number {
  const list = sessions.filter(s => s.lessonId === lessonId)
  if (list.length === 0) return 0
  return Math.max(...list.map(s => s.accuracy))
}

export function rankFromLevel(level: number): RankInfo {
  // Each tier spans 5 levels; progress within tier is 0–100.
  if (level <= 5) return { name: 'Bronce', progress: Math.round(((level - 1) / 5) * 100) }
  if (level <= 10) return { name: 'Plata', progress: Math.round(((level - 6) / 5) * 100) }
  if (level <= 15) return { name: 'Oro', progress: Math.round(((level - 11) / 5) * 100) }
  return { name: 'Mastery Gold', progress: Math.min(100, Math.round(((level - 16) / 5) * 100)) }
}

function buildRoadmap(selectedLessonId: string, sessions: SessionRecord[]): RoadmapStep[] {
  const selected = LESSONS.find(l => l.id === selectedLessonId) ?? LESSONS[0]
  const path = LESSONS.filter(l => l.clef === selected.clef)

  const firstOpen = path.findIndex(l => !isMastered(l, sessions))
  const currentIdx = firstOpen === -1 ? path.length - 1 : firstOpen

  // Show current lesson and neighbors (up to 3 steps).
  let start = Math.max(0, currentIdx - 1)
  if (start + 3 > path.length) start = Math.max(0, path.length - 3)
  const slice = path.slice(start, start + 3)

  return slice.map((lesson, i) => {
    const absIdx = start + i
    const mastered = isMastered(lesson, sessions)
    let status: RoadmapStatus
    if (mastered) status = 'done'
    else if (absIdx === currentIdx) status = 'current'
    else if (absIdx < currentIdx) status = 'done'
    else status = 'locked'

    const best = bestAccuracyForLesson(lesson.id, sessions)
    const progress =
      status === 'done'
        ? 100
        : status === 'current'
          ? Math.min(100, Math.round(best))
          : 0

    return {
      id: lesson.id,
      title: lesson.name,
      desc: lesson.desc,
      status,
      progress,
    }
  })
}

/**
 * Aggregates local session history + weak notes for the dashboard home.
 * Pure read of localStorage helpers — call on each dashboard render / focus.
 */
export function computeDashboardStats(
  lessonId: string,
  notation: Notation,
): DashboardComputed {
  const sessions = getSessions()
  const totalNotes = sessions.reduce((sum, s) => sum + (s.notes || 0), 0)
  const totalMs = sessions.reduce((sum, s) => sum + (s.elapsedMs || 0), 0)
  const goldBadges = sessions.filter(s => s.accuracy >= 90).length
  const score = sessions.reduce(
    (sum, s) => sum + Math.round((s.accuracy / 100) * s.notes * 10),
    0,
  )

  // Level: 1 + 1 per 50 notes played (lifetime).
  const userLevel = Math.max(1, Math.floor(totalNotes / 50) + 1)

  const now = new Date()
  const weekStart = startOfWeekMonday(now)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date)
    return d >= weekStart && d < weekEnd
  })

  const weeklyPrecision =
    weekSessions.length > 0
      ? Math.round(weekSessions.reduce((a, s) => a + s.accuracy, 0) / weekSessions.length)
      : 0

  const weeklyAccuracies: Array<number | null> = Array.from({ length: 7 }, () => null)
  const practiceDays = Array.from({ length: 7 }, () => false)
  const dayBuckets: number[][] = Array.from({ length: 7 }, () => [])

  for (const s of weekSessions) {
    const d = startOfDay(new Date(s.date))
    const idx = Math.round((d.getTime() - weekStart.getTime()) / 864e5)
    if (idx >= 0 && idx < 7) {
      practiceDays[idx] = true
      dayBuckets[idx].push(s.accuracy)
    }
  }
  for (let i = 0; i < 7; i++) {
    if (dayBuckets[i].length > 0) {
      weeklyAccuracies[i] = Math.round(
        dayBuckets[i].reduce((a, b) => a + b, 0) / dayBuckets[i].length,
      )
    }
  }

  const weak = getWeakNotes().slice(-3).reverse()
  const challengingNotes = weak.map(midi => {
    const note = midiToNote(midi)
    const base = displayNoteName(note.name, notation)
    // Prefer sharp as ♯ for latino display polish
    return notation === 'latino' ? base.replace('#', '♯') : base
  })

  return {
    score: String(score),
    totalNotes: totalNotes >= 1000 ? `${(totalNotes / 1000).toFixed(1)}k` : String(totalNotes),
    goldBadges,
    totalTime: formatTotalTime(totalMs),
    weeklyPrecision,
    weeklyAccuracies,
    practiceDays,
    challengingNotes,
    userLevel,
    rank: rankFromLevel(userLevel),
    roadmap: buildRoadmap(lessonId, sessions),
  }
}

/** Build SVG polyline points for weekly accuracy (viewBox 0 0 100 30). */
export function weeklyAccuracyPath(accuracies: Array<number | null>): string {
  const pts: string[] = []
  for (let i = 0; i < 7; i++) {
    const x = (i / 6) * 100
    const acc = accuracies[i]
    // null → sit near bottom; 0–100 maps to y 28→2
    const y = acc == null ? 28 : 28 - (acc / 100) * 26
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

export interface MasteryStatus {
  mastered: boolean
  unlocked: boolean
  bestAccuracy: number
}

export function computeMasteryStatus(lessonId: string, sessions: SessionRecord[]): MasteryStatus {
  const lesson = LESSONS.find(l => l.id === lessonId)
  if (!lesson) return { mastered: false, unlocked: false, bestAccuracy: 0 }
  const mastered = isMastered(lesson, sessions)
  const clefLessons = LESSONS.filter(l => l.clef === lesson.clef)
  const lessonIdx = clefLessons.findIndex(l => l.id === lessonId)
  const unlocked = lessonIdx === 0 || clefLessons.slice(0, lessonIdx).every(l => isMastered(l, sessions))
  return { mastered, unlocked, bestAccuracy: bestAccuracyForLesson(lessonId, sessions) }
}
