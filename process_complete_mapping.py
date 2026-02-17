import pandas as pd
import json
from collections import defaultdict
from datetime import datetime

print("=" * 80)
print("COMPREHENSIVE PARTNER-ENGINEER MAPPING & DATA PROCESSING")
print("=" * 80)

# Load data files
csat_file = 'Doc/csat_survey-2.xlsx'
utilization_file = 'Doc/MDE _ UTILIZATION 10-2.xlsx'

# Load CSAT data
csat_df = pd.read_excel(csat_file)
print(f"\n📊 CSAT Survey Data: {csat_df.shape[0]} records")

# Load Utilization data from Form1 sheet
util_df = pd.read_excel(utilization_file, sheet_name='Form1')
print(f"📊 Utilization Data: {util_df.shape[0]} records")

print("\n" + "=" * 80)
print("STEP 1: CREATE EMAIL-TO-PARTNER MAPPING FROM CSAT")
print("=" * 80)

# Build email-to-partner mapping from CSAT data
email_partner_map = {}
partner_details = defaultdict(lambda: {
    'emails': set(),
    'contact_names': set(),
    'csat_ratings': [],
    'csat_comments': [],
    'team_members_mentioned': set()
})

for idx, row in csat_df.iterrows():
    email = row.get('Contact Email')
    partner = row.get('Company')
    contact_name = row.get('Contact Name')
    rating = row.get('Rating')
    comment = row.get('Comments')
    team_member = row.get('Team Member')
    
    if pd.notna(email) and pd.notna(partner):
        email_str = str(email).lower().strip()
        partner_str = str(partner).strip()
        
        email_partner_map[email_str] = partner_str
        partner_details[partner_str]['emails'].add(email_str)
        
        if pd.notna(contact_name):
            partner_details[partner_str]['contact_names'].add(str(contact_name))
        
        if pd.notna(rating):
            partner_details[partner_str]['csat_ratings'].append(str(rating))
        
        if pd.notna(comment):
            partner_details[partner_str]['csat_comments'].append({
                'comment': str(comment),
                'rating': str(rating) if pd.notna(rating) else 'N/A',
                'date': str(row.get('Date')) if pd.notna(row.get('Date')) else 'N/A',
                'team_member': str(team_member) if pd.notna(team_member) else 'N/A'
            })
        
        if pd.notna(team_member):
            partner_details[partner_str]['team_members_mentioned'].add(str(team_member))

print(f"✅ Created mapping for {len(email_partner_map)} unique email addresses")
print(f"✅ Identified {len(partner_details)} unique partners")

print("\n" + "=" * 80)
print("STEP 2: MAP ENGINEERS TO PARTNERS USING EMAIL DOMAINS")
print("=" * 80)

# Create engineer profiles with partner mapping
engineer_profiles = {}
partner_engineer_map = defaultdict(lambda: {
    'engineers': [],
    'tdls': set(),
    'total_entries': 0
})

for idx, row in util_df.iterrows():
    email = row.get('Email')
    name = row.get('Name')
    tdl = row.get('Reporting Manager')
    date = row.get('Date')
    billable = row.get('Billable Hours')
    non_billable = row.get('Non Billable Hours (Excluding Admin & Break)')
    tickets_worked = row.get('No. Tickets Worked')
    tickets_closed = row.get('No. Tickets Closed')
    
    if pd.notna(email) and pd.notna(name):
        email_str = str(email).lower().strip()
        name_str = str(name).strip()
        
        # Initialize engineer profile if not exists
        if email_str not in engineer_profiles:
            engineer_profiles[email_str] = {
                'name': name_str,
                'email': email_str,
                'tdl': str(tdl) if pd.notna(tdl) else 'Unassigned',
                'partners': set(),
                'utilization_records': [],
                'total_billable_hours': 0,
                'total_tickets_worked': 0,
                'total_tickets_closed': 0,
                'csat_feedback': []
            }
        
        # Add utilization record
        if pd.notna(date):
            # Safely convert to numeric values
            try:
                billable_val = float(billable) if pd.notna(billable) else 0
            except (ValueError, TypeError):
                billable_val = 0
            
            try:
                non_billable_val = float(non_billable) if pd.notna(non_billable) else 0
            except (ValueError, TypeError):
                non_billable_val = 0
            
            try:
                tickets_worked_val = int(float(tickets_worked)) if pd.notna(tickets_worked) else 0
            except (ValueError, TypeError):
                tickets_worked_val = 0
            
            try:
                tickets_closed_val = int(float(tickets_closed)) if pd.notna(tickets_closed) else 0
            except (ValueError, TypeError):
                tickets_closed_val = 0
            
            engineer_profiles[email_str]['utilization_records'].append({
                'date': str(date),
                'billable_hours': billable_val,
                'non_billable_hours': non_billable_val,
                'tickets_worked': tickets_worked_val,
                'tickets_closed': tickets_closed_val
            })
            
            engineer_profiles[email_str]['total_billable_hours'] += billable_val
            engineer_profiles[email_str]['total_tickets_worked'] += tickets_worked_val
            engineer_profiles[email_str]['total_tickets_closed'] += tickets_closed_val

