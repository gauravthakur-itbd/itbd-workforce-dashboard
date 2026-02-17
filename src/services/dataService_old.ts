// Import the generated JSON data
import partnerMappingData from '../../partner_mapping.json';
import engineerProfilesData from '../../engineer_profiles.json';
import dashboardStatsData from '../../dashboard_stats.json';

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
}

class DataService {
  private partnerMapping: Map<string, PartnerData>;
  private engineerProfiles: Map<string, EngineerProfile>;
  private stats: DashboardStats;

  constructor() {
    // Initialize data from JSON files
    this.partnerMapping = new Map(Object.entries(partnerMappingData as Record<string, PartnerData>));
    this.engineerProfiles = new Map(Object.entries(engineerProfilesData as Record<string, EngineerProfile>));
    this.stats = dashboardStatsData as DashboardStats;
  }

  // Dashboard Stats
  getDashboardStats(): DashboardStats {
    return this.stats;
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

  getTopPartnersByEngineers(limit: number = 10): Array<{ name: string; data: PartnerData }> {
    return this.getAllPartners()
      .sort((a, b) => b.data.engineer_count - a.data.engineer_count)
      .slice(0, limit);
  }

  getTopPartnersByCSAT(limit: number = 10): Array<{ name: string; data: PartnerData }> {
    return this.getAllPartners()
      .filter((p) => p.data.total_csat_responses > 0)
      .sort((a, b) => b.data.csat_score - a.data.csat_score)
      .slice(0, limit);
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

  getTopEngineersByTickets(limit: number = 10): Array<{ email: string; profile: EngineerProfile }> {
    return this.getAllEngineers()
      .sort((a, b) => b.profile.total_tickets_worked - a.profile.total_tickets_worked)
      .slice(0, limit);
  }

  getTopEngineersByUtilization(limit: number = 10): Array<{ email: string; profile: EngineerProfile }> {
    return this.getAllEngineers()
      .sort((a, b) => b.profile.avg_utilization_pct - a.profile.avg_utilization_pct)
      .slice(0, limit);
  }

  getEngineersByTTL(ttl: string): EngineerProfile[] {
    return this.getAllEngineers()
      .filter((e) => e.profile.ttl === ttl)
      .map((e) => e.profile);
  }

  // TTL Operations
  getAllTTLs(): string[] {
    const ttls = new Set<string>();
    this.engineerProfiles.forEach((profile) => {
      ttls.add(profile.ttl);
    });
    return Array.from(ttls).filter((ttl) => ttl !== 'Unassigned');
  }

  getTTLStats(ttl: string): {
    totalEngineers: number;
    totalTickets: number;
    totalBillableHours: number;
    avgUtilization: number;
    avgCSATScore: number;
  } {
    const engineers = this.getEngineersByTTL(ttl);
    
    const totalTickets = engineers.reduce((sum, eng) => sum + eng.total_tickets_worked, 0);
    const totalBillableHours = engineers.reduce((sum, eng) => sum + eng.total_billable_hours, 0);
    const avgUtilization = engineers.reduce((sum, eng) => sum + eng.avg_utilization_pct, 0) / Math.max(engineers.length, 1);
    
    // Calculate avg CSAT from feedback
    let totalCSAT = 0;
    let csatCount = 0;
    engineers.forEach((eng) => {
      eng.csat_feedback.forEach((feedback) => {
        csatCount++;
        totalCSAT += feedback.rating.toLowerCase() === 'happy' ? 100 : 50;
      });
    });
    const avgCSATScore = csatCount > 0 ? totalCSAT / csatCount : 0;

    return {
      totalEngineers: engineers.length,
      totalTickets,
      totalBillableHours: Math.round(totalBillableHours * 100) / 100,
      avgUtilization: Math.round(avgUtilization * 10) / 10,
      avgCSATScore: Math.round(avgCSATScore * 10) / 10,
    };
  }

  // Analytics
  getPartnerTrends(partnerName: string): {
    engineerUtilization: Array<{ name: string; utilization: number }>;
    monthlyTickets: Array<{ month: string; tickets: number }>;
  } {
    const engineers = this.getEngineersByPartner(partnerName);
    
    const engineerUtilization = engineers.map((eng) => ({
      name: eng.name,
      utilization: eng.avg_utilization_pct,
    }));

    // Aggregate monthly tickets (simplified for now)
    const monthlyTickets = engineers
      .flatMap((eng) => eng.recent_utilization)
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

  getEngineerTrends(email: string): {
    utilizationTrend: Array<{ date: string; utilization: number; tickets: number }>;
    csatTrend: Array<{ date: string; rating: string; partner: string }>;
  } {
    const engineer = this.getEngineer(email);
    if (!engineer) return { utilizationTrend: [], csatTrend: [] };

    const utilizationTrend = engineer.recent_utilization
      .map((record) => ({
        date: record.date,
        utilization: ((record.billable_hours / 8) * 100),
        tickets: record.tickets_worked,
      }))
      .slice(-30); // Last 30 days

    const csatTrend = engineer.csat_feedback.map((feedback) => ({
      date: feedback.date,
      rating: feedback.rating,
      partner: feedback.partner,
    }));

    return { utilizationTrend, csatTrend };
  }
}

// Export singleton instance
export const dataService = new DataService();
