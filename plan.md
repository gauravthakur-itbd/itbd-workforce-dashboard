# Strategic Implementation Plan: IT By Design Analytics Dashboard System

## 1. Executive Summary

### 1.1 Data Overview
The analytics system integrates two primary data sources:

**MDE Utilization Dataset (Form1 sheet):**
- **Volume:** 23,577 daily engineer activity records
- **Time Range:** February 1, 2023 to February 16, 2026 (3+ years)
- **Granularity:** Daily engineer-level entries
- **Coverage:** 157 unique engineers across 18 reporting managers (TDLs)
- **Partner Visibility:** Only 127 records (0.5%) have partner attribution in `Partner Name1` field
- **Key Limitation:** 99.5% of utilization data lacks partner-level attribution

**CSAT Survey Dataset (CSAT_Review sheet):**
- **Volume:** 474 customer satisfaction surveys
- **Time Range:** November 20, 2025 to February 16, 2026 (~3 months)
- **Coverage:** 69 unique partner companies
- **Satisfaction Distribution:** 95.36% Happy, 4.01% Okay, 0.63% Unhappy
- **Attribution:** 4 team members tracked (unassigned, Kip Singh, Brian Rodelas, Kris Bhattacharjee)

### 1.2 Critical Data Challenge
**Only 8 partners exist in both datasets:**
1. Acrisure Cyber Services
2. Deerwood Technologies Inc
3. Innovative Technology Solutions
4. NTi Networks
5. Proda Technology
6. SERVICAD
7. Summit Business Technologies
8. Thinksocially LLC

**Impact:** The dashboard can only meaningfully correlate CSAT with utilization for these 8 partners, representing <1% of utilization records and 11.6% of CSAT partners.

### 1.3 Analytical Opportunities

**Achievable with Current Data:**
- Engineer-level productivity and utilization trends (157 engineers, 3+ years of history)
- TDL (Team Lead) performance comparison across 18 managers
- Individual engineer workload patterns, ticket handling efficiency
- Time-based utilization trends (daily, weekly, monthly, quarterly)
- CSAT analysis for 69 partners with sentiment tracking
- Correlation analysis for the 8 overlapping partners only
- Risk identification: engineers with declining metrics, tickets >7 days aging

**Limited by Data Quality:**
- **Partner-level utilization analysis:** Only possible for 127 records out of 23,577
- **Comprehensive CSAT-to-Utilization correlation:** Constrained to 8 partners
- **Company/Account-wise drill-down:** Requires partner attribution enrichment
- **Partner capacity planning:** Not viable without complete partner mapping

### 1.4 Strategic Recommendations

**Immediate Actions Required:**
1. **Data Enrichment Initiative:** Backfill partner attribution to the 23,450 MDE records missing `Partner Name1`
2. **Partner Name Standardization:** Resolve naming inconsistencies (e.g., "ITSolutions Inc" vs "ITSolutions Inc/Chips Technology Group")
3. **Establish Data Governance:** Mandate partner attribution in daily utilization submissions
4. **Define Utilization Formula:** Clarify the calculation methodology for utilization percentage

**Dashboard Phasing Strategy:**
- **Phase 1:** Launch engineer-focused and TDL-focused analytics (fully supported by data)
- **Phase 2:** Limited partner analytics for the 8 overlapping partners
- **Phase 3:** Full partner analytics post-data enrichment

---

## 2. Data Understanding & Structure

### 2.1 Identified Entities

#### Primary Entities

**Engineer (Person)**
- **Source:** MDE `Name` column (157 unique engineers)
- **Identifiers:** Name, Email (e.g., "Kanav.Gandotra@itbd.net")
- **Attributes:** Reporting Manager (TDL), historical activity patterns
- **Granularity:** Individual contributor level
- **Data Volume:** Multiple daily entries per engineer over 3+ years

**TDL (Team Lead / Reporting Manager)**
- **Source:** MDE `Reporting Manager` column (18 unique TDLs)
- **Top TDLs by team size:** Kawandeep (6,464 records), Manish (4,822), Gunjan (3,444), Gagan (3,145)
- **Role:** Direct line manager, accountability for engineer performance
- **Hierarchy:** Single-level reporting structure observed

**Partner (Customer/Account)**
- **CSAT Source:** `Company` column (69 unique partners)
- **MDE Source:** `Partner Name1` column (13 unique partners, 127 records only)
- **Challenge:** Severe data incompleteness and naming inconsistencies
- **Examples of Naming Variations:**
  - "ITSolutions Inc" (CSAT) vs "ITSolutions Inc/Chips Technology Group" (MDE)
  - "True North ITG Inc" (CSAT) vs "TrueNorth" (MDE)

**Time (Date)**
- **MDE Granularity:** Daily (`Date` column: 2023-02-01 to 2026-02-16)
- **CSAT Granularity:** Timestamp (`Date_Parsed`: 2025-11-20 to 2026-02-16)
- **Time Dimensions Needed:** Day, Week, Month, Quarter, Year, Day of Week, Weekday/Weekend flag

#### Fact Entities

**Daily Engineer Activity (Utilization Fact)**
- **Grain:** One row per engineer per day
- **Source:** MDE Form1 sheet
- **Measures:**
  - `Billable Hours` (object type, needs conversion to numeric)
  - `Non Billable Hours (Excluding Admin & Break)` (object type)
  - `Only Admin time without break` (object type, 39.7% missing)
  - `No. Tickets Worked` (object type, needs conversion)
  - `No. New/Dispatched Tickets` (object type, 33.9% missing)
  - `No. Tickets Closed` (object type)
  - `Tickets>7 Days` (string with numeric values + anomalies like "Board Management")
- **Data Quality Issues:**
  - Numeric fields stored as text objects
  - Missing value rates: 0.2% (billable hours) to 39.7% (admin time)
  - Partner attribution missing in 99.5% of records

**CSAT Response (Survey Fact)**
- **Grain:** One row per survey response
- **Source:** CSAT_Review sheet
- **Measures:**
  - `Rating` (categorical: Happy/Okay/Unhappy)
  - `Comments` (text, 61.6% missing)
  - `Tags` (multi-value: Helpfulness, Knowledge, Time to Resolution, Time to Response)
  - `Ticket ID`, `Ticket Type`, `Ticket Name`
- **Dimensions:** Company, Contact, Team Member, Date
- **Aggregated Summary:** CSAT_Key_Indicator sheet provides rollup metrics (single-row summary)

### 2.2 Relationships Between Sheets

#### Within MDE File
- **Form1 → Engineers:** Many daily records per engineer (1:M)
- **Form1 → TDLs:** Many engineers per TDL (M:1)
- **Form1 → Partners:** Sparse relationship (only 127 records have partner data)
- **Sheet1 and _56F9DC9755BA473782653E2940F9:** Empty/irrelevant sheets

#### Within CSAT File
- **CSAT_Review → CSAT_Key_Indicator:** Detail-to-summary relationship (474:1)
- **CSAT_Review → Companies:** Many surveys per company (M:1)
- **CSAT_Review → Team Members:** Survey distributed across 4 team members + "unassigned"

#### Cross-File Relationships
- **MDE Engineer ↔ CSAT Company:** 
  - **Intended:** Engineer daily activity should link to partner satisfaction
  - **Reality:** Only 8 partners mappable, covering 127 MDE records
  - **Constraint:** Correlation analysis severely limited by data sparsity
  
- **Date Alignment:**
  - **Overlap Period:** November 20, 2025 to February 16, 2026 (~3 months)
  - **MDE Historical Depth:** 3+ years enables trend analysis
  - **CSAT Limited History:** Only 3 months of survey data

### 2.3 Observed Data Quality Concerns

#### Critical Issues

1. **Partner Attribution Gap (Severity: CRITICAL)**
   - 99.5% of MDE utilization records lack partner assignment
   - Prevents account-level utilization analysis
   - Blocks meaningful CSAT-utilization correlation
   - **Remediation:** Requires operational process change + data backfill project

2. **Data Type Mismatches (Severity: HIGH)**
   - Numeric fields stored as text: `Billable Hours`, `No. Tickets Worked`, etc.
   - Causes: Invalid entries, mixed data types, formula errors
   - **Examples:** "Board Management" in `Tickets>7 Days` numeric field
   - **Impact:** ETL must handle type conversion and cleaning

3. **Naming Inconsistencies (Severity: HIGH)**
   - Partner names differ between CSAT and MDE
   - No standard company identifier (need matching algorithm)
   - **Examples:** 
     - "Deerwood Technologies Inc" (CSAT) vs "Deerwood Technologies Inc" (MDE) ✓ Match
     - "ITSolutions Inc" (CSAT) vs "ITSolutions Inc/Chips Technology Group" (MDE) ✗ Mismatch

