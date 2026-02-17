// AI Insights Engine - Professional Data Analysis
// Generates contextual insights based on actual metrics

export interface InsightData {
  type: 'success' | 'warning' | 'info' | 'alert'
  title: string
  description: string
}

export class InsightsEngine {
  // Global Dashboard Insights
  static getGlobalInsights(stats: any): InsightData[] {
    const insights: InsightData[] = []
    const utilization = stats.avg_utilization_pct

    // Utilization Analysis
    if (utilization >= 80) {
      insights.push({
        type: 'success',
        title: 'Strong Organizational Performance',
        description: `Current utilization of ${utilization}% indicates healthy resource allocation. Team capacity is being leveraged effectively across all service lines.`
      })
    } else if (utilization >= 70) {
      insights.push({
        type: 'info',
        title: 'Moderate Utilization Detected',
        description: `At ${utilization}%, there is room for optimization. Consider analyzing workload distribution patterns and identifying underutilized resources.`
      })
    } else {
      insights.push({
        type: 'warning',
        title: 'Utilization Below Target',
        description: `Current ${utilization}% utilization suggests potential capacity issues. Review ticket assignment workflows and resource availability.`
      })
    }

    // Partner Distribution
    if (stats.total_partners > 15) {
      insights.push({
        type: 'info',
        title: 'Diverse Partner Portfolio',
        description: `Managing ${stats.total_partners} partners requires balanced resource allocation. Monitor individual partner metrics to ensure consistent service quality.`
      })
    }

    // Engineer Productivity
    const ticketsPerEngineer = stats.total_tickets_closed / stats.total_engineers
    if (ticketsPerEngineer > 100) {
      insights.push({
        type: 'success',
        title: 'High Ticket Resolution Rate',
        description: `Average of ${Math.round(ticketsPerEngineer)} tickets per engineer demonstrates strong productivity. Maintain current processes while monitoring for potential burnout indicators.`
      })
    }

    // CSAT Analysis
    if (stats.avg_csat_score >= 90) {
      insights.push({
        type: 'success',
        title: 'Excellent Customer Satisfaction',
        description: `CSAT score of ${stats.avg_csat_score}% reflects high service quality. Focus on maintaining consistency across all delivery teams.`
      })
    } else if (stats.avg_csat_score >= 75) {
      insights.push({
        type: 'info',
        title: 'Solid Customer Feedback',
        description: `CSAT at ${stats.avg_csat_score}% is acceptable but has improvement potential. Analyze feedback patterns to identify specific enhancement areas.`
      })
    }

    return insights
  }

  // TTL Dashboard Insights
  static getTTLInsights(ttlStats: any, engineers: any[]): InsightData[] {
    const insights: InsightData[] = []
    const avgUtil = ttlStats.avgUtilization
    const teamSize = ttlStats.totalEngineers

    // Team Performance
    if (avgUtil >= 80) {
      insights.push({
        type: 'success',
        title: 'Team Exceeding Performance Targets',
        description: `Your ${teamSize}-person team is operating at ${avgUtil}% utilization, above the 80% benchmark. This indicates effective workload management and team coordination.`
      })
    } else if (avgUtil >= 70) {
      insights.push({
        type: 'info',
        title: 'Performance Within Range',
        description: `Team utilization at ${avgUtil}% is approaching target. Focus on identifying bottlenecks and optimizing ticket assignment to reach the 80% goal.`
      })
    } else {
      insights.push({
        type: 'warning',
        title: 'Team Utilization Needs Attention',
        description: `Current ${avgUtil}% utilization is below expectations. Consider reviewing individual workloads, skill alignment, and ticket complexity distribution.`
      })
    }

    // Team Distribution Analysis
    const highPerformers = engineers.filter(e => {
      const totalHours = e.recent_utilization.reduce((sum: number, day: any) => sum + day.billable_hours, 0)
      const days = e.recent_utilization.length
      const util = days > 0 ? (totalHours / (days * 8)) * 100 : 0
      return util >= 80
    }).length

    const lowPerformers = engineers.filter(e => {
      const totalHours = e.recent_utilization.reduce((sum: number, day: any) => sum + day.billable_hours, 0)
      const days = e.recent_utilization.length
      const util = days > 0 ? (totalHours / (days * 8)) * 100 : 0
      return util < 60
    }).length

    if (highPerformers > teamSize * 0.6) {
      insights.push({
        type: 'success',
        title: 'Strong Individual Performance',
        description: `${highPerformers} out of ${teamSize} engineers are meeting or exceeding targets. Focus on knowledge transfer from top performers to maintain team excellence.`
      })
    }

    if (lowPerformers > teamSize * 0.3) {
      insights.push({
        type: 'alert',
        title: 'Performance Variance Detected',
        description: `${lowPerformers} team members are underutilized. Conduct one-on-ones to identify blockers, skill gaps, or workload allocation issues.`
      })
    }

    // Partner Distribution
    const partnerCount = ttlStats.totalPartners
    if (partnerCount > 5) {
      insights.push({
        type: 'info',
        title: 'Multi-Partner Coordination',
        description: `Supporting ${partnerCount} partners requires cross-functional awareness. Ensure engineers understand each partner's unique requirements and service expectations.`
      })
    }

    return insights
  }

