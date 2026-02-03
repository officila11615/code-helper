import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Login.css' // We'll create this for specific styles

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSignUp, setIsSignUp] = useState(false)

    const { signInWithPassword, signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            let result;
            if (isSignUp) {
                result = await signUp({ email, password })
            } else {
                result = await signInWithPassword({ email, password })
            }

            if (result.error) throw result.error
            if (!isSignUp) navigate('/')
            else {
                // For signup, we might want to tell them to check email or auto-login
                // Supabase usually auto-logs in if email confirmation is off, or requires it.
                // Alerting for now.
                if (result.data.user && !result.data.session) {
                    setError('Please check your email for the confirmation link.')
                } else {
                    navigate('/')
                }
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                <p className="subtitle">{isSignUp ? 'Sign up to get started' : 'Login to your account'}</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="primary-btn">
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="toggle-mode">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            className="link-btn"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
