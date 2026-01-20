
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, ShieldCheck, MapPin, Clock, Users, AlertCircle, 
  CheckCircle, BookOpen, User as UserIcon, GraduationCap, 
  History, ShieldAlert, Trash2, Edit3, UserCheck, Search,
  Settings, PlusCircle, Check, X, Layout, School, Layers
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
  const [activeTab, setActiveTab] = useState<'WISHES' | 'PLAN' | 'ARBITRAGE' | 'AUDIT' | 'CONFIG'>('WISHES');
  
  // Dynamic Configuration State (Admin Managed)
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Amphi 200', capacity: 200 },
    { id: 2, name: 'Salle 105', capacity: 40 },
  ]);
  const [classes, setClasses] = useState([
    { id: 1, name: 'Licence 2 ICT4D', studentCount: 180, semester: 1, year: '2024-2025' },
    { id: 2, name: 'Master 1 GL', studentCount: 35, semester: 1, year: '2024-2025' },
  ]);

  // Operational State
  const [selectedTeacherId, setSelectedTeacherId] = useState(1);
  const [availabilityData, setAvailabilityData] = useState<Record<string, string[]>>({ '1': [], '2': [], '3': [] });
  const [proposals, setProposals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Form State
  const [form, setForm] = useState({ classId: '', roomId: '', ueCode: '', ueName: '', day: '', slot: '' });

  const currentTeacherName = TEACHERS.find(t => t.id === selectedTeacherId)?.name || 'Inconnu';

  const logAction = (action: string, details: string, target: string, userRole: string) => {
    const newLog = {
      id: Date.now(),
      user: role === 'ADMIN' ? 'Admin Système' : currentTeacherName,
      target: target,
      action: action,
      details: details,
      time: new Date().toLocaleString('fr-FR'),
      role: userRole
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Validation Logic
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
      teacherName: currentTeacherName,
      className: selectedClass?.name,
      roomName: selectedRoom?.name,
      status: 'PENDING'
    };

    setProposals(prev => [...prev, newProposal]);
    logAction('PROPOSITION SÉANCE', `${form.ueCode} (${form.day})`, currentTeacherName, 'TEACHER');
    setForm({ classId: '', roomId: '', ueCode: '', ueName: '', day: '', slot: '' });
    setActiveTab('WISHES');
    alert("Proposition enregistrée. En attente d'arbitrage admin.");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] text-slate-900 pb-24">
      {/* Switcher de rôle */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#0f172a] p-1.5 rounded-2xl shadow-2xl flex gap-1 border border-white/10">
        <button onClick={() => {setRole('TEACHER'); setActiveTab('WISHES')}} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${role === 'TEACHER' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
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
          <div className="flex gap-4">
            {role === 'TEACHER' ? (
              <>
                <button onClick={() => setActiveTab('WISHES')} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${activeTab === 'WISHES' ? 'bg-white/10' : 'text-slate-400'}`}>Mes Vœux</button>
                <button onClick={() => setActiveTab('PLAN')} className="text-[10px] font-black uppercase px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2 transition-all">
                  <PlusCircle size={14}/> Ajouter une séance
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('CONFIG')} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${activeTab === 'CONFIG' ? 'bg-white/10' : 'text-slate-400'}`}>Configuration</button>
                <button onClick={() => setActiveTab('ARBITRAGE')} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${activeTab === 'ARBITRAGE' ? 'bg-white/10' : 'text-slate-400'}`}>Arbitrage</button>
              </>
            )}
            <button onClick={() => setActiveTab('AUDIT')} className={`text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all ${activeTab === 'AUDIT' ? 'bg-white/10' : 'text-slate-400'}`}>Audit Log</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8 lg:p-12">
        
        {/* CONFIGURATION ADMIN (Salles et Classes) */}
        {role === 'ADMIN' && activeTab === 'CONFIG' && (
          <div className="max-w-5xl mx-auto space-y-12 animate-in">
             <header className="bg-amber-600 p-10 rounded-[40px] text-white shadow-xl flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tighter">Paramétrage Initial</h1>
                  <p className="text-amber-100 font-bold text-[10px] uppercase tracking-widest mt-2">Gestion des Salles et des Classes</p>
                </div>
                <Settings size={40} className="opacity-20"/>
             </header>

             <div className="grid md:grid-cols-2 gap-10">
                {/* Gestion des Salles */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                   <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2"><MapPin size={20} className="text-amber-500"/> Salles</h3>
                   <div className="space-y-3 mb-6">
                      {rooms.map(r => (
                        <div key={r.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <span className="font-bold text-slate-700">{r.name}</span>
                           <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black">{r.capacity} Places</span>
                        </div>
                      ))}
                   </div>
                   <button onClick={() => {
                      const name = prompt("Nom de la salle ?");
                      const cap = Number(prompt("Capacité ?"));
                      if(name && cap) {
                        setRooms([...rooms, { id: Date.now(), name, capacity: cap }]);
                        logAction('CRÉATION SALLE', `${name} (${cap} places)`, 'Système', 'ADMIN');
                      }
                   }} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all">
                      Ajouter une salle
                   </button>
                </div>

                {/* Gestion des Classes */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                   <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2"><Users size={20} className="text-indigo-500"/> Classes</h3>
                   <div className="space-y-3 mb-6">
                      {classes.map(c => (
                        <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex justify-between">
                              <span className="font-bold text-slate-700">{c.name}</span>
                              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black">{c.studentCount} Étud.</span>
                           </div>
                           <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">S{c.semester} • {c.year}</p>
                        </div>
                      ))}
                   </div>
                   <button onClick={() => {
                      const name = prompt("Nom de la classe ?");
                      const count = Number(prompt("Effectif ?"));
                      if(name && count) {
                        setClasses([...classes, { id: Date.now(), name, studentCount: count, semester: 1, year: '2024-2025' }]);
                        logAction('CRÉATION CLASSE', `${name} (${count} étudiants)`, 'Système', 'ADMIN');
                      }
                   }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all">
                      Ajouter une classe
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* PLANIFIER (ENSEIGNANT) */}
        {role === 'TEACHER' && activeTab === 'PLAN' && (
          <div className="max-w-4xl mx-auto animate-in space-y-8">
            <header className="bg-emerald-600 p-12 rounded-[50px] text-white shadow-2xl relative">
               <h1 className="text-4xl font-black uppercase tracking-tighter">Proposer une Séance</h1>
               <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Validation automatique de la capacité des salles</p>
            </header>

            <form onSubmit={handleAddProposal} className="bg-white p-12 rounded-[50px] shadow-sm border border-slate-100 grid md:grid-cols-2 gap-8 relative">
               
               {/* Affichage des indicateurs de capacité en temps réel */}
               {(selectedClass || selectedRoom) && (
                 <div className="md:col-span-2 flex gap-4 animate-in">
                    {selectedClass && (
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex-1">
                        <p className="text-[8px] font-black text-indigo-400 uppercase">Effectif Classe</p>
                        <p className="text-xl font-black text-indigo-600">{selectedClass.studentCount} <span className="text-xs">étudiants</span></p>
                      </div>
                    )}
                    {selectedRoom && (
                      <div className={`${isCapacityInsufficient ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'} p-4 rounded-3xl flex-1 transition-colors`}>
                        <p className={`text-[8px] font-black uppercase ${isCapacityInsufficient ? 'text-rose-400' : 'text-emerald-400'}`}>Capacité Salle</p>
                        <p className={`text-xl font-black ${isCapacityInsufficient ? 'text-rose-600' : 'text-emerald-600'}`}>{selectedRoom.capacity} <span className="text-xs">places</span></p>
                      </div>
                    )}
                 </div>
               )}

               {isCapacityInsufficient && (
                 <div className="md:col-span-2 bg-rose-500 text-white p-4 rounded-2xl flex items-center gap-3 animate-bounce">
                    <AlertCircle size={20}/>
                    <span className="text-xs font-black uppercase tracking-tight">Capacité insuffisante ! Sélectionnez une salle plus grande.</span>
                 </div>
               )}

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Classe concernée</label>
                  <select required value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500">
                     <option value="">Sélectionner une classe...</option>
                     {classes.map(c => <option key={c.id} value={c.id}>{c.name} (S{c.semester})</option>)}
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Salle disponible</label>
                  <select required value={form.roomId} onChange={e => setForm({...form, roomId: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500">
                     <option value="">Sélectionner une salle...</option>
                     {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} places)</option>)}
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Code UE</label>
                  <input required placeholder="Ex: ICT 203" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500" value={form.ueCode} onChange={e => setForm({...form, ueCode: e.target.value})} />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Horaire</label>
                  <select required value={form.slot} onChange={e => setForm({...form, slot: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500">
                     <option value="">Choisir un créneau...</option>
                     {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>

               <button 
                  type="submit" 
                  disabled={isCapacityInsufficient || !form.classId || !form.roomId}
                  className={`md:col-span-2 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 mt-4 ${isCapacityInsufficient ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#0f172a] text-white hover:bg-emerald-600 active:scale-95'}`}
               >
                  {isCapacityInsufficient ? 'Affectation Impossible' : 'Confirmer la Proposition'}
               </button>
            </form>
          </div>
        )}

        {/* AUDIT LOG (PARTAGE) */}
        {activeTab === 'AUDIT' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in">
             <h2 className="text-4xl font-black uppercase tracking-tighter mb-10 flex items-center gap-4"><History className="text-indigo-600"/> Historique d'Audit</h2>
             <div className="space-y-3">
                {auditLogs.map(log => (
                  <div key={log.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${log.role === 'ADMIN' ? 'bg-amber-500' : 'bg-indigo-600'}`}>{log.user[0]}</div>
                        <div>
                           <p className="text-[11px] font-black uppercase text-slate-900">{log.user} <span className={`text-[8px] px-2 py-0.5 rounded-full ml-2 ${log.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{log.role}</span></p>
                           <p className="text-sm font-bold text-slate-500 mt-1">{log.action} : <span className="text-indigo-600 font-black">{log.details}</span></p>
                        </div>
                     </div>
                     <p className="text-[10px] font-black text-slate-300 uppercase">{log.time}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* ARBITRAGE ADMIN (SÉANCES) */}
        {role === 'ADMIN' && activeTab === 'ARBITRAGE' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in">
             <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Arbitrage des Propositions</h2>
             {proposals.map(p => (
               <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex justify-between items-center hover:border-amber-400 transition-all">
                  <div className="flex gap-6 items-center">
                     <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center font-black text-slate-400 text-xl">{p.teacherName[4]}</div>
                     <div>
                        <h4 className="font-black text-slate-900 uppercase text-lg">{p.ueCode}</h4>
                        <div className="flex gap-4 mt-2">
                           <span className="text-[10px] font-black uppercase bg-indigo-50 px-3 py-1 rounded-full text-indigo-600">{p.className}</span>
                           <span className="text-[10px] font-black uppercase bg-amber-50 px-3 py-1 rounded-full text-amber-600">{p.roomName}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Par : {p.teacherName}</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <button onClick={() => {
                       setProposals(prev => prev.filter(x => x.id !== p.id));
                       logAction('REFUS SÉANCE', p.ueCode, p.teacherName, 'ADMIN');
                     }} className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={20}/></button>
                     <button onClick={() => {
                        setProposals(prev => prev.filter(x => x.id !== p.id));
                        logAction('VALIDATION SÉANCE', p.ueCode, p.teacherName, 'ADMIN');
                        alert("Séance validée et ajoutée au planning final !");
                     }} className="px-8 h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2">
                        <Check size={16}/> Valider
                     </button>
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
