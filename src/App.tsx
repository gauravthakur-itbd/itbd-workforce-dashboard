import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import TTLDashboard from './pages/TTLDashboard'
import PartnerDashboard from './pages/PartnerDashboard'
import EngineerDashboard from './pages/EngineerDashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ttl/:ttlKey" element={<TTLDashboard />} />
          <Route path="/partner/:partnerKey" element={<PartnerDashboard />} />
          <Route path="/engineer/:engineerKey" element={<EngineerDashboard />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E3A5F',
            color: '#F8FAFC',
            border: '1px solid rgba(0, 168, 225, 0.3)',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
