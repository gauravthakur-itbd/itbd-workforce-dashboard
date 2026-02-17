# Critical Fixes Required - TDL → TTL Renaming

## Summary of Required Changes

### Issue 1: Partner Count (69 is CORRECT)
✅ No duplicates found - 69 unique partners confirmed
- 36 partners have mapped engineers (mentioned in CSAT)
- 33 partners have 0 mapped engineers (not yet in CSAT data)
- This is expected behavior

### Issue 2: TDL → TTL Renaming
Need to rename throughout the codebase:
- TDL (Team Development Lead) → TTL (Team Technical Lead)

### Issue 3: Reporting Period Filters  
Add date range filters: Last 90, 60, 30, 15, 7 days

## Files That Need TDL → TTL Renaming

### 1. Data Service (`src/services/dataService.ts`)
- `getAllTDLs()` → `getAllTTLs()`
- `getTDLStats()` → `getTTLStats()`
- `getEngineersByTDL()` → `getEngineersByTTL()`
- Interface properties: `tdl` → `ttl`
- Variables: `tdls` → `ttls`

### 2. Filter Store (`src/store/filterStore.ts`)
✅ ALREADY UPDATED with:
- `selectedTDLs` → `selectedTTLs`
- `setSelectedTDLs` → `setSelectedTTLs`
- Added `reportingPeriod` field
- Added `setReportingPeriod()` method

### 3. Dashboard (`src/pages/Dashboard.tsx`)
- `allTDLs` → `allTTLs`
- `tdlComparison` → `ttlComparison`
- `tdlStats` → `ttlStats`
- UI text: "TDL" → "TTL"

### 4. Partner Dashboard (`src/pages/PartnerDashboard.tsx`)
- `tdl` property → `ttl`
- `tdlDistribution` → `ttlDistribution`
- UI text: "TDL" → "TTL"

### 5. TTL Dashboard (`src/pages/TDLDashboard.tsx`)
- Rename file to `TTLDashboard.tsx`
- Component name: `TDLDashboard` → `TTLDashboard`
- Route param: `tdlKey` → `ttlKey`
- UI text: "TDL" → "TTL"

### 6. App Routing (`src/App.tsx`)
- Import: `TDLDashboard` → `TTLDashboard`
- Route: `/tdl/:tdlKey` → `/ttl/:ttlKey`

### 7. JSON Data Files
Need to regenerate with TTL instead of TDL:
- `partner_mapping.json`
- `engineer_profiles.json`
- Re-run `enhanced_mapping.py` with TTL terminology

## New Component Created
✅ `src/components/ReportingPeriodSelector.tsx`
- Buttons for 7d, 15d, 30d, 60d, 90d
- Updates date range automatically
- Ready to integrate

## Recommended Approach

Given the scope of changes, I recommend:

### Option 1: Bulk Find & Replace (Fastest)
Run these commands:

```bash
cd "/Users/GauravThakur/Desktop/BI Deshbords"

# Rename in TypeScript/TSX files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/TDL/TTL/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Tdl/Ttl/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/tdl/ttl/g' {} \;

# Rename file
mv src/pages/TDLDashboard.tsx src/pages/TTLDashboard.tsx

# Regenerate data with TTL
python enhanced_mapping_ttl.py
```

### Option 2: Manual File-by-File (More Control)
Update each file individually with proper testing

## Quick Test After Changes

1. Build the project:
```bash
npm run build
```

2. Start dev server:
```bash
npm run dev
```

3. Test navigation:
- Global → TTL (was TDL)
- Global → Partner → Shows TTLs correctly
- Reporting period buttons work
- All references show "TTL" not "TDL"

## Status

- ✅ Partner count verified (69 is correct)
- ✅ Filter store updated with TTL
- ✅ Reporting period component created
- ⏳ Bulk TDL→TTL renaming needed
- ⏳ Integration of reporting period selector
- ⏳ Data regeneration with TTL

---

Would you like me to proceed with the bulk find & replace approach?