4. **High Missing Value Rates (Severity: MEDIUM)**
   - `Only Admin time without break`: 39.7% missing
   - `No. New/Dispatched Tickets`: 33.9% missing
   - `CSAT Comments`: 61.6% missing
   - **Impact:** Metrics relying on these fields need "data available" flags

#### Moderate Issues

5. **CSAT Temporal Limitations (Severity: MEDIUM)**
   - Only 3 months of CSAT history vs 3+ years MDE history
   - Prevents long-term satisfaction trend analysis
   - Limits time-series modeling capabilities

6. **Unused Fields (Severity: LOW)**
   - `Manager`, `Departments` in CSAT: 100% missing (474/474)
   - `Column1`, `Partner Name`, `Question` in MDE: 100% missing
   - **Action:** Exclude from data model

7. **Multi-Value Fields (Severity: LOW)**
   - `Tags` in CSAT contains comma-separated values
   - Requires parsing for dimensional analysis

### 2.4 Assumptions Needed

#### Data Interpretation Assumptions

1. **Utilization Calculation:**
   - **Assumption:** Utilization % = Billable Hours / (Billable Hours + Non-Billable Hours + Admin Time)
   - **Alternative:** Utilization % = Billable Hours / Standard Work Hours (8 or 9 hours/day)
   - **Decision Required:** Confirm with business stakeholders

2. **Work Day Definition:**
   - **Assumption:** Standard work day = 8 hours
   - **Implication:** Total hours >8 indicate overtime; <8 indicate partial day/PTO

3. **Partner Attribution:**
   - **Assumption:** Missing `Partner Name1` indicates unassigned/internal work, not data entry errors
   - **Alternative:** Missing data represents data quality issues requiring correction
   - **Decision Required:** Validate with operations team

4. **CSAT Rating Mapping:**
   - **Happy:** Positive sentiment (score: 3 or 100%)
   - **Okay:** Neutral sentiment (score: 2 or 50%)
   - **Unhappy:** Negative sentiment (score: 1 or 0%)
   - **Net CSAT Formula:** (Happy - Unhappy) / Total Reviews × 100

5. **Ticket Aging:**
   - **Assumption:** `Tickets>7 Days` represents count of open tickets aged beyond 7 days
   - **Business Rule:** Higher counts indicate backlog/capacity issues

#### Technical Assumptions

6. **Engineer Identity:**
   - **Assumption:** `Name` + `Email` uniquely identifies an engineer
   - **Risk:** Name changes (marriage, legal name change) not tracked

7. **Date Grain:**
   - **Assumption:** One MDE submission per engineer per day
   - **Observed:** Some duplicate dates (need deduplication logic)

8. **TDL Stability:**
   - **Assumption:** Engineer-to-TDL mapping is relatively stable
   - **Reality Check:** Use most recent `Reporting Manager` value for current state

---

## 3. Data Modeling Strategy

### 3.1 Recommended Logical Data Model

#### Star Schema Design

**Fact Tables:**

**Fact_Utilization** (Daily engineer activity)
- **Grain:** One row per engineer per day per partner (where applicable)
- **Keys:** DateKey (FK), EngineerKey (FK), TDLKey (FK), PartnerKey (FK, nullable)
- **Measures:**
  - BillableHours (DECIMAL)
  - NonBillableHours (DECIMAL)
  - AdminHours (DECIMAL, nullable)
  - TotalHours (CALCULATED)
  - UtilizationPercent (CALCULATED)
  - TicketsWorked (INT)
  - TicketsNew (INT, nullable)
  - TicketsClosed (INT)
  - TicketsAgedOver7Days (INT)
  - ClosureRate (CALCULATED: TicketsClosed / TicketsWorked)
- **Row Count:** ~23,577 (current), growing daily
- **Partitioning Strategy:** Partition by Year-Month for query performance

**Fact_CSAT** (Survey responses)
- **Grain:** One row per survey response
- **Keys:** DateKey (FK), PartnerKey (FK), TeamMemberKey (FK), TicketKey (FK)
- **Measures:**
  - RatingScore (INT: 3=Happy, 2=Okay, 1=Unhappy)
  - RatingCategory (VARCHAR: Happy/Okay/Unhappy)
  - HasComment (BOOLEAN)
  - CommentSentiment (TEXT, for AI analysis)
  - TagHelpfulness (BOOLEAN)
  - TagKnowledge (BOOLEAN)
  - TagTimeToResolution (BOOLEAN)
  - TagTimeToResponse (BOOLEAN)
- **Row Count:** ~474 (current), growing monthly
- **Derived Metrics:**
  - NetCSATScore (calculated at aggregate level)
  - ResponseRate (requires survey send data, not available)

**Dimension Tables:**

**Dim_Date** (Date dimension)
- **Grain:** One row per day
- **Keys:** DateKey (PK: YYYYMMDD integer)
- **Attributes:**
  - FullDate, Year, Quarter, Month, MonthName, Week, DayOfWeek, DayName
  - IsWeekday, IsWeekend, FiscalYear, FiscalQuarter, FiscalMonth
  - RelativePeriods: IsToday, IsYesterday, IsCurrentWeek, IsCurrentMonth, etc.
- **Range:** 2023-02-01 to at least 2027-12-31
- **Row Count:** ~1,800 rows

**Dim_Engineer** (Engineer master)
- **Grain:** One row per unique engineer
- **Keys:** EngineerKey (PK, surrogate), Email (natural key)
- **Attributes:**
  - EngineerName, EngineerEmail
  - CurrentTDL (denormalized for convenience)
  - FirstActivityDate, LastActivityDate
  - IsActive (derived: LastActivityDate within 30 days)
  - EngineerTenureDays (calculated)
- **Row Count:** 157 (current)
- **SCD Type:** Type 1 (overwrite) for simple dashboard; Type 2 if TDL history tracking required

**Dim_TDL** (Team Lead / Reporting Manager)
- **Grain:** One row per TDL
- **Keys:** TDLKey (PK, surrogate), TDLName (natural key)
- **Attributes:**
  - TDLName, TDLLevel (if hierarchy exists), Region (if applicable)
  - TeamSizeActive (calculated: count of active engineers)
  - AverageTeamUtilization (calculated)
- **Row Count:** 18 (current)

**Dim_Partner** (Customer/Account master)
- **Grain:** One row per unique partner
- **Keys:** PartnerKey (PK, surrogate), PartnerNameStandardized (natural key)
- **Attributes:**
  - PartnerNameStandardized (cleaned, deduplicated)
  - PartnerNameVariants (array: store all observed name variations)
  - PartnerSource (CSAT, MDE, or BOTH)
  - HasUtilizationData (BOOLEAN)
  - HasCSATData (BOOLEAN)
  - FirstCSATDate, LastCSATDate
  - Industry, Region, AccountManager (if available)
- **Row Count:** ~69 CSAT + 13 MDE = ~75 unique (after deduplication)
- **Critical Logic:** Fuzzy matching algorithm to consolidate name variations

**Dim_TeamMember** (CSAT team members)
- **Grain:** One row per CSAT team member
- **Keys:** TeamMemberKey (PK)
- **Attributes:** TeamMemberName
- **Row Count:** 4 + "unassigned"

**Bridge Tables (if needed):**

**Bridge_Engineer_Partner** (Many-to-Many relationship)
- Maps engineers to partners they work with
- Derived from Fact_Utilization where PartnerKey IS NOT NULL
- Enables "Which engineers serve Partner X?" queries

### 3.2 Utilization Calculation Methodology

#### Proposed Formula Options

**Option A: Capacity-Based Utilization (Recommended)**
```
Utilization % = Billable Hours / Standard Daily Hours (8)
```
- **Pros:** Simple, industry-standard, enables overtime detection
- **Cons:** Does not account for actual time logged (may exceed 100%)

**Option B: Actual Time-Based Utilization**
```
Total Logged Hours = Billable Hours + Non-Billable Hours + Admin Hours
Utilization % = Billable Hours / Total Logged Hours
```
- **Pros:** Reflects actual time allocation
- **Cons:** Penalizes engineers with high admin burden; denominator varies

**Option C: Available Time-Based Utilization**
```
Available Hours = Standard Daily Hours (8) - Admin Hours - Break Time
Utilization % = Billable Hours / Available Hours
```
- **Pros:** Fair comparison across engineers with different admin loads
- **Cons:** Requires complete admin time data (currently 39.7% missing)

