import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function HistoryPage() {
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchChats()
    }, [])

    const fetchChats = async () => {
        try {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setChats(data)
        } catch (err) {
            console.error('Error loading chats:', err)
        } finally {
            setLoading(false)
        }
    }

    const deleteChat = async (id, e) => {
        e.stopPropagation()
        if (!confirm('Delete this chat?')) return
        try {
            await supabase.from('chats').delete().eq('id', id)
            setChats(chats.filter(c => c.id !== id))
        } catch (err) {
            console.error('Error deleting chat:', err)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                Chat History
            </h2>

            {loading ? (
                <div>Loading history...</div>
            ) : chats.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
                    No chat history found. Start a new chat!
                </div>
            ) : (
                <div className="history-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => navigate(`/c/${chat.id}`)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'transform 0.2s, background 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                            }}
                        >
                            <h3 style={{
                                margin: '0 0 10px 0',
                                fontSize: '1.1rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {chat.title || 'Untitled Chat'}
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '15px' }}>
                                {formatDate(chat.created_at)}
                            </div>

                            <button
                                onClick={(e) => deleteChat(chat.id, e)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.8rem',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: '#fca5a5',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    width: '100%'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
