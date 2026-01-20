
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, User, ShieldCheck, Users, History, 
  CheckCircle, X, ChevronRight, AlertCircle, MapPin, Info, Bell, Send, Check
} from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const SLOTS = ['08h00 - 11h00', '11h30 - 14h30', '15h00 - 18h00'];

const App = () => {
  const [view, setView] = useState<'STUDENT' | 'TEACHER' | 'ADMIN' | 'HISTORY'>('STUDENT');
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, message: "Bienvenue sur le nouveau portail ICT.", isRead: false, time: "Il y a 1h" }
  ]);
  
  const [targetClass] = useState({ name: "ICT-L2", headcount: 120 });
  const [rooms] = useState([
    { name: "Amphi 200", capacity: 200 },
    { name: "Salle 105", capacity: 40 }
  ]);

  const [entries, setEntries] = useState<any[]>([
    { id: 1, day: 'Lundi', slot: '08h00 - 11h00', ue: 'ICT207', teacher: 'Dr. MONTHE', room: 'Amphi 200' }
  ]);

  const [logs, setLogs] = useState<any[]>([
    { id: 1, action: "Création initiale de l'emploi du temps", user: "Admin", time: "10:00" }
  ]);

  const [vœux, setVœux] = useState<any[]>([
    { id: 101, teacher: 'Dr. EBANDA', day: 'Mercredi', slot: '11h30 - 14h30' }
  ]);

  // État pour la sélection de l'enseignant
  const [selectedSlot, setSelectedSlot] = useState<{day: string, slot: string} | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // FONCTION : Soumission du vœu par l'enseignant
  const handleSubmitVœu = () => {
    if (!selectedSlot) {
      alert("Veuillez d'abord sélectionner un créneau dans la grille.");
      return;
    }

    const newVœu = {
      id: Date.now(),
      teacher: 'Dr. EBANDA (Moi)',
      day: selectedSlot.day,
      slot: selectedSlot.slot
    };

    setVœux([...vœux, newVœu]);
    setSelectedSlot(null);
    
    // Notification de confirmation interne
    const confirmNotif = {
      id: Date.now(),
      message: `Votre demande pour le ${newVœu.day} à ${newVœu.slot} a été envoyée à l'administration.`,
      isRead: false,
      time: "À l'instant"
    };
    setNotifications([confirmNotif, ...notifications]);
    
    alert("Vœu transmis avec succès ! Vous pouvez le voir dans l'espace Admin pour arbitrage.");
  };

  // FONCTION : Validation Admin
  const approveVœu = (v: any) => {
    const newEntry = {
      id: Date.now(),
      day: v.day,
      slot: v.slot,
      ue: 'ICT203 (Nouveau)',
      teacher: v.teacher,
      room: 'Amphi 200'
    };
    setEntries([...entries, newEntry]);
    setVœux(vœux.filter(x => x.id !== v.id));
    
    const newNotif = {
      id: Date.now(),
      message: `Félicitations ! Votre vœu (${v.day} ${v.slot}) a été VALIDÉ par l'admin.`,
      isRead: false,
      time: "À l'instant"
    };
    setNotifications([newNotif, ...notifications]);
    setLogs([{ id: Date.now(), action: `Validation vœu: ${v.teacher} (${v.day})`, user: "Admin", time: new Date().toLocaleTimeString() }, ...logs]);
  };

  const rejectVœu = (v: any) => {
    setVœux(vœux.filter(x => x.id !== v.id));
    const newNotif = {
      id: Date.now(),
      message: `Votre vœu pour le ${v.day} a été REFUSÉ. Veuillez choisir un autre créneau.`,
      isRead: false,
      time: "À l'instant"
    };
    setNotifications([newNotif, ...notifications]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      {/* NAVIGATION PRINCIPALE */}
      <nav className="bg-[#0f172a] text-white p-6 shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg"><Calendar size={20}/></div>
            <span className="text-xl font-black tracking-tighter uppercase">ICT <span className="text-indigo-400">Portal</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
              <button onClick={() => setView('STUDENT')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'STUDENT' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Étudiants</button>
              <button onClick={() => setView('TEACHER')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'TEACHER' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Enseignants</button>
              <button onClick={() => setView('ADMIN')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'ADMIN' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Admin</button>
              <button onClick={() => setView('HISTORY')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'HISTORY' ? 'bg-slate-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Historique</button>
            </div>
            
            <div className="relative cursor-pointer" onClick={() => { setView('TEACHER'); markNotificationsRead(); }}>
              <Bell size={22} className={unreadCount > 0 ? "text-amber-400 animate-pulse" : "text-slate-400"} />
              {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 md:p-12">
        
        {/* VUE ÉTUDIANT (EMPlOI DU TEMPS GLOBAL) */}
        {view === 'STUDENT' && (
          <div className="animate-in">
            <div className="mb-12 flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{targetClass.name}</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Planning Officiel • Capacité Salles Vérifiée</p>
              </div>
              <div className="flex gap-3">
                {rooms.map(r => (
                  <div key={r.name} className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase">{r.name}</p>
                    <p className="text-xs font-black text-slate-700">{r.capacity} places</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-[50px] shadow-2xl border border-slate-100 p-8 overflow-x-auto">
              <table className="w-full border-separate border-spacing-4">
                <thead>
                  <tr>
                    <th className="w-20"></th>
                    {DAYS.map(day => <th key={day} className="text-[10px] font-black text-slate-300 uppercase tracking-widest pb-6">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map(slot => (
                    <tr key={slot}>
                      <td className="text-[9px] font-black text-slate-400 whitespace-nowrap pt-8 align-top">{slot}</td>
                      {DAYS.map(day => {
                        const entry = entries.find(e => e.day === day && e.slot === slot);
                        return (
                          <td key={day+slot} className="min-w-[200px] align-top">
                            {entry ? (
                              <div className="bg-[#1e293b] p-6 rounded-[32px] text-white shadow-xl transform transition-transform hover:scale-105">
                                <p className="text-xl font-black text-indigo-400 mb-1">{entry.ue}</p>
                                <p className="text-[9px] font-bold text-white/40 mb-4 uppercase">{entry.teacher}</p>
                                <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-indigo-200">
                                  <span className="flex items-center gap-1 uppercase tracking-tighter"><MapPin size={10}/> {entry.room}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-32 border-2 border-dashed border-slate-50 rounded-[32px] flex items-center justify-center opacity-40">
                                <span className="text-[8px] font-black text-slate-300 uppercase">Libre</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VUE ENSEIGNANT (Saisie des Désidératas) */}
        {view === 'TEACHER' && (
          <div className="animate-in max-w-6xl mx-auto space-y-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Notifications Enseignant */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                    <Bell size={14} className="text-indigo-600"/> Notifications
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.isRead ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-indigo-50 border-indigo-200 border-l-4 border-l-indigo-500'}`}>
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">{n.message}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase mt-2">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formulaire de Vœux */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-emerald-600 p-10 rounded-[45px] text-white shadow-2xl flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Soumettre mes vœux</h2>
                    <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-widest mt-1">Sélectionnez un créneau libre ci-dessous</p>
                  </div>
                  <button 
                    onClick={handleSubmitVœu}
                    className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-black text-[11px] uppercase shadow-xl hover:bg-emerald-50 transition-all flex items-center gap-2"
                  >
                    <Send size={16} /> Transmettre à l'Admin
                  </button>
                </div>

                <div className="bg-white p-8 rounded-[45px] shadow-sm border border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-2">
                      <thead>
                        <tr>
                          <th className="w-24"></th>
                          {DAYS.map(d => <th key={d} className="text-[10px] font-black text-slate-300 uppercase py-4">{d}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {SLOTS.map(s => (
                          <tr key={s}>
                            <td className="text-[9px] font-black text-slate-400 pr-4 align-middle">{s}</td>
                            {DAYS.map(d => {
                              const isOccupied = entries.some(e => e.day === d && e.slot === s);
                              const isSelected = selectedSlot?.day === d && selectedSlot?.slot === s;
                              
                              return (
                                <td key={d+s}>
                                  <button
                                    disabled={isOccupied}
                                    onClick={() => setSelectedSlot({day: d, slot: s})}
                                    className={`w-full h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 group
                                      ${isOccupied ? 'bg-slate-100 border-slate-100 opacity-30 cursor-not-allowed' : 
                                        isSelected ? 'bg-emerald-500 border-emerald-500 shadow-lg scale-105' : 
                                        'bg-slate-50 border-slate-50 hover:border-emerald-200 hover:bg-white'}`}
                                  >
                                    {isOccupied ? (
                                      <span className="text-[8px] font-black text-slate-400 uppercase">Occupé</span>
                                    ) : isSelected ? (
                                      <>
                                        <Check size={18} className="text-white" />
                                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Choisi</span>
                                      </>
                                    ) : (
                                      <span className="text-[8px] font-black text-slate-300 uppercase group-hover:text-emerald-400 transition-colors">Libre</span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VUE ADMIN : Arbitrage */}
        {view === 'ADMIN' && (
          <div className="animate-in max-w-4xl mx-auto space-y-8">
            <div className="bg-amber-500 p-10 rounded-[45px] text-white shadow-2xl flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Arbitrage des Vœux</h2>
                <p className="text-amber-100 font-bold text-[10px] uppercase tracking-widest mt-3">Valider les désidératas enseignants</p>
              </div>
              <ShieldCheck size={50} className="opacity-40" />
            </div>

            <div className="space-y-4">
              {vœux.map(v => (
                <div key={v.id} className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-amber-200 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-50 rounded-[20px] flex items-center justify-center text-amber-600 font-black text-xl">
                      {v.teacher.charAt(4)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{v.teacher}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Calendar size={12} className="text-amber-400"/> {v.day} • {v.slot}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => rejectVœu(v)}
                      className="px-6 py-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase flex items-center gap-2"
                    >
                      <X size={16}/> Refuser
                    </button>
                    <button 
                      onClick={() => approveVœu(v)}
                      className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                      <CheckCircle size={16}/> Valider
                    </button>
                  </div>
                </div>
              ))}
              {vœux.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[45px] border-2 border-dashed border-slate-100">
                  <AlertCircle size={32} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-300 font-black uppercase text-xs">Aucun désidérata en attente d'arbitrage</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VUE HISTORIQUE */}
        {view === 'HISTORY' && (
          <div className="animate-in max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-800 p-10 rounded-[45px] text-white shadow-2xl flex items-center gap-8">
              <History size={32} className="text-indigo-400"/>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Historique du Système</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Traçabilité complète des modifications</p>
              </div>
            </div>
            <div className="bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {logs.map(l => (
                <div key={l.id} className="p-8 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                      <Check size={20} />
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-slate-800 uppercase leading-none">{l.action}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Opérateur : {l.user} • {l.time}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">Log OK</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