print(f"✅ Created profiles for {len(engineer_profiles)} engineers")

print("\n" + "=" * 80)
print("STEP 3: MAP ENGINEERS TO PARTNERS VIA CSAT MENTIONS")
print("=" * 80)

# Map engineers to partners based on mentions in CSAT comments
for engineer_email, profile in engineer_profiles.items():
    engineer_name = profile['name']
    
    # Search for this engineer in CSAT feedback
    for idx, row in csat_df.iterrows():
        partner = row.get('Company')
        comment = row.get('Comments')
        team_member = row.get('Team Member')
        rating = row.get('Rating')
        date = row.get('Date')
        
        if pd.notna(partner):
            partner_str = str(partner).strip()
            
            # Check if engineer is mentioned in comment or team member field
            is_mentioned = False
            
            if pd.notna(team_member) and engineer_name.lower() in str(team_member).lower():
                is_mentioned = True
            
            if pd.notna(comment) and engineer_name.lower() in str(comment).lower():
                is_mentioned = True
            
            if is_mentioned:
                profile['partners'].add(partner_str)
                profile['csat_feedback'].append({
                    'partner': partner_str,
                    'rating': str(rating) if pd.notna(rating) else 'N/A',
                    'comment': str(comment) if pd.notna(comment) else '',
                    'date': str(date) if pd.notna(date) else 'N/A'
                })
                
                # Add to partner mapping
                if engineer_email not in [e['email'] for e in partner_engineer_map[partner_str]['engineers']]:
                    partner_engineer_map[partner_str]['engineers'].append({
                        'name': engineer_name,
                        'email': engineer_email,
                        'tdl': profile['tdl']
                    })
                    partner_engineer_map[partner_str]['tdls'].add(profile['tdl'])

print(f"✅ Mapped engineers to partners based on CSAT mentions")

print("\n" + "=" * 80)
print("STEP 4: GENERATE FINAL MAPPING DATA")
print("=" * 80)

# Convert to JSON-serializable format
final_partner_mapping = {}
for partner, data in partner_engineer_map.items():
    final_partner_mapping[partner] = {
        'engineers': data['engineers'],
        'tdls': list(data['tdls']),
        'engineer_count': len(data['engineers']),
        'csat_ratings': partner_details[partner]['csat_ratings'],
        'csat_comments': partner_details[partner]['csat_comments'][:10],  # Limit to 10 most recent
        'contact_emails': list(partner_details[partner]['emails']),
        'contact_names': list(partner_details[partner]['contact_names'])
    }

final_engineer_profiles = {}
for email, profile in engineer_profiles.items():
    final_engineer_profiles[email] = {
        'name': profile['name'],
        'email': profile['email'],
        'tdl': profile['tdl'],
        'partners': list(profile['partners']),
        'total_billable_hours': round(profile['total_billable_hours'], 2),
        'total_tickets_worked': profile['total_tickets_worked'],
        'total_tickets_closed': profile['total_tickets_closed'],
        'avg_tickets_per_day': round(profile['total_tickets_worked'] / max(len(profile['utilization_records']), 1), 2),
        'utilization_records': profile['utilization_records'][-30:],  # Last 30 records
        'csat_feedback': profile['csat_feedback']
    }

# Save mappings
with open('partner_engineer_mapping.json', 'w') as f:
    json.dump(final_partner_mapping, f, indent=2)

with open('engineer_profiles.json', 'w') as f:
    json.dump(final_engineer_profiles, f, indent=2)

print(f"\n✅ Saved partner mapping: {len(final_partner_mapping)} partners")
print(f"✅ Saved engineer profiles: {len(final_engineer_profiles)} engineers")

# Display summary
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)

print("\n🏢 Top 10 Partners by Engineer Count:")
sorted_partners = sorted(final_partner_mapping.items(), key=lambda x: x[1]['engineer_count'], reverse=True)
for i, (partner, data) in enumerate(sorted_partners[:10], 1):
    print(f"{i}. {partner}: {data['engineer_count']} engineers, TDLs: {', '.join(data['tdls'])}")

print("\n👨‍💻 Top 10 Engineers by Ticket Count:")
sorted_engineers = sorted(final_engineer_profiles.items(), key=lambda x: x[1]['total_tickets_worked'], reverse=True)
for i, (email, data) in enumerate(sorted_engineers[:10], 1):
    print(f"{i}. {data['name']}: {data['total_tickets_worked']} tickets, {data['total_billable_hours']}h billable, Partners: {len(data['partners'])}")

print("\n" + "=" * 80)
print("✅ DATA PROCESSING COMPLETE!")
print("=" * 80)
