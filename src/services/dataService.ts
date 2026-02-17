// Enhanced Data Service with Reporting Period Filtering
// Supports: 90, 60, 30, 15, 7 days filtering across all metrics
import partnerMappingData from '../../partner_mapping.json';
import engineerProfilesData from '../../engineer_profiles.json';
import dashboardStatsData from '../../dashboard_stats.json';

export type ReportingPeriod = '7' | '15' | '30' | '60' | '90';

export interface EngineerSummary {
  name: string;
  email: string;
  ttl: string;
  total_tickets: number;
  total_billable_hours: number;
  csat_feedback_count: number;
}

export interface CSATComment {
  comment: string;
  rating: string;
  date: string;
  engineer: string;
}

export interface PartnerData {
  engineers: EngineerSummary[];
  ttls: string[];
  engineer_count: number;
  csat_score: number;
  total_csat_responses: number;
  happy_ratings: number;
  csat_comments: CSATComment[];
  contact_emails: string[];
  contact_names: string[];
}

export interface UtilizationRecord {
  date: string;
  billable_hours: number;
  non_billable_hours: number;
  tickets_worked: number;
  tickets_closed: number;
}

export interface CSATFeedback {
  partner: string;
  rating: string;
  comment: string;
  date: string;
}

export interface EngineerProfile {
  name: string;
  email: string;
  ttl: string;
  partners: string[];
  partner_count: number;
  total_billable_hours: number;
  total_tickets_worked: number;
  total_tickets_closed: number;
  days_worked: number;
  avg_tickets_per_day: number;
  avg_utilization_pct: number;
  close_rate: number;
  recent_utilization: UtilizationRecord[];
  csat_feedback: CSATFeedback[];
}

export interface DashboardStats {
  total_partners: number;
  total_engineers: number;
  partners_with_engineers: number;
  engineers_with_partners: number;
  total_csat_responses: number;
  avg_csat_score: number;
  avg_utilization_pct: number;
  total_billable_hours: number;
  total_tickets_worked: number;
  total_tickets_closed: number;
  ticket_close_rate: number;
}

class DataService {
  private partnerMapping: Map<string, PartnerData>;
  private engineerProfiles: Map<string, EngineerProfile>;
  private stats: DashboardStats;

  constructor() {
    this.partnerMapping = new Map(Object.entries(partnerMappingData as Record<string, PartnerData>));
    this.engineerProfiles = new Map(Object.entries(engineerProfilesData as Record<string, EngineerProfile>));
    this.stats = dashboardStatsData as DashboardStats;
  }

  // Helper: Filter data by reporting period
  private filterByPeriod<T extends { date: string }>(
    data: T[],
    period: ReportingPeriod
  ): T[] {
    const days = parseInt(period);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  }

  // Dashboard Stats (period-aware)
  getDashboardStats(period: ReportingPeriod = '90'): DashboardStats {
    // If period is 90, return cached stats
    if (period === '90') {
      return this.stats;
    }

    // Otherwise calculate filtered stats
    const engineers = this.getAllEngineers();
    let totalBillable = 0;
    let totalTicketsWorked = 0;
    let totalTicketsClosed = 0;
    let totalDaysWorked = 0;

    engineers.forEach(({ profile }) => {
      const filteredUtil = this.filterByPeriod(profile.recent_utilization, period);
      filteredUtil.forEach(day => {
        totalBillable += day.billable_hours;
        totalTicketsWorked += day.tickets_worked;
        totalTicketsClosed += day.tickets_closed;
      });
      totalDaysWorked += filteredUtil.length;
    });

    const avgUtil = totalDaysWorked > 0 
      ? (totalBillable / (totalDaysWorked * 8)) * 100 
      : 0;

    const closeRate = totalTicketsWorked > 0
      ? (totalTicketsClosed / totalTicketsWorked) * 100
      : 0;

    return {
      ...this.stats,
      avg_utilization_pct: Math.round(avgUtil * 100) / 100,
      total_billable_hours: Math.round(totalBillable * 100) / 100,
      total_tickets_worked: totalTicketsWorked,
      total_tickets_closed: totalTicketsClosed,
      ticket_close_rate: Math.round(closeRate * 100) / 100
    };
  }

