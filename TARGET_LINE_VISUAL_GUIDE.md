# 80% Target Line Visual Guide

## Overview
This guide shows exactly which charts have the 80% target line and which don't.

---

## ✅ Charts WITH 80% Target Line

### 1. Global Dashboard - Utilization Trend
**Chart Type:** Line Chart  
**Location:** `/` (Global Dashboard)  
**Data:** Monthly utilization trend  
**Target Line:** Green dashed line at 80%  
**File:** `src/pages/Dashboard.tsx` (line 210)

```tsx
<LineChart data={utilizationTrend}>
  {/* ... other components ... */}
  <ReferenceLine 
    y={80} 
    stroke="#A4D233" 
    strokeDasharray="3 3" 
    label={{ value: 'Goal: 80%', position: 'right' }}
  />
  <Line dataKey="utilization" stroke="#00A8E1" />
</LineChart>
```

---

### 2. Global Dashboard - TTL Performance
**Chart Type:** Bar Chart  
**Location:** `/` (Global Dashboard)  
**Data:** Average utilization by TTL  
**Target Line:** Green dashed line at 80%  
**File:** `src/pages/Dashboard.tsx` (line 257)

```tsx
<BarChart data={ttlComparison}>
  {/* ... other components ... */}
  <ReferenceLine 
    y={80} 
    stroke="#A4D233" 
    strokeDasharray="3 3" 
    label={{ value: 'Goal: 80%', position: 'right' }}
  />
  <Bar dataKey="utilization" fill="#00A8E1" />
</BarChart>
```

---

### 3. TTL Dashboard - Team Performance
**Chart Type:** Bar Chart  
**Location:** `/ttl/:ttlKey` (TTL Dashboard)  
**Data:** Engineer utilization within team  
**Target Line:** Green dashed line at 80%  
**File:** `src/pages/TTLDashboard.tsx` (line 155)

```tsx
<BarChart data={engineerPerformance}>
  {/* ... other components ... */}
  <ReferenceLine 
    y={80} 
    stroke="#A4D233" 
    strokeDasharray="3 3" 
    label={{ value: '80% Target', position: 'right' }}
  />
  <Bar dataKey="utilization" fill="#00A8E1" />
</BarChart>
```

---

### 4. Partner Dashboard - Engineer Utilization
**Chart Type:** Bar Chart  
**Location:** `/partner/:partnerKey` (Partner Dashboard)  
**Data:** Individual engineer utilization  
**Target Line:** Green dashed line at 80%  
**File:** `src/pages/PartnerDashboard.tsx` (line 189)

```tsx
<BarChart data={partnerData.trends.engineerUtilization}>
  {/* ... other components ... */}
  <ReferenceLine 
    y={80} 
    stroke="#A4D233" 
    strokeDasharray="3 3" 
    label={{ value: '80% Target', position: 'right' }}
  />
  <Bar dataKey="utilization" fill="#00A8E1" />
</BarChart>
```

---

### 5. Engineer Dashboard - Daily Utilization Trend
**Chart Type:** Line Chart  
**Location:** `/engineer/:engineerKey` (Engineer Dashboard)  
**Data:** Daily utilization over reporting period  
**Target Line:** Green dashed line at 80%  
**File:** `src/pages/EngineerDashboard.tsx` (line 176)

```tsx
<LineChart data={trends.utilizationTrend}>
  {/* ... other components ... */}
  <ReferenceLine 
    y={80} 
    stroke="#10B981" 
    strokeDasharray="5 5" 
    label={{ value: '80% Target', position: 'right' }}
  />
  <Line dataKey="utilization" stroke="#00A8E1" />
</LineChart>
```

---

## ❌ Charts WITHOUT Target Line (Correct)

### Global Dashboard - Ticket Volume
**Chart Type:** Area Chart  
**Location:** `/` (Global Dashboard)  
**Data:** Weekly tickets worked vs closed  
**Why NO Target:** Shows **count** data, not percentage  
**File:** `src/pages/Dashboard.tsx`

```tsx
<AreaChart data={ticketTrend}>
  {/* No ReferenceLine - this is correct */}
  <Area dataKey="worked" stroke="#00A8E1" />
  <Area dataKey="closed" stroke="#A4D233" />
</AreaChart>
```

---

### Partner Dashboard - Monthly Ticket Trend
**Chart Type:** Line Chart  
**Location:** `/partner/:partnerKey` (Partner Dashboard)  
**Data:** Monthly ticket count  
**Why NO Target:** Shows **count** data, not percentage  
**File:** `src/pages/PartnerDashboard.tsx`

```tsx
<LineChart data={partnerData.trends.monthlyTickets}>
  {/* No ReferenceLine - this is correct */}
  <Line dataKey="tickets" stroke="#00A8E1" />
</LineChart>
```