**Recommended Hybrid Approach:**
- Calculate all three utilization types
- Primary metric: **Option A** (capacity-based) for consistency
- Secondary metric: **Option B** (actual time-based) for operational analysis
- Flag records where Total Logged Hours > 10 (data quality issue or overtime)

#### Handling Edge Cases

1. **Missing Billable Hours:** Exclude from utilization calculation, flag as "No Data"
2. **Billable Hours > 10:** Flag as potential data entry error or extreme overtime
3. **Billable Hours = 0 and Non-Billable Hours > 0:** Utilization = 0%, categorize as "Training/Admin Day"
4. **All time fields = 0:** Categorize as "PTO/Leave/No Submission"

### 3.3 CSAT Aggregation Strategy

#### Partner-Level CSAT Metrics

**Net CSAT Score (Primary Metric):**
```
Net CSAT % = (Happy Count - Unhappy Count) / Total Reviews × 100
```
- Range: -100% to +100%
- Current overall: 95.36% (very high)

**CSAT Distribution:**
```
Happy % = Happy Count / Total Reviews × 100
Okay % = Okay Count / Total Reviews × 100
Unhappy % = Unhappy Count / Total Reviews × 100
```

**Weighted CSAT Score:**
```
Weighted Score = (Happy × 3 + Okay × 2 + Unhappy × 1) / (Total Reviews × 3) × 100
```
- Range: 0% to 100%
- Provides more granularity than binary Happy/Unhappy

#### Time-Based Aggregations

- **Monthly CSAT:** Net CSAT per partner per month
- **Rolling 30-Day CSAT:** Moving average for trend smoothing
- **YoY Comparison:** Month-over-month and year-over-year changes (when more data available)

#### Tag-Based Analysis

Extract and count CSAT tags:
- Helpfulness score (% of reviews mentioning helpfulness)
- Knowledge score
- Time to Resolution score
- Time to Response score

**Tag Correlation Matrix:**
- Identify which tag combinations correlate with Unhappy ratings
- Example: "Low Time to Response + Low Helpfulness → High Unhappy Risk"

#### Survey Volume Metrics

- **Response Count:** Track survey volume per partner (sample size indicator)
- **Confidence Interval:** Calculate statistical confidence based on sample size
  - Partners with <10 reviews: Flag as "Insufficient Sample Size"
  - Partners with ≥30 reviews: High confidence

### 3.4 Filtering Logic & Hierarchy

#### Drill-Down Hierarchy

**Level 1: Global Dashboard**
- **Scope:** All engineers, all partners, all TDLs
- **Metrics:** Company-wide utilization, total CSAT, headcount trends
- **Filters:** Date range, TDL, partner (multi-select)

**Level 2: TDL Dashboard**
- **Scope:** Selected TDL's team
- **Metrics:** Team utilization, engineer count, ticket volume, CSAT for assigned partners
- **Drill-Down:** Click TDL → See team details
- **Filters:** Date range, engineer, partner

**Level 3: Partner Dashboard**
- **Scope:** Selected partner
- **Metrics:** Partner-specific utilization (if data available), CSAT history, assigned engineers
- **Drill-Down:** Click partner → See engineers serving this partner
- **Filters:** Date range, engineer, TDL
- **Constraint:** Only meaningful for partners with utilization data (8-13 partners)

**Level 4: Engineer Dashboard**
- **Scope:** Individual engineer
- **Metrics:** Personal utilization trend, ticket metrics, CSAT feedback (if linked)
- **Drill-Down:** Click engineer → See daily activity, partner breakdown
- **Filters:** Date range, partner

#### Cross-Filter Logic

- **TDL ↔ Engineer:** Selecting TDL filters to their engineers
- **Partner ↔ Engineer:** Selecting partner filters to engineers with that partner assignment (limited data)
- **Date Range:** Global filter affects all visuals
- **Multi-Select Partners:** OR logic (show data for any selected partner)

#### Data Availability Indicators

- **Gray Out** visuals when insufficient data (e.g., partner utilization for partners without MDE data)
- **Show Warning:** "Partner utilization data not available for this account"
- **Data Completeness Bar:** Visual indicator of % records with partner attribution

### 3.5 Partner Mapping Strategy

#### Phase 1: Exact Match
- Normalize partner names: trim whitespace, lowercase, remove punctuation
- Exact match after normalization
- **Expected Yield:** 8 partners

#### Phase 2: Fuzzy Matching
- Use Levenshtein distance or Jaro-Winkler similarity
- Threshold: 85% similarity
- Manual review of suggested matches
- **Examples to Match:**
  - "True North ITG Inc" ↔ "TrueNorth" (likely match)
  - "ITSolutions (Umbrella Managed Systems)" ↔ "Umbrella Managed Systems Inc" (likely same)

#### Phase 3: Manual Mapping Table
- Create `Partner_Mapping` table:
  - CSAT_CompanyName, MDE_PartnerName, StandardizedName, ConfidenceScore
- Human review and confirmation
- **Governance:** Quarterly review to add new partners

#### Phase 4: Operational Fix
- Mandate partner selection from standardized dropdown in MDE form
- Backfill historical data through engineer surveys or ticket system analysis

---

## 4. Metric Strategy (High-Level)

### 4.1 Core Metric Categories

#### Utilization Metrics

**Individual Utilization:**
- Engineer-level utilization percentage (daily, weekly, monthly averages)
- Utilization trend (up/down/stable over time)
- Utilization percentile ranking within team
- Billable vs non-billable hour distribution

**Team Utilization:**
- TDL-level average utilization
- Team utilization variance (standard deviation)
- Top/bottom performers within team
- Utilization distribution histogram

**Company-Wide Utilization:**
- Overall average utilization
- Utilization by TDL (comparison view)
- Historical utilization trend (monthly, quarterly)
- Utilization forecast (linear regression or time-series model)

**Utilization Bands:**
- Under-Utilized: <60%
- Target Zone: 60-80%
- Over-Utilized: 80-95%
- Burnout Risk: >95%

#### Capacity Metrics

**Current Capacity:**
- Total available engineer hours (headcount × 8 hours × working days)
- Total billable hours delivered
- Remaining capacity (available - billable)

**Capacity Planning:**
- Headcount trend (active engineers over time)
- New hire ramp-up analysis (utilization curve for engineers in first 90 days)
- Attrition impact (lost capacity when engineers leave)

**Partner Capacity Allocation:**
- Hours allocated per partner (for partners with data)
- Top partners by hour consumption
- Partner concentration risk (% of hours to top 5 partners)

**Demand Forecasting:**
- Ticket volume trend (leading indicator of capacity needs)
- Seasonality detection (do certain months have higher demand?)
- Capacity shortfall prediction

#### Partner Performance Metrics

**Partner Utilization Profile:**
- Hours consumed per partner (billable + non-billable)
- Average engineer count per partner
- Partner utilization stability (consistent vs spiky demand)

**Partner Efficiency:**
- Tickets closed per hour (partner-level productivity)
- Average resolution time (derived from ticket data if timestamps available)
- Ticket aging (% of tickets >7 days for this partner)

**Partner Engagement:**
- Number of unique engineers serving partner
- Engineer turnover for partner (how many engineers rotated off?)
- Longest-serving engineer for partner (relationship stability)

#### CSAT Metrics

**Overall CSAT:**
- Net CSAT score (company-wide)
- CSAT distribution (Happy/Okay/Unhappy percentages)
- CSAT trend over time (monthly)
- CSAT volume (survey count)

**Partner CSAT:**
- Partner-level Net CSAT
- CSAT rank (top 10 and bottom 10 partners)
- CSAT change vs prior period
- CSAT volatility (standard deviation of ratings)

**Tag-Based CSAT:**
- Helpfulness score by partner/engineer
- Knowledge score
- Time to Resolution score
- Time to Response score
- Tag combination analysis (which tags co-occur with Unhappy?)

**Survey Engagement:**
- Response rate (if send data available)
- Comment rate (% surveys with written feedback)
- Comment sentiment (AI-powered analysis)

#### Risk Indicators

**Engineer Burnout Risk:**
- Utilization >95% for 4+ consecutive weeks
- Total hours >10/day consistently
- Ticket load >20/day consistently
- CSAT declining trend for engineer (if linkable)

**Partner At-Risk:**
- CSAT declining trend (3-month slope negative)
- Unhappy rating received in last 30 days
- High ticket aging (>50% tickets older than 7 days)
- Reduced CSAT survey participation (drop in response volume)

**Capacity Shortfall Risk:**
- Utilization >85% company-wide for 2+ months
- Ticket backlog growing (TicketsWorked > TicketsClosed trend)
- New ticket rate increasing faster than closure rate

