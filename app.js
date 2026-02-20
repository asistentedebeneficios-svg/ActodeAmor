import React, { useState, useEffect, useRef } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
// Importación limpia de iconos para evitar fallos
import { Heart, Check, ShieldCheck, Users, Baby, Activity, DollarSign, ChevronRight, ArrowLeft, Star, HelpCircle, Clock, Stethoscope, PenTool, Mail, Lock, X, Archive, Trash2, UserPlus, Briefcase, Phone, Edit2, BadgeCheck, MessageSquare, User, Image as ImageIcon, Video, Calendar, Shield, MapPin, CalendarDays, Settings, Plus, MinusCircle, Link as LinkIcon, Search, ArrowRight, Save, LogOut, RotateCcw } from 'https://esm.sh/lucide-react@0.344.0';

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- CONSTANTS ---
const US_STATES = [
    "Arizona", "California", "Colorado", "Florida", "Hawaii", "Idaho", "Illinois", "Montana", "Nevada", "New Mexico", "Oregon", "Texas", "Utah", "Virginia", "Wisconsin"
];

const STEPS = [
    { id: 'intro', question: "Un Acto de Amor", subtext: "Llene este corazón paso a paso para descubrir si califica para proteger a su familia.", buttonStart: "Comenzar" },
    { 
        id: 'policy_for', 
        question: "¿A quién desea proteger?", 
        subtext: "Puede seleccionar a varias personas importantes.", 
        multiSelect: true, 
        options: [
            { id: 'me', label: 'A mí', icon: User },
            { id: 'spouse', label: 'Mi Pareja', icon: Heart },
            { id: 'children', label: 'Mis Hijos', icon: Baby },
            { id: 'parents', label: 'Mis Padres', icon: ShieldCheck }
        ]
    },
    { id: 'motivation', question: "¿Qué le preocupa dejar?", subtext: "Seleccione todo lo que aplique.", multiSelect: true, options: [
        { id: 'funeral', label: 'Costos Funerales', icon: Activity },
        { id: 'debt', label: 'Deudas', icon: DollarSign },
        { id: 'legacy', label: 'Sin Herencia', icon: Heart },
        { id: 'burden', label: 'Ser una Carga', icon: Users }
    ]},
    { id: 'coverage_amount', question: "¿Qué monto cree necesitar?", subtext: "Es un estimado, se puede ajustar.", multiSelect: false, options: [
        { id: '5k', label: '$5,000 - $10,000', icon: DollarSign },
        { id: '10k', label: '$10,000 - $15,000', icon: DollarSign },
        { id: '15k', label: '$15,000 - $25,000', icon: DollarSign },
        { id: '25k', label: '$25,000 o más', icon: DollarSign }
    ]},
    { id: 'budget', question: "¿Qué presupuesto mensual podría destinar?", subtext: "Una pequeña inversión hoy es un gran alivio mañana.", multiSelect: false, options: [
        { id: '30-50', label: 'De $30 a $50', icon: Heart },
        { id: '50-80', label: 'De $50 a $80', icon: Heart },
        { id: '80-100', label: 'De $80 a $100', icon: Heart },
        { id: '100-150', label: 'De $100 a $150', icon: Heart }
    ]},
    { id: 'faq_consult', isFAQ: true, question: "Dudas Frecuentes", subtext: "Seleccione las preguntas para ver la respuesta.", faqOptions: [ 
        { id: 'cost', label: '¿Será muy costoso?', icon: DollarSign, answer: "Para nada. Nuestros planes están diseñados para ajustarse a presupuestos fijos y lo mejor: la cuota nunca sube con el tiempo." },
        { id: 'health', label: '¿Piden examen médico?', icon: Stethoscope, answer: "¡Buenas noticias! La mayoría de nuestros planes NO requieren examen médico, solo responder unas sencillas preguntas de salud." },
        { id: 'age', label: '¿Mi edad es un problema?', icon: HelpCircle, answer: "No es un impedimento. Contamos con opciones especializadas que cubren hasta los 85 años de edad." },
        { id: 'waiting', label: '¿Cuándo empieza a cubrir?', icon: Clock, answer: "Dependiendo del plan para el que califique, muchas pólizas ofrecen protección inmediata desde el primer día." }
    ]},
    { id: 'letter', isLetter: true },
    { id: 'contact', isForm: true }
];

const DEFAULT_SCHEDULE = {
    weekly: {
        0: { active: false, blocks: [{ start: '09:00', end: '17:00' }] }, 
        1: { active: true, blocks: [{ start: '09:00', end: '18:00' }] }, 
        2: { active: true, blocks: [{ start: '09:00', end: '18:00' }] }, 
        3: { active: true, blocks: [{ start: '09:00', end: '18:00' }] }, 
        4: { active: true, blocks: [{ start: '09:00', end: '18:00' }] }, 
        5: { active: true, blocks: [{ start: '09:00', end: '18:00' }] }, 
        6: { active: false, blocks: [{ start: '10:00', end: '14:00' }] }, 
    },
    exceptions: {} 
};

const DAYS_MAP = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const getLabelForValue = (stepId, value) => {
    const step = STEPS.find(s => s.id === stepId);
    if (!step || !step.options) return value;
    const valToCheck = Array.isArray(value) ? value[0] : value;
    const option = step.options.find(o => o.id === valToCheck);
    return option ? option.label : valToCheck;
};
const getLabelsForArray = (stepId, values) => {
    if (!Array.isArray(values)) return getLabelForValue(stepId, values);
    const step = STEPS.find(s => s.id === stepId);
    if (!step) return values.join(', ');
    return values.map(v => step.options.find(o => o.id === v)?.label || v).join(', ');
};

const getReinforcementMessage = (stepId, selections) => {
    const sels = Array.isArray(selections) ? selections : [selections];
    if (stepId === 'policy_for') {
        if (sels.length > 1) return { title: "Un Gran Gesto de Amor", text: "Cuidar de varias personas importantes en tu vida es el legado más noble que puedes dejar.", icon: Users };
        if (sels.includes('me')) return { title: "Un Acto de Responsabilidad", text: "Proteger a tu familia de tus propios gastos finales es el regalo más desinteresado.", icon: User };
        if (sels.includes('parents')) return { title: "Gratitud Eterna", text: "Ellos cuidaron de ti toda la vida. Ahora es tu turno de cuidar de su tranquilidad.", icon: ShieldCheck };
        if (sels.includes('spouse')) return { title: "Promesa de Amor", text: "Asegurar que tu pareja no tenga cargas financieras es la prueba máxima de cariño.", icon: Heart };
        if (sels.includes('children')) return { title: "Futuro Seguro", text: "Garantizar la protección de tus hijos es la prioridad de todo padre.", icon: Baby };
    }
    if (stepId === 'motivation') return { title: "Paz Mental", text: "Transformas una futura preocupación en un recuerdo de amor.", icon: Star };
    if (stepId === 'coverage_amount') return { title: "Vas por buen camino", text: "El costo promedio de un funeral supera los $9,000. Tu elección ayudará a cubrir esa diferencia.", icon: DollarSign };
    if (stepId === 'budget') return { title: "Una inversión de amor", text: "Cuidar a su familia no requiere una fortuna. Con este esfuerzo mensual, les garantizará paz mental y tranquilidad para siempre.", icon: Heart };
    return null;
};

const generateUserLetter = (data) => {
    const insuredArray = data.policy_for || ['me'];
    let salutation = "A mis seres amados,", body = "", closing = "Con amor eterno,";

    if (insuredArray.length > 1) {
        salutation = "A mi querida familia,";
        body = "He estado reflexionando sobre lo importantes que son para mí. Ustedes son mi razón de ser y mi mayor deseo es que siempre tengan paz y tranquilidad. Por eso, he decidido tomar acción hoy para proteger a las personas que más amo. No quiero que el dinero o las deudas sean jamás una preocupación. Este plan es mi escudo de amor para proteger nuestro futuro.";
    } else {
        const insured = insuredArray[0];
        if (insured === 'me') {
            salutation = "A mi querida familia,";
            body = "Sé que un día tendré que partir, y mi mayor miedo no es irme, sino dejarles preocupaciones. No quiero que mi despedida sea una carga financiera para ustedes. Por eso he tomado esta decisión hoy: dejar todo resuelto para que puedan recordarme con amor y no con deudas.";
        } else if (insured === 'parents') {
            salutation = "A mis queridos padres,";
            body = "Ustedes me dieron la vida y cuidaron de mí siempre. Ahora es mi turno de devolverles esa paz. No quiero que se preocupen por el futuro ni por gastos inesperados. Esta cobertura es mi forma de decirles 'Gracias' y asegurar que siempre estén tranquilos.";
        } else if (insured === 'spouse') {
            salutation = "A mi amado/a esposo/a,";
            body = "Prometí cuidarte en la salud y en la enfermedad, y esta decisión es para cumplir esa promesa más allá de todo. No quiero que enfrentes momentos difíciles con estrés financiero. Esto es para ti, para tu seguridad y nuestro futuro.";
        } else if (insured === 'children') {
            salutation = "A mis hijos adorados,";
            body = "Desde que nacieron, mi misión ha sido protegerlos. Esta decisión es para garantizar que, pase lo que pase, tengan un respaldo. Es mi último regalo de protección para asegurar su futuro.";
        }
    }
    return { salutation, body, closing };
};

// --- FIREBASE CONFIGURATION (CON SEGURO ANTI-DUPLICADOS) ---
const firebaseConfig = {
    apiKey: "AIzaSyD0_obkBRnlbBqar4gE_Tv6JpbTfmQNmQI",
    authDomain: "actodeamor-45a74.firebaseapp.com",
    projectId: "actodeamor-45a74",
    storageBucket: "actodeamor-45a74.firebasestorage.app",
    messagingSenderId: "685007300356",
    appId: "1:685007300356:web:e0538ee65bdc8b43ee5251"
};

