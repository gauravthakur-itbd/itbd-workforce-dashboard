import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, Building2, TrendingUp, 
  Target,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Lightbulb
} from 'lucide-react'
import { motion } from 'framer-motion'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ReferenceLine 
} from 'recharts'
import { useFilterStore } from '../store/filterStore'
import { dataService, type ReportingPeriod } from '../services/dataService'
import ReportingPeriodSelector from '../components/ReportingPeriodSelector'
import { InsightsEngine } from '../services/insightsEngine'

export default function Dashboard() {
  const navigate = useNavigate()
  const { reportingPeriod } = useFilterStore()
  
  // Convert reporting period to string format for dataService
  const period = reportingPeriod.toString() as ReportingPeriod

  // Load real data with period filtering
  const stats = useMemo(() => dataService.getDashboardStats(period), [period])
  const allTTLs = useMemo(() => dataService.getAllTTLs(), [])

  // Calculate KPIs from real period-filtered data
  const kpis = useMemo(() => {
    return {
      utilization: stats.avg_utilization_pct || 0,
      utilizationChange: 3, // TODO: Calculate from previous period
      totalEngineers: stats.total_engineers,
      engineersChange: 0, // TODO: Calculate from previous period
      totalPartners: stats.total_partners,
      partnersChange: 0, // TODO: Calculate from previous period
      netCSAT: stats.avg_csat_score,
      csatChange: 0, // TODO: Calculate from previous period
      ticketsClosed: stats.total_tickets_closed || 0,
      ticketsChange: 0, // TODO: Calculate from previous period
    }
  }, [stats])

  // Calculate TTL comparison with period filtering
  const ttlComparison = useMemo(() => {
    return allTTLs.map((ttl: string) => {
      const ttlStats = dataService.getTTLStats(ttl, period)
      return {
        ttl,
        utilization: ttlStats.avgUtilization,
        engineers: ttlStats.totalEngineers,
        tickets: ttlStats.totalTickets,
        csat: ttlStats.avgCSATScore
      }
    }).sort((a: any, b: any) => b.utilization - a.utilization)
  }, [allTTLs, period])

  // Mock utilization trend - you can enhance this with historical data
  const utilizationTrend = [
    { month: 'Aug 25', utilization: 72 },
    { month: 'Sep 25', utilization: 74 },
    { month: 'Oct 25', utilization: 76 },
    { month: 'Nov 25', utilization: 75 },
    { month: 'Dec 25', utilization: 73 },
    { month: 'Jan 26', utilization: 76 },
    { month: 'Feb 26', utilization: kpis.utilization },
  ]

  // Mock ticket trend - enhance with real aggregated data
  const ticketTrend = [
    { week: 'W1', worked: 850, closed: 820 },
    { week: 'W2', worked: 920, closed: 890 },
    { week: 'W3', worked: 880, closed: 860 },
    { week: 'W4', worked: 950, closed: 920 },
  ]

  const KPICard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color,
    suffix = ''
  }: { 
    title: string
    value: number | string
    change: number
    icon: any
    color: string
    suffix?: string
  }) => {
    const isPositive = change >= 0
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="kpi-card"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
            isPositive ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'
          }`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}{suffix}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-neutral-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}{suffix}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Header */}
      <header className="bg-brand-dark/50 backdrop-blur-sm border-b border-brand-light/20 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="https://itbd.net/logos/itbd.png" alt="ITBD" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-display font-bold text-white">Business Intelligence</h1>
                <p className="text-sm text-neutral-400">Global Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ReportingPeriodSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <KPICard
            title="Overall Utilization"
            value={kpis.utilization}
            change={kpis.utilizationChange}
            icon={TrendingUp}
            color="bg-brand-primary/20 text-brand-primary"
            suffix="%"
          />
          <KPICard
            title="Total Engineers"
            value={kpis.totalEngineers}
            change={kpis.engineersChange}
            icon={Users}
            color="bg-accent-blue/20 text-accent-blue"
          />
          <KPICard
            title="Total Partners"
            value={kpis.totalPartners}
            change={kpis.partnersChange}
            icon={Building2}
            color="bg-brand-secondary/20 text-brand-secondary"
          />
          <KPICard
            title="Net CSAT Score"
            value={kpis.netCSAT}
            change={kpis.csatChange}
            icon={CheckCircle2}
            color="bg-accent-green/20 text-accent-green"
            suffix="%"
          />
          <KPICard
            title="Tickets Closed"
            value={kpis.ticketsClosed}
            change={kpis.ticketsChange}
            icon={Target}
            color="bg-accent-teal/20 text-accent-teal"
          />
        </div>

        {/* AI Insights Section */}
        {(() => {
          const insights = InsightsEngine.getGlobalInsights(stats)
          return insights.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-5 h-5 text-brand-primary" />
                <h2 className="text-xl font-display font-bold text-white">Performance Insights</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg ${InsightsEngine.getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-full min-h-[60px] rounded-full ${
                        insight.type === 'success' ? 'bg-accent-green' :
                        insight.type === 'warning' ? 'bg-accent-yellow' :
                        insight.type === 'alert' ? 'bg-accent-red' :
                        'bg-brand-primary'
                      }`} />
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-2 ${InsightsEngine.getInsightIconColor(insight.type)}`}>
                          {insight.title}
                        </h3>
                        <p className="text-sm text-neutral-300 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Utilization Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Utilization Trend</h2>
              <p className="text-sm text-neutral-400 mt-1">Period: Last {reportingPeriod} days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={utilizationTrend}>
              <defs>
                <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A8E1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00A8E1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E3A5F', 
                  border: '1px solid #00A8E1',
                  borderRadius: '8px',
                  color: '#F8FAFC'
                }} 
              />
              {/* Goal Reference Line at 80% */}
              <ReferenceLine 
                y={80} 
                stroke="#A4D233" 
                strokeDasharray="3 3" 
                strokeWidth={2}
                label={{ 
                  value: 'Goal: 80%', 
                  position: 'right',
                  fill: '#A4D233',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="utilization" 
                stroke="#00A8E1" 
                strokeWidth={3}
                dot={{ fill: '#00A8E1', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TDL Comparison & Ticket Trend */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* TTL Comparison */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-display font-bold text-white">TTL Performance</h2>
              <p className="text-sm text-neutral-400 mt-1">Average utilization by team lead</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ttlComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="ttl" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E3A5F', 
                    border: '1px solid #00A8E1',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }} 
                />
                {/* Goal Reference Line at 80% */}
                <ReferenceLine 
                  y={80} 
                  stroke="#A4D233" 
                  strokeDasharray="3 3" 
                  strokeWidth={2}
                  label={{ 
                    value: 'Goal: 80%', 
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

          {/* Ticket Trend */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-display font-bold text-white">Ticket Volume</h2>
              <p className="text-sm text-neutral-400 mt-1">Weekly ticket metrics</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ticketTrend}>
                <defs>
                  <linearGradient id="workedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A8E1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00A8E1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="closedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A4D233" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A4D233" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="week" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E3A5F', 
                    border: '1px solid #00A8E1',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="worked" stroke="#00A8E1" fill="url(#workedGradient)" />
                <Area type="monotone" dataKey="closed" stroke="#A4D233" fill="url(#closedGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TTL List - Click to navigate */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Team Leads</h2>
            <p className="text-sm text-neutral-400 mt-1">Click to view detailed team performance</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ttlComparison.map((ttlData: any) => (
              <motion.button
                key={ttlData.ttl}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/ttl/${ttlData.ttl.toLowerCase()}`)}
                className="p-4 bg-brand-light/20 hover:bg-brand-light/30 border border-brand-light/20 hover:border-brand-primary/40 rounded-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                    {ttlData.ttl}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-primary transition-colors" />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <p className="text-neutral-400">Utilization</p>
                    <p className="text-lg font-bold text-brand-primary">{ttlData.utilization}%</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Engineers</p>
                    <p className="text-lg font-bold text-white">{ttlData.engineers}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Partners List - Click to navigate */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Partners</h2>
            <p className="text-sm text-neutral-400 mt-1">All {stats.total_partners} partners - Click to view details</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dataService.getTopPartnersByEngineers(stats.total_partners).map(({ name, data }) => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/partner/${encodeURIComponent(name)}`)}
                className="p-4 bg-brand-light/20 hover:bg-brand-light/30 border border-brand-light/20 hover:border-brand-primary/40 rounded-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                    {name}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-neutral-400">Engineers</p>
                    <p className="text-lg font-bold text-white">{data.engineer_count}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">CSAT</p>
                    <p className="text-lg font-bold text-brand-primary">{data.csat_score}%</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  TTLs: {data.ttls.slice(0, 2).join(', ')}{data.ttls.length > 2 ? '...' : ''}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