**Data Quality Risk:**
- Partner attribution missing rate >95% (flag for operational fix)
- High missing value rate in critical fields
- Outliers: engineers with 0 billable hours for extended periods

#### Efficiency Indicators

**Ticket Throughput:**
- Tickets closed per engineer per day
- Closure rate (TicketsClosed / TicketsWorked)
- Average tickets closed per billable hour
- Ticket backlog trend (TicketsWorked - TicketsClosed cumulative)

**Time Allocation Efficiency:**
- Admin time percentage (Admin / Total Hours)
- Non-billable time percentage
- Ratio of billable to non-billable hours

**TDL Efficiency:**
- Team average utilization (TDL comparison)
- Team ticket throughput (TDL comparison)
- Team CSAT (TDL comparison, for teams with partner assignments)

**New Ticket Handling:**
- New/Dispatched ticket rate
- Time from dispatch to first action (if timestamps available)
- Dispatch abandonment rate (dispatched but not worked)

#### AI-Derived Insights Possibilities

**Anomaly Detection:**
- Sudden utilization drops (illness, disengagement, data entry gap)
- Sudden utilization spikes (unsustainable pace)
- Ticket volume anomalies (unusual spike or drop for engineer)
- CSAT outliers (unexpected Unhappy rating for high-performer)

**Trend Forecasting:**
- Predict next month's utilization per engineer
- Predict CSAT direction (improving/declining)
- Predict capacity shortfall date (when will we exceed 90% utilization?)

**Correlation Analysis:**
- Does high utilization correlate with lower CSAT? (test hypothesis)
- Does ticket aging correlate with Unhappy ratings?
- Does engineer tenure correlate with CSAT scores?
- Does team size correlate with TDL effectiveness?

**Segmentation:**
- Cluster engineers into performance personas (high-utilization/high-CSAT, low-utilization/low-CSAT, etc.)
- Cluster partners into engagement tiers (high-touch, low-maintenance, at-risk)
- Identify similar engineers for peer benchmarking

**Root Cause Analysis:**
- For partners with declining CSAT, identify contributing factors (engineer changes, utilization drop, ticket aging)
- For engineers with declining utilization, identify patterns (specific partners, time periods)

**Predictive Alerts:**
- "Engineer X is on track to exceed 95% utilization next month"
- "Partner Y's CSAT is declining; risk of Unhappy rating in next survey"
- "Team Z has insufficient capacity to maintain service levels"

**Narrative Generation:**
- Auto-generate executive summary: "This month, overall utilization was 78%, up 3% from last month. Top performer: Engineer A (92% utilization, 15 tickets closed). At-risk partner: Partner B (CSAT dropped to 60%)."
- TDL performance summary: "Kawandeep's team averaged 82% utilization with 12% ticket aging. Gagan's team averaged 75% utilization with 8% aging."

**Sentiment Analysis:**
- Extract keywords from CSAT comments
- Identify common themes in Unhappy feedback
- Track sentiment score over time per partner

---

## 5. Dashboard Architecture Strategy

### 5.1 Global vs Drilldown Logic

#### Global Dashboard (Home Page)

**Purpose:** Executive overview of company-wide performance

**Key Visuals:**
- KPI Cards: Overall Utilization %, Total Engineers, Total Partners, Net CSAT Score, Tickets Closed This Month
- Utilization Trend Line: Monthly average utilization over 3 years
- TDL Comparison Bar Chart: Average utilization by TDL
- CSAT Trend Line: Monthly Net CSAT over available period
- Ticket Volume Area Chart: TicketsWorked, TicketsClosed, Tickets>7Days over time
- Engineer Headcount Trend: Active engineer count over time
- Top 10 Partners by Hours Consumed (if partner data available)
- Bottom 10 Partners by CSAT

**Filters:**
- Date Range (preset: Last 30 Days, Last 90 Days, Last 12 Months, All Time)
- TDL (multi-select)
- Partner (multi-select, limited by data availability)

**Drill-Down Actions:**
- Click TDL → Navigate to TDL Dashboard
- Click Partner → Navigate to Partner Dashboard
- Click Metric → See supporting detail (e.g., click "Utilization 78%" → See engineer-level breakdown)

#### TDL Dashboard

**Purpose:** Team lead performance and team management

**Scope:** Selected TDL's direct reports

**Key Visuals:**
- TDL KPI Cards: Team Size, Avg Team Utilization, Team Tickets Closed, Team CSAT (if applicable)
- Engineer Performance Table: Name, Utilization %, Tickets Closed, Tickets >7 Days, CSAT (if linked)
- Utilization Distribution Histogram: Show how many engineers in each utilization band
- Individual Engineer Trend: Small multiples of utilization trends for each team member
- Ticket Aging Heatmap: Engineer × Week, color by ticket aging severity
- Top/Bottom Performers: Highlight highest and lowest utilization engineers

**Filters:**
- Date Range
- Engineer (multi-select within team)
- Partner (if applicable)

