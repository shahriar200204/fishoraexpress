import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, Package, DollarSign, UserCheck, AlertCircle } from 'lucide-react';
import { AppNotification } from '../../types';
import { StorageService } from '../../lib/storage';

interface NotificationDropdownProps {
  recipientId: string;
  onNavigate?: (path: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ recipientId, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    setNotifications(StorageService.getNotifications(recipientId));
  };

  useEffect(() => {
    loadNotifications();
    const handleStorage = () => loadNotifications();
    window.addEventListener('fishora_storage_change', handleStorage);
    return () => window.removeEventListener('fishora_storage_change', handleStorage);
  }, [recipientId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsAsRead(recipientId);
    loadNotifications();
  };

  const handleItemClick = (n: AppNotification) => {
    StorageService.markNotificationAsRead(n.id);
    loadNotifications();
    if (n.link && onNavigate) {
      onNavigate(n.link);
      setIsOpen(false);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'settlement':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'merchant':
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition ${
                    !n.isRead ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'} truncate`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
