<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '../utils/music'
import { noteAtSemitone } from '../utils/music'

const props = defineProps<{
  rootNote: Note
  intervals: number[]
  highlightNotes: Note[]
}>()

const INTERVAL_NAMES: Record<number, string> = {
  0: 'R', 1: '♭2', 2: '2', 3: '♭3', 4: '3', 5: '4',
  6: '♭5', 7: '5', 8: '♯5', 9: '6', 10: '♭7', 11: '7',
}

const INTERVAL_COLORS: Record<number, string> = {
  0:  'bg-red-500 text-white',
  2:  'bg-sky-500 text-white',
  3:  'bg-emerald-500 text-white',
  4:  'bg-blue-500 text-white',
  5:  'bg-violet-500 text-white',
  6:  'bg-orange-500 text-white',
  7:  'bg-green-500 text-white',
  9:  'bg-yellow-500 text-black',
  10: 'bg-amber-500 text-black',
  11: 'bg-purple-500 text-white',
}

const items = computed(() =>
  props.intervals.map(i => ({
    interval: i % 12,
    name: INTERVAL_NAMES[i % 12] ?? String(i),
    note: noteAtSemitone(props.rootNote, i),
    color: INTERVAL_COLORS[i % 12] ?? 'bg-zinc-500 text-white',
  }))
)
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <div
      v-for="item in items"
      :key="item.interval"
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
      :class="item.color"
    >
      <span class="text-xs opacity-75">{{ item.name }}</span>
      <span>{{ item.note }}</span>
    </div>
  </div>
</template>
