import React from 'react';
import { MessageSquare, Users, Zap } from 'lucide-react';
import { cn } from '../utils/constants';

export const NotificationPanel = ({ items, onClear, onClose }) => (
    <div className="absolute right-0 top-14 w-[360px] max-h-[420px] glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
            <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="text-[11px] text-gray-500">Chats, global chats, and vibe updates</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onClear}
                    className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition"
                >
                    Clear
                </button>
                <button
                    onClick={onClose}
                    className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition"
                >
                    Close
                </button>
            </div>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications yet.</div>
            ) : (
                items.map((item) => (
                    <div key={item.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition">
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center",
                                item.category === 'vibe' ? "bg-vibe-purple/20" : item.category === 'global-chat' ? "bg-vibe-cyan/20" : "bg-white/10"
                            )}>
                                {item.category === 'vibe' ? <Zap className="w-4 h-4 text-vibe-purple" /> : item.category === 'global-chat' ? <MessageSquare className="w-4 h-4 text-vibe-cyan" /> : <Users className="w-4 h-4 text-white/70" />}
                            </div>
                            <div className="flex-1">
                                <p className={cn("text-sm", item.read ? "text-gray-400" : "text-white")}>{item.msg}</p>
                                <p className="text-[10px] text-gray-500 mt-1">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            {!item.read && <span className="w-2 h-2 rounded-full bg-vibe-rose mt-2" />}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
