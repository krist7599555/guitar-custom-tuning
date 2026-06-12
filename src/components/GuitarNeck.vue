<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '../utils/music'
import { noteAtFret, FRET_SINGLE_MARKERS, FRET_DOUBLE_MARKERS, noteIndex } from '../utils/music'

const props = withDefaults(defineProps<{
  tuning: Note[]        // low to high
  capo?: number
  highlightNotes?: Note[]
  rootNote?: Note | null
  fretCount?: number
  focusedNotes?: Note[] | null
}>(), {
  capo: 0,
  highlightNotes: () => [],
  rootNote: null,
  fretCount: 15,
  focusedNotes: null,
})

// color per interval distance from root (root=0, 1..11)
const INTERVAL_COLORS: Record<number, string> = {
  0:  'bg-red-500 text-white shadow-red-500/60',       // root
  1:  'bg-zinc-500 text-white',
  2:  'bg-sky-500 text-white shadow-sky-500/60',        // 2nd
  3:  'bg-emerald-500 text-white shadow-emerald-500/60',// min 3rd
  4:  'bg-blue-500 text-white shadow-blue-500/60',      // maj 3rd
  5:  'bg-violet-500 text-white shadow-violet-500/60',  // 4th
  6:  'bg-orange-500 text-white',                       // tritone
  7:  'bg-green-500 text-white shadow-green-500/60',    // 5th
  8:  'bg-pink-500 text-white',
  9:  'bg-yellow-500 text-black shadow-yellow-500/60',  // 6th
  10: 'bg-amber-500 text-black',                        // min 7th
  11: 'bg-purple-500 text-white shadow-purple-500/60',  // maj 7th
}

const fretNumbers = computed(() => Array.from({ length: props.fretCount + 1 }, (_, i) => i))
// Display strings high to low on screen (high E on top)
const displayStrings = computed(() => [...props.tuning].reverse())

function noteClass(note: Note): string {
  if (!props.rootNote) {
    if (props.highlightNotes.includes(note)) return 'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/50'
    return ''
  }
  if (!props.highlightNotes.includes(note)) return ''
  const dist = (noteIndex(note) - noteIndex(props.rootNote) + 12) % 12
  return INTERVAL_COLORS[dist] ?? 'bg-zinc-400 text-zinc-900'
}

function isHighlighted(note: Note): boolean {
  return props.highlightNotes.includes(note)
}

function isDimmed(note: Note): boolean {
  return props.focusedNotes !== null && !props.focusedNotes.includes(note)
}

function openStringNote(stringNote: Note): Note {
  return noteAtFret(stringNote, 0, props.capo)
}
</script>

<template>
  <div class="w-full overflow-x-auto pb-2">
    <div class="min-w-[600px]">
      <!-- Fret number row -->
      <div class="flex items-center mb-1">
        <!-- Open string label space -->
        <div class="w-12 shrink-0" />
        <!-- Nut -->
        <div class="w-3 shrink-0" />
        <div
          v-for="fret in fretNumbers.slice(1)"
          :key="fret"
          class="flex-1 text-center text-xs text-zinc-500 font-mono"
        >
          {{ fret }}
          <span v-if="fret === capo && capo > 0" class="text-amber-400">⬆</span>
        </div>
      </div>

      <!-- Fretboard -->
      <div class="fretboard rounded-lg overflow-hidden border border-zinc-800 shadow-2xl relative">
        <!-- Capo overlay bar -->
        <div
          v-if="capo > 0"
          class="absolute top-0 bottom-0 w-3 bg-amber-500/80 z-10 rounded pointer-events-none"
          :style="{
            left: `calc(3rem + 0.75rem + (${capo - 1} * (100% - 3rem - 0.75rem) / ${fretCount}))`,
            width: '8px'
          }"
        />

        <!-- Strings -->
        <div
          v-for="(stringNote, sIdx) in displayStrings"
          :key="sIdx"
          class="flex items-center border-b border-zinc-800/50 last:border-b-0"
          style="height: 44px"
        >
          <!-- Open note label -->
          <div class="w-12 shrink-0 flex items-center justify-center">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
              :class="[
                isHighlighted(openStringNote(stringNote))
                  ? noteClass(openStringNote(stringNote)) + ' shadow-md'
                  : 'bg-zinc-700/60 text-zinc-400',
                isHighlighted(openStringNote(stringNote)) && isDimmed(openStringNote(stringNote))
                  ? 'opacity-30 grayscale'
                  : ''
              ]"
            >
              {{ openStringNote(stringNote) }}
            </div>
          </div>

          <!-- Nut -->
          <div class="w-3 shrink-0 self-stretch bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 border-x border-amber-200/30" />

          <!-- Frets -->
          <div class="flex-1 flex relative" style="height: 44px">
            <!-- String line -->
            <div
              class="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none"
            >
              <div
                class="w-full"
                :style="{
                  height: `${1 + (displayStrings.length - 1 - sIdx) * 0.4}px`,
                  background: `linear-gradient(90deg, #c8b89a, #a09070, #c8b89a)`,
                  opacity: 0.8
                }"
              />
            </div>

            <!-- Fret cells -->
            <div
              v-for="fret in fretNumbers.slice(1)"
              :key="fret"
              class="flex-1 flex items-center justify-center relative"
            >
              <!-- Fret wire -->
              <div class="absolute right-0 top-1 bottom-1 w-px bg-zinc-500/60" />

              <!-- Note dot -->
              <div
                v-if="isHighlighted(noteAtFret(stringNote, fret, capo))"
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-md transition-all duration-200 cursor-default select-none"
                :class="[
                  noteClass(noteAtFret(stringNote, fret, capo)),
                  isDimmed(noteAtFret(stringNote, fret, capo)) ? 'opacity-30 grayscale' : ''
                ]"
              >
                {{ noteAtFret(stringNote, fret, capo) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Fret position markers (inlays) -->
        <div class="flex border-t border-zinc-700/50" style="height: 20px">
          <div class="w-12 shrink-0" />
          <div class="w-3 shrink-0" />
          <div
            v-for="fret in fretNumbers.slice(1)"
            :key="fret"
            class="flex-1 flex items-center justify-center"
          >
            <template v-if="FRET_DOUBLE_MARKERS.includes(fret)">
              <div class="flex gap-0.5">
                <div class="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <div class="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              </div>
            </template>
            <template v-else-if="FRET_SINGLE_MARKERS.includes(fret)">
              <div class="w-2 h-2 rounded-full bg-zinc-600" />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
