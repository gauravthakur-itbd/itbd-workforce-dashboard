import { Calendar } from 'lucide-react'
import { useFilterStore } from '../store/filterStore'
import { format } from 'date-fns'

const PERIODS = [
  { days: 7, label: 'Last 7 Days' },
  { days: 15, label: 'Last 15 Days' },
  { days: 30, label: 'Last 30 Days' },
  { days: 60, label: 'Last 60 Days' },
  { days: 90, label: 'Last 90 Days' },
] as const

export default function ReportingPeriodSelector() {
  const { reportingPeriod, setReportingPeriod, dateRange } = useFilterStore()

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-brand-light/30 rounded-lg border border-brand-primary/20">
        <Calendar className="w-4 h-4 text-brand-primary" />
        <span className="text-sm text-neutral-300">
          {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
        </span>
      </div>
      
      <div className="flex gap-2">
        {PERIODS.map((period) => (
          <button
            key={period.days}
            onClick={() => setReportingPeriod(period.days)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              reportingPeriod === period.days
                ? 'bg-brand-primary text-white'
                : 'bg-brand-light/30 text-neutral-400 hover:text-white hover:bg-brand-light/40'
            }`}
          >
            {period.days}d
          </button>
        ))}
      </div>
    </div>
  )
}
