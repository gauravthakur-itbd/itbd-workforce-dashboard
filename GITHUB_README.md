# 🚀 ITBD Workforce Intelligence Dashboard

[![GitHub](https://img.shields.io/github/license/gauravthakur-itbd/itbd-workforce-dashboard)](https://github.com/gauravthakur-itbd/itbd-workforce-dashboard)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

Professional workforce management dashboard for **IT By Design** featuring real-time utilization tracking, CSAT analytics, and performance monitoring.

**Live Repository:** [https://github.com/gauravthakur-itbd/itbd-workforce-dashboard](https://github.com/gauravthakur-itbd/itbd-workforce-dashboard)

---

## ✨ Features

### 📊 **Real Data Integration**
- ✅ **90-day utilization data** from Excel (MDE Utilization)
- ✅ **CSAT survey responses** with engineer mapping
- ✅ **16 partners** across organization
- ✅ **35 engineers** with detailed profiles
- ✅ **TTL (Team Lead)** hierarchical structure

### 🎯 **Performance Tracking**
- ✅ **80% target lines** on all utilization and performance charts
- ✅ **RAG indicators** (Red/Amber/Green) for quick status assessment
- ✅ **Real-time filtering** by reporting period (90/60/30/15/7 days)
- ✅ **Multi-level analytics**: Global → TTL → Partner → Engineer

### 🎨 **Professional UI/UX**
- ✅ **ITBD branded** color scheme and logo
- ✅ **Responsive design** for all screen sizes
- ✅ **Framer Motion animations** for smooth interactions
- ✅ **Dark theme** with professional gradients
- ✅ **Professional Lucide icons** throughout

### 📈 **Dashboards**
1. **Global Dashboard** - Organization-wide KPIs and trends
2. **TTL Dashboard** - Team lead performance and team analytics
3. **Partner Dashboard** - Partner-specific metrics and engineer breakdown
4. **Engineer Dashboard** - Individual engineer performance tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/gauravthakur-itbd/itbd-workforce-dashboard.git

# Navigate to project directory
cd itbd-workforce-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Access the dashboard at: **http://localhost:5173**

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
itbd-workforce-dashboard/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx           # Global dashboard
│   │   ├── TTLDashboard.tsx        # Team lead view
│   │   ├── PartnerDashboard.tsx    # Partner analytics
│   │   └── EngineerDashboard.tsx   # Engineer details
│   ├── components/
│   │   └── ReportingPeriodSelector.tsx
│   ├── services/
│   │   └── dataService.ts          # Data loading & filtering
│   ├── store/
│   │   └── filterStore.ts          # Zustand state management
│   └── App.tsx                     # Main app with routing
├── Doc/
│   ├── MDE_Utalisation_BI.xlsx    # Source utilization data
│   └── csat_survey-2.xlsx          # Source CSAT data
├── dashboard_stats.json            # Aggregated statistics
├── engineer_profiles.json          # Engineer data
├── partner_mapping.json            # Partner-engineer mapping
└── generate_real_data.py          # Python data processor

```

---

## 🎯 Key Metrics

### Overall Performance
- **Utilization Rate**: Team and individual productivity tracking
- **CSAT Score**: Customer satisfaction percentage
- **Ticket Metrics**: Closed tickets and close rates
- **Partner Distribution**: Engineers across partners
- **TTL Performance**: Team lead effectiveness

### RAG Performance System
- 🟢 **Good**: Utilization ≥80% AND Close Rate ≥80%
- 🟡 **Average**: Utilization ≥60% AND Close Rate ≥60%
- 🔴 **Poor**: Below 60% on either metric

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript 5.5** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS 3.4** - Styling
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Router** - Navigation
- **Lucide React** - Icon library

### Data Processing
- **Python 3.x** - Data generation scripts
- **Pandas** - Excel data processing
- **OpenPyXL** - Excel file handling

---

## 📊 Charts & Visualizations

### Charts with 80% Target Lines
✅ Global Dashboard - Utilization Trend (Line)  
✅ Global Dashboard - TTL Performance (Bar)  
✅ TTL Dashboard - Team Performance (Bar)  
✅ Partner Dashboard - Engineer Utilization (Bar)  
✅ Engineer Dashboard - Daily Utilization (Line)

### Distribution Charts
📊 Partner Dashboard - Team Distribution (Pie with counts)  
📊 Global Dashboard - Ticket Volume (Area)  
📊 Partner Dashboard - Monthly Ticket Trend (Line)

---

## 🎨 Brand Colors

```css
Primary Navy:   #003B5C
Secondary Blue: #00A8E1
Accent Orange:  #FF6B35
Accent Green:   #10B981
Accent Yellow:  #FFC857
Background:     #0A1628
Card BG:        #0F2137
```

---

## 📝 Data Files

### JSON Data Files (Generated)
- `dashboard_stats.json` - Global statistics
- `engineer_profiles.json` - 35 engineer profiles
- `partner_mapping.json` - 16 partner mappings

### Source Excel Files
- `Doc/MDE_Utalisation_BI.xlsx` - Utilization data
- `Doc/csat_survey-2.xlsx` - CSAT survey responses

### Python Scripts
- `generate_real_data.py` - Main data generation
- `analyze_clean_data.py` - Data validation

---

## 🔧 Environment Setup

Copy `.env.example` to `.env` and configure if needed:

```bash
cp .env.example .env
```

**Note:** No environment variables required for basic functionality. All data is loaded from JSON files.

---

## 📖 Documentation

Comprehensive documentation available in repository:

- **QUICK_START_GUIDE.md** - Setup instructions
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **TARGET_LINE_VISUAL_GUIDE.md** - Chart specifications
- **RAG_PERFORMANCE_IMPLEMENTATION.md** - Performance system
- **FINAL_SUMMARY.md** - Complete project overview

---

## 🎯 Features Roadmap

### ✅ Completed
- [x] Real data integration from Excel
- [x] 4 comprehensive dashboards
- [x] Reporting period filters
- [x] 80% target lines on charts
- [x] RAG performance indicators
- [x] ITBD branding and styling
- [x] Responsive design
- [x] CSAT comment display
- [x] Engineer-partner mapping

### 🚧 Future Enhancements
- [ ] Historical trend comparisons
- [ ] Export to PDF/Excel
- [ ] Advanced filtering options
- [ ] Email notifications
- [ ] Custom date range selection
- [ ] Mobile app version
- [ ] API integration
- [ ] Real-time data sync

---

## 📄 License

This project is proprietary software developed for **IT By Design**.

---

## 👥 Author

**Gaurav Thakur**  
GitHub: [@gauravthakur-itbd](https://github.com/gauravthakur-itbd)

---

## 🤝 Contributing

This is a private project for IT By Design. For questions or issues, please contact the development team.

---

## 📞 Support

For technical support or questions:
- Create an issue in this repository
- Contact the IT By Design development team

---

## 🙏 Acknowledgments

- **IT By Design** - Project sponsor and data provider
- **React Team** - Frontend framework
- **Recharts** - Data visualization library
- **Tailwind Labs** - CSS framework

---

**Built with ❤️ for IT By Design**

*Last Updated: February 2026*
