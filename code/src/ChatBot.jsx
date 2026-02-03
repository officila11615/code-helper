import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './contexts/AuthContext';

export default function ChatBot({ chatId, onChatCreated }) {
    const { user } = useAuth();

    // We keep messages in state.
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    // Track the last chatId to detect changes
    const prevChatIdRef = useRef(chatId);

    // Initial load & updates
    useEffect(() => {
        // If we switched from one chat to another (or from null to an existing chat via sidebar)
        // we should load messages.
        if (chatId !== prevChatIdRef.current) {
            // If going to New Chat (null), reset
            if (!chatId) {
                setMessages([
                    { role: 'assistant', content: 'Hello! I am your Code Helper. Paste your code here, and I will help you debug it!' }
                ]);
            }
            prevChatIdRef.current = chatId;
        }

        if (!chatId) {
            return;
        }

        const loadMessages = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                if (data.length > 0) {
                    setMessages(data);
                }
            }
            setIsLoading(false);
        };

        loadMessages();
    }, [chatId]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveMessage = async (currentChatId, role, content) => {
        if (!currentChatId || !user) return;

        await supabase.from('messages').insert({
            chat_id: currentChatId,
            role,
            content
        });
    };

    const createChat = async (firstMessageContent) => {
        const title = (typeof firstMessageContent === 'string'
            ? firstMessageContent.slice(0, 30)
            : 'Image Upload') + '...';

        const { data, error } = await supabase
            .from('chats')
            .insert({ user_id: user.id, title })
            .select()
            .single();

        if (error) {
            console.error(error);
            return null;
        }
        return data.id;
    };

    const sendMessage = async () => {
        if (!input.trim() && !selectedImage) return;

        let content = input;
        if (selectedImage) {
            content = [
                { type: 'text', text: input || 'Describe this image' },
                {
                    type: 'image_url',
                    image_url: {
                        url: selectedImage
                    }
                }
            ];
        }

        const userMessage = { role: 'user', content: content };

        // Optimistic UI update
        setMessages(prev => [...prev, userMessage]);

        const currentImage = selectedImage;
        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

        try {
            // 1. Ensure we have a chat ID
            let activeChatId = chatId;

            if (!activeChatId) {
                activeChatId = await createChat(input || 'New Image Chat');
                if (activeChatId) {
                    onChatCreated(activeChatId);
                }
            }

            // 2. Save User Message to DB
            if (activeChatId) {
                await saveMessage(activeChatId, 'user', content);
            }

            // 3. Call API
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                },
                body: JSON.stringify({
                    model: 'openrouter/free',
                    messages: [
                        { role: 'system', content: 'You are a helpful code debugging assistant.' },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        userMessage
                    ],
                })
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            const botMessage = data.choices[0].message;

            setMessages(prev => [...prev, botMessage]);

            // 4. Save Bot Message to DB
            if (activeChatId) {
                await saveMessage(activeChatId, botMessage.role, botMessage.content);
            }

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (content) => {
        if (!content) return '';
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
            return (
                <div>
                    {content.map((item, idx) => {
                        if (item.type === 'text') return <div key={idx}>{item.text}</div>;
                        if (item.type === 'image_url') return (
                            <img
                                key={idx}
                                src={item.image_url.url}
                                alt="User upload"
                                style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '5px' }}
                            />
                        );
                        return null;
                    })}
                </div>
            );
        }
        return JSON.stringify(content);
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '20px'
        }}>
            <div className="no-scrollbar" style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px'
            }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: msg.role === 'user' ? '#646cff' : 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                        borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '12px'
                    }}>
                        <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
                        <div style={{ wordBreak: 'break-word', marginTop: '4px' }}>
                            {renderMessageContent(msg.content)}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
            }}>
                {/* Image Preview inside input area */}
                {selectedImage && (
                    <div style={{ position: 'relative' }}>
                        <img src={selectedImage} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
                        <button
                            onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            style={{
                                position: 'absolute', top: -5, right: -5,
                                background: '#f87171', border: 'none', borderRadius: '50%',
                                width: '16px', height: '16px', color: 'white', fontSize: '10px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >x</button>
                    </div>
                )}

                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid #444',
                        cursor: 'pointer',
                        color: 'white',
                    }}
                    title="Upload Image"
                >
                    📷
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                />

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        color: 'white'
                    }}
                />
                <button onClick={sendMessage} disabled={isLoading} style={{ background: '#646cff' }}>
                    Send
                </button>
            </div>
        </div>
    );
}
