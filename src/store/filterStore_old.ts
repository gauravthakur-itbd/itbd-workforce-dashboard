import { create } from 'zustand'
import { subDays } from 'date-fns'

interface FilterState {
  dateRange: {
    from: Date
    to: Date
  }
  selectedTTLs: string[]
  selectedPartners: string[]
  selectedEngineers: string[]
  setDateRange: (from: Date, to: Date) => void
  setSelectedTTLs: (tdls: string[]) => void
  setSelectedPartners: (partners: string[]) => void
  setSelectedEngineers: (engineers: string[]) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  dateRange: {
    from: subDays(new Date(), 30),
    to: new Date(),
  },
  selectedTTLs: [],
  selectedPartners: [],
  selectedEngineers: [],
  setDateRange: (from, to) => set({ dateRange: { from, to } }),
  setSelectedTTLs: (tdls) => set({ selectedTTLs: tdls }),
  setSelectedPartners: (partners) => set({ selectedPartners: partners }),
  setSelectedEngineers: (engineers) => set({ selectedEngineers: engineers }),
  resetFilters: () =>
    set({
      dateRange: { from: subDays(new Date(), 30), to: new Date() },
      selectedTTLs: [],
      selectedPartners: [],
      selectedEngineers: [],
    }),
}))
