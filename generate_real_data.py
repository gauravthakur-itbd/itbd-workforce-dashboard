"""
ITBD Workforce Intelligence - Real Data Generator
Processes cleaned 90-day data and generates JSON for dashboard
Includes: Partner mapping, CSAT integration, TTL analytics, reporting periods
Author: Principal Data Analyst & Frontend Engineer
Date: February 17, 2026
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

print("="*100)
print("GENERATING REAL DATA JSON FILES FOR DASHBOARD")
print("="*100)

# ============================================================================
# STEP 1: Load Data
# ============================================================================
print("\n[STEP 1] Loading data files...")
mde_df = pd.read_excel("Doc/MDE_Utalisation_BI.xlsx")
csat_df = pd.read_excel("Doc/csat_survey-2.xlsx", sheet_name='CSAT_Review')

# Clean column names
mde_df.columns = mde_df.columns.str.strip()
csat_df.columns = csat_df.columns.str.strip()

print(f"✓ MDE Records: {len(mde_df)}")
print(f"✓ CSAT Reviews: {len(csat_df)}")

# ============================================================================
# STEP 2: Define Column Mappings
# ============================================================================
PARTNER_COL = 'Partner Name1'
ENGINEER_NAME_COL = 'Name'
ENGINEER_EMAIL_COL = 'Email'
TTL_COL = 'Reporting Manager'
START_TIME_COL = 'Start time'
COMPLETION_TIME_COL = 'Completion time'
DATE_COL = 'Date'
BILLABLE_HOURS_COL = 'Billable Hours'
NON_BILLABLE_HOURS_COL = 'Non Billable Hours (Excluding Admin & Break)'
TICKETS_WORKED_COL = 'No. Tickets Worked'
TICKETS_CLOSED_COL = 'No. Tickets Closed'
TICKETS_NEW_COL = 'No. New/Dispatched Tickets'

# ============================================================================
# STEP 3: Clean and Process Data
# ============================================================================
print("\n[STEP 2] Cleaning and processing data...")

# Convert dates
mde_df[START_TIME_COL] = pd.to_datetime(mde_df[START_TIME_COL])
mde_df[COMPLETION_TIME_COL] = pd.to_datetime(mde_df[COMPLETION_TIME_COL])
mde_df[DATE_COL] = pd.to_datetime(mde_df[DATE_COL])
csat_df['Date'] = pd.to_datetime(csat_df['Date'], errors='coerce')

# Get current date (latest date in data)
current_date = mde_df[DATE_COL].max()
print(f"✓ Current date (latest in data): {current_date.date()}")

# Clean partner names
mde_df[PARTNER_COL] = mde_df[PARTNER_COL].str.strip()
mde_df = mde_df[mde_df[PARTNER_COL].notna()]

# Clean CSAT company names
csat_df['Company'] = csat_df['Company'].str.strip()

# Convert numeric columns
mde_df[TICKETS_CLOSED_COL] = pd.to_numeric(mde_df[TICKETS_CLOSED_COL], errors='coerce').fillna(0).astype(int)
mde_df[TICKETS_WORKED_COL] = pd.to_numeric(mde_df[TICKETS_WORKED_COL], errors='coerce').fillna(0).astype(int)
mde_df[BILLABLE_HOURS_COL] = pd.to_numeric(mde_df[BILLABLE_HOURS_COL], errors='coerce').fillna(0)

# Calculate hours from start/completion time if billable hours is 0
mde_df['calculated_hours'] = (mde_df[COMPLETION_TIME_COL] - mde_df[START_TIME_COL]).dt.total_seconds() / 3600
mde_df[BILLABLE_HOURS_COL] = mde_df[BILLABLE_HOURS_COL].where(
    mde_df[BILLABLE_HOURS_COL] > 0, 
    mde_df['calculated_hours']
)

print(f"✓ Cleaned {len(mde_df)} utilization records")
print(f"✓ Date range: {mde_df[DATE_COL].min().date()} to {mde_df[DATE_COL].max().date()}")

# ============================================================================
# STEP 4: Define Reporting Periods
# ============================================================================
reporting_periods = {
    'last_7_days': current_date - timedelta(days=7),
    'last_15_days': current_date - timedelta(days=15),
    'last_30_days': current_date - timedelta(days=30),
    'last_60_days': current_date - timedelta(days=60),
    'last_90_days': current_date - timedelta(days=90)
}

print(f"\n✓ Reporting periods defined:")
for period, start_date in reporting_periods.items():
    count = len(mde_df[mde_df[DATE_COL] >= start_date])
    print(f"  - {period}: {start_date.date()} ({count} records)")

# ============================================================================
# STEP 5: Build Partner Mapping with CSAT
# ============================================================================
print("\n[STEP 3] Building partner mapping...")

partners = {}
partner_names = sorted(mde_df[PARTNER_COL].unique())

for partner in partner_names:
    partner_data = mde_df[mde_df[PARTNER_COL] == partner]
    
    # Get engineers for this partner
    engineers = []
    engineer_emails = partner_data[ENGINEER_EMAIL_COL].unique()
    
    for email in engineer_emails:
        eng_data = partner_data[partner_data[ENGINEER_EMAIL_COL] == email]
        name = eng_data[ENGINEER_NAME_COL].iloc[0]
        ttl = eng_data[TTL_COL].iloc[0] if pd.notna(eng_data[TTL_COL].iloc[0]) else 'Unassigned'
        
        engineers.append({
            'name': name,
            'email': email,
            'ttl': ttl,
            'total_tickets': int(eng_data[TICKETS_WORKED_COL].sum()),
            'total_billable_hours': round(float(eng_data[BILLABLE_HOURS_COL].sum()), 2),
            'csat_feedback_count': 0  # Will update with CSAT data
        })
    
    # Get CSAT data for this partner
    csat_partner_data = csat_df[csat_df['Company'].str.lower() == partner.lower()]
    
    csat_comments = []
    happy_count = 0
    total_csat = len(csat_partner_data)
    
    for _, csat_row in csat_partner_data.iterrows():
        rating = str(csat_row['Rating']).strip().lower() if pd.notna(csat_row['Rating']) else 'neutral'
        if rating == 'happy':
            happy_count += 1
        
        csat_comments.append({
            'comment': str(csat_row['Comments']) if pd.notna(csat_row['Comments']) else '',
            'rating': rating,
            'date': csat_row['Date'].strftime('%Y-%m-%d') if pd.notna(csat_row['Date']) else '',
            'engineer': str(csat_row['Team Member']) if pd.notna(csat_row['Team Member']) else ''
        })
    
    csat_score = round((happy_count / total_csat * 100), 2) if total_csat > 0 else 0
    
    # Get unique TTLs
    ttls = sorted(partner_data[TTL_COL].dropna().unique().tolist())
    
    partners[partner] = {
        'engineers': engineers,
        'ttls': ttls,
        'engineer_count': len(engineers),
        'csat_score': csat_score,
        'total_csat_responses': total_csat,
        'happy_ratings': happy_count,
        'csat_comments': csat_comments,
        'contact_emails': csat_partner_data['Contact Email'].dropna().unique().tolist(),
        'contact_names': csat_partner_data['Contact Name'].dropna().unique().tolist()
    }

print(f"✓ Mapped {len(partners)} partners")
print(f"✓ Top 5 partners by engineer count:")
top_partners = sorted(partners.items(), key=lambda x: x[1]['engineer_count'], reverse=True)[:5]
for name, data in top_partners:
    print(f"  - {name}: {data['engineer_count']} engineers, CSAT: {data['csat_score']}%")

# ============================================================================
# STEP 6: Build Engineer Profiles
# ============================================================================
print("\n[STEP 4] Building engineer profiles...")

engineers_dict = {}
unique_emails = mde_df[ENGINEER_EMAIL_COL].unique()

for email in unique_emails:
    eng_data = mde_df[mde_df[ENGINEER_EMAIL_COL] == email]
    name = eng_data[ENGINEER_NAME_COL].iloc[0]
    ttl = eng_data[TTL_COL].iloc[0] if pd.notna(eng_data[TTL_COL].iloc[0]) else 'Unassigned'
    
    # Get partners this engineer works with
    eng_partners = eng_data[PARTNER_COL].unique().tolist()
    
    # Calculate metrics
    total_billable = float(eng_data[BILLABLE_HOURS_COL].sum())
    total_tickets_worked = int(eng_data[TICKETS_WORKED_COL].sum())
    total_tickets_closed = int(eng_data[TICKETS_CLOSED_COL].sum())
    days_worked = eng_data[DATE_COL].nunique()
    
    avg_tickets_per_day = round(total_tickets_worked / days_worked, 2) if days_worked > 0 else 0
    avg_utilization = round((total_billable / (days_worked * 8) * 100), 2) if days_worked > 0 else 0
    close_rate = round((total_tickets_closed / total_tickets_worked * 100), 2) if total_tickets_worked > 0 else 0
    
    # Recent utilization (last 30 days, daily)
    recent_data = eng_data.sort_values(DATE_COL).tail(30)
    recent_utilization = []
    
    for date, day_data in recent_data.groupby(DATE_COL):
        recent_utilization.append({
            'date': date.strftime('%Y-%m-%d'),
            'billable_hours': round(float(day_data[BILLABLE_HOURS_COL].sum()), 2),
            'non_billable_hours': round(float(day_data[NON_BILLABLE_HOURS_COL].sum()), 2),
            'tickets_worked': int(day_data[TICKETS_WORKED_COL].sum()),
            'tickets_closed': int(day_data[TICKETS_CLOSED_COL].sum())
        })
    
    # Get CSAT feedback for this engineer
    csat_feedback = []
    for partner in eng_partners:
        partner_csat = csat_df[
            (csat_df['Company'].str.lower() == partner.lower()) &
            (csat_df['Team Member'].str.lower() == name.lower())
        ]
        
        for _, row in partner_csat.iterrows():
            csat_feedback.append({
                'partner': partner,
                'rating': str(row['Rating']).lower() if pd.notna(row['Rating']) else 'neutral',
                'comment': str(row['Comments']) if pd.notna(row['Comments']) else '',
                'date': row['Date'].strftime('%Y-%m-%d') if pd.notna(row['Date']) else ''
            })
    
    engineers_dict[email] = {
        'name': name,
        'email': email,
        'ttl': ttl,
        'partners': eng_partners,
        'partner_count': len(eng_partners),
        'total_billable_hours': round(total_billable, 2),
        'total_tickets_worked': total_tickets_worked,
        'total_tickets_closed': total_tickets_closed,
        'days_worked': days_worked,
        'avg_tickets_per_day': avg_tickets_per_day,
        'avg_utilization_pct': avg_utilization,
        'close_rate': close_rate,
        'recent_utilization': recent_utilization,
        'csat_feedback': csat_feedback
    }

print(f"✓ Profiled {len(engineers_dict)} engineers")
print(f"✓ Top 5 engineers by utilization:")
top_engineers = sorted(engineers_dict.items(), key=lambda x: x[1]['avg_utilization_pct'], reverse=True)[:5]
for email, data in top_engineers:
    print(f"  - {data['name']}: {data['avg_utilization_pct']}% ({data['total_tickets_worked']} tickets)")

# ============================================================================
# STEP 7: Calculate Dashboard Stats
# ============================================================================
print("\n[STEP 5] Calculating dashboard statistics...")

total_partners = len(partners)
total_engineers = len(engineers_dict)
partners_with_engineers = sum(1 for p in partners.values() if p['engineer_count'] > 0)
engineers_with_partners = sum(1 for e in engineers_dict.values() if e['partner_count'] > 0)

total_csat_responses = sum(p['total_csat_responses'] for p in partners.values())
total_happy = sum(p['happy_ratings'] for p in partners.values())
avg_csat_score = round((total_happy / total_csat_responses * 100), 2) if total_csat_responses > 0 else 0

# Calculate overall metrics
total_billable_hours = sum(e['total_billable_hours'] for e in engineers_dict.values())
total_tickets_worked = sum(e['total_tickets_worked'] for e in engineers_dict.values())
total_tickets_closed = sum(e['total_tickets_closed'] for e in engineers_dict.values())
total_days_worked = sum(e['days_worked'] for e in engineers_dict.values())

avg_utilization_pct = round(
    (total_billable_hours / (total_days_worked * 8) * 100), 2
) if total_days_worked > 0 else 0

dashboard_stats = {
    'total_partners': total_partners,
    'total_engineers': total_engineers,
    'partners_with_engineers': partners_with_engineers,
    'engineers_with_partners': engineers_with_partners,
    'total_csat_responses': total_csat_responses,
    'avg_csat_score': avg_csat_score,
    'avg_utilization_pct': avg_utilization_pct,
    'total_billable_hours': round(total_billable_hours, 2),
    'total_tickets_worked': total_tickets_worked,
    'total_tickets_closed': total_tickets_closed,
    'ticket_close_rate': round((total_tickets_closed / total_tickets_worked * 100), 2) if total_tickets_worked > 0 else 0
}

print(f"\n✓ Dashboard Statistics:")
print(f"  - Partners: {total_partners}")
print(f"  - Engineers: {total_engineers}")
print(f"  - Avg CSAT: {avg_csat_score}%")
print(f"  - Avg Utilization: {avg_utilization_pct}%")
print(f"  - Tickets Worked: {total_tickets_worked}")
print(f"  - Tickets Closed: {total_tickets_closed}")
print(f"  - Close Rate: {dashboard_stats['ticket_close_rate']}%")

# ============================================================================
# STEP 8: Save JSON Files
# ============================================================================
print("\n[STEP 6] Saving JSON files...")

# Save to root directory
with open('partner_mapping.json', 'w') as f:
    json.dump(partners, f, indent=2)
print("✓ Saved: partner_mapping.json")

with open('engineer_profiles.json', 'w') as f:
    json.dump(engineers_dict, f, indent=2)
print("✓ Saved: engineer_profiles.json")

with open('dashboard_stats.json', 'w') as f:
    json.dump(dashboard_stats, f, indent=2)
print("✓ Saved: dashboard_stats.json")

# Also save to src directory for import
with open('src/partner_mapping.json', 'w') as f:
    json.dump(partners, f, indent=2)

with open('src/engineer_profiles.json', 'w') as f:
    json.dump(engineers_dict, f, indent=2)

with open('src/dashboard_stats.json', 'w') as f:
    json.dump(dashboard_stats, f, indent=2)

print("✓ Also saved to src/ directory")

print("\n" + "="*100)
print("✅ DATA GENERATION COMPLETE!")
print("="*100)
print("\nGenerated files:")
print("  1. partner_mapping.json - Partner details with engineers and CSAT")
print("  2. engineer_profiles.json - Individual engineer metrics and history")
print("  3. dashboard_stats.json - Overall dashboard statistics")
print("\nReady for dashboard integration!")