  // Partner Operations
  getAllPartners(): Array<{ name: string; data: PartnerData }> {
    return Array.from(this.partnerMapping.entries()).map(([name, data]) => ({
      name,
      data,
    }));
  }

  getPartner(partnerName: string): PartnerData | undefined {
    return this.partnerMapping.get(partnerName);
  }

  getPartnerWithDetails(partnerName: string, period: ReportingPeriod = '90'): {
    engineerProfiles: EngineerProfile[];
    trends: {
      engineerUtilization: Array<{ name: string; utilization: number }>;
      monthlyTickets: Array<{ month: string; tickets: number }>;
    };
  } & PartnerData | null {
    const partner = this.getPartner(partnerName);
    if (!partner) return null;

    const engineerProfiles = partner.engineers
      .map(eng => this.getEngineer(eng.email))
      .filter((e): e is EngineerProfile => e !== undefined);

    const trends = this.getPartnerTrends(partnerName, period);

    return {
      ...partner,
      engineerProfiles,
      trends
    };
  }

  // Engineer Operations
  getAllEngineers(): Array<{ email: string; profile: EngineerProfile }> {
    return Array.from(this.engineerProfiles.entries()).map(([email, profile]) => ({
      email,
      profile,
    }));
  }

  getEngineer(email: string): EngineerProfile | undefined {
    return this.engineerProfiles.get(email);
  }

  getEngineersByPartner(partnerName: string): EngineerProfile[] {
    const partner = this.getPartner(partnerName);
    if (!partner) return [];

    return partner.engineers
      .map((eng) => this.getEngineer(eng.email))
      .filter((eng): eng is EngineerProfile => eng !== undefined);
  }

  getEngineersByTTL(ttl: string, period: ReportingPeriod = '90'): EngineerProfile[] {
    const engineers = this.getAllEngineers()
      .filter((e) => e.profile.ttl === ttl)
      .map((e) => e.profile);

    // Filter utilization data by period
    return engineers.map(eng => ({
      ...eng,
      recent_utilization: this.filterByPeriod(eng.recent_utilization, period)
    }));
  }

  // TTL Operations
  getAllTTLs(): string[] {
    const ttls = new Set<string>();
    this.engineerProfiles.forEach((profile) => {
      ttls.add(profile.ttl);
    });
    return Array.from(ttls).filter((ttl) => ttl !== 'Unassigned');
  }

  getTTLStats(ttl: string, period: ReportingPeriod = '90'): {
    totalEngineers: number;
    totalTickets: number;
    totalBillableHours: number;
    avgUtilization: number;
    avgCSATScore: number;
    ticketsClosed: number;
    closeRate: number;
  } {
    const engineers = this.getEngineersByTTL(ttl, period);
    
    let totalTickets = 0;
    let totalClosed = 0;
    let totalBillableHours = 0;
    let totalDays = 0;

    engineers.forEach((eng) => {
      eng.recent_utilization.forEach(day => {
        totalTickets += day.tickets_worked;
        totalClosed += day.tickets_closed;
        totalBillableHours += day.billable_hours;
        totalDays += 1;
      });
    });

    const avgUtilization = totalDays > 0
      ? (totalBillableHours / (totalDays * 8)) * 100
      : 0;

    // Calculate avg CSAT from feedback
    let totalCSAT = 0;
    let csatCount = 0;
    engineers.forEach((eng) => {
      const filteredCSAT = this.filterByPeriod(eng.csat_feedback, period);
      filteredCSAT.forEach((feedback) => {
        csatCount++;
        totalCSAT += feedback.rating.toLowerCase() === 'happy' ? 100 : 50;
      });
    });
    const avgCSATScore = csatCount > 0 ? totalCSAT / csatCount : 0;

    const closeRate = totalTickets > 0 ? (totalClosed / totalTickets) * 100 : 0;

    return {
      totalEngineers: engineers.length,
      totalTickets,
      totalBillableHours: Math.round(totalBillableHours * 100) / 100,
      avgUtilization: Math.round(avgUtilization * 10) / 10,
      avgCSATScore: Math.round(avgCSATScore * 10) / 10,
      ticketsClosed: totalClosed,
      closeRate: Math.round(closeRate * 10) / 10
    };
  }

