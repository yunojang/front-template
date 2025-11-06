import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type EditorUiState = {
  activeSegmentId: string | null
  playbackRate: number
  splitMode: boolean
  selectedTrackId: string | null
  setActiveSegment: (id: string | null) => void
  setPlaybackRate: (rate: number) => void
  toggleSplitMode: () => void
  selectTrack: (id: string | null) => void
}

export const useEditorStore = create<EditorUiState>()(
  devtools((set) => ({
    activeSegmentId: null,
    playbackRate: 1,
    splitMode: false,
    selectedTrackId: null,
    setActiveSegment: (id) =>
      set({ activeSegmentId: id }, false, { type: 'editor/setActiveSegment', payload: id }),
    setPlaybackRate: (rate) =>
      set({ playbackRate: rate }, false, { type: 'editor/setPlaybackRate', payload: rate }),
    toggleSplitMode: () =>
      set((state) => ({ splitMode: !state.splitMode }), false, { type: 'editor/toggleSplitMode' }),
    selectTrack: (id) =>
      set({ selectedTrackId: id }, false, { type: 'editor/selectTrack', payload: id }),
  })),
)
