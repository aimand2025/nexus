'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Shield, Info, AlertTriangle } from 'lucide-react';

type Notification = {
  id: string;
  type: 'info' | 'security' | 'alert';
  message: string;
  time: string;
};

export default function ImperialNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mock incoming notifications
    const mockData: Notification[] = [
      { id: '1', type: 'security', message: '邊緣網路防護已啟動 (Cloudflare WAF)', time: '1m ago' },
      { id: '2', type: 'info', message: '新任務 [Machu] 已同步至所有節點', time: '5m ago' },
      { id: '3', type: 'alert', message: '偵測到非授權訪問嘗試 (已封鎖)', time: '10m ago' }
    ];
    setNotifications(mockData);
  }, []);

  return (
    <div className="fixed bottom-8 left-8 z-[60]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform relative group"
      >
        <Bell className="text-white w-5 h-5" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
        <div className="absolute left-14 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
          帝國通訊中心
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 left-0 w-80 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h4 className="text-xs font-bold text-white tracking-widest uppercase">系統訊息匯流</h4>
              <span className="text-[8px] font-mono text-zinc-500">Node: TW-NORTH-1</span>
            </div>
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    n.type === 'security' ? 'bg-emerald-500/10 text-emerald-500' : 
                    n.type === 'alert' ? 'bg-red-500/10 text-red-500' : 
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {n.type === 'security' && <Shield size={12} />}
                    {n.type === 'alert' && <AlertTriangle size={12} />}
                    {n.type === 'info' && <Info size={12} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-zinc-300 leading-tight">{n.message}</p>
                    <span className="text-[9px] text-zinc-600 font-mono">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
