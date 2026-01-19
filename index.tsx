
import React, { useState, useEffect, useCallback, memo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar, User, ShieldCheck, Users, BookOpen, Home, Clock, MapPin, 
  Plus, Trash2, Edit3, CheckCircle2, History, Info, Lock, Unlock, 
  Save, AlertTriangle, ArrowLeft, LogOut, Settings2, X, ChevronRight, 
  LayoutDashboard, Search, RotateCcw, Filter, CheckCircle, AlertCircle, Bell, Mail
} from 'lucide-react';

// --- TYPES ---
type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface AcademicClass { id: string; name: string; size: number; semester: string; year: string; }
interface Room { id: string; name: string; capacity: number; }
interface Teacher { id: string; name: string; email: string; }
interface UE { id: string; code: string; name: string; credits: number; }

interface TimetableEntry {
  id: string;
  day: string;
  timeSlot: string;
  ueId: string;
  teacherId: string;
  roomId: string;
  classId: string;
  group: string;
  date: string;
}

interface Desiderata {
  id: string;
  teacherId: string;
  slots: { day: string; slot: string }[];
  submittedAt: string;
}

interface Notification {
  id: string;
  teacherId: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO';
  date: string;
  read: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const SLOTS = ['08h00 - 11h00', '11h30 - 14h30', '15h00 - 18h00'];

// --- COMPOSANT FORMULAIRE ISOLE (SOLUTION AU BUG DE SAISIE) ---
// Utilisation de memo et d'un état interne pour éviter les re-renders parents à chaque touche pressée
const EntityForm = memo(({ type, initialData, onSave, onCancel }: any) => {
  const [name, setName] = useState(initialData.name || '');
  const [code, setCode] = useState(initialData.code || '');
  const [capacity, setCapacity] = useState(initialData.capacity || '');
  const [extra, setExtra] = useState(initialData.extra || '');

  useEffect(() => {
    setName(initialData.name || '');
    setCode(initialData.code || '');
    setCapacity(initialData.capacity || '');
    setExtra(initialData.extra || '');
  }, [type, initialData.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: initialData.id, name, code, capacity, extra });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 grid md:grid-cols-2 lg:grid-cols-5 gap-6 items-end animate-in">
      <div className="lg:col-span-2 space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom / Libellé</label>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm" 
          placeholder="Ex: Dr. Dupont, Salle A1..."
          required
        />
      </div>
      
      {type === 'UES' && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code UE</label>
          <input 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold uppercase transition-all text-sm" 
            placeholder="Ex: ICT203"
            required
          />
        </div>
      )}

      {(type === 'ROOMS' || type === 'CLASSES') && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacité</label>
          <input 
            type="number" 
            value={capacity} 
            onChange={e => setCapacity(e.target.value)} 
            className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm" 
            placeholder="Nombre"
          />
        </div>
      )}

      {type === 'TEACHERS' && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
          <input 
            type="email"
            value={extra} 
            onChange={e => setExtra(e.target.value)} 
            className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all text-sm" 
            placeholder="prof@univ.edu"
          />
        </div>
      )}

      <div className="lg:col-span-1 flex gap-2">
        <button type="submit" className="flex-1 bg-indigo-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-indigo-700 transition shadow-xl active:scale-95">
          {initialData.id ? 'Modifier' : 'Ajouter'}
        </button>
        {initialData.id && (
          <button type="button" onClick={onCancel} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition">
            <RotateCcw size={20}/>
          </button>
        )}
      </div>
    </form>
  );
});

