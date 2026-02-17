import pandas as pd
from pathlib import Path

# File paths
csat_file = Path("Doc/csat_survey-2.xlsx")
mde_file = Path("Doc/MDE _ UTILIZATION 10-2.xlsx")

print("=" * 80)
print("MDE UTILIZATION FILE - DETAILED ANALYSIS")
print("=" * 80)

# Read all sheets from MDE file
mde_excel = pd.ExcelFile(mde_file)
print(f"\nSheet names: {mde_excel.sheet_names}")

# Analyze each non-empty sheet
for sheet_name in mde_excel.sheet_names:
    print(f"\n{'=' * 80}")
    print(f"SHEET: {sheet_name}")
    print(f"{'=' * 80}")
    
    df = pd.read_excel(mde_file, sheet_name=sheet_name)
    
    if df.empty or len(df.columns) == 0:
        print("EMPTY SHEET - Skipping")
        continue
    
    print(f"\nShape: {df.shape} (rows x columns)")
    print(f"\nColumns ({len(df.columns)}):")
    for i, col in enumerate(df.columns, 1):
        print(f"  {i}. {col}")
    
    print(f"\nData Types:\n{df.dtypes}")
    
    print(f"\nFirst 15 rows:")
    with pd.option_context('display.max_columns', None, 'display.width', None, 'display.max_colwidth', 50):
        print(df.head(15))
    
    print(f"\nLast 10 rows:")
    with pd.option_context('display.max_columns', None, 'display.width', None, 'display.max_colwidth', 50):
        print(df.tail(10))
    
    print(f"\nMissing values:")
    missing = df.isnull().sum()
    print(missing[missing > 0])
    
    print(f"\nUnique value counts for all columns:")
    for col in df.columns:
        unique_count = df[col].nunique()
        total_count = len(df[col])
        missing_count = df[col].isnull().sum()
        print(f"  {col}: {unique_count} unique | {total_count} total | {missing_count} missing")
        
        # Show sample values for categorical columns
        if unique_count < 100 and unique_count > 0:
            samples = df[col].dropna().unique()[:15]
            print(f"    Samples: {list(samples)}")
    
    # Numeric columns analysis
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        print(f"\nNumeric columns statistics:")
        print(df[numeric_cols].describe())
    
    # Look for time/date patterns
    date_like_cols = [col for col in df.columns if any(word in str(col).lower() for word in ['date', 'time', 'period', 'month', 'year', 'week'])]
    if date_like_cols:
        print(f"\nDate-like columns found: {date_like_cols}")
        for col in date_like_cols:
            print(f"\n  {col}:")
            print(f"    Min: {df[col].min()}")
            print(f"    Max: {df[col].max()}")
            print(f"    Sample values: {df[col].dropna().unique()[:10]}")

# Now compare with CSAT
print("\n" + "=" * 80)
print("CROSS-FILE PARTNER MATCHING ANALYSIS")
print("=" * 80)

# Load CSAT
csat_df = pd.read_excel(csat_file, sheet_name='CSAT_Review')
print(f"\nCSAT file has {len(csat_df)} reviews from 'Company' column")

# Get unique companies from CSAT
csat_companies = sorted(csat_df['Company'].dropna().unique())
print(f"\nUnique companies in CSAT ({len(csat_companies)}):")
for i, company in enumerate(csat_companies, 1):
    count = len(csat_df[csat_df['Company'] == company])
    print(f"  {i}. {company} ({count} reviews)")

# Load MDE data from the non-empty sheet
for sheet_name in mde_excel.sheet_names:
    df_test = pd.read_excel(mde_file, sheet_name=sheet_name)
    if not df_test.empty and len(df_test.columns) > 0:
        mde_df = df_test
        mde_sheet_name = sheet_name
        break

print(f"\nUsing MDE sheet: {mde_sheet_name}")

# Find partner/account column in MDE
partner_cols = [col for col in mde_df.columns if any(word in str(col).lower() for word in ['partner', 'account', 'company', 'client'])]
print(f"\nPotential partner columns in MDE: {partner_cols}")

if partner_cols:
    partner_col = partner_cols[0]
    mde_partners = sorted(mde_df[partner_col].dropna().unique())
    print(f"\nUnique partners in MDE ({partner_col}): {len(mde_partners)}")
    for i, partner in enumerate(mde_partners, 1):
        count = len(mde_df[mde_df[partner_col] == partner])
        print(f"  {i}. {partner} ({count} records)")
    
    # Compare
    print("\n" + "=" * 80)
    print("PARTNER OVERLAP ANALYSIS")
    print("=" * 80)
    
    csat_set = set([str(c).strip().lower() for c in csat_companies])
    mde_set = set([str(p).strip().lower() for p in mde_partners])
    
    overlap = csat_set.intersection(mde_set)
    csat_only = csat_set - mde_set
    mde_only = mde_set - csat_set
    
    print(f"\nPartners in BOTH files: {len(overlap)}")
    if overlap:
        print("  Partners:")
        for p in sorted(overlap):
            print(f"    - {p}")
    
    print(f"\nPartners ONLY in CSAT: {len(csat_only)}")
    if csat_only:
        for p in sorted(csat_only):
            print(f"    - {p}")
    
    print(f"\nPartners ONLY in MDE: {len(mde_only)}")
    if mde_only:
        for p in sorted(mde_only):
            print(f"    - {p}")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE")
print("=" * 80)
