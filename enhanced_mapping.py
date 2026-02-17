import pandas as pd
import json
from collections import defaultdict
import re

print("=" * 80)
print("ENHANCED PARTNER-ENGINEER MAPPING WITH NAME MATCHING")
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
print("STEP 1: BUILD PARTNER DATABASE FROM CSAT")
print("=" * 80)

partner_database = defaultdict(lambda: {
    'emails': set(),
    'contact_names': set(),
    'csat_ratings': [],
    'csat_comments': [],
    'team_members_mentioned': set(),
    'engineers': set()
})

for idx, row in csat_df.iterrows():
    partner = row.get('Company')
    email = row.get('Contact Email')
    contact_name = row.get('Contact Name')
    rating = row.get('Rating')
    comment = row.get('Comments')
    team_member = row.get('Team Member')
    ticket_name = row.get('Ticket Name')
    date = row.get('Date')
    
    if pd.notna(partner):
        partner_str = str(partner).strip()
        
        if pd.notna(email):
            partner_database[partner_str]['emails'].add(str(email).lower().strip())
        
        if pd.notna(contact_name):
            partner_database[partner_str]['contact_names'].add(str(contact_name))
        
        if pd.notna(rating):
            partner_database[partner_str]['csat_ratings'].append(str(rating))
        
        # Extract engineer name from ticket name (e.g., "Monthly Feedback For Jamie...")
        engineer_name_from_ticket = None
        if pd.notna(ticket_name):
            match = re.search(r'for\s+(\w+)', str(ticket_name), re.IGNORECASE)
            if match:
                engineer_name_from_ticket = match.group(1).strip()
        
        # Store CSAT comment with engineer reference
        if pd.notna(comment) or engineer_name_from_ticket:
            partner_database[partner_str]['csat_comments'].append({
                'comment': str(comment) if pd.notna(comment) else '',
                'rating': str(rating) if pd.notna(rating) else 'N/A',
                'date': str(date) if pd.notna(date) else 'N/A',
                'team_member': str(team_member) if pd.notna(team_member) else 'N/A',
                'engineer_mentioned': engineer_name_from_ticket
            })
        
        if engineer_name_from_ticket:
            partner_database[partner_str]['team_members_mentioned'].add(engineer_name_from_ticket)
        
        if pd.notna(team_member):
            partner_database[partner_str]['team_members_mentioned'].add(str(team_member))

print(f"✅ Built database for {len(partner_database)} unique partners")

print("\n" + "=" * 80)
print("STEP 2: BUILD ENGINEER PROFILES")
print("=" * 80)

engineer_database = {}

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
        
        # Extract first name
        first_name = name_str.split()[0] if name_str else ''
        
        if email_str not in engineer_database:
            engineer_database[email_str] = {
                'name': name_str,
                'first_name': first_name,
                'email': email_str,
                'tdl': str(tdl) if pd.notna(tdl) else 'Unassigned',
                'partners': set(),
                'utilization_records': [],
                'total_billable_hours': 0,
                'total_tickets_worked': 0,
                'total_tickets_closed': 0,
                'csat_feedback': [],
                'days_worked': 0
            }
        
        # Add utilization record
        if pd.notna(date):
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
            
            engineer_database[email_str]['utilization_records'].append({
                'date': str(date),
                'billable_hours': billable_val,
                'non_billable_hours': non_billable_val,
                'tickets_worked': tickets_worked_val,
                'tickets_closed': tickets_closed_val
            })
            
            engineer_database[email_str]['total_billable_hours'] += billable_val
            engineer_database[email_str]['total_tickets_worked'] += tickets_worked_val
            engineer_database[email_str]['total_tickets_closed'] += tickets_closed_val
            engineer_database[email_str]['days_worked'] += 1

print(f"✅ Built profiles for {len(engineer_database)} engineers")

print("\n" + "=" * 80)
print("STEP 3: MAP ENGINEERS TO PARTNERS VIA NAME MATCHING")
print("=" * 80)

mapping_stats = {'exact_match': 0, 'first_name_match': 0, 'no_match': 0}

# Map engineers to partners
for partner, partner_data in partner_database.items():
    for engineer_email, engineer_data in engineer_database.items():
        engineer_full_name = engineer_data['name']
        engineer_first_name = engineer_data['first_name']
        
        # Check if engineer is mentioned in partner's CSAT data
        is_matched = False
        
        for mentioned_name in partner_data['team_members_mentioned']:
            # Exact match (case insensitive)
            if mentioned_name.lower() in engineer_full_name.lower():
                is_matched = True
                mapping_stats['exact_match'] += 1
                break
            
            # First name match
            elif mentioned_name.lower() == engineer_first_name.lower():
                is_matched = True
                mapping_stats['first_name_match'] += 1
                break
        
        if is_matched:
            # Add partner to engineer's list
            engineer_data['partners'].add(partner)
            
            # Add engineer to partner's list
            partner_data['engineers'].add(engineer_email)
            
            # Add CSAT feedback to engineer
            for csat_comment in partner_data['csat_comments']:
                if (csat_comment.get('engineer_mentioned') and 
                    (csat_comment['engineer_mentioned'].lower() == engineer_first_name.lower() or
                     csat_comment['engineer_mentioned'].lower() in engineer_full_name.lower())):
                    
                    engineer_data['csat_feedback'].append({
                        'partner': partner,
                        'rating': csat_comment['rating'],
                        'comment': csat_comment['comment'],
                        'date': csat_comment['date']
                    })

print(f"✅ Mapping complete:")
print(f"   - Exact matches: {mapping_stats['exact_match']}")
print(f"   - First name matches: {mapping_stats['first_name_match']}")

print("\n" + "=" * 80)
print("STEP 4: GENERATE FINAL JSON DATA")
print("=" * 80)

