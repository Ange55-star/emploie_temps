
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, ShieldCheck, MapPin, Clock, Users, AlertCircle, 
  CheckCircle, BookOpen, User as UserIcon, GraduationCap, 
  Settings, Check, X, School, ArrowRight, Bell, Zap
} from 'lucide-react';

const SLOTS = ['08h00 - 11h00', '11h30 - 14h30', '15h00 - 18h00'];

const TEACHERS = [
  { id: 1, name: 'Dr. EBANDA', specialty: 'Génie Logiciel' },
  { id: 2, name: 'Pr. NDONGO', specialty: 'Réseaux' },
  { id: 3, name: 'Mme. SIMO', specialty: 'Base de données' }
];

const App = () => {
  const [role, setRole] = useState<'TEACHER' | 'ADMIN'>('TEACHER');
  const [activeTab, setActiveTab] = useState<'PLAN' | 'ARBITRAGE' | 'AUDIT' | 'CONFIG' | 'SCHEDULE'>('SCHEDULE');
  
  // Salles
  const [rooms] = useState([
    { id: 1, name: 'Amphi 200', capacity: 200 },
    { id: 2, name: 'Salle 105', capacity: 40 },
    { id: 3, name: 'Labo Réseaux', capacity: 25 },
  ]);

  // Classes avec objectifs de séances (Quotas)
  const [classes] = useState([
    { id: 1, name: 'Licence 2 ICT4D', studentCount: 180, targetSessions: 3 }, 
    { id: 2, name: 'Master 1 GL', studentCount: 35, targetSessions: 2 },
  ]);

  const [selectedTeacherId] = useState(1);
  const [proposals, setProposals] = useState<any[]>([]);
  const [finalSchedule, setFinalSchedule] = useState<any[]>([
    {
      id: 101,
      ueCode: 'ICT 203',
      ueName: 'Génie Logiciel',
      teacherName: 'Dr. EBANDA',
      roomName: 'Amphi 200',
      date: '2025-05-12',
      slot: '08h00 - 11h00',
      className: 'Licence 2 ICT4D'
    }
  ]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const [form, setForm] = useState({ 
    classId: '', roomId: '', ueCode: '', ueName: '', day: '', slot: '', date: '' 
  });

  const currentTeacher = TEACHERS.find(t => t.id === selectedTeacherId);

  // --- LOGIQUE DE SURVEILLANCE DES QUOTAS ---
  const classProgress = useMemo(() => {
    return classes.map(c => {
      const count = finalSchedule.filter(s => s.className === c.name).length;
      return { ...c, currentCount: count, isFinalized: count >= c.targetSessions };
    });
  }, [finalSchedule, classes]);

  // Notification automatique à l'administrateur
  useEffect(() => {
    classProgress.forEach(cp => {
      if (cp.isFinalized && !auditLogs.some(log => log.details.includes(`FINALISATION ${cp.name}`))) {
        const msg = `L'emploi du temps de la classe ${cp.name} est désormais COMPLET (${cp.currentCount}/${cp.targetSessions}).`;
        if (role === 'ADMIN') {
           setNotifications(prev => [...new Set([...prev, msg])]);
        }
        logAction('SYSTÈME', `FINALISATION ${cp.name}`, 'Automatique');
      }
    });
  }, [classProgress, role]);

  const logAction = (action: string, details: string, target: string) => {
    const newLog = {
      id: Date.now(),
      user: action === 'SYSTÈME' ? '🤖 Moteur de Quota' : (role === 'ADMIN' ? 'Admin Système' : currentTeacher?.name),
      target: target,
      action: action,
      details: details,
      time: new Date().toLocaleTimeString('fr-FR'),
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
    logAction('PROPOSITION SÉANCE', `${form.ueCode} - ${form.date}`, currentTeacher?.name || '');
    setForm({ classId: '', roomId: '', ueCode: '', ueName: '', day: '', slot: '', date: '' });
    setActiveTab('SCHEDULE');
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
      
      {/* TOAST NOTIFICATION ADMIN */}
      {role === 'ADMIN' && notifications.length > 0 && (
        <div className="fixed top-24 right-8 z-[110] space-y-3 pointer-events-none">
          {notifications.map((n, i) => (
            <div key={i} className="bg-[#0f172a] text-white p-5 rounded-3xl shadow-2xl border border-indigo-500/30 flex items-start gap-4 animate-in max-w-sm pointer-events-auto">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Alerte Système</p>
                <p className="text-xs font-bold leading-relaxed">{n}</p>
                <button onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))} className="mt-2 text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors">Ignorer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Switcher */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl flex gap-1 border border-white/10">
        <button onClick={() => {setRole('TEACHER'); setActiveTab('SCHEDULE')}} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${role === 'TEACHER' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          <UserIcon size={14}/> Enseignant
        </button>
        <button onClick={() => {setRole('ADMIN'); setActiveTab('ARBITRAGE')}} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${role === 'ADMIN' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          <ShieldCheck size={14}/> Administrateur
        </button>
      </div>

      <nav className="bg-[#0f172a] text-white p-6 sticky top-0 z-50 shadow-xl border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <School className="text-white" size={20}/>
            </div>
            <span className="text-xl font-black uppercase tracking-tighter italic">ICT <span className="text-indigo-400">Portal</span></span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setActiveTab('SCHEDULE')} className={`text-[9px] font-black uppercase px-4 py-2.5 rounded-xl transition-all ${activeTab === 'SCHEDULE' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>Planning Final</button>
            {role === 'TEACHER' ? (
              <button onClick={() => setActiveTab('PLAN')} className="text-[9px] font-black uppercase px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20">Ajouter séance</button>
            ) : (
              <>
                <button onClick={() => setActiveTab('ARBITRAGE')} className={`text-[9px] font-black uppercase px-4 py-2.5 rounded-xl transition-all ${activeTab === 'ARBITRAGE' ? 'bg-white/10 text-white' : 'text-slate-400'}`}>Arbitrage</button>
                <button onClick={() => setActiveTab('CONFIG')} className={`text-[9px] font-black uppercase px-4 py-2.5 rounded-xl transition-all ${activeTab === 'CONFIG' ? 'bg-white/10 text-slate-400' : 'text-slate-400'}`}>Configuration</button>
              </>
            )}
            <button onClick={() => setActiveTab('AUDIT')} className={`text-[9px] font-black uppercase px-4 py-2.5 rounded-xl transition-all ${activeTab === 'AUDIT' ? 'bg-white/10 text-slate-400' : 'text-slate-400'}`}>Audit</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8 lg:p-12">
        
        {/* EMPLOI DU TEMPS FINAL (CADRANS À 5 INFOS) */}
        {activeTab === 'SCHEDULE' && (
          <div className="animate-in space-y-12 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
               <div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">Emploi du Temps</h1>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                    <span className="w-10 h-1 bg-indigo-500 rounded-full"></span> 
                    Séances consolidées et validées
                  </p>
               </div>
               <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <Calendar className="text-indigo-500" size={18}/>
                  <span className="text-[10px] font-black text-slate-700 uppercase">Semestre 1 • 2024-2025</span>
               </div>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {finalSchedule.map(session => (
                 <div key={session.id} className="bg-white rounded-[40px] shadow-2xl border border-slate-100 hover:border-indigo-400 transition-all group overflow-hidden flex flex-col min-h-[300px] hover:-translate-y-1">
                    <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center">
                       <div className="flex items-center gap-2.5">
                          <Calendar size={14} className="text-indigo-300"/>
                          <span className="text-[10px] font-black uppercase tracking-widest">{new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                       </div>
                       <div className="flex items-center gap-2 text-indigo-300">
                          <Clock size={14}/>
                          <span className="text-[10px] font-black">{session.slot}</span>
                       </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-between">
                       <div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-tighter">{session.ueCode}</span>
                             <div className="h-px flex-1 bg-slate-100"></div>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase leading-tight tracking-tighter">{session.ueName}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5"><GraduationCap size={12}/> {session.className}</p>
                       </div>
                       <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs border border-slate-200">{session.teacherName[0]}</div>
                             <div>
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Enseignant</p>
                                <p className="text-[11px] font-black text-slate-700 uppercase">{session.teacherName}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Salle</p>
                             <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                <MapPin size={12}/>
                                <span className="text-[11px] font-black uppercase">{session.roomName}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* ARBITRAGE (AVEC MONITORING DE COMPLÉTION) */}
        {role === 'ADMIN' && activeTab === 'ARBITRAGE' && (
           <div className="max-w-4xl mx-auto space-y-12 animate-in">
              <header className="space-y-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Arbitrage & Monitoring</h2>
                <div className="grid grid-cols-2 gap-6">
                  {classProgress.map(cp => (
                    <div key={cp.id} className={`p-6 rounded-[35px] border ${cp.isFinalized ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'} shadow-sm transition-all`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cp.isFinalized ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                             {cp.isFinalized ? <Zap size={18} /> : <Clock size={18} />}
                           </div>
                           <div>
                              <p className="text-xs font-black uppercase text-slate-900">{cp.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Quota : {cp.targetSessions} séances</p>
                           </div>
                        </div>
                        {cp.isFinalized && <span className="bg-emerald-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Finalisé</span>}
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${cp.isFinalized ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${Math.min(100, (cp.currentCount / cp.targetSessions) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </header>

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Propositions en attente</h3>
                 {proposals.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-[35px] border border-slate-100 flex items-center justify-between group hover:border-amber-400 transition-all shadow-sm">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">{p.teacherName[0]}</div>
                          <div>
                             <p className="text-sm font-black text-slate-900 uppercase">{p.ueName}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.teacherName} • {p.roomName} • {p.date}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setProposals(prev => prev.filter(x => x.id !== p.id))} className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={18}/></button>
                          <button onClick={() => validateProposal(p.id)} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"><Check size={18} className="inline mr-2"/>Valider</button>
                       </div>
                    </div>
                 ))}
                 {proposals.length === 0 && <p className="text-center py-20 text-slate-300 font-black uppercase text-xs">Aucune proposition à arbitrer</p>}
              </div>
           </div>
        )}

        {/* PLANIFICATION (ENSEIGNANT) */}
        {role === 'TEACHER' && activeTab === 'PLAN' && (
          <div className="max-w-4xl mx-auto animate-in space-y-8">
             <header className="bg-emerald-600 p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <h1 className="text-4xl font-black uppercase tracking-tighter">Nouvelle Séance</h1>
                   <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Soumission d'un vœu d'horaire</p>
                </div>
             </header>
             <form onSubmit={handleAddProposal} className="bg-white p-12 rounded-[55px] shadow-xl border border-slate-100 grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Date de passage</label>
                   <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Plage Horaire</label>
                   <select required value={form.slot} onChange={e => setForm({...form, slot: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500">
                      <option value="">Sélectionner...</option>
                      {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Classe concernée</label>
                   <select required value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500">
                      <option value="">Choisir la classe...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Salle souhaitée</label>
                   <select required value={form.roomId} onChange={e => setForm({...form, roomId: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500">
                      <option value="">Choisir la salle...</option>
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Code UE</label>
                   <input required placeholder="Ex: ICT 203" value={form.ueCode} onChange={e => setForm({...form, ueCode: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-4">Intitulé UE</label>
                   <input required placeholder="Ex: Algorithmique" value={form.ueName} onChange={e => setForm({...form, ueName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-indigo-500" />
                </div>
                <button type="submit" disabled={isCapacityInsufficient || !form.classId || !form.roomId} className={`md:col-span-2 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all ${isCapacityInsufficient ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}>
                   Soumettre pour arbitrage
                </button>
             </form>
          </div>
        )}

        {/* AUDIT (AVEC TRACABILITÉ SYSTÈME) */}
        {activeTab === 'AUDIT' && (
           <div className="max-w-4xl mx-auto space-y-4 animate-in">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Journal d'Audit Intégré</h2>
              {auditLogs.map(log => (
                <div key={log.id} className={`p-5 rounded-[30px] border flex items-center justify-between text-xs ${log.user.includes('Moteur') ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'}`}>
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black ${log.user.includes('Moteur') ? 'bg-indigo-600' : (log.role === 'ADMIN' ? 'bg-amber-500' : 'bg-slate-900')}`}>{log.user[0]}</div>
                      <div>
                         <p className="font-black text-slate-900 uppercase">{log.user}</p>
                         <p className="text-slate-500 font-medium">{log.action} : {log.details}</p>
                      </div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-300 uppercase">{log.time}</span>
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
