import React, { useState, useEffect, useRef } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import { Heart, Check, ShieldCheck, Users, Baby, Activity, DollarSign, ChevronRight, ArrowLeft, Star, HelpCircle, Clock, Stethoscope, PenTool, Mail, Lock, X, Archive, Trash2, UserPlus, ShoppingCart, Phone, Edit2, BadgeCheck, MessageSquare, User, Image as ImageIcon, Video, Calendar, Shield, MapPin, CalendarDays, Settings, Plus, MinusCircle, Link as LinkIcon, Search, ArrowRight, Save, LogOut, RotateCcw, FileText, Printer, AlertTriangle, Upload, Building } from 'https://esm.sh/lucide-react@0.344.0';
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, setDoc, writeBatch, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- CONSTANTS ---
const FULL_US_STATES = [
    { name: 'Alabama', abbr: 'AL' }, { name: 'Alaska', abbr: 'AK' }, { name: 'Arizona', abbr: 'AZ' }, { name: 'Arkansas', abbr: 'AR' }, { name: 'California', abbr: 'CA' }, { name: 'Colorado', abbr: 'CO' }, { name: 'Connecticut', abbr: 'CT' }, { name: 'Delaware', abbr: 'DE' }, { name: 'Florida', abbr: 'FL' }, { name: 'Georgia', abbr: 'GA' }, { name: 'Hawaii', abbr: 'HI' }, { name: 'Idaho', abbr: 'ID' }, { name: 'Illinois', abbr: 'IL' }, { name: 'Indiana', abbr: 'IN' }, { name: 'Iowa', abbr: 'IA' }, { name: 'Kansas', abbr: 'KS' }, { name: 'Kentucky', abbr: 'KY' }, { name: 'Louisiana', abbr: 'LA' }, { name: 'Maine', abbr: 'ME' }, { name: 'Maryland', abbr: 'MD' }, { name: 'Massachusetts', abbr: 'MA' }, { name: 'Michigan', abbr: 'MI' }, { name: 'Minnesota', abbr: 'MN' }, { name: 'Mississippi', abbr: 'MS' }, { name: 'Missouri', abbr: 'MO' }, { name: 'Montana', abbr: 'MT' }, { name: 'Nebraska', abbr: 'NE' }, { name: 'Nevada', abbr: 'NV' }, { name: 'New Hampshire', abbr: 'NH' }, { name: 'New Jersey', abbr: 'NJ' }, { name: 'New Mexico', abbr: 'NM' }, { name: 'New York', abbr: 'NY' }, { name: 'North Carolina', abbr: 'NC' }, { name: 'North Dakota', abbr: 'ND' }, { name: 'Ohio', abbr: 'OH' }, { name: 'Oklahoma', abbr: 'OK' }, { name: 'Oregon', abbr: 'OR' }, { name: 'Pennsylvania', abbr: 'PA' }, { name: 'Rhode Island', abbr: 'RI' }, { name: 'South Carolina', abbr: 'SC' }, { name: 'South Dakota', abbr: 'SD' }, { name: 'Tennessee', abbr: 'TN' }, { name: 'Texas', abbr: 'TX' }, { name: 'Utah', abbr: 'UT' }, { name: 'Vermont', abbr: 'VT' }, { name: 'Virginia', abbr: 'VA' }, { name: 'Washington', abbr: 'WA' }, { name: 'West Virginia', abbr: 'WV' }, { name: 'Wisconsin', abbr: 'WI' }, { name: 'Wyoming', abbr: 'WY' }
];
const ALL_US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

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
    const [agentRequests, setAgentRequests] = useState([]); // NUEVO: Estado para las solicitudes
    const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
    const [webhooks, setWebhooks] = useState({ telegram: '', assignment: '' });
    const [generalSettings, setGeneralSettings] = useState({ marketplaceMode: false });
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

        const webhooksDoc = doc(db, 'settings', 'webhooks');
        const unsubWebhooks = onSnapshot(webhooksDoc, (snapshot) => {
            if (snapshot.exists()) {
                setWebhooks(snapshot.data());
            } else if (!user.isAnonymous) {
                setDoc(webhooksDoc, { telegram: '', assignment: '' }).catch(e => console.log("Webhooks auto-creation skipped"));
            }
        }, (err) => {
            if(err.code !== 'permission-denied') console.error("Webhooks error:", err);
        });

        const generalDoc = doc(db, 'settings', 'general');
        const unsubGeneral = onSnapshot(generalDoc, (snapshot) => {
            if (snapshot.exists()) {
                setGeneralSettings({ regularPrice: 45, offerPrice: 35, ...snapshot.data() });
            } else if (!user.isAnonymous) {
                setDoc(generalDoc, { marketplaceMode: false, regularPrice: 45, offerPrice: 35 }).catch(e => console.log("General auto-creation skipped"));
            }
        }, (err) => {
            if(err.code !== 'permission-denied') console.error("General error:", err);
        });

        let unsubLeads = () => {};
        let unsubAgents = () => {};
        let unsubRequests = () => {}; // NUEVO: Limpieza de solicitudes

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

            // NUEVO: Escuchador en tiempo real de las solicitudes de agentes
            const requestsQuery = collection(db, 'agent_requests');
            unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
                // Solo traemos los que están pendientes, los ordenamos del más nuevo al más viejo
                const reqs = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(req => req.status === 'pending')
                    .sort((a, b) => b.timestamp - a.timestamp);
                setAgentRequests(reqs);
            }, (err) => {
                if (err.code !== 'permission-denied') console.error("Requests error:", err);
            });
        }

        return () => { unsubLeads(); unsubAgents(); unsubRequests(); unsubSchedule(); unsubWebhooks(); unsubGeneral(); };
    }, [user]);

    const addLead = async (lead) => {
        try {
            const initialStatus = generalSettings?.marketplaceMode ? 'marketplace' : 'new';
            const newLead = { ...lead, timestamp: Date.now(), status: initialStatus, notes: '' };
            await addDoc(collection(db, 'leads'), newLead);
        } catch (error) {
            console.error("Hubo un error de conexión al guardar.", error);
        }
    };

    const updateLead = async (id, data) => { if (user) await updateDoc(doc(db, 'leads', id), data); };
    const bulkUpdateLeads = async (ids, data) => {
        if (!user) return;
        const batch = writeBatch(db);
        ids.forEach(id => batch.update(doc(db, 'leads', id), data));
        await batch.commit();
    };
    const bulkDeleteLeads = async (ids) => {
        if (!user) return;
        const batch = writeBatch(db);
        ids.forEach(id => batch.delete(doc(db, 'leads', id)));
        await batch.commit();
    };
    const deleteLead = async (id) => { if (user) await deleteDoc(doc(db, 'leads', id)); };
    
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
        
        try {
            const batch = writeBatch(db);
            const now = Date.now();

            // 1. Buscamos todos los leads asignados a este agente
            const leadsToRedirect = leads.filter(l => l.assignedTo === id);

            leadsToRedirect.forEach(lead => {
                const leadRef = doc(db, 'leads', lead.id);
                
                // Usamos la lógica de tiempo que ya tienes configurada en tu app
                const timeInfo = getAgentLocalDateTime(lead.date, lead.time, lead.state);
                const isFuture = timeInfo ? timeInfo.localMs > now : true; 

                if (isFuture) {
                    // SI ES FUTURO: Quitar agente y volver a Bandeja (new)
                    batch.update(leadRef, { assignedTo: '', status: 'new' });
                } else {
                    // SI ES PASADO: Quitar agente y enviar a Archivados (archived)
                    batch.update(leadRef, { assignedTo: '', status: 'archived' });
                }
            });

            // 2. Borrar al agente
            const agentRef = doc(db, 'agents', id);
            batch.delete(agentRef);

            // 3. Ejecutar todo en un solo proceso
            await batch.commit();
        } catch (error) {
            console.error("Error al eliminar agente:", error);
        }
    };

    // --- NUEVAS FUNCIONES DE RECURSOS HUMANOS ---
    const approveAgentRequest = async (request) => {
        if (!user) return;
        const batch = writeBatch(db);
        
        // ¡Magia aquí! Pasamos ABSOLUTAMENTE TODOS los datos de la solicitud al perfil oficial
        const newAgentData = {
            name: request.fullName || '', 
            email: request.email || '', 
            phone: request.phone || '',
            bio: request.bio || '', 
            photo: request.photo || '', 
            license: request.licenseSummary || 'Sin estados configurados',
            companies: request.companies || 'Independiente', 
            isAgency: request.isAgency || false, 
            licensesArray: request.licenses || [], // Guardamos las fotos de las licencias
            timestamp: Date.now(), 
            status: 'active'
        };

        const newAgentRef = doc(collection(db, 'agents'));
        batch.set(newAgentRef, newAgentData);
        
        const requestRef = doc(db, 'agent_requests', request.id);
        batch.delete(requestRef);
        
        await batch.commit();
    };

    const rejectAgentRequest = async (id) => {
        if (!user) return;
        // Simplemente lo borramos de la base de datos
        await deleteDoc(doc(db, 'agent_requests', id));
    };

    const updateAgentRequest = async (id, data) => { 
        if (user) await updateDoc(doc(db, 'agent_requests', id), data); 
    };
    // ---------------------------------------------

    const updateSchedule = async (newSchedule) => { if (user) await setDoc(doc(db, 'settings', 'schedule'), newSchedule); };
    const updateWebhooks = async (newWebhooks) => { if (user) await setDoc(doc(db, 'settings', 'webhooks'), newWebhooks); };
    const updateGeneralSettings = async (newSettings) => { if (user) await setDoc(doc(db, 'settings', 'general'), newSettings); };

    const adminLogin = async (email, password) => { await signInWithEmailAndPassword(auth, email, password); };
    const adminLogout = async () => { await signOut(auth); };

    return { leads, agents, agentRequests, schedule, webhooks, generalSettings, user, addLead, updateLead, bulkUpdateLeads, bulkDeleteLeads, deleteLead, saveAgent, deleteAgent, approveAgentRequest, rejectAgentRequest, updateAgentRequest, updateSchedule, updateWebhooks, updateGeneralSettings, adminLogin, adminLogout };
};