# Convert to JSON-serializable format
final_partner_mapping = {}
for partner, data in partner_database.items():
    engineers_list = []
    for eng_email in data['engineers']:
        if eng_email in engineer_database:
            eng_data = engineer_database[eng_email]
            engineers_list.append({
                'name': eng_data['name'],
                'email': eng_data['email'],
                'tdl': eng_data['tdl'],
                'total_tickets': eng_data['total_tickets_worked'],
                'total_billable_hours': round(eng_data['total_billable_hours'], 2),
                'csat_feedback_count': len(eng_data['csat_feedback'])
            })
    
    # Get unique TDLs
    tdls = list(set([e['tdl'] for e in engineers_list]))
    
    # Calculate aggregate CSAT rating
    happy_count = sum(1 for r in data['csat_ratings'] if r.lower() == 'happy')
    total_ratings = len(data['csat_ratings'])
    csat_score = round((happy_count / total_ratings * 100), 1) if total_ratings > 0 else 0
    
    final_partner_mapping[partner] = {
        'engineers': sorted(engineers_list, key=lambda x: x['total_tickets'], reverse=True),
        'tdls': tdls,
        'engineer_count': len(engineers_list),
        'csat_score': csat_score,
        'total_csat_responses': total_ratings,
        'happy_ratings': happy_count,
        'csat_comments': [
            {
                'comment': c['comment'],
                'rating': c['rating'],
                'date': c['date'],
                'engineer': c.get('engineer_mentioned', 'N/A')
            }
            for c in data['csat_comments']
        ][:20],  # Limit to 20
        'contact_emails': list(data['emails']),
        'contact_names': list(data['contact_names'])
    }

final_engineer_profiles = {}
for email, profile in engineer_database.items():
    avg_utilization = (profile['total_billable_hours'] / max(profile['days_worked'] * 8, 1) * 100) if profile['days_worked'] > 0 else 0
    
    final_engineer_profiles[email] = {
        'name': profile['name'],
        'email': profile['email'],
        'tdl': profile['tdl'],
        'partners': list(profile['partners']),
        'partner_count': len(profile['partners']),
        'total_billable_hours': round(profile['total_billable_hours'], 2),
        'total_tickets_worked': profile['total_tickets_worked'],
        'total_tickets_closed': profile['total_tickets_closed'],
        'days_worked': profile['days_worked'],
        'avg_tickets_per_day': round(profile['total_tickets_worked'] / max(profile['days_worked'], 1), 2),
        'avg_utilization_pct': round(avg_utilization, 1),
        'close_rate': round((profile['total_tickets_closed'] / max(profile['total_tickets_worked'], 1) * 100), 1),
        'recent_utilization': profile['utilization_records'][-30:],  # Last 30 days
        'csat_feedback': profile['csat_feedback']
    }

# Save mappings
with open('partner_mapping.json', 'w') as f:
    json.dump(final_partner_mapping, f, indent=2)

with open('engineer_profiles.json', 'w') as f:
    json.dump(final_engineer_profiles, f, indent=2)

# Create summary stats
summary_stats = {
    'total_partners': len(final_partner_mapping),
    'total_engineers': len(final_engineer_profiles),
    'partners_with_engineers': sum(1 for p in final_partner_mapping.values() if p['engineer_count'] > 0),
    'engineers_with_partners': sum(1 for e in final_engineer_profiles.values() if e['partner_count'] > 0),
    'total_csat_responses': sum(p['total_csat_responses'] for p in final_partner_mapping.values()),
    'avg_csat_score': round(sum(p['csat_score'] for p in final_partner_mapping.values()) / max(len(final_partner_mapping), 1), 1)
}

with open('dashboard_stats.json', 'w') as f:
    json.dump(summary_stats, f, indent=2)

print(f"\n✅ Saved partner mapping: {len(final_partner_mapping)} partners")
print(f"✅ Saved engineer profiles: {len(final_engineer_profiles)} engineers")
print(f"✅ Saved dashboard stats")

# Display summary
print("\n" + "=" * 80)
print("SUMMARY STATISTICS")
print("=" * 80)

print(f"\n📊 Overall Stats:")
print(f"   Total Partners: {summary_stats['total_partners']}")
print(f"   Partners with Mapped Engineers: {summary_stats['partners_with_engineers']}")
print(f"   Total Engineers: {summary_stats['total_engineers']}")
print(f"   Engineers with Partner Mapping: {summary_stats['engineers_with_partners']}")
print(f"   Total CSAT Responses: {summary_stats['total_csat_responses']}")
print(f"   Average CSAT Score: {summary_stats['avg_csat_score']}%")

print("\n🏢 Top 10 Partners by Engineer Count:")
sorted_partners = sorted(final_partner_mapping.items(), key=lambda x: x[1]['engineer_count'], reverse=True)
for i, (partner, data) in enumerate(sorted_partners[:10], 1):
    print(f"{i}. {partner}: {data['engineer_count']} engineers, CSAT: {data['csat_score']}%, TDLs: {', '.join(data['tdls'][:3])}")

print("\n👨‍💻 Top 10 Engineers by Ticket Count:")
sorted_engineers = sorted(final_engineer_profiles.items(), key=lambda x: x[1]['total_tickets_worked'], reverse=True)
for i, (email, data) in enumerate(sorted_engineers[:10], 1):
    partners_str = f"{data['partner_count']} partners" if data['partner_count'] > 0 else "No partner mapping"
    print(f"{i}. {data['name']}: {data['total_tickets_worked']} tickets, {data['total_billable_hours']}h, {partners_str}")

print("\n" + "=" * 80)
print("✅ DATA PROCESSING COMPLETE!")
print("=" * 80)