// Evita que Firebase crashee la página si se reinicia el entorno
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- HOOKS ---
const useFirebaseDatabase = () => {
    const [leads, setLeads] = useState([]);
    const [agents, setAgents] = useState([]);
    const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                signInAnonymously(auth).catch(console.error);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const scheduleDoc = doc(db, 'settings', 'schedule');
        const unsubSchedule = onSnapshot(scheduleDoc, (snapshot) => {
            if (snapshot.exists()) {
                setSchedule(snapshot.data());
            } else if (!user.isAnonymous) {
                setDoc(scheduleDoc, DEFAULT_SCHEDULE).catch(e => console.log("Schedule auto-creation skipped"));
            }
        }, (err) => {
            if(err.code !== 'permission-denied') console.error("Schedule error:", err);
        });

        let unsubLeads = () => {};
        let unsubAgents = () => {};

        if (!user.isAnonymous) {
            const leadsQuery = collection(db, 'leads'); 
            unsubLeads = onSnapshot(leadsQuery, (snapshot) => {
                setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => {
                if (err.code !== 'permission-denied') console.error("Leads error:", err);
            });

            const agentsQuery = collection(db, 'agents');
            unsubAgents = onSnapshot(agentsQuery, (snapshot) => {
                setAgents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => {
                if (err.code !== 'permission-denied') console.error("Agents error:", err);
            });
        }

        return () => { unsubLeads(); unsubAgents(); unsubSchedule(); };
    }, [user]);

   const addLead = async (lead) => {
        try {
            console.log("Intentando guardar lead:", lead);
            const newLead = { ...lead, timestamp: Date.now(), status: 'new', notes: '' };
            await addDoc(collection(db, 'leads'), newLead);
            console.log("¡Lead guardado con éxito en Firebase!");
        } catch (error) {
            console.error("🚨 ERROR CRÍTICO AL GUARDAR EL LEAD:", error);
            alert("Hubo un error de conexión al guardar. Revisa la consola (F12).");
        }
    };

    const updateLead = async (id, data) => {
        if (!user) return;
        await updateDoc(doc(db, 'leads', id), data);
    };

    const bulkUpdateLeads = async (ids, data) => {
        if (!user) return;
        const batch = writeBatch(db);
        ids.forEach(id => {
            const ref = doc(db, 'leads', id);
            batch.update(ref, data);
        });
        await batch.commit();
    };

    const bulkDeleteLeads = async (ids) => {
        if (!user) return;
        const batch = writeBatch(db);
        ids.forEach(id => {
            const ref = doc(db, 'leads', id);
            batch.delete(ref);
        });
        await batch.commit();
    };

    const deleteLead = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'leads', id));
    };

    const saveAgent = async (agent) => {
        if (!user) return;
        const col = collection(db, 'agents');
        if (agent.id) {
            const { id, ...data } = agent;
            await updateDoc(doc(col, id), data);
        } else {
            await addDoc(col, { ...agent, timestamp: Date.now() });
        }
    };

    const deleteAgent = async (id) => {
        if (!user) return;
        await deleteDoc(doc(db, 'agents', id));
    };

    const updateSchedule = async (newSchedule) => {
        if (!user) return;
        await setDoc(doc(db, 'settings', 'schedule'), newSchedule);
    };

    const adminLogin = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const adminLogout = async () => {
        await signOut(auth);
    };

    return { leads, agents, schedule, user, addLead, updateLead, bulkUpdateLeads, bulkDeleteLeads, deleteLead, saveAgent, deleteAgent, updateSchedule, adminLogin, adminLogout };
};

