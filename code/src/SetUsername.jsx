import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function SetUsername() {
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username.trim()) return

        setLoading(true)
        setError(null)

        try {
            if (!user) throw new Error('No user found')

            const { error } = await supabase.auth.updateUser({
                data: { username: username.trim() }
            })

            if (error) throw error

            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #2a2a4a, #1a1a2e)'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                padding: '2.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h2>Welcome!</h2>
                <p style={{ color: '#a0a0a0', marginBottom: '1.5rem' }}>Please choose a username to continue.</p>

                {error && (
                    <div style={{
                        background: 'rgba(255, 87, 87, 0.15)',
                        border: '1px solid rgba(255, 87, 87, 0.3)',
                        color: '#ff5757',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(0, 0, 0, 0.2)',
                            color: '#fff',
                            fontSize: '1rem',
                            marginBottom: '1.5rem',
                            boxSizing: 'border-box'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(90deg, #646cff, #535bf2)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Saving...' : 'Get Started'}
                    </button>
                </form>
            </div>
        </div>
    )
}
