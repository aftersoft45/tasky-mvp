// app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Target } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthLoadingOverlay from '../components/AuthLoadingOverlay'; // <-- Importamos el Overlay

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Nuevo estado para controlar cuándo mostrar la pantalla de carga
  const [isLoading, setIsLoading] = useState(false);

  // Manejador para el login manual (Correo y Contraseña)
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); 
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Credenciales inválidas. Intenta de nuevo.');
        setIsLoading(false); 
      } else {
        router.push('/dashboard');
       
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.');
      setIsLoading(false);
    }
  };

  // Manejador para el login con Google
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true); // Encendemos el overlay
    
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
      
    } catch (err) {
      setError('Error al conectar con Google.');
      setIsLoading(false);
    }
  };

  return (
    <>
      
      {isLoading && <AuthLoadingOverlay />}

      <div className="min-h-screen flex items-center justify-center bg-[#1d2125] p-4 font-sans text-[#c9d1d9]">
        <div className="w-full max-w-md bg-[#161a1d] border border-[#30363d] rounded-2xl p-8 shadow-2xl relative">
          
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="bg-[#2c333b] p-3 rounded-xl border border-[#30363d] mb-4 hover:border-cyan-500 transition-colors">
              <Target className="w-8 h-8 text-cyan-400" />
            </Link>
            <h2 className="text-2xl font-bold text-white">Te damos la bienvenida</h2>
            <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar a Tasky</p>
          </div>

          {/* Botón de Google Actualizado */}
          <button 
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-[#30363d] flex-1"></div>
            <span className="text-xs text-gray-500 uppercase font-semibold">O con correo</span>
            <div className="h-px bg-[#30363d] flex-1"></div>
          </div>

          {error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

          {/* Formulario Manual Actualizado */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Correo electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="tu@empresa.com" 
                className="w-full bg-[#22272b] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="••••••••" 
                className="w-full bg-[#22272b] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-neutral-950 font-bold py-2.5 rounded-lg transition-colors mt-2 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? 'Conectando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8 relative z-10">
            ¿No tienes una cuenta? <Link href="/register" className="text-cyan-400 hover:underline">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </>
  );
}