// --- COMPOSANT PRINCIPAL ---
const App: React.FC = () => {
  const [role, setRole] = useState<Role>('STUDENT');
  const [view, setView] = useState<'HOME' | 'TIMETABLE' | 'ADMIN' | 'TEACHER_SPACE'>('HOME');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Données persistantes (simulées)
  const [ues, setUes] = useState<UE[]>([
    { id: 'u1', code: 'ICT207', name: 'Systèmes d\'Exploitation', credits: 4 },
    { id: 'u2', code: 'ICT203', name: 'Génie Logiciel', credits: 4 }
  ]);
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 't1', name: 'Dr. MONTHE', email: 'monthe@univ.edu' },
    { id: 't2', name: 'Dr. NKOUANDOU', email: 'nkouandou@univ.edu' },
    { id: 't3', name: 'M. NKONDOCK', email: 'nkondock@univ.edu' }
  ]);
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'r1', name: 'S003', capacity: 60 },
    { id: 'r2', name: 'S008', capacity: 100 }
  ]);
  const [classes, setClasses] = useState<AcademicClass[]>([
    { id: 'c1', name: 'ICT4D - ICTL2', size: 45, semester: 'Semestre 1', year: '2025/2026' }
  ]);
  const [entries, setEntries] = useState<TimetableEntry[]>([
    { id: 'e1', day: 'Lundi', timeSlot: '11h30 - 14h30', ueId: 'u1', teacherId: 't1', roomId: 'r1', classId: 'c1', group: 'G1', date: '20 Oct 2025' }
  ]);
  const [desiderata, setDesiderata] = useState<Desiderata[]>([]);
  
  // UI States
  const [adminTab, setAdminTab] = useState<'DASHBOARD' | 'PARAMS' | 'ARBITRAGE'>('DASHBOARD');
  const [entityType, setEntityType] = useState<'UES' | 'TEACHERS' | 'ROOMS' | 'CLASSES'>('UES');
  const [editingItem, setEditingItem] = useState<any>({ id: '' });
  const [activeArb, setActiveArb] = useState<{ teacherId: string, day: string, slot: string } | null>(null);

  // Enseignant connecté (simulé)
  const [loggedTeacherId] = useState('t3');
  const [tempSlots, setTempSlots] = useState<{ day: string, slot: string }[]>([]);

  // Notifications Manager
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const notifyTeacher = useCallback((teacherId: string, message: string, type: 'SUCCESS' | 'WARNING' | 'INFO' = 'INFO') => {
    const newNotif: Notification = {
      id: `n_${Date.now()}`,
      teacherId,
      message,
      type,
      date: new Date().toLocaleTimeString('fr-FR'),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // --- ACTIONS ---
  const handleSaveEntity = (data: any) => {
    const isEdit = !!data.id;
    const id = data.id || `id_${Date.now()}`;
    if (entityType === 'UES') {
      const u = { id, code: data.code, name: data.name, credits: 4 };
      setUes(p => isEdit ? p.map(x => x.id === id ? u : x) : [...p, u]);
    } else if (entityType === 'TEACHERS') {
      const t = { id, name: data.name, email: data.extra || '' };
      setTeachers(p => isEdit ? p.map(x => x.id === id ? t : x) : [...p, t]);
    } else if (entityType === 'ROOMS') {
      const r = { id, name: data.name, capacity: parseInt(data.capacity) || 0 };
      setRooms(p => isEdit ? p.map(x => x.id === id ? r : x) : [...p, r]);
    } else if (entityType === 'CLASSES') {
      const c = { id, name: data.name, size: parseInt(data.capacity) || 0, semester: 'S1', year: '2025/26' };
      setClasses(p => isEdit ? p.map(x => x.id === id ? c : x) : [...p, c]);
    }
    showToast(isEdit ? "Mis à jour !" : "Ajouté avec succès !");
    setEditingItem({ id: '' });
  };

  const submitDesiderata = () => {
    if (tempSlots.length === 0) return showToast("Choisissez vos plages.", "error");
    const d: Desiderata = { 
      id: `d_${Date.now()}`, 
      teacherId: loggedTeacherId, 
      slots: tempSlots,
      submittedAt: new Date().toLocaleTimeString('fr-FR')
    };
    setDesiderata(prev => [...prev.filter(x => x.teacherId !== loggedTeacherId), d]);
    showToast("Vœux envoyés à l'administration !", "success");
  };

  const validateArbitration = (data: any) => {
    if (!activeArb || !data.ueId || !data.roomId) return showToast("Données incomplètes.", "error");
    const conflict = entries.find(e => e.day === activeArb.day && e.timeSlot === activeArb.slot && (e.roomId === data.roomId || e.teacherId === activeArb.teacherId));
    if (conflict) return showToast("Conflit : Enseignant ou Salle déjà pris(e) !", "error");

    const newEntry: TimetableEntry = {
      id: `e_${Date.now()}`,
      day: activeArb.day,
      timeSlot: activeArb.slot,
      ueId: data.ueId,
      teacherId: activeArb.teacherId,
      roomId: data.roomId,
      classId: 'c1',
      group: 'G1',
      date: new Date().toLocaleDateString('fr-FR')
    };

    setEntries(p => [...p, newEntry]);
    const ue = ues.find(u => u.id === data.ueId);
    notifyTeacher(activeArb.teacherId, `Votre cours ${ue?.code} a été validé pour le ${activeArb.day} à ${activeArb.slot}.`, 'SUCCESS');
    showToast("Programmation validée !");
    setActiveArb(null);
  };

  const deleteEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    if (window.confirm("Supprimer ce cours ? L'enseignant recevra une notification d'annulation.")) {
      setEntries(p => p.filter(x => x.id !== id));
      const ue = ues.find(u => u.id === entry.ueId);
      notifyTeacher(entry.teacherId, `ATTENTION : Votre cours de ${ue?.code} (${entry.day} ${entry.timeSlot}) a été supprimé du programme.`, 'WARNING');
      showToast("Cours supprimé.", "info");
    }
  };

  const pendingCount = desiderata.length;
  const teacherNotifs = notifications.filter(n => n.teacherId === loggedTeacherId && !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden">
      {/* Toast Overlay */}
      <div className="fixed top-8 right-8 z-[200] space-y-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in border-l-4 pointer-events-auto min-w-[320px] ${
            t.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 
            t.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-indigo-50 border-indigo-500 text-indigo-800'
          }`}>
            {t.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
            <span className="font-bold text-sm">{t.message}</span>
          </div>
        ))}
      </div>
      
      {view === 'HOME' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in">
          <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center text-white mb-8 shadow-2xl rotate-3">
            <BookOpen size={40} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Portal <span className="text-indigo-600">Académique</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] mb-16 text-[10px] italic">Système Universitaire de Gestion du Temps</p>
          
          <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
            <button onClick={() => {setRole('ADMIN'); setView('ADMIN');}} className="bg-white p-10 rounded-[44px] shadow-sm hover:shadow-2xl hover:scale-105 transition-all group text-left border border-slate-100 relative">
              <ShieldCheck size={40} className="text-indigo-600 mb-6 group-hover:rotate-12 transition-transform"/>
              <h3 className="text-xl font-black uppercase tracking-tight">Administrateur</h3>
              <p className="text-slate-400 text-xs mt-2 font-medium">Gestion et Arbitrage des vœux.</p>
              {pendingCount > 0 && <span className="absolute top-8 right-8 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black animate-pulse shadow-lg">{pendingCount}</span>}
            </button>
            <button onClick={() => {setRole('TEACHER'); setView('TEACHER_SPACE');}} className="bg-white p-10 rounded-[44px] shadow-sm hover:shadow-2xl hover:scale-105 transition-all group text-left border border-slate-100 relative">
              <User size={40} className="text-emerald-500 mb-6 group-hover:rotate-12 transition-transform"/>
              <h3 className="text-xl font-black uppercase tracking-tight">Enseignant</h3>
              <p className="text-slate-400 text-xs mt-2 font-medium">Vœux de disponibilité et notifications.</p>
              {teacherNotifs > 0 && <span className="absolute top-8 right-8 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black animate-pulse shadow-lg">{teacherNotifs}</span>}
            </button>
            <button onClick={() => {setRole('STUDENT'); setView('TIMETABLE');}} className="bg-white p-10 rounded-[44px] shadow-sm hover:shadow-2xl hover:scale-105 transition-all group text-left border border-slate-100">
              <Users size={40} className="text-amber-500 mb-6 group-hover:rotate-12 transition-transform"/>
              <h3 className="text-xl font-black uppercase tracking-tight">Étudiant</h3>
              <p className="text-slate-400 text-xs mt-2 font-medium">Consultation du planning officiel.</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex">
          {/* Sidebar */}
          <nav className="fixed left-0 top-0 h-full w-72 bg-[#0c1222] text-white p-8 hidden lg:flex flex-col z-50 shadow-2xl">
            <div onClick={() => setView('HOME')} className="text-xl font-black tracking-tighter mb-20 cursor-pointer flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-[10px]">ICT</div>
              PRO-MANAGEMENT
            </div>
            <div className="space-y-3 flex-1">
              <button onClick={() => setView('TIMETABLE')} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase transition ${view === 'TIMETABLE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}><Calendar size={18}/> Emploi du Temps</button>
              {role === 'ADMIN' && (
                <button onClick={() => setView('ADMIN')} className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase transition ${view === 'ADMIN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                  <div className="flex items-center gap-4"><ShieldCheck size={18}/> Administration</div>
                  {pendingCount > 0 && <span className="bg-rose-500 px-2 py-0.5 rounded-full text-[8px] animate-pulse">{pendingCount}</span>}
                </button>
              )}
              {role === 'TEACHER' && (
                <button onClick={() => setView('TEACHER_SPACE')} className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase transition ${view === 'TEACHER_SPACE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                  <div className="flex items-center gap-4"><User size={18}/> Mon Espace</div>
                  {teacherNotifs > 0 && <span className="bg-rose-500 px-2 py-0.5 rounded-full text-[8px] animate-pulse">{teacherNotifs}</span>}
                </button>
              )}
            </div>
            <button onClick={() => setView('HOME')} className="flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase text-rose-400 hover:bg-rose-500/10 transition mt-auto"><LogOut size={18}/> Déconnexion</button>
          </nav>
          
          <main className="lg:ml-72 flex-1 p-10 min-h-screen">
            <header className="flex justify-between items-center mb-10">
              <button onClick={() => setView('HOME')} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase text-indigo-600 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"><ArrowLeft size={14}/> Retour</button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{role === 'ADMIN' ? 'Super Admin' : teachers.find(t => t.id === loggedTeacherId)?.name}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{role}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">{role[0]}</div>
              </div>
            </header>

            {/* --- VUE ADMIN --- */}
            {view === 'ADMIN' && (
              <div className="space-y-10 animate-in">
                <div className="flex gap-2 bg-slate-200/40 p-1.5 rounded-xl w-fit">
                  {['DASHBOARD', 'PARAMS', 'ARBITRAGE'].map(t => (
                    <button key={t} onClick={() => setAdminTab(t as any)} className={`relative px-6 py-2 rounded-lg text-[9px] font-black uppercase transition ${adminTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      {t} {t === 'ARBITRAGE' && pendingCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center border-2 border-[#f8fafc]">{pendingCount}</span>}
                    </button>
                  ))}
                </div>

                {adminTab === 'PARAMS' && (
                  <div className="space-y-8 max-w-6xl animate-in">
                    <div className="flex gap-2">
                      {(['UES', 'TEACHERS', 'ROOMS', 'CLASSES'] as const).map(type => (
                        <button key={type} onClick={() => {setEntityType(type); setEditingItem({id:''})}} className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase border-2 transition ${entityType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>{type}</button>
                      ))}
                    </div>
                    <EntityForm type={entityType} initialData={editingItem} onSave={handleSaveEntity} onCancel={() => setEditingItem({id:''})}/>
                    <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b">
                          <tr><th className="p-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Identifiant / Détails</th><th className="p-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {entityType === 'UES' && ues.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50">
                              <td className="p-5 font-bold"><span className="text-indigo-600 mr-4 font-black">{u.code}</span>{u.name}</td>
                              <td className="p-5 text-right space-x-1">
                                <button onClick={() => setEditingItem({id: u.id, name: u.name, code: u.code})} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Edit3 size={16}/></button>
                                <button onClick={() => setUes(p => p.filter(x => x.id !== u.id))} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                              </td>
                            </tr>
                          ))}
                          {entityType === 'TEACHERS' && teachers.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50/50">
                              <td className="p-5 font-bold">{t.name} <span className="ml-4 font-normal text-slate-400 italic">{t.email}</span></td>
                              <td className="p-5 text-right"><button onClick={() => setTeachers(p => p.filter(x => x.id !== t.id))} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminTab === 'ARBITRAGE' && (
                  <div className="space-y-8 animate-in">
                    <div className="bg-indigo-600 p-10 rounded-[44px] text-white shadow-2xl relative overflow-hidden">
                      <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 z-10 relative">Gestion des Vœux</h2>
                      <p className="text-indigo-100 text-sm font-medium z-10 relative">Cliquez sur un créneau jaune pour programmer. L'enseignant sera notifié.</p>
                    </div>
                    <div className="grid gap-6">
                      {desiderata.length === 0 ? (
                        <div className="bg-white p-20 rounded-[44px] border-2 border-dashed border-slate-100 text-center">
                          <Clock size={48} className="text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold text-sm uppercase">En attente de vœux...</p>
                        </div>
                      ) : desiderata.map(d => (
                        <div key={d.id} className="bg-white p-8 rounded-[44px] border border-slate-100 shadow-sm animate-in">
                          <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">{teachers.find(t => t.id === d.teacherId)?.name[0]}</div>
                              <div>
                                <h3 className="text-lg font-black uppercase">{teachers.find(t => t.id === d.teacherId)?.name}</h3>
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Reçu à {d.submittedAt}</p>
                              </div>
                            </div>
                            <button onClick={() => setDesiderata(p => p.filter(x => x.id !== d.id))} className="p-3 text-rose-400 hover:bg-rose-50 rounded-xl transition"><Trash2 size={18}/></button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-1.5">
                              <thead><tr><th></th>{DAYS.map(day => <th key={day} className="text-[9px] font-black text-slate-300 uppercase py-2">{day}</th>)}</tr></thead>
                              <tbody>
                                {SLOTS.map(slot => (
                                  <tr key={slot}>
                                    <td className="text-[8px] font-black text-slate-400 whitespace-nowrap pr-4">{slot}</td>
                                    {DAYS.map(day => {
                                      const isRequested = d.slots.some(s => s.day === day && s.slot === slot);
                                      const isBooked = entries.find(e => e.day === day && e.timeSlot === slot && e.teacherId === d.teacherId);
                                      return (
                                        <td key={day+slot}>
                                          <button 
                                            disabled={!isRequested || !!isBooked}
                                            onClick={() => setActiveArb({ teacherId: d.teacherId, day, slot })}
                                            className={`h-14 w-full rounded-2xl border-2 transition-all flex items-center justify-center ${
                                              isBooked ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 
                                              isRequested ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm' : 'bg-slate-50 border-slate-50 opacity-10'
                                            }`}
                                          >
                                            {isBooked ? <CheckCircle size={18}/> : isRequested ? <Plus size={18}/> : null}
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
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- MODAL ARBITRAGE --- */}
            {activeArb && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-8 animate-in">
                <div className="bg-white rounded-[60px] p-12 max-w-2xl w-full shadow-2xl relative">
                   <button onClick={() => setActiveArb(null)} className="absolute top-8 right-8 p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition"><X size={24}/></button>
                   <h3 className="text-4xl font-black uppercase tracking-tighter mb-2 text-indigo-600">Affectation</h3>
                   <p className="text-slate-500 font-medium mb-10">Programmation pour <span className="text-slate-900 font-black">{activeArb.day} à {activeArb.slot}</span></p>
                   <div className="space-y-6 text-left">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unité d'Enseignement</label>
                       <select onChange={e => setEditingItem({...editingItem, ueId: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl focus:border-indigo-500 font-bold outline-none text-sm">
                         <option value="">Choisir l'UE...</option>
                         {ues.map(u => <option key={u.id} value={u.id}>{u.code} - {u.name}</option>)}
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salle</label>
                       <select onChange={e => setEditingItem({...editingItem, roomId: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl focus:border-indigo-500 font-bold outline-none text-sm">
                         <option value="">Choisir la salle...</option>
                         {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} pl.)</option>)}
                       </select>
                     </div>
                     <button onClick={() => validateArbitration({ ueId: editingItem.ueId, roomId: editingItem.roomId })} className="w-full bg-[#0f172a] text-white p-6 rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-600 transition-all mt-6">Valider la programmation</button>
                   </div>
                </div>
              </div>
            )}

            {/* --- ESPACE ENSEIGNANT --- */}
            {view === 'TEACHER_SPACE' && (
              <div className="animate-in space-y-10 max-w-6xl mx-auto">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Mon Planning</h2>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-2">Suivi et centre de notifications</p>
                  </div>
                  <button onClick={submitDesiderata} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl active:scale-95 transition-all">Transmettre mes vœux ({tempSlots.length})</button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-full">
                       <div className="flex items-center justify-between mb-8">
                         <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Bell size={18} className="text-indigo-600"/> Notifications</h3>
                         {teacherNotifs > 0 && <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black">{teacherNotifs} New</span>}
                       </div>
                       <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                         {notifications.filter(n => n.teacherId === loggedTeacherId).length === 0 ? (
                           <div className="text-center py-10 opacity-20"><Mail size={32} className="mx-auto mb-3" /><p className="text-[10px] font-black uppercase">Aucun message</p></div>
                         ) : notifications.filter(n => n.teacherId === loggedTeacherId).map(n => (
                           <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? {...x, read: true} : x))} className={`p-5 rounded-2xl border-l-4 transition-all cursor-pointer ${n.read ? 'bg-slate-50 border-slate-200' : n.type === 'SUCCESS' ? 'bg-emerald-50 border-emerald-500 shadow-sm' : n.type === 'WARNING' ? 'bg-rose-50 border-rose-500 shadow-sm' : 'bg-indigo-50 border-indigo-500'}`}>
                             <p className={`text-[11px] font-bold leading-relaxed mb-2 ${n.read ? 'text-slate-400' : 'text-slate-800'}`}>{n.message}</p>
                             <div className="flex justify-between items-center"><span className="text-[8px] font-black text-slate-300 uppercase">{n.date}</span>{!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}</div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[44px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-5 mb-8 bg-slate-50 p-6 rounded-3xl"><Info size={24} className="text-indigo-600"/><p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Cliquer pour choisir vos plages. Les cases bleues sont validées.</p></div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-2">
                          <thead><tr><th className="p-2"></th>{DAYS.map(day => <th key={day} className="text-[9px] font-black text-slate-300 uppercase py-2">{day}</th>)}</tr></thead>
                          <tbody>
                            {SLOTS.map(slot => (
                              <tr key={slot}>
                                <td className="text-[8px] font-black text-slate-400 pr-6">{slot}</td>
                                {DAYS.map(day => {
                                  const isSel = tempSlots.some(s => s.day === day && s.slot === slot);
                                  const isConf = entries.find(e => e.day === day && e.timeSlot === slot && e.teacherId === loggedTeacherId);
                                  return (
                                    <td key={day+slot}>
                                      <button onClick={() => !isConf && setTempSlots(p => isSel ? p.filter(s => !(s.day === day && s.slot === slot)) : [...p, {day, slot}])} className={`h-20 w-full min-w-[70px] rounded-[24px] border-2 transition-all flex flex-col items-center justify-center ${isConf ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-95' : isSel ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl scale-95' : 'bg-slate-50 border-slate-50 hover:border-indigo-200'}`}>
                                        {isConf ? <CheckCircle size={24}/> : isSel ? <CheckCircle2 size={24}/> : <Plus size={18} className="opacity-10"/>}
                                        {isConf && <span className="text-[6px] font-black uppercase mt-1">Validé</span>}
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

            {/* --- VUE EMPLOI DU TEMPS --- */}
            {view === 'TIMETABLE' && (
              <div className="animate-in space-y-12 max-w-7xl mx-auto">
                <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                   <div className="relative z-10">
                     <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-3">République du Cameroun</h2>
                     <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">ICT4D - ICTL2</h3>
                     <p className="text-slate-400 font-bold text-xs mt-3 uppercase tracking-widest">Planning Semestriel Officiel</p>
                   </div>
                   <div className="bg-[#0c1222] text-white px-8 py-6 rounded-3xl text-right z-10 shadow-2xl"><p className="text-[8px] font-black text-white/30 uppercase mb-1">Semestre 1</p><p className="text-lg font-black uppercase">2025 / 2026</p></div>
                   <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full -mr-40 -mt-40 opacity-40"></div>
                </div>
                <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl overflow-hidden p-10 overflow-x-auto">
                  <table className="w-full border-separate border-spacing-3">
                    <thead><tr><th className="p-4"></th>{DAYS.map(day => <th key={day} className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center p-4">{day}</th>)}</tr></thead>
                    <tbody>
                      {SLOTS.map(slot => (
                        <tr key={slot}>
                          <td className="text-[9px] font-black text-slate-400 border-r-4 border-slate-50 whitespace-nowrap pt-12 align-top pr-6">{slot}</td>
                          {DAYS.map(day => {
                            const cells = entries.filter(e => e.day === day && e.timeSlot === slot);
                            return (
                              <td key={day+slot} className="align-top min-w-[280px]">
                                {cells.length > 0 ? cells.map(e => (
                                  <div key={e.id} className="bg-[#1e293b] p-8 rounded-[40px] text-white shadow-xl mb-4 group relative hover:scale-[1.02] transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                      <p className="text-3xl font-black text-indigo-400 tracking-tighter leading-none">{ues.find(u => u.id === e.ueId)?.code}</p>
                                      <div className="bg-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase">{e.group}</div>
                                    </div>
                                    <p className="text-[10px] font-bold text-white/40 mb-8 uppercase truncate">{ues.find(u => u.id === e.ueId)?.name}</p>
                                    <div className="flex items-center gap-3 mb-6"><div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400"><User size={18}/></div><p className="text-[11px] font-black uppercase italic text-white/90">{teachers.find(t => t.id === e.teacherId)?.name}</p></div>
                                    <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                                      <div><p className="text-[7px] text-white/20 uppercase mb-1">Local</p><p className="text-xs font-black text-indigo-300">{rooms.find(r => r.id === e.roomId)?.name}</p></div>
                                      <div className="text-right"><p className="text-[7px] text-white/20 uppercase mb-1">Capacité</p><p className="text-[10px] font-bold text-white/60">{rooms.find(r => r.id === e.roomId)?.capacity} Pl.</p></div>
                                    </div>
                                    {role === 'ADMIN' && (
                                      <button onClick={() => deleteEntry(e.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:rotate-90"><X size={16}/></button>
                                    )}
                                  </div>
                                )) : <div className="h-40 border-4 border-dashed border-slate-50 rounded-[40px] flex flex-col items-center justify-center opacity-40"><Clock size={20} className="text-slate-200 mb-2" /><span className="text-[9px] font-black uppercase text-slate-300">Libre</span></div>}
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
          </main>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
