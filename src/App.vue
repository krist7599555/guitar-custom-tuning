<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import GuitarNeck from './components/GuitarNeck.vue'
import NoteIntervalLegend from './components/NoteIntervalLegend.vue'
import {
  CHROMATIC_NOTES, TUNING_PRESETS, CHORD_INTERVALS, SCALE_INTERVALS,
  getChordNotes, getScaleNotes, parseNote, noteAtSemitone,
  DIATONIC_DEGREES,
  type Note, type ChordQuality, type ScaleType, type TuningPreset, type DiatonicLabel,
} from './utils/music'

// ── Tuning ───────────────────────────────────────────────────────────────────
const selectedPreset = ref<TuningPreset>(TUNING_PRESETS[0])
const customTuning = ref<Note[]>([...TUNING_PRESETS[0].strings])
const capo = ref(0)
const fretCount = ref(15)

watch(selectedPreset, (p) => {
  customTuning.value = [...p.strings]
})

const editingCustom = ref(false)
const customInputs = ref(customTuning.value.map(n => n as string))

function applyCustom() {
  try {
    const parsed = customInputs.value.map(n => parseNote(n.trim()))
    customTuning.value = parsed
    selectedPreset.value = { name: 'Custom', strings: parsed }
    editingCustom.value = false
  } catch (e: any) {
    alert(e.message)
  }
}

// ── Mode: Chord or Scale ──────────────────────────────────────────────────────
const mode = ref<'chord' | 'scale'>('chord')

const rootNote = ref<Note>('C')
const chordQuality = ref<ChordQuality>('maj')
const scaleType = ref<ScaleType>('major')

const activeIntervals = computed<number[]>(() => {
  if (mode.value === 'chord') return [...CHORD_INTERVALS[chordQuality.value]]
  return [...SCALE_INTERVALS[scaleType.value]]
})

const highlightNotes = computed<Note[]>(() => {
  if (mode.value === 'chord') return getChordNotes(rootNote.value, chordQuality.value)
  return getScaleNotes(rootNote.value, scaleType.value)
})

const modeLabel = computed(() => {
  if (mode.value === 'chord') return `${rootNote.value} ${chordQuality.value}`
  return `${rootNote.value} ${scaleType.value}`
})

// ── Key filter (diatonic chords within scale) ─────────────────────────────────
const keyFilter = ref<DiatonicLabel>('all')

watch(mode, () => { keyFilter.value = 'all' })

const focusedNotes = computed<Note[] | null>(() => {
  if (mode.value !== 'scale' || keyFilter.value === 'all') return null
  const deg = DIATONIC_DEGREES.find(d => d.label === keyFilter.value)
  if (!deg || deg.degree === null || !deg.quality) return null
  const chordRoot = noteAtSemitone(rootNote.value, deg.degree)
  return getChordNotes(chordRoot, deg.quality)
})

// ── Quick chord shortcuts ─────────────────────────────────────────────────────
const QUICK_CHORDS: ChordQuality[] = ['maj', 'min', '7', 'maj7', 'min7', 'sus4', 'sus2', 'dim', 'aug', '5']
const QUICK_SCALES: ScaleType[] = ['major', 'minor', 'pentatonic maj', 'pentatonic min', 'blues', 'dorian', 'mixolydian']