const CustomDialog = ({ isOpen, title, message, type = 'info', onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-slide-up text-center border border-gray-100">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${type === 'danger' ? 'bg-red-50 text-red-500' : type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'}`}>
                    {type === 'danger' ? <Trash2 size={32}/> : type === 'warning' ? <AlertTriangle size={32}/> : <Check size={32}/>}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
                <p className="text-gray-500 text-sm mb-6 whitespace-pre-wrap leading-relaxed">{message}</p>
                <div className="flex gap-3">
                    {onCancel && (
                        <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm">Cancelar</button>
                    )}
                    <button onClick={onConfirm} className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-colors shadow-md text-sm ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : type === 'warning' ? 'bg-black hover:bg-gray-800' : 'bg-green-600 hover:bg-green-700'}`}>Aceptar</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTS ---
const AgentRegistrationForm = ({ onCancel, onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState(initialData ? { id: initialData.id, fullName: initialData.fullName, email: initialData.email, phone: initialData.phone, companies: initialData.companies, isAgency: initialData.isAgency, bio: initialData.bio } : { fullName: '', email: '', phone: '', companies: '', isAgency: false, bio: '' });
    const [licenses, setLicenses] = useState(initialData && initialData.licenses ? initialData.licenses : [{ state: '', number: '', fileStr: '', fileName: '' }]);
    const [profilePicStr, setProfilePicStr] = useState(initialData ? initialData.photo : '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isCheckingPhone, setIsCheckingPhone] = useState(false);

    const licenseSummary = licenses.filter(l => l.state && l.number).map(l => `${l.number} (${l.state})`).join(', ');

    const handleFileChange = (e, callback) => {
        const file = e.target.files[0];
        if (!file) return;
        setError(''); 
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; const MAX_HEIGHT = 800;
                let width = img.width; let height = img.height;
                if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                callback(compressedBase64, file.name);
            };
        };
    };

    const handleLicenseChange = (index, field, value) => {
        const newLics = [...licenses];
        newLics[index][field] = value;
        setLicenses(newLics);
        setError(''); 
    };

    const checkDuplicate = async (field, value) => {
        if (!value) return false;
        if (initialData && initialData[field] === value) return false;
        
        // 1. VERIFICACIÓN CRÍTICA: Buscar en agentes activos
        // Como la tabla de agentes es pública por tus reglas, esto SIEMPRE funcionará.
        try {
            const agentsRef = collection(db, 'agents');
            const q1 = query(agentsRef, where(field, '==', value));
            const res1 = await getDocs(q1);
            if (!res1.empty) return true; // Bloqueo INMEDIATO si ya existe el agente
        } catch (error) {
            console.error("Error verificando agentes:", error);
        }

        // 2. VERIFICACIÓN SECUNDARIA: Buscar en solicitudes pendientes
        try {
            const requestsRef = collection(db, 'agent_requests');
            const q2 = query(requestsRef, where(field, '==', value));
            const res2 = await getDocs(q2);
            if (!res2.empty) return true;
        } catch (error) {
            // Si un invitado llena el formulario, esto fallará por seguridad y caerá aquí.
            // Lo ignoramos. Si un aspirante manda la solicitud 2 veces, simplemente
            // verás 2 solicitudes iguales en tu panel y rechazarás una. Lo crítico 
            // era no duplicar agentes oficiales, y el Paso 1 ya lo resolvió.
        }

        return false;
    };

    const handleEmailBlur = async () => {
        if (!formData.email) { setEmailError(''); return; }
        setIsCheckingEmail(true);
        const isDup = await checkDuplicate('email', formData.email);
        setIsCheckingEmail(false);
        if (isDup) setEmailError('Este correo ya está registrado o en revisión.');
        else setEmailError('');
    };

    const handlePhoneBlur = async () => {
        if (formData.phone.length < 14) { setPhoneError(''); return; }
        setIsCheckingPhone(true);
        const isDup = await checkDuplicate('phone', formData.phone);
        setIsCheckingPhone(false);
        if (isDup) setPhoneError('Este teléfono ya está registrado o en revisión.');
        else setPhoneError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        if (formData.phone.length < 14) { setError("Ingresa un teléfono válido de 10 dígitos."); return; }
        if (emailError || phoneError) { setError("Corrige los errores en rojo antes de continuar."); return; }
        const incompleteLicense = licenses.find(l => !l.state || !l.number || !l.fileStr);
        if (incompleteLicense) { setError("Faltan datos o fotos en las licencias."); return; }

        setIsSubmitting(true);
        try {
            const isEmailDup = await checkDuplicate('email', formData.email);
            const isPhoneDup = await checkDuplicate('phone', formData.phone);
            if (isEmailDup || isPhoneDup) {
                if (isEmailDup) setEmailError('Correo en uso.');
                if (isPhoneDup) setPhoneError('Teléfono en uso.');
                setError("Datos duplicados encontrados.");
                setIsSubmitting(false); return;
            }

            await onSubmit({ ...formData, licenses, licenseSummary, photo: profilePicStr, id: formData.id });
            setIsSubmitting(false);
            if (initialData) onCancel();
            else setShowSuccess(true);
        } catch (err) {
            setIsSubmitting(false);
            setError("Error técnico: " + (err.message || err));
        }
    };

    if (showSuccess && !initialData) return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-slide-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} className="text-green-600" /></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud Recibida!</h2>
                <p className="text-gray-500 mb-8">Estamos verificando tu información. Te anunciaremos nuestra decisión por correo electrónico a la brevedad posible.</p>
                <button onClick={onCancel} className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:scale-[1.02] shadow-lg transition-transform">Cerrar y volver</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto z-[100] animate-fade-in">
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl animate-slide-up my-8">
                    <button onClick={onCancel} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10"><X size={20}/></button>
                    
                    <div className="p-6 md:p-8 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">{initialData ? 'Editar Solicitud' : 'Únete al Equipo'}</h2>
                        <p className="text-gray-500 text-sm mt-1">{initialData ? 'Corrige los datos del aspirante antes de aprobarlo.' : 'Completa tu perfil profesional para enviar la solicitud.'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        <div className="flex flex-col items-center justify-center bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex items-end gap-6 mb-3">
                                <div className="relative">
                                    <label className="w-24 h-24 bg-white rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors shadow-sm z-10">
                                        {profilePicStr ? <img src={profilePicStr} alt="Perfil" className="w-full h-full object-cover" /> : <User size={32} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, (res) => setProfilePicStr(res))} className="hidden" />
                                    </label>
                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1.5 shadow-md pointer-events-none"><Upload size={12} strokeWidth={3}/></div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-200 mb-2">Subir Foto de Perfil</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label><input required type="text" placeholder="Ej: Juan Pérez" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-400 focus:ring-4 rounded-xl outline-none transition-all text-sm font-medium" /></div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <input required type="email" placeholder="Ej: juan@email.com" value={formData.email} onChange={e => {setFormData({...formData, email: e.target.value}); setEmailError(''); setError('');}} onBlur={handleEmailBlur} className={`w-full p-3.5 bg-gray-50 border ${emailError ? 'border-red-400 focus:bg-red-50 text-red-700' : 'border-gray-200 focus:bg-white focus:border-blue-400'} focus:ring-4 rounded-xl outline-none transition-all text-sm font-medium`} />
                                    {isCheckingEmail && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div></div>}
                                </div>
                                {emailError && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1 flex items-center gap-1 animate-fade-in"><AlertTriangle size={10} strokeWidth={3}/> {emailError}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Teléfono</label>
                                <div className="relative">
                                    <input required type="text" placeholder="Ej: (407) 555-1234" value={formData.phone} onChange={e => {setFormData({...formData, phone: formatPhoneNumber(e.target.value)}); setPhoneError(''); setError('');}} onBlur={handlePhoneBlur} maxLength="14" className={`w-full p-3.5 bg-gray-50 border ${phoneError ? 'border-red-400 focus:bg-red-50 text-red-700' : 'border-gray-200 focus:bg-white focus:border-blue-400'} focus:ring-4 rounded-xl outline-none transition-all text-sm font-medium`} />
                                    {isCheckingPhone && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div></div>}
                                </div>
                                {phoneError && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1 flex items-center gap-1 animate-fade-in"><AlertTriangle size={10} strokeWidth={3}/> {phoneError}</p>}
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-5 md:p-6 rounded-2xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2"><FileText size={16}/> Licencias Estatales</h3>
                            <div className="space-y-4">
                                {licenses.map((lic, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estado</label>
                                            <select value={lic.state} onChange={e => handleLicenseChange(index, 'state', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-400 text-gray-700">
                                                <option value="">Sel. Estado</option>
                                                {FULL_US_STATES.map(st => <option key={st.abbr} value={st.abbr}>{st.name}</option>)}
                                            </select>
                                        </div>
                                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Número</label><input type="text" placeholder="Ej: 1234567" value={lic.number} onChange={e => handleLicenseChange(index, 'number', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-400" /></div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Foto Licencia</label>
                                            <label className="w-full p-2.5 bg-gray-50 border border-dashed border-gray-300 hover:border-blue-400 rounded-lg text-xs text-center text-gray-500 cursor-pointer flex items-center justify-center gap-1 overflow-hidden transition-colors">
                                                {lic.fileName || lic.fileStr ? <span className="text-green-600 font-bold truncate">✅ Foto lista</span> : <span>Subir foto</span>}
                                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, (res, name) => { handleLicenseChange(index, 'fileStr', res); handleLicenseChange(index, 'fileName', name); })} className="hidden" />
                                            </label>
                                        </div>
                                        {licenses.length > 1 && <button type="button" onClick={() => setLicenses(licenses.filter((_, i) => i !== index))} className="absolute -top-2 -right-2 bg-red-100 text-red-500 hover:bg-red-200 rounded-full p-1.5 shadow-sm transition-colors"><X size={12} strokeWidth={3}/></button>}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <button type="button" onClick={() => setLicenses([...licenses, { state: '', number: '', fileStr: '', fileName: '' }])} className="text-sm font-bold text-blue-600 flex items-center gap-1 bg-blue-100/50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors shadow-sm">
                                    <Plus size={16}/> Agregar otro estado
                                </button>
                            </div>

                            {/* --- INICIO DEL CAMPO NUEVO --- */}
                            <div className="mt-6 pt-5 border-t border-blue-200/60">
                                <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 ml-1">
                                    <BadgeCheck size={14} className="text-blue-500"/> Verificación Automática
                                </label>
                                <div className="relative group">
                                    <textarea 
                                        readOnly 
                                        disabled
                                        rows="2"
                                        placeholder="Tus licencias aparecerán aquí... Ej: 1234567 (FL), 9876543 (TX)"
                                        value={licenseSummary} 
                                        className="w-full p-4 pr-12 bg-white/80 border border-blue-200 rounded-xl outline-none text-sm font-bold text-blue-900 resize-none cursor-not-allowed shadow-inner transition-all placeholder:text-blue-300/70 placeholder:font-medium" 
                                    />
                                    {licenseSummary && (
                                        <div className="absolute top-4 right-4 text-green-500 animate-fade-in bg-green-50 rounded-full p-1 shadow-sm">
                                            <Check size={14} strokeWidth={3}/>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* --- FIN DEL CAMPO NUEVO --- */}

                        </div>

                        <div className="space-y-5">
                            {/* AQUÍ ESTÁ EL CAMBIO DE ICONO: Maletín por Edificio */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
                                    <Building size={14} className="text-gray-400"/> Compañías con las que trabaja
                                </label>
                                <input required type="text" placeholder="Ej: Lincoln Heritage, Mutual of Omaha..." value={formData.companies} onChange={e => setFormData({...formData, companies: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-400 rounded-xl outline-none transition-all text-sm font-medium" />
                            </div>
                            
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="relative flex items-center justify-center"><input type="checkbox" checked={formData.isAgency} onChange={e => setFormData({...formData, isAgency: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all" /><Check size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} /></div>
                                <span className="text-sm font-bold text-gray-700">Tengo una organización o agencia a mi cargo</span>
                            </label>
                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1 pr-1"><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bio Corta</label><span className={`text-[10px] font-bold ${formData.bio.length > 150 ? 'text-red-500' : 'text-gray-400'}`}>{formData.bio.length}/150</span></div>
                                <textarea required maxLength="150" placeholder="Ej: Especialista en gastos finales..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-3.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-400 rounded-xl outline-none transition-all text-sm font-medium resize-none h-24" />
                            </div>
                        </div>
                        
                        {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold animate-fade-in shadow-sm"><AlertTriangle size={18} className="shrink-0" /><p>{error}</p></div>}

                        <div className="pt-4 border-t border-gray-100">
                            <button type="submit" disabled={isSubmitting || formData.bio.length > 150 || emailError || phoneError} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
                                {isSubmitting ? (initialData ? 'Guardando...' : 'Enviando...') : (initialData ? 'Guardar Cambios' : 'Enviar Solicitud')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const AdminLogin = ({ onClose, onLogin, onOpenRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMsg, setResetMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResetMsg('');
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

    const handleResetPassword = async () => {
        if (!email) {
            setError('Ingresa tu correo arriba y presiona "Olvidé mi contraseña".');
            setResetMsg('');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setResetMsg('Correo de recuperación enviado. Revisa tu bandeja.');
            setError('');
        } catch (err) {
            setError('Error al enviar correo o el usuario no existe.');
            setResetMsg('');
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
                    <div><input type="email" placeholder="Correo electrónico" className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
                    <div><input type="password" placeholder="Contraseña" className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:border-black focus:bg-white transition-all text-sm" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
                    
                    {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
                    {resetMsg && <p className="text-green-600 text-xs text-center font-medium bg-green-50 p-2 rounded-lg">{resetMsg}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 mt-2">
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                    
                    <div className="flex flex-col gap-3 mt-4 pt-5 border-t border-gray-100">
                        <button type="button" onClick={handleResetPassword} className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">¿Olvidaste tu contraseña?</button>
                        {onOpenRegister && (
                            <button type="button" onClick={() => { onClose(); onOpenRegister(); }} className="w-full bg-white border border-gray-200 text-gray-800 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mt-1">
                                <UserPlus size={16}/> Únete al Equipo
                            </button>
                        )}
                    </div>
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

    const isFormValid = name && phone.replace(/\D/g, '').length === 10 && state && (noEmail || email) && date && time;

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
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-rose-100 shadow-xl text-center animate-fade-in flex flex-col items-center justify-center py-10 relative">
                        
                        <div className="mb-4 animate-[slide-up_0.5s_ease-out_0.2s_both]">
                            <HeartProgress percentage={100} isBeating={true} />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">¡Misión Cumplida!</h2>
                        <p className="text-gray-500 mb-6 text-sm md:text-base">Has dado un paso gigante de amor.</p>
                        
                        <div className="bg-rose-50 p-5 md:p-6 rounded-2xl text-rose-800 italic text-sm md:text-base shadow-inner mb-6 w-full">
                            "No hay mayor tranquilidad que saber que, pase lo que pase, tu familia estará protegida. Gracias por cuidarlos hoy."
                        </div>

                        {/* --- TARJETA ELEGANTE DE CITA --- */}
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left shadow-sm mb-6 animate-[slide-up_0.5s_ease-out_0.4s_both]">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
                                <CalendarDays size={18} className="text-slate-600"/>
                                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Su Cita Confirmada</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fecha y Hora</span>
                                    <p className="font-bold text-slate-900 text-sm capitalize">{date ? new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }) : ''}</p>
                                    <p className="text-blue-600 font-bold text-sm flex items-center gap-1 mt-0.5"><Clock size={12}/> {time}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Método</span>
                                    {callType === 'video' ? (
                                        <p className="font-bold text-green-600 text-sm flex items-center gap-1"><Video size={14}/> Videollamada</p>
                                    ) : (
                                        <p className="font-bold text-blue-600 text-sm flex items-center gap-1"><Phone size={14}/> Llamada</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-5 bg-slate-100/50 p-3 rounded-xl border border-slate-200/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Teléfono de Contacto</span>
                                <p className="font-bold text-slate-700 text-sm flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {phone}</p>
                            </div>

                            <a href={(() => {
                                // Generador Inteligente del enlace para Google Calendar
                                if (!date || !time) return '#';
                                let cleanTime = time.toLowerCase().replace(/[\s\.\u202F\u00A0]/g, '');
                                let h = parseInt(cleanTime.replace(/[^0-9]/g, '').slice(0, -2), 10);
                                const m = cleanTime.replace(/[^0-9]/g, '').slice(-2);
                                if (cleanTime.includes('p') && h < 12) h += 12;
                                if (cleanTime.includes('a') && h === 12) h = 0;
                                
                                const [Y, M, D] = date.split('-');
                                const startDate = new Date(Y, M - 1, D, h, parseInt(m, 10));
                                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora de duración
                                
                                const fmt = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');
                                const details = `Cita para Asesoría de Beneficios (Gastos Finales). Método: ${callType === 'video' ? 'Videollamada' : 'Llamada Telefónica'}.`;
                                return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Asesoría+de+Beneficios&dates=${fmt(startDate)}/${fmt(endDate)}&details=${encodeURIComponent(details)}`;
                            })()} 
                            target="_blank" rel="noopener noreferrer" 
                            className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <Calendar size={16}/> Guardar en Google Calendar
                            </a>

                            <p className="text-xs text-slate-500 mt-4 text-center italic">
                                Cuando sea asignado un especialista le notificaremos por correo electrónico si lo proporcionó.
                            </p>
                        </div>

                        <button onClick={() => window.location.reload()} className="mt-2 text-gray-400 font-medium hover:text-gray-600 text-xs md:text-sm underline transition-colors">Volver al inicio</button>
                    </div>
                ) : (
                <>
                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><User size={16} className="text-rose-500"/> Mis Datos</h3>
                        <div className="space-y-3">
                            <div><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Nombre Completo</label><input type="text" className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="Ej. Maria Perez" value={name} onChange={e => setName(e.target.value)} disabled={status !== 'idle'} /></div>
                            <div><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Teléfono Celular</label><input type="tel" className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="Ej: (555) 123-4567" value={phone} onChange={e => setPhone(formatPhoneNumber(e.target.value))} maxLength="14" disabled={status !== 'idle'} /></div>
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Estado (EE.UU.)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 md:left-4 top-3.5 md:top-4 text-gray-400" size={18}/>
                                    <select className="w-full p-3 md:p-4 pl-10 md:pl-10 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all appearance-none text-gray-700" value={state} onChange={e => setState(e.target.value)} disabled={status !== 'idle'}>
                                        <option value="">Seleccione su Estado</option>
                                        {FULL_US_STATES.map(s => <option key={s.abbr} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
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
                        <button onClick={handleFinalSubmit} disabled={!isFormValid || status !== 'idle'} className={`w-full py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-xl disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 md:gap-3 hover:scale-[1.02] ${status === 'success' ? 'bg-green-600 text-white cursor-default' : 'bg-[#E11D48] text-white'}`}>{status === 'submitting' ? (<>Enviando... <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full"></div></>) : (<>Programar Cita <Check className="inline" size={20} strokeWidth={3} /></>)}</button>
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
    const filteredAgents = agents.filter(a => {
        const term = search.toLowerCase();
        return (a.name && a.name.toLowerCase().includes(term)) || 
               (a.email && a.email.toLowerCase().includes(term)) ||
               (a.license && a.license.toLowerCase().includes(term));
    });
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
        let h = parseInt(match[1], 10);
        const m = match[2];
        const mod = match[3].toLowerCase();
        if (mod.includes('p') && h < 12) h += 12;
        if (mod.includes('a') && h === 12) h = 0;

        const [year, month, day] = dateString.split('-');
        const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), h, parseInt(m, 10), 0);

        const targetHourStr = d.toLocaleString('en-GB', { timeZone: tz, hour: 'numeric' });
        const localHourStr = d.toLocaleString('en-GB', { hour: 'numeric' });

        const targetHour = parseInt(targetHourStr.match(/\d+/)[0], 10) % 24;
        const localHour = parseInt(localHourStr.match(/\d+/)[0], 10) % 24;

        let diff = localHour - targetHour;
        if (diff > 12) diff -= 24;
        if (diff < -12) diff += 24;

        if (diff === 0) return timeString;

        const localDate = new Date(d.getTime() + diff * 60 * 60 * 1000);

        let outH = localDate.getHours();
        const outM = String(localDate.getMinutes()).padStart(2, '0');
        const ampm = outH >= 12 ? 'p.m.' : 'a.m.';
        outH = outH % 12 || 12; 

        return `${String(outH).padStart(2, '0')}:${outM} ${ampm}`;
    } catch (e) {
        return timeString;
    }
};

const LeadDetail = ({ lead, onClose, onUpdate, agents, onDelete, onAssignAgent, isAgentView = false, allLeads = [] }) => {
    const [currentNotes, setCurrentNotes] = useState(lead.notes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    
    const [isEditingDateTime, setIsEditingDateTime] = useState(false);
    const [editDate, setEditDate] = useState(lead.date || '');
    const [editTime, setEditTime] = useState(lead.time || '');
    const [dialog, setDialog] = useState(null);

    const TIME_SLOTS = [
        "12:00 a.m.", "01:00 a.m.", "02:00 a.m.", "03:00 a.m.", "04:00 a.m.", "05:00 a.m.",
        "06:00 a.m.", "07:00 a.m.", "08:00 a.m.", "09:00 a.m.", "10:00 a.m.", "11:00 a.m.",
        "12:00 p.m.", "01:00 p.m.", "02:00 p.m.", "03:00 p.m.", "04:00 p.m.", "05:00 p.m.",
        "06:00 p.m.", "07:00 p.m.", "08:00 p.m.", "09:00 p.m.", "10:00 p.m.", "11:00 p.m."
    ];
    
    const previewLocalTime = editDate && editTime ? getLocalTimeInfo(editDate, editTime, lead.state) : '';

    const localNow = new Date();
    const yyyy = localNow.getFullYear();
    const mm = String(localNow.getMonth() + 1).padStart(2, '0');
    const dd = String(localNow.getDate()).padStart(2, '0');
    const minDateLocal = `${yyyy}-${mm}-${dd}`;

    const getAvailableTimeSlots = () => TIME_SLOTS;

    const handleSaveNotes = async () => { 
        setIsSaving(true);
        await onUpdate(lead.id, { notes: currentNotes }); 
        setTimeout(() => setIsSaving(false), 2000);
    };

    const handleSaveDateTime = async () => {
        const getClean24h = (tStr) => {
            if (!tStr) return null;
            let clean = tStr.toLowerCase().replace(/[\s\.\u202F\u00A0]/g, '');
            let isPM = clean.includes('p');
            let isAM = clean.includes('a');
            let nums = clean.replace(/[^0-9]/g, '');
            if (nums.length < 3) return null;
            let h = parseInt(nums.slice(0, -2), 10);
            const m = nums.slice(-2);
            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;
            return `${String(h).padStart(2, '0')}:${m}`; 
        };

        const targetTime24h = getClean24h(previewLocalTime || editTime);

        if (targetTime24h && editDate) {
            const [year, month, day] = editDate.split('-').map(Number);
            const [hours, minutes] = targetTime24h.split(':').map(Number);
            const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
            
            if (selectedDateTime < new Date()) {
                setDialog({ 
                    title: 'Horario Inválido', 
                    message: 'Estás intentando agendar en una fecha u hora del pasado.\n\nPor favor, elige un momento en el futuro.', 
                    type: 'warning', 
                    onConfirm: () => setDialog(null) 
                });
                return;
            }
        }

        if (lead.assignedTo && allLeads && allLeads.length > 0) {
            const hasConflict = allLeads.some(l => {
                if (l.id === lead.id || l.assignedTo !== lead.assignedTo || l.status === 'archived') return false;
                if (l.date !== editDate) return false;
                const otherLocalTime = l.localTime || getLocalTimeInfo(l.date, l.time, l.state) || l.time;
                const otherTime24h = getClean24h(otherLocalTime);
                if(!targetTime24h || !otherTime24h) return false;
                return otherTime24h === targetTime24h; 
            });
            
            if (hasConflict) {
                setDialog({ title: 'Alerta de Colisión', message: `Ya tienes una cita activa programada a las ${previewLocalTime || editTime} (Tu hora local) en ese día.\n\nPor favor, selecciona un horario distinto.`, type: 'warning', onConfirm: () => setDialog(null) });
                return; 
            }
        }
        
        await onUpdate(lead.id, { date: editDate, time: editTime });
        setIsEditingDateTime(false);
        setDialog({ title: '¡Éxito!', message: 'La cita ha sido reagendada correctamente.', type: 'success', onConfirm: () => setDialog(null) });
    };
    
    const currentAgent = agents.find(a => a.id === lead.assignedTo);
    const handleDelete = () => { 
        setDialog({ title: 'Eliminar Prospecto', message: '¿Estás seguro de eliminar este prospecto permanentemente? Esta acción no se puede deshacer.', type: 'danger', onConfirm: () => { onDelete(lead.id); onClose(); setDialog(null); }, onCancel: () => setDialog(null) });
    };

    return (
        <div className="fixed inset-0 bg-[#F5F5F7] z-[60] flex flex-col animate-slide-up">
            <CustomDialog isOpen={!!dialog} {...dialog} />

            <div className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-gray-200">
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 pr-2">
                    <button onClick={onClose} className="p-2 md:p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shrink-0 shadow-sm"><ArrowLeft size={20} className="text-gray-700"/></button>
                    <div className="truncate">
                        <h2 className="font-bold text-lg md:text-xl text-gray-900 truncate tracking-tight">{lead.name}</h2>
                        <span className="text-xs md:text-sm text-gray-500 font-medium tracking-wide truncate block">{lead.phone}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                     <a href={`https://wa.me/1${lead.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="p-2.5 md:p-3 text-gray-500 hover:text-[#25D366] bg-white shadow-sm hover:shadow-md rounded-xl transition-all border border-gray-100" title="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>
                     <a href={`tel:${lead.phone}`} className="p-2.5 md:p-3 text-gray-500 hover:text-blue-600 bg-white shadow-sm hover:shadow-md rounded-xl transition-all border border-gray-100" title="Llamar"><Phone size={18}/></a>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto h-full">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-widest"><User size={16} className="text-rose-500"/> Ficha Técnica</h3>
                            <div className="space-y-5">
                                <div className="flex flex-col bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100/50">
                                    <div className="border-b border-gray-200/80 pb-4 mb-4">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1.5">Estado</span>
                                        <p className="font-semibold text-gray-800 text-sm flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {lead.state || 'N/A'}</p>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Cita Solicitada</span>
                                            {!isEditingDateTime && (
                                                <button onClick={() => { setIsEditingDateTime(true); setEditDate(lead.date); setEditTime(lead.time); }} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition-colors shadow-sm" title="Reagendar Cita">
                                                    <Edit2 size={14}/>
                                                </button>
                                            )}
                                        </div>
                                        
                                        {isEditingDateTime ? (
                                            <div className="flex flex-col gap-3 mt-3 bg-blue-50/60 p-4 rounded-xl border border-blue-100 shadow-inner animate-fade-in w-full">
                                                
                                                <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col gap-2">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Seleccione el Día:</span>
                                                    <input 
                                                        type="date" 
                                                        value={editDate} 
                                                        onChange={e => { setEditDate(e.target.value); setEditTime(''); }} 
                                                        className="w-full text-sm p-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-gray-50 font-medium text-gray-700 cursor-pointer" 
                                                        min={minDateLocal} 
                                                    />
                                                </div>

                                                <div className="bg-white p-3 rounded-lg border border-blue-100 flex flex-col gap-2">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hora en {lead.state || 'Estado'}:</span>
                                                    <select 
                                                        value={editTime} 
                                                        onChange={e => setEditTime(e.target.value)} 
                                                        disabled={!editDate} 
                                                        className="w-full text-sm p-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-gray-50 font-medium disabled:opacity-50 cursor-pointer"
                                                    >
                                                        <option value="">{editDate ? 'Seleccione hora...' : 'Primero seleccione el día'}</option>
                                                        {getAvailableTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                    {previewLocalTime && previewLocalTime !== editTime && (
                                                        <div className="mt-1 flex items-center gap-2 text-blue-700 font-bold text-xs bg-blue-50/50 p-2 rounded-lg">
                                                            <Clock size={14}/> Tu reloj marcará: {previewLocalTime}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                                    <button onClick={handleSaveDateTime} disabled={!editDate || !editTime} className="flex-1 bg-black text-white text-xs py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-md">Guardar Cita</button>
                                                    <button onClick={() => setIsEditingDateTime(false)} className="flex-1 bg-gray-200 text-gray-700 text-xs py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 mt-1">
                                                <span className="font-bold text-gray-900 capitalize text-sm">
                                                    {lead.date ? new Date(lead.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </span>
                                                <div className="flex flex-col gap-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100 shadow-sm mt-1">
                                                    <div className="flex items-center gap-2 text-blue-700 font-bold">
                                                        <Clock size={16}/> 
                                                        <span className="text-sm">{lead.localTime || lead.time}</span>
                                                        <span className="text-[9px] uppercase tracking-widest bg-blue-100 px-2 py-1 rounded-md text-blue-600 shadow-sm">Tu Hora</span>
                                                    </div>
                                                    {lead.localTime && lead.localTime !== lead.time && (
                                                        <div className="flex items-center gap-2 text-gray-500 font-medium pl-1 mt-1">
                                                            <MapPin size={14}/> <span className="text-xs">{lead.time}</span>
                                                            <span className="text-[8px] uppercase tracking-widest text-gray-400">En {lead.state}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="px-1">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Teléfono y Correo</span>
                                    <p className="font-bold text-gray-900 text-lg">{lead.phone}</p>
                                    <p className="font-medium text-gray-600 text-sm">{lead.email}</p>
                                </div>
                                <div className="px-1">
                                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Método Preferido</span>
                                     {lead.callType === 'video' ? (
                                         <a href={`https://wa.me/1${lead.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="font-bold text-[#128C7E] text-sm bg-[#E7F6F4] hover:bg-[#D1EBE7] transition-colors px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> Videollamada
                                         </a>
                                     ) : (
                                         <a href={`tel:${lead.phone}`} className="font-bold text-blue-700 text-sm bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                                             <Phone size={14} strokeWidth={2.5}/> Llamada Telefónica
                                         </a>
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
                                    <span className="text-sm text-gray-500 font-medium">Presupuesto</span>
                                    <span className="font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">{getLabelForValue('budget', lead.budget) || 'Pendiente'}</span>
                                </div>
                                <div className="px-1 pt-1">
                                    <span className="text-sm text-gray-500 font-medium block mb-2">Motivaciones</span>
                                    <p className="font-bold text-sm text-gray-800">
                                        {Array.isArray(lead.motivation) ? lead.motivation.map(m => getLabelForValue('motivation', m)).join(' • ') : lead.motivation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-7 space-y-6 flex flex-col">
                        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100 shrink-0">
                            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-widest"><ShoppingCart size={16} className="text-rose-500"/> Asignación</h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Agente Responsable</label>
                                    
                                    {!isAgentView ? (
                                        <button onClick={() => setShowAgentSelector(true)} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between hover:border-rose-300 hover:bg-white transition-all">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {currentAgent ? (<><span className="font-bold text-gray-900 block truncate">{currentAgent.name}</span></>) : (<span className="italic text-sm">Seleccionar Agente...</span>)}
                                            </div>
                                            <ChevronRight size={18} className="text-gray-300 shrink-0 ml-2"/>
                                        </button>
                                    ) : (
                                        <div className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center">
                                            <span className="font-bold text-gray-900">{currentAgent?.name || 'Asignado a ti'}</span>
                                        </div>
                                    )}
                                </div>
                                {!isAgentView && (
                                    <div className="grid grid-cols-2 gap-2 md:flex md:flex-col md:w-32 shrink-0 pt-4 md:pt-0 mt-4 md:mt-0 border-t border-gray-100 md:border-0">
                                        <button onClick={() => onUpdate(lead.id, { status: lead.status === 'archived' ? 'new' : 'archived' })} className={`flex-1 md:flex-none py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${lead.status === 'archived' ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            {lead.status === 'archived' ? <><RotateCcw size={14}/> Restaurar</> : <><Archive size={14}/> Archivar</>}
                                        </button>
                                        <button onClick={handleDelete} className="flex-1 md:flex-none py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"><Trash2 size={14}/> Eliminar</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col flex-1 min-h-[300px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-widest"><PenTool size={16} className="text-rose-500"/> Bloc de Notas</h3>
                                <button onClick={handleSaveNotes} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${isSaving ? 'bg-green-500 text-white' : 'bg-black text-white hover:scale-105'}`}>
                                    {isSaving ? <><Check size={14}/> Guardado</> : <><Save size={14}/> Guardar</>}
                                </button>
                            </div>
                            <textarea className="flex-1 w-full bg-amber-50/30 rounded-2xl p-4 text-sm text-gray-800 border border-amber-100/50 resize-none outline-none focus:bg-white focus:border-rose-300 transition-all" placeholder="Escribe aquí los detalles de la llamada..." value={currentNotes} onChange={(e) => setCurrentNotes(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            
            {showAgentSelector && !isAgentView && (
                <AgentSelectionModal agents={agents.filter(a => a.status !== 'inactive')} onClose={() => setShowAgentSelector(false)} onSelect={(agentId) => { 
                    const selectedAgent = agents.find(a => a.id === agentId);
                    if (!selectedAgent) {
                        setDialog({ title: 'Quitar Asignación', message: '¿Estás seguro de quitar la asignación actual?', type: 'warning', onConfirm: () => { onAssignAgent(lead.id, ''); setShowAgentSelector(false); setDialog(null); }, onCancel: () => setDialog(null)});
                        return;
                    }

                    const getClean24h = (tStr) => {
                        if (!tStr) return null;
                        let clean = tStr.toLowerCase().replace(/[\s\.\u202F\u00A0]/g, '');
                        let isPM = clean.includes('p');
                        let isAM = clean.includes('a');
                        let nums = clean.replace(/[^0-9]/g, '');
                        if (nums.length < 3) return null;
                        let h = parseInt(nums.slice(0, -2), 10);
                        const m = nums.slice(-2);
                        if (isPM && h < 12) h += 12;
                        if (isAM && h === 12) h = 0;
                        return `${String(h).padStart(2, '0')}:${m}`; 
                    };

                    const targetTime24h = getClean24h(lead.localTime || lead.time);
                    const hasConflict = allLeads.some(l => {
                        if (l.id === lead.id || l.assignedTo !== agentId || l.status === 'archived') return false;
                        if (l.date !== lead.date) return false;
                        
                        const otherLocalTime = l.localTime || getLocalTimeInfo(l.date, l.time, l.state) || l.time;
                        const otherTime24h = getClean24h(otherLocalTime); 
                        if(!targetTime24h || !otherTime24h) return false;
                        return otherTime24h === targetTime24h; 
                    });

                    if (hasConflict) {
                        setShowAgentSelector(false);
                        setTimeout(() => setDialog({ 
                            title: 'Choque de Horario', 
                            message: `El agente ${selectedAgent.name} ya tiene otra cita agendada para el ${lead.date} a las ${lead.localTime || lead.time}.\n\nPor favor, selecciona otro agente o cambia la hora primero.`, 
                            type: 'warning', 
                            onConfirm: () => setDialog(null) 
                        }), 150);
                        return;
                    }

                    setDialog({ title: 'Asignar Agente', message: `¿Estás seguro de asignar este prospecto a ${selectedAgent.name}? Esto enviará los correos automáticamente.`, type: 'info', onConfirm: () => { onAssignAgent(lead.id, agentId); setShowAgentSelector(false); setDialog(null); }, onCancel: () => setDialog(null)});
                }}/>
            )}
        </div>
    );
};

const AgentDetailView = ({ agent, leads, onClose, onLeadClick, onSaveAgent, onDeleteAgent }) => {
    const [innerSearch, setInnerSearch] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(agent);
    const [dialog, setDialog] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // LIGHTBOX PARA LA FICHA

    useEffect(() => { setFormData(agent); }, [agent]);

    const assignedLeads = leads.filter(l => {
        if (l.assignedTo !== agent.id) return false;
        if (!innerSearch) return true;
        const term = innerSearch.toLowerCase();
        return (l.name && l.name.toLowerCase().includes(term)) || (l.phone && l.phone.includes(term)) || (l.state && l.state.toLowerCase().includes(term));
    });

    const handleToggleStatus = () => {
        const isInactive = agent.status === 'inactive';
        setDialog({ title: isInactive ? 'Reactivar Agente' : 'Inactivar Agente', message: isInactive ? `¿Deseas reactivar a ${agent.name}?` : `¿Deseas inactivar a ${agent.name}?`, type: 'warning', onConfirm: async () => { await onSaveAgent({ ...agent, status: isInactive ? 'active' : 'inactive' }); setDialog(null); }, onCancel: () => setDialog(null) });
    };

    const handleDelete = () => {
        setDialog({ title: 'Eliminar Agente', message: `¿Estás seguro de eliminar a ${agent.name}?`, type: 'danger', onConfirm: async () => { await onDeleteAgent(agent.id); setDialog(null); onClose(); }, onCancel: () => setDialog(null) });
    };

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const handlePhotoChange = (e) => { const file = e.target.files[0]; if (file) { if (file.size > 1048576) { alert("Máximo 1MB."); return; } const reader = new FileReader(); reader.onloadend = () => setFormData(prev => ({...prev, photo: reader.result})); reader.readAsDataURL(file); }};
    
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        await onSaveAgent({ ...formData, timestamp: agent.timestamp || Date.now() });
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-[#F5F5F7] z-[60] flex flex-col animate-slide-up">
            <CustomDialog isOpen={!!dialog} {...dialog} />

            {/* LIGHTBOX DE LICENCIAS */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/90 z-[99999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 p-3 rounded-full backdrop-blur-md transition-colors"><X size={24}/></button>
                    <img src={previewImage} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
                </div>
            )}
            
            <div className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 md:p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shadow-sm"><ArrowLeft size={20} className="text-gray-700"/></button>
                    <div>
                        <h2 className="font-bold text-lg md:text-xl text-gray-900 tracking-tight leading-tight">Perfil de Equipo</h2>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mt-0.5">Gestión de Agente</p>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-12">
                <div className="grid md:grid-cols-12 gap-6 max-w-6xl mx-auto items-start">
                    
                    {/* COLUMNA IZQUIERDA: PERFIL DEL AGENTE */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
                            {!isEditing ? (
                                <div className="flex flex-col items-center text-center animate-fade-in">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-white flex items-center justify-center font-bold text-3xl border-4 border-gray-50 overflow-hidden shadow-sm text-gray-400 mb-4 relative group cursor-pointer" onClick={() => agent.photo && setPreviewImage(agent.photo)}>
                                        {agent.photo ? <img src={agent.photo} className="w-full h-full object-cover"/> : agent.name.charAt(0).toUpperCase()}
                                        {agent.photo && <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Search size={14} className="text-white"/></div>}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        {agent.name}
                                        {agent.status === 'inactive' && <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded uppercase tracking-widest border border-gray-200">Inactivo</span>}
                                    </h3>
                                    {agent.bio && <p className="text-sm text-gray-500 italic mt-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-balance leading-relaxed">"{agent.bio}"</p>}
                                    
                                    <div className="w-full space-y-3 text-sm mt-6 text-left">
                                        {agent.email && <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 hover:text-blue-600 transition-colors cursor-pointer"><Mail size={16} className="text-gray-400 shrink-0"/> <span className="truncate font-medium">{agent.email}</span></a>}
                                        {agent.phone && <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 hover:text-blue-600 transition-colors cursor-pointer"><Phone size={16} className="text-gray-400 shrink-0"/> <span className="font-medium">{agent.phone}</span></a>}
                                        
                                        {agent.companies && <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100"><Building size={16} className="text-gray-400 shrink-0"/> <span className="truncate font-medium">{agent.companies}</span></div>}
                                        {agent.isAgency && <div className="inline-flex mt-1 bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-purple-100"><Users size={12} className="mr-1"/> Tiene Agencia</div>}

                                        {/* NUEVO: BLOQUE ELEGANTE DE LICENCIAS CON MINIATURAS */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
                                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><FileText size={14}/> Licencias Estatales</h5>
                                            <div className="flex flex-col gap-3">
                                                {agent.licensesArray && agent.licensesArray.length > 0 ? (
                                                    agent.licensesArray.map((lic, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 p-2 rounded-xl shadow-sm hover:border-rose-300 transition-colors w-full">
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden cursor-pointer group relative border border-gray-200 shrink-0" onClick={() => lic.fileStr && setPreviewImage(lic.fileStr)}>
                                                                {lic.fileStr ? <img src={lic.fileStr} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/> : <span className="text-[8px] text-center p-1 text-gray-400 flex items-center justify-center h-full">Sin Foto</span>}
                                                                {lic.fileStr && <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Search size={14} className="text-white"/></div>}
                                                            </div>
                                                            <div className="pr-3">
                                                                <p className="text-sm font-bold text-gray-900">{lic.state}</p>
                                                                <p className="text-[10px] text-gray-500 font-mono tracking-wider">{lic.number}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {agent.license || 'Sin estados configurados'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full mt-8 space-y-3 pt-6 border-t border-gray-100">
                                        <button onClick={() => setIsEditing(true)} className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"><Edit2 size={16}/> Editar Ficha</button>
                                        <div className="flex gap-3">
                                            <button onClick={handleToggleStatus} className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                                {agent.status === 'inactive' ? <RotateCcw size={14} className="text-blue-500"/> : <MinusCircle size={14} className="text-amber-500"/>} {agent.status === 'inactive' ? 'Reactivar' : 'Inactivar'}
                                            </button>
                                            <button onClick={handleDelete} className="flex-1 py-3 bg-white border border-red-100 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                                <Trash2 size={14}/> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveProfile} className="space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                        <h4 className="font-bold text-gray-900 text-lg">Editando Perfil</h4>
                                        <button type="button" onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={16}/></button>
                                    </div>
                                    <div className="flex flex-col items-center mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden mb-3 border border-gray-200 relative group shadow-sm">
                                            {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <User size={24} className="text-gray-300"/>}
                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-[10px] font-bold backdrop-blur-sm">Subir<input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} /></label>
                                        </div>
                                    </div>
                                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nombre</label><input name="name" required value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 transition-all text-sm font-medium text-gray-900" /></div>
                                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Estados (Resumen)</label><input name="license" value={formData.license} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 transition-all text-sm font-medium text-gray-900" /></div>
                                    
                                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5"><Building size={14}/> Compañías</label><input name="companies" value={formData.companies || ''} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 transition-all text-sm font-medium" /></div>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="checkbox" name="isAgency" checked={formData.isAgency || false} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                        <span className="text-sm font-bold text-gray-700">Tengo una agencia a mi cargo</span>
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 transition-all text-sm font-medium text-gray-900" /></div>
                                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Teléfono</label><input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 transition-all text-sm font-medium text-gray-900" /></div>
                                    </div>
                                    <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Biografía</label><textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 transition-all text-sm resize-none text-gray-900" /></div>
                                    <div className="pt-4">
                                        <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"><Save size={16}/> Guardar Cambios</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: PROSPECTOS ASIGNADOS */}
                    <div className="md:col-span-8 space-y-6 flex flex-col h-full">
                        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-soft border border-gray-100 flex-1 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg md:text-xl"><ShoppingCart size={22} className="text-gray-400"/> Cartera Asignada</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">Gestionando <strong className="text-gray-900">{assignedLeads.length}</strong> prospectos</p>
                                </div>
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                    <input type="text" placeholder="Buscar prospecto..." className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium" value={innerSearch} onChange={(e) => setInnerSearch(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-hide">
                                {assignedLeads.length > 0 ? (
                                    assignedLeads.map(lead => (
                                        <div key={lead.id} onClick={() => onLeadClick(lead)} className="p-4 md:p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-10 rounded-full ${lead.status === 'new' ? 'bg-green-400' : lead.status === 'archived' ? 'bg-gray-300' : 'bg-blue-400'}`}></div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-rose-600 transition-colors">{lead.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] md:text-xs text-gray-500 font-medium">
                                                        <span className="flex items-center gap-1 font-bold text-gray-700"><Clock size={12} className="text-blue-500"/> {lead.date ? new Date(lead.date + 'T12:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short'}) : ''} {lead.localTime || lead.time}</span>
                                                        <span className="hidden md:inline w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                                                        <span className="flex items-center gap-1"><Phone size={12}/> {lead.phone}</span>
                                                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider text-gray-600 ml-1">{lead.state}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-black group-hover:border-black transition-colors shrink-0">
                                                <ChevronRight size={18} className="text-gray-400 group-hover:text-white transition-colors"/>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                                        <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100"><ShoppingCart size={24} className="text-gray-300"/></div>
                                        <p className="font-bold text-gray-600 text-base">Cartera vacía</p>
                                        <p className="text-sm text-gray-400 mt-1">Este agente aún no tiene prospectos asignados.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminCalendar = ({ leads, agents = [], onLeadClick, onOpenSettings }) => {
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
                                    {dayLeads.slice(0, 3).map(lead => {
                                        const assignedAgent = agents.find(a => a.id === lead.assignedTo);
                                        const agentName = assignedAgent ? assignedAgent.name : 'Sin asignar';
                                        const isAssigned = !!lead.assignedTo;
                                        return (
                                        <div key={lead.id} onClick={(e) => { e.stopPropagation(); onLeadClick(lead); }} className={`${isAssigned ? 'bg-green-50 hover:bg-green-100 border-green-200' : 'bg-blue-50 hover:bg-blue-100 border-blue-100'} border p-1.5 rounded-md cursor-pointer transition-colors shadow-sm hidden md:flex flex-col gap-1`}>
                                            <div className={`font-bold text-[10px] ${isAssigned ? 'text-green-700' : 'text-blue-700'} flex items-center gap-1`}><Clock size={10}/> {lead.localTime || lead.time}</div>
                                            <div className="text-[9.5px] truncate font-bold text-gray-800 flex items-center gap-1"><User size={10} className="text-gray-400 shrink-0"/> {lead.name}</div>
                                            <div className="text-[9px] truncate text-gray-500 font-medium flex items-center gap-1"><ShoppingCart size={10} className="text-gray-400 shrink-0"/> {agentName}</div>
                                        </div>
                                    )})}
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
                                {dayLeads.map(lead => {
                                    const assignedAgent = agents.find(a => a.id === lead.assignedTo);
                                    const agentName = assignedAgent ? assignedAgent.name : 'Sin asignar';
                                    const isAssigned = !!lead.assignedTo;
                                    return (
                                    <div key={lead.id} onClick={() => onLeadClick(lead)} className={`bg-white border border-gray-200 p-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-1.5 ${isAssigned ? 'hover:border-green-400' : 'hover:border-blue-300'}`}>
                                        <div className={`font-bold text-[10px] md:text-xs flex items-center gap-1 ${isAssigned ? 'text-green-600' : 'text-blue-600'}`}><Clock size={12}/> {lead.localTime || lead.time}</div>
                                        <div className="font-bold text-[11px] md:text-sm text-gray-900 leading-tight group-hover:text-rose-600 transition-colors truncate flex items-center gap-1"><User size={12} className="text-gray-400 shrink-0"/> {lead.name}</div>
                                        <div className="font-medium text-[10px] md:text-xs text-gray-500 truncate flex items-center gap-1"><ShoppingCart size={12} className="text-gray-400 shrink-0"/> {agentName}</div>
                                    </div>
                                )})}
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
                            dayLeads.map(lead => {
                                const assignedAgent = agents.find(a => a.id === lead.assignedTo);
                                const agentName = assignedAgent ? assignedAgent.name : 'Sin asignar';
                                const isAssigned = !!lead.assignedTo;
                                return (
                                <div key={lead.id} onClick={() => onLeadClick(lead)} className={`bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group ${isAssigned ? 'hover:border-green-400' : 'hover:border-blue-300'}`}>
                                    <div className="w-20 md:w-24 text-center shrink-0 border-r border-gray-100 pr-4">
                                        <span className={`block font-bold text-sm md:text-base ${isAssigned ? 'text-green-600' : 'text-blue-600'}`}>{lead.localTime || lead.time}</span>
                                    </div>
                                    <div className="flex-1 min-w-0 pl-2">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <User size={14} className="text-gray-400 shrink-0"/>
                                            <h4 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-rose-600 transition-colors truncate">{lead.name}</h4>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1"><ShoppingCart size={12}/> {agentName}</span>
                                            <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-1"><Phone size={12}/> {lead.phone}</span>
                                            {lead.state && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">{lead.state}</span>}
                                        </div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center transition-colors shrink-0 border border-gray-100 ${isAssigned ? 'group-hover:bg-green-50 group-hover:text-green-600' : 'group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                        <ChevronRight size={18}/>
                                    </div>
                                </div>
                            )})
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

                    {onOpenSettings && (
                        <button onClick={onOpenSettings} className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 hover:text-rose-600 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"><Settings size={14}/> Horarios</button>
                    )}
                </div>
            </div>

            {view === 'month' && renderMonth()}
            {view === 'week' && renderWeek()}
            {view === 'day' && renderDay()}
            {view === 'year' && renderYear()}

            {onOpenSettings && (
                <div className="lg:hidden p-3 border-t border-gray-200 bg-white shrink-0">
                    <button onClick={onOpenSettings} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"><Settings size={14}/> Configurar Horas Disponibles</button>
                </div>
            )}
        </div>
    );
};

const WebhookSettingsModal = ({ webhooks, onSave, onClose }) => {
    const [localHooks, setLocalHooks] = useState(webhooks || { telegram: '', assignment: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const verifyPassword = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, auth.currentUser.email, password);
            setShowAuth(false);
            setIsEditing(true);
            setPassword('');
        } catch (err) {
            setError('Contraseña incorrecta. Intente de nuevo.');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(localHooks);
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-fade-in">
            <div className="glass-card bg-white/95 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18}/></button>
                
                <div className="mb-6 pr-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-black text-white p-2 rounded-xl"><Settings size={20}/></div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">Webhooks Make</h3>
                    </div>
                    <p className="text-sm text-gray-500">Configura las URLs de conexión externa.</p>
                </div>

                {showAuth ? (
                    <form onSubmit={verifyPassword} className="space-y-4 animate-slide-up">
                        <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl">
                            <p className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={14}/> Autenticación Requerida</p>
                            <input type="password" placeholder="Ingresa tu contraseña de Admin..." className="w-full p-3.5 bg-white border border-rose-200 rounded-xl outline-none focus:border-rose-500 text-sm font-medium shadow-inner" value={password} onChange={e=>setPassword(e.target.value)} required autoFocus/>
                            {error && <p className="text-xs text-red-500 mt-2 font-bold">{error}</p>}
                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={()=>setShowAuth(false)} className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 shadow-md transition-colors">Desbloquear</button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-5 animate-slide-up">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Webhook: Telegram (Nuevo Lead)</label>
                            <input 
                                type={isEditing ? "text" : "password"} 
                                value={localHooks.telegram} 
                                onChange={e => setLocalHooks({...localHooks, telegram: e.target.value})}
                                readOnly={!isEditing}
                                placeholder="https://hook..."
                                className={`w-full p-3.5 border rounded-xl outline-none transition-all text-sm font-medium ${isEditing ? 'bg-white border-blue-300 focus:ring-4 focus:ring-blue-500/10 text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed tracking-[0.2em]'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Webhook: Correo (Asignar Agente)</label>
                            <input 
                                type={isEditing ? "text" : "password"} 
                                value={localHooks.assignment} 
                                onChange={e => setLocalHooks({...localHooks, assignment: e.target.value})}
                                readOnly={!isEditing}
                                placeholder="https://hook..."
                                className={`w-full p-3.5 border rounded-xl outline-none transition-all text-sm font-medium ${isEditing ? 'bg-white border-blue-300 focus:ring-4 focus:ring-blue-500/10 text-gray-900' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed tracking-[0.2em]'}`}
                            />
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            {!isEditing ? (
                                <button onClick={() => setShowAuth(true)} className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 rounded-xl font-bold text-sm transition-colors shadow-sm"><Edit2 size={16}/> Habilitar Edición</button>
                            ) : (
                                <button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-xl font-bold text-sm hover:scale-[1.02] shadow-xl transition-transform">{isSaving ? 'Guardando...' : 'Guardar y Proteger'}</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PriceSettingsModal = ({ generalSettings, onSave, onClose }) => {
    const [regPrice, setRegPrice] = useState(generalSettings?.regularPrice ?? 45);
    const [offPrice, setOffPrice] = useState(generalSettings?.offerPrice ?? 35);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({
            ...generalSettings,
            regularPrice: Number(regPrice),
            offerPrice: Number(offPrice)
        });
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-fade-in">
            <div className="glass-card bg-white/95 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18}/></button>
                
                <div className="mb-6 pr-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-50 text-green-600 p-2.5 rounded-xl border border-green-100"><DollarSign size={20} strokeWidth={2.5}/></div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">Precios de Citas</h3>
                    </div>
                    <p className="text-sm text-gray-500">Ajusta los valores para el Marketplace.</p>
                </div>

                <div className="space-y-5 animate-slide-up">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Precio Regular ($)</label>
                        <input 
                            type="number" 
                            value={regPrice} 
                            onChange={e => setRegPrice(e.target.value)}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all text-sm font-bold text-gray-900 shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Precio Oferta / Urgente ($)</label>
                        <input 
                            type="number" 
                            value={offPrice} 
                            onChange={e => setOffPrice(e.target.value)}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 rounded-xl outline-none transition-all text-sm font-bold text-red-600 shadow-inner"
                        />
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-gray-100">
                        <button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors">Cancelar</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3.5 bg-black text-white rounded-xl font-bold text-sm hover:scale-[1.02] shadow-xl transition-transform flex items-center justify-center gap-2">
                            {isSaving ? 'Guardando...' : <><Save size={16}/> Guardar</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = ({ leads, agents, agentRequests = [], onApproveRequest, onRejectRequest, onUpdateAgentRequest, schedule, webhooks, generalSettings, onUpdateLead, bulkUpdateLeads, bulkDeleteLeads, onDeleteLead, onSaveAgent, onDeleteAgent, onUpdateSchedule, onUpdateWebhooks, onUpdateGeneralSettings, onClose, onLogout }) => {    
    const ADMIN_TABS = ['active', 'marketplace', 'urgent', 'assigned', 'archived', 'agents', 'schedule'];
    const [activeTab, setActiveTab] = useState(() => {
        const hashParts = window.location.hash.replace('#', '').split('/');
        return ADMIN_TABS.includes(hashParts[0]) ? hashParts[0] : 'active';
    }); 

    const [agentSubTab, setAgentSubTab] = useState('activos'); 

    // --- NUEVOS ESTADOS ---
    const [editingRequest, setEditingRequest] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [viewingLead, setViewingLead] = useState(null);
    const [viewingAgent, setViewingAgent] = useState(null);
    const [isBulkAgentSelectOpen, setIsBulkAgentSelectOpen] = useState(false);
    const [individualAgentSelectLeadId, setIndividualAgentSelectLeadId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showScheduleSettings, setShowScheduleSettings] = useState(false);
    const [showWebhookSettings, setShowWebhookSettings] = useState(false);
    const [showPriceSettings, setShowPriceSettings] = useState(false);
    const [dialog, setDialog] = useState(null);

    const [timeTick, setTimeTick] = useState(0);
    useEffect(() => { const timer = setInterval(() => setTimeTick(t => t + 1), 60000); return () => clearInterval(timer); }, []);

    useEffect(() => {
        const hashParts = window.location.hash.replace('#', '').split('/');
        if (hashParts.length > 1 && leads.length > 0 && !viewingLead) {
            const savedLead = leads.find(l => l.id === hashParts[1]);
            if (savedLead) setViewingLead(savedLead);
        }
    }, [leads]); 

    useEffect(() => { 
        const hashLead = viewingLead ? `/${viewingLead.id}` : '';
        window.location.hash = `${activeTab}${hashLead}`; 
    }, [activeTab, viewingLead]);

    useEffect(() => {
        const handleHash = () => {
            const hashParts = window.location.hash.replace('#', '').split('/');
            if (ADMIN_TABS.includes(hashParts[0])) setActiveTab(hashParts[0]);
            if (hashParts.length === 1 && viewingLead) setViewingLead(null);
        };
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, [viewingLead]);

    const getHoursUntil = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return 999;
        try {
            let clean = timeStr.toLowerCase().replace(/[\s\.\u202F\u00A0]/g, '');
            let isPM = clean.includes('p');
            let isAM = clean.includes('a');
            let nums = clean.replace(/[^0-9]/g, '');
            if (nums.length < 3) return 999;
            let h = parseInt(nums.slice(0, -2), 10);
            const m = nums.slice(-2);
            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;
            const aptDate = new Date(`${dateStr}T${String(h).padStart(2, '0')}:${m}:00`);
            const now = new Date();
            return (aptDate - now) / (1000 * 60 * 60);
        } catch(e) { return 999; }
    };

    const processedLeads = leads.map(l => {
        const localTime = getLocalTimeInfo(l.date, l.time, l.state);
        return { ...l, localTime, hoursUntil: getHoursUntil(l.date, localTime || l.time) };
    });

    const urgentLeadsCount = processedLeads.filter(l => l.status !== 'archived' && !l.assignedTo && l.hoursUntil <= 2).length;

    const getFilteredLeads = () => {
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            return processedLeads.filter(l => 
                (l.name && l.name.toLowerCase().includes(lower)) || 
                (l.phone && l.phone.includes(lower)) || 
                (l.email && l.email.toLowerCase().includes(lower)) || 
                (l.state && l.state.toLowerCase().includes(lower)) ||
                (l.notes && l.notes.toLowerCase().includes(lower))
            );
        }
        let list = [];
        if(activeTab === 'active') list = processedLeads.filter(l => l.status === 'new' && !l.assignedTo);
        else if(activeTab === 'marketplace') list = processedLeads.filter(l => l.status === 'marketplace' && !l.assignedTo && l.hoursUntil > 2);
        else if(activeTab === 'urgent') list = processedLeads.filter(l => l.status !== 'archived' && !l.assignedTo && l.hoursUntil <= 2);
        else if(activeTab === 'assigned') list = processedLeads.filter(l => l.status !== 'archived' && l.assignedTo);
        else if(activeTab === 'archived') list = processedLeads.filter(l => l.status === 'archived');
        return list;
    };

    const displayAgents = agents;
    const activeAgentsList = displayAgents.filter(a => a.status !== 'inactive');
    const inactiveAgentsList = displayAgents.filter(a => a.status === 'inactive');

    const getFilteredAgentsView = () => {
        let list = agentSubTab === 'activos' ? activeAgentsList : inactiveAgentsList;
        if(searchTerm) { 
            const lower = searchTerm.toLowerCase(); 
            list = list.filter(a => {
                // Generamos una lista de nombres de estados completos para este agente
                const fullStateNames = a.license ? a.license.split(',').map(item => {
                    const match = item.match(/\(([^)]+)\)/); // Extrae la sigla entre paréntesis (FL)
                    const abbr = match ? match[1] : item.trim();
                    const stateObj = FULL_US_STATES.find(s => s.abbr === abbr);
                    return stateObj ? stateObj.name.toLowerCase() : '';
                }).join(' ') : '';

                return (
                    (a.name && a.name.toLowerCase().includes(lower)) ||   // Busca por Nombre
                    (a.email && a.email.toLowerCase().includes(lower)) || // Busca por Email
                    (a.phone && a.phone.includes(lower)) ||               // Busca por Teléfono
                    fullStateNames.includes(lower)                        // Busca por Estado (Ej: "florida")
                );
            }); 
        }
        return list;
    };
    const currentViewAgents = getFilteredAgentsView();

    const filteredLeads = activeTab !== 'agents' && activeTab !== 'schedule' ? getFilteredLeads() : [];
    
    const sortedLeads = [...filteredLeads].sort((a, b) => {
        const aHasDate = a.hoursUntil !== 999;
        const bHasDate = b.hoursUntil !== 999;
        if (aHasDate && !bHasDate) return -1;
        if (!aHasDate && bHasDate) return 1;
        if (!aHasDate && !bHasDate) return b.timestamp - a.timestamp;
        if (activeTab === 'archived') return b.hoursUntil - a.hoursUntil; 
        else return a.hoursUntil - b.hoursUntil;
    });

    const toggleSelectAll = () => { if (selectedLeads.length === sortedLeads.length && sortedLeads.length > 0) setSelectedLeads([]); else setSelectedLeads(sortedLeads.map(l => l.id)); };
    const toggleSelect = (id) => { setSelectedLeads(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); };

    const triggerAssignmentWebhook = (leadObj, agentObj) => {
        if (!webhooks || !webhooks.assignment) return;
        const callTypeMap = { 'video': 'Videollamada', 'call': 'Llamada Regular' };
        const policyMap = { 'me': 'A mí mismo', 'spouse': 'A mi cónyuge', 'children': 'A mis hijos', 'parents': 'A mis padres' };
        const motivationMap = { 'funeral': 'Gastos Funerarios', 'debt': 'Pagar Deudas', 'income': 'Reemplazo de Ingresos', 'legacy': 'Dejar Herencia', 'burden': 'Evitar carga financiera' };
        const coverageMap = { '5k': '$5,000', '10k': '$10,000 - $15,000', '15k': '$15,000 - $20,000', '20k': '$20,000 - $25,000', '25k': '$25,000 o más' };
        
        let formattedDate = leadObj.date;
        if (leadObj.date) {
            const dateObj = new Date(leadObj.date + 'T12:00:00');
            formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        
        const safeCoverage = String(leadObj.coverage_amount || '').toLowerCase();
        const translatedLead = {
            ...leadObj,
            date: formattedDate,
            callType: callTypeMap[leadObj.callType] || leadObj.callType,
            policy_for: leadObj.policy_for ? leadObj.policy_for.map(val => policyMap[val] || val).join(', ') : '',
            motivation: leadObj.motivation ? leadObj.motivation.map(val => motivationMap[val.toLowerCase()] || val).join(', ') : '',
            coverage_amount: coverageMap[safeCoverage] || leadObj.coverage_amount,
            time: leadObj.localTime || leadObj.time
        };

        fetch(webhooks.assignment, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lead: translatedLead, agent: agentObj })
        }).catch(e => console.error("Error Webhook Correo:", e));
    };

    const handleBulkAction = async (action, value) => {
        if(!window.confirm(`⚠️ CONFIRMACIÓN\n\n¿Deseas aplicar esta acción a ${selectedLeads.length} prospectos?`)) return;
        if(action === 'delete') await bulkDeleteLeads(selectedLeads);
        else if(action === 'archive') await bulkUpdateLeads(selectedLeads, { status: 'archived' });
        else if(action === 'restore') await bulkUpdateLeads(selectedLeads, { status: 'new' });
        else if(action === 'marketplace') await bulkUpdateLeads(selectedLeads, { status: 'marketplace' });
        else if(action === 'assign') {
            await bulkUpdateLeads(selectedLeads, { assignedTo: value });
            const assignedAgent = agents.find(a => a.id === value);
            if (assignedAgent) {
                selectedLeads.forEach(leadId => {
                    const assignedLead = processedLeads.find(l => l.id === leadId);
                    if (assignedLead) triggerAssignmentWebhook(assignedLead, assignedAgent);
                });
            }
        }
        setSelectedLeads([]);
    };

    const handleDeleteLead = (e, id) => { e.stopPropagation(); if (window.confirm('⚠️ ADVERTENCIA\n\n¿Eliminar prospecto permanentemente?')) onDeleteLead(id); };
    
    const handleSaveAgent = async (agentData) => {
        await onSaveAgent(agentData);
        setIsAgentModalOpen(false);
        setEditingAgent(null);
    };

    // Función para activar/inactivar
    const toggleAgentStatus = async (e, agentObj) => {
        e.stopPropagation();
        const newStatus = agentObj.status === 'inactive' ? 'active' : 'inactive';
        await onSaveAgent({ ...agentObj, status: newStatus });
    };

    return (
        <div className="fixed inset-0 bg-apple-gray z-50 flex flex-col animate-fade-in font-sans">
            
            {/* VISOR DE IMÁGENES EN PANTALLA COMPLETA (LIGHTBOX) */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/90 z-[99999] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 p-3 rounded-full backdrop-blur-md transition-colors"><X size={24}/></button>
                    <img src={previewImage} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
                </div>
            )}

            {/* FORMULARIO MODAL PARA EDITAR SOLICITUDES PENDIENTES */}
            {editingRequest && (
                <AgentRegistrationForm 
                    initialData={editingRequest}
                    onCancel={() => setEditingRequest(null)}
                    onSubmit={async (data) => {
                        await onUpdateAgentRequest(data.id, data);
                        setEditingRequest(null);
                    }}
                />
            )}

            <div className="glass-panel px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center z-20 gap-3 shadow-sm">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-black text-white p-2 rounded-xl shadow-md"><ShieldCheck size={20} /></div>
                        <div className="leading-tight">
                            <h2 className="font-bold text-gray-900 text-base md:text-lg tracking-tight">Admin<span className="font-light">Panel</span></h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seguros</p>
                        </div>
                    </div>
                    {/* Botones Móvil */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button 
                            onClick={() => onUpdateGeneralSettings({ ...generalSettings, marketplaceMode: !generalSettings?.marketplaceMode })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all shadow-sm ${generalSettings?.marketplaceMode ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-gray-400 border-gray-200'}`}
                        >
                            <div className={`w-2 h-2 rounded-full transition-colors ${generalSettings?.marketplaceMode ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span>Auto</span>
                        </button>
                        <button onClick={() => setShowPriceSettings(true)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors bg-white border border-gray-200 rounded-full shadow-sm"><DollarSign size={16}/></button>
                        <button onClick={() => setShowWebhookSettings(true)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors bg-white border border-gray-200 rounded-full shadow-sm"><Settings size={16}/></button>
                        <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors bg-white border border-gray-200 rounded-full shadow-sm"><LogOut size={16}/></button>
                    </div>
                </div>
                
                {activeTab !== 'schedule' && (
                    <div className="relative w-full md:w-[400px] group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={16}/>
                        <input type="text" placeholder={`Buscar ${activeTab === 'agents' ? 'agente por estado o nombre' : 'prospecto globalmente'}...`} className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 rounded-2xl outline-none transition-all text-sm font-medium shadow-inner focus:shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                )}
                
                {/* Botones Desktop */}
                <div className="hidden md:flex items-center gap-2">
                     <button 
                         onClick={() => onUpdateGeneralSettings({ ...generalSettings, marketplaceMode: !generalSettings?.marketplaceMode })}
                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm mr-2 ${generalSettings?.marketplaceMode ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                     >
                         <div className={`w-2 h-2 rounded-full transition-colors ${generalSettings?.marketplaceMode ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></div>
                         <span>Auto-Marketplace</span>
                     </button>
                     <div className="w-px h-6 bg-gray-200 mx-1"></div>
                     <button onClick={() => setShowPriceSettings(true)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-600 transition-colors shadow-sm"><DollarSign size={18} /></button>
                     <button onClick={() => setShowWebhookSettings(true)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"><Settings size={18} /></button>
                     <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 rounded-xl hover:bg-red-50 transition-all shadow-sm"><LogOut size={16}/> Salir</button>
                </div>
            </div>

            {/* Pestañas de Navegación Admin */}
            <div className="flex px-4 md:px-6 gap-6 md:gap-8 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm overflow-x-auto z-10 scrollbar-hide shrink-0 pt-2 pb-0">
                {['active', 'marketplace', 'urgent', 'assigned', 'archived', 'agents', 'schedule'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => {setActiveTab(tab); setSelectedLeads([]); setSearchTerm(''); setShowScheduleSettings(false);}} 
                        className={`py-3 text-xs md:text-sm font-semibold tracking-wide border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            activeTab === tab 
                                ? (tab === 'urgent' ? 'border-red-600 text-red-600' : 'border-gray-900 text-gray-900') 
                                : (tab === 'urgent' ? 'border-transparent text-red-500/80 hover:text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600')
                        }`}
                    >
                        {tab === 'active' && 'Bandeja'}
                        {tab === 'marketplace' && 'Marketplace'}
                        {tab === 'urgent' && (
                            <>
                                Urgente
                                {urgentLeadsCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-pulse leading-none">{urgentLeadsCount}</span>}
                            </>
                        )}
                        {tab === 'assigned' && 'Asignados'}
                        {tab === 'archived' && 'Archivados'}
                        {/* AQUÍ EL GLOBO ROJO EN LA PESTAÑA EQUIPO */}
                        {tab === 'agents' && (
                            <span className="flex items-center gap-1.5">
                                Equipo
                                {agentRequests?.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-pulse leading-none">{agentRequests.length}</span>}
                            </span>
                        )}
                        {tab === 'schedule' && 'Agenda'}
                    </button>
                ))}
            </div>

            {selectedLeads.length > 0 && activeTab !== 'agents' && activeTab !== 'schedule' && (
                <div className="fixed bottom-4 md:bottom-8 left-0 w-full flex justify-center px-4 z-[100] pointer-events-none">
                    <div className="bg-black/95 backdrop-blur-md text-white p-3 md:px-6 md:py-3 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-3 md:gap-6 animate-slide-up border border-gray-700 w-full max-w-[400px] md:max-w-none pointer-events-auto">
                        <span className="text-xs md:text-sm font-bold flex items-center justify-center gap-2 shrink-0"><Check size={16} className="text-green-400"/> {selectedLeads.length} seleccionados</span>
                        <div className="hidden md:block h-5 w-px bg-gray-700"></div>
                        <div className="grid grid-cols-3 md:flex gap-2 w-full md:w-auto">
                            {activeTab !== 'archived' ? (
                                <>
                                    <button onClick={() => setIsBulkAgentSelectOpen(true)} className="flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors"><UserPlus size={18} className="md:w-4 md:h-4"/> <span>Agente</span></button>
                                    <button onClick={() => handleBulkAction('marketplace')} className="flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 text-amber-300 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors"><ShoppingCart size={18} className="md:w-4 md:h-4"/> <span>Vender</span></button>
                                    <button onClick={() => handleBulkAction('archive')} className="flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors"><Archive size={18} className="md:w-4 md:h-4"/> <span>Archivar</span></button>
                                </>
                            ) : (
                                <button onClick={() => handleBulkAction('restore')} className="col-span-3 md:col-span-1 flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors"><RotateCcw size={18} className="md:w-4 md:h-4"/> <span>Restaurar</span></button>
                            )}
                            <button onClick={() => handleBulkAction('delete')} className="flex flex-col md:flex-row items-center justify-center gap-1.5 px-1 py-2 md:py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-300 rounded-xl md:rounded-lg text-[10px] md:text-sm font-medium transition-colors"><Trash2 size={18} className="md:w-4 md:h-4"/> <span>Eliminar</span></button>
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
                        <AdminCalendar leads={processedLeads} agents={agents} onLeadClick={setViewingLead} onOpenSettings={() => setShowScheduleSettings(true)} />
                    )
                 ) :
                 activeTab === 'agents' ? (
                    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Gestión de Equipo</h3>
                                <p className="text-sm text-gray-500 mt-1">Administra tu personal de ventas y evalúa solicitudes.</p>
                            </div>
                            <button onClick={() => {setEditingAgent(null); setIsAgentModalOpen(true);}} className="bg-black text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full font-medium flex items-center gap-2 shadow-lg hover:scale-105 transition-transform text-xs md:text-sm shrink-0">
                                <UserPlus size={16}/> <span className="hidden md:inline">Nuevo Agente</span><span className="md:hidden">Nuevo</span>
                            </button>
                        </div>

                        {/* LAS 3 SUB-PESTAÑAS (Activos, Inactivos, Solicitudes) CORREGIDAS */}
                        <div className="flex gap-4 md:gap-8 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                            <button onClick={() => setAgentSubTab('activos')} className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${agentSubTab === 'activos' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                                Activos ({activeAgentsList.length})
                            </button>
                            <button onClick={() => setAgentSubTab('inactivos')} className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${agentSubTab === 'inactivos' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                                Inactivos ({inactiveAgentsList.length})
                            </button>
                            <button onClick={() => setAgentSubTab('solicitudes')} className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${agentSubTab === 'solicitudes' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                                Solicitudes 
                                {agentRequests?.length > 0 ? (
                                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-pulse ml-0.5">({agentRequests.length})</span>
                                ) : (
                                    <span className="text-gray-400">({agentRequests.length})</span>
                                )}
                            </button>
                        </div>

                        {agentSubTab === 'solicitudes' && (
                            agentRequests.length === 0 ? (
                                <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm mt-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><UserPlus size={24} className="text-gray-300"/></div>
                                    <p className="text-gray-500 font-medium text-sm">No hay solicitudes pendientes en este momento.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {agentRequests.map(req => (
                                        <div key={req.id} className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col md:flex-row gap-6">
                                            <div className="flex flex-col items-center md:items-start md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6 shrink-0">
                                                <div className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-sm overflow-hidden mb-4 relative group cursor-pointer" onClick={() => req.photo && setPreviewImage(req.photo)}>
                                                    {req.photo ? <img src={req.photo} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><User size={32}/></div>}
                                                    {req.photo && <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Search size={16} className="text-white"/></div>}
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-900 text-center md:text-left">{req.fullName}</h4>
                                                
                                                <a href={`mailto:${req.email}`} className="text-sm text-blue-600 hover:text-blue-800 transition-colors mb-4 text-center md:text-left flex items-center justify-center md:justify-start gap-1.5 font-medium mt-1">
                                                    <Mail size={14}/> {req.email}
                                                </a>
                                                
                                                <div className="w-full space-y-2 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                    <a href={`tel:${req.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer w-full">
                                                        <Phone size={14} className="text-rose-500 shrink-0"/> <strong className="truncate">{req.phone}</strong>
                                                    </a>
                                                    <div className="flex items-center gap-2 text-gray-700"><Building size={14} className="text-rose-500 shrink-0"/> <span className="truncate">{req.companies || 'Independiente'}</span></div>
                                                    {req.isAgency && <div className="inline-flex mt-2 bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-purple-100"><Users size={12} className="mr-1"/> Tiene Agencia</div>}
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="mb-6">
                                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Biografía (Para prospectos)</h5>
                                                    <p className="text-sm text-gray-700 italic bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 leading-relaxed text-balance">"{req.bio}"</p>
                                                </div>
                                                
                                                <div>
                                                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block flex items-center gap-1.5"><FileText size={14}/> Licencias Estatales</h5>
                                                    <div className="flex flex-wrap gap-3">
                                                        {req.licenses && req.licenses.map((lic, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 p-2 rounded-xl shadow-sm hover:border-rose-300 transition-colors">
                                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden cursor-pointer group relative border border-gray-200 shrink-0" onClick={() => lic.fileStr && setPreviewImage(lic.fileStr)}>
                                                                    {lic.fileStr ? <img src={lic.fileStr} className="w-full h-full object-cover group-hover:scale-110 transition-transform"/> : <span className="text-[8px] text-center p-1 text-gray-400 flex items-center justify-center h-full">Sin Foto</span>}
                                                                    {lic.fileStr && <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Search size={14} className="text-white"/></div>}
                                                                </div>
                                                                <div className="pr-3">
                                                                    <p className="text-sm font-bold text-gray-900">{lic.state}</p>
                                                                    <p className="text-[10px] text-gray-500 font-mono tracking-wider">{lic.number}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6 shrink-0 w-full md:w-32">
                                                <button onClick={() => setEditingRequest(req)} className="flex-1 md:flex-none md:w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                                                    <Edit2 size={16} /> Editar
                                                </button>
                                                <button onClick={() => {
                                                    setDialog({ title: 'Aprobar Agente', message: `¿Convertir a ${req.fullName} en un agente oficial de tu equipo?`, type: 'info', onConfirm: () => { onApproveRequest(req); setDialog(null); }, onCancel: () => setDialog(null) });
                                                }} className="flex-1 md:flex-none md:w-full py-2.5 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:scale-105 transition-transform shadow-md group">
                                                    <Check size={16} className="group-hover:text-green-400 transition-colors"/> Aprobar
                                                </button>
                                                <button onClick={() => {
                                                    setDialog({ title: 'Rechazar Solicitud', message: `¿Estás seguro de eliminar y rechazar la solicitud de ${req.fullName}? Esta acción no se puede deshacer.`, type: 'danger', onConfirm: () => { onRejectRequest(req.id); setDialog(null); }, onCancel: () => setDialog(null) });
                                                }} className="flex-1 md:flex-none md:w-full py-2.5 bg-white border border-red-100 text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-50 transition-colors shadow-sm">
                                                    <X size={16} /> Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* CONTENIDO 2: AGENTES ACTIVOS E INACTIVOS (NUEVO DISEÑO APPLE) */}
                        {(agentSubTab === 'activos' || agentSubTab === 'inactivos') && (
                            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {currentViewAgents.map(agent => (
                                <div key={agent.id} onClick={() => setViewingAgent(agent)} className={`bg-white p-5 md:p-6 rounded-3xl shadow-soft border cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between gap-5 group ${agent.status === 'inactive' ? 'border-gray-200 opacity-60 grayscale-[50%]' : 'border-gray-100'}`}>
                                    
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center font-bold text-xl md:text-2xl border border-gray-200 overflow-hidden shadow-sm shrink-0 text-gray-400 group-hover:border-rose-200 transition-colors">
                                            {agent.photo ? <img src={agent.photo} alt={agent.name} className="w-full h-full object-cover" /> : agent.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1 pr-2">
                                            <h3 className="font-bold text-gray-900 text-base md:text-lg truncate flex items-center gap-2 group-hover:text-rose-600 transition-colors">
                                                <span className="truncate">{agent.name}</span>
                                                {agent.status === 'inactive' && <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-widest border border-gray-200 shrink-0">Inactivo</span>}
                                            </h3>
                                            
                                            <div className="flex flex-col gap-1.5 mt-2">
                                                {agent.phone && <span className="text-[11px] md:text-xs text-gray-500 font-medium flex items-center gap-2 truncate"><Phone size={12} className="text-gray-400 shrink-0"/> {agent.phone}</span>}
                                                {agent.email && <span className="text-[11px] md:text-xs text-gray-500 font-medium flex items-center gap-2 truncate"><Mail size={12} className="text-gray-400 shrink-0"/> {agent.email}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-1">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <MapPin size={12} className="text-gray-400"/>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estados Activos</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {agent.license ? [...new Set(
                                                agent.license.split(',').map(item => {
                                                    const match = item.match(/\(([^)]+)\)/); // Busca lo que está entre paréntesis
                                                    const abbr = match ? match[1] : item.trim();
                                                    const stateObj = FULL_US_STATES.find(s => s.abbr === abbr);
                                                    return stateObj ? stateObj.name : abbr;
                                                })
                                            )].map((stateName, idx) => (
                                                <span key={idx} className="bg-white text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm transition-all group-hover:border-rose-300 group-hover:text-rose-600">
                                                    {stateName}
                                                </span>
                                            )) : (
                                                <span className="text-[10px] text-gray-400 italic">Sin estados</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                </div>
                                ))}
                                {currentViewAgents.length === 0 && <div className="col-span-full text-center py-20 text-gray-400 font-medium">No se encontraron agentes {agentSubTab}.</div>}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto bg-transparent md:bg-white md:rounded-3xl md:shadow-soft border-0 md:border border-gray-100 md:overflow-hidden pb-20 md:pb-0">
                        <div className="hidden md:grid grid-cols-[50px_2fr_1fr_1.5fr_1fr_1.5fr_100px] gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <div className="flex items-center justify-center"><input type="checkbox" className="custom-checkbox" checked={selectedLeads.length === sortedLeads.length && sortedLeads.length > 0} onChange={toggleSelectAll}/></div>
                            <div>Prospecto</div>
                            <div>Creación</div>
                            <div>Cita Programada</div>
                            <div>Estado</div>
                            <div>Agente</div>
                            <div className="text-right">Acciones</div>
                        </div>
                        
                        {sortedLeads.length === 0 ? (
                            <div className="p-16 md:p-24 text-center flex flex-col items-center bg-white rounded-3xl md:rounded-none shadow-soft md:shadow-none">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Archive size={24} className="text-gray-300"/></div>
                                <p className="text-gray-400 font-medium">No hay prospectos aquí.</p>
                            </div>
                        ) : (
                            sortedLeads.map(lead => {
                                const assignedAgent = agents.find(a => a.id === lead.assignedTo);
                                const isSelected = selectedLeads.includes(lead.id);
                                
                                return (
                                <React.Fragment key={lead.id}>
                                    <div onClick={() => setViewingLead(lead)} className={`hidden md:grid grid-cols-[50px_2fr_1fr_1.5fr_1fr_1.5fr_100px] gap-4 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50/80 cursor-pointer transition-colors text-sm group ${isSelected ? 'bg-rose-50/50' : ''}`}>
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
                                            <span className="text-[9px] text-gray-400 block mt-0.5">{new Date(lead.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="text-gray-500 text-xs font-medium">
                                            <span className="block text-gray-900 font-bold">{lead.date ? new Date(lead.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                                            <span className="flex items-center gap-1 mt-0.5 text-blue-600 font-bold"><Clock size={10}/> {lead.localTime || lead.time}</span>
                                            {lead.localTime && lead.localTime !== lead.time && (
                                                <span className="text-[9px] text-gray-400 font-medium mt-1 flex items-center gap-1">
                                                    ↳ {lead.time} <span className="uppercase tracking-widest text-[8px] bg-white border border-gray-100 px-1.5 py-0.5 rounded shadow-sm text-gray-500">en {lead.state}</span>
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider items-center gap-1 ${lead.status === 'archived' ? 'bg-gray-100 text-gray-500' : lead.assignedTo ? 'bg-purple-50 text-purple-700 border border-purple-100' : (!lead.assignedTo && lead.hoursUntil <= 2) ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : (lead.status === 'marketplace' && lead.hoursUntil <= 3) ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm' : lead.status === 'marketplace' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                                {lead.status === 'archived' ? 'Archivado' : lead.assignedTo ? 'Asignado' : (!lead.assignedTo && lead.hoursUntil <= 2) ? 'Urgente' : (lead.status === 'marketplace' && lead.hoursUntil <= 3) ? <>Oferta <span className="opacity-70 text-[10px]">🔥</span></> : lead.status === 'marketplace' ? 'En Tienda' : 'Bandeja'}
                                            </span>
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                             <button onClick={() => setIndividualAgentSelectLeadId(lead.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-left w-full text-xs font-bold ${assignedAgent ? 'bg-white border-gray-200 hover:border-rose-300' : 'bg-gray-50 border-dashed border-gray-300 hover:bg-white hover:border-gray-400 text-gray-400'}`}>
                                                {assignedAgent ? (<><div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[8px] overflow-hidden shrink-0">{assignedAgent.photo ? <img src={assignedAgent.photo} className="w-full h-full object-cover"/> : assignedAgent.name.charAt(0)}</div><span className="truncate text-gray-800">{assignedAgent.name}</span></>) : (<span>+ Asignar</span>)}
                                             </button>
                                        </div>
                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                            {lead.status === 'new' && (
                                                <button onClick={(e) => onUpdateLead(lead.id, { status: 'marketplace' })} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-amber-600 hover:border-amber-200 rounded-lg transition-colors shadow-sm" title="Enviar a la Tienda"><ShoppingCart size={14}/></button>
                                            )}
                                            {lead.status === 'marketplace' && (
                                                <button onClick={(e) => onUpdateLead(lead.id, { status: 'new' })} className="p-2 bg-amber-50 border border-amber-200 text-amber-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="Quitar de la Tienda"><RotateCcw size={14}/></button>
                                            )}
                                            <button onClick={(e) => onUpdateLead(lead.id, { status: lead.status === 'archived' ? 'new' : 'archived' })} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-colors shadow-sm" title={lead.status === 'archived' ? 'Restaurar' : 'Archivar'}>{lead.status === 'archived' ? <RotateCcw size={14}/> : <Archive size={14}/>}</button>
                                            <button onClick={(e) => handleDeleteLead(e, lead.id)} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 rounded-lg transition-colors shadow-sm" title="Eliminar"><Trash2 size={14}/></button>
                                        </div>
                                    </div>

                                    <div onClick={() => setViewingLead(lead)} className={`md:hidden flex flex-col p-4 mb-3 bg-white rounded-3xl shadow-soft border cursor-pointer transition-all relative ${isSelected ? 'border-rose-300 ring-2 ring-rose-50/50' : 'border-gray-100'}`}>
                                        <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleSelect(lead.id)}/>
                                        </div>
                                        
                                        <div className="pr-8 mb-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest items-center gap-1 mb-1.5 ${lead.status === 'archived' ? 'bg-gray-100 text-gray-500' : lead.assignedTo ? 'bg-purple-50 text-purple-700 border border-purple-100' : (!lead.assignedTo && lead.hoursUntil <= 2) ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : (lead.status === 'marketplace' && lead.hoursUntil <= 3) ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm' : lead.status === 'marketplace' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                                {lead.status === 'archived' ? 'Archivado' : lead.assignedTo ? 'Asignado' : (!lead.assignedTo && lead.hoursUntil <= 2) ? 'Urgente' : (lead.status === 'marketplace' && lead.hoursUntil <= 3) ? <>Oferta <span className="opacity-70 text-[9px]">🔥</span></> : lead.status === 'marketplace' ? 'En Tienda' : 'Bandeja'}
                                            </span>
                                            <p className="font-bold text-gray-900 text-base leading-tight mb-1.5 truncate">{lead.name}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="flex items-center gap-1 bg-gray-50 text-gray-600 text-[10px] font-medium px-2 py-1 rounded-md"><Phone size={10}/> {lead.phone}</span>
                                                {lead.state && <span className="bg-gray-50 text-gray-600 text-[10px] font-medium px-2 py-1 rounded-md">{lead.state}</span>}
                                            </div>
                                        </div>
                                        
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

                                        <div className="flex flex-col gap-3 border-t border-gray-50 pt-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Creación</span>
                                                    <span className="font-semibold text-gray-700 text-xs">{new Date(lead.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Cita Programada</span>
                                                    <div className="flex flex-col text-xs items-end">
                                                        <span className="font-bold text-gray-900">{lead.date ? new Date(lead.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'}</span>
                                                        <span className="font-bold text-blue-600 flex items-center gap-1 mt-0.5"><Clock size={10}/> {lead.localTime || lead.time}</span>
                                                        {lead.localTime && lead.localTime !== lead.time && (
                                                            <span className="text-[9px] text-gray-400 font-medium mt-1 flex items-center gap-1">
                                                                ↳ {lead.time} <span className="uppercase tracking-widest text-[8px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">en {lead.state}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                {lead.status === 'new' && (
                                                    <button onClick={(e) => onUpdateLead(lead.id, { status: 'marketplace' })} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center flex-1 gap-1.5 transition-colors shadow-sm bg-white text-gray-600 hover:text-amber-600">
                                                        <ShoppingCart size={14}/> Vender
                                                    </button>
                                                )}
                                                {lead.status === 'marketplace' && (
                                                    <button onClick={(e) => onUpdateLead(lead.id, { status: 'new' })} className="px-3 py-2 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center flex-1 gap-1.5 transition-colors shadow-sm bg-amber-50 text-amber-600">
                                                        <RotateCcw size={14}/> Quitar
                                                    </button>
                                                )}
                                                <button onClick={(e) => onUpdateLead(lead.id, { status: lead.status === 'archived' ? 'new' : 'archived' })} className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center justify-center flex-1 gap-1.5 transition-colors shadow-sm ${lead.status === 'archived' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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
            {isAgentModalOpen && (
                <AgentRegistrationForm 
                    initialData={editingAgent ? {
                        id: editingAgent.id,
                        fullName: editingAgent.name,
                        email: editingAgent.email,
                        phone: editingAgent.phone,
                        companies: editingAgent.companies,
                        isAgency: editingAgent.isAgency,
                        bio: editingAgent.bio,
                        licenses: editingAgent.licensesArray,
                        photo: editingAgent.photo
                    } : null}
                    onCancel={() => setIsAgentModalOpen(false)} 
                    onSubmit={async (data) => {
                        // Mapeamos los datos para que coincidan con tu estructura de base de datos de agentes
                        const agentData = {
                            name: data.fullName,
                            email: data.email,
                            phone: data.phone,
                            bio: data.bio,
                            photo: data.photo,
                            license: data.licenseSummary,
                            licensesArray: data.licenses,
                            companies: data.companies,
                            isAgency: data.isAgency,
                            status: editingAgent?.status || 'active',
                            id: data.id
                        };
                        await onSaveAgent(agentData);
                        setIsAgentModalOpen(false);
                    }}
                />
            )}
            {viewingLead && (
                <LeadDetail 
                    lead={processedLeads.find(l => l.id === viewingLead.id) || viewingLead} 
                    onClose={() => setViewingLead(null)} 
                    onUpdate={onUpdateLead} 
                    onDelete={onDeleteLead} 
                    agents={agents} 
                    allLeads={leads}
                    onAssignAgent={(leadId, agentId) => { 
                    const now = Date.now();
                    const assignedLead = processedLeads.find(l => l.id === leadId);
                    
                    // Si agentId está vacío, significa que estamos DESVINCULANDO
                    if (!agentId) {
                        const timeInfo = getAgentLocalDateTime(assignedLead.date, assignedLead.time, assignedLead.state);
                        const isFuture = timeInfo ? timeInfo.localMs > now : true;
                
                        // Aplicamos tu lógica: Futuro -> Bandeja (new), Pasado -> Archivados (archived)
                        onUpdateLead(leadId, { 
                            assignedTo: '', 
                            status: isFuture ? 'new' : 'archived' 
                        });
                    } else {
                        // Si hay un agentId, es una ASIGNACIÓN normal
                        onUpdateLead(leadId, { assignedTo: agentId, status: 'assigned' }); // Aseguramos que el status sea assigned
                        
                        const assignedAgent = agents.find(a => a.id === agentId);
                        if (assignedLead && assignedAgent) triggerAssignmentWebhook(assignedLead, assignedAgent);
                    }
                }}
                />
            )}

            {viewingAgent && (
                <AgentDetailView 
                    agent={agents.find(a => a.id === viewingAgent.id) || viewingAgent} 
                    leads={processedLeads} 
                    onClose={() => setViewingAgent(null)} 
                    onLeadClick={(l) => { setViewingAgent(null); setViewingLead(l); }} 
                    onSaveAgent={handleSaveAgent}
                    onDeleteAgent={onDeleteAgent}
                />
            )}                        
            <CustomDialog isOpen={!!dialog} {...dialog} />

            {isBulkAgentSelectOpen && (
                <AgentSelectionModal 
                    agents={activeAgentsList} 
                    onClose={() => setIsBulkAgentSelectOpen(false)}
                    onSelect={(agentId) => { 
                        const selectedAgent = agents.find(a => a.id === agentId);
                        let conflictCount = 0;
                        
                        const getClean24h = (tStr) => {
                            if (!tStr) return null;
                            let clean = tStr.toLowerCase().replace(/[\s\.\u202F\u00A0]/g, '');
                            let isPM = clean.includes('p');
                            let isAM = clean.includes('a');
                            let nums = clean.replace(/[^0-9]/g, '');
                            if (nums.length < 3) return null;
                            let h = parseInt(nums.slice(0, -2), 10);
                            const m = nums.slice(-2);
                            if (isPM && h < 12) h += 12;
                            if (isAM && h === 12) h = 0;
                            return `${String(h).padStart(2, '0')}:${m}`; 
                        };

                        const leadsToAssign = selectedLeads.map(id => processedLeads.find(l => l.id === id)).filter(Boolean);
                        
                        for (let lead of leadsToAssign) {
                            const targetTime24h = getClean24h(lead.localTime || lead.time);
                            const hasConflict = processedLeads.some(l => {
                                if (l.id === lead.id || l.assignedTo !== agentId || l.status === 'archived') return false;
                                if (l.date !== lead.date) return false;
                                return getClean24h(l.localTime || l.time) === targetTime24h; 
                            });
                            if (hasConflict) conflictCount++;
                        }

                        if (conflictCount > 0) {
                            setIsBulkAgentSelectOpen(false);
                            setTimeout(() => setDialog({ 
                                title: 'Múltiples Choques', 
                                message: `El agente ${selectedAgent?.name} tiene conflicto de horario con ${conflictCount} de las citas seleccionadas.\n\nOperación cancelada para proteger el calendario del agente.`, 
                                type: 'warning', 
                                onConfirm: () => setDialog(null) 
                            }), 150);
                            return; 
                        }

                        handleBulkAction('assign', agentId); 
                        setIsBulkAgentSelectOpen(false); 
                    }} 
                />
            )}

            {individualAgentSelectLeadId && (
                <AgentSelectionModal 
                    agents={activeAgentsList} 
                    onClose={() => setIndividualAgentSelectLeadId(null)} 
                    onSelect={(agentId) => { 
                        const leadToAssign = processedLeads.find(l => l.id === individualAgentSelectLeadId);
                        const selectedAgent = agents.find(a => a.id === agentId);
                        
                        if (leadToAssign && selectedAgent) {
                            const getClean24h = (tStr) => {
                                if (!tStr) return null;
                                let clean = tStr.toLowerCase().replace(/[\s\.\u202F\u00A0]/g, '');
                                let isPM = clean.includes('p');
                                let isAM = clean.includes('a');
                                let nums = clean.replace(/[^0-9]/g, '');
                                if (nums.length < 3) return null;
                                let h = parseInt(nums.slice(0, -2), 10);
                                const m = nums.slice(-2);
                                if (isPM && h < 12) h += 12;
                                if (isAM && h === 12) h = 0;
                                return `${String(h).padStart(2, '0')}:${m}`; 
                            };

                            const targetTime24h = getClean24h(leadToAssign.localTime || leadToAssign.time);
                            
                            const hasConflict = processedLeads.some(l => {
                                if (l.id === leadToAssign.id || l.assignedTo !== agentId || l.status === 'archived') return false;
                                if (l.date !== leadToAssign.date) return false;
                                return getClean24h(l.localTime || l.time) === targetTime24h; 
                            });

                            if (hasConflict) {
                                setIndividualAgentSelectLeadId(null);
                                setTimeout(() => setDialog({ 
                                    title: 'Choque de Horario', 
                                    message: `El agente ${selectedAgent.name} ya tiene una cita el ${leadToAssign.date} a las ${leadToAssign.localTime || leadToAssign.time}.\n\nPor favor, elige otro agente o cambia el horario primero.`, 
                                    type: 'warning', 
                                    onConfirm: () => setDialog(null) 
                                }), 150);
                                return; 
                            }
                        }

                        const confirmMsg = selectedAgent 
                            ? `⚠️ CONFIRMACIÓN\n\n¿Estás seguro de asignar este prospecto a ${selectedAgent.name}? Esto enviará los correos automáticamente.` 
                            : `⚠️ CONFIRMACIÓN\n\n¿Estás seguro de quitar la asignación actual?`;
                        
                        if (window.confirm(confirmMsg)) {
                            onUpdateLead(individualAgentSelectLeadId, { assignedTo: agentId }); 
                            if (leadToAssign && selectedAgent) triggerAssignmentWebhook(leadToAssign, selectedAgent);
                            setIndividualAgentSelectLeadId(null); 
                        }
                    }} 
                />
            )}
            
            {showWebhookSettings && <WebhookSettingsModal webhooks={webhooks} onSave={onUpdateWebhooks} onClose={() => setShowWebhookSettings(false)} />}
            {showPriceSettings && <PriceSettingsModal generalSettings={generalSettings} onSave={onUpdateGeneralSettings} onClose={() => setShowPriceSettings(false)} />}
        </div>
    );
};

// --- PORTAL DEL AGENTE (SaaS) ---
// --- DICCIONARIO DE ESTADOS ---
const STATE_ABBR = { "Arizona": "AZ", "California": "CA", "Colorado": "CO", "Florida": "FL", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Montana": "MT", "Nevada": "NV", "New Mexico": "NM", "Oregon": "OR", "Texas": "TX", "Utah": "UT", "Virginia": "VA", "Wisconsin": "WI" };
// --- ✅ MAPA DE TIMEZONES POR ESTADO (solo los que usas) ---
const STATE_TZ = {
  "Arizona": "America/Phoenix",
  "California": "America/Los_Angeles",
  "Colorado": "America/Denver",
  "Florida": "America/New_York", // simplificado (si quieres lo afinamos para FL)
  "Hawaii": "Pacific/Honolulu",
  "Idaho": "America/Boise",
  "Illinois": "America/Chicago",
  "Montana": "America/Denver",
  "Nevada": "America/Los_Angeles",
  "New Mexico": "America/Denver",
  "Oregon": "America/Los_Angeles",
  "Texas": "America/Chicago",
  "Utah": "America/Denver",
  "Virginia": "America/New_York",
  "Wisconsin": "America/Chicago"
};

// --- ✅ Normaliza hora (A prueba de p.m., P.M., PM, pm) ---
const normalizeTimeString = (t) => {
  if (!t) return '';
  let clean = String(t).toLowerCase().replace(/[\s\.\u202F\u00A0]/g, '');
  let isPM = clean.includes('p');
  let isAM = clean.includes('a');
  let nums = clean.replace(/[^0-9]/g, '');
  if (nums.length < 3) return null;
  
  let hh = parseInt(nums.slice(0, -2), 10);
  const mm = nums.slice(-2);
  
  if (isPM && hh < 12) hh += 12;
  if (isAM && hh === 12) hh = 0;
  
  return `${String(hh).padStart(2, '0')}:${mm}`;
};

// --- ✅ Convierte "fecha+hora" en timezone X a timestamp UTC ---
const zonedDateTimeToUtcMs = (dateStr, timeStr, timeZone) => {
  const hhmm = normalizeTimeString(timeStr);
  if (!dateStr || !hhmm || !timeZone) return null;

  const [Y, M, D] = dateStr.split('-').map(n => parseInt(n, 10));
  const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));

  const utcGuess = new Date(Date.UTC(Y, M - 1, D, h, m, 0));

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const parts = dtf.formatToParts(utcGuess).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

  const tzAsUtc = Date.UTC(
    parseInt(parts.year, 10),
    parseInt(parts.month, 10) - 1,
    parseInt(parts.day, 10),
    parseInt(parts.hour, 10),
    parseInt(parts.minute, 10),
    parseInt(parts.second, 10)
  );

  const offsetMs = tzAsUtc - utcGuess.getTime();
  return utcGuess.getTime() - offsetMs;
};

// --- ✅ Devuelve "fecha+hora" ya en LOCAL DEL AGENTE ---
const getAgentLocalDateTime = (dateStr, timeStr, prospectState) => {
  const tz = STATE_TZ[prospectState] || null;
  if (!tz) return null;

  const utcMs = zonedDateTimeToUtcMs(dateStr, timeStr, tz);
  if (utcMs == null) return null;

  const local = new Date(utcMs); 
  const yyyy = local.getFullYear();
  const mm = String(local.getMonth() + 1).padStart(2, '0');
  const dd = String(local.getDate()).padStart(2, '0');
  const HH = local.getHours();
  const MM = String(local.getMinutes()).padStart(2, '0');
  
  const ampm = HH >= 12 ? 'p.m.' : 'a.m.';
  const displayHH = HH % 12 || 12;

  return {
    localDateStr: `${yyyy}-${mm}-${dd}`,
    localTime24: `${String(HH).padStart(2, '0')}:${MM}`,
    localTimeAmPm: `${String(displayHH).padStart(2, '0')}:${MM} ${ampm}`,
    localMs: local.getTime()
  };
};
// --- PORTAL DEL AGENTE (SaaS Premium V8 - Precios Dinámicos y Auto-Expiración) ---
const AgentPortal = ({ leads, agent, onUpdateLead, onLogout, generalSettings }) => {
    const regularPrice = generalSettings?.regularPrice ?? 45;
    const offerPrice = generalSettings?.offerPrice ?? 35;
    // Si está inactivo, le borramos el Marketplace de sus opciones
    const TABS = agent.status === 'inactive' ? ['clientes', 'agenda', 'historial'] : ['marketplace', 'clientes', 'agenda', 'historial'];
    const [viewingLead, setViewingLead] = useState(null);
    
    // --- MÁGIA: RELOJ INTERNO SILENCIOSO (Actualiza la pantalla cada minuto) ---
    const [timeTick, setTimeTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTimeTick(t => t + 1), 60000); // 60000ms = 1 minuto
        return () => clearInterval(timer);
    }, []);

    // --- 1. ENRUTADOR WEB AVANZADO (Memoria de Pestaña y Ficha) ---
    const [activeTab, setActiveTab] = useState(() => {
        const hashParts = window.location.hash.replace('#', '').split('/');
        return TABS.includes(hashParts[0]) ? hashParts[0] : 'marketplace';
    });

    // Recuperar la ficha automáticamente si el usuario refresca la página (F5)
    useEffect(() => {
        const hashParts = window.location.hash.replace('#', '').split('/');
        if (hashParts.length > 1 && leads.length > 0 && !viewingLead) {
            const savedLead = leads.find(l => l.id === hashParts[1]);
            if (savedLead) setViewingLead(savedLead);
        }
    }, [leads]); 

    // Actualizar la URL cuando cambia la pestaña o se abre/cierra una ficha
    useEffect(() => { 
        const hashLead = viewingLead ? `/${viewingLead.id}` : '';
        window.location.hash = `${activeTab}${hashLead}`; 
    }, [activeTab, viewingLead]);

    // Escuchar el botón "Atrás/Adelante" del navegador web
    useEffect(() => {
        const handleHash = () => {
            const hashParts = window.location.hash.replace('#', '').split('/');
            if (TABS.includes(hashParts[0])) setActiveTab(hashParts[0]);
            
            // Si el usuario presiona "Atrás" en el navegador para salir de la ficha, se cierra visualmente
            if (hashParts.length === 1 && viewingLead) {
                setViewingLead(null);
            }
        };
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, [viewingLead]);

    // --- 2. MOTOR TÁCTIL (Swipe para cambiar de pestaña) ---
    const [touchStart, setTouchStart] = useState({ x: null, y: null });
    
    const handleTouchStart = (e) => {
        // Bloquear el swipe de pestañas si la ficha del prospecto está abierta
        if (!viewingLead) {
            setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
        }
    };
    
    const handleTouchEnd = (e) => {
        if (!touchStart.x || !touchStart.y || viewingLead) return;
        const dx = touchStart.x - e.changedTouches[0].clientX;
        const dy = touchStart.y - e.changedTouches[0].clientY;
        
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
            const currentIndex = TABS.indexOf(activeTab);
            if (dx > 0 && currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1]); 
            if (dx < 0 && currentIndex > 0) setActiveTab(TABS[currentIndex - 1]); 
        }
        setTouchStart({ x: null, y: null });
    };

    const [cart, setCart] = useState([]);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutos
    
    // --- MEMORIA INTELIGENTE PARA LA SUB-PESTAÑA DE CITAS ---
    const [showArchived, setShowArchived] = useState(() => {
        return localStorage.getItem('agentShowArchived') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('agentShowArchived', showArchived);
    }, [showArchived]);
    
    // --- NUEVO: ESTADOS PARA LOS BUSCADORES Y FILTROS ---
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [marketplaceStateFilters, setMarketplaceStateFilters] = useState([]); // Ahora es un arreglo múltiple
    const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false); // Controla el menú flotante

    // --- 3. RECREAMOS processedLeads (Para que nada se rompa más abajo) ---
    const processedLeads = leads.map(l => {
        const timeInfo = getAgentLocalDateTime(l.date, l.time, l.state);
        const now = Date.now();
        const hoursUntil = timeInfo ? (timeInfo.localMs - now) / (1000 * 60 * 60) : 999;
        return { 
            ...l, 
            hoursUntil, 
            localTime: timeInfo?.localTimeAmPm || l.time,
            sortMs: timeInfo?.localMs || 0 
        };
    });

    // --- 4. ORDENAMOS Y FILTRAMOS (Sincronizado con Admin) ---
    const myLeads = processedLeads.filter(l => l.assignedTo === agent.id);
    
    // Citas activas: La más próxima va arriba
    const activeClients = myLeads.filter(l => l.status !== 'archived').sort((a, b) => a.hoursUntil - b.hoursUntil);
    // Citas archivadas: La que pasó más recientemente va arriba
    const archivedClients = myLeads.filter(l => l.status === 'archived').sort((a, b) => b.hoursUntil - a.hoursUntil);
    
    // Buscador Inteligente Universal de Clientes
    let currentClientsList = [];
    if (clientSearchTerm) {
        const term = clientSearchTerm.toLowerCase();
        currentClientsList = myLeads.filter(l => 
            (l.name && l.name.toLowerCase().includes(term)) || 
            (l.phone && l.phone.includes(term)) || 
            (l.state && l.state.toLowerCase().includes(term))
        ).sort((a, b) => a.hoursUntil - b.hoursUntil); 
    } else {
        currentClientsList = showArchived ? archivedClients : activeClients;
    }
    
    // Filtro Inteligente del Marketplace
    const allAvailableLeads = processedLeads.filter(l => l.status === 'marketplace' && !l.assignedTo && l.hoursUntil > 2);
    
    // Motor matemático: Cuenta cuántos leads hay por cada estado
    const stateCounts = allAvailableLeads.reduce((acc, lead) => {
        if(lead.state) acc[lead.state] = (acc[lead.state] || 0) + 1;
        return acc;
    }, {});
    
    const availableMarketplaceStates = Object.keys(stateCounts).sort();
    
    // Marketplace: Citas más próximas a vencer (Ofertas Relámpago) aparecen siempre de primero
    const availableLeads = allAvailableLeads
        .filter(l => marketplaceStateFilters.length > 0 ? marketplaceStateFilters.includes(l.state) : true)
        .sort((a, b) => a.hoursUntil - b.hoursUntil);

    const toggleStateFilter = (st) => {
        setMarketplaceStateFilters(prev => prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]);
    };

    const myHistory = myLeads.sort((a,b) => b.timestamp - a.timestamp);

    // --- 5. LÓGICA DEL CARRITO DINÁMICO ---
    const cartTotal = cart.reduce((total, leadId) => {
        const lead = availableLeads.find(l => l.id === leadId);
        if (!lead) return total;
        const isFireSale = lead.hoursUntil <= 3; 
        return total + (isFireSale ? offerPrice : regularPrice); 
    }, 0);

    // Lógica del Temporizador
    useEffect(() => {
        let timer;
        if (cart.length > 0 && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setCart([]); 
            setTimeLeft(600); 
            // Opcional: Reemplazar el alert si quieres, pero por ahora lo dejamos por seguridad.
            alert("⏳ El tiempo para reservar ha expirado. Las citas han sido liberadas.");
        } else if (cart.length === 0) {
            setTimeLeft(600);
        }
        return () => clearInterval(timer);
    }, [cart.length, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleCart = (leadId, isBlocked) => { 
        if (isBlocked) return; 
        setCart(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]); 
    };

    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsCheckingOut(true);
        try {
            // 1. Empaquetamos los prospectos del carrito
            const items = cart.map(leadId => {
                const lead = availableLeads.find(l => l.id === leadId);
                const isFireSale = lead.hoursUntil <= 3;
                return {
                    name: `Prospecto en ${lead.state || 'US'}`,
                    price: isFireSale ? offerPrice : regularPrice
                };
            });

            // 2. Llamamos a tu Bóveda en Google Cloud
            const response = await fetch("https://createstripecheckout-685007300356.us-central1.run.app", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items,
                    agentId: agent.id,
                    leadIds: cart
                })
            });

            const result = await response.json();
            
            // 3. Redirigimos a la pantalla segura de Stripe
            if (result.url) {
                window.location.href = result.url;
            } else {
                alert("Error al preparar la pasarela de pagos.");
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error("Error Stripe:", error);
            alert("Error de conexión. Intenta de nuevo.");
            setIsCheckingOut(false);
        }
    };

    return (
        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans animate-fade-in relative pb-24 overflow-x-hidden">
            {/* Header Minimalista */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 md:px-6 py-3 flex justify-between items-center z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600 text-xs border border-gray-200 overflow-hidden shrink-0">
                        {agent.photo ? <img src={agent.photo} className="w-full h-full object-cover"/> : agent.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 text-sm tracking-tight truncate">{agent.name}</h2>
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Portal Corporativo</p>
                    </div>
                </div>
                <button onClick={onLogout} className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1.5 px-2 py-1 shrink-0">
                    <LogOut size={14}/> <span className="hidden md:inline">Salir</span>
                </button>
            </div>

            {/* Pestañas de Navegación */}
            <div className="flex px-4 md:px-6 gap-6 md:gap-8 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm overflow-x-auto z-10 scrollbar-hide shrink-0 pt-2 pb-0">
                {['marketplace', 'clientes', 'agenda'].map(tab => (
                    <button key={tab} onClick={() => {setActiveTab(tab); setViewingLead(null);}} className={`py-3 text-xs md:text-sm font-semibold tracking-wide border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {tab === 'marketplace' && (
                            <>
                                Marketplace
                                {availableLeads.length > 0 ? (
                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm leading-none min-w-[20px] text-center animate-pulse-once">
                                        {availableLeads.length}
                                    </span>
                                ) : (
                                    <span>(0)</span>
                                )}
                            </>
                        )}
                        {tab === 'clientes' && 'Mis Clientes'}
                        {tab === 'agenda' && 'Agenda'}
                    </button>
                ))}
            </div>

            {/* VISTA 1: MARKETPLACE */}
            {activeTab === 'marketplace' && (
                <div className="flex-1 p-3 md:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-4 md:mb-6 px-1 gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Marketplace</h1>
                            <p className="text-gray-500 text-xs md:text-sm mt-1">Adquiere tus próximas citas de asesoría.</p>
                        </div>
                        {/* AQUÍ LA MAGIA: flex-col-reverse pone el botón arriba en el móvil, pero sm:flex-row lo deja normal en PC */}
                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                            {/* Filtro Multi-Estado Inteligente */}
                            <div className="relative w-full sm:w-56 shrink-0 z-30">
                                <button 
                                    onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)} 
                                    className="w-full pl-4 pr-3 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 shadow-sm transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <MapPin className="text-gray-400 shrink-0" size={14} />
                                        <span className="truncate">
                                            {marketplaceStateFilters.length === 0 
                                                ? 'Todos los Estados' 
                                                : `${marketplaceStateFilters.length} Estado(s) seleccionado(s)`}
                                        </span>
                                    </div>
                                    <ChevronRight size={12} className={`text-gray-400 shrink-0 transition-transform ${isStateDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                                </button>

                                {/* Menú Flotante de Checkboxes */}
                                {isStateDropdownOpen && (
                                    <>
                                        {/* Overlay invisible para cerrar al hacer clic afuera */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsStateDropdownOpen(false)}></div>
                                        
                                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-slide-up z-50">
                                            <div className="max-h-60 overflow-y-auto p-2 scrollbar-hide">
                                                {availableMarketplaceStates.length === 0 ? (
                                                    <p className="text-xs text-gray-400 text-center py-4">No hay estados disponibles</p>
                                                ) : (
                                                    availableMarketplaceStates.map(st => (
                                                        <label key={st} className="flex items-center gap-3 p-2.5 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors group">
                                                            <input 
                                                                type="checkbox" 
                                                                className="custom-checkbox shrink-0" 
                                                                checked={marketplaceStateFilters.includes(st)} 
                                                                onChange={() => toggleStateFilter(st)} 
                                                            />
                                                            <span className="text-sm font-semibold text-gray-700 group-hover:text-rose-700">
                                                                {st} <span className="text-gray-400 font-medium ml-1">({stateCounts[st]})</span>
                                                            </span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                            {marketplaceStateFilters.length > 0 && (
                                                <div className="p-2 border-t border-gray-100 bg-gray-50">
                                                    <button 
                                                        onClick={() => setMarketplaceStateFilters([])} 
                                                        className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
                                                    >
                                                        Limpiar Filtros
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <button onClick={() => setActiveTab('historial')} className="flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:text-black hover:border-gray-300 transition-all shadow-sm shrink-0">
                                <FileText size={14} className="text-gray-400" />
                                <span className="sm:hidden">Ver Mis Recibos</span>
                                <span className="hidden sm:inline">Recibos</span>
                            </button>
                        </div>
                    </div>

                    {availableLeads.length === 0 ? (
                        <div className="text-center p-12 md:p-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 font-medium text-sm">No hay citas disponibles en este momento.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                            {availableLeads.map(lead => {
                                const abbr = STATE_ABBR[lead.state] || "US";
                                const isSelected = cart.includes(lead.id);
                                let fDate = "Sin fecha";
                                if (lead.date) fDate = new Date(lead.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                                const conflictClient = activeClients.find(c => c.date === lead.date && c.time === lead.time);
                                const isBlocked = !!conflictClient;
                                
                                // ¿Es una Oferta Relámpago? (Faltan <= 3 horas)
                                const isFireSale = lead.hoursUntil <= 3;

                                return (
                                    <div key={lead.id} onClick={() => toggleCart(lead.id, isBlocked)} className={`flex items-start gap-3 md:gap-4 p-4 transition-all ${isBlocked ? 'bg-gray-50/50 opacity-60 cursor-not-allowed' : isFireSale && !isSelected ? 'bg-orange-50/30 hover:bg-orange-50/60 cursor-pointer group' : isSelected ? 'bg-blue-50/40 cursor-pointer' : 'hover:bg-gray-50/80 cursor-pointer group'}`}>
                                        
                                        <div className="flex-shrink-0 mt-1 flex items-center justify-center w-5" onClick={e => e.stopPropagation()}>
                                            {isBlocked ? (
                                                <div className="text-gray-400 mt-1"><Lock size={16}/></div>
                                            ) : (
                                                <input type="checkbox" className="custom-checkbox" checked={isSelected} onChange={() => toggleCart(lead.id, isBlocked)} disabled={isBlocked}/>
                                            )}
                                        </div>

                                        <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border shrink-0 transition-colors mt-0.5 ${isBlocked ? 'bg-gray-100 text-gray-400 border-gray-200' : isFireSale && !isSelected ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white border-transparent shadow-sm' : isSelected ? 'bg-black text-white border-black shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 group-hover:border-gray-300'}`}>
                                            {isFireSale && !isSelected ? '🔥' : abbr}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                            <span className={`font-bold uppercase text-sm tracking-wide truncate ${isBlocked ? 'text-gray-500' : 'text-gray-900'}`}>{lead.state || 'ESTADO'} {isFireSale && !isBlocked && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase tracking-widest font-extrabold">Oferta</span>}</span>                                                
                                                {/* PRECIO DINÁMICO */}
                                                {!isBlocked && (
                                                    <div className="text-right">
                                                        {isFireSale ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] text-gray-400 line-through font-medium">${regularPrice}</span>
                                                                <span className="text-sm font-extrabold text-red-600">${offerPrice}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-semibold text-gray-400">${regularPrice}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <span className={`text-xs mt-1 leading-tight block ${isBlocked ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span className="capitalize">{fDate}</span> <br className="md:hidden" />
                                                <span className="md:hidden text-gray-300 mx-1">|</span>
                                                <span className="md:inline hidden"> • </span>
                                                
                                                <span className={`font-bold ${isBlocked ? 'text-gray-500' : 'text-gray-800'}`}>
                                                    {lead.localTime || lead.time} <span className="text-[10px] font-bold text-blue-500">(Tu hora)</span>
                                                </span>

                                                {/* NUEVO: Muestra la hora original del estado del prospecto */}
                                                {lead.localTime !== lead.time && (
                                                    <span className="block mt-1.5 text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                        ↳ {lead.time} <span className="uppercase tracking-widest text-[8px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">en {lead.state}</span>
                                                    </span>
                                                )}
                                            </span>

                                            {isBlocked && (
                                                <div className="mt-2.5 text-[10px] md:text-xs font-semibold text-gray-500 flex items-start gap-1.5 bg-gray-100 p-2 rounded-lg border border-gray-200">
                                                    <span className="shrink-0 text-gray-400"><Lock size={14}/></span>
                                                    <span className="leading-tight mt-0.5">Horario ocupado. Tienes cita con <span className="font-bold">{conflictClient.name}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* VISTA 2: MIS CLIENTES */}
            {activeTab === 'clientes' && (
                <div className="flex-1 p-3 md:p-8 max-w-4xl mx-auto w-full overflow-y-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
                        {/* Pestañas de estado (Activas/Pasadas) */}
                        <div className="bg-gray-200/60 p-1.5 rounded-xl flex items-center shadow-inner w-full lg:w-auto overflow-x-auto scrollbar-hide shrink-0">
                            <button onClick={() => setShowArchived(false)} className={`flex-1 lg:flex-none px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${!showArchived ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Próximas citas ({activeClients.length})</button>
                            <button onClick={() => setShowArchived(true)} className={`flex-1 lg:flex-none px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${showArchived ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Citas pasadas ({archivedClients.length})</button>
                        </div>
                        
                        {/* NUEVO: Buscador Interno de Clientes */}
                        <div className="relative w-full lg:w-72 group shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={16}/>
                            <input 
                                type="text" 
                                placeholder="Buscar cliente, teléfono o estado..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all text-sm font-medium shadow-sm" 
                                value={clientSearchTerm} 
                                onChange={e => setClientSearchTerm(e.target.value)} 
                            />
                        </div>
                    </div>
                    
                    {currentClientsList.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={24} className="text-gray-300"/></div>
                            <p className="text-gray-500 font-medium text-sm">{!showArchived ? 'No tienes próximas citas agendadas.' : 'No tienes citas pasadas registradas.'}</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                            {currentClientsList.map(lead => {
                                let fDate = "Sin fecha";
                                if (lead.date) {
                                    fDate = new Date(lead.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                                }
                                return (
                                    <div key={lead.id} onClick={() => setViewingLead(lead)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center group">
                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-semibold text-sm border border-gray-200 shrink-0 shadow-sm">{lead.name.charAt(0)}</div>
                                            <div className="min-w-0 flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`font-bold text-sm truncate ${showArchived ? 'text-gray-500' : 'text-gray-900'}`}>{lead.name}</h4>
                                                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold border border-blue-100 text-[10px]"><Calendar size={10}/> {fDate}</span>
                                                </div>
                                                
                                                {/* BLOQUE DE DOBLE HORARIO Y TELÉFONO */}
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[11px] md:text-xs text-gray-500">
                                                    <span className="flex items-center gap-1 font-medium"><Phone size={12}/> {lead.phone}</span>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="font-bold text-blue-600 flex items-center gap-1 bg-blue-50/50 px-1.5 rounded"><Clock size={12}/> {lead.localTime || lead.time} <span className="text-[9px] font-normal text-blue-400 uppercase tracking-widest">(Local)</span></span>
                                                        
                                                        {lead.localTime !== lead.time && (
                                                            <span className="flex items-center gap-1 font-medium text-gray-400 pl-1 border-l border-gray-200">
                                                                {lead.time} <span className="text-[9px] uppercase tracking-widest">en {lead.state}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-900 shrink-0 transition-colors"/>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* VISTA 3: AGENDA */}
            {activeTab === 'agenda' && <div className="flex-1 p-3 md:p-6 h-full"><AdminCalendar leads={activeClients} agents={[agent]} onLeadClick={setViewingLead} /></div>}
            {/* VISTA 4: HISTORIAL DE RECIBOS */}
            {activeTab === 'historial' && (
                <div className="flex-1 p-3 md:p-8 max-w-4xl mx-auto w-full overflow-y-auto animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2"><FileText size={24} className="text-rose-500"/> Mis Recibos</h2>
                            <p className="text-gray-500 text-sm mt-1">Historial de prospectos adquiridos.</p>
                        </div>
                    </div>

                    {myHistory.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm mt-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><FileText size={24} className="text-gray-300"/></div>
                            <p className="text-gray-500 font-medium text-sm">No tienes compras registradas aún.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                            {myHistory.map(lead => {
                                // Generamos un ID de recibo falso pero constante basado en el ID del lead
                                const receiptId = `REC-${lead.id.substring(0, 6).toUpperCase()}`;
                                // Asumimos un precio base para el recibo (si es de hoy y urgente, $10, si no $40. Esto se afinará con Stripe)
                                const paidAmount = lead.status === 'marketplace' && lead.hoursUntil <= 3 ? `$${offerPrice}.00` : `$${regularPrice}.00`;
                                
                                return (
                                    <div key={`rec-${lead.id}`} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                                                <DollarSign size={20} strokeWidth={2.5}/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900 text-base">Adquisición de Prospecto</h4>
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-gray-200">{receiptId}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1"><span className="font-medium text-gray-900">{lead.name}</span> • {lead.state || 'N/A'}</p>
                                                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400 font-medium">
                                                    <Calendar size={12}/>
                                                    <span>{new Date(lead.timestamp).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                                            <span className="text-lg font-extrabold text-gray-900">{paidAmount}</span>
                                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md mt-1 flex items-center gap-1"><Check size={10}/> Pagado</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
            
            {viewingLead && (
              <LeadDetail
                lead={processedLeads.find(l => l.id === viewingLead.id) || viewingLead}
                onClose={() => setViewingLead(null)}
                onUpdate={onUpdateLead}
                isAgentView={true}
                agents={[agent]}
                allLeads={processedLeads}
              />
            )}
            {/* BARRA FLOTANTE DE PAGO OPTIMIZADA (Ahora con Precio Dinámico) */}
            {activeTab === 'marketplace' && cart.length > 0 && (
                <div className="fixed bottom-6 left-0 right-0 px-4 md:px-0 flex justify-center z-50 animate-slide-up pointer-events-none">
                    <div className="w-full md:w-auto max-w-[400px] bg-black/95 backdrop-blur-md text-white p-1.5 md:p-2 rounded-2xl md:rounded-full shadow-2xl flex items-center justify-between gap-2 border border-white/10 pointer-events-auto">
                        <div className="flex items-center gap-2 md:gap-4 pl-3 md:pl-4">
                            <span className="text-[11px] md:text-sm font-medium text-gray-200 whitespace-nowrap"><span className="font-bold text-white">{cart.length}</span> leads</span>
                            <div className="w-px h-4 bg-white/20"></div>
                            <span className="text-rose-400 font-mono font-bold text-[11px] md:text-sm flex items-center gap-1 whitespace-nowrap"><Clock size={12}/> {formatTime(timeLeft)}</span>
                        </div>
                        <button onClick={handleCheckout} disabled={isCheckingOut} className="bg-white text-black px-4 md:px-6 py-2.5 rounded-xl md:rounded-full text-xs md:text-sm font-bold hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0">
                            {isCheckingOut ? 'Conectando seguro...' : `Pagar $${cartTotal}`} <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const PortalLoginScreen = ({ onLogin, onOpenRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMsg, setResetMsg] = useState('');
    
    // Referencia para el auto-enfoque en móviles
    const loginRef = useRef(null);

    const scrollToLogin = () => {
        loginRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setResetMsg('');
        try {
            await onLogin(email, password);
        } catch (err) {
            setError('Credenciales incorrectas.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) { setError('Ingresa tu correo primero.'); return; }
        try {
            await sendPasswordResetEmail(auth, email);
            setResetMsg('Recuperación enviada.');
        } catch (err) { setError('Error al enviar correo.'); }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans animate-fade-in selection:bg-rose-500 selection:text-white overflow-x-hidden">
            
            {/* CABECERA PREMIUM */}
            <header className="fixed top-0 left-0 w-full z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                            <ShieldCheck className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                        {/* Subimos a text-sm para móvil y text-lg para PC, dándole mucha más presencia a la marca */}
                        <span className="text-white font-bold tracking-tight text-sm sm:text-lg truncate">asistente<span className="font-light opacity-60">debeneficios.com</span></span>
                    </div>
                    <button onClick={scrollToLogin} className="bg-white/10 hover:bg-white/20 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-bold border border-white/10 transition-all active:scale-95 shrink-0 whitespace-nowrap">
                        {/* MAGIA AQUÍ: Muestra "Login" en móvil y "Iniciar Sesión" en PC/Tablet */}
                        <span className="sm:hidden">Login</span>
                        <span className="hidden sm:inline">Iniciar Sesión</span>
                    </button>
                </div>
            </header>

            {/* CAMBIO CLAVE AQUÍ: flex-col lg:flex-row (Antes era md:flex-row) */}
            <div className="flex flex-col lg:flex-row flex-1 pt-20">
                
                {/* LADO IZQUIERDO: Beneficios (En iPad ocupará el 100% del ancho elegantemente) */}
                <div className="w-full lg:w-[55%] xl:w-[60%] p-8 md:p-16 lg:p-20 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]"></div>

                    <div className="relative z-10 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-6 backdrop-blur-sm">
                            <Star size={12}/> Únete a los mejores
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
                            Impulsa tu carrera al <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">siguiente nivel.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-gray-400 mb-12 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Una plataforma diseñada exclusivamente para agentes de élite. Todo lo que necesitas en un solo lugar.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6 md:gap-8 text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group text-center sm:text-left">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-400 group-hover:scale-110 transition-transform"><ShoppingCart size={24}/></div>
                                <div><h3 className="text-white font-bold text-base mb-1">Leads Exclusivos</h3><p className="text-xs text-gray-400 leading-relaxed">Acceso a Marketplace en tiempo real con clientes de alta intención.</p></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group text-center sm:text-left">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-400 group-hover:scale-110 transition-transform"><CalendarDays size={24}/></div>
                                <div><h3 className="text-white font-bold text-base mb-1">Agenda Inteligente</h3><p className="text-xs text-gray-400 leading-relaxed">Toma el control absoluto de tu tiempo. Tú decides cuándo vender.</p></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group text-center sm:text-left">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 text-green-400 group-hover:scale-110 transition-transform"><Activity size={24}/></div>
                                <div><h3 className="text-white font-bold text-base mb-1">CRM Integrado</h3><p className="text-xs text-gray-400 leading-relaxed">Gestiona tu cartera, notas e historial sin pagar softwares externos.</p></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group text-center sm:text-left">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-110 transition-transform"><ShieldCheck size={24}/></div>
                                <div><h3 className="text-white font-bold text-base mb-1">Soporte Corporativo</h3><p className="text-xs text-gray-400 leading-relaxed">Respaldo total de una agencia sólida para que solo te enfoques en vender.</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LADO DERECHO: Login Integrado (En iPad se colocará abajo, centrado y amplio) */}
                <div ref={loginRef} className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center p-6 md:p-12 lg:p-12 relative pb-20 lg:pb-12">
                    <div className="w-full max-w-[450px] bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
                        {/* Brillo interno del cuadro */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                        
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-gradient-to-b from-white/10 to-white/5 rounded-[2rem] mx-auto flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                                <Lock size={32} className="text-rose-400 shadow-rose-400/50" />
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">Acceso al Portal</h2>
                            <p className="text-gray-400 text-sm mt-3 font-medium">Gestiona tu equipo y escala tus ventas.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] ml-1">Tu Correo</label>
                                <input type="email" placeholder="agente@empresa.com" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-rose-500/50 focus:bg-white/10 focus:ring-4 focus:ring-rose-500/5 transition-all text-white placeholder:text-gray-600 font-medium" value={email} onChange={e=>setEmail(e.target.value)} required/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1 pr-1">
                                    <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">Contraseña</label>
                                    <button type="button" onClick={handleResetPassword} className="text-[10px] font-bold text-gray-500 hover:text-rose-400 transition-colors uppercase tracking-widest">¿Olvidaste tu clave?</button>
                                </div>
                                <input type="password" placeholder="••••••••" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-rose-500/50 focus:bg-white/10 focus:ring-4 focus:ring-rose-500/5 transition-all text-white placeholder:text-gray-600 font-medium" value={password} onChange={e=>setPassword(e.target.value)} required/>
                            </div>

                            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center animate-pulse flex items-center justify-center gap-2"><AlertTriangle size={14}/> {error}</div>}
                            {resetMsg && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2"><Check size={14}/> {resetMsg}</div>}

                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-5 rounded-2xl font-bold text-base shadow-xl shadow-rose-600/20 hover:shadow-rose-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4 overflow-hidden relative group">
                                <span className="relative z-10">{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-white/5 text-center">
                            <p className="text-xs text-gray-500 font-medium mb-4">¿Deseas formar parte de la agencia?</p>
                            <button type="button" onClick={onOpenRegister} className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 group">
                                <UserPlus size={18} className="text-gray-500 group-hover:text-rose-500 transition-colors"/> Quiero unirme al Equipo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer Minimalista */}
            <footer className="p-8 text-center text-[10px] text-gray-600 font-medium uppercase tracking-[0.3em] bg-[#0B0F19]">
                © {new Date().getFullYear()} asistente de beneficios • sistema seguro y encriptado
            </footer>
        </div>
    );
};
                                    
const App = () => {
    // --- MEMORIA DEL EMBUDO ---
    const [stepIndex, setStepIndex] = useState(() => {
        const savedStep = sessionStorage.getItem('funnelStepIndex');
        return savedStep !== null ? parseInt(savedStep, 10) : 0;
    });
    const [leadData, setLeadData] = useState(() => {
        const savedData = sessionStorage.getItem('funnelLeadData');
        return savedData ? JSON.parse(savedData) : {};
    });
    
    const [tempSelections, setTempSelections] = useState([]);
    const [reinforcement, setReinforcement] = useState(null);
    const [fillPercent, setFillPercent] = useState(10);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showAgentFormFromHome, setShowAgentFormFromHome] = useState(false);

    // --- GUARDAR EN TIEMPO REAL ---
    useEffect(() => {
        sessionStorage.setItem('funnelStepIndex', stepIndex.toString());
        sessionStorage.setItem('funnelLeadData', JSON.stringify(leadData));
    }, [stepIndex, leadData]);
    
    // --- NUEVO: Estado de verificación para evitar el pestañeo ---
    const [isVerifying, setIsVerifying] = useState(true); 
    
    // --- NUEVO: Detector de Enlace Exclusivo para Agentes ---
    const [isPortalRoute, setIsPortalRoute] = useState(window.location.hash === '#portal' || window.location.hostname.startsWith('portal.'));

    // Escuchar si la URL cambia o si entran por el subdominio
    useEffect(() => {
        // Verificación de seguridad inmediata
        if (window.location.hostname.startsWith('portal.')) {
            setIsPortalRoute(true);
        }

        const handleHashChange = () => {
            // Se activa si tiene el #portal O si el subdominio es portal.
            const isPortal = window.location.hash === '#portal' || window.location.hostname.startsWith('portal.');
            setIsPortalRoute(isPortal);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    // --- CAMBIO 1: Leer la memoria al cargar la página ---
    const [showAdmin, setShowAdmin] = useState(() => {
        return localStorage.getItem('isAdminLoggedIn') === 'true';
    });
    
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const { leads, agents, agentRequests, schedule, webhooks, generalSettings, user, addLead, updateLead, bulkUpdateLeads, bulkDeleteLeads, deleteLead, saveAgent, deleteAgent, approveAgentRequest, rejectAgentRequest, updateAgentRequest, updateSchedule, updateWebhooks, updateGeneralSettings, adminLogin, adminLogout } = useFirebaseDatabase();                                
    const currentStep = STEPS[stepIndex];

    // --- AUTO-ARCHIVADO DE CITAS PASADAS (Con margen de gracia de 2 horas) ---
    useEffect(() => {
        if (!leads || leads.length === 0 || !bulkUpdateLeads) return;
        const checkExpirations = () => {
            const now = Date.now();
            // 2 horas en milisegundos = 2 * 60 * 60 * 1000 = 7200000
            const GRACE_PERIOD = 7200000; 
            
            const toArchive = leads.filter(l => {
                if (l.status === 'archived' || !l.date || !l.time) return false;
                const timeInfo = getAgentLocalDateTime(l.date, l.time, l.state);
                // Solo la archiva si la hora actual es MAYOR a (la hora de la cita + 2 horas)
                return timeInfo && (timeInfo.localMs + GRACE_PERIOD) < now;
            }).map(l => l.id);

            if (toArchive.length > 0) {
                bulkUpdateLeads(toArchive, { status: 'archived' });
            }
        };
        checkExpirations();
        const interval = setInterval(checkExpirations, 60000); // Revisa cada 60 segundos
        return () => clearInterval(interval);
    }, [leads, bulkUpdateLeads]);

    // --- NUEVO: Temporizador inteligente que espera a Firebase ---
    
    useEffect(() => {
        if (showAdmin) {
            // Le damos a Firebase hasta 1.5 segundos máximo para descargar todo
            const timer = setTimeout(() => setIsVerifying(false), 1500);
            // Si la lista de agentes carga más rápido, quitamos la pantalla de espera antes
            if (agents && agents.length > 0) setIsVerifying(false);
            return () => clearTimeout(timer);
        }
    }, [showAdmin, agents]);

    useEffect(() => { window.scrollTo(0, 0); }, [stepIndex]);

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
    const saveData = async (form) => { 
        const finalData = { ...leadData, ...form }; 
        await addLead(finalData); 
        
        if (webhooks && webhooks.telegram) {
            try {
                // --- 🛠️ TRADUCTOR PARA EL MENSAJE DE TELEGRAM ---
                
                // 1. Fecha elegante (ej. lunes, 23 de febrero de 2026)
                let formattedDate = finalData.date;
                if (finalData.date) {
                    const dateObj = new Date(finalData.date + 'T12:00:00');
                    formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                }

                // 2. Tipo de llamada
                const callTypeMap = {
                    'video': 'Videollamada',
                    'call': 'Llamada Regular'
                };

                // 3. A quién protege
                const policyMap = {
                    'me': 'A mí mismo',
                    'spouse': 'A mi cónyuge',
                    'children': 'A mis hijos',
                    'parents': 'A mis padres'
                };
                const translatedPolicy = finalData.policy_for ? finalData.policy_for.map(val => policyMap[val] || val).join(', ') : '';

                // 4. Motivación (A prueba de mayúsculas)
                const motivationMap = {
                    'funeral': 'Gastos Funerarios',
                    'debt': 'Pagar Deudas',
                    'income': 'Reemplazo de Ingresos',
                    'legacy': 'Dejar Herencia',
                    'burden': 'Evitar carga financiera'
                };
                const translatedMotivation = finalData.motivation 
                    ? finalData.motivation.map(val => motivationMap[val.toLowerCase()] || val).join(', ') 
                    : '';

                // 5. Cobertura (A prueba de mayúsculas)
                const coverageMap = {
                    '5k': '$5,000',
                    '10k': '$10,000 - $15,000',
                    '15k': '$15,000 - $20,000',
                    '20k': '$20,000 - $25,000',
                    '25k': '$25,000 o más'
                };
                
                const safeCoverage = String(finalData.coverage_amount || '').toLowerCase();
                const formattedCoverage = coverageMap[finalData.coverage_amount] || finalData.coverage_amount;

                // Armamos el "Maletín VIP" solo para Make
                const webhookPayload = {
                    ...finalData,
                    date: formattedDate,
                    callType: callTypeMap[finalData.callType] || finalData.callType,
                    policy_for: translatedPolicy,
                    motivation: translatedMotivation,
                    coverage_amount: formattedCoverage
                };

                // Enviamos los datos embellecidos
                fetch(webhooks.telegram, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookPayload)
                });
            } catch (err) { console.error("Error Webhook Telegram:", err); }
        }
    };
    const completeSuccess = () => { 
        setIsSuccess(true); 
        sessionStorage.removeItem('funnelStepIndex');
        sessionStorage.removeItem('funnelLeadData');
    };

    // --- CAMBIO 2: Guardar el pase VIP al entrar ---
    const handleLogin = async (email, password) => {
        await adminLogin(email, password);
        setShowAdmin(true);
        localStorage.setItem('isAdminLoggedIn', 'true');
    };

    // --- CAMBIO 3: Borrar el pase VIP al salir ---
    const handleLogout = async () => {
        await adminLogout();
        setShowAdmin(false);
        localStorage.removeItem('isAdminLoggedIn');
        // Obligamos al navegador a quedarse en la ruta del portal al salir
        window.location.hash = '#portal';
    };

   if (isPortalRoute && !showAdmin) {
        if (showRegister) {
            return (
                <div className="min-h-screen bg-[#F5F5F7]">
                        <AgentRegistrationForm 
                            onCancel={() => setShowRegister(false)} 
                            onSubmit={async (data) => {
                                try {
                                    // Quitamos el ID vacío para que Firebase no se moleste y cree uno nuevo
                                    const { id, ...datosLimpios } = data;
                                    await addDoc(collection(db, 'agent_requests'), { ...datosLimpios, status: 'pending', timestamp: Date.now() }); 
                                } catch (e) { 
                                    console.error("Error crítico de guardado:", e); 
                                    throw e; 
                                }
                            }}
                        />
                    </div>
            );
        }
        return <PortalLoginScreen onLogin={handleLogin} onOpenRegister={() => setShowRegister(true)} />;
    }
    
    // --- ESCUDO ANTI-PESTAÑEO ---
    if (showAdmin) {
        
        // 1. Si Firebase aún no responde, bloqueamos la pantalla (Evita que se vea la Home)
        if (!user) {
            return (
                <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center font-sans animate-fade-in">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4 shadow-sm"></div>
                    <p className="text-sm font-semibold text-gray-500 animate-pulse tracking-wide">Restaurando sesión segura...</p>
                </div>
            );
        }

        // 2. Si el tiempo expiró y el servidor te desconectó, te devolvemos al login sin errores
        if (user.isAnonymous) {
            localStorage.removeItem('isAdminLoggedIn');
            window.location.reload();
            return null;
        }

        // 3. Ya sabemos que eres tú, esperamos la base de datos
        if (isVerifying) {
            return (
                <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center font-sans animate-fade-in">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4 shadow-sm"></div>
                    <p className="text-sm font-semibold text-gray-500 animate-pulse tracking-wide">Verificando credenciales de seguridad...</p>
                </div>
            );
        }

        const userEmail = user.email.toLowerCase();
        const currentAgent = agents.find(a => a.email && a.email.toLowerCase() === userEmail);

        // --- 🛡️ ADMINISTRADOR PROTEGIDO POR UID (Cero correos a la vista) ---
        const adminUIDs = ['Yy0zAUBf2vRfAAMPGIi18xv72rG2']; // 
        const isSuperAdmin = adminUIDs.includes(user.uid);

        if (currentAgent) {
            return <AgentPortal leads={leads} agent={currentAgent} onUpdateLead={updateLead} onLogout={handleLogout} generalSettings={generalSettings} />;
        }

        if (isSuperAdmin) {
            return (
                <AdminDashboard 
                    leads={leads} 
                    agents={agents} 
                    agentRequests={agentRequests}
                    onApproveRequest={approveAgentRequest}
                    onRejectRequest={rejectAgentRequest}
                    onUpdateAgentRequest={updateAgentRequest}
                    schedule={schedule}
                    webhooks={webhooks}
                    generalSettings={generalSettings}
                    onUpdateLead={updateLead}
                    bulkUpdateLeads={bulkUpdateLeads}
                    bulkDeleteLeads={bulkDeleteLeads}
                    onDeleteLead={deleteLead} 
                    onSaveAgent={saveAgent} 
                    onDeleteAgent={deleteAgent}
                    onUpdateSchedule={updateSchedule}
                    onUpdateWebhooks={updateWebhooks}
                    onUpdateGeneralSettings={updateGeneralSettings}
                    onClose={() => setShowAdmin(false)}
                    onLogout={handleLogout}
                />
            );
        } // <-- Aquí cerramos correctamente el if de isSuperAdmin

        // SI LLEGA AQUÍ: Es un agente eliminado intentando entrar
        return (
            <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-sans px-4 text-center animate-fade-in">
                <div className="bg-white/5 p-8 md:p-10 rounded-[2rem] border border-white/10 max-w-sm backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-inner">
                        <Lock size={32}/>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Acceso Denegado</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">Tu cuenta no se encuentra activa en nuestra base de datos corporativa. No tienes permisos para ingresar.</p>
                    <button onClick={handleLogout} className="bg-white text-black px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors w-full shadow-lg">Cerrar Sesión Segura</button>
                </div>
            </div>
        );
    } // <-- Aquí cerramos el if general de showAdmin
    // --- PANTALLA: FORMULARIO DE AGENTE DESDE LA HOME ---
    if (showAgentFormFromHome) {
        return (
            <AgentRegistrationForm 
                onCancel={() => setShowAgentFormFromHome(false)} 
            />
        );
    }

    if (stepIndex === 0) return (
        <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto font-sans relative">
            {/* CABECERA PÁGINA PRINCIPAL */}
            <header className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-gray-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <span className="text-gray-900 font-bold tracking-tight">asistente<span className="font-light text-gray-400">debeneficios.com</span></span>
                    </div>
                </div>
            </header>
            
            {/* Hero Section con Imágenes */}
            <div className="relative pt-32 pb-16 px-6 lg:px-12 bg-gradient-to-b from-rose-50/50 via-white to-white overflow-hidden">
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

                {/* ENLACE SUTIL PARA AGENTES */}
                <div className="mt-8 pt-6 border-t border-gray-200/80 w-full max-w-xs text-center animate-fade-in">
                    <p className="text-[11px] text-gray-400 font-medium">
                        ¿Eres un especialista con licencia activa?{' '}
                        <button 
                            onClick={() => setShowAgentFormFromHome(true)} 
                            className="text-gray-500 hover:text-rose-600 underline decoration-gray-300 hover:decoration-rose-300 underline-offset-2 transition-colors duration-300"
                        >
                            Únete a nuestro equipo
                        </button>
                    </p>
                </div>
            </footer>
        </div>
    );
    return (
        <div className="min-h-screen w-full flex flex-col bg-[#FAFAFA] relative">
        
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
