export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export type Note = typeof CHROMATIC_NOTES[number]

export const NOTE_ENHARMONICS: Record<string, Note> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
  'E#': 'F', 'B#': 'C',
}

export function parseNote(s: string): Note {
  if (CHROMATIC_NOTES.includes(s as Note)) return s as Note
  if (NOTE_ENHARMONICS[s]) return NOTE_ENHARMONICS[s]
  throw new Error(`Unknown note: ${s}`)
}

export function noteIndex(note: Note): number {
  return CHROMATIC_NOTES.indexOf(note)
}

export function noteAtSemitone(root: Note, semitones: number): Note {
  return CHROMATIC_NOTES[(noteIndex(root) + semitones + 120) % 12]
}

export function noteAtFret(openNote: Note, fret: number, capo = 0): Note {
  return noteAtSemitone(openNote, fret + capo)
}

// ── Chord & Scale interval maps ───────────────────────────────────────────────

export type ChordQuality = keyof typeof CHORD_INTERVALS
export const CHORD_INTERVALS = {
  'maj':   [0, 4, 7],
  'min':   [0, 3, 7],
  '7':     [0, 4, 7, 10],
  'maj7':  [0, 4, 7, 11],
  'min7':  [0, 3, 7, 10],
  'dim':   [0, 3, 6],
  'dim7':  [0, 3, 6, 9],
  'aug':   [0, 4, 8],
  'sus2':  [0, 2, 7],
  'sus4':  [0, 5, 7],
  '9':     [0, 4, 7, 10, 14],
  'add9':  [0, 4, 7, 14],
  '6':     [0, 4, 7, 9],
  'min6':  [0, 3, 7, 9],
  '5':     [0, 7],
} as const

export type ScaleType = keyof typeof SCALE_INTERVALS
export const SCALE_INTERVALS = {
  'major':           [0, 2, 4, 5, 7, 9, 11],
  'minor':           [0, 2, 3, 5, 7, 8, 10],
  'pentatonic maj':  [0, 2, 4, 7, 9],
  'pentatonic min':  [0, 3, 5, 7, 10],
  'blues':           [0, 3, 5, 6, 7, 10],
  'dorian':          [0, 2, 3, 5, 7, 9, 10],
  'mixolydian':      [0, 2, 4, 5, 7, 9, 10],
  'phrygian':        [0, 1, 3, 5, 7, 8, 10],
  'lydian':          [0, 2, 4, 6, 7, 9, 11],
  'locrian':         [0, 1, 3, 5, 6, 8, 10],
  'harmonic minor':  [0, 2, 3, 5, 7, 8, 11],
  'whole tone':      [0, 2, 4, 6, 8, 10],
  'diminished':      [0, 2, 3, 5, 6, 8, 9, 11],
} as const

export function getChordNotes(root: Note, quality: ChordQuality): Note[] {
  return CHORD_INTERVALS[quality].map(i => noteAtSemitone(root, i % 12))
}

export function getScaleNotes(root: Note, scale: ScaleType): Note[] {
  return SCALE_INTERVALS[scale].map(i => noteAtSemitone(root, i % 12))
}

// ── Tuning Presets ─────────────────────────────────────────────────────────────

export interface TuningPreset {
  name: string
  strings: Note[]   // low string to high string
}

export const TUNING_PRESETS: TuningPreset[] = [
  { name: 'Standard (EADGBE)',   strings: ['E', 'A', 'D', 'G', 'B', 'E'] },
  { name: 'Drop D (DADGBE)',     strings: ['D', 'A', 'D', 'G', 'B', 'E'] },
  { name: 'Open G (DGDGBD)',     strings: ['D', 'G', 'D', 'G', 'B', 'D'] },
  { name: 'Open D (DADF#AD)',    strings: ['D', 'A', 'D', 'F#', 'A', 'D'] },
  { name: 'Open E (EBEG#BE)',    strings: ['E', 'B', 'E', 'G#', 'B', 'E'] },
  { name: 'Open A (EAEAc#E)',    strings: ['E', 'A', 'E', 'A', 'C#', 'E'] },
  { name: 'DADGAD',              strings: ['D', 'A', 'D', 'G', 'A', 'D'] },
  { name: 'Half Step Down (Eb)', strings: ['D#', 'G#', 'C#', 'F#', 'A#', 'D#'] },
  { name: 'Full Step Down (D)',  strings: ['D', 'G', 'C', 'F', 'A', 'D'] },
  { name: 'Drop C (CADGBE-2)',   strings: ['C', 'G', 'C', 'F', 'A', 'D'] },
  { name: 'Kabosy / Open C (CGDGBD)', strings: ['C', 'G', 'D', 'G', 'B', 'D'] },
]

// fret markers: single dot frets and double dot (12th, 24th)
export const FRET_SINGLE_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21]
export const FRET_DOUBLE_MARKERS = [12, 24]

// interval index within the chord/scale for color coding
export function intervalIndex(note: Note, rootNote: Note, intervals: number[]): number {
  const diff = (noteIndex(note) - noteIndex(rootNote) + 12) % 12
  return intervals.indexOf(diff)
}
