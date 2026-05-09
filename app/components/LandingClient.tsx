// app/components/LandingClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Target, BrainCircuit, Github, ChevronRight, ChevronLeft, Layout, Shield, Activity } from 'lucide-react';

export default function LandingClient() {
  // Estado para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const carouselSlides = [
    {
      title: "Tableros Kanban ultra rápidos",
      description: "Mueve tus tareas sin retrasos. Visualiza el flujo completo de tu equipo de desarrollo.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Backlog inteligente y ordenado",
      description: "Prioriza historias de usuario, bugs y tareas con un solo clic. Sin ruido visual.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Métricas que importan",
      description: "Gráficos generados automáticamente para entender la velocidad de tu equipo.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1));

  // Auto-play del carrusel
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#1d2125] text-[#c9d1d9] font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* --- HEADER --- */}
      <header className="py-5 px-6 md:px-10 border-b border-[#30363d] bg-[#161a1d]/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-[#1d2125] p-2 rounded-xl border border-[#30363d] group-hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-500/10">
                <Target className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Tasky</h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors">Características</Link>
            <Link href="#how-it-works" className="text-gray-400 hover:text-emerald-400 transition-colors">Cómo funciona</Link>
            <div className="w-px h-5 bg-[#30363d]"></div>
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-5 py-2.5 rounded-full transition-all font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              Empieza gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden flex flex-col items-center">
        {/* Resplandores de fondo estilo Hacker/Neón */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 right-20 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Tasky v1.0 ya está disponible
          </div>
          
          <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
            Domina tu flujo de trabajo.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Cero distracciones.
            </span>
          </h2>
          
          <p className="mt-8 text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            La alternativa moderna a Jira. Diseñada para equipos ágiles que exigen velocidad, un diseño oscuro inmersivo y el control total de sus proyectos.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="flex justify-center items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1">
              <Zap size={20} className="fill-current"/> Iniciar ahora
            </Link>
            <Link href="/login" className="flex justify-center items-center gap-2.5 bg-[#22272b] hover:bg-[#2c333b] text-white px-8 py-4 rounded-xl text-lg font-medium border border-[#30363d] transition-all hover:-translate-y-1">
              Ver una demo <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup Image */}
        <div className="max-w-6xl mx-auto mt-20 relative z-10 perspective-1000">
          <div className="rounded-2xl border border-[#30363d] overflow-hidden shadow-2xl shadow-emerald-900/20 bg-[#161a1d] p-2 transform transition-transform hover:scale-[1.01] duration-500">
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop" 
              alt="Tasky Dashboard Preview" 
              className="rounded-xl w-full object-cover h-[400px] md:h-[600px] opacity-80"
            />
          </div>
        </div>
      </section>

      {/* --- CAROUSEL SECTION --- */}
      <section className="py-24 px-6 bg-[#161a1d] border-y border-[#30363d] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-16">Visualiza el éxito en cada etapa</h3>
          
          <div className="relative bg-[#1d2125] border border-[#30363d] rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[400px] shadow-2xl">
            {/* Contenido del Slide */}
            <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-10">
              <div className="text-emerald-400 font-bold mb-4 tracking-wider text-sm uppercase">Funcionalidad {currentSlide + 1} de 3</div>
              <h4 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight transition-all">
                {carouselSlides[currentSlide].title}
              </h4>
              <p className="text-lg text-gray-400 mb-10 transition-all">
                {carouselSlides[currentSlide].description}
              </p>
              
              {/* Controles */}
              <div className="flex items-center gap-4 mt-auto">
                <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-[#30363d] flex items-center justify-center text-white hover:bg-[#2c333b] hover:text-emerald-400 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-[#30363d] flex items-center justify-center text-white hover:bg-[#2c333b] hover:text-emerald-400 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Imagen del Slide */}
            <div className="md:w-1/2 relative bg-[#161a1d]">
              <img 
                src={carouselSlides[currentSlide].image} 
                alt={carouselSlides[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 mix-blend-luminosity hover:mix-blend-normal"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1d2125] to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STEPS / HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 px-6 bg-[#1d2125]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Empieza en minutos, no en días.</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">Migrar o empezar desde cero nunca había sido tan fácil. Olvídate de configuraciones interminables.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Línea conectora (visible en desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-[#30363d] to-transparent z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-[#161a1d] border-2 border-[#30363d] group-hover:border-emerald-500 flex items-center justify-center mb-6 transition-all shadow-lg group-hover:shadow-emerald-900/40">
                <Layout className="w-10 h-10 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">1. Crea tu Taskyspace</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Asigna un nombre, elige la privacidad y selecciona la plantilla que mejor se adapte a tu equipo.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-[#161a1d] border-2 border-[#30363d] group-hover:border-blue-500 flex items-center justify-center mb-6 transition-all shadow-lg group-hover:shadow-blue-900/40">
                <Target className="w-10 h-10 text-blue-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">2. Define tu Flujo</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Configura tus estados Kanban (Ej. Por hacer, En Curso) y tus actividades diarias en segundos.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-[#161a1d] border-2 border-[#30363d] group-hover:border-cyan-500 flex items-center justify-center mb-6 transition-all shadow-lg group-hover:shadow-cyan-900/40">
                <Shield className="w-10 h-10 text-cyan-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">3. Invita al Equipo</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Envía invitaciones, asigna roles (Admin, Miembro) y empiecen a dominar el código juntos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 px-6 bg-[#161a1d] border-t border-[#30363d]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Tarjeta 1 */}
              <div className="bg-[#22272b] p-6 rounded-2xl border border-[#30363d] hover:border-emerald-800 transition-all group hover:-translate-y-1">
                <Zap className="w-10 h-10 text-emerald-400 mb-4 bg-[#1d2125] p-2 rounded-lg border border-[#30363d]"/>
                <h4 className="text-lg font-bold text-white">Rendimiento Extremo</h4>
                <p className="mt-2 text-gray-400 text-sm">Construido con Next.js y React. Cada clic se siente instantáneo.</p>
              </div>
              {/* Tarjeta 2 */}
              <div className="bg-[#22272b] p-6 rounded-2xl border border-[#30363d] hover:border-blue-800 transition-all group hover:-translate-y-1 sm:translate-y-8">
                <Shield className="w-10 h-10 text-blue-400 mb-4 bg-[#1d2125] p-2 rounded-lg border border-[#30363d]"/>
                <h4 className="text-lg font-bold text-white">Seguridad Privada</h4>
                <p className="mt-2 text-gray-400 text-sm">Control de acceso avanzado, contraseñas por proyecto y roles granulares.</p>
              </div>
              {/* Tarjeta 3 */}
              <div className="bg-[#22272b] p-6 rounded-2xl border border-[#30363d] hover:border-cyan-800 transition-all group hover:-translate-y-1">
                <Activity className="w-10 h-10 text-cyan-400 mb-4 bg-[#1d2125] p-2 rounded-lg border border-[#30363d]"/>
                <h4 className="text-lg font-bold text-white">Notificaciones Reales</h4>
                <p className="mt-2 text-gray-400 text-sm">Entérate al instante cuando alguien te invita a un nuevo espacio.</p>
              </div>
              {/* Tarjeta 4 */}
              <div className="bg-[#22272b] p-6 rounded-2xl border border-[#30363d] hover:border-purple-800 transition-all group hover:-translate-y-1 sm:translate-y-8">
                <BrainCircuit className="w-10 h-10 text-purple-400 mb-4 bg-[#1d2125] p-2 rounded-lg border border-[#30363d]"/>
                <h4 className="text-lg font-bold text-white">Diseño Dark Mode</h4>
                <p className="mt-2 text-gray-400 text-sm">Tus ojos lo agradecerán. Una paleta de colores pensada para devs.</p>
              </div>
            </div>

            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">El software no debería ser un dolor de cabeza.</h3>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Tasky recorta la grasa de las herramientas corporativas tradicionales. Te damos exactamente las herramientas que necesitas para llevar tu producto de "Idea" a "Producción" sin perder tiempo configurando mil menús.
              </p>
              <ul className="space-y-4 mb-10">
                {['Interfaz libre de desorden', 'Diseñado para equipos pequeños y ágiles', 'Gestión de roles sin complicaciones'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-6 h-6 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-500/50 text-emerald-400">
                      <Check size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 bg-[#2c333b] hover:bg-[#3d444d] text-white px-6 py-3 rounded-lg font-medium border border-[#30363d] transition-colors">
                Crear cuenta gratuita <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-[#30363d] bg-[#111417] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-base">Tasky</span>
            <span className="ml-2">&copy; {new Date().getFullYear()} Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacidad</Link>
            <Link href="https://github.com/tu-usuario/tasky" target="_blank" className="hover:text-white transition-colors bg-[#22272b] p-2 rounded-md border border-[#30363d]">
              <Github size={18} />
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Icono auxiliar
function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}