const noteNames = [...CHROMATIC_NOTES]
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100">
    <!-- Header -->
    <header class="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <span class="text-2xl">🎸</span>
        <div>
          <h1 class="text-lg font-bold leading-none text-zinc-100">Guitar Tuning Visualizer</h1>
          <p class="text-xs text-zinc-500 mt-0.5">Fretboard explorer · chords · scales · custom tuning</p>
        </div>
        <div class="ml-auto text-sm text-zinc-400 font-mono">
          {{ modeLabel }}
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">

      <!-- ── Controls row ── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- Tuning preset -->
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 space-y-3">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Tuning</h2>
          <select
            v-model="selectedPreset"
            class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option v-for="p in TUNING_PRESETS" :key="p.name" :value="p">{{ p.name }}</option>
          </select>

          <!-- String display low → high -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              v-for="(note, i) in customTuning"
              :key="i"
              class="px-2 py-0.5 bg-zinc-800 rounded text-xs font-mono text-amber-300 border border-zinc-700"
            >
              {{ note }}
            </span>
          </div>

          <!-- Custom tuning editor -->
          <button
            class="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
            @click="editingCustom = !editingCustom; customInputs = customTuning.map(n => n)"
          >
            {{ editingCustom ? 'Cancel' : 'Edit custom tuning…' }}
          </button>

          <div v-if="editingCustom" class="space-y-2">
            <div class="flex gap-1">
              <input
                v-for="(_, i) in customInputs"
                :key="i"
                v-model="customInputs[i]"
                class="w-10 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-center font-mono text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                maxlength="3"
                :title="`String ${i + 1} (low to high)`"
              />
            </div>
            <p class="text-xs text-zinc-600">Low string → high string</p>
            <button
              class="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors"
              @click="applyCustom"
            >
              Apply
            </button>
          </div>
        </div>

        <!-- Capo & Frets -->
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 space-y-3">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Setup</h2>

          <div class="space-y-1">
            <div class="flex justify-between text-xs text-zinc-400">
              <span>Capo</span>
              <span class="font-mono text-amber-400">{{ capo === 0 ? 'No capo' : `Fret ${capo}` }}</span>
            </div>
            <input
              v-model.number="capo"
              type="range" min="0" max="11"
              class="w-full accent-amber-500"
            />
            <div class="flex justify-between text-xs text-zinc-600">
              <span>0</span><span>11</span>
            </div>
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-xs text-zinc-400">
              <span>Visible frets</span>
              <span class="font-mono text-zinc-300">{{ fretCount }}</span>
            </div>
            <input
              v-model.number="fretCount"
              type="range" min="5" max="24"
              class="w-full accent-zinc-500"
            />
          </div>
        </div>

        <!-- Mode selector -->
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 space-y-3">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Display Mode</h2>

          <div class="flex rounded-lg overflow-hidden border border-zinc-700">
            <button
              class="flex-1 py-2 text-sm font-medium transition-colors"
              :class="mode === 'chord' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'"
              @click="mode = 'chord'"
            >
              Chord
            </button>
            <button
              class="flex-1 py-2 text-sm font-medium transition-colors"
              :class="mode === 'scale' ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'"
              @click="mode = 'scale'"
            >
              Scale
            </button>
          </div>

          <!-- Root note -->
          <div>
            <p class="text-xs text-zinc-500 mb-1.5">Root note</p>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="note in noteNames"
                :key="note"
                class="w-8 h-8 rounded text-xs font-mono font-medium transition-colors"
                :class="rootNote === note
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
                @click="rootNote = note"
              >
                {{ note }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Chord / Scale type row ── -->
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div v-if="mode === 'chord'" class="space-y-2">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Chord Quality</h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="q in QUICK_CHORDS"
              :key="q"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
              :class="chordQuality === q
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
              @click="chordQuality = q"
            >
              {{ rootNote }}{{ q }}
            </button>
            <select
              v-model="chordQuality"
              class="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 border border-zinc-700 text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option v-for="(_, q) in CHORD_INTERVALS" :key="q" :value="q">{{ rootNote }}{{ q }}</option>
            </select>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="space-y-2">
            <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Scale Type</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in QUICK_SCALES"
                :key="s"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                :class="scaleType === s
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
                @click="scaleType = s"
              >
                {{ s }}
              </button>
              <select
                v-model="scaleType"
                class="px-3 py-1.5 rounded-lg text-sm bg-zinc-800 border border-zinc-700 text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option v-for="(_, s) in SCALE_INTERVALS" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div class="space-y-2 border-t border-zinc-700/60 pt-4">
            <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Key — Diatonic Chord</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="deg in DIATONIC_DEGREES"
                :key="deg.label"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                :class="keyFilter === deg.label
                  ? 'bg-teal-600 border-teal-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'"
                @click="keyFilter = deg.label"
              >
                {{ deg.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Fretboard ── -->
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Fretboard — {{ modeLabel }}
          </h2>
          <NoteIntervalLegend
            :root-note="rootNote"
            :intervals="activeIntervals"
            :highlight-notes="highlightNotes"
          />
        </div>

        <GuitarNeck
          :tuning="customTuning"
          :capo="capo"
          :highlight-notes="highlightNotes"
          :root-note="rootNote"
          :fret-count="fretCount"
          :focused-notes="focusedNotes"
        />
      </div>

      <!-- ── Notes in chord/scale ── -->
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Notes in {{ modeLabel }}</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="note in highlightNotes"
            :key="note"
            class="px-3 py-1 rounded-full text-sm font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-200"
          >
            {{ note }}
          </span>
        </div>
      </div>

    </main>

    <footer class="text-center text-xs text-zinc-700 py-6">
      Guitar Custom Tuning Visualizer · Static · Cloudflare Pages
    </footer>
  </div>
</template>
