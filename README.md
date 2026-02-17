# IT By Design - Business Intelligence System

![IT By Design](https://itbd.net/logos/itbd-logo.png)

## 🚀 Live Application

The application is now running at: **http://localhost:3001/**

## ✨ Overview

A comprehensive, AI-powered workforce management and analytics dashboard system built for IT By Design. This system provides real-time insights into engineer utilization, partner satisfaction (CSAT), and team performance.

## 🎯 Key Features

### 📊 Multi-Level Dashboards
- **Global Dashboard**: Executive overview with company-wide KPIs
- **TTL Dashboard**: Team lead performance tracking
- **Partner Dashboard**: Account-level service delivery metrics
- **Engineer Dashboard**: Individual contributor analytics

### 🎨 Design Highlights
- **Branded Color Theme**: Custom IT By Design color palette
  - Primary: `#00A8E1` (Cyan Blue)
  - Secondary: `#A4D233` (Lime Green)
  - Dark Theme: Professional dark mode with gradient accents
- **Modern UI/UX**: 
  - Smooth animations with Framer Motion
  - Responsive design (mobile, tablet, desktop)
  - Interactive charts and data visualizations
  - Glass morphism effects

### 📈 Analytics Features
- Real-time utilization tracking (35 engineers mapped)
- CSAT monitoring (16 partners with feedback)
- Ticket volume analytics
- Team performance comparisons
- Reporting period filters (7, 15, 30, 60, 90 days)
- Trend forecasting
- AI-powered insights (planned)

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation
- **Zustand** for state management
- **date-fns** for date handling

### Backend (Planned - See plan.md)
- Node.js/Express API
- PostgreSQL database
- ETL pipeline for Excel data processing
- OpenAI integration for AI insights

## 📁 Project Structure

```
BI Deshbords/
├── src/
│   ├── pages/
│   │   ├── Login.tsx          # Branded login page
│   │   ├── Dashboard.tsx      # Global dashboard
│   │   ├── TDLDashboard.tsx   # Team lead view
│   │   ├── PartnerDashboard.tsx
│   │   └── EngineerDashboard.tsx
│   ├── store/
│   │   ├── authStore.ts       # Authentication state
│   │   └── filterStore.ts     # Dashboard filters
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css              # Custom Tailwind styles
├── Doc/
│   ├── csat_survey-2.xlsx     # CSAT data (474 reviews)
│   └── MDE _ UTILIZATION 10-2.xlsx  # Utilization data (23,577 records)
├── plan.md                    # Strategic implementation plan
├── package.json
└── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

Dependencies are already installed. If needed:
```bash
npm install
```

### Running the Application

The application is already running! Access it at:
```
http://localhost:3001/
```

To start manually:
```bash
npm run dev
```

### Default Login
No authentication required - the app loads directly to the dashboard.

## 📊 Dashboard Features

### Global Dashboard
- **KPI Cards**: Utilization %, Total Engineers, Partners, CSAT, Tickets
- **Utilization Trend**: 7-month line chart
- **TDL Comparison**: Bar chart comparing team leads
- **Ticket Volume**: Area chart with worked/closed tickets
- **Team Lead Grid**: Click to drill down into team details

### TTL Dashboard
- **Team Metrics**: Size, avg utilization, tickets closed, close rate
- **Engineer Performance**: Sortable list with key metrics
- **Individual Trends**: Per-engineer utilization charts
- **Drill-down**: Click engineer to view detailed profile

### Filter System
- **Reporting Period**: 7, 15, 30, 60, 90 days (applies to all metrics)
- **Dynamic Updates**: All KPIs recalculate based on selected period
- **Persistent State**: Filters maintained during navigation

## 🎨 Branding & Design System

### Color Palette
```css
Primary Blue:    #00A8E1  /* Main brand color */
Secondary Green: #A4D233  /* Accent color */
Dark Navy:       #0A1628  /* Background */
Almost Black:    #050B16  /* Deeper background */
Medium Blue:     #1E3A5F  /* Cards/containers */
```

### Typography
- **Display Font**: Poppins (headings)
- **Body Font**: Inter (content)

### Components
- **Cards**: Glass morphism with backdrop blur
- **Buttons**: Gradient hovers with glow effects
- **Charts**: Custom branded colors matching ITBD palette
- **Animations**: Smooth fade-ins, slide-ups, hover scales

## 📈 Data Integration (From plan.md)

The system is designed to process:
- **MDE Utilization Data**: 23,577 engineer activity records
- **CSAT Survey Data**: 474 customer satisfaction responses

### Key Metrics Tracked
- **Utilization**: Billable hours, utilization percentage
- **Tickets**: Worked, closed, close rate
- **CSAT**: Happy/Okay/Unhappy ratings, customer comments
- **Engineers**: 35 mapped to partners
- **TTLs**: 5 team leads
- **Partners**: 16 companies with engineer assignments

## 🔮 Roadmap (See plan.md for details)

### Phase 1: Data Cleaning ✅ (Planned)
- Excel to database migration
- Partner name standardization
- Data validation

### Phase 2: Data Modeling (In Progress)
- Star schema implementation
- ETL pipeline development
- PostgreSQL setup

### Phase 3: API Development (Planned)
- RESTful API endpoints
- Authentication & authorization
- Real-time data sync

### Phase 4: Frontend Enhancement ✅ (Current)
- Dashboard implementation
- Interactive visualizations
- Responsive design

### Phase 5: AI Integration (Planned)
- Anomaly detection
- Predictive analytics
- Automated insights
- Risk scoring

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Secure password handling
- Environment variable protection

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop**: Full dashboard with all features
- **Tablet**: Optimized layouts
- **Mobile**: Simplified navigation, stacked cards

## 🎯 Performance Optimizations

- **Code Splitting**: React lazy loading
- **Caching**: React Query for API data
- **Optimized Re-renders**: Zustand state management
- **Fast Builds**: Vite for instant HMR

## 📊 Available Scripts

```bash
npm run dev        # Start development server (PORT 3000)
npm run build      # Build for production
npm run preview    # Preview production build
npm run server     # Start backend server (planned)
npm run etl        # Run ETL pipeline (planned)
```

## 🐛 Known Issues & Limitations

1. **Authentication**: Removed for streamlined access
2. **Data Source**: Using cleaned Excel data with 90-day history
3. **Partner Coverage**: 16 partners with complete engineer mapping
4. **CSAT Comments**: Only showing comments with actual feedback text
5. **Backend**: Not yet implemented (Phase 3)

## 🤝 Contributing

This is an internal IT By Design project. For questions or enhancements:
1. Review the strategic plan in `plan.md`
2. Follow the existing code patterns
3. Maintain the ITBD branding guidelines

## 📄 Documentation

- **Strategic Plan**: See `plan.md` for comprehensive implementation roadmap
- **Data Analysis**: Excel files analyzed with Python scripts
- **API Docs**: Coming in Phase 3

## 🙏 Acknowledgments

- **IT By Design**: Brand assets and requirements
- **React Community**: Amazing ecosystem
- **Tailwind CSS**: Utility-first CSS framework

## 📞 Support

For issues or questions:
- Review `plan.md` for architectural details
- Check browser console for errors
- Ensure all dependencies are installed

---

**Built with ❤️ for IT By Design**

© 2026 IT By Design. All rights reserved.

---

## Quick Start Checklist

- [x] Dependencies installed
- [x] Development server running on http://localhost:3001
- [x] No authentication required
- [x] Global dashboard with real data and KPIs
- [x] TTL dashboard with team metrics
- [x] Partner dashboard with CSAT feedback
- [x] Engineer dashboard with individual analytics
- [x] Reporting period filters (7, 15, 30, 60, 90 days)
- [x] Responsive design
- [x] ITBD branded color theme
- [x] Smooth animations and interactions
- [x] CSAT comments showing only real feedback
- [ ] Backend API (Phase 3)
- [ ] Database integration (Phase 2)
- [ ] AI insights (Phase 5)

**You're all set! Open http://localhost:3001 in your browser to see the dashboard! 🚀**
