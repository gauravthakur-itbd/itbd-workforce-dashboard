"""
Comprehensive Data Analysis Script for ITBD Workforce Intelligence Dashboard
Analyzes cleaned 90-day data with start/completion times
Generates real data JSON files for dashboard
Author: Principal Data Analyst & Frontend Engineer
Date: February 17, 2026
"""

import pandas as pd
import json
from pathlib import Path
from datetime import datetime, timedelta
import numpy as np

print("="*100)
print("ITBD WORKFORCE INTELLIGENCE - DATA ANALYSIS")
print("="*100)

# File paths
mde_file = Path("Doc/MDE_Utalisation_BI.xlsx")
csat_file = Path("Doc/csat_survey-2.xlsx")

# Load the cleaned utilization data
print("\n[1/6] Loading cleaned MDE utilization data...")
mde_df = pd.read_excel(mde_file)
print(f"✓ Loaded {len(mde_df)} records")
print(f"✓ Columns: {list(mde_df.columns)}")
print(f"\nFirst few rows:")
print(mde_df.head(10))

# Load CSAT data
print("\n[2/6] Loading CSAT survey data...")
csat_df = pd.read_excel(csat_file, sheet_name='CSAT_Review')
print(f"✓ Loaded {len(csat_df)} CSAT reviews")
print(f"✓ Columns: {list(csat_df.columns)}")

# Identify key columns
print("\n[3/6] Identifying data structure...")
print("\nColumn analysis:")
for col in mde_df.columns:
    non_null = mde_df[col].notna().sum()
    unique = mde_df[col].nunique()
    print(f"  - {col}: {non_null} non-null, {unique} unique values")
    if unique < 20 and unique > 0:
        print(f"    Sample values: {list(mde_df[col].dropna().unique()[:5])}")

print("\n[4/6] Analyzing time columns...")
# Look for start/completion time columns
time_cols = [col for col in mde_df.columns if any(word in str(col).lower() 
             for word in ['start', 'complete', 'time', 'date', 'created', 'closed'])]
print(f"Time-related columns: {time_cols}")

for col in time_cols:
    print(f"\n{col}:")
    print(f"  Type: {mde_df[col].dtype}")
    print(f"  Sample values: {list(mde_df[col].dropna().head(3))}")

# Identify partner, engineer, and TTL columns
print("\n[5/6] Identifying business entities...")

# Partner column
partner_cols = [col for col in mde_df.columns if any(word in str(col).lower() 
                for word in ['partner', 'company', 'account', 'client'])]
print(f"Partner columns: {partner_cols}")

# Engineer column
engineer_cols = [col for col in mde_df.columns if any(word in str(col).lower() 
                 for word in ['engineer', 'assignee', 'technician', 'resource'])]
print(f"Engineer columns: {engineer_cols}")

# TTL/Manager column
ttl_cols = [col for col in mde_df.columns if any(word in str(col).lower() 
            for word in ['ttl', 'tdl', 'manager', 'lead', 'supervisor', 'reporting'])]
print(f"TTL/Manager columns: {ttl_cols}")

# Ticket/Hours columns
ticket_cols = [col for col in mde_df.columns if any(word in str(col).lower() 
               for word in ['ticket', 'issue', 'task', 'work'])]
print(f"Ticket columns: {ticket_cols}")

hours_cols = [col for col in mde_df.columns if any(word in str(col).lower() 
              for word in ['hour', 'time', 'duration', 'billable'])]
print(f"Hours columns: {hours_cols}")

print("\n[6/6] Data quality check...")
print(f"\nTotal records: {len(mde_df)}")
print(f"Date range: {mde_df[time_cols[0]].min() if time_cols else 'N/A'} to {mde_df[time_cols[0]].max() if time_cols else 'N/A'}")

# Partner analysis
if partner_cols:
    partner_col = partner_cols[0]
    unique_partners = mde_df[partner_col].nunique()
    print(f"\n✓ Unique partners: {unique_partners}")
    print(f"✓ Partner column: '{partner_col}'")
    
# Engineer analysis
if engineer_cols:
    engineer_col = engineer_cols[0]
    unique_engineers = mde_df[engineer_col].nunique()
    print(f"✓ Unique engineers: {unique_engineers}")
    print(f"✓ Engineer column: '{engineer_col}'")

# TTL analysis
if ttl_cols:
    ttl_col = ttl_cols[0]
    unique_ttls = mde_df[ttl_col].nunique()
    print(f"✓ Unique TTLs: {unique_ttls}")
    print(f"✓ TTL column: '{ttl_col}'")

print("\n" + "="*100)
print("DATA STRUCTURE ANALYSIS COMPLETE")
print("="*100)
print("\nNext step: Review the column names above and update the data processing script")
print("with the correct column mappings for:")
print("  1. Partner name")
print("  2. Engineer name/email")
print("  3. TTL/Reporting Manager")
print("  4. Start time")
print("  5. Completion time")
print("  6. Billable hours")
print("  7. Ticket information")
