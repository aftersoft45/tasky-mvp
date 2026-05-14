// app/profile/ProfileClient.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Target, User, Shield, LayoutGrid, Camera, Check, AlertCircle, ArrowLeft, Upload, X } from 'lucide-react';
import UserProfileMenu from '../components/UserProfileMenu';

interface ProfileClientProps {
  user: any;
  workspaces: any[];
  isGoogleUser: boolean;
}

// Generamos avatares predeterminados usando DiceBear
const PREDEFINED_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Tasky1&backgroundColor=059669",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Tasky2&backgroundColor=0ea5e9",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Tasky3&backgroundColor=8b5cf6",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=1e293b",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=1e293b",
  "https://api.dicebear.com/7.x/shapes/svg?seed=Shape1&backgroundColor=0f172a"
];

export default function ProfileClient({ user, workspaces, isGoogleUser }: ProfileClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cuenta' | 'seguridad' | 'espacios'>('cuenta');
  
  // Estados de formularios
  const [name, setName] = useState(user.name || '');
  const [image, setImage] = useState(user.image || ''); 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estado para el modal de Avatar
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  // Manejar la subida de un archivo local Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen es muy grande. Máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setIsAvatarModalOpen(false); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (activeTab === 'seguridad') {
      if (newPassword !== confirmPassword) {
        setMessage({ text: 'Las nuevas contraseñas no coinciden.', type: 'error' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: activeTab === 'cuenta' ? name : undefined,
          image: activeTab === 'cuenta' ? image : undefined, 
          currentPassword: activeTab === 'seguridad' ? currentPassword : undefined,
          newPassword: activeTab === 'seguridad' ? newPassword : undefined,
        })
      });

      if (res.ok) {
        setMessage({ text: '¡Cambios guardados con éxito!', type: 'success' });
        if (activeTab === 'seguridad') {
          setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        }
        router.refresh(); 
      } else {
        setMessage({ text: await res.text(), type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error de conexión', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1d2125] text-[#c9d1d9] font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* MODAL PARA CAMBIAR AVATAR */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1d2125] border border-[#30363d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
            
            <div className="flex justify-between items-center p-5 border-b border-[#30363d]">
              <h3 className="font-bold text-white text-lg">Cambiar foto de perfil</h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* subir imagen local */}
              <div>
                <p className="text-sm font-medium text-gray-400 mb-3">Subir tu propia imagen (Max 2MB)</p>
                <label className="flex items-center justify-center gap-2 w-full bg-[#161a1d] border-2 border-dashed border-[#30363d] hover:border-emerald-500 text-gray-300 hover:text-emerald-400 p-4 rounded-xl cursor-pointer transition-colors group">
                  <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                  <span className="font-medium">Seleccionar archivo...</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-[#30363d] flex-1"></div>
                <span className="text-xs text-gray-500 font-medium">O ELIGE UNA PREDETERMINADA</span>
                <div className="h-px bg-[#30363d] flex-1"></div>
              </div>

              {/* Galería de avatares */}
              <div className="grid grid-cols-3 gap-4">
                {PREDEFINED_AVATARS.map((url, i) => (
                  <button 
                    key={i}
                    onClick={() => { setImage(url); setIsAvatarModalOpen(false); }}
                    className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all bg-[#161a1d]"
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="h-16 flex items-center justify-between px-6 border-b border-[#30363d] bg-[#161a1d] shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-emerald-400 transition-colors mr-2">
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-[#1d2125] p-1.5 rounded-lg border border-[#30363d]">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-white text-lg">Ajustes de Perfil</span>
        </div>
        <UserProfileMenu user={{...user, image: image}} />
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">
        
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <button onClick={() => {setActiveTab('cuenta'); setMessage({text:'', type:''})}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'cuenta' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-[#161a1d] hover:text-white border border-transparent'}`}>
            <User size={18} /> Mi Cuenta
          </button>
          <button onClick={() => {setActiveTab('seguridad'); setMessage({text:'', type:''})}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'seguridad' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-[#161a1d] hover:text-white border border-transparent'}`}>
            <Shield size={18} /> Seguridad
          </button>
          <button onClick={() => {setActiveTab('espacios'); setMessage({text:'', type:''})}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'espacios' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-[#161a1d] hover:text-white border border-transparent'}`}>
            <LayoutGrid size={18} /> Mis Proyectos
          </button>
        </aside>

        {/* formularios  */}
        <main className="flex-1">
          <div className="bg-[#161a1d] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-cyan-500"></div>

            <div className="p-6 md:p-8">
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' : 'bg-red-950/30 text-red-400 border-red-900/50'}`}>
                  {message.type === 'success' ? <Check size={18}/> : <AlertCircle size={18}/>}
                  {message.text}
                </div>
              )}

              {/* cuenta */}
              {activeTab === 'cuenta' && (
                <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Perfil Público</h2>
                    <p className="text-gray-400 text-sm">Administra tu información personal y cómo te ven los demás.</p>
                  </div>

                  <div className="flex items-center gap-6 pb-6 border-b border-[#30363d]">
                    <div 
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="relative group cursor-pointer w-24 h-24 rounded-full border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] overflow-hidden bg-[#1d2125]"
                    >
                    
                      {image ? (
                        <img src={image} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-100 font-bold text-4xl group-hover:opacity-40 transition-opacity">
                          {initial}
                        </div>
                      )}
                      
            
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <Camera size={28} className="text-white drop-shadow-md" />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Foto de perfil</p>
                      <p className="text-xs text-gray-500 max-w-xs mb-3">Haz clic en la imagen para cambiarla. Puedes subir una foto tuya o elegir un avatar de Tasky.</p>
                      {image !== user.image && <span className="text-xs text-emerald-400 font-medium bg-emerald-950/50 px-2 py-1 rounded">Imagen lista para guardar</span>}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Nombre completo</label>
                      <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required className="w-full bg-[#1d2125] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Correo electrónico (No modificable)</label>
                      <input type="email" value={user.email} disabled className="w-full bg-[#1d2125]/50 border border-[#30363d] rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed" />
                    </div>
                  </div>

                  <button disabled={isLoading} type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-6 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50">
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </form>
              )}

              {/*SEGURIDAD */}
              {activeTab === 'seguridad' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-1">Seguridad y Acceso</h2>
                    <p className="text-gray-400 text-sm">Protege tu cuenta actualizando tu contraseña periódicamente.</p>
                  </div>

                  {isGoogleUser ? (
                    <div className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-6 text-center">
                      <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-white mb-2">Cuenta vinculada a Google</h3>
                      <p className="text-gray-400 text-sm">Tu cuenta está gestionada a través de Google. Tu contraseña y seguridad se manejan directamente desde allí.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdate} className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña Actual</label>
                        <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} required className="w-full bg-[#1d2125] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Nueva Contraseña</label>
                        <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required minLength={6} className="w-full bg-[#1d2125] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar Nueva Contraseña</label>
                        <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required minLength={6} className="w-full bg-[#1d2125] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors" />
                      </div>
                      <button disabled={isLoading} type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-6 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50">
                        {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ESPACIOS */}
              {activeTab === 'espacios' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">Mis Proyectos</h2>
                      <p className="text-gray-400 text-sm">Un resumen de todos los Taskyspaces a los que perteneces.</p>
                    </div>
                  </div>

                  {workspaces.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {workspaces.map(space => (
                        <Link href={`/workspace/${space.id}`} key={space.id} className="bg-[#1d2125] p-4 rounded-xl border border-[#30363d] hover:border-emerald-500/50 transition-colors group">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-[#161a1d] border border-[#30363d] text-emerald-400 flex items-center justify-center font-bold">
                              {space.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-white font-bold group-hover:text-emerald-400 transition-colors">{space.name}</h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                {space.privacy} • Creado el {new Date(space.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-[#30363d] flex justify-between items-center">
                            <span className="text-xs text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                              Rol: {space.members[0]?.role}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-10 bg-[#1d2125] rounded-xl border border-[#30363d]">
                      <p className="text-gray-400">Aún no perteneces a ningún proyecto.</p>
                      <Link href="/workspace" className="text-emerald-400 font-medium hover:underline mt-2 inline-block">Ir al directorio para crear uno</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}