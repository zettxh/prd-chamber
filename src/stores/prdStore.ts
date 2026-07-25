import { create } from 'zustand'

// ─── Types ─────────────────────────────────────────────────────────

export interface PrdSection {
  id: string
  name: string
  description: string
  priority: number
  is_mandatory: boolean
  content: string | null
  order: number
}

export interface PrdData {
  tier: number
  tier_reason: string
  flags: string[]
  sections: PrdSection[]
  skipped_sections: Array<{ id: string; reason: string }>
}

export type GenerateState =
  | 'outline'      // Show AI-recommended sections (first time / regenerate)
  | 'confirming'   // User editing outline
  | 'generating'   // Streaming content per section
  | 'done'         // Full document visible
  | 'error'        // Error state

export type SectionStatus = 'pending' | 'generating' | 'done' | 'error'

export interface SectionProgress {
  status: SectionStatus
  content: string | null
  error?: string
}

// ─── Store Interface ────────────────────────────────────────────────

interface PrdStore {
  // State machine
  state: GenerateState
  setState: (state: GenerateState) => void

  // PRD data
  prdData: PrdData | null
  setPrdData: (data: PrdData | null) => void

  // Section content (updated in real-time during generation)
  sectionProgress: Record<string, SectionProgress>

  // Current generation tracking
  currentGeneratingId: string | null

  // Error
  error: string | null

  // Actions
  startGeneration: () => void
  setOutline: (data: PrdData) => void
  updateSectionContent: (sectionId: string, content: string) => void
  setSectionError: (sectionId: string, error: string) => void
  setGeneratingSection: (sectionId: string) => void
  completeGeneration: () => void
  failGeneration: (error: string) => void
  reset: () => void
  regenerateOutline: () => void

  // Inline edit (update section content in prdData)
  updateSectionInData: (sectionId: string, content: string) => void

  // User-editable sections (after confirm)
  confirmedSections: PrdSection[]
  setConfirmedSections: (sections: PrdSection[]) => void
}

// ─── Store ─────────────────────────────────────────────────────────

export const usePrdStore = create<PrdStore>((set, get) => ({
  state: 'outline',
  prdData: null,
  sectionProgress: {},
  currentGeneratingId: null,
  error: null,
  confirmedSections: [],

  setState: (state) => set({ state }),

  setPrdData: (prdData) => {
    const sectionProgress: Record<string, SectionProgress> = {}
    prdData?.sections.forEach(s => {
      sectionProgress[s.id] = {
        status: s.content ? 'done' : 'pending',
        content: s.content,
      }
    })
    set({
      prdData,
      sectionProgress,
      confirmedSections: prdData?.sections ?? [],
      state: prdData?.sections.some(s => s.content) ? 'done' : 'outline',
    })
  },

  setOutline: (data) => {
    const sectionProgress: Record<string, SectionProgress> = {}
    data.sections.forEach(s => {
      sectionProgress[s.id] = { status: 'pending', content: null }
    })
    set({
      prdData: data,
      sectionProgress,
      confirmedSections: data.sections,
      state: 'outline',
    })
  },

  startGeneration: () => {
    const { confirmedSections } = get()
    const sectionProgress: Record<string, SectionProgress> = {}
    confirmedSections.forEach(s => {
      sectionProgress[s.id] = { status: 'pending', content: null }
    })
    set({ state: 'generating', sectionProgress, currentGeneratingId: null, error: null })
  },

  updateSectionContent: (sectionId, content) => {
    const { sectionProgress, prdData } = get()
    set({
      sectionProgress: {
        ...sectionProgress,
        [sectionId]: { status: 'done', content },
      },
      currentGeneratingId: null,
    })
    if (prdData) {
      set({
        prdData: {
          ...prdData,
          sections: prdData.sections.map(s =>
            s.id === sectionId ? { ...s, content } : s
          ),
        },
      })
    }
  },

  setSectionError: (sectionId, error) => {
    const { sectionProgress } = get()
    set({
      sectionProgress: {
        ...sectionProgress,
        [sectionId]: { status: 'error', content: null, error },
      },
    })
  },

  setGeneratingSection: (sectionId) => {
    const { sectionProgress } = get()
    set({
      sectionProgress: {
        ...sectionProgress,
        [sectionId]: { status: 'generating', content: null },
      },
      currentGeneratingId: sectionId,
    })
  },

  completeGeneration: () => {
    const { sectionProgress, prdData } = get()
    const updatedProgress = { ...sectionProgress }
    set({ confirmedSections: [] })
    if (prdData) {
      const updatedSections = prdData.sections.map(s => ({
        ...s,
        content: sectionProgress[s.id]?.content ?? s.content,
      }))
      set({
        state: 'done',
        sectionProgress: updatedProgress,
        prdData: { ...prdData, sections: updatedSections },
      })
    } else {
      set({ state: 'done', sectionProgress: updatedProgress })
    }
  },

  failGeneration: (error) => set({ state: 'error', error }),

  reset: () => set({
    state: 'outline',
    prdData: null,
    sectionProgress: {},
    currentGeneratingId: null,
    error: null,
    confirmedSections: [],
  }),

  regenerateOutline: () => {
    const { sectionProgress } = get()
    const resetProgress: Record<string, SectionProgress> = {}
    Object.keys(sectionProgress).forEach(id => {
      resetProgress[id] = { status: 'pending', content: null }
    })
    set({
      state: 'outline',
      sectionProgress: resetProgress,
      currentGeneratingId: null,
      error: null,
    })
  },

  updateSectionInData: (sectionId, content) => {
    const { confirmedSections, prdData, sectionProgress } = get()
    const updatedSections = confirmedSections.map(s =>
      s.id === sectionId ? { ...s, content } : s
    )
    if (prdData) {
      set({
        confirmedSections: updatedSections,
        prdData: {
          ...prdData,
          sections: prdData.sections.map(s =>
            s.id === sectionId ? { ...s, content } : s
          ),
        },
        sectionProgress: {
          ...sectionProgress,
          [sectionId]: { status: 'done', content },
        },
      })
    } else {
      set({ confirmedSections: updatedSections })
    }
  },

  setConfirmedSections: (sections) => set({ confirmedSections: sections }),
}))