**Drill-Down Actions:**
- Click Engineer → Navigate to Engineer Dashboard
- Click Partner → Navigate to Partner Dashboard (filtered to this TDL's team)

#### Partner Dashboard

**Purpose:** Account-level view of service delivery and satisfaction

**Scope:** Selected partner

**Key Visuals:**
- Partner KPI Cards: Total Hours Consumed, Assigned Engineers, Net CSAT, Last Survey Date
- Utilization Trend: Hours allocated to this partner over time
- CSAT History: Monthly CSAT scores for this partner
- Assigned Engineers Table: Name, Hours Worked for Partner, Tickets Closed, CSAT Rating (if available)
- Tag Analysis: Breakdown of CSAT tags (Helpfulness, Knowledge, etc.)
- Recent CSAT Comments: Display recent survey comments (with sentiment indicator)
- Ticket Aging: Count of tickets >7 days for this partner

**Constraint Handling:**
- If partner lacks MDE utilization data, show message: "Utilization tracking not available for this partner. Displaying CSAT data only."
- If partner lacks CSAT data, show message: "CSAT data not available for this partner. Displaying utilization data only."
- If partner in both datasets, show full correlation analysis

**Filters:**
- Date Range
- Engineer (multi-select from assigned engineers)

**Drill-Down Actions:**
- Click Engineer → Navigate to Engineer Dashboard (filtered to this partner)

#### Engineer Dashboard

**Purpose:** Individual contributor performance tracking

**Scope:** Selected engineer

**Key Visuals:**
- Engineer KPI Cards: Current Utilization %, Tickets Closed This Month, Avg Tickets/Day, CSAT (if available)
- Utilization Trend Line: Daily or weekly utilization over time
- Ticket Metrics Table: Tickets Worked, Closed, Aged >7 Days by week
- Partner Breakdown: Hours by partner (if data available)
- Time Allocation Pie Chart: Billable vs Non-Billable vs Admin
- Performance Benchmarking: Engineer's metrics vs team average vs company average
- CSAT Feedback: If linked, show survey responses related to this engineer

**Filters:**
- Date Range
- Partner (multi-select if partner data available)

**Drill-Down Actions:**
- Click Partner → Navigate to Partner Dashboard (filtered to this engineer)
- Click Date → See daily activity detail

### 5.2 Filtering Hierarchy

**Top-Level Filters (Global Context):**
- **Date Range:** Applies to all dashboards, persists across navigation
- **TDL:** Filters all data to selected TDL(s) and their engineers
- **Partner:** Filters to selected partner(s), but respects data availability constraints

**Cascading Filter Logic:**
- Selecting TDL → Auto-filter Engineer list to that TDL's team
- Selecting Partner → Auto-filter Engineer list to engineers with that partner assignment
- Selecting TDL + Partner → Intersection (engineers in that team who work with that partner)

**Filter State Persistence:**
- When drilling down (e.g., Global → TDL Dashboard), carry forward global filters
- When drilling up (e.g., Engineer → TDL Dashboard), retain engineer selection as highlighted context

**Filter Reset:**
- "Clear All Filters" button on every dashboard
- "Reset to Global View" button to return to home page with default filters

### 5.3 Time Intelligence Strategy

#### Date Range Presets

- **Relative Periods:**
  - Today, Yesterday
  - Last 7 Days, Last 30 Days, Last 90 Days
  - This Week, Last Week (Monday-Sunday)
  - This Month, Last Month
  - This Quarter, Last Quarter
  - This Year, Last Year
  - All Time

- **Custom Range:** Date picker for start and end dates

#### Time Comparisons

- **Period-over-Period:**
  - Display current period metric with prior period comparison
  - Example: "Utilization: 78% (↑ 3% vs last month)"
  - Color coding: Green for improvement, red for decline

- **Year-over-Year:**
  - Compare same month this year vs last year
  - Example: "February 2026 utilization: 80% vs February 2025: 75%"

- **Rolling Averages:**
  - 7-day rolling average for smoothing daily volatility
  - 30-day rolling average for trend analysis
  - 90-day rolling average for long-term patterns

#### Time Granularity

- **Daily View:** For recent periods (<30 days), show daily data points
- **Weekly View:** For 30-90 day periods, aggregate to weeks
- **Monthly View:** For 90+ day periods, aggregate to months
- **Quarterly View:** For multi-year analysis, aggregate to quarters

**Auto-Adjust Granularity:**
- System automatically selects appropriate granularity based on date range selected
- User can override: "Show as Daily/Weekly/Monthly" toggle

### 5.4 Data Refresh Strategy

#### Batch Refresh (Recommended for Initial Implementation)

**Frequency:** Daily, overnight (e.g., 2:00 AM)

**Process:**
1. Extract new MDE submissions from Excel/database
2. Extract new CSAT responses
3. Validate data quality (type checks, range checks)
4. Transform and load into data warehouse
5. Refresh dimension tables (new engineers, partners)
6. Append to fact tables
7. Rebuild aggregates and pre-calculations
8. Refresh dashboard cache

**Data Latency:** T+1 (today's data available tomorrow)

**Advantage:** Simple, low infrastructure cost, sufficient for operational dashboards

#### Near-Real-Time Refresh (Future Enhancement)

**Frequency:** Every 15-60 minutes

**Process:**
1. Incremental load of new records only
2. Stream new data to warehouse
3. Update dashboard with latest data

**Use Case:** If business requires intra-day monitoring (e.g., tracking daily utilization targets)

**Technology:** Requires event-driven architecture (Azure Functions, Kafka, etc.)

#### Manual Refresh

**Trigger:** "Refresh Data" button on dashboard
**Use Case:** Ad-hoc analysis after data corrections
**Constraint:** Rate-limit to prevent abuse (max 1 refresh per 15 minutes)

### 5.5 Scalability Considerations

#### Data Volume Projections

**Current State:**
- MDE: 23,577 records (3 years)
- CSAT: 474 records (3 months)

**Growth Rate:**
- MDE: ~150 engineers × 250 working days = 37,500 records/year
- CSAT: ~474 / 3 months × 12 = ~1,900 records/year

**5-Year Projection:**
- MDE: ~210,000 records (assuming headcount growth to 200 engineers)
- CSAT: ~10,000 records

**Storage:** Low volume, standard SQL database sufficient (<1 GB)

#### Query Performance

**Optimization Strategies:**
- **Partitioning:** Partition Fact_Utilization by Year-Month
- **Indexing:** Index on DateKey, EngineerKey, PartnerKey, TDLKey
- **Pre-Aggregation:** Create monthly/weekly rollup tables for faster queries
  - Fact_Utilization_Monthly: Engineer × Month × Partner aggregates
  - Fact_CSAT_Monthly: Partner × Month aggregates
- **Caching:** Cache dashboard results for 15-60 minutes

**Query Limit:** Limit detail queries to last 2 years by default; full history on demand

#### User Concurrency

**Expected Users:** 20-50 concurrent users (TDLs, managers, executives)

**Architecture:**
- **Backend:** API layer (Node.js/Python FastAPI) with connection pooling
- **Database:** PostgreSQL or SQL Server (handles 50 concurrent queries easily)
- **Frontend:** React SPA with client-side filtering/sorting for responsive UX

**Load Testing:** Test with 100 concurrent users before production launch

#### Multi-Tenancy (Future)

If expanding to serve multiple companies (beyond IT By Design):
- Add `CompanyKey` to all fact and dimension tables
- Implement row-level security (users only see their company's data)
- Separate schemas per company for data isolation

---

## 6. AI Analysis Layer Strategy

### 6.1 AI Insight Generation Types

#### Descriptive AI Insights (What Happened)

**Automated Summary Generation:**
- Daily/Weekly/Monthly executive summary emails
- Example: "This week, 147 engineers averaged 79% utilization, closing 1,245 tickets. Top performer: Engineer A (95% utilization, 52 tickets closed). Team Lead Kawandeep's team led with 83% average utilization."
- Technology: Template-based text generation with dynamic data insertion

**Anomaly Highlighting:**
- Identify top 3 unusual events in selected period
- Example: "Engineer B's utilization dropped 30% this week (from 85% to 55%). Partner C had zero CSAT surveys this month (historically 8/month)."
- Technology: Z-score anomaly detection, threshold-based alerting

**Trend Narration:**
- Describe trend direction and magnitude in natural language
- Example: "Overall utilization is trending upward, increasing 2% per month over the last quarter. This growth is primarily driven by Team Lead Gagan's team."
- Technology: Linear regression + slope interpretation

#### Diagnostic AI Insights (Why It Happened)

**Root Cause Analysis:**
- For negative CSAT, identify potential contributing factors
- Example: "Partner D's CSAT declined from 90% to 60% this month. Contributing factors: (1) Engineer E, who served 80% of their tickets, had utilization >95% (potential quality impact); (2) Ticket aging increased to 15% (up from 5%)."
- Technology: Correlation analysis, decision tree feature importance

**Comparative Analysis:**
- Explain why Engineer X outperforms Engineer Y
- Example: "Engineer F achieves 90% utilization with low ticket aging (5%) while Engineer G at 85% utilization has 20% aging. Key difference: Engineer F closes tickets 30% faster on average."
- Technology: Cohort comparison, statistical testing

**Segmentation Insights:**
- Cluster engineers and explain cluster characteristics
- Example: "3 engineer segments identified: (1) High-Output Veterans (85%+ utilization, <5% aging, 2+ years tenure), (2) Steady Contributors (70-80% utilization, 10% aging), (3) New Hires (<6 months, ramping utilization)."
- Technology: K-means clustering, cluster profiling

#### Predictive AI Insights (What Will Happen)

**Utilization Forecasting:**
- Predict next month's utilization per engineer
- Example: "Based on trend analysis, Engineer H is forecasted to reach 97% utilization next month (95% confidence interval: 92-100%), indicating potential burnout risk."
- Technology: Time-series forecasting (ARIMA, Prophet, or simple linear regression)

**CSAT Prediction:**
- Predict probability of Unhappy rating for at-risk partners
- Example: "Partner I has 65% probability of receiving an Unhappy rating in the next survey based on declining tag scores and increased ticket aging."
- Technology: Logistic regression, random forest classifier

**Capacity Shortfall Prediction:**
- Forecast when company-wide utilization will exceed safe threshold
- Example: "At current growth rate, company-wide utilization will exceed 90% by May 2026, requiring 8 additional engineers to maintain service levels."
- Technology: Linear extrapolation, capacity planning simulation

**Churn Risk Prediction:**
- Identify engineers at risk of attrition (if HR data available)
- Example: "Engineer J shows signs of disengagement: utilization dropped 40% over 2 months, no partner assignments in 3 weeks."
- Technology: Logistic regression on behavioral indicators

#### Prescriptive AI Insights (What Should We Do)

**Recommendation Engine:**
- Suggest actions based on detected issues
- Example: "To reduce Partner K's ticket aging from 25% to <10%, recommend: (1) Assign 1 additional engineer (suggest Engineer L, currently at 60% utilization), (2) Prioritize tickets >7 days old."
- Technology: Rule-based system, optimization algorithm

**Resource Allocation Optimization:**
- Suggest optimal engineer-to-partner assignments
- Example: "Reassigning Engineer M from Partner N (50% utilization) to Partner O (95% utilization, capacity constrained) would balance workload and reduce Partner O's aging by estimated 15%."
- Technology: Linear programming, constraint optimization

**Training Recommendations:**
- Identify skill gaps based on CSAT tag analysis
- Example: "3 engineers received 'Time to Response' negative tags >50% of the time. Recommend training on ticket prioritization."
- Technology: Association rule mining

**TDL Coaching Insights:**
- Provide TDLs with specific team management recommendations
- Example: "TDL Kawandeep: Your team's ticket aging (12%) is above company average (8%). Focus on: (1) Engineer P (30% aging, needs support), (2) Engineer Q (over-allocated to Partner R, recommend redistribution)."
- Technology: Benchmarking + rule-based recommendations

### 6.2 AI Trend Interpretation

#### Trend Direction Classification

**Categorization:**
- **Strong Upward:** Slope >5% per month, R² >0.7
- **Moderate Upward:** Slope 2-5% per month, R² >0.5
- **Stable:** Slope <2% per month
- **Moderate Downward:** Slope -2% to -5% per month, R² >0.5
- **Strong Downward:** Slope <-5% per month, R² >0.7

**Narrative Generation:**
- Strong Upward: "Utilization is rapidly increasing, up 6% per month over the last quarter."
- Stable: "Utilization has remained steady around 78% for the past 6 months."
- Strong Downward: "CSAT is declining significantly, down 10% per month over the last quarter. Immediate action required."

#### Seasonality Detection

**Algorithm:**
- Decompose time series into trend + seasonality + residuals (STL decomposition)
- Identify recurring patterns (e.g., lower utilization in December, higher in Q1)

**Insight Example:**
- "Utilization historically dips 10% in December due to holidays. Current December utilization (70%) is aligned with seasonal expectation."

**Application:**
- Adjust forecasts for seasonal patterns
- Set seasonally-adjusted targets

#### Change Point Detection

**Algorithm:**
- Detect sudden, statistically significant shifts in metrics
- Example: CSAT dropped from 95% to 70% within 2 weeks (not gradual decline)

**Insight Example:**
- "CSAT for Partner S experienced a change point on Jan 15, 2026, dropping 25% suddenly. This coincided with Engineer T's departure (replaced by Engineer U)."

**Application:**
- Trigger alerts for sudden changes
- Investigate change point causes

### 6.3 Risk Detection Logic

#### Engineer Burnout Risk Algorithm

**Risk Factors:**
1. Utilization >90% for 4+ consecutive weeks (Weight: 40%)
2. Total logged hours >10/day average for 2+ weeks (Weight: 30%)
3. Ticket load >20/day average (Weight: 20%)
4. Declining CSAT trend (if linkable) (Weight: 10%)

**Scoring:**
- Risk Score = Weighted sum of factors (0-100)
- Low Risk: <30, Medium Risk: 30-60, High Risk: >60

**Alert:**
- High Risk: "Engineer V is at high burnout risk (score: 75). Recommend: (1) Redistribute workload, (2) Mandatory PTO, (3) 1-on-1 with TDL."

#### Partner At-Risk Algorithm

**Risk Factors:**
1. CSAT declining trend (slope <-5% per month) (Weight: 40%)
2. Unhappy rating received in last 30 days (Weight: 30%)
3. Ticket aging >20% (Weight: 20%)
4. Reduced survey participation (drop >50% vs prior period) (Weight: 10%)

**Scoring:**
- Risk Score = Weighted sum (0-100)
- Low Risk: <30, Medium Risk: 30-60, High Risk: >60

**Alert:**
- High Risk: "Partner W is at high churn risk (score: 68). Key issues: (1) CSAT dropped 20% in 2 months, (2) Ticket aging at 25%, (3) Last Unhappy rating cited 'slow response time.' Recommend: Account review meeting with Partner W."

#### Capacity Shortfall Risk Algorithm

**Indicators:**
1. Company-wide utilization >85% for 2+ months
2. Ticket backlog growing (TicketsWorked > TicketsClosed trend)
3. New ticket rate increasing faster than closure rate
4. Headcount attrition (if HR data available)

**Forecast:**
- If utilization increasing at X% per month, calculate months until 95% threshold
- Example: "At current growth rate (2% per month), capacity will be exhausted in 4 months (June 2026)."

**Recommendation:**
- "Initiate hiring for 10 additional engineers to maintain 75-80% target utilization."

#### Data Quality Risk Algorithm

**Indicators:**
1. Partner attribution missing rate >95%
2. High missing value rate in critical fields (>20%)
3. Outliers: >5% of records with Billable Hours >12 or <0
4. Duplicate records (same engineer, same date, multiple entries)

**Alert:**
- "Data quality issue detected: 99.5% of utilization records lack partner assignment. Impact: Partner-level analysis unavailable. Recommend: Operational process fix."

### 6.4 Anomaly Detection Approach

#### Statistical Anomaly Detection

**Method:** Z-Score Analysis
- Calculate mean and standard deviation for each metric per entity (engineer, partner)
- Flag records with |Z-Score| >3 as anomalies

**Example Anomalies:**
- Engineer X typically works 8 tickets/day; today worked 30 tickets (Z=4.5) → Investigate
- Partner Y typically receives 8 CSAT surveys/month; this month received 1 (Z=-2.8) → Investigate

#### Time-Series Anomaly Detection

**Method:** Exponential Smoothing + Prediction Interval
- Forecast expected value based on historical pattern
- Flag actual value outside 95% prediction interval as anomaly

**Example:**
- Engineer Z's utilization forecasted at 80% ±5%; actual is 50% → Anomaly (possible illness, data entry gap)

#### Contextual Anomaly Detection

**Method:** Conditional Rules
- Utilization >100% (data entry error or unsustainable overtime)
- Billable Hours = 0 AND Tickets Closed >0 (data inconsistency)
- CSAT rating = Unhappy for partner with 100% Happy history (investigate immediately)

**Alert Prioritization:**
- Critical: Data inconsistencies, sudden CSAT drops
- Warning: Utilization outliers, ticket volume spikes
- Info: Minor deviations from trend

### 6.5 Narrative Generation for Leadership

#### Executive Summary Template

**Structure:**
1. **Headline Metric:** "Overall utilization this month: X% (↑/↓ Y% vs last month)"
2. **Key Highlights:** Top 3 positive developments
3. **Areas of Concern:** Top 3 issues requiring attention
4. **Action Items:** Recommended decisions/actions

**Example Output:**
```
Monthly Performance Summary - February 2026

Overall Utilization: 79% (↑ 3% vs January)

Key Highlights:
✓ Team Lead Gagan's team achieved 85% utilization, highest in company
✓ CSAT remained strong at 95%, with 28 new surveys received
✓ 15 engineers exceeded 90% utilization, indicating high demand

Areas of Concern:
⚠ Partner ABC's CSAT dropped to 60% (down from 90% last month) - investigate immediately
⚠ 3 engineers at high burnout risk (>95% utilization for 4+ weeks) - workload redistribution needed
⚠ Ticket aging increased to 12% company-wide (up from 8%) - capacity constraint emerging

Recommended Actions:
1. Schedule urgent review meeting with Partner ABC to address CSAT concerns
2. Redistribute workload for Engineers X, Y, Z to prevent burnout
3. Initiate hiring for 5 additional engineers to address growing capacity constraint
```

#### TDL Performance Narrative

**Structure:**
1. **Team Overview:** Team size, avg utilization, CSAT (if applicable)
2. **Top Performers:** Highlight 2-3 high-performing engineers
3. **Support Needed:** Flag engineers needing help
4. **Team Trends:** Describe team trajectory

**Example Output:**
```
Team Performance - Kawandeep's Team - February 2026

Team Size: 42 engineers
Average Utilization: 82% (↑ 2% vs last month)
Tickets Closed: 1,245 (company-leading)

Top Performers:
⭐ Shaurya Sharma: 92% utilization, 52 tickets closed, 0 tickets >7 days
⭐ Timothy Massey: 88% utilization, 45 tickets closed, strong CSAT feedback

Engineers Needing Support:
⚠ Ralph Sharma: Utilization dropped to 55% (from 85% last month) - recommend 1-on-1 to identify blockers
⚠ Annie Sharma: Ticket aging at 30% - may need training on prioritization

Team Trend: Your team's utilization is on an upward trajectory, increasing steadily over the last quarter. This is positive but monitor for burnout risk as 5 engineers are now >90% utilization.
```

#### Partner Health Report

**Structure:**
1. **Partner Snapshot:** Hours consumed, engineers assigned, CSAT score
2. **Health Status:** Green/Yellow/Red indicator
3. **Recent Changes:** CSAT trend, utilization changes
4. **Next Steps:** Recommended actions

**Example Output:**
```
Partner Health Report - Acrisure Cyber Services - February 2026

Status: 🟢 Healthy

Hours Consumed: 320 hours (38% of available capacity for assigned engineers)
Assigned Engineers: 4 (Rose Ann Mosquera, Edrian Santos, Carl Coronel, Autumn Kour)
CSAT Score: 92% (24 surveys, 22 Happy, 2 Okay, 0 Unhappy)

Recent Changes:
✓ CSAT improved 5% vs last month
✓ Ticket aging decreased to 3% (down from 10%)
✓ Survey participation increased (8 surveys this month vs 5 last month)

Tag Analysis:
- Helpfulness: 95% positive
- Knowledge: 90% positive
- Time to Response: 85% positive (slight opportunity for improvement)

Next Steps: Maintain current service level. Consider Engineer Rose Ann Mosquera for recognition (consistently high CSAT feedback).
```

---

## 7. Implementation Roadmap

### Phase 1: Data Cleaning & Normalization (Weeks 1-3)

#### Objectives
- Establish clean, validated datasets ready for modeling
- Resolve data type mismatches and missing value issues
- Create partner mapping and standardization

#### Tasks

**Week 1: Data Profiling & Validation**
- [ ] Export both Excel files to staging environment
- [ ] Run comprehensive data quality audit (automated script)
- [ ] Document all data quality issues in issue tracker
- [ ] Define data cleaning rules and business logic
- [ ] Identify critical vs non-critical data gaps

**Week 2: Data Transformation**
- [ ] Convert MDE numeric fields from text to appropriate data types
  - Billable Hours, Non-Billable Hours, Admin Hours → DECIMAL
  - No. Tickets Worked, Closed, New/Dispatched → INTEGER
  - Handle errors: "Board Management" in Tickets>7 Days → Set to NULL, log for review
- [ ] Parse CSAT date strings to datetime format
- [ ] Standardize partner names (trim, lowercase, remove punctuation)
- [ ] Extract multi-value CSAT tags into normalized structure (one row per tag)
- [ ] Create data validation reports (before/after comparison)

**Week 3: Partner Mapping & Enrichment**
- [ ] Run exact match algorithm for partner name matching
- [ ] Run fuzzy match algorithm (85% similarity threshold)
- [ ] Create candidate match list for manual review
- [ ] Build Partner_Mapping table with standardized names
- [ ] Create operational plan to backfill missing partner data
  - Option A: Survey engineers for historical partner assignments
  - Option B: Analyze ticket system data for partner linkage
  - Option C: Mandate partner selection in future MDE submissions
- [ ] Document partner mapping assumptions and decisions

**Deliverables:**
- Cleaned MDE dataset (CSV or database table)
- Cleaned CSAT dataset (CSV or database table)
- Partner_Mapping table
- Data Quality Report (before/after metrics)
- Data Dictionary (field definitions, data types, business rules)

**Success Criteria:**
- <1% data type conversion errors
- All partner names standardized and mapped
- Missing value rates documented and accepted by business

---

### Phase 2: Data Modeling & Warehouse Build (Weeks 4-6)

#### Objectives
- Implement star schema data model in database
- Build ETL pipelines for ongoing data ingestion
- Validate data model with sample queries

#### Tasks

**Week 4: Database Design & Setup**
- [ ] Select database platform (PostgreSQL recommended for cost/performance)
- [ ] Set up database instance (cloud or on-prem)
- [ ] Create database schema (DDL scripts)
  - Dimension tables: Dim_Date, Dim_Engineer, Dim_TDL, Dim_Partner, Dim_TeamMember
  - Fact tables: Fact_Utilization, Fact_CSAT
  - Bridge tables: Bridge_Engineer_Partner (if needed)
- [ ] Define primary keys, foreign keys, indexes
- [ ] Implement partitioning on Fact_Utilization (by Year-Month)
- [ ] Set up database access controls and user permissions

**Week 5: ETL Pipeline Development**
- [ ] Build dimension load process
  - Load Dim_Date (2023-2027 range)
  - Load Dim_Engineer (from MDE Name/Email)
  - Load Dim_TDL (from MDE Reporting Manager)
  - Load Dim_Partner (from CSAT Company + MDE Partner Name1, deduplicated)
  - Load Dim_TeamMember (from CSAT Team Member)
- [ ] Build fact load process
  - Load Fact_Utilization (from cleaned MDE data)
  - Load Fact_CSAT (from cleaned CSAT data)
  - Implement lookups to map natural keys to surrogate keys
  - Handle orphan records (e.g., engineer not in Dim_Engineer)
- [ ] Implement data validation checks
  - Referential integrity (all FKs resolve)
  - Row count reconciliation (source vs target)
  - Metric validation (sum of billable hours matches source)
- [ ] Create ETL orchestration script (Python or SQL-based)
- [ ] Test full ETL pipeline on cleaned data

**Week 6: Calculated Fields & Aggregations**
- [ ] Implement utilization calculation logic (all 3 options)
- [ ] Create CSAT scoring logic (Net CSAT, Weighted CSAT)
- [ ] Build pre-aggregated tables for performance
  - Fact_Utilization_Monthly (Engineer × Month × Partner aggregates)
  - Fact_CSAT_Monthly (Partner × Month aggregates)
  - Fact_Utilization_Weekly (Engineer × Week aggregates)
- [ ] Create database views for common queries
  - View_EngineerPerformance (utilization, tickets, CSAT by engineer)
  - View_TDLPerformance (team metrics by TDL)
  - View_PartnerHealth (partner utilization + CSAT metrics)
- [ ] Validate calculated fields against manual calculations
- [ ] Document all calculation formulas and business logic

**Deliverables:**
- Operational data warehouse with star schema
- ETL pipeline code (Python/SQL scripts)
- Pre-aggregated tables and views
- ETL documentation and runbook
- Data model diagram (ERD)

**Success Criteria:**
- ETL pipeline completes successfully with <1% error rate
- Query performance: <2 seconds for typical dashboard queries
- All calculated fields validated and documented

---

### Phase 3: API & Backend Design (Weeks 7-9)

#### Objectives
- Build RESTful API to serve dashboard data
- Implement business logic layer
- Ensure API performance and security

#### Tasks

**Week 7: API Design & Setup**
- [ ] Select API framework (FastAPI/Python or Express/Node.js recommended)
- [ ] Define API endpoints (RESTful design)
  - `/api/kpis/global` - Global KPI metrics
  - `/api/utilization/engineer/{engineerKey}` - Engineer utilization time series
  - `/api/utilization/tdl/{tdlKey}` - TDL team metrics
  - `/api/csat/partner/{partnerKey}` - Partner CSAT history
  - `/api/engineers` - List of engineers (with filters)
  - `/api/partners` - List of partners (with filters)
  - `/api/tdls` - List of TDLs
  - `/api/anomalies` - List of detected anomalies
  - `/api/insights/summary` - AI-generated summary
- [ ] Design API request/response schemas (JSON)
- [ ] Implement query parameter support (filters: dateFrom, dateTo, tdlKey, partnerKey)
- [ ] Set up API development environment
- [ ] Implement database connection pooling for scalability

**Week 8: API Implementation**
- [ ] Implement data retrieval endpoints
  - Connect to data warehouse
  - Execute SQL queries
  - Transform results to JSON
  - Handle pagination for large result sets
- [ ] Implement filtering and aggregation logic
  - Date range filtering
  - TDL/Partner filtering
  - Drill-down support (e.g., TDL → Engineers)
- [ ] Implement error handling and validation
  - Invalid date ranges
  - Non-existent engineer/partner keys
  - Database connection errors
- [ ] Add response caching (15-60 minute cache for static queries)
- [ ] Implement API logging (request/response logging for debugging)

**Week 9: Security & Testing**
- [ ] Implement authentication (JWT tokens or OAuth)
- [ ] Implement authorization (role-based access control if needed)
  - TDLs can only see their team data (optional)
  - Executives can see all data
- [ ] Implement rate limiting (prevent API abuse)
- [ ] Write API unit tests (test each endpoint)
- [ ] Write API integration tests (test full request/response flow)
- [ ] Perform load testing (simulate 100 concurrent users)
- [ ] Document API with OpenAPI/Swagger specification
- [ ] Create API usage guide for frontend developers

**Deliverables:**
- Functional REST API (deployed to staging environment)
- API documentation (Swagger/OpenAPI spec)
- API testing suite (unit + integration tests)
- Load testing results
- API security implementation

**Success Criteria:**
- All API endpoints functional and tested
- API response time <500ms for 95% of requests
- Load test successful (100 concurrent users, <1% error rate)
- API documentation complete

---

### Phase 4: Frontend Dashboard (Weeks 10-14)

#### Objectives
- Build interactive web-based dashboard UI
- Implement 4 dashboard views (Global, TDL, Partner, Engineer)
- Ensure responsive design and user experience

#### Tasks

**Week 10: UI/UX Design & Framework Setup**
- [ ] Create wireframes for all 4 dashboard views
- [ ] Define visual design system (color scheme, typography, components)
  - Primary color: Company brand color
  - Success/Warning/Danger colors for status indicators
  - Chart color palette (accessibility-friendly)
- [ ] Select frontend framework (React recommended)
- [ ] Set up frontend development environment
- [ ] Initialize React app with routing (React Router)
- [ ] Set up state management (Redux or Context API)
- [ ] Select charting library (Recharts, Chart.js, or Plotly)
- [ ] Create reusable UI components (KPI card, chart container, filter panel)

**Week 11-12: Dashboard Implementation**
- [ ] **Global Dashboard:**
  - Build KPI cards (Utilization %, Total Engineers, Net CSAT, etc.)
  - Build utilization trend line chart
  - Build TDL comparison bar chart
  - Build CSAT trend line chart
  - Build ticket volume area chart
  - Implement global filters (date range, TDL, partner)
  - Implement drill-down navigation (click TDL → TDL dashboard)
- [ ] **TDL Dashboard:**
  - Build TDL KPI cards
  - Build engineer performance table (sortable, filterable)
  - Build utilization distribution histogram
  - Build engineer trend small multiples
  - Build ticket aging heatmap
  - Implement TDL-specific filters
  - Implement drill-down to engineer dashboard
- [ ] **Partner Dashboard:**
  - Build partner KPI cards
  - Build utilization trend (if data available)
  - Build CSAT history chart
  - Build assigned engineers table
  - Build tag analysis breakdown
  - Build recent comments section
  - Implement data availability handling (show warnings if no data)
  - Implement drill-down to engineer dashboard
- [ ] **Engineer Dashboard:**
  - Build engineer KPI cards
  - Build utilization trend line
  - Build ticket metrics table
  - Build partner breakdown (if data available)
  - Build time allocation pie chart
  - Build performance benchmarking chart (engineer vs team avg vs company avg)
  - Implement engineer-specific filters

**Week 13: Advanced Features**
- [ ] Implement filter state persistence (URL parameters or local storage)
- [ ] Implement "export to PDF/Excel" functionality
- [ ] Implement "share dashboard" feature (generate shareable URL)
- [ ] Implement responsive design (mobile/tablet support)
- [ ] Add loading states and skeleton screens
- [ ] Add empty states (e.g., "No data available for selected filters")
- [ ] Implement accessibility features (ARIA labels, keyboard navigation)

**Week 14: Testing & Polish**
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] User acceptance testing (UAT) with stakeholders
  - TDLs test TDL dashboard
  - Executives test global dashboard
  - Collect feedback and iterate
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Fix bugs and UI issues identified in UAT
- [ ] Create user guide and help documentation

**Deliverables:**
- Fully functional web dashboard (deployed to staging)
- 4 dashboard views (Global, TDL, Partner, Engineer)
- User guide and help documentation
- UAT feedback report and resolution log

**Success Criteria:**
- All 4 dashboards functional and navigable
- Dashboard loads in <3 seconds
- UAT approval from key stakeholders
- No critical bugs

---

### Phase 5: AI Layer Integration (Weeks 15-18)

#### Objectives
- Implement AI-powered insights and anomaly detection
- Generate automated narratives and alerts
- Deploy AI services to production

#### Tasks

**Week 15: Anomaly Detection Implementation**
- [ ] Develop anomaly detection algorithms
  - Z-score anomaly detection for utilization and ticket metrics
  - Time-series anomaly detection using exponential smoothing
  - Contextual anomaly detection (rule-based)
- [ ] Build anomaly scoring system (severity: low/medium/high)
- [ ] Create anomaly storage table (Fact_Anomalies)
- [ ] Integrate anomaly detection into ETL pipeline (daily execution)
- [ ] Build API endpoint for anomaly retrieval
- [ ] Add anomaly highlights to Global dashboard ("3 anomalies detected this week")

**Week 16: Risk Detection & Scoring**
- [ ] Implement engineer burnout risk algorithm
  - Calculate risk scores based on utilization, hours, ticket load
  - Store risk scores in Dim_Engineer
  - Create alerts for high-risk engineers
- [ ] Implement partner at-risk algorithm
  - Calculate risk scores based on CSAT trend, aging, survey participation
  - Store risk scores in Dim_Partner
  - Create alerts for at-risk partners
- [ ] Implement capacity shortfall risk algorithm
  - Forecast utilization trend
  - Calculate months until 95% threshold
  - Create capacity planning alerts
- [ ] Build risk dashboard section (list of at-risk engineers and partners)

**Week 17: Predictive Analytics & Forecasting**
- [ ] Build utilization forecasting model (per engineer)
  - Train time-series model (ARIMA, Prophet, or linear regression)
  - Generate next-month utilization predictions
  - Store predictions in Fact_Utilization_Forecast table
- [ ] Build CSAT forecasting model (per partner)
  - Train time-series model on CSAT trend
  - Generate next-month CSAT predictions
  - Store predictions in Fact_CSAT_Forecast table
- [ ] Build capacity planning model
  - Forecast company-wide utilization
  - Calculate headcount needs to maintain target utilization
- [ ] Add forecast visuals to dashboards (dashed lines for predicted values)

**Week 18: Narrative Generation & Alerts**
- [ ] Build narrative generation engine
  - Create templates for executive summary, TDL report, partner health report
  - Implement dynamic text generation with data insertion
  - Add natural language trend descriptions ("increasing", "declining", etc.)
- [ ] Build automated alert system
  - Email alerts for high-risk engineers/partners
  - Daily/weekly summary emails for executives
  - Slack/Teams integration for real-time alerts (optional)
- [ ] Create AI insights API endpoint (`/api/insights/summary`)
- [ ] Add AI insights section to each dashboard
  - Global: Executive summary
  - TDL: Team performance narrative
  - Partner: Partner health report
  - Engineer: Performance insights and recommendations
- [ ] Test all AI features with real data
- [ ] Validate AI outputs with stakeholders (ensure narratives are accurate and useful)

**Deliverables:**
- Anomaly detection system (operational)
- Risk scoring models (engineer burnout, partner at-risk, capacity shortfall)
- Predictive forecasting models (utilization, CSAT, capacity)
- Narrative generation engine (automated summaries)
- Alert system (email/Slack notifications)
- AI-enhanced dashboards

**Success Criteria:**
- Anomaly detection identifies 90%+ of known issues
- Risk scores validated by business (high-risk entities confirmed as problematic)
- Forecast accuracy within ±10% for next-month predictions
- Narrative summaries approved as accurate and actionable

---

### Post-Launch: Operations & Iteration

#### Ongoing Activities (Post-Week 18)

**Data Operations:**
- Daily ETL execution and monitoring
- Weekly data quality audits
- Monthly partner mapping updates (add new partners)
- Quarterly data backfill projects (enrich historical partner data)

**User Support:**
- User training sessions (TDLs, executives)
- Help desk for dashboard issues
- User feedback collection (monthly survey)

**Continuous Improvement:**
- Monthly review of AI model accuracy (retrain if needed)
- Quarterly feature enhancements based on user feedback
- Annual architecture review for scalability

**Success Metrics:**
- Dashboard adoption rate (% of TDLs/executives using weekly)
- User satisfaction score (NPS survey)
- Data quality improvement (track partner attribution completion rate)
- Business impact (e.g., reduced engineer burnout, improved CSAT)

---

## Appendix: Key Assumptions & Constraints Summary

### Critical Constraints
1. **Partner Attribution Gap:** 99.5% of MDE data lacks partner assignment → Limits partner-level analytics to 8 overlapping partners only
2. **CSAT Temporal Limitation:** Only 3 months of CSAT history → Prevents long-term satisfaction trend analysis
3. **Partner Name Inconsistency:** No standard identifier between CSAT and MDE → Requires fuzzy matching and manual mapping

### Data Assumptions
1. **Utilization Formula:** To be confirmed with stakeholders (capacity-based vs actual time-based)
2. **Standard Work Day:** Assumed 8 hours unless otherwise specified
3. **Partner Attribution:** Missing `Partner Name1` assumed as unassigned work, not data entry errors (requires validation)
4. **Engineer Identity:** Name + Email assumed unique (risk: name changes not tracked)

### Technical Assumptions
1. **Database Platform:** PostgreSQL recommended (scalable, cost-effective)
2. **API Framework:** FastAPI/Python or Express/Node.js
3. **Frontend Framework:** React SPA
4. **Charting Library:** Recharts or Plotly
5. **AI/ML Library:** Scikit-learn, Prophet, or statsmodels
6. **Deployment:** Cloud-based (AWS, Azure, or GCP) for scalability

### Success Dependencies
1. **Data Enrichment Initiative:** Business commits to backfilling partner data and improving data collection processes
2. **Stakeholder Engagement:** TDLs and executives actively use dashboard and provide feedback
3. **Data Governance:** Ongoing data quality monitoring and improvement
4. **Technical Infrastructure:** Reliable database and API performance

---

**Document Version:** 1.0  
**Last Updated:** February 17, 2026  
**Author:** Senior Data Analyst & Solution Architect  
**Status:** Strategic Plan - Pending Stakeholder Approval
