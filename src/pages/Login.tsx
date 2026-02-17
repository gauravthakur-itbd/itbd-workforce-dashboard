import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome to Business Intelligence!')
      navigate('/')
    } catch (error) {
      toast.error('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-darker via-brand-dark to-brand-darker">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left space-y-6"
        >
          <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
            <img 
              src="https://itbd.net/logos/itbd.png" 
              alt="IT By Design" 
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                <span className="text-brand-primary">IT BY</span>{' '}
                <span className="text-brand-secondary">DESIGN</span>
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full mt-2" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
            <span className="text-white">WORKFORCE</span>
            <br />
            <span className="text-white">MANAGEMENT</span>
            <br />
            <span className="gradient-text">SYSTEM</span>
          </h2>

          <p className="text-lg text-neutral-300 max-w-md mx-auto md:mx-0">
            Access your <span className="text-brand-primary font-semibold">Business Intelligence</span>
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="px-4 py-2 bg-brand-light/30 border border-brand-primary/30 rounded-full text-sm text-neutral-200">
              ✨ AI-Powered Insights
            </div>
            <div className="px-4 py-2 bg-brand-light/30 border border-brand-secondary/30 rounded-full text-sm text-neutral-200">
              📊 Real-time Analytics
            </div>
            <div className="px-4 py-2 bg-brand-light/30 border border-brand-primary/30 rounded-full text-sm text-neutral-200">
              🎯 Performance Tracking
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="card border-brand-primary/20 shadow-glow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11"
                    placeholder="your.email@itbd.net"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-brand-light/30 bg-brand-dark/50 text-brand-primary focus:ring-brand-primary/30" />
                  <span className="text-sm text-neutral-300">Remember me</span>
                </label>
                <button type="button" className="text-sm text-brand-primary hover:text-brand-primary/80 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'SIGN IN'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>

              <p className="text-center text-sm text-neutral-400 mt-6">
                Access your Business Intelligence
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-neutral-500 mt-6">
            © 2026 IT By Design. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
