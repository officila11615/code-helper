import { Routes, Route, Navigate, useNavigate, useParams, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useState, useEffect } from 'react'
import ChatBot from './ChatBot'
import Login from './Login'
import SetUsername from './SetUsername'
import Sidebar from './Sidebar'
import HistoryPage from './HistoryPage'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const { session } = useAuth()
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return children
}

function MainLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  // Initialize Open state based on screen size (Open on Desktop, Closed on Mobile)
  const isMobile = window.innerWidth <= 768
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (user && !user.user_metadata?.username) {
      navigate('/set-username')
    }
  }, [user, navigate])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      {/* Overlay Background for Mobile when Menu Open */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
        {/* Header / Top Bar */}
        <div style={{
          height: '60px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(0,0,0,0.2)',
          zIndex: 10 // Ensure header is above content but below sidebar overlay
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ padding: '0px 8px', background: 'transparent', border: '1px solid #444', fontSize: '1.2rem', lineHeight: '1' }}
            >
              {sidebarOpen ? '«' : '»'}
            </button>
            <h3 style={{ margin: 0 }}>AI Code Helper</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.9rem', color: '#aaa', display: window.innerWidth <= 480 ? 'none' : 'inline' }}>
              {user?.user_metadata?.username || user?.email}
            </span>
            <button onClick={signOut} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Sign Out</button>
          </div>
        </div>

        {/* Main Content Area - Renders Child Routes */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function ChatWrapper() {
  const { chatId } = useParams()
  const navigate = useNavigate()

  return (
    <ChatBot
      chatId={chatId}
      onChatCreated={(newId) => navigate(`/c/${newId}`)}
    />
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/set-username" element={
        <ProtectedRoute>
          <SetUsername />
        </ProtectedRoute>
      } />

      {/* Main Layout Wraps All App Pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ChatWrapper />} />
        <Route path="c/:chatId" element={<ChatWrapper />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
    </Routes>
  )
}

export default App