  // Partner Dashboard Insights
  static getPartnerInsights(partnerData: any): InsightData[] {
    const insights: InsightData[] = []
    const avgUtil = partnerData.avg_utilization_pct
    const engineerCount = partnerData.engineer_count

    // Utilization Pattern
    if (avgUtil >= 80) {
      insights.push({
        type: 'success',
        title: 'Optimal Resource Utilization',
        description: `Partner team is operating at ${avgUtil}% utilization with ${engineerCount} dedicated engineers. This indicates strong demand alignment and efficient resource deployment.`
      })
    } else if (avgUtil >= 65) {
      insights.push({
        type: 'info',
        title: 'Utilization Analysis',
        description: `Current ${avgUtil}% utilization suggests room for optimization. Review ticket velocity and complexity to better match engineer capacity with partner demand.`
      })
    } else {
      insights.push({
        type: 'warning',
        title: 'Resource Utilization Gap',
        description: `At ${avgUtil}%, resources may be underutilized. Consider whether team sizing aligns with current ticket volume or if reassignment would improve efficiency.`
      })
    }

    // Team Size Assessment
    if (engineerCount === 1) {
      insights.push({
        type: 'alert',
        title: 'Single Point of Coverage',
        description: 'Partner is supported by one engineer. This creates coverage risk during absences. Consider cross-training or backup assignment for continuity.'
      })
    } else if (engineerCount >= 5) {
      insights.push({
        type: 'info',
        title: 'Large Support Team',
        description: `${engineerCount} engineers supporting this partner. Ensure clear ownership and communication channels to avoid coordination overhead.`
      })
    }

    // Performance Distribution
    const engineers = partnerData.engineerProfiles
    if (engineers && engineers.length > 0) {
      const utilizations = engineers.map((e: any) => e.avg_utilization_pct)
      const maxUtil = Math.max(...utilizations)
      const minUtil = Math.min(...utilizations)
      const variance = maxUtil - minUtil

      if (variance > 30) {
        insights.push({
          type: 'warning',
          title: 'Uneven Workload Distribution',
          description: `Utilization ranges from ${minUtil}% to ${maxUtil}%. Review ticket assignment logic to ensure balanced workload across the team.`
        })
      }
    }

    // CSAT Performance
    const csatScore = partnerData.csat_score
    if (csatScore >= 90) {
      insights.push({
        type: 'success',
        title: 'Exceptional Service Quality',
        description: `Partner CSAT of ${csatScore}% reflects strong customer satisfaction. Document best practices for replication across other accounts.`
      })
    } else if (csatScore < 75 && csatScore > 0) {
      insights.push({
        type: 'alert',
        title: 'Customer Satisfaction Concern',
        description: `CSAT at ${csatScore}% requires attention. Review recent feedback comments and engage with the partner to understand service gaps.`
      })
    }

    return insights
  }

