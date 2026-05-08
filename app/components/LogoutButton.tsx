'use client';

// componente con el boton de cerrar sesion

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";


export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors bg-[#22272b] border border-[#30363d] px-4 py-2 rounded-lg font-medium"
    >
      <LogOut size={16} />
      Cerrar sesión
    </button>
  );
}