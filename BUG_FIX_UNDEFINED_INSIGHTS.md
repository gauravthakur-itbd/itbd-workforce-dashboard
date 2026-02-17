# Bug Fix: Undefined Values in AI Insights

## Issue
The Partner Insights section was displaying "At undefined%" because the insights engine was trying to access `partnerData.avg_utilization_pct` which doesn't exist as a direct property on the partner data object.

## Root Cause
The insights engine was expecting pre-calculated values that weren't available in the data structure:
- `partnerData.avg_utilization_pct` → **undefined** (needed to be calculated from engineerProfiles)
- Similar issues could occur with other metrics if values were missing

## Solution Implemented

### 1. **Partner Insights Fix**
Updated `getPartnerInsights()` to:
- Calculate `avgUtil` from `engineerProfiles` array instead of expecting it as a property
- Add proper fallback values using the nullish coalescing operator (`|| 0`)
- Round all percentage values to avoid decimal display
- Add safety check to only show insights when values are greater than 0

```typescript
// Before (broken):
const avgUtil = partnerData.avg_utilization_pct  // undefined!
const engineerCount = partnerData.engineer_count

// After (fixed):
const avgUtil = partnerData.engineerProfiles && partnerData.engineerProfiles.length > 0
  ? Math.round(partnerData.engineerProfiles.reduce((sum, eng) => sum + eng.avg_utilization_pct, 0) / partnerData.engineerProfiles.length)
  : 0
const engineerCount = partnerData.engineer_count || partnerData.engineerProfiles?.length || 0
```

### 2. **Global Insights Fix**
- Added `Math.round()` to ensure whole number percentages
- Added fallback for undefined values: `stats.avg_utilization_pct || 0`
- Added conditional check to only show insights when `utilization > 0`

### 3. **TTL Insights Fix**
- Added `Math.round()` for clean percentage display
- Added fallbacks: `ttlStats.avgUtilization || 0` and `ttlStats.totalEngineers || 0`
- Added conditional check for `avgUtil > 0`

### 4. **Engineer Insights Fix**
- Rounded both `avg_utilization_pct` and `close_rate`
- Added fallbacks for both metrics
- Updated conditional to check if either metric has data before showing insights

### 5. **Additional Improvements**
- Rounded variance calculations (min/max utilization)
- Rounded CSAT scores across all insights
- Ensured consistent number formatting throughout

## Files Modified
- ✅ `src/services/insightsEngine.ts`

## Changes Summary

| Function | Issue | Fix |
|----------|-------|-----|
| `getGlobalInsights()` | Raw decimals, no undefined handling | Added `Math.round()` and `|| 0` fallback |
| `getTTLInsights()` | Raw decimals, no undefined handling | Added `Math.round()` and fallbacks |
| `getPartnerInsights()` | **Accessing undefined property** | Calculate from engineerProfiles, add fallbacks |
| `getEngineerInsights()` | Raw decimals, no undefined handling | Added `Math.round()` and fallbacks |

## Impact

### Before:
- ❌ "At undefined% resources may be underutilized..."
- ❌ Decimal percentages (e.g., "72.3%")
- ❌ Potential crashes if data missing

### After:
- ✅ "At 81% resources may be underutilized..." (or appropriate message)
- ✅ Clean whole number percentages (e.g., "72%")
- ✅ Graceful handling of missing data
- ✅ No insights shown if no data available (utilization = 0)

## Testing
✅ Build successful (`npm run build`)
✅ No TypeScript errors
✅ All insights now properly calculate and display values
✅ Fallback handling prevents undefined values

## Technical Details

### Data Flow
1. **Partner Dashboard** calculates `avgUtilization` from engineerProfiles
2. **Insights Engine** now does the same calculation independently
3. This ensures insights work regardless of how data is structured

### Safety Measures
- Nullish coalescing: `value || 0`
- Optional chaining: `partnerData.engineerProfiles?.length`
- Conditional rendering: Only show insights when `value > 0`
- Math.round(): All percentages are whole numbers

## Prevention
To prevent similar issues in the future:
1. Always add fallback values when accessing potentially undefined properties
2. Round percentage values for clean display
3. Add conditional checks before displaying insights
4. Calculate from source data rather than assuming pre-calculated values exist

---

**Date**: January 2026  
**Issue**: Partner Insights showing "At undefined%"  
**Status**: ✅ Fixed and Deployed  
**Build**: ✅ Verified Successful
