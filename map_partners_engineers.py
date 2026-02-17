import pandas as pd
import json
from collections import defaultdict

# Load both Excel files
csat_file = 'Doc/csat_survey-2.xlsx'
utilization_file = 'Doc/MDE _ UTILIZATION 10-2.xlsx'

print("=" * 80)
print("MAPPING ENGINEERS TO PARTNERS VIA EMAIL")
print("=" * 80)

# Load CSAT data
csat_df = pd.read_excel(csat_file)
print(f"\n📊 CSAT Survey Data Shape: {csat_df.shape}")
print(f"Columns: {list(csat_df.columns)}\n")

# Load Utilization data
util_df = pd.read_excel(utilization_file)
print(f"📊 Utilization Data Shape: {util_df.shape}")
print(f"Columns: {list(util_df.columns)}\n")

# Find email and partner columns
print("=" * 80)
print("ANALYZING EMAIL AND PARTNER COLUMNS")
print("=" * 80)

# CSAT columns
csat_email_cols = [col for col in csat_df.columns if 'email' in col.lower() or 'mail' in col.lower()]
csat_partner_cols = [col for col in csat_df.columns if 'partner' in col.lower() or 'company' in col.lower() or 'organization' in col.lower()]

print("\n🔍 CSAT Email Columns:", csat_email_cols)
print("🔍 CSAT Partner Columns:", csat_partner_cols)

# Utilization columns
util_email_cols = [col for col in util_df.columns if 'email' in col.lower() or 'mail' in col.lower()]
util_partner_cols = [col for col in util_df.columns if 'partner' in col.lower() or 'company' in col.lower() or 'organization' in col.lower()]
util_engineer_cols = [col for col in util_df.columns if 'engineer' in col.lower() or 'name' in col.lower()]
util_tdl_cols = [col for col in util_df.columns if 'tdl' in col.lower() or 'lead' in col.lower()]

print("🔍 Utilization Email Columns:", util_email_cols)
print("🔍 Utilization Partner Columns:", util_partner_cols)
print("🔍 Utilization Engineer Columns:", util_engineer_cols)
print("🔍 Utilization TDL Columns:", util_tdl_cols)

# Sample data from both files
print("\n" + "=" * 80)
print("SAMPLE DATA - CSAT")
print("=" * 80)
print(csat_df.head(10).to_string())

print("\n" + "=" * 80)
print("SAMPLE DATA - UTILIZATION")
print("=" * 80)
print(util_df.head(10).to_string())

# Extract unique emails and partners
print("\n" + "=" * 80)
print("MAPPING ANALYSIS")
print("=" * 80)

# Try to find the mapping
# Check if there's a direct email column in utilization data
if util_email_cols:
    email_col = util_email_cols[0]
    print(f"\n✅ Found email column in utilization: {email_col}")
    
    # Sample emails
    sample_emails = util_df[email_col].dropna().head(20)
    print(f"\nSample emails from utilization:\n{sample_emails.to_string()}")

# Check for partner column in utilization
if util_partner_cols:
    partner_col = util_partner_cols[0]
    print(f"\n✅ Found partner column in utilization: {partner_col}")
    
    # Unique partners
    unique_partners = util_df[partner_col].dropna().unique()
    print(f"\nUnique partners ({len(unique_partners)}):")
    for partner in unique_partners[:20]:
        print(f"  - {partner}")

# Check if we can map via CSAT
if csat_email_cols and csat_partner_cols:
    csat_email_col = csat_email_cols[0]
    csat_partner_col = csat_partner_cols[0]
    
    print(f"\n✅ Found email and partner in CSAT: {csat_email_col}, {csat_partner_col}")
    
    # Create email-to-partner mapping from CSAT
    email_partner_map = {}
    for idx, row in csat_df.iterrows():
        email = row.get(csat_email_col)
        partner = row.get(csat_partner_col)
        if pd.notna(email) and pd.notna(partner):
            # Extract domain from email
            if '@' in str(email):
                domain = str(email).split('@')[1].lower()
                email_partner_map[str(email).lower()] = str(partner)
    
    print(f"\n📧 Created email-to-partner mapping with {len(email_partner_map)} entries")
    print("\nSample mappings:")
    for i, (email, partner) in enumerate(list(email_partner_map.items())[:10]):
        print(f"  {email} → {partner}")

# Create comprehensive mapping structure
print("\n" + "=" * 80)
print("CREATING PARTNER-ENGINEER MAPPING")
print("=" * 80)

# Build the master mapping
partner_engineer_mapping = defaultdict(lambda: {
    'engineers': [],
    'emails': set(),
    'tdls': set()
})

# If we have utilization data with engineer names and emails
if util_engineer_cols and util_email_cols:
    engineer_col = util_engineer_cols[0]
    email_col = util_email_cols[0]
    tdl_col = util_tdl_cols[0] if util_tdl_cols else None
    
    for idx, row in util_df.iterrows():
        engineer = row.get(engineer_col)
        email = row.get(email_col)
        tdl = row.get(tdl_col) if tdl_col else None
        
        if pd.notna(engineer) and pd.notna(email):
            email_str = str(email).lower()
            
            # Try to find partner from CSAT mapping
            partner = email_partner_map.get(email_str)
            
            if partner:
                partner_engineer_mapping[partner]['engineers'].append(str(engineer))
                partner_engineer_mapping[partner]['emails'].add(email_str)
                if pd.notna(tdl):
                    partner_engineer_mapping[partner]['tdls'].add(str(tdl))

# Convert sets to lists for JSON serialization
mapping_output = {}
for partner, data in partner_engineer_mapping.items():
    mapping_output[partner] = {
        'engineers': list(set(data['engineers'])),
        'emails': list(data['emails']),
        'tdls': list(data['tdls'])
    }

print(f"\n✅ Mapped {len(mapping_output)} partners to their engineers\n")

for partner, data in list(mapping_output.items())[:10]:
    print(f"\n🏢 {partner}")
    print(f"  Engineers: {len(data['engineers'])}")
    print(f"  TDLs: {', '.join(data['tdls'])}")
    print(f"  Sample engineers: {', '.join(data['engineers'][:3])}")

# Save mapping to JSON
with open('partner_engineer_mapping.json', 'w') as f:
    json.dump(mapping_output, f, indent=2)

print("\n" + "=" * 80)
print("✅ Mapping saved to partner_engineer_mapping.json")
print("=" * 80)
