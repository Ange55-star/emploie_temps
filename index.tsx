
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, ShieldCheck, History, 
  CheckCircle, X, MapPin, Bell, Send, Check, Trash2, Clock, 
  Lock, Unlock, Eye, User as UserIcon, AlertTriangle, ArrowRight, ListChecks, Info
} from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const SLOTS = ['08h00 - 11h00', '11h30 - 14h30', '15h00 - 18h00'];

const App = () => {
  // Navigation
  const [view, setView] = useState<'STUDENT' | 'TEACHER' | 'ADMIN' | 'HISTORY'>('TEACHER');
  const [currentUser] = useState({ name: 'Dr. EBANDA', role: 'TEACHER' });
  
  // États simulés (Mock Data)
  const [vœux, setVœux] = useState<any[]>([
    { id: '101', teacher: 'Dr. EBANDA', day: 'Mercredi', slot: '11h30 - 14h30', status: 'PENDING' },
    { id: '102', teacher: 'Dr. MONTHE', day: 'Lundi', slot: '08h00 - 11h00', status: 'PENDING' }
  ]);

  const [entries, setEntries] = useState<any[]>([
    { id: '1', day: 'Lundi', slot: '08h00 - 11h00', ue: 'ICT207', teacher: 'Dr. MONTHE', room: 'Amphi 200' }
  ]);

  const [auditTrail, setAuditTrail] = useState<any[]>([
    { id: 'a1', user: 'Système', action: 'INIT', details: 'Démarrage du simulateur ICT Portal', time: '09:00' }
  ]);

  // État de sélection locale
  const [localSelection, setLocalSelection] = useState<{day: string, slot: string}[]>([]);

  const logAction = (action: string, details: string, user: string) => {
    setAuditTrail([{ id: Date.now().toString(), user, action, details, time: new Date().toLocaleTimeString() }, ...auditTrail]);
  };

  // LOGIQUE ENSEIGNANT
  const toggleSelection = (day: string, slot: string) => {
    const exists = localSelection.find(s => s.day === day && s.slot === slot);
    if (exists) {
      setLocalSelection(localSelection.filter(s => !(s.day === day && s.slot === slot)));
    } else {
      setLocalSelection([...localSelection, { day, slot }]);
    }
  };

  const handleAddVœux = () => {
    if (localSelection.length === 0) return;
    
    const newVœux = localSelection.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      teacher: currentUser.name,
      day: s.day,
      slot: s.slot,
      status: 'PENDING'
    }));

    setVœux([...vœux, ...newVœux]);
    logAction('AJOUT_VOEUX', `${newVœux.length} créneaux proposés`, currentUser.name);
    setLocalSelection([]);
    alert("Vœux enregistrés avec succès ! Ils sont maintenant en attente d'arbitrage.");
  };

  // LOGIQUE ADMIN
  const validateVœu = (id: string) => {
    const v = vœux.find(x => x.id === id);
    if (!v) return;

    const newEntry = {
      id: Date.now().toString(),
      day: v.day,
      slot: v.slot,
      ue: 'COURS ICT (Validé)',
      teacher: v.teacher,
      room: 'Salle 102'
    };

    setEntries([...entries, newEntry]);
    setVœux(vœux.filter(x => x.id !== id));
    logAction('VALIDATION', `Vœu de ${v.teacher} validé pour ${v.day}`, 'Admin');
  };

  const deleteVœu = (id: string) => {
    const v = vœux.find(x => x.id === id);
    setVœux(vœux.filter(x => x.id !== id));
    logAction('REFUS', `Vœu de ${v?.teacher} refusé`, 'Admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-['Plus_Jakarta_Sans']">
      {/* HEADER / NAV */}
      <nav className="bg-[#0f172a] text-white p-6 sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-xl"><Calendar size={24}/></div>
            <span className="text-2xl font-black uppercase tracking-tighter">ICT <span className="text-indigo-400">Portal</span></span>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button onClick={() => setView('STUDENT')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'STUDENT' ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}>Étudiants</button>
            <button onClick={() => setView('TEACHER')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'TEACHER' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'text-slate-400 hover:text-white'}`}>Enseignant</button>
            <button onClick={() => setView('ADMIN')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'ADMIN' ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'text-slate-400 hover:text-white'}`}>Arbitrage</button>
            <button onClick={() => setView('HISTORY')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'HISTORY' ? 'bg-slate-700 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Audit</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 md:p-12">
        {/* VUE ENSEIGNANT */}
        {view === 'TEACHER' && (
          <div className="space-y-12 animate-in max-w-6xl mx-auto">
            <div className="bg-emerald-600 p-12 rounded-[50px] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 overflow-hidden relative">
              <div className="relative z-10">
                <h1 className="text-4xl font-black uppercase tracking-tight">Proposer vos créneaux</h1>
                <p className="text-emerald-100 font-bold text-xs uppercase tracking-widest mt-3 flex items-center gap-2">
                  <Info size={14}/> Cliquez sur les cases de la grille pour les sélectionner
                </p>
              </div>
              <button 
                onClick={handleAddVœux}
                disabled={localSelection.length === 0}
                className={`relative z-10 px-10 py-5 rounded-[25px] font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${localSelection.length > 0 ? 'bg-white text-emerald-700 hover:scale-105 active:scale-95' : 'bg-emerald-700 text-emerald-400 cursor-not-allowed opacity-50'}`}
              >
                <Send size={18}/> Confirmer {localSelection.length} vœu(x)
              </button>
              <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                <Calendar size={300} strokeWidth={1}/>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100">
                  <div className="grid grid-cols-7 gap-4">
                    <div className="pt-14 space-y-20">
                      {SLOTS.map(s => <p key={s} className="text-[10px] font-black text-slate-300 uppercase rotate-[-90deg] whitespace-nowrap">{s.split(' - ')[0]}</p>)}
                    </div>
                    {DAYS.map(day => (
                      <div key={day} className="space-y-4">
                        <p className="text-[10px] font-black text-center text-slate-900 uppercase tracking-widest mb-6">{day}</p>
                        {SLOTS.map(slot => {
                          const isSelected = localSelection.find(s => s.day === day && s.slot === slot);
                          const isAlreadySent = vœux.find(v => v.teacher === currentUser.name && v.day === day && v.slot === slot);
                          
                          return (
                            <button
                              key={slot}
                              disabled={!!isAlreadySent}
                              onClick={() => toggleSelection(day, slot)}
                              className={`w-full h-24 rounded-3xl border-2 transition-all flex items-center justify-center group relative
                                ${isAlreadySent ? 'bg-emerald-50 border-emerald-100 cursor-default opacity-50' : 
                                  isSelected ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-200' : 
                                  'bg-slate-50 border-slate-50 hover:border-emerald-200 hover:bg-white'}`}
                            >
                              {isAlreadySent ? <CheckCircle size={20} className="text-emerald-400"/> : 
                               isSelected ? <Check size={24} strokeWidth={4}/> : 
                               <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-200"></div>}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-8 flex justify-between items-center">
                    Vœux en attente 
                    <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px]">
                      {vœux.filter(v => v.teacher === currentUser.name).length}
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {vœux.filter(v => v.teacher === currentUser.name).map(v => (
                      <div key={v.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group animate-in">
                        <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase">{v.day}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{v.slot}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-black bg-white text-slate-400 px-2 py-1 rounded-lg border border-slate-100">PENDING</span>
                          <button onClick={() => setVœux(vœux.filter(x => x.id !== v.id))} className="p-2 text-rose-300 hover:text-rose-500 transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                    ))}
                    {vœux.filter(v => v.teacher === currentUser.name).length === 0 && (
                      <div className="text-center py-10 opacity-30 italic text-xs">Aucun vœu soumis</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VUE ADMIN */}
        {view === 'ADMIN' && (
          <div className="max-w-5xl mx-auto space-y-10 animate-in">
            <div className="bg-amber-500 p-12 rounded-[50px] text-white shadow-2xl flex justify-between items-center overflow-hidden relative">
              <div className="relative z-10">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Tableau d'Arbitrage</h1>
                <p className="text-amber-100 font-bold text-xs uppercase tracking-[0.3em] mt-3">Régulation des ressources académiques</p>
              </div>
              <ShieldCheck size={64} className="opacity-20 relative z-10"/>
              <div className="absolute left-0 bottom-0 w-full h-1 bg-white/20"></div>
            </div>

            <div className="grid gap-4">
              {vœux.map(v => (
                <div key={v.id} className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-amber-200 transition-all">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center font-black text-amber-600 text-2xl shadow-inner uppercase">
                      {v.teacher.split(' ')[1]?.[0] || 'T'}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-lg tracking-tight">{v.teacher}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-amber-500 uppercase bg-amber-50 px-3 py-1 rounded-full">{v.day}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.slot}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-100 transition-all">Décaler</button>
                    <button onClick={() => deleteVœu(v.id)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><X size={20}/></button>
                    <button 
                      onClick={() => validateVœu(v.id)}
                      className="flex-1 md:flex-none px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
                    >
                      Valider
                    </button>
                  </div>
                </div>
              ))}
              {vœux.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <ListChecks size={40}/>
                  </div>
                  <p className="text-slate-300 font-black uppercase text-xs tracking-[0.2em]">Tous les vœux ont été arbitrés</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VUE ÉTUDIANT */}
        {view === 'STUDENT' && (
          <div className="animate-in">
             <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                  <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none">ICT4D L2</h1>
                  <p className="text-indigo-500 font-black uppercase text-xs tracking-[0.4em] mt-4 flex items-center gap-3">
                    <div className="w-10 h-1 bg-indigo-500"></div> Emploi du temps officiel
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white border border-slate-100 px-8 py-4 rounded-[25px] shadow-sm">
                    <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Semestre</p>
                    <p className="text-xs font-black text-slate-900 uppercase">S1 2025/2026</p>
                  </div>
                </div>
             </div>

             <div className="bg-white rounded-[60px] shadow-2xl border border-slate-100 p-12 overflow-x-auto relative">
                <table className="w-full border-separate border-spacing-6">
                    <thead>
                        <tr>
                            <th className="w-32"></th>
                            {DAYS.map(day => <th key={day} className="text-[10px] font-black text-slate-400 uppercase pb-6 px-4 text-center tracking-widest border-b-2 border-slate-50">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {SLOTS.map(slot => (
                            <tr key={slot}>
                                <td className="text-[10px] font-black text-slate-400 align-top pt-8 pr-8 border-r-2 border-slate-50 leading-loose">
                                  {slot.split(' - ')[0]}<br/><span className="text-slate-200">|</span><br/>{slot.split(' - ')[1]}
                                </td>
                                {DAYS.map(day => {
                                    const entry = entries.find(e => e.day === day && e.slot === slot);
                                    return (
                                        <td key={day+slot} className="min-w-[240px] align-top">
                                            {entry ? (
                                                <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-200 transform hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
                                                    <div className="flex justify-between items-start mb-6">
                                                      <span className="bg-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">UE : {entry.ue}</span>
                                                      <MapPin size={16} className="text-indigo-300"/>
                                                    </div>
                                                    <p className="text-2xl font-black uppercase leading-tight tracking-tight mb-8">{entry.ue}</p>
                                                    <div className="flex items-center gap-4 pt-6 border-t border-indigo-500/50">
                                                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xs font-black">
                                                        {entry.teacher.split(' ')[1]?.[0]}
                                                      </div>
                                                      <div>
                                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{entry.teacher}</p>
                                                        <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-1">{entry.room}</p>
                                                      </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-40 rounded-[40px] border-2 border-dashed border-slate-50 bg-slate-50/20 flex flex-col items-center justify-center opacity-40 group hover:opacity-100 transition-opacity">
                                                  <div className="w-1 h-1 rounded-full bg-slate-200 mb-2"></div>
                                                  <span className="italic text-[9px] font-black uppercase text-slate-200 tracking-widest">Disponible</span>
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

        {/* VUE AUDIT */}
        {view === 'HISTORY' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-12 flex items-center gap-6">
              Audit Trail <div className="h-2 w-32 bg-indigo-600 mt-4"></div>
            </h2>
            <div className="space-y-4">
              {auditTrail.map(l => (
                <div key={l.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${l.user === 'Admin' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {l.user === 'Admin' ? <ShieldCheck size={24}/> : <UserIcon size={24}/>}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{l.action} : {l.details}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{l.user}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10}/> {l.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-100" size={32}/>
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
