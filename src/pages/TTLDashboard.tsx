import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import { ArrowLeft, Users, TrendingUp, Target, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useFilterStore } from '../store/filterStore'
import { dataService, type ReportingPeriod } from '../services/dataService'
import ReportingPeriodSelector from '../components/ReportingPeriodSelector'

export default function TTLDashboard() {
  const { ttlKey } = useParams<{ ttlKey: string }>()
  const navigate = useNavigate()
  const { reportingPeriod } = useFilterStore()
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  const period = reportingPeriod.toString() as ReportingPeriod
  const ttlName = ttlKey?.replace(/-/g, ' ') || ''
  const ttlNameCapitalized = ttlName.charAt(0).toUpperCase() + ttlName.slice(1)

  // Get TTL stats and engineers
  const ttlStats = useMemo(() => {
    return dataService.getTTLStats(ttlNameCapitalized, period)
  }, [ttlNameCapitalized, period])

  const engineers = useMemo(() => {
    return dataService.getEngineersByTTL(ttlNameCapitalized, period)
  }, [ttlNameCapitalized, period])

  // Calculate engineer performance data for chart
  const engineerPerformance = useMemo(() => {
    return engineers.map(eng => {
      const totalHours = eng.recent_utilization.reduce((sum, day) => sum + day.billable_hours, 0)
      const days = eng.recent_utilization.length
      const utilization = days > 0 ? (totalHours / (days * 8)) * 100 : 0
      const totalTickets = eng.recent_utilization.reduce((sum, day) => sum + day.tickets_worked, 0)

      return {
        name: eng.name.split(' ')[0], // First name only
        utilization: Math.round(utilization * 10) / 10,
        tickets: totalTickets,
        email: eng.email
      }
    }).sort((a, b) => b.utilization - a.utilization)
  }, [engineers])

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Header */}
      <header className="bg-brand-dark/50 backdrop-blur-sm border-b border-brand-light/20 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="https://itbd.net/logos/itbd.png" alt="ITBD" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-display font-bold text-white">{ttlNameCapitalized}'s Team</h1>
                <p className="text-sm text-neutral-400">Team Lead Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ReportingPeriodSelector />
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-brand-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-brand-primary/20 text-brand-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Team Size</p>
              <p className="text-3xl font-bold text-white">{ttlStats.totalEngineers}</p>
              <p className="text-xs text-neutral-500">Active engineers</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent-green/20 text-accent-green">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Avg Utilization</p>
              <p className="text-3xl font-bold text-white">{ttlStats.avgUtilization}%</p>
              <p className="text-xs text-neutral-500">Last {reportingPeriod} days</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-brand-secondary/20 text-brand-secondary">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Total Tickets</p>
              <p className="text-3xl font-bold text-white">{ttlStats.totalTickets}</p>
              <p className="text-xs text-neutral-500">Worked by team</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent-teal/20 text-accent-teal">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Close Rate</p>
              <p className="text-3xl font-bold text-white">{ttlStats.closeRate}%</p>
              <p className="text-xs text-neutral-500">{ttlStats.ticketsClosed} closed</p>
            </div>
          </motion.div>
        </div>

        {/* Team Performance Chart */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Team Performance</h2>
            <p className="text-sm text-neutral-400 mt-1">Utilization by engineer</p>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={engineerPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E3A5F', 
                  border: '1px solid #00A8E1',
                  borderRadius: '8px',
                  color: '#F8FAFC'
                }} 
              />
              {/* Target Reference Line at 80% */}
              <ReferenceLine 
                y={80} 
                stroke="#A4D233" 
                strokeDasharray="3 3" 
                strokeWidth={2}
                label={{ 
                  value: 'Target: 80%', 
                  position: 'right',
                  fill: '#A4D233',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="utilization" fill="#00A8E1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engineer List */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Team Members</h2>
            <p className="text-sm text-neutral-400 mt-1">Click to view engineer details</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {engineers.map((engineer) => {
              const totalHours = engineer.recent_utilization.reduce((sum, day) => sum + day.billable_hours, 0)
              const days = engineer.recent_utilization.length
              const utilization = days > 0 ? (totalHours / (days * 8)) * 100 : 0
              const totalTickets = engineer.recent_utilization.reduce((sum, day) => sum + day.tickets_worked, 0)
              const totalClosed = engineer.recent_utilization.reduce((sum, day) => sum + day.tickets_closed, 0)
              const closeRate = totalTickets > 0 ? (totalClosed / totalTickets) * 100 : 0
              
              // Calculate overall performance based on utilization and close rate
              const getPerformanceStatus = () => {
                if (utilization >= 80 && closeRate >= 80) return { label: 'Good', color: 'text-accent-green' }
                if (utilization >= 60 && closeRate >= 60) return { label: 'Average', color: 'text-accent-yellow' }
                return { label: 'Poor', color: 'text-accent-red' }
              }
              const performance = getPerformanceStatus()
              
              // Color coding for metrics: Red <80%, Green ≥80%
              const utilizationColor = utilization >= 80 ? 'text-accent-green' : 'text-accent-red'
              const closeRateColor = closeRate >= 80 ? 'text-accent-green' : 'text-accent-red'

              return (
                <motion.button
                  key={engineer.email}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/engineer/${engineer.email}`)}
                  className="p-4 bg-brand-light/20 hover:bg-brand-light/30 border border-brand-light/20 hover:border-brand-primary/40 rounded-lg transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                        {engineer.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">{engineer.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-neutral-400">Util.</p>
                      <p className={`font-semibold ${utilizationColor}`}>{Math.round(utilization)}%</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Close Rate</p>
                      <p className={`font-semibold ${closeRateColor}`}>{Math.round(closeRate)}%</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Performance</p>
                      <p className={`font-semibold ${performance.color}`}>{performance.label}</p>
                    </div>
                  </div>
                </motion.button>
              )}
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
