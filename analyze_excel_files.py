import pandas as pd
import numpy as np
from pathlib import Path

# File paths
csat_file = Path("Doc/csat_survey-2.xlsx")
mde_file = Path("Doc/MDE _ UTILIZATION 10-2.xlsx")

print("=" * 80)
print("ANALYZING CSAT SURVEY FILE")
print("=" * 80)

# Read all sheets from CSAT file
csat_excel = pd.ExcelFile(csat_file)
print(f"\nSheet names in CSAT file: {csat_excel.sheet_names}")

for sheet_name in csat_excel.sheet_names:
    print(f"\n{'=' * 80}")
    print(f"SHEET: {sheet_name}")
    print(f"{'=' * 80}")
    
    df = pd.read_excel(csat_file, sheet_name=sheet_name)
    
    print(f"\nShape: {df.shape} (rows x columns)")
    print(f"\nColumns: {list(df.columns)}")
    print(f"\nData Types:\n{df.dtypes}")
    print(f"\nFirst 10 rows:")
    print(df.head(10))
    print(f"\nLast 5 rows:")
    print(df.tail(5))
    print(f"\nMissing values:\n{df.isnull().sum()}")
    print(f"\nUnique value counts for key columns:")
    for col in df.columns:
        unique_count = df[col].nunique()
        print(f"  {col}: {unique_count} unique values")
        if unique_count < 50 and unique_count > 0:
            print(f"    Sample values: {df[col].dropna().unique()[:10]}")
    
    print(f"\nDescriptive statistics:")
    print(df.describe(include='all'))

print("\n" + "=" * 80)
print("ANALYZING MDE UTILIZATION FILE")
print("=" * 80)

# Read all sheets from MDE file
mde_excel = pd.ExcelFile(mde_file)
print(f"\nSheet names in MDE file: {mde_excel.sheet_names}")

for sheet_name in mde_excel.sheet_names:
    print(f"\n{'=' * 80}")
    print(f"SHEET: {sheet_name}")
    print(f"{'=' * 80}")
    
    df = pd.read_excel(mde_file, sheet_name=sheet_name)
    
    print(f"\nShape: {df.shape} (rows x columns)")
    print(f"\nColumns: {list(df.columns)}")
    print(f"\nData Types:\n{df.dtypes}")
    print(f"\nFirst 10 rows:")
    print(df.head(10))
    print(f"\nLast 5 rows:")
    print(df.tail(5))
    print(f"\nMissing values:\n{df.isnull().sum()}")
    print(f"\nUnique value counts for key columns:")
    for col in df.columns:
        unique_count = df[col].nunique()
        print(f"  {col}: {unique_count} unique values")
        if unique_count < 50 and unique_count > 0:
            print(f"    Sample values: {df[col].dropna().unique()[:10]}")
    
    print(f"\nDescriptive statistics:")
    print(df.describe(include='all'))

print("\n" + "=" * 80)
print("CROSS-FILE ANALYSIS")
print("=" * 80)

# Load primary sheets for comparison
csat_df = pd.read_excel(csat_file, sheet_name=csat_excel.sheet_names[0])
mde_df = pd.read_excel(mde_file, sheet_name=mde_excel.sheet_names[0])

# Try to identify partner/account columns
print("\nIdentifying partner/account columns...")
print(f"\nCSAT columns: {list(csat_df.columns)}")
print(f"\nMDE columns: {list(mde_df.columns)}")

# Look for partner-related columns
csat_partner_cols = [col for col in csat_df.columns if any(word in str(col).lower() for word in ['partner', 'account', 'company', 'client', 'customer'])]
mde_partner_cols = [col for col in mde_df.columns if any(word in str(col).lower() for word in ['partner', 'account', 'company', 'client', 'customer'])]

print(f"\nPotential partner columns in CSAT: {csat_partner_cols}")
print(f"\nPotential partner columns in MDE: {mde_partner_cols}")

if csat_partner_cols and mde_partner_cols:
    print(f"\nUnique partners in CSAT ({csat_partner_cols[0]}):")
    csat_partners = sorted(csat_df[csat_partner_cols[0]].dropna().unique())
    print(csat_partners)
    print(f"Total: {len(csat_partners)}")
    
    print(f"\nUnique partners in MDE ({mde_partner_cols[0]}):")
    mde_partners = sorted(mde_df[mde_partner_cols[0]].dropna().unique())
    print(mde_partners)
    print(f"Total: {len(mde_partners)}")
    
    # Find overlap
    csat_set = set([str(p).strip().lower() for p in csat_partners if pd.notna(p)])
    mde_set = set([str(p).strip().lower() for p in mde_partners if pd.notna(p)])
    
    overlap = csat_set.intersection(mde_set)
    csat_only = csat_set - mde_set
    mde_only = mde_set - csat_set
    
    print(f"\nPartners in both files: {len(overlap)}")
    print(f"Partners only in CSAT: {len(csat_only)}")
    print(f"Partners only in MDE: {len(mde_only)}")
    
    if csat_only:
        print(f"\nPartners in CSAT but not in MDE (first 20): {list(csat_only)[:20]}")
    if mde_only:
        print(f"\nPartners in MDE but not in CSAT (first 20): {list(mde_only)[:20]}")

# Look for date columns
print("\n" + "=" * 80)
print("DATE/TIME ANALYSIS")
print("=" * 80)

csat_date_cols = [col for col in csat_df.columns if any(word in str(col).lower() for word in ['date', 'time', 'period', 'month', 'year', 'submitted'])]
mde_date_cols = [col for col in mde_df.columns if any(word in str(col).lower() for word in ['date', 'time', 'period', 'month', 'year'])]

print(f"\nDate columns in CSAT: {csat_date_cols}")
print(f"\nDate columns in MDE: {mde_date_cols}")

if csat_date_cols:
    for col in csat_date_cols[:3]:
        print(f"\nCSAT {col} - sample values:")
        print(csat_df[col].dropna().head(10))
        print(f"Min: {csat_df[col].min()}, Max: {csat_df[col].max()}")

if mde_date_cols:
    for col in mde_date_cols[:3]:
        print(f"\nMDE {col} - sample values:")
        print(mde_df[col].dropna().head(10))
        print(f"Min: {mde_df[col].min()}, Max: {mde_df[col].max()}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
