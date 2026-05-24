import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications([]);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id, { stopPropagation: () => {} });
    navigate('/director/evidencias');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800">Notificaciones</h3>
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Check size={12} /> Marcar todas leídas
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No tienes notificaciones nuevas
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className="p-3 hover:bg-blue-50/50 cursor-pointer transition-colors flex gap-3 relative group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell size={14} />
                    </div>
                    <div className="flex-1 pr-6">
                      <p className="text-xs text-gray-800 font-medium leading-tight">
                        {notif.data.message}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => markAsRead(notif.id, e)}
                      className="absolute right-3 top-4 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
