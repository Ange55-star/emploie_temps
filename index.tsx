
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, ShieldCheck, History, 
  CheckCircle, X, MapPin, Bell, Send, Check, Trash2, Clock, 
  Lock, Unlock, Eye, User as UserIcon, AlertTriangle, ArrowRight, ListChecks
} from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const SLOTS = ['08h00 - 11h00', '11h30 - 14h30', '15h00 - 18h00'];

const App = () => {
  const [view, setView] = useState<'STUDENT' | 'TEACHER' | 'ADMIN' | 'HISTORY'>('TEACHER');
  const [currentUser] = useState({ name: 'Dr. EBANDA', role: 'TEACHER', isAdmin: false });
  
  const [vœux, setVœux] = useState<any[]>([
    { id: 101, teacher: 'Dr. EBANDA', day: 'Mercredi', slot: '11h30 - 14h30' },
    { id: 102, teacher: 'Dr. MONTHE', day: 'Lundi', slot: '08h00 - 11h00' }
  ]);

  const [entries, setEntries] = useState<any[]>([
    { id: 1, day: 'Lundi', slot: '08h00 - 11h00', ue: 'ICT207', teacher: 'Dr. MONTHE', room: 'Amphi 200' }
  ]);

  const [auditTrail, setAuditTrail] = useState<any[]>([
    { id: 1, user: 'Admin', role: 'ADMIN', action: 'INITIALIZE', resource: 'Système', oldVal: null, newVal: 'Démarrage session 2025', time: '08:00:00' }
  ]);

  // État pour la multi-sélection temporaire
  const [selectedSlots, setSelectedSlots] = useState<{day: string, slot: string}[]>([]);

  const logAction = (action: string, resource: string, oldVal: any, newVal: any, user: string, role: string) => {
    const newLog = {
      id: Date.now(),
      user,
      role,
      action,
      resource,
      oldVal: oldVal ? JSON.stringify(oldVal) : 'Néant',
      newVal: newVal ? JSON.stringify(newVal) : 'Supprimé/Validé',
      time: new Date().toLocaleTimeString()
    };
    setAuditTrail([newLog, ...auditTrail]);
  };

  const toggleSlotSelection = (day: string, slot: string) => {
    const isSelected = selectedSlots.find(s => s.day === day && s.slot === slot);
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => !(s.day === day && s.slot === slot)));
    } else {
      setSelectedSlots([...selectedSlots, { day, slot }]);
    }
  };

  const submitDesiderata = () => {
    if (selectedSlots.length === 0) {
      alert("Veuillez sélectionner au moins un créneau dans la grille.");
      return;
    }

    const newVœuxList: any[] = [];
    selectedSlots.forEach(slot => {
      const exists = vœux.find(v => v.teacher === currentUser.name && v.day === slot.day && v.slot === slot.slot);
      if (!exists) {
        newVœuxList.push({ id: Date.now() + Math.random(), teacher: currentUser.name, ...slot });
      }
    });

    if (newVœuxList.length > 0) {
      setVœux([...vœux, ...newVœuxList]);
      logAction('CREATE', `Vœux multiples (${newVœuxList.length}) pour ${currentUser.name}`, null, newVœuxList, currentUser.name, 'TEACHER');
    }
    
    setSelectedSlots([]);
  };

  const adminValidateVœu = (id: number) => {
    const v = vœux.find(x => x.id === id);
    if (!v) return;
    const newEntry = { id: Date.now(), day: v.day, slot: v.slot, ue: 'ICT203 (Validé)', teacher: v.teacher, room: 'Amphi 200' };
    setEntries([...entries, newEntry]);
    setVœux(vœux.filter(x => x.id !== id));
    logAction('VALIDATE', `Vœu ${v.teacher}`, v, 'TRANSFERT PLANNING', 'Admin', 'ADMIN');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <nav className="bg-[#0f172a] text-white p-6 sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg"><Calendar size={20}/></div>
            <span className="text-xl font-black uppercase tracking-tighter">ICT <span className="text-indigo-400">Portal</span></span>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
            <button onClick={() => setView('STUDENT')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'STUDENT' ? 'bg-indigo-500 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Étudiants</button>
            <button onClick={() => setView('TEACHER')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'TEACHER' ? 'bg-emerald-500 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Mon Espace</button>
            <button onClick={() => setView('ADMIN')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'ADMIN' ? 'bg-amber-500 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Arbitrage</button>
            <button onClick={() => setView('HISTORY')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'HISTORY' ? 'bg-slate-700 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Audit</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 md:p-12">
        {view === 'TEACHER' && (
          <div className="animate-in space-y-10 max-w-6xl mx-auto">
            <div className="bg-emerald-600 p-10 rounded-[45px] text-white shadow-2xl flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Proposer des Plages</h1>
                <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2">
                   Sélectionnez vos créneaux dans la grille ci-dessous
                </p>
              </div>
              <div className="flex items-center gap-4">
                {selectedSlots.length > 0 && (
                  <span className="bg-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase">
                    {selectedSlots.length} créneau(x) choisi(s)
                  </span>
                )}
                <button 
                  onClick={submitDesiderata} 
                  className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase shadow-xl transition-all flex items-center gap-2 ${selectedSlots.length > 0 ? 'bg-white text-emerald-700 hover:scale-105' : 'bg-emerald-700 text-emerald-400 cursor-not-allowed opacity-50'}`}
                >
                  <Send size={16}/> {selectedSlots.length > 1 ? 'Ajouter ces vœux' : 'Ajouter ce vœu'}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                  <div className="grid grid-cols-6 gap-3">
                    {DAYS.map(d => (
                      <div key={d} className="space-y-3">
                        <p className="text-[8px] font-black text-center text-slate-300 uppercase">{d}</p>
                        {SLOTS.map(s => {
                          const isSelected = selectedSlots.find(item => item.day === d && item.slot === s);
                          const isAlreadySubmitted = vœux.find(v => v.teacher === currentUser.name && v.day === d && v.slot === s);
                          
                          return (
                            <button 
                              key={s} 
                              disabled={!!isAlreadySubmitted}
                              onClick={() => toggleSlotSelection(d, s)} 
                              className={`w-full h-16 rounded-2xl border-2 transition-all flex items-center justify-center relative
                                ${isAlreadySubmitted ? 'bg-emerald-50 border-emerald-100 cursor-default' : 
                                  isSelected ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 
                                  'bg-slate-50 border-slate-50 hover:border-emerald-200 hover:bg-white'}`}
                            >
                              {isAlreadySubmitted ? <CheckCircle size={14} className="text-emerald-300"/> : 
                               isSelected ? <Check size={18} strokeWidth={3}/> : null}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-fit">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase text-slate-400">Mes vœux transmis</h3>
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-black text-slate-500">
                    {vœux.filter(v => v.teacher === currentUser.name).length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {vœux.filter(v => v.teacher === currentUser.name).map(v => (
                    <div key={v.id} className="flex justify-between items-center p-5 bg-emerald-50 rounded-3xl border border-emerald-100 animate-in">
                      <div>
                        <p className="text-[11px] font-black text-emerald-900 uppercase">{v.day}</p>
                        <p className="text-[9px] font-bold text-emerald-400">{v.slot}</p>
                      </div>
                      <button onClick={() => setVœux(vœux.filter(x => x.id !== v.id))} className="p-2 text-rose-300 hover:text-rose-500 hover:bg-white rounded-xl transition-all">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                  {vœux.filter(v => v.teacher === currentUser.name).length === 0 && (
                    <p className="text-center py-10 text-[10px] font-bold text-slate-300 uppercase italic">Aucun vœu pour le moment</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'ADMIN' && (
          <div className="animate-in max-w-5xl mx-auto space-y-8">
            <div className="bg-amber-500 p-10 rounded-[45px] text-white shadow-2xl flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Arbitrage ({vœux.length})</h2>
              <ShieldCheck size={40} className="opacity-30"/>
            </div>
            <div className="grid gap-4">
              {vœux.map(v => (
                <div key={v.id} className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center font-black text-amber-600 text-xl">{v.teacher.split('. ')[1]?.[0] || 'T'}</div>
                    <div><h4 className="font-black text-slate-900 uppercase text-sm">{v.teacher}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.day} • {v.slot}</p></div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-4 bg-amber-50 text-amber-600 rounded-2xl font-black text-[9px] uppercase hover:bg-amber-500 hover:text-white transition-all">Décaler</button>
                    <button onClick={() => setVœux(vœux.filter(x => x.id !== v.id))} className="p-4 bg-rose-50 text-rose-500 rounded-2xl">Refuser</button>
                    <button onClick={() => adminValidateVœu(v.id)} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[9px] uppercase shadow-lg hover:bg-emerald-600 transition-all">Valider</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'STUDENT' && (
          <div className="animate-in">
             <div className="mb-12 flex justify-between items-end">
                <div>
                  <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">ICT4D L2</h1>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4">Emploi du temps officiel</p>
                </div>
                <div className="bg-indigo-50 px-6 py-3 rounded-2xl text-indigo-600 text-[10px] font-black uppercase">Session 2025</div>
             </div>
             <div className="bg-white rounded-[50px] shadow-2xl border border-slate-100 p-10 overflow-x-auto">
                <table className="w-full border-separate border-spacing-4">
                    <thead>
                        <tr>
                            <th></th>
                            {DAYS.map(day => <th key={day} className="text-[10px] font-black text-slate-300 uppercase pb-4 px-4">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {SLOTS.map(slot => (
                            <tr key={slot}>
                                <td className="text-[10px] font-black text-slate-400 pr-10 align-top pt-6 whitespace-nowrap border-r border-slate-50">{slot}</td>
                                {DAYS.map(day => {
                                    const entry = entries.find(e => e.day === day && e.slot === slot);
                                    return (
                                        <td key={day+slot} className="min-w-[220px]">
                                            {entry ? (
                                                <div className="bg-indigo-600 p-6 rounded-[35px] text-white shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer">
                                                    <p className="text-lg font-black uppercase leading-tight">{entry.ue}</p>
                                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-indigo-500/50">
                                                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-[10px] font-black">
                                                        {entry.teacher.split('. ')[1]?.[0]}
                                                      </div>
                                                      <p className="text-[9px] font-bold text-indigo-100 uppercase">{entry.teacher}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-32 rounded-[35px] border-2 border-dashed border-slate-50 bg-slate-50/20 flex items-center justify-center opacity-40 italic text-[9px] font-black uppercase text-slate-200">Disponible</div>
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

        {view === 'HISTORY' && (
          <div className="animate-in max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-10">Piste d'Audit</h2>
            {auditTrail.map(l => (
              <div key={l.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex justify-between items-center shadow-sm group">
                <div className="flex items-center gap-6">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${l.role === 'ADMIN' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {l.role === 'ADMIN' ? <ShieldCheck size={20}/> : <UserIcon size={20}/>}
                   </div>
                   <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{l.action} : {l.resource}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{l.user} • {l.time}</p>
                   </div>
                </div>
                <div className="text-[9px] font-mono text-indigo-400 bg-indigo-50 px-4 py-2 rounded-2xl font-bold max-w-xs truncate">
                  {l.newVal}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
