import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!supabase) {
            console.warn("Supabase not initialized. Check your environment variables.")
            setLoading(false)
            return
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const value = {
        session,
        user: session?.user,
        signInWithPassword: (data) => supabase.auth.signInWithPassword(data),
        signUp: (data) => supabase.auth.signUp(data),
        signOut: () => supabase.auth.signOut(),
    }

    return (
        <AuthContext.Provider value={value}>
            {/* If loading, we could render a spinner, but for now just wait */}
            {!loading && children}
        </AuthContext.Provider>
    )
}