// --- COMPONENTS ---
const AdminLogin = ({ onClose, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onLogin(email, password);
            onClose();
        } catch (err) {
            console.error(err);
            setError('Credenciales incorrectas o acceso denegado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="glass-card bg-white/90 rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-slide-up relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 rounded-full p-1.5"><X size={18}/></button>
                <div className="text-center mb-6 mt-2">
                    <div className="bg-black text-white p-3.5 rounded-2xl inline-block mb-4 shadow-lg"><Lock size={28} strokeWidth={2}/></div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Acceso Privado</h2>
                    <p className="text-sm text-gray-500 mt-1">Solo personal autorizado</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input type="email" placeholder="Correo electrónico" className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm" value={email} onChange={e=>setEmail(e.target.value)} required/>
                    </div>
                    <div>
                        <input type="password" placeholder="Contraseña" className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm" value={password} onChange={e=>setPassword(e.target.value)} required/>
                    </div>
                    {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 mt-2">
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const HeartProgress = ({ percentage, isBeating }) => {
    return (
        <div className="relative w-24 h-24 mx-auto mb-4 transition-all duration-700 ease-out">
            <div className={`absolute inset-0 bg-rose-500/20 blur-xl rounded-full transform scale-75 translate-y-2 ${isBeating ? 'animate-pulse' : ''}`}></div>
            <svg viewBox="0 0 24 24" fill="none" className={`w-full h-full drop-shadow-md transition-transform duration-300 ${isBeating ? 'scale-110' : 'scale-100'}`}>
                <defs>
                    <linearGradient id="heartFill" x1="0" x2="0" y1="1" y2="0">
                        <stop offset={`${percentage}%`} stopColor="#E11D48" style={{transition: 'offset 1s ease-in-out'}} />
                        <stop offset={`${percentage}%`} stopColor="#FFE4E6" style={{transition: 'offset 1s ease-in-out'}} />
                    </linearGradient>
                </defs>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                      fill="url(#heartFill)" stroke="#E11D48" strokeWidth="1" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-1">
                <span className={`text-sm font-bold ${percentage >= 50 ? 'text-white' : 'text-rose-600'}`}>{percentage}%</span>
            </div>
        </div>
    );
};

const LetterStep = ({ data, onContinue }) => {
    const letter = generateUserLetter(data);
    const [isSigned, setIsSigned] = useState(false);

    return (
        <div className="flex flex-col w-full pt-4 pb-10 min-h-0">
            <div className="letter-paper p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-200 relative mb-6 shadow-md mx-2 md:mx-0">
                <div className="absolute top-4 right-4 text-rose-200 opacity-60"><Heart size={48} strokeWidth={1} /></div>
                <div className="font-serif text-gray-800 space-y-4 leading-relaxed pb-4 text-base md:text-lg">
                    <p className="font-bold text-lg md:text-xl text-rose-800">{letter.salutation}</p>
                    <p>{letter.body}</p>
                    <p className="pt-4 font-bold text-rose-800 italic text-lg md:text-xl">{letter.closing}</p>
                </div>
                
                <div className="mt-8 pt-4 relative min-h-[100px] flex items-center justify-center border-t-2 border-dashed border-gray-300 cursor-pointer hover:bg-rose-50/30 transition-colors rounded-b-xl" onClick={!isSigned ? () => setIsSigned(true) : undefined}>
                    {!isSigned ? (
                        <div className="text-gray-400 font-handwriting text-xl md:text-2xl animate-pulse flex flex-col items-center">
                            <span>Toque aquí para sellar su promesa</span>
                        </div>
                    ) : (
                        <div className="animate-stamp relative">
                            <div className="border-4 border-rose-600 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transform -rotate-12 opacity-80">
                                <div className="border-2 border-rose-600 rounded-full w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center text-rose-700">
                                    <Heart size={20} fill="currentColor" />
                                    <span className="text-[8px] md:text-[10px] font-bold uppercase mt-1 tracking-widest">Promesa</span>
                                    <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-widest">Sellada</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="shrink-0 animate-slide-up pb-8 px-4 md:px-0">
                <p className="text-center text-gray-500 text-xs md:text-sm mb-4">
                    {isSigned ? "Su compromiso ha quedado registrado." : "Selle la carta para continuar."}
                </p>
                <button onClick={onContinue} disabled={!isSigned} className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${isSigned ? 'bg-[#E11D48] text-white hover:scale-[1.02]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Continuar <ChevronRight size={20}/></button>
            </div>
        </div>
    );
};

const FAQStep = ({ options, onContinue }) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [showAnswers, setShowAnswers] = useState(false);

    const toggleQuestion = (id) => setSelectedQuestions(prev => prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]);
    const handleViewAnswers = () => { if (selectedQuestions.length === 0) onContinue(); else { setShowAnswers(true); window.scrollTo(0, 0); } };
    const selectedAnswers = options.filter(opt => selectedQuestions.includes(opt.id));

    if (showAnswers) {
        return (
            <div className="flex flex-col w-full relative animate-fade-in pb-10 px-4 md:px-0">
                <div className="text-center mb-6 mt-4">
                    <div className="inline-flex p-3 bg-green-50 rounded-full text-green-600 mb-2"><Check size={32} /></div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Aquí están sus respuestas</h2>
                    <p className="text-sm md:text-base text-gray-500 mt-2">Información clara para su tranquilidad.</p>
                </div>
                <div className="space-y-4 md:space-y-6">
                    {selectedAnswers.map(ans => (
                        <div key={ans.id} className="bg-white p-5 md:p-6 rounded-2xl border border-rose-100 shadow-sm animate-slide-up">
                            <h4 className="font-bold text-rose-700 text-base md:text-lg mb-2 flex items-center gap-2 border-b border-rose-50 pb-2"><ans.icon size={18}/> {ans.label}</h4>
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">{ans.answer}</p>
                        </div>
                    ))}
                </div>
                <div className="pt-8 pb-12">
                    <button onClick={onContinue} className="w-full bg-[#E11D48] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform animate-scale-up flex items-center justify-center gap-2">Entendido, Continuar <ChevronRight size={20}/></button>
                    <button onClick={() => {setShowAnswers(false); window.scrollTo(0, 0);}} className="w-full mt-4 text-gray-400 text-sm font-medium hover:text-gray-600 underline">Volver a las preguntas</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full relative pb-10 px-4 md:px-0">
            <div className="text-center mb-8 mt-4">
                <div className="inline-flex p-3 bg-blue-50 rounded-full text-blue-500 mb-2"><MessageSquare size={32} /></div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">¿Tiene alguna duda?</h2>
                <p className="text-sm md:text-base text-gray-500 mt-2">Seleccione todas las que desee aclarar ahora.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
                {options.map((opt) => {
                    const isSelected = selectedQuestions.includes(opt.id);
                    return (
                        <button key={opt.id} onClick={() => toggleQuestion(opt.id)} className={`p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 text-center transition-all min-h-[140px] md:min-h-[160px] ${isSelected ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02]' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-gray-50'}`}>
                            <div className={`p-2.5 rounded-full ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}><opt.icon size={28} /></div>
                            <span className={`text-sm md:text-base font-bold leading-tight px-2 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>{opt.label}</span>
                            {isSelected && <div className="absolute top-3 right-3 text-blue-500"><Check size={20} strokeWidth={3}/></div>}
                        </button>
                    );
                })}
            </div>
            <div className="mt-auto pb-8">
                <button onClick={handleViewAnswers} className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform animate-scale-up flex items-center justify-center gap-2 ${selectedQuestions.length > 0 ? 'bg-[#E11D48] text-white' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                    {selectedQuestions.length > 0 ? "Ver Respuestas" : "No tengo dudas, Continuar"} <ChevronRight size={20}/>
                </button>
            </div>
        </div>
    );
};

const ContactForm = ({ onSubmit, onSuccess, data, scheduleConfig, onAdminTrigger }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [noEmail, setNoEmail] = useState(false);
    const [state, setState] = useState('');
    const [callType, setCallType] = useState('video'); 
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [status, setStatus] = useState('idle'); 
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        if(!date) { setAvailableSlots([]); return; }
        
        // Convertimos la fecha de forma segura para evitar saltos de zona horaria
        const selectedParts = date.split('-');
        const selectedDate = new Date(selectedParts[0], selectedParts[1] - 1, selectedParts[2]);
        const dayIndex = selectedDate.getDay(); 
        
        let dayConfig = scheduleConfig.exceptions[date] || scheduleConfig.weekly[dayIndex];

        if(!dayConfig || !dayConfig.active || !dayConfig.blocks) { setAvailableSlots([]); return; }

        const slots = [];
        const now = new Date();

        dayConfig.blocks.forEach(block => {
            let current = new Date(`${date}T${block.start}`);
            const end = new Date(`${date}T${block.end}`);
            while(current < end) {
                const timeStr = current.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true}).toLowerCase().replace('am', 'a.m.').replace('pm', 'p.m.');
                // Mantenemos la regla por seguridad, aunque ya no pueden agendar el mismo día
                if(date === now.toISOString().split('T')[0] && current < now) { current.setMinutes(current.getMinutes() + 60); continue; }
                slots.push(timeStr);
                current.setMinutes(current.getMinutes() + 60); 
            }
        });
        slots.sort((a, b) => new Date('1970/01/01 ' + a.replace('a.m.','AM').replace('p.m.','PM')) - new Date('1970/01/01 ' + b.replace('a.m.','AM').replace('p.m.','PM')));
        setAvailableSlots(slots); setTime(''); 
    }, [date, scheduleConfig]);

    const isFormValid = name && phone.length >= 10 && state && (noEmail || email) && date && time;

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if(!isFormValid || status !== 'idle') return;
        setStatus('submitting');
        await new Promise(r => setTimeout(r, 1500));
        onSubmit({ name, phone, email: noEmail ? 'No proporcionado' : email, state, callType, date, time });
        setStatus('success');
        onSuccess();
    };

    // Calculamos la fecha de MAÑANA para restringir el calendario
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    return (
        <div className="w-full max-w-md mx-auto animate-slide-up flex flex-col pb-12 pt-4 relative px-4 md:px-0">
             {status !== 'success' && (
                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Agendar Asesoría</h2>
                    <p className="text-sm md:text-base text-gray-500">Un experto le ayudará a activar su plan.</p>
                </div>
             )}
            
            <div className="space-y-4 md:space-y-6">
                {status === 'success' ? (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-rose-100 shadow-xl text-center animate-fade-in flex flex-col items-center justify-center py-12 relative">
                        <button onClick={onAdminTrigger} className="absolute top-4 right-4 text-gray-200 hover:text-gray-400 transition-colors p-2"><Lock size={16}/></button>
                        
                        {/* AQUÍ ESTÁ EL CAMBIO: El corazón latiendo al 100% en lugar del check */}
                        <div className="mb-4 animate-[slide-up_0.5s_ease-out_0.2s_both]">
                            <HeartProgress percentage={100} isBeating={true} />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">¡Misión Cumplida!</h2>
                        <p className="text-gray-500 mb-6 text-sm md:text-base">Has dado un paso gigante de amor.</p>
                        <div className="bg-rose-50 p-5 md:p-6 rounded-2xl text-rose-800 italic text-sm md:text-base shadow-inner">
                            "No hay mayor tranquilidad que saber que, pase lo que pase, tu familia estará protegida. Gracias por cuidarlos hoy."
                        </div>
                        <button onClick={() => window.location.reload()} className="mt-8 text-gray-400 font-medium hover:text-gray-600 text-xs md:text-sm underline">Volver al inicio</button>
                    </div>
                ) : (
                <>
                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><User size={16} className="text-rose-500"/> Mis Datos</h3>
                        <div className="space-y-3">
                            <div><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Nombre Completo</label><input type="text" className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="Ej. Maria Perez" value={name} onChange={e => setName(e.target.value)} disabled={status !== 'idle'} /></div>
                            <div><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Teléfono Celular</label><input type="tel" className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="Ej. 555 123 4567" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} disabled={status !== 'idle'} /></div>
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Estado (EE.UU.)</label>
                                <div className="relative"><MapPin className="absolute left-3.5 md:left-4 top-3.5 md:top-4 text-gray-400" size={18}/><select className="w-full p-3 md:p-4 pl-10 md:pl-10 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all appearance-none text-gray-700" value={state} onChange={e => setState(e.target.value)} disabled={status !== 'idle'}><option value="">Seleccione su Estado</option>{US_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><Mail size={16} className="text-rose-500"/> Correo Electrónico (Seguridad)</h3>
                        <p className="text-[11px] md:text-xs text-gray-500 bg-gray-50 p-2 md:p-3 rounded-lg leading-relaxed">Por su seguridad, le enviaremos la <strong>foto y credenciales</strong> del especialista asignado a su correo antes de la cita.</p>
                        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-2">
                            <button onClick={() => setNoEmail(false)} disabled={status !== 'idle'} className={`p-2.5 md:p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${!noEmail ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-400'}`}><span className="text-xs md:text-sm font-bold">Ingresar Correo</span></button>
                            <button onClick={() => setNoEmail(true)} disabled={status !== 'idle'} className={`p-2.5 md:p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${noEmail ? 'bg-gray-100 border-gray-400 text-gray-700 ring-1 ring-gray-400' : 'bg-white border-gray-200 text-gray-400'}`}><span className="text-xs md:text-sm font-bold">No tengo Correo</span></button>
                        </div>
                        {!noEmail ? (<div><input type="email" className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-white text-sm md:text-base font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="ejemplo@correo.com" value={email} onChange={e => setEmail(e.target.value)} disabled={status !== 'idle'} /></div>) : (<div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl text-xs md:text-sm flex items-start gap-2"><Shield size={16} className="shrink-0 mt-0.5"/><span>No hay problema, conocerá a su especialista en su cita.</span></div>)}
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><MessageSquare size={16} className="text-rose-500"/> Tipo de Cita</h3>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            <button onClick={() => setCallType('video')} disabled={status !== 'idle'} className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative ${callType === 'video' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}><div className="absolute -top-2.5 md:-top-3 bg-green-600 text-white text-[8px] md:text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm uppercase tracking-wider">Recomendado</div><Video size={20} className={`md:w-6 md:h-6 ${callType === 'video' ? 'text-green-600' : 'text-gray-400'}`}/><span className="text-xs md:text-sm font-bold text-center leading-tight">Videollamada<br/><span className="text-[10px] md:text-xs font-normal">(WhatsApp)</span></span></button>
                            <button onClick={() => setCallType('call')} disabled={status !== 'idle'} className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${callType === 'call' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}><Phone size={20} className={`md:w-6 md:h-6 ${callType === 'call' ? 'text-blue-600' : 'text-gray-400'}`}/><span className="text-xs md:text-sm font-bold">Llamada</span></button>
                        </div>
                        {callType === 'video' && <p className="text-[11px] md:text-xs text-green-700 bg-green-50 p-2 md:p-3 rounded-lg text-center border border-green-100">✨ Podrá conocer a su asesor cara a cara y ver los detalles en pantalla.</p>}
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><Calendar size={16} className="text-rose-500"/> Fecha y Hora</h3>
                        <div className="flex flex-col gap-4">
                            {/* AQUÍ ESTÁ EL CAMBIO: min={minDate} restringe para que solo se pueda desde mañana */}
                            <div><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 mb-1.5 block tracking-wider">Seleccione el Día</label><input type="date" min={minDate} className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium outline-none focus:bg-white focus:ring-2 focus:ring-rose-500" value={date} onChange={e => setDate(e.target.value)} disabled={status !== 'idle'} /></div>
                            {date && (
                                <div className="animate-fade-in"><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 mb-1.5 block tracking-wider">Horarios Disponibles</label>{availableSlots.length > 0 ? (<div className="grid grid-cols-2 md:grid-cols-3 gap-2">{availableSlots.map(slot => (<button key={slot} onClick={() => setTime(slot)} disabled={status !== 'idle'} className={`py-2.5 md:py-3 px-2 text-xs md:text-sm rounded-lg border transition-colors ${time === slot ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'}`}>{slot}</button>))}</div>) : (<div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300"><p className="text-xs md:text-sm text-gray-500">Lo sentimos, no hay cupos disponibles o está cerrado este día.</p></div>)}</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="pt-6 pb-8">
                        <button onClick={handleFinalSubmit} disabled={!isFormValid || status !== 'idle'} className={`w-full py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-xl disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 md:gap-3 hover:scale-[1.02] ${status === 'success' ? 'bg-green-600 text-white cursor-default' : 'bg-[#E11D48] text-white'}`}>{status === 'submitting' ? (<>Enviando... <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full"></div></>) : (<>Confirmar Cita <Check className="inline" size={20} strokeWidth={3} /></>)}</button>
                        {status === 'idle' && <p className="text-center text-[10px] md:text-xs text-gray-400 mt-4 px-2 md:px-4 leading-relaxed">Cuando sea asignado un especialista le notificaremos por correo electrónico si lo proporcionó.</p>}
                    </div>
                </>
                )}
            </div>
        </div>
    );
};

const AgentSelectionModal = ({ agents, onClose, onSelect }) => {
    const [search, setSearch] = useState('');
    const filteredAgents = agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || (a.email && a.email.toLowerCase().includes(search.toLowerCase())));

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-fade-in">
            <div className="glass-card bg-white/95 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[85vh] animate-slide-up relative">
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">Asignar Agente</h3>
                        <p className="text-xs text-gray-500">Selecciona a un miembro del equipo</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18}/></button>
                </div>
                <div className="mb-4 relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={16}/>
                    <input type="text" placeholder="Buscar por nombre o correo..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all text-sm" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                    <button onClick={() => onSelect('')} className="w-full text-left p-3.5 hover:bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-medium transition-colors mb-2">
                        <span className="flex items-center gap-2"><MinusCircle size={16}/> Quitar Asignación actual</span>
                    </button>
                    {filteredAgents.map(agent => (
                        <button key={agent.id} onClick={() => onSelect(agent.id)} className="w-full flex items-center gap-4 p-3 hover:bg-rose-50/50 rounded-xl border border-transparent hover:border-rose-100 transition-all text-left group">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-white text-rose-600 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-rose-50 font-bold">
                                {agent.photo ? <img src={agent.photo} className="w-full h-full object-cover"/> : agent.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 group-hover:text-rose-700 transition-colors truncate">{agent.name}</p>
                                <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                            </div>
                        </button>
                    ))}
                    {filteredAgents.length === 0 && <div className="text-center py-8 text-gray-400"><p className="text-sm font-medium">No se encontraron agentes</p><p className="text-xs mt-1">Prueba con otra búsqueda</p></div>}
                </div>
            </div>
        </div>
    );
};

const AgentModal = ({ agent, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', license: '', email: '', phone: '', bio: '', photo: '' });
    useEffect(() => { if (agent) setFormData(agent); else setFormData({ name: '', license: '', email: '', phone: '', bio: '', photo: '' }); }, [agent]);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handlePhotoChange = (e) => { const file = e.target.files[0]; if (file) { if (file.size > 1048576) { alert("La imagen es muy pesada. Máximo 1MB."); return; } const reader = new FileReader(); reader.onloadend = () => setFormData(prev => ({...prev, photo: reader.result})); reader.readAsDataURL(file); }};
    const handleSubmit = (e) => { e.preventDefault(); onSave({ ...formData, timestamp: agent ? agent.timestamp : Date.now() }); };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-fade-in">
            <div className="glass-card bg-white/95 rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18}/></button>
                <div className="mb-6 pr-10">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{agent ? 'Editar Agente' : 'Nuevo Agente'}</h3>
                    <p className="text-sm text-gray-500 mt-1">Completa el perfil profesional</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden mb-3 border-2 border-dashed border-gray-300 relative group shadow-sm">
                            {formData.photo ? <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" /> : <User size={32} className="text-gray-300"/>}
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-xs font-bold backdrop-blur-sm">
                                Cambiar<input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        </div>
                        <label className="text-rose-600 text-sm font-bold cursor-pointer hover:text-rose-700 transition-colors bg-rose-50 px-4 py-1.5 rounded-full">
                            {formData.photo ? 'Actualizar Foto' : 'Subir Foto'}
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                        <div className="w-full mt-4 border-t border-gray-200 pt-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">O usar un enlace web (URL)</label>
                            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition-all">
                                <div className="pl-3 text-gray-400"><LinkIcon size={14}/></div>
                                <input type="text" name="photo" value={formData.photo && formData.photo.startsWith('data:') ? '' : formData.photo} onChange={handleChange} placeholder="https://..." className="w-full text-sm outline-none px-2 py-2.5 bg-transparent"/>
                            </div>
                            {formData.photo && formData.photo.startsWith('data:') && <p className="text-[10px] text-green-600 mt-1.5 font-medium flex items-center gap-1"><Check size={10}/> Imagen local cargada</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label><input name="name" required value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm font-medium" placeholder="Ej. Juan Pérez" /></div>
                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Licencia / ID</label><input name="license" value={formData.license} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm font-medium" placeholder="Ej. LIC-123456" /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm font-medium" placeholder="correo@..." /></div>
                            <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Teléfono</label><input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm font-medium" placeholder="555..." /></div>
                        </div>
                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Bio Breve</label><textarea name="bio" rows="2" value={formData.bio} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm resize-none" placeholder="Especialista en..." /></div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform">{agent ? 'Guardar Cambios' : 'Crear Agente'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ScheduleSettings = ({ schedule, onUpdate }) => {
    const toggleDay = (dayIndex) => { const newWeekly = {...schedule.weekly}; newWeekly[dayIndex].active = !newWeekly[dayIndex].active; onUpdate({...schedule, weekly: newWeekly}); };
    const updateBlock = (dayIndex, blockIndex, field, value) => { const newWeekly = {...schedule.weekly}; newWeekly[dayIndex].blocks[blockIndex][field] = value; onUpdate({...schedule, weekly: newWeekly}); };
    const addBlock = (dayIndex) => { const newWeekly = {...schedule.weekly}; newWeekly[dayIndex].blocks.push({ start: '12:00', end: '13:00' }); onUpdate({...schedule, weekly: newWeekly}); };
    const removeBlock = (dayIndex, blockIndex) => { const newWeekly = {...schedule.weekly}; newWeekly[dayIndex].blocks.splice(blockIndex, 1); onUpdate({...schedule, weekly: newWeekly}); };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10 px-0 md:px-6">
            <div className="bg-white p-5 md:p-8 rounded-none md:rounded-3xl shadow-soft border-y md:border border-gray-100">
                <div className="mb-6 md:mb-8">
                    <h3 className="font-bold text-xl md:text-2xl text-gray-900 flex items-center gap-3 tracking-tight"><CalendarDays size={24} className="text-rose-500"/> Horario Base Semanal</h3>
                    <p className="text-gray-500 text-sm mt-1 ml-9">Configura la disponibilidad general de tu equipo.</p>
                </div>
                <div className="space-y-4">
                    {DAYS_MAP.map((day, idx) => (
                        <div key={idx} className={`p-4 md:p-5 rounded-2xl border transition-all ${schedule.weekly[idx].active ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-transparent opacity-70'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => toggleDay(idx)} className={`w-12 h-7 rounded-full p-1 transition-colors relative shadow-inner ${schedule.weekly[idx].active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 absolute top-1 left-1 ${schedule.weekly[idx].active ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </button>
                                    <span className={`font-bold text-base md:text-lg ${schedule.weekly[idx].active ? 'text-gray-900' : 'text-gray-500'}`}>{day}</span>
                                </div>
                                
                                {schedule.weekly[idx].active ? (
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto pl-16 md:pl-0">
                                        <div className="space-y-2 w-full md:w-auto">
                                            {schedule.weekly[idx].blocks.map((block, bIdx) => (
                                                <div key={bIdx} className="flex items-center gap-2 w-full">
                                                    <input type="time" value={block.start} onChange={e => updateBlock(idx, bIdx, 'start', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 outline-none flex-1 md:w-32 transition-colors font-medium"/>
                                                    <span className="text-gray-400 font-bold">-</span>
                                                    <input type="time" value={block.end} onChange={e => updateBlock(idx, bIdx, 'end', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:border-blue-500 outline-none flex-1 md:w-32 transition-colors font-medium"/>
                                                    {schedule.weekly[idx].blocks.length > 1 && (<button onClick={() => removeBlock(idx, bIdx)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg transition-colors ml-1"><MinusCircle size={16}/></button>)}
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => addBlock(idx)} className="text-xs bg-blue-50 text-blue-700 px-3 py-2.5 rounded-lg hover:bg-blue-100 font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 mt-2 md:mt-0 w-full md:w-auto">
                                            <Plus size={14} strokeWidth={3}/> Rango
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400 italic font-medium pl-16 md:pl-0">Día inactivo (Cerrado)</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- TIMEZONE HELPERS (MOTOR DE ZONA HORARIA) ---
const STATE_TIMEZONES = {
    "Arizona": "America/Phoenix", "California": "America/Los_Angeles", "Colorado": "America/Denver",
    "Florida": "America/New_York", "Hawaii": "Pacific/Honolulu", "Idaho": "America/Boise",
    "Illinois": "America/Chicago", "Montana": "America/Denver", "Nevada": "America/Los_Angeles",
    "New Mexico": "America/Denver", "Oregon": "America/Los_Angeles", "Texas": "America/Chicago",
    "Utah": "America/Denver", "Virginia": "America/New_York", "Wisconsin": "America/Chicago"
};

const getLocalTimeInfo = (dateString, timeString, stateName) => {
    if (!dateString || !timeString || !stateName || !STATE_TIMEZONES[stateName]) return timeString;
    try {
        const tz = STATE_TIMEZONES[stateName];
        let match = timeString.match(/(\d+):(\d+)\s*(a\.m\.|p\.m\.|am|pm)/i);
        if (!match) return timeString;
        let h = parseInt(match[1]);
        const m = match[2];
        const mod = match[3].toLowerCase();
        if (mod.includes('p') && h < 12) h += 12;
        if (mod.includes('a') && h === 12) h = 0;
        
        // Calculamos la diferencia entre el navegador de Jorge y el Estado del Prospecto
        const d = new Date(`${dateString}T${String(h).padStart(2, '0')}:${m}:00`);
        const targetHour = parseInt(d.toLocaleString('en-US', { timeZone: tz, hour: 'numeric', hour12: false }));
        const localHour = parseInt(d.toLocaleString('en-US', { hour: 'numeric', hour12: false }));
        
        let diff = localHour - targetHour;
        if (diff > 12) diff -= 24;
        if (diff < -12) diff += 24;
        
        if (diff === 0) return timeString; // Es la misma zona horaria
        
        const localDate = new Date(d.getTime() + diff * 60 * 60 * 1000);
        return localDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace('am', 'a.m.').replace('pm', 'p.m.');
    } catch (e) {
        return timeString;
    }
};

const LeadDetail = ({ lead, onClose, onUpdate, agents, onDelete }) => {
    const [currentNotes, setCurrentNotes] = useState(lead.notes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    const notesEndRef = useRef(null);
    
    const handleSaveNotes = async () => { 
        setIsSaving(true);
        await onUpdate(lead.id, { notes: currentNotes }); 
        setTimeout(() => setIsSaving(false), 2000);
    };
    
    const currentAgent = agents.find(a => a.id === lead.assignedTo);
    const handleDelete = () => { if(window.confirm('⚠️ ¿Estás seguro de eliminar este prospecto permanentemente? Esta acción no se puede deshacer.')) { onDelete(lead.id); onClose(); }};

    return (
        <div className="fixed inset-0 bg-apple-gray z-[60] flex flex-col animate-slide-up">
            <div className="glass-panel px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 pr-2">
                    <button onClick={onClose} className="p-2 md:p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shrink-0 shadow-sm"><ArrowLeft size={20} className="text-gray-700"/></button>
                    <div className="truncate">
                        <h2 className="font-bold text-lg md:text-xl text-gray-900 truncate tracking-tight">{lead.name}</h2>
                        <span className="text-xs md:text-sm text-gray-500 font-medium tracking-wide truncate block">{lead.phone}</span>
                    </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-2">
                     <a href={`https://wa.me/1${lead.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="p-2.5 md:p-3 text-gray-500 hover:text-[#25D366] hover:border-[#25D366] bg-white shadow-sm hover:shadow-md rounded-xl transition-all border border-gray-100 flex items-center justify-center" title="Abrir WhatsApp">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                     </a>
                     <a href={`mailto:${lead.email}`} className="p-2.5 md:p-3 text-gray-500 hover:text-blue-600 hover:border-blue-300 bg-white shadow-sm hover:shadow-md rounded-xl transition-all border border-gray-100 flex items-center justify-center" title="Enviar Correo"><Mail size={18}/></a>
                     <a href={`tel:${lead.phone}`} className="p-2.5 md:p-3 text-gray-500 hover:text-green-600 hover:border-green-300 bg-white shadow-sm hover:shadow-md rounded-xl transition-all border border-gray-100 flex items-center justify-center" title="Llamar"><Phone size={18}/></a>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-12">
                <div className="grid md:grid-cols-12 gap-6 max-w-6xl mx-auto h-full">
                    
                    <div className="md:col-span-5 space-y-6">
                        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-widest"><User size={16} className="text-rose-500"/> Ficha Técnica</h3>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-gray-50 rounded-2xl p-3 md:p-4 border border-gray-100/50">
                                    <div className="border-b border-gray-200/60 md:border-0 pb-2 md:pb-0"><span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Estado</span><p className="font-semibold text-gray-800 text-sm flex items-center gap-1.5"><MapPin size={12} className="text-gray-400"/> {lead.state || 'N/A'}</p></div>
                                    <div className="pt-1 md:pt-0"><span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Cita Solicitada</span>
                                        <div className="font-semibold text-gray-800 text-sm flex flex-col leading-tight mt-1">
                                            <span>{lead.date ? new Date(lead.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                                            <span className="text-gray-500 mt-1">{lead.time} <span className="text-[10px] font-normal uppercase">(Hora de {lead.state})</span></span>
                                            {lead.localTime && lead.localTime !== lead.time && (
                                                <span className="text-rose-600 font-bold mt-1.5 flex items-center gap-1 bg-rose-50 w-fit px-2 py-1 rounded-md text-[11px] shadow-sm">
                                                    <Clock size={12}/> Tu hora local: {lead.localTime}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-1">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Correo Electrónico</span>
                                    <p className="font-medium text-gray-800 break-all text-sm">{lead.email}</p>
                                </div>
                                <div className="px-1">
                                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Método Preferido</span>
                                     {lead.callType === 'video' ? (
                                         <a href={`https://wa.me/1${lead.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-200 transition-all text-xs font-bold border border-green-100/50 shadow-sm cursor-pointer" title="Iniciar Videollamada por WhatsApp"><Video size={14}/> Videollamada (WhatsApp)</a>
                                     ) : (
                                         <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-200 transition-all text-xs font-bold border border-blue-100/50 shadow-sm cursor-pointer" title="Llamar ahora"><Phone size={14}/> Llamada Telefónica</a>
                                     )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-widest"><ShieldCheck size={16} className="text-rose-500"/> Perfil de Interés</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-3 px-1">
                                    <span className="text-sm text-gray-500 font-medium">Cobertura para</span>
                                    <span className="font-bold text-gray-900 text-sm text-right">{getLabelsForArray('policy_for', lead.policy_for)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 pb-3 px-1">
                                    <span className="text-sm text-gray-500 font-medium">Monto estimado</span>
                                    <span className="font-bold text-green-600 text-sm bg-green-50 px-2 py-0.5 rounded">{getLabelForValue('coverage_amount', lead.coverage_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-50 pb-3 px-1">
                                    <span className="text-sm text-gray-500 font-medium">Presupuesto mensual</span>
                                    <span className="font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">{getLabelForValue('budget', lead.budget) || 'Pendiente'}</span>
                                </div>
                                <div className="px-1 pt-1">
                                    <span className="text-sm text-gray-500 font-medium block mb-2">Principales Motivaciones</span>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(lead.motivation) && lead.motivation.map(m => (<span key={m} className="px-2.5 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs font-bold shadow-sm">{getLabelForValue('motivation', m)}</span>))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="md:col-span-7 space-y-6 flex flex-col">
                        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100 shrink-0">
                            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-widest"><Briefcase size={16} className="text-rose-500"/> Estado y Asignación</h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Agente Responsable</label>
                                    <button onClick={() => setShowAgentSelector(true)} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between hover:border-rose-300 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {currentAgent ? (<><div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-white text-rose-600 flex items-center justify-center text-sm font-bold overflow-hidden shadow-sm border border-rose-100 shrink-0">{currentAgent.photo ? <img src={currentAgent.photo} className="w-full h-full object-cover"/> : currentAgent.name.charAt(0)}</div><div className="text-left truncate"><span className="font-bold text-gray-900 block group-hover:text-rose-700 transition-colors truncate">{currentAgent.name}</span><span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Reasignar</span></div></>) : (<div className="flex items-center gap-2 text-gray-400 font-medium"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 shrink-0"><UserPlus size={16}/></div><span className="italic text-sm">Seleccionar Agente...</span></div>)}
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-rose-500 transition-colors shrink-0 ml-2"/>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 md:flex md:flex-col md:w-32 shrink-0 pt-4 md:pt-0 mt-4 md:mt-0 border-t border-gray-100 md:border-0">
                                    <button onClick={() => onUpdate(lead.id, { status: lead.status === 'archived' ? 'new' : 'archived' })} className={`flex-1 md:flex-none py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${lead.status === 'archived' ? 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
                                        {lead.status === 'archived' ? <><RotateCcw size={14}/> Restaurar</> : <><Archive size={14}/> Archivar</>}
                                    </button>
                                    <button onClick={handleDelete} className="flex-1 md:flex-none py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-sm"><Trash2 size={14}/> Eliminar</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col flex-1 min-h-[300px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-widest"><PenTool size={16} className="text-rose-500"/> Bloc de Notas</h3>
                                <button onClick={handleSaveNotes} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${isSaving ? 'bg-green-500 text-white' : 'bg-black text-white hover:scale-105'}`}>
                                    {isSaving ? <><Check size={14}/> Guardado</> : <><Save size={14}/> Guardar</>}
                                </button>
                            </div>
                            <textarea className="flex-1 w-full bg-amber-50/30 rounded-2xl p-4 text-sm text-gray-800 border border-amber-100/50 shadow-inner resize-none outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all leading-relaxed" placeholder="Escribe aquí los detalles de la llamada, acuerdos o recordatorios del prospecto..." value={currentNotes} onChange={(e) => setCurrentNotes(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            {showAgentSelector && (<AgentSelectionModal agents={agents} onClose={() => setShowAgentSelector(false)} onSelect={(agentId) => { onUpdate(lead.id, { assignedTo: agentId }); setShowAgentSelector(false); }}/>)}
        </div>
    );
};

const AgentDetailView = ({ agent, leads, onClose, onLeadClick }) => {
    const assignedLeads = leads.filter(l => l.assignedTo === agent.id);
    return (
        <div className="fixed inset-0 bg-apple-gray z-[60] flex flex-col animate-slide-up">
            <div className="glass-panel px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-4 md:gap-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 md:p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shrink-0 shadow-sm"><ArrowLeft size={20} className="text-gray-700"/></button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-rose-100 to-white text-rose-600 flex items-center justify-center overflow-hidden shadow-sm border border-rose-50 text-lg font-bold shrink-0">
                            {agent.photo ? <img src={agent.photo} className="w-full h-full object-cover"/> : agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg md:text-xl text-gray-900 tracking-tight leading-tight">{agent.name}</h2>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-rose-600 mt-0.5">{agent.license || 'Agente'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 pl-14 md:pl-0">
                    {agent.email && <a href={`mailto:${agent.email}`} className="text-[10px] md:text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:text-blue-600 transition-colors shadow-sm"><Mail size={12}/> Correo</a>}
                    {agent.phone && <a href={`tel:${agent.phone}`} className="text-[10px] md:text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:text-green-600 transition-colors shadow-sm"><Phone size={12}/> Llamar</a>}
                </div>
            </div>
            
            <div className="p-4 md:p-8 flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    {agent.bio && (
                        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sobre el Agente</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{agent.bio}</p>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2"><Briefcase size={16} className="text-gray-400"/> Carteras Asignadas</h3>
                            <span className="bg-black text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md">{assignedLeads.length}</span>
                        </div>
                        
                        {assignedLeads.length > 0 ? (
                            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                {assignedLeads.map(lead => (
                                    <div key={lead.id} onClick={() => onLeadClick(lead)} className="p-4 md:p-5 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className={`w-2 h-10 rounded-full ${lead.status === 'new' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-rose-600 transition-colors">{lead.name}</h4>
                                                
                                                {/* Aquí está el bloque de la fecha humanizada ya integrado de forma segura */}
                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] md:text-xs text-gray-500 font-medium">
                                                    <span className="capitalize">
                                                        {lead.date ? new Date(lead.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha'}
                                                    </span>
                                                    <span className="hidden md:inline w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                        {lead.localTime || lead.time}
                                                    </span>
                                                </div>
                                                
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 md:gap-4 shrink-0">
                                            <span className={`hidden md:inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${lead.status === 'new' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                                                {lead.status === 'new' ? 'Activo' : 'Archivado'}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-rose-300 group-hover:text-rose-500 transition-all shadow-sm"><ChevronRight size={16} /></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400 shadow-sm">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Briefcase size={24} className="opacity-30"/></div>
                                <p className="font-medium text-gray-600">Bandeja Vacía</p>
                                <p className="text-xs mt-1">Este agente no tiene prospectos en este momento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminCalendar = ({ leads, onLeadClick, onOpenSettings }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); 

    const prev = () => {
        const newDate = new Date(currentDate);
        if(view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        if(view === 'week') newDate.setDate(newDate.getDate() - 7);
        if(view === 'day') newDate.setDate(newDate.getDate() - 1);
        if(view === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
        setCurrentDate(newDate);
    };
    const next = () => {
        const newDate = new Date(currentDate);
        if(view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        if(view === 'week') newDate.setDate(newDate.getDate() + 7);
        if(view === 'day') newDate.setDate(newDate.getDate() + 1);
        if(view === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
        setCurrentDate(newDate);
    };
    const today = () => setCurrentDate(new Date());

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const getLeadsForDate = (dateStr) => leads.filter(l => l.date === dateStr && l.status !== 'archived').sort((a, b) => (a.localTime || a.time).localeCompare(b.localTime || b.time));
    const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const renderMonth = () => {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));

        return (
            <div className="flex-1 flex flex-col h-full bg-gray-50/30">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-white shrink-0">
                    {dayNames.map(day => <div key={day} className="py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{day}</div>)}
                </div>
                <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                    {days.map((dateObj, index) => {
                        if (!dateObj) return <div key={`empty-${index}`} className="border-b border-r border-gray-100 bg-gray-50/50 min-h-[80px] md:min-h-[100px]"></div>;
                        const dateString = formatDate(dateObj);
                        const dayLeads = getLeadsForDate(dateString);
                        const isToday = formatDate(new Date()) === dateString;

                        return (
                            <div key={index} onClick={() => { setView('day'); setCurrentDate(dateObj); }} className={`border-b border-r border-gray-100 min-h-[80px] md:min-h-[100px] p-1 md:p-2 flex flex-col transition-colors hover:bg-gray-100 cursor-pointer ${isToday ? 'bg-rose-50/30' : 'bg-white'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold w-5 h-5 md:w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500'}`}>{dateObj.getDate()}</span>
                                    {dayLeads.length > 0 && <span className="hidden md:inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold text-white bg-blue-500 rounded-full shadow-sm">{dayLeads.length}</span>}
                                    {dayLeads.length > 0 && <span className="md:hidden w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>}
                                </div>
                                <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
                                    {dayLeads.slice(0, 3).map(lead => (
                                        <div key={lead.id} onClick={(e) => { e.stopPropagation(); onLeadClick(lead); }} className="bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 p-1.5 rounded-md cursor-pointer transition-colors shadow-sm hidden md:block">
                                            <div className="font-bold text-[9px] truncate">{lead.localTime || lead.time}</div>
                                            <div className="text-[9px] truncate opacity-80">{lead.name.split(' ')[0]}</div>
                                        </div>
                                    ))}
                                    {dayLeads.length > 3 && <div className="text-[9px] text-gray-400 font-bold text-center hidden md:block">+{dayLeads.length - 3} más</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeek = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const weekDays = [];
        for(let i=0; i<7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            weekDays.push(d);
        }

        return (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/30">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-white shrink-0">
                    {weekDays.map((dateObj, i) => {
                        const isToday = formatDate(new Date()) === formatDate(dateObj);
                        return (
                            <div key={i} className={`py-2 text-center border-r border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-rose-50/30' : ''}`} onClick={() => { setView('day'); setCurrentDate(dateObj); }}>
                                <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{dayNames[dateObj.getDay()]}</span>
                                <span className={`text-sm md:text-lg font-bold mt-0.5 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-800'}`}>{dateObj.getDate()}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex-1 grid grid-cols-7 overflow-y-auto">
                    {weekDays.map((dateObj, i) => {
                        const dateString = formatDate(dateObj);
                        const dayLeads = getLeadsForDate(dateString);
                        return (
                            <div key={i} className="border-r border-gray-100 p-1.5 md:p-2 flex flex-col gap-2 min-h-[300px] bg-white">
                                {dayLeads.map(lead => (
                                    <div key={lead.id} onClick={() => onLeadClick(lead)} className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                                        <div className="font-bold text-[10px] md:text-xs text-blue-600 mb-1 flex items-center gap-1"><Clock size={10}/> {lead.localTime || lead.time}</div>
                                        <div className="font-bold text-[11px] md:text-sm text-gray-900 leading-tight group-hover:text-rose-600 transition-colors truncate">{lead.name.split(' ')[0]}</div>
                                    </div>
                                ))}
                                {dayLeads.length === 0 && <div className="text-center text-gray-300 text-[9px] uppercase font-bold tracking-widest mt-4 rotate-90 md:rotate-0 origin-left ml-2 md:ml-0">Libre</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDay = () => {
        const dateString = formatDate(currentDate);
        const dayLeads = getLeadsForDate(dateString);
        const isToday = formatDate(new Date()) === dateString;

        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
                <div className="max-w-3xl mx-auto">
                    <div className={`mb-6 p-6 rounded-3xl border flex items-center justify-between ${isToday ? 'bg-rose-500 text-white shadow-lg border-rose-600' : 'bg-white text-gray-900 shadow-sm border-gray-200'}`}>
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold">{dayNames[currentDate.getDay()]}, {currentDate.getDate()} de {monthNames[currentDate.getMonth()]}</h3>
                            <p className={`text-sm font-medium mt-1 ${isToday ? 'text-rose-100' : 'text-gray-500'}`}>{dayLeads.length} citas programadas para este día</p>
                        </div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${isToday ? 'border-rose-400 bg-rose-600' : 'border-gray-50 bg-gray-100'}`}>
                            <CalendarDays size={28} className={isToday ? 'text-white' : 'text-gray-400'}/>
                        </div>
                    </div>
                    
                    <div className="space-y-3 md:space-y-4">
                        {dayLeads.length === 0 ? (
                            <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300">
                                <CalendarDays size={32} className="mx-auto text-gray-300 mb-3"/>
                                <p className="text-gray-400 font-bold text-sm md:text-base">No hay citas agendadas.</p>
                                <p className="text-gray-400 text-xs mt-1">Día libre para prospección u otras tareas.</p>
                            </div>
                        ) : (
                            dayLeads.map(lead => (
                                <div key={lead.id} onClick={() => onLeadClick(lead)} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center gap-4 group">
                                    <div className="w-20 md:w-24 text-center shrink-0 border-r border-gray-100 pr-4">
                                        <span className="block font-bold text-sm md:text-base text-blue-600">{lead.localTime || lead.time}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 pl-2">
                                        <h4 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-rose-600 transition-colors truncate">{lead.name}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1"><Phone size={12}/> {lead.phone}</span>
                                            {lead.state && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">{lead.state}</span>}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0 border border-gray-100">
                                        <ChevronRight size={18}/>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderYear = () => {
        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {monthNames.map((month, index) => {
                        const monthLeads = leads.filter(l => {
                            if(l.status === 'archived' || !l.date) return false;
                            const d = new Date(l.date + 'T00:00:00');
                            return d.getMonth() === index && d.getFullYear() === currentDate.getFullYear();
                        });
                        const isCurrentMonth = new Date().getMonth() === index && new Date().getFullYear() === currentDate.getFullYear();

                        return (
                            <div key={month} onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), index, 1)); setView('month'); }} className={`bg-white p-4 rounded-3xl border shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 aspect-square ${isCurrentMonth ? 'border-rose-300 ring-4 ring-rose-50/50' : 'border-gray-200'}`}>
                                <h3 className={`font-bold text-lg md:text-xl capitalize ${isCurrentMonth ? 'text-rose-600' : 'text-gray-800'}`}>{month}</h3>
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-lg font-bold text-gray-900 shadow-inner">
                                    {monthLeads.length}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Citas</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto bg-white rounded-none md:rounded-3xl shadow-none md:shadow-soft border-0 md:border border-gray-100 flex flex-col h-[calc(100vh-140px)] md:h-[800px] animate-fade-in overflow-hidden relative z-10">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between bg-white z-20 gap-4 md:gap-0 shrink-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-black text-white p-2.5 rounded-xl shadow-md"><CalendarDays size={20}/></div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-gray-900 capitalize leading-tight">
                                {view === 'year' ? currentDate.getFullYear() : 
                                 view === 'month' || view === 'week' ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` : 
                                 `${dayNames[currentDate.getDay()]} ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`}
                            </h2>
                            <p className="text-[10px] md:text-xs text-gray-500 font-bold tracking-widest uppercase">CRM Agenda</p>
                        </div>
                    </div>
                    
                    <div className="flex md:hidden bg-gray-100 border border-gray-200 rounded-xl shadow-inner overflow-hidden">
                        <button onClick={prev} className="p-2 text-gray-600 hover:bg-gray-200 transition-colors border-r border-gray-200"><ArrowLeft size={16}/></button>
                        <button onClick={today} className="p-2 px-3 text-[10px] font-bold text-gray-700 uppercase tracking-widest hover:bg-gray-200 transition-colors border-r border-gray-200">Hoy</button>
                        <button onClick={next} className="p-2 text-gray-600 hover:bg-gray-200 transition-colors"><ArrowRight size={16}/></button>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner shrink-0">
                        {['day', 'week', 'month', 'year'].map(v => (
                            <button key={v} onClick={() => setView(v)} className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs font-bold capitalize transition-all ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : v === 'month' ? 'Mes' : 'Año'}
                            </button>
                        ))}
                    </div>
                    
                    <div className="hidden md:flex bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden shrink-0">
                        <button onClick={prev} className="p-2 px-3 hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-200"><ArrowLeft size={16}/></button>
                        <button onClick={today} className="p-2 px-4 text-xs font-bold text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition-colors border-r border-gray-200">Hoy</button>
                        <button onClick={next} className="p-2 px-3 hover:bg-gray-50 text-gray-600 transition-colors"><ArrowRight size={16}/></button>
                    </div>
                    
                    <button onClick={onOpenSettings} className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 hover:text-rose-600 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"><Settings size={14}/> Horarios</button>
                </div>
            </div>

            {view === 'month' && renderMonth()}
            {view === 'week' && renderWeek()}
            {view === 'day' && renderDay()}
            {view === 'year' && renderYear()}

            <div className="lg:hidden p-3 border-t border-gray-200 bg-white shrink-0">
                <button onClick={onOpenSettings} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"><Settings size={14}/> Configurar Horas Disponibles</button>
            </div>
        </div>
    );
};

const AdminDashboard = ({ leads, agents, schedule, onUpdateLead, bulkUpdateLeads, bulkDeleteLeads, onDeleteLead, onSaveAgent, onDeleteAgent, onUpdateSchedule, onClose, onLogout }) => {
    const [activeTab, setActiveTab] = useState('active'); 
    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [viewingLead, setViewingLead] = useState(null);
    const [viewingAgent, setViewingAgent] = useState(null);
    const [isBulkAgentSelectOpen, setIsBulkAgentSelectOpen] = useState(false);
    const [individualAgentSelectLeadId, setIndividualAgentSelectLeadId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showScheduleSettings, setShowScheduleSettings] = useState(false);

    // MÁGIA: Agregamos la hora convertida a cada lead procesado
    const processedLeads = leads.map(l => ({
        ...l,
        localTime: getLocalTimeInfo(l.date, l.time, l.state)
    }));

    const getFilteredLeads = () => {
        let list = [];
        if(activeTab === 'active') list = processedLeads.filter(l => l.status !== 'archived' && !l.assignedTo);
        else if(activeTab === 'assigned') list = processedLeads.filter(l => l.status !== 'archived' && l.assignedTo);
        else if(activeTab === 'archived') list = processedLeads.filter(l => l.status === 'archived');
        
        if(searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(l => l.name.toLowerCase().includes(lower) || l.phone.includes(lower) || (l.email && l.email.toLowerCase().includes(lower)) || (l.state && l.state.toLowerCase().includes(lower)));
        }
        return list;
    };

    const getFilteredAgents = () => {
        let list = agents;
        if(searchTerm) { const lower = searchTerm.toLowerCase(); list = list.filter(a => a.name.toLowerCase().includes(lower) || (a.email && a.email.toLowerCase().includes(lower))); }
        return list;
    };

    const filteredLeads = activeTab !== 'agents' && activeTab !== 'schedule' ? getFilteredLeads() : [];
    const sortedLeads = [...filteredLeads].sort((a,b) => b.timestamp - a.timestamp);
    const displayAgents = getFilteredAgents();

    const toggleSelectAll = () => { if (selectedLeads.length === sortedLeads.length && sortedLeads.length > 0) setSelectedLeads([]); else setSelectedLeads(sortedLeads.map(l => l.id)); };
    const toggleSelect = (id) => { setSelectedLeads(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };

    const handleBulkAction = async (action, value) => {
        if(!window.confirm(`⚠️ CONFIRMACIÓN\n\n¿Deseas aplicar esta acción a ${selectedLeads.length} prospectos?`)) return;
        if(action === 'delete') await bulkDeleteLeads(selectedLeads);
        else if(action === 'archive') await bulkUpdateLeads(selectedLeads, { status: 'archived' });
        else if(action === 'restore') await bulkUpdateLeads(selectedLeads, { status: 'new' });
        else if(action === 'assign') await bulkUpdateLeads(selectedLeads, { assignedTo: value });
        setSelectedLeads([]);
    };

    const handleDeleteLead = (e, id) => { e.stopPropagation(); if (window.confirm('⚠️ ADVERTENCIA\n\n¿Eliminar prospecto permanentemente?')) onDeleteLead(id); };
    const handleDeleteAgent = (e, id) => { e.stopPropagation(); if(window.confirm('⚠️ ADVERTENCIA\n\n¿Eliminar agente? Se perderá la asignación de sus leads.')) onDeleteAgent(id); };

    const handleSaveAgent = async (agentData) => {
        await onSaveAgent(agentData);
        setIsAgentModalOpen(false);
        setEditingAgent(null);
    };

    return (
        <div className="fixed inset-0 bg-apple-gray z-50 flex flex-col animate-fade-in font-sans">
            <div className="glass-panel px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center z-20 gap-3 shadow-sm">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-black text-white p-2 rounded-xl shadow-md"><ShieldCheck size={20} /></div>
                        <div className="leading-tight">
                            <h2 className="font-bold text-gray-900 text-base md:text-lg tracking-tight">Admin<span className="font-light">Panel</span></h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seguros</p>
                        </div>
                    </div>
                    {/* Botón Salir Móvil */}
                    <div className="flex md:hidden">
                        <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors bg-white border border-gray-200 rounded-full shadow-sm" title="Cerrar Sesión"><LogOut size={16}/></button>
                    </div>
                </div>
                
                {activeTab !== 'schedule' && (
                    <div className="relative w-full md:w-[400px] group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={16}/>
                        <input 
                            type="text" 
                            placeholder={`Buscar ${activeTab === 'agents' ? 'agente' : 'prospecto'}...`} 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 rounded-2xl outline-none transition-all text-sm font-medium shadow-inner focus:shadow-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
                
                {/* Botón Salir Desktop */}
                <div className="hidden md:flex">
                     <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 rounded-xl hover:bg-red-50 transition-all shadow-sm"><LogOut size={16}/> Cerrar Sesión</button>
                </div>
            </div>

            <div className="flex px-2 md:px-8 gap-2 md:gap-8 border-b border-gray-200 bg-white/80 backdrop-blur-md overflow-x-auto z-10 scrollbar-hide shrink-0 pt-2 pb-0">
                {['active', 'assigned', 'archived', 'agents', 'schedule'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => {setActiveTab(tab); setSelectedLeads([]); setSearchTerm(''); setShowScheduleSettings(false);}} 
                        className={`py-3 px-3 md:px-1 text-xs md:text-sm font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${activeTab === tab ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
                    >
                        {tab === 'active' && 'Bandeja'}
                        {tab === 'assigned' && 'Asignados'}
                        {tab === 'archived' && 'Archivados'}
                        {tab === 'agents' && 'Equipo'}
                        {tab === 'schedule' && 'Agenda'}
                    </button>
                ))}
            </div>

            {selectedLeads.length > 0 && activeTab !== 'agents' && activeTab !== 'schedule' && (
                
                <div className="fixed bottom-4 md:bottom-8 left-0 w-full flex justify-center px-4 z-[100] pointer-events-none">
                    <div className="bg-black/95 backdrop-blur-md text-white p-3 md:px-6 md:py-3 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-3 md:gap-6 animate-slide-up border border-gray-700 w-full max-w-[400px] md:max-w-none pointer-events-auto">
                        <span className="text-xs md:text-sm font-bold flex items-center justify-center gap-2 shrink-0">
                            <Check size={16} className="text-green-400"/> {selectedLeads.length} seleccionados
                        </span>
                        
                        <div className="hidden md:block h-5 w-px bg-gray-700"></div>
                        
                        <div className="grid grid-cols-3 md:flex gap-2 w-full md:w-auto">
                            {activeTab !== 'archived' ? (
                                <>
                                    <button onClick={() => setIsBulkAgentSelectOpen(true)} className="flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors">
                                        <UserPlus size={18} className="md:w-4 md:h-4"/> <span>Asignar</span>
                                    </button>
                                    <button onClick={() => handleBulkAction('archive')} className="flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors">
                                        <Archive size={18} className="md:w-4 md:h-4"/> <span>Archivar</span>
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => handleBulkAction('restore')} className="col-span-3 md:col-span-1 flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors">
                                    <RotateCcw size={18} className="md:w-4 md:h-4"/> <span>Restaurar</span>
                                </button>
                            )}
                            <button onClick={() => handleBulkAction('delete')} className="flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-300 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors">
                                <Trash2 size={18} className="md:w-4 md:h-4"/> <span>Eliminar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-auto bg-apple-gray relative p-4 md:p-8">
                {
                 activeTab === 'schedule' ? (
                     showScheduleSettings ? (
                         <div className="max-w-4xl mx-auto">
                             <div className="mb-6">
                                 <button onClick={() => setShowScheduleSettings(false)} className="flex items-center gap-2 text-gray-500 hover:text-rose-600 font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 transition-colors"><ArrowLeft size={16}/> Volver al Calendario</button>
                             </div>
                             <ScheduleSettings schedule={schedule} onUpdate={onUpdateSchedule} />
                         </div>
                     ) : (
                         <AdminCalendar leads={processedLeads} onLeadClick={setViewingLead} onOpenSettings={() => setShowScheduleSettings(true)} />
                     )
                 ) :
                 activeTab === 'agents' ? (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg md:text-2xl font-bold text-gray-900 tracking-tight">Equipo de Ventas</h3>
                            <button onClick={() => {setEditingAgent(null); setIsAgentModalOpen(true);}} className="bg-black text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full font-medium flex items-center gap-2 shadow-lg hover:scale-105 transition-transform text-xs md:text-sm"><UserPlus size={16}/> <span className="hidden md:inline">Nuevo Agente</span><span className="md:hidden">Nuevo</span></button>
                        </div>
                        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {displayAgents.map(agent => (
                            <div key={agent.id} onClick={() => setViewingAgent(agent)} className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100 relative group cursor-pointer hover:shadow-md transition-all hover:-translate-y-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gray-100 to-white flex items-center justify-center font-bold text-xl md:text-2xl border border-gray-200 overflow-hidden shadow-sm shrink-0 text-gray-400">
                                            {agent.photo ? <img src={agent.photo} alt={agent.name} className="w-full h-full object-cover" /> : agent.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">{agent.name}</h3>
                                            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 truncate">{agent.license || 'Agente'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => {setEditingAgent(agent); setIsAgentModalOpen(true);}} className="p-2 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full transition-colors shadow-sm"><Edit2 size={14} /></button>
                                        <button onClick={(e) => handleDeleteAgent(e, agent.id)} className="p-2 bg-gray-50 border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition-colors shadow-sm"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                            ))}
                            {displayAgents.length === 0 && <div className="col-span-full text-center py-20 text-gray-400 font-medium">No se encontraron agentes.</div>}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto bg-transparent md:bg-white md:rounded-3xl md:shadow-soft border-0 md:border border-gray-100 md:overflow-hidden pb-20 md:pb-0">
                        <div className="hidden md:grid grid-cols-[50px_2fr_1.5fr_1fr_1.5fr_100px] gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <div className="flex items-center justify-center"><input type="checkbox" className="custom-checkbox" checked={selectedLeads.length === sortedLeads.length && sortedLeads.length > 0} onChange={toggleSelectAll}/></div>
                            <div>Prospecto</div>
                            <div>Fecha Solicitud</div>
                            <div>Estado</div>
                            <div>Agente</div>
                            <div className="text-right">Acciones</div>
                        </div>
                        
                        {sortedLeads.length === 0 ? (
                            <div className="p-16 md:p-24 text-center flex flex-col items-center bg-white rounded-3xl md:rounded-none shadow-soft md:shadow-none">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Archive size={24} className="text-gray-300"/></div>
                                <p className="text-gray-400 font-medium">Bandeja vacía.</p>
                            </div>
                        ) : (
                            sortedLeads.map(lead => {
                                const assignedAgent = agents.find(a => a.id === lead.assignedTo);
                                const isSelected = selectedLeads.includes(lead.id);
                                
                                return (
                                <React.Fragment key={lead.id}>
                                    <div onClick={() => setViewingLead(lead)} className={`hidden md:grid grid-cols-[50px_2fr_1.5fr_1fr_1.5fr_100px] gap-4 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50/80 cursor-pointer transition-colors text-sm group ${isSelected ? 'bg-rose-50/50' : ''}`}>
                                        <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleSelect(lead.id)}/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{lead.name}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><Phone size={10}/> {lead.phone}</span>
                                                {lead.state && <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase text-[9px] tracking-wider">{lead.state}</span>}
                                            </div>
                                        </div>
                                        <div className="text-gray-500 text-xs font-medium">
                                            <span className="block text-gray-900">{new Date(lead.timestamp).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1 mt-0.5"><Clock size={10}/> {lead.localTime || lead.time}</span>
                                            {lead.localTime && lead.localTime !== lead.time && <span className="text-[9px] text-gray-400 block mt-0.5">({lead.time} {lead.state})</span>}
                                        </div>
                                        <div>
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${lead.status === 'new' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {lead.status === 'new' ? 'Nuevo' : 'Archivado'}
                                            </span>
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                             <button onClick={() => setIndividualAgentSelectLeadId(lead.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-left w-full text-xs font-bold ${assignedAgent ? 'bg-white border-gray-200 hover:border-rose-300' : 'bg-gray-50 border-dashed border-gray-300 hover:bg-white hover:border-gray-400 text-gray-400'}`}>
                                                {assignedAgent ? (<><div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[8px] overflow-hidden shrink-0">{assignedAgent.photo ? <img src={assignedAgent.photo} className="w-full h-full object-cover"/> : assignedAgent.name.charAt(0)}</div><span className="truncate text-gray-800">{assignedAgent.name}</span></>) : (<span>+ Asignar</span>)}
                                             </button>
                                        </div>
                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                            <button onClick={(e) => onUpdateLead(lead.id, { status: lead.status === 'archived' ? 'new' : 'archived' })} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-colors shadow-sm" title={lead.status === 'archived' ? 'Restaurar' : 'Archivar'}>{lead.status === 'archived' ? <RotateCcw size={14}/> : <Archive size={14}/>}</button>
                                            <button onClick={(e) => handleDeleteLead(e, lead.id)} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 rounded-lg transition-colors shadow-sm" title="Eliminar"><Trash2 size={14}/></button>
                                        </div>
                                    </div>

                                    <div onClick={() => setViewingLead(lead)} className={`md:hidden flex flex-col p-4 mb-3 bg-white rounded-3xl shadow-soft border cursor-pointer transition-all relative ${isSelected ? 'border-rose-300 ring-2 ring-rose-50/50' : 'border-gray-100'}`}>
                                        <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleSelect(lead.id)}/>
                                        </div>
                                        
                                        <div className="pr-8 mb-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest mb-1.5 ${lead.status === 'new' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {lead.status === 'new' ? 'Nuevo' : 'Archivado'}
                                            </span>
                                            <p className="font-bold text-gray-900 text-base leading-tight mb-1.5 truncate">{lead.name}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="flex items-center gap-1 bg-gray-50 text-gray-600 text-[10px] font-medium px-2 py-1 rounded-md"><Phone size={10}/> {lead.phone}</span>
                                                {lead.state && <span className="bg-gray-50 text-gray-600 text-[10px] font-medium px-2 py-1 rounded-md">{lead.state}</span>}
                                            </div>
                                        </div>
                                        
                                        {/* NUEVO: Botón de Agente alargado al 100% de ancho */}
                                        <div className="mb-3" onClick={e => e.stopPropagation()}>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Agente Asignado</span>
                                            <button onClick={() => setIndividualAgentSelectLeadId(lead.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${assignedAgent ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-gray-50 border-dashed border-gray-300 text-gray-500 hover:bg-white hover:border-gray-400'}`}>
                                                <div className="flex items-center gap-2">
                                                    {assignedAgent ? (
                                                        <>
                                                            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-gray-100">
                                                                {assignedAgent.photo ? <img src={assignedAgent.photo} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px]">{assignedAgent.name.charAt(0)}</div>}
                                                            </div>
                                                            <span className="truncate text-sm">{assignedAgent.name}</span>
                                                        </>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-sm"><UserPlus size={16}/> Asignar Agente</span>
                                                    )}
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300"/>
                                            </button>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-gray-50 pt-3">
                                            <div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Fecha y Hora</span>
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-semibold text-gray-700">{new Date(lead.timestamp).toLocaleDateString()}</span>
                                                    <span className="font-bold text-blue-600">{lead.localTime || lead.time}</span>
                                                </div>
                                            </div>
                                            <div onClick={e => e.stopPropagation()}>
                                                <button onClick={(e) => onUpdateLead(lead.id, { status: lead.status === 'archived' ? 'new' : 'archived' })} className={`px-4 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ${lead.status === 'archived' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                    {lead.status === 'archived' ? <><RotateCcw size={14}/> Restaurar</> : <><Archive size={14}/> Archivar</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            )})
                        )}
                    </div>
                )}
            </div>
            {isAgentModalOpen && <AgentModal agent={editingAgent} onClose={() => setIsAgentModalOpen(false)} onSave={handleSaveAgent} />}
            {viewingLead && <LeadDetail lead={viewingLead} onClose={() => setViewingLead(null)} onUpdate={onUpdateLead} onDelete={onDeleteLead} agents={agents} />}
            {viewingAgent && <AgentDetailView agent={viewingAgent} leads={processedLeads} onClose={() => setViewingAgent(null)} onLeadClick={(l) => { setViewingAgent(null); setViewingLead(l); }} />}
            {isBulkAgentSelectOpen && (<AgentSelectionModal agents={agents} onClose={() => setIsBulkAgentSelectOpen(false)} onSelect={(agentId) => { handleBulkAction('assign', agentId); setIsBulkAgentSelectOpen(false); }} />)}
            {individualAgentSelectLeadId && (<AgentSelectionModal agents={agents} onClose={() => setIndividualAgentSelectLeadId(null)} onSelect={(agentId) => { onUpdateLead(individualAgentSelectLeadId, { assignedTo: agentId }); setIndividualAgentSelectLeadId(null); }} />)}
        </div>
    );
};

const App = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [leadData, setLeadData] = useState({});
    const [tempSelections, setTempSelections] = useState([]);
    const [reinforcement, setReinforcement] = useState(null);
    const [fillPercent, setFillPercent] = useState(10);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    
    const { leads, agents, schedule, user, addLead, updateLead, bulkUpdateLeads, bulkDeleteLeads, deleteLead, saveAgent, deleteAgent, updateSchedule, adminLogin, adminLogout } = useFirebaseDatabase();

    const currentStep = STEPS[stepIndex];

    useEffect(() => { window.scrollTo(0, 0); }, [stepIndex]);

    useEffect(() => {
        if (isSuccess) setFillPercent(100);
        else if (stepIndex === 0) setFillPercent(10);
        else setFillPercent(Math.round((stepIndex / (STEPS.length - 1)) * 95));
        setTempSelections([]);
    }, [stepIndex, isSuccess]);

    const proceed = (selections) => {
        const msg = getReinforcementMessage(currentStep.id, selections);
        setLeadData(p => ({ ...p, [currentStep.id]: selections }));
        if (msg) { setReinforcement(msg); setFillPercent(p => Math.min(p + 15, 95)); } else next();
    };
    const next = () => { setReinforcement(null); if (stepIndex < STEPS.length - 1) setStepIndex(p => p + 1); };
    const handleOptClick = (id) => currentStep.multiSelect ? setTempSelections(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]) : proceed([id]);
    const handleContinue = () => tempSelections.length > 0 && proceed(tempSelections);
    const saveData = async (form) => { const finalData = { ...leadData, ...form }; await addLead(finalData); };
    const completeSuccess = () => { setIsSuccess(true); };

    const handleLogin = async (email, password) => {
        await adminLogin(email, password);
        setShowAdmin(true);
    };

    const handleLogout = async () => {
        await adminLogout();
        setShowAdmin(false);
    };

    if (showAdmin && user && !user.isAnonymous) {
        return (
            <AdminDashboard 
                leads={leads} 
                agents={agents} 
                schedule={schedule}
                onUpdateLead={updateLead}
                bulkUpdateLeads={bulkUpdateLeads}
                bulkDeleteLeads={bulkDeleteLeads}
                onDeleteLead={deleteLead} 
                onSaveAgent={saveAgent} 
                onDeleteAgent={deleteAgent}
                onUpdateSchedule={updateSchedule}
                onClose={() => setShowAdmin(false)}
                onLogout={handleLogout}
            />
        );
    }

    if (stepIndex === 0) return (
        <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto font-sans relative">
            <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setShowLogin(true)} className="p-2 text-gray-300 hover:text-gray-500 transition-colors"><Lock size={16}/></button>
            </div>

            {showLogin && <AdminLogin onClose={() => setShowLogin(false)} onLogin={handleLogin}/>}

            {/* Hero Section con Imágenes */}
            <div className="relative pt-24 pb-16 px-6 lg:px-12 bg-gradient-to-b from-rose-50/50 via-white to-white overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Text Content */}
                    <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 pt-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight text-balance leading-[1.1]">
                            Protege el futuro de <span className="text-rose-600">quienes más amas</span>
                        </h1>
                        <p className="text-gray-500 mb-10 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
                            Planifica hoy para evitar preocupaciones financieras mañana. Descubre si calificas para un seguro de gastos finales y dale a tu familia la tranquilidad que merecen.
                        </p>
                        <button onClick={() => setStepIndex(1)} className="w-full max-w-sm lg:mx-0 bg-[#E11D48] text-white py-4 md:py-5 rounded-full text-xl font-bold shadow-xl shadow-rose-200 hover:shadow-rose-300 hover:scale-105 transition-all flex items-center justify-center gap-2">
                            Comenzar Ahora <ChevronRight size={24}/>
                        </button>
                        <p className="mt-4 text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-1.5"><Shield size={14}/> Asesoria 100% Gratuita y en su idioma</p>
                    </div>
                    
                    {/* Image Collage - ACTUALIZADO CON LA NUEVA IMAGEN VERTICAL */}
                    <div className="flex-1 w-full relative z-10 mt-8 lg:mt-0">
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            {/* Imagen Principal Nueva (Vertical) */}
                            <img src="https://imnufit.com/wp-content/uploads/2026/02/Gemini_Generated_Image_4uslky4uslky4usl.png" alt="Familia feliz y protegida" className="rounded-3xl object-cover h-48 md:h-[400px] lg:h-[480px] w-full shadow-soft col-span-2 md:col-span-1 hover:shadow-xl transition-shadow duration-500" />
                            
                            {/* Imágenes pequeñas laterales */}
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6 col-span-2 md:col-span-1">
                                <img src="https://imnufit.com/wp-content/uploads/2026/02/Gemini_Generated_Image_7n92w57n92w57n92-scaled.png" alt="Tranquilidad familiar" className="rounded-3xl object-cover h-32 md:h-[188px] lg:h-[228px] w-full shadow-soft hover:shadow-xl transition-shadow duration-500" />
                                <img src="https://imnufit.com/wp-content/uploads/2026/02/Gemini_Generated_Image_j5ui6tj5ui6tj5ui-scaled.png" alt="Pareja disfrutando su retiro" className="rounded-3xl object-cover h-32 md:h-[188px] lg:h-[228px] w-full shadow-soft hover:shadow-xl transition-shadow duration-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Grid */}
            <div className="py-12 md:py-24 px-6 max-w-7xl mx-auto w-full">
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">¿Por qué confiar en nosotros?</h2>
                    <p className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto font-medium">Una experiencia diseñada para tu tranquilidad. Sin letras pequeñas, sin presiones.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><Settings size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">Tú Tienes el Control</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">No hacemos llamadas inesperadas ni visitas repentinas a tu hogar. Tú decides cuándo y cómo hablar con nosotros.</p>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><ShieldCheck size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">100% Seguro y Privado</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">Tu privacidad está garantizada. Tus datos están encriptados y nunca venderemos tu información a terceros.</p>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><BadgeCheck size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">Agentes Licenciados</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">Serás atendido exclusivamente por profesionales certificados y con licencia oficial en tu estado de residencia.</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><Star size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">Compañías Acreditadas</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">Te conectamos únicamente con aseguradoras de primer nivel, sólidas financieramente y acreditadas por el BBB.</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-2">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><Clock size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">Proceso Transparente</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">En menos de 2 minutos podrás saber si calificas. Muchas de nuestras pólizas no requieren examen médico y ofrecen cobertura inmediata desde el primer día, protegiendo a personas hasta los 85 años.</p>
                    </div>
                </div>

                {/* Image Call to Action Final */}
                <div className="mt-20 md:mt-32 relative rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto w-full group">
                    <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1200" alt="Familia hispana sonriendo" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent"></div>
                    <div className="relative z-10 p-8 md:p-20 text-left max-w-3xl">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">El mejor regalo es la <span className="text-rose-400">tranquilidad</span></h2>
                        <p className="text-gray-300 mb-10 text-base md:text-xl font-medium leading-relaxed max-w-xl">No dejes para mañana la seguridad de los que más amas hoy. Averigua tus opciones de forma gratuita, segura y sin compromisos.</p>
                        <button onClick={() => setStepIndex(1)} className="w-full sm:w-auto bg-white text-rose-600 px-8 py-4 md:py-5 rounded-full text-lg md:text-xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                            Comenzar Ahora <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>
            
            <footer className="mt-auto py-10 md:py-12 text-center text-gray-400 text-xs md:text-sm border-t border-gray-100 bg-gray-50 flex flex-col items-center">
                <Heart size={20} className="text-gray-300 mb-4" />
                <p className="font-medium">&copy; {new Date().getFullYear()} asistentedebeneficios.com</p>
                <p className="mt-1">Todos los derechos reservados.</p>
                <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-gray-200/50 px-3 py-1.5 rounded-lg text-gray-500">
                    <Lock size={12}/> Sitio 100% seguro y encriptado
                </div>
            </footer>
        </div>
    );

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#FAFAFA] relative">
            {showLogin && <AdminLogin onClose={() => setShowLogin(false)} onLogin={handleLogin}/>}
            
            {reinforcement && (<div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-immediate-red text-white text-center"><div className="mb-6 bg-white/20 p-6 rounded-full backdrop-blur-sm border border-white/30"><reinforcement.icon size={48} fill="currentColor" className="text-white" /></div><h2 className="text-3xl font-bold mb-4">{reinforcement.title}</h2><p className="text-lg leading-relaxed opacity-90 mb-10 max-w-sm">"{reinforcement.text}"</p><button onClick={next} className="bg-white text-rose-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-2">Continuar <ChevronRight size={20} /></button></div>)}
            
            <div className={`pt-8 pb-4 px-6 flex flex-col items-center shrink-0 ${currentStep.isLetter || isSuccess ? 'opacity-0 h-0 overflow-hidden pt-0 pb-0' : ''} transition-all duration-500`}><HeartProgress percentage={fillPercent} isBeating={false} /></div>
            
            <div className="w-full max-w-xl mx-auto flex flex-col flex-1">
                <div key={stepIndex} className="flex-1 px-4 md:px-6 pb-12 flex flex-col animate-slide-up">
                    {currentStep.isForm ? <ContactForm onSubmit={saveData} onSuccess={completeSuccess} data={leadData} scheduleConfig={schedule} onAdminTrigger={() => setShowLogin(true)} /> : currentStep.isFAQ ? <FAQStep options={currentStep.faqOptions} onContinue={() => { setLeadData(p => ({ ...p, userQuestion: "Vio FAQ" })); next(); }} /> : currentStep.isLetter ? <LetterStep data={leadData} onContinue={next} /> : (
                        <><div className="text-center mb-8"><h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.question}</h2><p className="text-gray-500">{currentStep.subtext}</p></div><div className="grid grid-cols-2 gap-4">{currentStep.options.map((opt, idx) => (<button key={idx} onClick={() => handleOptClick(opt.id)} className={`btn-option border p-3 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 min-h-[140px] h-auto py-4 ${tempSelections.includes(opt.id) ? 'bg-rose-50 border-rose-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-100'}`}><div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-colors ${tempSelections.includes(opt.id) ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'}`}><opt.icon size={24} /></div><span className={`text-sm font-bold text-center ${tempSelections.includes(opt.id) ? 'text-rose-600' : 'text-gray-700'}`}>{opt.label}</span>{currentStep.multiSelect && tempSelections.includes(opt.id) && <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5"><Check size={12} /></div>}</button>))}</div></>
                    )}
                </div>
                {!currentStep.isForm && !currentStep.isFAQ && !currentStep.isLetter && (<div className="p-4 md:p-6 mt-auto"><div className="flex justify-between items-center"><button onClick={() => setStepIndex(p => Math.max(0, p - 1))} className="p-4 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"><ArrowLeft size={24} /></button>{currentStep.multiSelect && (<button onClick={handleContinue} disabled={tempSelections.length === 0} className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${tempSelections.length > 0 ? 'bg-[#E11D48] text-white' : 'bg-gray-200 text-gray-400 opacity-0'}`}>Continuar <ChevronRight size={20} /></button>)}</div></div>)}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
