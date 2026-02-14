import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Plus,
    Search,
    Users,
    Settings,
    MoreVertical,
    Paperclip,
    X,
    Send,
    LogIn,
    ArrowLeft,
    Hash,
    Image,
    AtSign,
    LogOut
} from 'lucide-react';
import { cn, DEFAULT_CHAT_CHANNELS } from '../utils/constants';
import { chat } from '../utils/database';
import { ThemeSkeleton } from './ThemeSkeleton';

export const ChatView = ({ currentUser, activeChannel, setActiveChannel, channels, addNotification, addNotificationItem, onLeaveChannel }) => {
    const [messages, setMessages] = useState([]);
    const [toggledMsgId, setToggledMsgId] = useState(null);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    const channelList = channels?.length ? channels : DEFAULT_CHAT_CHANNELS;
    const activeChannelObj = channelList.find((ch) => ch.id === activeChannel);
    const activeChannelLabel = activeChannelObj?.label || activeChannel;
    const isCustom = activeChannel?.startsWith('dm-') || activeChannel?.startsWith('event-');

    // Audio refs
    const sendSound = useRef(new Audio('/sounds/message_sent.mp3'));
    const receiveSound = useRef(new Audio('/sounds/message_received.mp3'));

    useEffect(() => {
        sendSound.current.volume = 0.4;
        receiveSound.current.volume = 0.4;
    }, []);

    useEffect(() => {
        if (activeChannel && window.innerWidth < 768) {
            setIsMobileListVisible(false);
        }
    }, [activeChannel]);

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
                        // Replace optimistic temp message from current user with real server message
                        const tempIdx = prev.findIndex(
                            m => typeof m.id === 'string' && m.id.startsWith('temp-') &&
                                m.sender_id === message.sender_id && m.text === message.text
                        );
                        if (tempIdx !== -1) {
                            const updated = [...prev];
                            updated[tempIdx] = message;
                            return updated;
                        }
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
        if (currentUser && activeChannel) initChat();
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
        <div className="h-full flex items-center justify-center p-8">
            <div className="text-center p-12 obsidian-card rounded-3xl max-w-md bg-[var(--bg-card)]/80">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-vibe-purple to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.5)]">
                    <LogIn className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Connect to Vibe</h3>
                <p className="text-[var(--text-secondary)]">Sign in to unlock the campus network.</p>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[88vh] flex gap-6 font-sans overflow-hidden pb-6 lg:pb-0 px-4 md:px-0">

            {/* CHANNEL LIST */}
            <div className={cn(
                "w-full md:w-80 flex-col rounded-[2.5rem] obsidian-card overflow-hidden relative group transition-all duration-300 border-none bg-[var(--surface-glass)] backdrop-blur-3xl",
                !isMobileListVisible ? "hidden md:flex" : "flex"
            )}>

                <div className="p-6 pb-4 relative z-10 border-b border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-vibe-purple/20 border border-vibe-purple/40 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-vibe-purple" />
                            </span>
                            Channels
                        </h2>
                        <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-gray-400 hover:text-white border border-white/5">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative group/search">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-secondary)] group-focus-within/search:text-vibe-purple transition-colors" />
                        <input
                            placeholder="Find or start a conversation..."
                            className="w-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-vibe-purple/50 transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar relative z-10">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 py-2">Suggested</p>
                    {channelList.map((channel) => {
                        const isActive = activeChannel === channel.id;
                        const isPrivate = channel.id?.startsWith('dm-');
                        const isCustomSidebar = channel.id?.startsWith('dm-') || channel.id?.startsWith('event-');

                        return (
                            <motion.button
                                key={channel.id}
                                onClick={() => {
                                    setActiveChannel(channel.id);
                                    setIsMobileListVisible(false);
                                }}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "w-full relative px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 group text-left",
                                    isActive
                                        ? "bg-[var(--bg-card-hover)] text-[var(--text-primary)] shadow-lg border border-[var(--border-color)]"
                                        : "hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                                    isActive
                                        ? "bg-vibe-cyan text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                        : "bg-[var(--surface-highlight)] text-[var(--text-secondary)] group-hover:bg-[var(--bg-card-hover)] group-hover:text-[var(--text-primary)]"
                                )}>
                                    {isPrivate ? <Users className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center pr-1">
                                        <span className={cn("font-bold truncate text-sm", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]")}>{channel.label}</span>
                                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-vibe-cyan animate-pulse" />}
                                        {isCustomSidebar && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onLeaveChannel?.(channel.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                                title="Leave Chat"
                                            >
                                                <LogOut className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* User Footer */}
                <div className="p-3 bg-[var(--surface-glass-high)] backdrop-blur-md border-t border-[var(--border-color)] mx-3 mb-3 rounded-2xl flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 absolute bottom-0 right-0 bg-emerald-500 rounded-full border-2 border-black z-10" />
                        <img src={currentUser.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.username}`} className="w-8 h-8 rounded-full bg-gray-800" alt="me" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">{currentUser.username}</p>
                        <p className="text-[10px] text-emerald-500 font-mono truncate">Online</p>
                    </div>
                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* CHAT WINDOW */}
            <div className={cn(
                "flex-1 flex-col rounded-[2.5rem] obsidian-card relative overflow-hidden transition-all duration-300 border border-[var(--border-color)] bg-[var(--surface-glass)]",
                !isMobileListVisible ? "flex" : "hidden md:flex"
            )}>
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 z-30 p-4">
                    <div className="px-5 py-3 bg-[var(--surface-glass-high)]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsMobileListVisible(true)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">
                                <ArrowLeft className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col">
                                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <span className="text-vibe-cyan text-lg select-none">{isCustom ? '@' : '#'}</span>
                                    {activeChannelLabel}
                                </h2>
                                <p className="text-[10px] text-[var(--text-secondary)] font-medium font-mono uppercase tracking-wide">
                                    {messages.length} Messages • Encrypted
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition" title="Search">
                                <Search className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            {isCustom && (
                                <button
                                    onClick={() => onLeaveChannel?.(activeChannel)}
                                    className="p-2 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                                    title="Leave Chat"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            )}
                            <button className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition" title="More">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 md:px-8 pt-24 pb-28 space-y-4 custom-scrollbar relative z-10 scroll-smooth" onClick={() => setToggledMsgId(null)}>
                    {loading ? (
                        <ThemeSkeleton />
                    ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center px-4">
                            <div className="flex flex-col items-center gap-4 opacity-50">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-vibe-purple/20 to-vibe-cyan/20 flex items-center justify-center blur-xl absolute" />
                                <MessageSquare className="w-12 h-12 text-gray-600 relative z-10" />
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold text-gray-300">Quiet Channel</h3>
                                    <p className="text-gray-600 text-sm">Be the first to vibe here.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender_id === currentUser.id;
                            const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
                            const nextIsSame = messages[idx + 1]?.sender_id === msg.sender_id;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15 }}
                                    key={msg.id}
                                    className={cn("flex group/msg", isMe ? "justify-end" : "justify-start", nextIsSame ? "mb-0.5" : "mb-4")}
                                >
                                    <div className={cn("flex max-w-[85%] md:max-w-[65%] gap-3 relative", isMe ? "flex-row-reverse" : "flex-row")}>

                                        {/* Avatar Column */}
                                        <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                                            {showAvatar && !isMe ? (
                                                <img src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${msg.sender?.username}`} className="w-8 h-8 rounded-lg object-cover bg-black/50 border border-white/5" alt="Use" />
                                            ) : <div className="w-8" />}
                                        </div>

                                        <div className={cn("flex flex-col gap-1 min-w-0", isMe ? "items-end" : "items-start")}>
                                            {showAvatar && !isMe && <span className="ml-1 text-[10px] font-bold text-gray-500">{msg.sender?.username}</span>}

                                            <div
                                                onClick={(e) => { e.stopPropagation(); setToggledMsgId(prev => prev === msg.id ? null : msg.id); }}
                                                className={cn(
                                                    "relative px-4 py-2.5 text-[14px] leading-relaxed cursor-pointer transition-all duration-200 break-words shadow-sm border",
                                                    isMe
                                                        ? "bg-vibe-purple text-white border-vibe-purple/50 rounded-[18px] rounded-br-sm"
                                                        : "bg-[var(--bg-card-hover)] text-[var(--text-primary)] border-[var(--border-color)] rounded-[18px] rounded-bl-sm hover:brightness-95"
                                                )}
                                            >
                                                {msg.text}

                                                {/* Context Menu */}
                                                {toggledMsgId === msg.id && (
                                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("absolute -top-10 flex bg-[#0a0a0f] border border-white/10 p-1 rounded-lg shadow-xl z-50", isMe ? "right-0" : "left-0")}>
                                                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(msg.text); setToggledMsgId(null); }} className="hover:bg-white/10 p-1.5 rounded-md text-gray-400 hover:text-white" title="Copy"><Paperclip className="w-3.5 h-3.5" /></button>
                                                        {isMe && <button onClick={(e) => { e.stopPropagation(); const msgId = msg.id; setMessages(p => p.filter(m => m.id !== msgId)); setToggledMsgId(null); chat.deleteMessage(msgId).catch(() => { addNotification?.('Failed to delete message', 'error'); }); }} className="hover:bg-red-900/30 text-red-400 p-1.5 rounded-md ml-1" title="Delete"><X className="w-3.5 h-3.5" /></button>}
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Timestamp */}
                                            {!nextIsSame && (
                                                <span className={cn("text-[9px] font-mono opacity-50", isMe ? "mr-1 text-vibe-purple" : "ml-1 text-gray-600")}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="absolute bottom-6 left-4 right-4 md:left-24 md:right-24 z-30">
                    <form onSubmit={handleSend} className="relative group/input">
                        <div className={cn(
                            "relative flex items-end gap-2 bg-[var(--surface-glass-high)]/90 backdrop-blur-3xl p-1.5 pl-4 rounded-[1.5rem] border transition-all duration-300 shadow-2xl obsidian-card",
                            inputText.trim() ? "border-vibe-purple/50 ring-1 ring-vibe-purple/20" : "border-[var(--border-color)]"
                        )}>
                            <button type="button" className="pb-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"><Plus className="w-5 h-5" /></button>

                            <div className="flex-1 py-2.5">
                                <input
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder={`Message ${activeChannelLabel}...`}
                                    className="w-full bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-1 pr-1 pb-1">
                                {!inputText.trim() && (
                                    <>
                                        <button type="button" className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition"><Image className="w-4 h-4" /></button>
                                        <button type="button" className="p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition"><AtSign className="w-4 h-4" /></button>
                                    </>
                                )}
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className={cn(
                                        "p-2 rounded-full transition-all duration-300 flex items-center justify-center",
                                        inputText.trim()
                                            ? "bg-vibe-purple text-white shadow-lg rotate-0 scale-100"
                                            : "bg-white/5 text-gray-600 -rotate-90 scale-75 opacity-0 w-0 p-0 overflow-hidden"
                                    )}
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};
