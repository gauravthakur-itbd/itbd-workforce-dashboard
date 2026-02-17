import { useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Building2, Users, TrendingUp, Star, MessageSquare,
  Target, ChevronRight, User, Lightbulb
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine
} from 'recharts'
import { useFilterStore } from '../store/filterStore'
import { dataService, type ReportingPeriod } from '../services/dataService'
import ReportingPeriodSelector from '../components/ReportingPeriodSelector'
import { InsightsEngine } from '../services/insightsEngine'

const COLORS = ['#00A8E1', '#A4D233', '#F97316', '#8B5CF6', '#10B981', '#F59E0B']

export default function PartnerDashboard() {
  const { partnerKey } = useParams<{ partnerKey: string }>()
  const navigate = useNavigate()
  const { reportingPeriod } = useFilterStore()
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  const period = reportingPeriod.toString() as ReportingPeriod

  // Decode partner name from URL
  const partnerName = useMemo(() => decodeURIComponent(partnerKey || ''), [partnerKey])

  // Load partner data with period filtering
  const partnerData = useMemo(() => {
    const data = dataService.getPartnerWithDetails(partnerName, period)
    return data
  }, [partnerName, period])

  if (!partnerData) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Partner Not Found</h2>
          <p className="text-neutral-400 mb-6">The partner "{partnerName}" could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Calculate metrics
  const totalTickets = partnerData.engineerProfiles.reduce((sum, eng) => sum + eng.total_tickets_worked, 0)
  const totalBillableHours = partnerData.engineerProfiles.reduce((sum, eng) => sum + eng.total_billable_hours, 0)
  const avgUtilization = partnerData.engineerProfiles.reduce((sum, eng) => sum + eng.avg_utilization_pct, 0) / 
    Math.max(partnerData.engineerProfiles.length, 1)
  const avgCloseRate = partnerData.engineerProfiles.reduce((sum, eng) => sum + eng.close_rate, 0) / 
    Math.max(partnerData.engineerProfiles.length, 1)

  // TTL distribution
  const ttlDistribution = partnerData.ttls.map((ttl: string) => {
    const engineerCount = partnerData.engineerProfiles.filter((e: any) => e.ttl === ttl).length
    return { name: ttl, value: engineerCount }
  })

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Header */}
      <header className="bg-brand-dark/50 backdrop-blur-sm border-b border-brand-light/20 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-brand-light/20 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-300" />
              </button>
              <div>
                <h1 className="text-xl font-display font-bold text-white">{partnerName}</h1>
                <p className="text-sm text-neutral-400">Partner Analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ReportingPeriodSelector />
              <div className="px-4 py-2 bg-brand-light/30 rounded-lg border border-brand-primary/20">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent-yellow" />
                  <span className="text-sm text-neutral-300">CSAT: {partnerData.csat_score}%</span>
                </div>
              </div>
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
              <p className="text-sm text-neutral-400">Engineers</p>
              <p className="text-3xl font-bold text-white">{partnerData.engineer_count}</p>
              <p className="text-xs text-neutral-500">Across {partnerData.ttls.length} TTL(s)</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent-teal/20 text-accent-teal">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Total Tickets</p>
              <p className="text-3xl font-bold text-white">{totalTickets.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">{Math.round(avgCloseRate)}% close rate</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent-blue/20 text-accent-blue">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Avg Utilization</p>
              <p className="text-3xl font-bold text-white">{Math.round(avgUtilization)}%</p>
              <p className="text-xs text-neutral-500">{Math.round(totalBillableHours)}h billable</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent-green/20 text-accent-green">
                <Star className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">CSAT Score</p>
              <p className="text-3xl font-bold text-white">{partnerData.csat_score}%</p>
              <p className="text-xs text-neutral-500">{partnerData.total_csat_responses} responses</p>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Engineer Utilization */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-display font-bold text-white">Engineer Utilization</h2>
              <p className="text-sm text-neutral-400 mt-1">Average utilization by engineer</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partnerData.trends.engineerUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
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

          {/* TTL Distribution */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-display font-bold text-white">Team Distribution</h2>
              <p className="text-sm text-neutral-400 mt-1">Engineers by TTL</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ttlDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(0)}% (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ttlDistribution.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E3A5F', 
                    border: '1px solid #00A8E1',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }}
                  formatter={(value: any, name: string) => [value + ' engineers', name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Ticket Trend */}
        {partnerData.trends.monthlyTickets.length > 0 && (
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-display font-bold text-white">Monthly Ticket Trend</h2>
              <p className="text-sm text-neutral-400 mt-1">Last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={partnerData.trends.monthlyTickets}>
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
                <Line 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="#00A8E1" 
                  strokeWidth={3}
                  dot={{ fill: '#00A8E1', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Insights Section */}
        {(() => {
          const insights = InsightsEngine.getPartnerInsights(partnerData)
          return insights.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="w-5 h-5 text-brand-primary" />
                <h2 className="text-xl font-display font-bold text-white">Partner Insights</h2>
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

        {/* Engineers List */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Engineers</h2>
            <p className="text-sm text-neutral-400 mt-1">Click to view detailed engineer analytics</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerData.engineerProfiles.map((engineer) => {
              // Calculate overall performance based on utilization and close rate
              const getPerformanceStatus = () => {
                if (engineer.avg_utilization_pct >= 80 && engineer.close_rate >= 80) return { label: 'Good', color: 'text-accent-green' }
                if (engineer.avg_utilization_pct >= 60 && engineer.close_rate >= 60) return { label: 'Average', color: 'text-accent-yellow' }
                return { label: 'Poor', color: 'text-accent-red' }
              }
              const performance = getPerformanceStatus()
              
              // Color coding for metrics: Red <80%, Green ≥80%
              const utilizationColor = engineer.avg_utilization_pct >= 80 ? 'text-accent-green' : 'text-accent-red'
              const closeRateColor = engineer.close_rate >= 80 ? 'text-accent-green' : 'text-accent-red'
              
              return (
                <motion.button
                  key={engineer.email}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/engineer/${encodeURIComponent(engineer.email)}`)}
                  className="p-4 bg-brand-light/20 hover:bg-brand-light/30 border border-brand-light/20 hover:border-brand-primary/40 rounded-lg transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                        {engineer.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">TTL: {engineer.ttl}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-primary transition-colors" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-neutral-400">Utilization</p>
                      <p className={`font-semibold ${utilizationColor}`}>{engineer.avg_utilization_pct}%</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Close Rate</p>
                      <p className={`font-semibold ${closeRateColor}`}>{engineer.close_rate}%</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Performance</p>
                      <p className={`font-semibold ${performance.color}`}>{performance.label}</p>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* CSAT Feedback */}
        {(() => {
          // Filter to only show comments with actual text content
          const commentsWithText = partnerData.csat_comments.filter(
            comment => comment.comment && comment.comment.trim() !== ''
          );
          
          return commentsWithText.length > 0 && (
            <div className="card">
              <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Customer Feedback
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {commentsWithText.length} comment{commentsWithText.length !== 1 ? 's' : ''} from customers
                </p>
              </div>
              <div className="space-y-4">
                {commentsWithText.slice(0, 15).map((comment, index) => {
                  // Try to find engineer by matching comment content to engineer names
                  const matchedEngineer = comment.engineer && 
                    comment.engineer.toLowerCase() !== 'unassigned' && 
                    comment.engineer.toLowerCase() !== 'n/a' &&
                    comment.engineer.trim() !== ''
                    ? comment.engineer
                    : partnerData.engineerProfiles.find(eng => 
                        comment.comment.toLowerCase().includes(eng.name.split(' ')[0].toLowerCase())
                      )?.name || null;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-brand-light/10 border border-brand-light/20 rounded-lg hover:border-brand-primary/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            comment.rating.toLowerCase() === 'happy' 
                              ? 'bg-accent-green/20 text-accent-green' 
                              : comment.rating.toLowerCase() === 'okay'
                              ? 'bg-accent-yellow/20 text-accent-yellow'
                              : 'bg-accent-red/20 text-accent-red'
                          }`}>
                            {comment.rating.charAt(0).toUpperCase() + comment.rating.slice(1)}
                          </span>
                          {matchedEngineer && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/20 rounded-full">
                              <User className="w-3 h-3 text-brand-primary" />
                              <span className="text-xs font-medium text-brand-primary">
                                {matchedEngineer}
                              </span>
                            </div>
                          )}
                        </div>
                        {comment.date && (
                          <span className="text-xs text-neutral-500">{comment.date}</span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-300 leading-relaxed">{comment.comment}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  )
}
