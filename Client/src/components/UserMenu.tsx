import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface UserMenuProps {
  onLogout: () => void;
}

export default function UserMenu({ onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('My Account');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Decode the JWT Token to find out who is logged in!
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        if (decodedPayload.sub) {
          setUserIdentifier(decodedPayload.sub);
        }
      }
    } catch (error) {
      console.error("Could not parse user from token.");
    }

    // 2. Click outside to close menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = userIdentifier.charAt(0).toUpperCase();

  return (
    <div className="relative ml-1" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 transition-colors hover:bg-slate-100 dark:hover:bg-[#1e2130]"
      >
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
          {initial}
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden md:block max-w-[100px] truncate">
          {userIdentifier}
        </span>
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-56 z-50 overflow-hidden"
          style={{
            background: 'white',
            border: '1px solid #e0e3e8',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* User info header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Signed in as</p>
            <p className="text-sm font-black text-slate-800 truncate mt-0.5">{userIdentifier}</p>
          </div>

          <div className="py-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-colors font-medium">
              <User size={14} /> My Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-colors font-medium">
              <Settings size={14} /> Preferences
            </button>
          </div>

          <div className="py-1 border-t border-slate-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
