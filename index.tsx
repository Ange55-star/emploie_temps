
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, User, ShieldCheck, Users, BookOpen, Clock, 
  Plus, Trash2, CheckCircle, X, ChevronRight, LogOut, Bell
} from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const SLOTS = ['08h00 - 11h00', '11h30 - 14h30', '15h00 - 18h00'];

const App = () => {
  const [view, setView] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [selectedSlots, setSelectedSlots] = useState<{day: string, slot: string}[]>([]);
  const [entries, setEntries] = useState<any[]>([
    { id: 1, day: 'Lundi', slot: '08h00 - 11h00', ue: 'ICT207', teacher: 'Dr. MONTHE', room: 'S003' }
  ]);
  const [vœux, setVœux] = useState<any[]>([
    { id: 101, teacher: 'M. NKONDOCK', day: 'Mardi', slot: '11h30 - 14h30' }
  ]);

  const toggleSlot = (day: string, slot: string) => {
    const exists = selectedSlots.find(s => s.day === day && s.slot === slot);
    if (exists) {
      setSelectedSlots(selectedSlots.filter(s => !(s.day === day && s.slot === slot)));
    } else {
      setSelectedSlots([...selectedSlots, { day, slot }]);
    }
  };

  const validateVœu = (v: any) => {
    const newEntry = {
      id: Date.now(),
      day: v.day,
      slot: v.slot,
      ue: 'ICT203',
      teacher: v.teacher,
      room: 'S008'
    };
    setEntries([...entries, newEntry]);
    setVœux(vœux.filter(x => x.id !== v.id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* BARRE D'OUTILS (NAVIGATION INTERACTIVE) */}
      <nav className="bg-[#0f172a] text-white p-6 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-sm">ICT</div>
            <span className="text-xl font-black tracking-tighter uppercase">Portal <span className="text-indigo-500">Django</span></span>
          </div>
          <div className="flex gap-4 md:gap-8 items-center">
            <button 
              onClick={() => setView('STUDENT')} 
              className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 border-b-2 ${view === 'STUDENT' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
              Emploi du Temps
            </button>
            <button 
              onClick={() => setView('TEACHER')} 
              className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 border-b-2 ${view === 'TEACHER' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
              Espace Enseignant
            </button>
            <button 
              onClick={() => setView('ADMIN')} 
              className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 border-b-2 ${view === 'ADMIN' ? 'border-amber-500 text-white' : 'border-transparent text-slate-500 hover:text-white'}`}
            >
              Arbitrage Admin {vœux.length > 0 && <span className="ml-2 bg-rose-500 px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">{vœux.length}</span>}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 md:p-12">
        
        {/* VUE ÉTUDIANT (TIMETABLE) */}
        {view === 'STUDENT' && (
          <div className="animate-in">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">ICT4D - Licence 2</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Planning Officiel • Semestre 1</p>
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
                              <div className="bg-[#1e293b] p-6 rounded-[32px] text-white shadow-xl">
                                <p className="text-xl font-black text-indigo-400 leading-none mb-1">{entry.ue}</p>
                                <p className="text-[9px] font-bold text-white/40 mb-4 uppercase">{entry.teacher}</p>
                                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                  <span className="text-[10px] font-black text-indigo-200">{entry.room}</span>
                                  <span className="text-[8px] font-black text-white/20 uppercase">G1</span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-32 border-2 border-dashed border-slate-50 rounded-[32px] flex items-center justify-center opacity-40">
                                <Clock size={16} className="text-slate-200" />
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

        {/* VUE ENSEIGNANT */}
        {view === 'TEACHER' && (
          <div className="animate-in space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-end bg-emerald-600 p-10 rounded-[40px] text-white shadow-2xl">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Mes Disponibilités</h2>
                <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-widest mt-1">Sélectionnez vos créneaux préférés</p>
              </div>
              <button 
                onClick={() => {
                  if(selectedSlots.length > 0) {
                    setVœux([...vœux, ...selectedSlots.map(s => ({ id: Date.now() + Math.random(), teacher: 'M. NKONDOCK', ...s }))]);
                    setSelectedSlots([]);
                    alert("Vœux transmis à l'administration !");
                  }
                }}
                className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-emerald-50 transition-all"
              >
                Envoyer mes vœux ({selectedSlots.length})
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
              <table className="w-full border-separate border-spacing-2">
                <thead>
                  <tr>
                    <th></th>
                    {DAYS.map(day => <th key={day} className="text-[9px] font-black text-slate-300 uppercase py-2">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map(slot => (
                    <tr key={slot}>
                      <td className="text-[8px] font-black text-slate-400 pr-4">{slot}</td>
                      {DAYS.map(day => {
                        const isSelected = selectedSlots.find(s => s.day === day && s.slot === slot);
                        const isBooked = entries.find(e => e.day === day && e.slot === slot && e.teacher === 'M. NKONDOCK');
                        return (
                          <td key={day+slot}>
                            <button 
                              disabled={!!isBooked}
                              onClick={() => toggleSlot(day, slot)}
                              className={`h-16 w-full rounded-2xl border-2 transition-all flex items-center justify-center ${isBooked ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : isSelected ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-95' : 'bg-slate-50 border-slate-50 hover:border-emerald-200'}`}
                            >
                              {isBooked ? <CheckCircle size={18} /> : isSelected ? <CheckCircle size={18} /> : <Plus size={16} className="opacity-10" />}
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
        )}

        {/* VUE ADMIN */}
        {view === 'ADMIN' && (
          <div className="animate-in space-y-8 max-w-4xl mx-auto">
             <div className="bg-amber-500 p-10 rounded-[40px] text-white shadow-2xl flex items-center gap-8">
               <div className="w-20 h-20 bg-white/20 rounded-[30px] flex items-center justify-center"><ShieldCheck size={40} /></div>
               <div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter">Arbitrage des Vœux</h2>
                 <p className="text-amber-100 font-bold text-[10px] uppercase tracking-widest">Validez ou refusez les demandes des enseignants</p>
               </div>
             </div>

             <div className="space-y-4">
               {vœux.length === 0 ? (
                 <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-slate-100 text-center opacity-40">
                   <p className="text-sm font-black uppercase text-slate-300">Aucun vœu en attente</p>
                 </div>
               ) : vœux.map(v => (
                 <div key={v.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-amber-200 transition-all">
                   <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black">{v.teacher[0]}</div>
                     <div>
                       <h4 className="font-black text-slate-900 uppercase text-sm">{v.teacher}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.day} • {v.slot}</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => setVœux(vœux.filter(x => x.id !== v.id))} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><X size={18}/></button>
                     <button onClick={() => validateVœu(v)} className="px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2">Valider <CheckCircle size={14}/></button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

      </main>
      
      {/* Django Footer */}
      <footer className="container mx-auto p-12 mt-12 border-t border-slate-200 flex justify-between items-center text-slate-400">
        <p className="text-[9px] font-black uppercase tracking-[0.2em]">Powered by Django & PostgreSQL • 2025</p>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          Backend Python Opérationnel
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