  // Analytics
  getPartnerTrends(partnerName: string, period: ReportingPeriod = '90'): {
    engineerUtilization: Array<{ name: string; utilization: number }>;
    monthlyTickets: Array<{ month: string; tickets: number }>;
  } {
    const engineers = this.getEngineersByPartner(partnerName);
    
    const engineerUtilization = engineers.map((eng) => {
      const filteredUtil = this.filterByPeriod(eng.recent_utilization, period);
      const totalHours = filteredUtil.reduce((sum, day) => sum + day.billable_hours, 0);
      const days = filteredUtil.length;
      const utilization = days > 0 ? (totalHours / (days * 8)) * 100 : 0;

      return {
        name: eng.name,
        utilization: Math.round(utilization * 10) / 10,
      };
    });

    // Aggregate monthly tickets
    const monthlyTickets = engineers
      .flatMap((eng) => this.filterByPeriod(eng.recent_utilization, period))
      .reduce((acc, record) => {
        const month = record.date.substring(0, 7); // YYYY-MM
        const existing = acc.find((m) => m.month === month);
        if (existing) {
          existing.tickets += record.tickets_worked;
        } else {
          acc.push({ month, tickets: record.tickets_worked });
        }
        return acc;
      }, [] as Array<{ month: string; tickets: number }>)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    return { engineerUtilization, monthlyTickets };
  }

  getEngineerTrends(email: string, period: ReportingPeriod = '90'): {
    utilizationTrend: Array<{ date: string; utilization: number; tickets: number }>;
    csatTrend: Array<{ date: string; rating: string; partner: string; comment: string }>;
  } {
    const engineer = this.getEngineer(email);
    if (!engineer) return { utilizationTrend: [], csatTrend: [] };

    const utilizationTrend = this.filterByPeriod(engineer.recent_utilization, period)
      .map((record) => ({
        date: record.date,
        utilization: Math.round((record.billable_hours / 8) * 100 * 10) / 10,
        tickets: record.tickets_worked,
      }));

    const csatTrend = this.filterByPeriod(engineer.csat_feedback, period).map((feedback) => ({
      date: feedback.date,
      rating: feedback.rating,
      partner: feedback.partner,
      comment: feedback.comment,
    }));

    return { utilizationTrend, csatTrend };
  }

  // Top performers (period-aware)
  getTopEngineersByUtilization(limit: number = 10, period: ReportingPeriod = '90'): Array<{
    email: string;
    profile: EngineerProfile;
    periodUtilization: number;
  }> {
    const engineers = this.getAllEngineers();
    
    const withPeriodUtil = engineers.map(({ email, profile }) => {
      const filteredUtil = this.filterByPeriod(profile.recent_utilization, period);
      const totalHours = filteredUtil.reduce((sum, day) => sum + day.billable_hours, 0);
      const days = filteredUtil.length;
      const periodUtilization = days > 0 ? (totalHours / (days * 8)) * 100 : 0;

      return { email, profile, periodUtilization };
    });

    return withPeriodUtil
      .sort((a, b) => b.periodUtilization - a.periodUtilization)
      .slice(0, limit);
  }

  getTopPartnersByEngineers(limit: number = 10): Array<{ name: string; data: PartnerData }> {
    return this.getAllPartners()
      .sort((a, b) => b.data.engineer_count - a.data.engineer_count)
      .slice(0, limit);
  }
}

// Export singleton instance
export const dataService = new DataService();