  // Engineer Dashboard Insights
  static getEngineerInsights(engineerData: any, utilizationTrend: any[]): InsightData[] {
    const insights: InsightData[] = []
    const avgUtil = engineerData.avg_utilization_pct
    const closeRate = engineerData.close_rate

    // Performance Assessment
    if (avgUtil >= 80 && closeRate >= 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Individual Performance',
        description: `Maintaining ${avgUtil}% utilization with ${closeRate}% close rate demonstrates strong productivity and efficiency. You are meeting or exceeding all key performance indicators.`
      })
    } else if (avgUtil >= 80) {
      insights.push({
        type: 'info',
        title: 'High Utilization, Close Rate Opportunity',
        description: `Your ${avgUtil}% utilization is strong, but ${closeRate}% close rate suggests tickets may require more time. Consider if complexity or scope management could improve closure efficiency.`
      })
    } else if (closeRate >= 80) {
      insights.push({
        type: 'info',
        title: 'Efficient Ticket Resolution',
        description: `${closeRate}% close rate is excellent. Current ${avgUtil}% utilization indicates capacity for additional ticket volume or project work.`
      })
    } else {
      insights.push({
        type: 'warning',
        title: 'Performance Below Targets',
        description: `Both utilization (${avgUtil}%) and close rate (${closeRate}%) are below benchmarks. Let's discuss potential blockers or skill development opportunities.`
      })
    }

    // Trend Analysis
    if (utilizationTrend.length >= 5) {
      const recent = utilizationTrend.slice(-5).map(d => d.utilization)
      const increasing = recent.every((val, i) => i === 0 || val >= recent[i - 1])
      const decreasing = recent.every((val, i) => i === 0 || val <= recent[i - 1])

      if (increasing) {
        insights.push({
          type: 'success',
          title: 'Positive Performance Trajectory',
          description: 'Your utilization has been steadily increasing over the recent period. This upward trend indicates improving productivity and workload management.'
        })
      } else if (decreasing) {
        insights.push({
          type: 'warning',
          title: 'Declining Utilization Pattern',
          description: 'Recent trend shows decreasing utilization. This may indicate reduced ticket flow, blockers, or availability issues that should be addressed.'
        })
      }
    }

    // Workload Balance
    const totalTickets = engineerData.total_tickets_worked
    if (totalTickets > 400) {
      insights.push({
        type: 'info',
        title: 'High Ticket Volume',
        description: `Processing ${totalTickets} tickets demonstrates strong workload management. Monitor for signs of burnout and ensure adequate time for complex problem-solving.`
      })
    } else if (totalTickets < 200) {
      insights.push({
        type: 'info',
        title: 'Lower Ticket Volume',
        description: `${totalTickets} tickets may indicate focus on complex issues or project work. Ensure time allocation aligns with partner needs and skill development goals.`
      })
    }

    // Partner Context
    if (engineerData.partner_count > 3) {
      insights.push({
        type: 'info',
        title: 'Multi-Partner Context Switching',
        description: `Supporting ${engineerData.partner_count} partners requires frequent context switching. Consider if consolidation would improve focus and efficiency.`
      })
    }

    return insights
  }

  // Format insight for display
  static formatInsight(insight: InsightData): string {
    return `${insight.title}: ${insight.description}`
  }

  // Get color class based on insight type
  static getInsightColor(type: InsightData['type']): string {
    switch (type) {
      case 'success':
        return 'border-accent-green/30 bg-accent-green/5'
      case 'warning':
        return 'border-accent-yellow/30 bg-accent-yellow/5'
      case 'alert':
        return 'border-accent-red/30 bg-accent-red/5'
      default:
        return 'border-brand-primary/30 bg-brand-primary/5'
    }
  }

  // Get icon color based on insight type
  static getInsightIconColor(type: InsightData['type']): string {
    switch (type) {
      case 'success':
        return 'text-accent-green'
      case 'warning':
        return 'text-accent-yellow'
      case 'alert':
        return 'text-accent-red'
      default:
        return 'text-brand-primary'
    }
  }
}
