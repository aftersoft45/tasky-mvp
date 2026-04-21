// app/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Target } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Mandamos los datos a nuestra API
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Si se registra bien, iniciamos sesión automáticamente
        await signIn('credentials', { email, password, callbackUrl: '/dashboard' });
      } else {
        const errorData = await res.text();
        setError(errorData);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1d2125] p-4 font-sans text-[#c9d1d9]">
      <div className="w-full max-w-md bg-[#161a1d] border border-[#30363d] rounded-2xl p-8 shadow-2xl">
        
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="bg-[#2c333b] p-3 rounded-xl border border-[#30363d] mb-4 hover:border-cyan-500 transition-colors">
            <Target className="w-8 h-8 text-cyan-400" />
          </Link>
          <h2 className="text-2xl font-bold text-white">Crea tu cuenta</h2>
          <p className="text-sm text-gray-500 mt-1">Únete a Tasky y domina tus proyectos</p>
        </div>

        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-colors mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Registrarse con Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-[#30363d] flex-1"></div>
          <span className="text-xs text-gray-500 uppercase font-semibold">O con correo</span>
          <div className="h-px bg-[#30363d] flex-1"></div>
        </div>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre completo</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej. Juan Pérez" 
              className="w-full bg-[#22272b] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Correo electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@empresa.com" 
              className="w-full bg-[#22272b] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres" 
              className="w-full bg-[#22272b] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-neutral-950 font-bold py-2.5 rounded-lg transition-colors mt-2 shadow-lg shadow-cyan-900/20">
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          ¿Ya tienes una cuenta? <Link href="/login" className="text-cyan-400 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}