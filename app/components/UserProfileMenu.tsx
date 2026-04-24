// app/components/UserProfileMenu.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { User, Settings, Moon, LogOut } from 'lucide-react';
import Link from 'next/link'; 

interface UserProfileMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null; 
  };
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const displayName = user?.name || 'Usuario Tasky';
  const displayEmail = user?.email || 'correo@ejemplo.com';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const AvatarDisplay = ({ className }: { className?: string }) => {
    if (user.image) {
      return <img src={user.image} alt={displayName} className={`object-cover ${className}`} />;
    }
    return <div className={`flex items-center justify-center font-bold text-emerald-100 ${className}`}>{initial}</div>;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-950 border border-emerald-500 overflow-hidden flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:scale-105 hover:border-emerald-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#161a1d]"
      >
        <AvatarDisplay className="w-full h-full" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-[#1d2125] border border-[#30363d] rounded-xl shadow-2xl shadow-black overflow-hidden z-50 transform origin-top-right transition-all">
          
          <div className="p-4 border-b border-[#30363d] flex items-center gap-3 bg-[#161a1d]/50">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 overflow-hidden flex items-center justify-center shrink-0">
              <AvatarDisplay className="w-full h-full text-lg" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
            </div>
          </div>

          <div className="p-2 space-y-0.5">
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2c333b] rounded-lg transition-colors"
            >
              <User size={16} className="text-gray-400" /> Perfil
            </Link>

            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2c333b] rounded-lg transition-colors">
              <Settings size={16} className="text-gray-400" /> Configuración de la cuenta
            </button>

            <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2c333b] rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Moon size={16} className="text-gray-400" /> Theme
              </div>
              <span className="text-xs text-gray-500">Dark</span>
            </button>
          </div>

          <div className="p-2 border-t border-[#30363d]">
            <button 
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
