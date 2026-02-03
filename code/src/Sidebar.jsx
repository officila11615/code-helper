import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate()
    const location = useLocation()
    const isMobile = window.innerWidth <= 768

    // Auto-close on selection if mobile
    const handleNavigation = (path) => {
        navigate(path)
        if (window.innerWidth <= 768 && onClose) {
            onClose()
        }
    }

    return (
        <div
            className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}
            style={{
                width: '240px',
                background: '#1a1a2e',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                display: isOpen ? 'flex' : 'none',
                flexDirection: 'column',
                height: '100%',
                padding: '20px',
                gap: '15px',
                // Responsive Overlay Styles (applied inline for simplicity, or via CSS class)
                position: window.innerWidth <= 768 ? 'absolute' : 'relative',
                zIndex: 1000,
                top: 0,
                left: 0,
                boxShadow: window.innerWidth <= 768 ? '4px 0 15px rgba(0,0,0,0.5)' : 'none'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Menu</h3>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        display: window.innerWidth <= 768 ? 'block' : 'none',
                        background: 'transparent',
                        border: 'none',
                        color: '#aaa',
                        fontSize: '1.5rem',
                        padding: '0 5px'
                    }}
                >
                    &times;
                </button>
            </div>

            <button
                onClick={() => handleNavigation('/')}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: location.pathname === '/' || location.pathname.startsWith('/c/')
                        ? 'linear-gradient(45deg, #4f46e5, #7c3aed)'
                        : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                }}
            >
                <span>💬</span> Current Chat
            </button>

            <button
                onClick={() => handleNavigation('/history')}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: location.pathname === '/history'
                        ? 'linear-gradient(45deg, #4f46e5, #7c3aed)'
                        : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                }}
            >
                <span>📂</span> View History
            </button>

            <div style={{ flex: 1 }} />

            <div style={{
                paddingTop: '15px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: 0.7
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #646cff, #9452ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                }}>
                    U
                </div>
                <div style={{ fontSize: '0.9rem' }}>User Panel</div>
            </div>
        </div>
    )
}