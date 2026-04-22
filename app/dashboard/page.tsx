// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Target, ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import UserProfileMenu from "../components/UserProfileMenu";
import { prisma } from "../../lib/db"; // <-- NUEVO: Importamos la base de datos

export default async function DashboardPage() {
  // 1. Verificamos si hay sesión
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. NUEVO: Traemos los datos más "frescos" directamente de la base de datos
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Extraemos su primer nombre del usuario actualizado
  const name = dbUser.name || "Usuario";
  const firstName = name.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#1d2125] text-[#c9d1d9] font-sans flex flex-col relative overflow-hidden">
      
      {/* Resplandores Neón de Fondo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[180px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* NAVBAR */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-[#30363d] bg-[#161a1d]/80 backdrop-blur-md relative z-50 shrink-0">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-[#1d2125] p-1.5 rounded-lg border border-[#30363d] group-hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-500/10">
              <Target className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Tasky</h1>
        </div>
        <div className="flex items-center gap-4 relative">
          {/* NUEVO: Le pasamos 'dbUser' en lugar de 'session.user' */}
          <UserProfileMenu user={dbUser} />
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center mt-12 md:mt-20 px-4 relative z-10 overflow-y-auto">
        
        {/* --- SECCIÓN DE BIENVENIDA CON ONDAS DE SONIDO --- */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-10 mb-16 p-10 rounded-3xl bg-[#161a1d] border border-[#30363d] relative overflow-hidden shadow-2xl shadow-black/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-shadow duration-700">
          
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/10 to-transparent pointer-events-none"></div>

          <div className="flex-1 text-center md:text-left z-10 relative">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Hola de nuevo, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center md:justify-start gap-3">
                {firstName}. <Sparkles className="text-yellow-300 w-8 h-8 md:w-12 md:h-12 hidden md:block" />
              </span>
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
              Tus proyectos te están esperando. Mueve tus tarjetas, prioriza tus tareas y conquista tus metas hoy en <span className="text-emerald-300 font-medium">Tasky</span>.
            </p>
          </div>

          <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 relative flex items-center justify-center">
            <div className="relative z-20 w-16 h-16 bg-[#1d2125] border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)]">
              <Target className="text-emerald-400 w-8 h-8" />
            </div>
            <div className="absolute inset-0 m-auto w-full h-full rounded-full border-2 border-emerald-500/60 animate-soundwave"></div>
            <div className="absolute inset-0 m-auto w-full h-full rounded-full border-2 border-cyan-500/40 animate-soundwave delay-1000"></div>
            <div className="absolute inset-0 m-auto w-full h-full rounded-full border-2 border-emerald-500/20 animate-soundwave delay-2000"></div>
          </div>
        </div>

        {/* --- SECCIÓN DE TARJETAS Y BANNER --- */}
        <div className="w-full max-w-5xl space-y-16 mb-20">
          <div className="w-full">
            <div className="flex justify-between items-end mb-4 px-2">
              <p className="text-gray-400 font-medium flex items-center gap-2">
                <LayoutDashboard size={18} className="text-emerald-400"/> Tu centro de trabajo
              </p>
            </div>

            <div className="group relative bg-[#161a1d] border border-[#30363d] rounded-2xl p-1 overflow-hidden transition-all hover:border-emerald-700 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-900/20 to-transparent pointer-events-none"></div>
              
              <div className="bg-[#1d2125] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#161a1d] rounded-2xl border border-[#30363d] flex items-center justify-center text-emerald-400 group-hover:bg-emerald-950/50 group-hover:scale-110 transition-all duration-500 shadow-inner">
                    <Target size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Directorio de Taskyspaces</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                      Accede a tus proyectos recientes, revisa tus invitaciones o crea un nuevo espacio de trabajo desde cero.
                    </p>
                  </div>
                </div>

                <Link href="/workspace" className="w-full md:w-auto flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-8 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-1 shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap">
                  Entrar a Tasky <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="relative rounded-3xl overflow-hidden border border-[#30363d] group shadow-2xl shadow-black">
              <img 
                src="https://images.unsplash.com/photo-1607799279861-4dddf96da83c?q=80&w=1200&auto=format&fit=crop" 
                alt="Explorar Tasky" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-700 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#161a1d] via-[#161a1d]/80 to-transparent"></div>
              
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-md">
                  <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="text-yellow-300" size={24} /> Domina la plataforma
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Descubre atajos de teclado, cómo automatizar tus columnas Kanban y los mejores trucos para exprimir al máximo tus Taskyspaces.
                  </p>
                </div>
                <button className="whitespace-nowrap bg-transparent border-2 border-emerald-500/50 hover:bg-emerald-500 hover:text-neutral-950 text-emerald-400 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  Ver tutoriales
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}