---

### Partner Dashboard - Team Distribution
**Chart Type:** Pie Chart  
**Location:** `/partner/:partnerKey` (Partner Dashboard)  
**Data:** Engineers by TTL  
**Why NO Target:** Distribution chart (shows breakdown, not performance)  
**Special Feature:** ✅ Shows numbers in brackets  
**File:** `src/pages/PartnerDashboard.tsx`

```tsx
<PieChart>
  <Pie
    data={ttlDistribution}
    label={({ name, percent, value }) => 
      `${name}: ${(percent * 100).toFixed(0)}% (${value})`
    }
    //         Shows actual count in brackets ↑↑↑
  />
</PieChart>
```

---

### Engineer Dashboard - Ticket Activity
**Chart Type:** Bar Chart  
**Location:** `/engineer/:engineerKey` (Engineer Dashboard)  
**Data:** Daily tickets worked  
**Why NO Target:** Shows **count** data, not percentage  
**File:** `src/pages/EngineerDashboard.tsx`

```tsx
<BarChart data={trends.utilizationTrend}>
  {/* No ReferenceLine - this is correct */}
  <Bar dataKey="tickets" fill="#00A8E1" />
</BarChart>
```

---

## 🎨 Target Line Styling

### Color Variations
Different charts use slightly different green shades:
- `#A4D233` - Lime green (Dashboard, TTL, Partner)
- `#10B981` - Emerald green (Engineer)

Both are acceptable and visually similar.

### Common Properties
```tsx
stroke="#A4D233"           // or "#10B981"
strokeDasharray="3 3"      // or "5 5"
strokeWidth={2}
label={{ 
  value: '80% Target',     // or "Goal: 80%"
  position: 'right',
  fill: '#A4D233',         // matches stroke color
  fontSize: 12,
  fontWeight: 'bold'       // optional
}}
```

---

## 📊 Quick Reference Table

| Dashboard | Chart Name | Type | Has 80% Line? | Shows Numbers? | Data Type |
|-----------|------------|------|---------------|----------------|-----------|
| Global | Utilization Trend | Line | ✅ YES | - | Percentage |
| Global | TTL Performance | Bar | ✅ YES | - | Percentage |
| Global | Ticket Volume | Area | ❌ NO | - | Count |
| TTL | Team Performance | Bar | ✅ YES | - | Percentage |
| Partner | Engineer Utilization | Bar | ✅ YES | - | Percentage |
| Partner | Team Distribution | Pie | ❌ NO | ✅ In brackets | Count |
| Partner | Monthly Ticket Trend | Line | ❌ NO | - | Count |
| Engineer | Daily Utilization | Line | ✅ YES | - | Percentage |
| Engineer | Ticket Activity | Bar | ❌ NO | - | Count |

---

## ✅ Verification Steps

1. **Run the app:**
   ```bash
   npm run dev
   ```

2. **Check Global Dashboard** (`/`)
   - ✅ Utilization Trend chart → Green line at 80%
   - ✅ TTL Performance chart → Green line at 80%
   - ❌ Ticket Volume chart → No line (correct)

3. **Check TTL Dashboard** (`/ttl/ayra` or any TTL)
   - ✅ Team Performance chart → Green line at 80%

4. **Check Partner Dashboard** (`/partner/Acrisure Cyber Services` or any partner)
   - ✅ Engineer Utilization chart → Green line at 80%
   - ✅ Team Distribution pie chart → Shows numbers like "Ayra: 67% (4)"
   - ❌ Monthly Ticket Trend → No line (correct)

5. **Check Engineer Dashboard** (`/engineer/glen-estrada` or any engineer)
   - ✅ Daily Utilization Trend → Green line at 80%
   - ❌ Ticket Activity → No line (correct)

---

## 🎯 Summary

**Total Charts:** 9 charts across 4 dashboards  
**Charts with 80% target line:** 5 (all utilization/performance charts)  
**Charts without target line:** 4 (all count/distribution charts)  
**Team Distribution special feature:** Shows numbers in brackets ✅

**Status:** ✅ All target lines correctly implemented  
**Build:** ✅ No compilation errors  
**Visual Consistency:** ✅ All target lines use similar styling

---

## 📝 Notes

- Target lines only appear on **utilization and performance** charts (percentage data)
- **Count-based charts** (ticket volume, ticket activity) correctly have NO target line
- **Distribution charts** (pie charts) show actual counts in brackets instead
- All target lines are positioned on the **right side** of the chart
- Labels clearly show "**80% Target**" or "**Goal: 80%**"
- Green color (#A4D233 or #10B981) indicates success/achievement theme

---

**Last Updated:** December 2024  
**Version:** 1.0.0
