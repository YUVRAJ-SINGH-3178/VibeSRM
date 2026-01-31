import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Plus,
    Search,
    Users,
    Settings,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    X,
    Mic,
    Send,
    LogIn
} from 'lucide-react';
import { cn, DEFAULT_CHAT_CHANNELS } from '../utils/constants';
import { chat } from '../utils/database';

export const ChatView = ({ currentUser, activeChannel, setActiveChannel, channels, addNotification, addNotificationItem, onLeaveChannel }) => {
    const [messages, setMessages] = useState([]);
    const [toggledMsgId, setToggledMsgId] = useState(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    const channelList = channels?.length ? channels : DEFAULT_CHAT_CHANNELS;
    const activeChannelLabel = channelList.find((ch) => ch.id === activeChannel)?.label || activeChannel;
    const isCustom = activeChannel?.startsWith('dm-') || activeChannel?.startsWith('event-');

    // Audio refs
    const sendSound = useRef(new Audio('/sounds/message_sent.mp3'));
    const receiveSound = useRef(new Audio('/sounds/message_received.mp3'));

    useEffect(() => {
        sendSound.current.volume = 0.4;
        receiveSound.current.volume = 0.4;
    }, []);

    const scrollToBottom = (instant = false) => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: instant ? 'instant' : 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom(false);
    }, [messages]);

    useEffect(() => {
        if (!loading && messages.length > 0) {
            scrollToBottom(true);
        }
    }, [loading, activeChannel]);

    useEffect(() => {
        let subscription;
        const initChat = async () => {
            setLoading(true);
            try {
                const data = await chat.getMessages(activeChannel);
                setMessages(data || []);
                subscription = chat.subscribeToMessages(activeChannel, (message) => {
                    setMessages((prev) => {
                        if (prev.some(m => m.id === message.id)) return prev;
                        if (message.sender_id !== currentUser?.id) {
                            receiveSound.current.currentTime = 0;
                            receiveSound.current.play().catch(() => { });
                        }
                        return [...prev, message];
                    });
                });
            } catch (err) {
                console.error("Chat Error:", err);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) initChat();
        return () => { if (subscription?.unsubscribe) subscription.unsubscribe(); };
    }, [activeChannel, currentUser]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        const text = inputText.trim();
        setInputText('');

        if (navigator.vibrate) navigator.vibrate(5);
        inputRef.current?.focus();

        const tempId = `temp-${Date.now()}`;
        const optimisticMsg = {
            id: tempId, text: text, sender_id: currentUser.id,
            created_at: new Date().toISOString(),
            sender: { username: currentUser.username, avatar_url: currentUser.avatar_url }
        };

        setMessages(prev => [...prev, optimisticMsg]);
        try {
            sendSound.current.currentTime = 0;
            sendSound.current.play().catch(() => { });
            await chat.sendMessage(text, activeChannel);
        } catch (err) {
            console.error("Failed:", err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            addNotification?.('Failed to deliver', 'error');
        }
    };

    if (!currentUser) return (
        <div className="h-[600px] flex items-center justify-center relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#030014]">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150"></div>
            <div className="z-10 text-center p-12 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.5)]">
                    <LogIn className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Connect to Vibe</h3>
                <p className="text-gray-400">Sign in to unlock the campus network.</p>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[calc(100vh-140px)] min-h-[600px] flex gap-6 font-sans">

            <div className="w-80 hidden md:flex flex-col rounded-[2.5rem] bg-[#0b0b15]/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                <div className="p-6 pb-2 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            Chat
                        </h2>
                        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative group/search">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within/search:text-violet-400 transition-colors" />
                        <input
                            placeholder="Filter channels..."
                            className="w-full bg-[#151520] border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-violet-500/50 focus:bg-[#1a1a25] transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar relative z-10">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2 mt-2">vibe channels</p>
                    {channelList.map((channel) => {
                        const isActive = activeChannel === channel.id;
                        const isPrivate = channel.id?.startsWith('dm-');

                        return (
                            <motion.div
                                key={channel.id}
                                onClick={() => setActiveChannel(channel.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "relative px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-3 group overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-br from-violet-600/90 to-indigo-700/90 text-white shadow-[0_8px_20px_-5px_rgba(124,58,237,0.4)]"
                                        : "hover:bg-white/[0.05] text-gray-400 hover:text-gray-200"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                )}

                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm transition-all border",
                                    isActive
                                        ? "bg-white/20 text-white border-white/30"
                                        : "bg-[#1a1a22] text-gray-500 border-white/5 group-hover:bg-[#252530] group-hover:text-gray-300"
                                )}>
                                    {isPrivate ? <Users className="w-4 h-4" /> : '#'}
                                </div>

                                <div className="flex-1 min-w-0 relative z-10">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={cn("font-bold truncate text-[15px]", isActive ? "text-white" : "text-gray-300")}>{channel.label}</span>
                                        {isActive && <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse" />}
                                    </div>
                                    <div className={cn("text-xs truncate", isActive ? "text-indigo-100" : "text-gray-600")}>
                                        {isActive ? "Active Now" : "Click to join"}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="p-4 relative z-10 bg-black/20 border-t border-white/5 backdrop-blur-xl">
                    <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition border border-transparent hover:border-white/5 group bg-[#0f0f15]">
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                            <img src={currentUser.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.username}`} className="relative w-10 h-10 rounded-full object-cover bg-black" alt="me" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                            </div>
                        </div>
                        <Settings className="w-4 h-4 text-gray-500 hover:text-white transition cursor-pointer" />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col rounded-[2.5rem] bg-[#05050A] relative overflow-hidden shadow-2xl border border-white/10 group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-600/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                <div className="absolute top-6 left-6 right-6 z-30">
                    <div className="px-6 py-4 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl flex justify-between items-center shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-inner">
                                <span className="text-xl">{isCustom ? '💬' : '#'}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    {activeChannelLabel}
                                </h2>
                                <p className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                                    {messages.length} messages
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-2xl border border-white/5">
                            {[Phone, Video, MoreVertical].map((Icon, i) => (
                                <button key={i} className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition">
                                    <Icon className="w-4.5 h-4.5" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 pt-32 pb-28 space-y-6 custom-scrollbar relative z-10" onClick={() => setToggledMsgId(null)}>
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin"></div>
                                <p className="text-gray-500 text-sm font-medium animate-pulse">Syncing frequencies...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                            <div className="max-w-xs p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-md">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow-inner">
                                    <MessageSquare className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">It's quiet... too quiet</h3>
                                <p className="text-gray-500">Kickstart the vibe in #{activeChannelLabel}!</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender_id === currentUser.id;
                            const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    key={msg.id}
                                    className={cn("flex group/msg", isMe ? "justify-end" : "justify-start")}
                                >
                                    <div className={cn("flex max-w-[75%] gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                                        <div className="w-9 flex-shrink-0 flex flex-col justify-end">
                                            {showAvatar && !isMe ? (
                                                <img src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${msg.sender?.username}`} className="w-9 h-9 rounded-2xl object-cover bg-black border border-white/10 shadow-lg" alt="Use" />
                                            ) : <div className="w-9" />}
                                        </div>

                                        <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                                            {showAvatar && !isMe && <span className="ml-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{msg.sender?.username}</span>}

                                            <div
                                                onClick={(e) => { e.stopPropagation(); setToggledMsgId(prev => prev === msg.id ? null : msg.id); }}
                                                className={cn(
                                                    "relative px-5 py-3.5 text-[15px] leading-relaxed cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg",
                                                    isMe
                                                        ? "bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 text-white rounded-[24px] rounded-tr-md shadow-[0_4px_15px_rgba(79,70,229,0.3)] border border-indigo-400/20"
                                                        : "bg-[#181820]/90 backdrop-blur-xl text-gray-100 rounded-[24px] rounded-tl-md border border-white/10 shadow-sm"
                                                )}
                                            >
                                                {msg.text}

                                                {toggledMsgId === msg.id && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("absolute -top-12 flex bg-[#1a1a24] border border-white/10 p-1.5 rounded-xl shadow-2xl z-50", isMe ? "right-0" : "left-0")}>
                                                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(msg.text); setToggledMsgId(null); }} className="hover:bg-white/10 p-2 rounded-lg text-white" title="Copy"><Paperclip className="w-3.5 h-3.5" /></button>
                                                        {isMe && <button onClick={(e) => { e.stopPropagation(); const msgId = msg.id; setMessages(p => p.filter(m => m.id !== msgId)); setToggledMsgId(null); chat.deleteMessage(msgId).catch(() => { addNotification?.('Failed to delete message', 'error'); }); }} className="hover:bg-red-500/20 text-red-400 p-2 rounded-lg ml-1" title="Delete"><X className="w-3.5 h-3.5" /></button>}
                                                    </motion.div>
                                                )}
                                            </div>
                                            <span className={cn("text-[10px] font-medium opacity-0 group-hover/msg:opacity-100 transition-opacity", isMe ? "text-indigo-300/60 mr-2" : "text-gray-600 ml-2")}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-30">
                    <form onSubmit={handleSend} className="relative group/input">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[2rem] opacity-0 group-focus-within/input:opacity-20 blur-xl transition-opacity duration-500"></div>
                        <div className={cn(
                            "relative flex items-end gap-3 bg-[#0c0c12]/80 backdrop-blur-2xl p-2.5 pl-5 rounded-[2rem] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300",
                            inputText.trim() ? "border-violet-500/40" : "border-white/10"
                        )}>
                            <button type="button" className="pb-3 text-gray-400 hover:text-white transition"><Plus className="w-6 h-6" /></button>

                            <div className="flex-1 py-3">
                                <input
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder={`Message #${activeChannelLabel}...`}
                                    className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-[16px] font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-2 pr-1 pb-1">
                                {!inputText.trim() && (
                                    <button type="button" className="p-2.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition"><Mic className="w-5 h-5" /></button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className={cn(
                                        "p-3 rounded-full transition-all duration-300 flex items-center justify-center",
                                        inputText.trim()
                                            ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/30 rotate-0 scale-100"
                                            : "bg-white/5 text-gray-600 -rotate-90 scale-90 opacity-0 w-0 p-0 overflow-hidden"
                                    )}
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};
