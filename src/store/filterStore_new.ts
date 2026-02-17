import { create } from 'zustand'
import { subDays } from 'date-fns'

interface FilterState {
  dateRange: {
    from: Date
    to: Date
  }
  reportingPeriod: 7 | 15 | 30 | 60 | 90
  selectedTTLs: string[]
  selectedPartners: string[]
  selectedEngineers: string[]
  setDateRange: (from: Date, to: Date) => void
  setReportingPeriod: (days: 7 | 15 | 30 | 60 | 90) => void
  setSelectedTTLs: (ttls: string[]) => void
  setSelectedPartners: (partners: string[]) => void
  setSelectedEngineers: (engineers: string[]) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  dateRange: {
    from: subDays(new Date(), 30),
    to: new Date(),
  },
  reportingPeriod: 30,
  selectedTTLs: [],
  selectedPartners: [],
  selectedEngineers: [],
  setDateRange: (from, to) => set({ dateRange: { from, to } }),
  setReportingPeriod: (days) => set({ 
    reportingPeriod: days,
    dateRange: { from: subDays(new Date(), days), to: new Date() }
  }),
  setSelectedTTLs: (ttls) => set({ selectedTTLs: ttls }),
  setSelectedPartners: (partners) => set({ selectedPartners: partners }),
  setSelectedEngineers: (engineers) => set({ selectedEngineers: engineers }),
  resetFilters: () =>
    set({
      dateRange: { from: subDays(new Date(), 30), to: new Date() },
      reportingPeriod: 30,
      selectedTTLs: [],
      selectedPartners: [],
      selectedEngineers: [],
    }),
}))
