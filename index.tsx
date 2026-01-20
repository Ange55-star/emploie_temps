
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, ShieldCheck, MapPin, Clock, Users, AlertCircle, 
  CheckCircle, BookOpen, User as UserIcon, GraduationCap, 
  History, Settings, PlusCircle, Check, X, School
} from 'lucide-react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const SLOTS = ['08h00 - 11h00', '11h30 - 14h30', '15h00 - 18h00'];

const TEACHERS = [
  { id: 1, name: 'Dr. EBANDA', specialty: 'Génie Logiciel' },
  { id: 2, name: 'Pr. NDONGO', specialty: 'Réseaux' },
  { id: 3, name: 'Mme. SIMO', specialty: 'Base de données' }
];

const App = () => {
  const [role, setRole] = useState<'TEACHER' | 'ADMIN'>('TEACHER');
  const [activeTab, setActiveTab] = useState<'WISHES' | 'PLAN' | 'ARBITRAGE' | 'AUDIT' | 'CONFIG' | 'SCHEDULE'>('WISHES');
  
  // Configuration Admin
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Amphi 200', capacity: 200 },
    { id: 2, name: 'Salle 105', capacity: 40 },
    { id: 3, name: 'Labo Réseaux', capacity: 25 },
  ]);
  const [classes, setClasses] = useState([
    { id: 1, name: 'Licence 2 ICT4D', studentCount: 180, semester: 1, year: '2024-2025' },
    { id: 2, name: 'Master 1 GL', studentCount: 35, semester: 1, year: '2024-2025' },
  ]);

  // État opérationnel
  const [selectedTeacherId, setSelectedTeacherId] = useState(1);
  const [proposals, setProposals] = useState<any[]>([]);
  const [finalSchedule, setFinalSchedule] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Formulaire avec Date
  const [form, setForm] = useState({ 
    classId: '', roomId: '', ueCode: '', ueName: '', day: '', slot: '', date: '' 
  });

  const currentTeacher = TEACHERS.find(t => t.id === selectedTeacherId);

  const logAction = (action: string, details: string, target: string) => {
    const newLog = {
      id: Date.now(),
      user: role === 'ADMIN' ? 'Admin Système' : currentTeacher?.name,
      target: target,
      action: action,
      details: details,
      time: new Date().toLocaleString('fr-FR'),
      role: role
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const selectedClass = classes.find(c => c.id === Number(form.classId));
  const selectedRoom = rooms.find(r => r.id === Number(form.roomId));
  const isCapacityInsufficient = selectedClass && selectedRoom && selectedRoom.capacity < selectedClass.studentCount;

  const handleAddProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCapacityInsufficient) return;

    const newProposal = {
      id: Date.now(),
      ...form,
      teacherId: selectedTeacherId,
      teacherName: currentTeacher?.name,
      className: selectedClass?.name,
      roomName: selectedRoom?.name,
      status: 'PENDING'
    };

    setProposals(prev => [...prev, newProposal]);
    // Fix: Corrected argument count for logAction by removing redundant 'TEACHER' parameter
    logAction('PROPOSITION SÉANCE', `${form.ueCode} - ${form.date}`, currentTeacher?.name || '');
    setForm({ classId: '', roomId: '', ueCode: '', ueName: '', day: '', slot: '', date: '' });
    setActiveTab('SCHEDULE');
    alert("Proposition envoyée pour arbitrage.");
  };

  const validateProposal = (id: number) => {
    const prop = proposals.find(p => p.id === id);
    if (prop) {
      setFinalSchedule(prev => [...prev, { ...prop, status: 'VALIDATED' }]);
      setProposals(prev => prev.filter(p => p.id !== id));
      logAction('VALIDATION ADMIN', `Séance ${prop.ueCode} confirmée`, prop.teacherName);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 font-['Plus_Jakarta_Sans']">
      {/* Switcher de rôle flottant */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#0f172a] p-1.5 rounded-2xl shadow-2xl flex gap-1 border border-white/10">
        <button onClick={() => {setRole('TEACHER'); setActiveTab('SCHEDULE')}} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${role === 'TEACHER' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          <UserIcon size={14}/> Enseignant
        </button>
        <button onClick={() => {setRole('ADMIN'); setActiveTab('CONFIG')}} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${role === 'ADMIN' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          <ShieldCheck size={14}/> Administrateur
        </button>
      </div>

      <nav className="bg-[#0f172a] text-white p-6 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <School className="text-indigo-400" size={24}/>
            <span className="text-xl font-black uppercase tracking-tighter">ICT <span className="text-indigo-400">Portal</span></span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('SCHEDULE')} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${activeTab === 'SCHEDULE' ? 'bg-white/10' : 'text-slate-400'}`}>Planning Final</button>
            {role === 'TEACHER' ? (
              <button onClick={() => setActiveTab('PLAN')} className="text-[10px] font-black uppercase px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-all">Ajouter séance</button>
            ) : (
              <>
                <button onClick={() => setActiveTab('CONFIG')} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${activeTab === 'CONFIG' ? 'bg-white/10' : 'text-slate-400'}`}>Configuration</button>
                <button onClick={() => setActiveTab('ARBITRAGE')} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${activeTab === 'ARBITRAGE' ? 'bg-white/10' : 'text-slate-400'}`}>Arbitrage</button>
              </>
            )}
            <button onClick={() => setActiveTab('AUDIT')} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${activeTab === 'AUDIT' ? 'bg-white/10' : 'text-slate-400'}`}>Audit</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        
        {/* EMPLOI DU TEMPS FINAL (CADRANS À 5 INFORMATIONS) */}
        {activeTab === 'SCHEDULE' && (
          <div className="animate-in space-y-12">
            <header className="text-center space-y-4">
               <h1 className="text-5xl font-black uppercase tracking-tighter">Emploi du Temps Final</h1>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Affichage consolidé des sessions d'enseignement</p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {finalSchedule.map(session => (
                 <div key={session.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-100 hover:border-indigo-400 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                    {/* 1. Date de passage (Badge haut gauche) */}
                    <div className="absolute top-0 left-0 bg-indigo-600 text-white px-6 py-2 rounded-br-3xl shadow-lg z-10">
                       <p className="text-[10px] font-black uppercase tracking-widest">{new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    {/* 2. Plage horaire (Haut droite) */}
                    <div className="flex justify-end items-start pt-2">
                       <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full flex items-center gap-2">
                          <Clock size={12}/>
                          <span className="text-[10px] font-black uppercase">{session.slot}</span>
                       </div>
                    </div>

                    {/* 3. Code & Nom UE (Centre) */}
                    <div className="my-8">
                       <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter mb-2 inline-block">
                          {session.ueCode}
                       </span>
                       <h3 className="text-2xl font-black text-slate-900 uppercase leading-tight tracking-tighter">
                          {session.ueName}
                       </h3>
                       <div className="mt-3 flex items-center gap-2 text-indigo-500">
                          <GraduationCap size={14}/>
                          <span className="text-[10px] font-bold uppercase">{session.className}</span>
                       </div>
                    </div>

                    {/* Footer : Enseignant & Salle */}
                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center mt-auto">
                       {/* 4. Nom de l'enseignant */}
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs">
                             {session.teacherName[0]}
                          </div>
                          <div>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enseignant</p>
                             <p className="text-[11px] font-black text-slate-700 uppercase">{session.teacherName}</p>
                          </div>
                       </div>
                       
                       {/* 5. Salle */}
                       <div className="text-right">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Localisation</p>
                          <div className="flex items-center justify-end gap-1.5 text-emerald-600">
                             <MapPin size={12}/>
                             <p className="text-xs font-black uppercase">{session.roomName}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
               {finalSchedule.length === 0 && (
                 <div className="col-span-full py-40 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100 text-slate-200 uppercase font-black text-xs tracking-[0.2em]">
                   Aucune séance validée pour le moment
                 </div>
               )}
            </div>
          </div>
        )}

        {/* FORMULAIRE D'AJOUT (ENSEIGNANT) */}
        {role === 'TEACHER' && activeTab === 'PLAN' && (
          <div className="max-w-4xl mx-auto animate-in space-y-8">
             <header className="bg-emerald-600 p-12 rounded-[50px] text-white shadow-2xl">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Planifier un Cours</h1>
                <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Saisie des vœux de séance</p>
             </header>

             <form onSubmit={handleAddProposal} className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-100 grid md:grid-cols-2 gap-8">
                {/* Information de capacité en temps réel */}
                <div className="md:col-span-2 flex gap-4">
                   <div className="flex-1 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Effectif Classe</p>
                      <p className="text-xl font-black text-slate-700">{selectedClass?.studentCount || '--'} <span className="text-xs">Étud.</span></p>
                   </div>
                   <div className={`flex-1 p-4 rounded-3xl border ${isCapacityInsufficient ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <p className={`text-[8px] font-black uppercase ${isCapacityInsufficient ? 'text-rose-400' : 'text-emerald-400'}`}>Capacité Salle</p>
                      <p className={`text-xl font-black ${isCapacityInsufficient ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedRoom?.capacity || '--'} <span className="text-xs">Places</span></p>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Date de passage</label>
                   <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Plage Horaire</label>
                   <select required value={form.slot} onChange={e => setForm({...form, slot: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500">
                      <option value="">Choisir...</option>
                      {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Classe</label>
                   <select required value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500">
                      <option value="">Sélectionner une classe...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Salle</label>
                   <select required value={form.roomId} onChange={e => setForm({...form, roomId: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500">
                      <option value="">Sélectionner une salle...</option>
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Code UE</label>
                   <input required placeholder="Ex: ICT 203" value={form.ueCode} onChange={e => setForm({...form, ueCode: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500" />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Nom UE</label>
                   <input required placeholder="Ex: Génie Logiciel" value={form.ueName} onChange={e => setForm({...form, ueName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500" />
                </div>

                <button type="submit" disabled={isCapacityInsufficient || !form.classId || !form.roomId} className={`md:col-span-2 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all ${isCapacityInsufficient ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0f172a] text-white hover:bg-emerald-600 active:scale-95'}`}>
                   {isCapacityInsufficient ? 'Capacité Insuffisante' : 'Soumettre la proposition'}
                </button>
             </form>
          </div>
        )}

        {/* CONFIGURATION (ADMIN) */}
        {role === 'ADMIN' && activeTab === 'CONFIG' && (
           <div className="max-w-5xl mx-auto space-y-12 animate-in">
              <header className="bg-amber-600 p-10 rounded-[40px] text-white flex justify-between items-center shadow-xl">
                 <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Paramétrage Système</h1>
                    <p className="text-amber-100 font-bold text-[10px] uppercase tracking-widest">Salles, Classes et Effectifs</p>
                 </div>
                 <Settings size={40} className="opacity-20"/>
              </header>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[40px] border border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2 text-amber-600"><MapPin size={18}/> Salles Pré-définies</h3>
                    <div className="space-y-2">
                       {rooms.map(r => (
                         <div key={r.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center font-bold">
                            <span>{r.name}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{r.capacity} places</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-white p-8 rounded-[40px] border border-slate-100">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2 text-indigo-600"><Users size={18}/> Classes & Effectifs</h3>
                    <div className="space-y-2">
                       {classes.map(c => (
                         <div key={c.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center font-bold">
                            <span>{c.name}</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{c.studentCount} étud.</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* ARBITRAGE (ADMIN) */}
        {role === 'ADMIN' && activeTab === 'ARBITRAGE' && (
           <div className="max-w-4xl mx-auto space-y-6 animate-in">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Arbitrage des séances</h2>
              {proposals.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-amber-400 transition-all">
                   <div className="flex gap-6 items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center font-black text-slate-400 text-xl">{p.teacherName[0]}</div>
                      <div>
                         <h4 className="font-black text-slate-900 uppercase text-lg">{p.ueName} <span className="text-indigo-500 text-xs ml-2">[{p.ueCode}]</span></h4>
                         <div className="flex gap-4 mt-2">
                            <span className="text-[10px] font-black uppercase bg-indigo-50 px-3 py-1 rounded-full text-indigo-600">{p.className}</span>
                            <span className="text-[10px] font-black uppercase bg-amber-50 px-3 py-1 rounded-full text-amber-600">{p.roomName}</span>
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Par : {p.teacherName}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      {/* Fix: Changed parameter name from 'p' to 'prev' in setProposals to avoid shadowing and fix 'Property id does not exist on type any[]' error */}
                      <button onClick={() => setProposals(prev => prev.filter(x => x.id !== p.id))} className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={20}/></button>
                      <button onClick={() => validateProposal(p.id)} className="px-8 h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2">
                         <Check size={16}/> Valider
                      </button>
                   </div>
                </div>
              ))}
              {proposals.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase text-xs">Aucune proposition en attente</p>}
           </div>
        )}

        {/* AUDIT */}
        {activeTab === 'AUDIT' && (
           <div className="max-w-4xl mx-auto space-y-4 animate-in">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10">Journal d'Audit</h2>
              {auditLogs.map(log => (
                <div key={log.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${log.role === 'ADMIN' ? 'bg-amber-500' : 'bg-indigo-600'}`}>{log.user[0]}</div>
                      <div>
                         <p className="text-[11px] font-black uppercase text-slate-900">{log.user}</p>
                         <p className="text-sm font-bold text-slate-500 mt-1">{log.action} : <span className="text-indigo-600 font-black">{log.details}</span></p>
                      </div>
                   </div>
                   <p className="text-[10px] font-black text-slate-300 uppercase">{log.time}</p>
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
