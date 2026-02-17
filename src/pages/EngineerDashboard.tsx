import { useParams, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import { ArrowLeft, User, TrendingUp, Target, Clock, Star, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useFilterStore } from '../store/filterStore'
import { dataService, type ReportingPeriod } from '../services/dataService'
import ReportingPeriodSelector from '../components/ReportingPeriodSelector'
import { InsightsEngine } from '../services/insightsEngine'

export default function EngineerDashboard() {
  const { engineerKey } = useParams<{ engineerKey: string }>()
  const navigate = useNavigate()
  const { reportingPeriod } = useFilterStore()
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  const period = reportingPeriod.toString() as ReportingPeriod
  const engineerEmail = engineerKey || ''

  // Get engineer profile and trends
  const engineer = useMemo(() => {
    return dataService.getEngineer(engineerEmail)
  }, [engineerEmail])

  const trends = useMemo(() => {
    return dataService.getEngineerTrends(engineerEmail, period)
  }, [engineerEmail, period])

  if (!engineer) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Engineer Not Found</h2>
          <p className="text-neutral-400 mb-6">The engineer profile could not be found.</p>
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

  // Calculate period-specific metrics
  const periodMetrics = useMemo(() => {
    const filteredUtil = trends.utilizationTrend
    const totalTickets = filteredUtil.reduce((sum, day) => sum + day.tickets, 0)
    const totalHours = filteredUtil.reduce((sum, day) => sum + (day.utilization * 8 / 100), 0)
    const days = filteredUtil.length
    const avgUtil = days > 0 ? filteredUtil.reduce((sum, day) => sum + day.utilization, 0) / days : 0

    return {
      avgUtilization: Math.round(avgUtil * 10) / 10,
      totalTickets,
      totalHours: Math.round(totalHours * 10) / 10,
      daysWorked: days
    }
  }, [trends])

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Header */}
      <header className="bg-brand-dark/50 backdrop-blur-sm border-b border-brand-light/20 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="https://itbd.net/logos/itbd.png" alt="ITBD" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-display font-bold text-white">{engineer.name}</h1>
                <p className="text-sm text-neutral-400">{engineer.email} • TTL: {engineer.ttl}</p>
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
              <div className="p-3 rounded-lg bg-accent-green/20 text-accent-green">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Avg Utilization</p>
              <p className="text-3xl font-bold text-white">{periodMetrics.avgUtilization}%</p>
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
              <p className="text-3xl font-bold text-white">{periodMetrics.totalTickets}</p>
              <p className="text-xs text-neutral-500">Worked in period</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-brand-primary/20 text-brand-primary">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Billable Hours</p>
              <p className="text-3xl font-bold text-white">{periodMetrics.totalHours}</p>
              <p className="text-xs text-neutral-500">{periodMetrics.daysWorked} days worked</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="kpi-card">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-accent-yellow/20 text-accent-yellow">
                <Star className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-400">Partners</p>
              <p className="text-3xl font-bold text-white">{engineer.partner_count}</p>
              <p className="text-xs text-neutral-500">Active accounts</p>
            </div>
          </motion.div>
        </div>

        {/* AI Insights Section */}
        {(() => {
          const insights = InsightsEngine.getEngineerInsights(engineer, trends.utilizationTrend)
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
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Daily Utilization Trend</h2>
            <p className="text-sm text-neutral-400 mt-1">Last {reportingPeriod} days</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.utilizationTrend}>
              <defs>
                <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A8E1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00A8E1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="date" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E3A5F', 
                  border: '1px solid #00A8E1',
                  borderRadius: '8px',
                  color: '#F8FAFC'
                }} 
              />
              <ReferenceLine 
                y={80} 
                stroke="#10B981" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{ 
                  value: '80% Target', 
                  position: 'right',
                  fill: '#10B981',
                  fontSize: 12
                }}
              />
              <Line type="monotone" dataKey="utilization" stroke="#00A8E1" strokeWidth={2} fill="url(#utilizationGradient)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Activity */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Ticket Activity</h2>
            <p className="text-sm text-neutral-400 mt-1">Daily tickets worked</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.utilizationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="date" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E3A5F', 
                  border: '1px solid #00A8E1',
                  borderRadius: '8px',
                  color: '#F8FAFC'
                }} 
              />
              <Bar dataKey="tickets" fill="#00A8E1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Partner Assignments */}
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-display font-bold text-white">Partner Assignments</h2>
            <p className="text-sm text-neutral-400 mt-1">{engineer.partners.length} active partners</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {engineer.partners.map((partner) => (
              <motion.button
                key={partner}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/partner/${encodeURIComponent(partner)}`)}
                className="p-4 bg-brand-light/20 hover:bg-brand-light/30 border border-brand-light/20 hover:border-brand-primary/40 rounded-lg transition-all text-left group"
              >
                <h3 className="font-semibold text-white group-hover:text-brand-primary transition-colors">
                  {partner}
                </h3>
              </motion.button>
            ))}
          </div>
        </div>

        {/* CSAT Feedback */}
        {(() => {
          // Filter to only show feedback with actual comment text
          const feedbackWithComments = trends.csatTrend.filter(
            feedback => feedback.comment && feedback.comment.trim() !== ''
          );
          
          return feedbackWithComments.length > 0 && (
            <div className="card">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent-yellow" />
                  <h2 className="text-xl font-display font-bold text-white">Customer Feedback</h2>
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  {feedbackWithComments.length} review{feedbackWithComments.length !== 1 ? 's' : ''} in this period
                </p>
              </div>
              <div className="space-y-4">
                {feedbackWithComments.map((feedback, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-brand-light/10 border border-brand-light/20 rounded-lg hover:border-brand-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          feedback.rating.toLowerCase() === 'happy' 
                            ? 'bg-accent-green/20 text-accent-green' 
                            : feedback.rating.toLowerCase() === 'okay'
                            ? 'bg-accent-yellow/20 text-accent-yellow'
                            : 'bg-accent-red/20 text-accent-red'
                        }`}>
                          {feedback.rating.charAt(0).toUpperCase() + feedback.rating.slice(1)}
                        </span>
                        {feedback.partner && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-light/20 rounded-full">
                            <User className="w-3 h-3 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{feedback.partner}</span>
                          </div>
                        )}
                      </div>
                      {feedback.date && (
                        <span className="text-xs text-neutral-500">{feedback.date}</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed">{feedback.comment}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  )
}
