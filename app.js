import React, { useState, useEffect, useRef } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import { createPortal } from 'https://esm.sh/react-dom@18.2.0';
import { Heart, Check, ShieldCheck, Users, Baby, Activity, DollarSign, ChevronRight, ChevronLeft, ArrowLeft, Star, HelpCircle, Clock, Stethoscope, PenTool, Mail, Lock, X, Archive, Trash2, UserPlus, ShoppingCart, Phone, Edit2, Briefcase, BadgeCheck, MessageSquare, User, Image as ImageIcon, Video, Calendar, Shield, MapPin, CalendarDays, Settings, Plus, MinusCircle, Link as LinkIcon, Search, ArrowRight, Save, LogOut, RotateCcw, FileText, Printer, AlertTriangle, Upload, Building, Menu, Eye, EyeOff } from 'https://esm.sh/lucide-react@0.344.0';
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, setDoc, writeBatch, query, where, getDocs, getDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, verifyPasswordResetCode, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// --- CONSTANTS ---
const FULL_US_STATES = [
    { name: 'Alabama', abbr: 'AL' }, { name: 'Alaska', abbr: 'AK' }, { name: 'Arizona', abbr: 'AZ' }, { name: 'Arkansas', abbr: 'AR' }, { name: 'California', abbr: 'CA' }, { name: 'Colorado', abbr: 'CO' }, { name: 'Connecticut', abbr: 'CT' }, { name: 'Delaware', abbr: 'DE' }, { name: 'Florida', abbr: 'FL' }, { name: 'Georgia', abbr: 'GA' }, { name: 'Hawaii', abbr: 'HI' }, { name: 'Idaho', abbr: 'ID' }, { name: 'Illinois', abbr: 'IL' }, { name: 'Indiana', abbr: 'IN' }, { name: 'Iowa', abbr: 'IA' }, { name: 'Kansas', abbr: 'KS' }, { name: 'Kentucky', abbr: 'KY' }, { name: 'Louisiana', abbr: 'LA' }, { name: 'Maine', abbr: 'ME' }, { name: 'Maryland', abbr: 'MD' }, { name: 'Massachusetts', abbr: 'MA' }, { name: 'Michigan', abbr: 'MI' }, { name: 'Minnesota', abbr: 'MN' }, { name: 'Mississippi', abbr: 'MS' }, { name: 'Missouri', abbr: 'MO' }, { name: 'Montana', abbr: 'MT' }, { name: 'Nebraska', abbr: 'NE' }, { name: 'Nevada', abbr: 'NV' }, { name: 'New Hampshire', abbr: 'NH' }, { name: 'New Jersey', abbr: 'NJ' }, { name: 'New Mexico', abbr: 'NM' }, { name: 'New York', abbr: 'NY' }, { name: 'North Carolina', abbr: 'NC' }, { name: 'North Dakota', abbr: 'ND' }, { name: 'Ohio', abbr: 'OH' }, { name: 'Oklahoma', abbr: 'OK' }, { name: 'Oregon', abbr: 'OR' }, { name: 'Pennsylvania', abbr: 'PA' }, { name: 'Rhode Island', abbr: 'RI' }, { name: 'South Carolina', abbr: 'SC' }, { name: 'South Dakota', abbr: 'SD' }, { name: 'Tennessee', abbr: 'TN' }, { name: 'Texas', abbr: 'TX' }, { name: 'Utah', abbr: 'UT' }, { name: 'Vermont', abbr: 'VT' }, { name: 'Virginia', abbr: 'VA' }, { name: 'Washington', abbr: 'WA' }, { name: 'West Virginia', abbr: 'WV' }, { name: 'Wisconsin', abbr: 'WI' }, { name: 'Wyoming', abbr: 'WY' }
];
const ALL_US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// --- DICCIONARIO DE ESTADOS ---
const STATE_ABBR = { "Arizona": "AZ", "California": "CA", "Colorado": "CO", "Florida": "FL", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Montana": "MT", "Nevada": "NV", "New Mexico": "NM", "Oregon": "OR", "Texas": "TX", "Utah": "UT", "Virginia": "VA", "Wisconsin": "WI" };
// --- ✅ MAPA DE TIMEZONES POR ESTADO (solo los que usas) ---
const STATE_TZ = {
  "Arizona": "America/Phoenix",
  "California": "America/Los_Angeles",
  "Colorado": "America/Denver",
  "Florida": "America/New_York",
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
        { id: 'cost', label: '¿Será muy costoso?', icon: DollarSign, answer: "Para nada. Estos planes están diseñados para ajustarse a presupuestos fijos y lo mejor: la cuota nunca sube con el tiempo." },
        { id: 'health', label: '¿Piden examen médico?', icon: Stethoscope, answer: "¡Buenas noticias! La mayoría de los planes NO requieren examen médico, solo responder unas sencillas preguntas de salud." },
        { id: 'age', label: '¿Mi edad es un problema?', icon: HelpCircle, answer: "No es un impedimento. Puede tomar su cobertura antes de los 86 años y quedará protegido de por vida." },
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
        if (sels.includes('me')) return { title: "Un Acto de Responsabilidad", text: "Proteger a su familia de estos gastos finales es el regalo más desinteresado.", icon: User };
        if (sels.includes('parents')) return { title: "Gratitud Eterna", text: "Ellos cuidaron de usted toda la vida. Ahora es el turno de cuidar de ellos.", icon: ShieldCheck };
        if (sels.includes('spouse')) return { title: "Promesa de Amor", text: "Asegurar que su pareja o cónyuge no tenga cargas financieras es la prueba máxima de cariño.", icon: Heart };
        if (sels.includes('children')) return { title: "Futuro Seguro", text: "Garantizar la protección de sus hijos es la prioridad de todo padre.", icon: Baby };
    }
    if (stepId === 'motivation') return { title: "Paz Mental", text: "Transforma una futura preocupación en un recuerdo de amor.", icon: Star };
    if (stepId === 'coverage_amount') return { title: "Va por buen camino", text: "El costo promedio de un funeral supera los $9,000. Su elección ayudará a cubrir esa diferencia.", icon: DollarSign };
    if (stepId === 'budget') return { title: "Una inversión de amor", text: "Cuidar a su familia no requiere una fortuna. Con esta pequeña inversión mensual, les garantizará paz mental y tranquilidad para siempre.", icon: Heart };
    return null;
};

const generateUserLetter = (data) => {
    const insuredArray = data.policy_for || ['me'];
    let salutation = "A mis seres amados,", body = "", closing = "Con mucho amor,";

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
            salutation = "Al amor de mi vida,";
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
    const [agentRequests, setAgentRequests] = useState([]); 
    const [reviews, setReviews] = useState([]); // NUEVO: Estado para reseñas
    const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
    const [webhooks, setWebhooks] = useState({ telegram: '', assignment: '' });
    const [generalSettings, setGeneralSettings] = useState({ marketplaceMode: false });
    const [user, setUser] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);

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

        const unsubBooked = onSnapshot(collection(db, 'booked_slots'), (snapshot) => {
            setBookedSlots(snapshot.docs.map(doc => doc.id));
        }, (err) => {
            if (err.code !== 'permission-denied') console.error("Booked slots error:", err);
        });

        let unsubLeads = () => {};
        let unsubAgents = () => {};
        let unsubRequests = () => {}; 
        let unsubReviews = () => {}; // NUEVO: Limpieza de reseñas

        if (!user.isAnonymous) {
            // Descargamos las reseñas para el panel de Admin
            const reviewsQuery = collection(db, 'reviews');
            unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
                setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => { if (err.code !== 'permission-denied') console.error("Reviews error:", err); });
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

        return () => { unsubLeads(); unsubAgents(); unsubRequests(); unsubReviews(); unsubSchedule(); unsubWebhooks(); unsubGeneral(); unsubBooked(); };
    }, [user]);

    const addLead = async (lead) => {
        try {
            const initialStatus = generalSettings?.marketplaceMode ? 'marketplace' : 'new';
            const newLead = { ...lead, timestamp: Date.now(), status: initialStatus, notes: '' };
            
            if (generalSettings?.strictCalendarMode && lead.utcSlotId) {
                await runTransaction(db, async (transaction) => {
                    const slotRef = doc(db, 'booked_slots', lead.utcSlotId);
                    const slotDoc = await transaction.get(slotRef);
                    if (slotDoc.exists()) {
                        throw new Error("SLOT_TAKEN");
                    }
                    transaction.set(slotRef, { takenAt: Date.now() });
                    const newLeadRef = doc(collection(db, 'leads'));
                    transaction.set(newLeadRef, newLead);
                });
            } else {
                await addDoc(collection(db, 'leads'), newLead);
            }
            return true;
        } catch (error) {
            if (error.message === "SLOT_TAKEN") return "SLOT_TAKEN";
            console.error("Hubo un error de conexión al guardar.", error);
            return false;
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
    const deleteLead = async (id) => { 
        if (user) {
            const leadToDelete = leads.find(l => l.id === id);
            if (leadToDelete && leadToDelete.utcSlotId) {
                try {
                    await deleteDoc(doc(db, 'booked_slots', leadToDelete.utcSlotId));
                } catch(e) {
                    console.error("Error liberando horario estricto", e);
                }
            }
            await deleteDoc(doc(db, 'leads', id)); 
        }
    };
    const deleteReview = async (id) => { if (user) await deleteDoc(doc(db, 'reviews', id)); };
    
    const saveAgent = async (agent) => {
        if (!user) return;
        const col = collection(db, 'agents');
        if (agent.id) {
            const { id, ...data } = agent;
            await updateDoc(doc(col, id), data);
        } else {
            // Extraemos el id (que viene undefined) y guardamos solo el resto de los datos
            const { id, ...dataToSave } = agent; 
            await addDoc(col, { ...dataToSave, timestamp: Date.now() });
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
        
        const newAgentData = {
            name: request.fullName || '', 
            email: request.email || '', 
            phone: request.phone || '',
            bio: request.bio || '', 
            photo: request.photo || '', 
            license: request.licenseSummary || 'Sin estados configurados',
            companies: request.companies || 'Independiente', 
            isAgency: request.isAgency || false, 
            licensesArray: request.licenses || [], 
            timestamp: Date.now(), 
            status: 'active'
        };

        const newAgentRef = doc(collection(db, 'agents'));
        batch.set(newAgentRef, newAgentData);
        
        const requestRef = doc(db, 'agent_requests', request.id);
        batch.delete(requestRef);

        // 🔥 ENVIAMOS A MAKE PRIMERO Y ESPERAMOS ANTES DE ACTUALIZAR LA PANTALLA 🔥
        const url = webhooks?.master || webhooks?.telegram;
        if (url) {
            try {
                await fetch(url, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        evento: 'agente_aprobado', 
                        datos: { lead: null, agent: { ...newAgentData, id: newAgentRef.id } } 
                    })
                });
            } catch(e) {
                console.error("Error contactando a Make:", e);
            }
        }
        
        // AHORA SÍ, aplicamos en Firebase y se quita de la pantalla
        await batch.commit();
    };

    const rejectAgentRequest = async (request) => {
        if (!user) return;
        
        // 🔥 ENVIAMOS A MAKE PRIMERO Y ESPERAMOS 🔥
        const url = webhooks?.master || webhooks?.telegram;
        if (url) {
            try {
                await fetch(url, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        evento: 'agente_rechazado', 
                        datos: { lead: null, agent: request } 
                    })
                });
            } catch(e) {
                console.error("Error contactando a Make:", e);
            }
        }

        // AHORA SÍ, lo borramos de la base de datos
        await deleteDoc(doc(db, 'agent_requests', request.id));
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

    return { leads, agents, agentRequests, reviews, schedule, webhooks, generalSettings, user, bookedSlots, addLead, updateLead, bulkUpdateLeads, bulkDeleteLeads, deleteLead, deleteReview, saveAgent, deleteAgent, approveAgentRequest, rejectAgentRequest, updateAgentRequest, updateSchedule, updateWebhooks, updateGeneralSettings, adminLogin, adminLogout };
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

// --- NUEVO: MODALES ELEGANTES DE TÉRMINOS Y CONDICIONES (CON PORTAL) ---
const TermsModal = ({ type = 'prospect', onClose }) => {
    const isAgent = type === 'agent';
    
    const modalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 md:p-8 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up border border-gray-100">
                <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className={`p-3 rounded-xl ${isAgent ? 'bg-gray-100 text-gray-700' : 'bg-rose-50 text-rose-500'}`}><ShieldCheck size={24}/></div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{isAgent ? 'Términos para Agentes' : 'Términos y Condiciones de Uso'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
                </div>
                <div className="p-6 md:p-10 overflow-y-auto text-sm md:text-base text-gray-600 space-y-6 md:space-y-8 leading-relaxed">
                    {isAgent ? (
                        <>
                            <p><strong>1. Naturaleza de la Plataforma y Licencia de Uso:</strong> <strong>asistentedebeneficios.com</strong> proporciona una infraestructura tecnológica SaaS (Software as a Service) diseñada para facilitar el enlace exclusivo entre personas y familias en búsqueda de soluciones de protección, planificación financiera y beneficios, con especialistas certificados en dichas áreas. La aprobación de su cuenta le otorga una licencia de uso revocable, intransferible y no exclusiva para acceder a nuestra red y utilizar nuestras herramientas de gestión (CRM interno).</p>
                            <p><strong>2. Asignaciones y Derechos de Conexión Exclusiva:</strong> Nuestra tecnología invierte recursos significativos en la captación, verificación y enrutamiento de solicitudes de asesoría. Al aceptar una asignación a su cartera, usted adquiere el <strong>derecho de conexión exclusiva</strong> con ese solicitante, garantizando que ningún otro especialista de nuestra red intervendrá en su gestión. Debido a que los honorarios tecnológicos cubren el uso de la infraestructura, el bloqueo territorial y el enrutamiento en tiempo real, <strong>todas las asignaciones tienen carácter definitivo</strong>. La plataforma cumple su función al establecer el canal de comunicación; por lo tanto, las fluctuaciones en la tasa de contacto, la decisión final del usuario o los aplazamientos de las citas recaen bajo la responsabilidad operativa del especialista, no existiendo lugar a reversiones de los cargos de plataforma.</p>
                            <p><strong>3. Protocolo de Seguimiento y Sincronización de Expedientes (Estatus):</strong> Para garantizar los más altos estándares de calidad y permitir el correcto funcionamiento de las métricas de la plataforma, el specialist se compromete a mantener una sincronización absoluta y en tiempo real del expediente de cada caso asignado. Es de carácter <strong>obligatorio</strong> actualizar rigurosamente el "Estatus de la Gestión" (ej. <em>Cita Programada, En Seguimiento, Venta Cerrada, Descartado</em>) dentro del panel de control tras cada interacción. La omisión sistemática en la actualización de estos expedientes o el abandono de la cartera generará discrepancias en nuestras auditorías de calidad, lo cual es causal de suspensión temporal o revocación definitiva de las credenciales de acceso a la red.</p>
                            <p><strong>4. Privacidad, Seguridad de Datos y Cumplimiento Normativo:</strong> Como especialista autorizado, usted tendrá acceso a información altamente sensible (datos personales, financieros y/o de salud). Usted acepta manejar esta información bajo el cumplimiento estricto de las normativas federales de privacidad aplicables, incluyendo leyes como HIPAA y TCPA según correspondan al servicio brindado. Queda categóricamente prohibido exportar, comercializar, transferir o compartir los expedientes de los usuarios con terceras personas, bases de datos externas u otras agencias no autorizadas explícitamente por esta plataforma.</p>
                            <p><strong>5. Sistema de Evaluación y Transparencia:</strong> Creemos en la excelencia del servicio. Al utilizar esta plataforma, usted acepta someterse a nuestro sistema de calidad automatizado, el cual permite a los clientes evaluar su nivel de empatía, claridad y profesionalismo tras la asesoría mediante un sistema de calificación. Mantener un índice de calidad óptimo es un requisito indispensable para continuar recibiendo asignaciones exclusivas.</p>
                            <p><strong>6. Ética Profesional y Representación:</strong> Nuestra misión es brindar claridad, educación y paz mental, no presión. Se exige un comportamiento guiado por la empatía, la honestidad y la transparencia total sobre los servicios, pólizas, coberturas y exclusiones ofrecidas. Cualquier táctica de venta coercitiva, acoso, o engaño deliberado resultará en la expulsión inmediata y permanente de la plataforma.</p>
                            <p><strong>7. Auditoría y Revocación de Privilegios:</strong> La administración de la plataforma se reserva el derecho de monitorear el rendimiento, auditar la gestión de los expedientes y realizar controles de calidad periódicos. Nos reservamos el derecho de revocar el acceso a cualquier especialista que incumpla estos pilares operativos, sin previo aviso, para salvaguardar la integridad de los usuarios que confían en nuestra red.</p>
                            <p><strong>8. Independencia y Límite de Responsabilidad:</strong> Usted reconoce que opera bajo su propia licencia como contratista independiente. <strong>asistentedebeneficios.com</strong> actúa única y exclusivamente como una pasarela tecnológica de conexión. No somos una agencia de seguros cautiva, no emitimos pólizas, ni representamos corporativamente a ninguna aseguradora en particular. Por lo tanto, <strong>asistentedebeneficios.com</strong> queda absolutamente exenta de cualquier responsabilidad legal, reclamo, disputa de comisiones o trámite derivado de la relación comercial que usted establezca con el usuario o con las compañías aseguradoras. Todo proceso de suscripción, aprobación, reclamación de siniestros, retención o venta de productos adicionales posteriores a la conexión inicial, recae bajo la responsabilidad exclusiva y directa entre usted, el cliente y la compañía aseguradora correspondiente.</p>
                        </>
                    ) : (
                        <>
                            <p><strong>1. Servicio de Conexión Segura:</strong> <strong>asistentedebeneficios.com</strong> es una plataforma tecnológica y gratuita diseñada exclusivamente para facilitar el enlace entre familias en búsqueda de asesoría y especialistas con licencia activa en su estado de residencia.</p>
                            <p><strong>2. Nuestra Función e Independencia Legal:</strong> Nuestra plataforma funciona estrictamente como un puente informativo. <strong>asistentedebeneficios.com</strong> no es una compañía de seguros, no emite coberturas ni representa a ninguna aseguradora en particular. Al utilizar nuestro servicio, usted comprende que nuestro alcance finaliza al conectarlo con un especialista. Cualquier trámite, aprobación de póliza, pagos, reclamaciones de siniestros o adquisición de nuevos servicios en el futuro, se gestionarán directamente entre usted, su especialista asignado y la compañía aseguradora que usted elija, eximiendo a <strong>asistentedebeneficios.com</strong> de cualquier responsabilidad sobre dichos procesos.</p>
                            <p><strong>3. Privacidad y Protección de Datos:</strong> Su tranquilidad es nuestra prioridad. Su información es tratada bajo los más altos estándares de encriptación y privacidad. Únicamente compartiremos sus datos básicos de contacto con el especialista certificado asignado a su caso para poder brindarle la asesoría solicitada. Jamás venderemos su información a terceros ni a bases de telemarketing masivo.</p>
                            <p><strong>4. Asesoría Consultiva sin Compromiso:</strong> Nuestra misión es educar y proteger. Solicitar y recibir una asesoría a través de nuestra red no le genera ninguna obligación contractual ni financiera. Usted es completamente libre de decidir si desea o no adquirir una cobertura de protección tras escuchar sus opciones.</p>
                            <p><strong>5. Consentimiento de Comunicación:</strong> Al aceptar estos términos, usted otorga su consentimiento expreso para ser contactado (mediante llamada, mensaje de texto SMS o correo electrónico) exclusivamente por <strong>asistentedebeneficios.com</strong> para fines de confirmación de cita, y por el especialista asignado a su caso para brindarle la asesoría solicitada.</p>
                            <p><strong>6. Su Voz es Importante (Sistema de Evaluación):</strong> Creemos en la excelencia y la transparencia. Tras su asesoría, usted tendrá el poder de evaluar y calificar el nivel de empatía, claridad y profesionalismo de su especialista asignado. Sus comentarios son fundamentales para mantener los más altos estándares de calidad en nuestra red y asegurar que cada familia reciba el trato excepcional que merece.</p>
                        </>
                    )}
                </div>
                <div className="p-6 md:p-8 border-t border-gray-100 shrink-0">
                    <button onClick={onClose} className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 ${isAgent ? 'bg-black' : 'bg-[#E11D48]'}`}>
                        <Check size={20}/> Acepto y Entiendo
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

// --- NUEVO: MODAL ELEGANTE DE CONTACTO ---
const ContactUsModal = ({ onClose }) => {
    const email = 'asistentedebeneficios@gmail.com';
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col shadow-2xl animate-slide-up border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8 flex justify-end items-center shrink-0 border-b border-gray-100">
                    <button onClick={onClose} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
                </div>
                <div className="p-8 md:p-10 text-center space-y-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
                        <Mail size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-950 tracking-tight">Estamos aquí para usted</h2>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                        ¿Tiene preguntas, necesita ayuda o simplemente desea hablar con nosotros? Nuestro equipo está listo para asistirle de la mejor manera.
                    </p>
                    <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] w-full flex flex-col items-center gap-3 group transition-all hover:bg-white hover:shadow-md hover:border-green-200">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contacto Oficial</span>
                        
                        {/* Correo estilizado: fuente sans, tamaño reducido y menos grosor */}
                        <span className="text-base md:text-lg font-medium text-gray-800 break-all select-all tracking-tight">
                            {email}
                        </span>

                        <div className="flex items-center gap-4 pt-1">
                             <button onClick={() => navigator.clipboard.writeText(email)} className="text-[11px] font-bold text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1.5">
                                <Plus size={12}/> Copiar
                             </button>
                             <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                             <button onClick={() => window.location.href = `mailto:${email}`} className="text-[11px] font-bold text-green-600 hover:text-green-700 transition-colors flex items-center gap-1.5">
                                <Mail size={12}/> Redactar
                             </button>
                        </div>
                    </div>
                </div>
                <div className="p-6 md:p-8 border-t border-gray-100 shrink-0">
                    <button onClick={onClose} className="w-full py-4 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 bg-black">
                        <Check size={20}/> Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NUEVO: MODAL ELEGANTE DE CONVOCATORIA CERRADA ---
const RegistrationClosedModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md overflow-y-auto z-[100] animate-fade-in flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md relative shadow-2xl animate-slide-up p-8 md:p-12 text-center border border-gray-100 overflow-hidden">
                {/* Brillo de fondo estilo Apple */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full blur-[40px] pointer-events-none"></div>
                
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors z-10"><X size={20}/></button>
                
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner relative z-10">
                    <Lock size={32} className="text-gray-400" strokeWidth={1.5}/>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 tracking-tight relative z-10">Convocatoria Cerrada</h2>
                
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-10 font-medium relative z-10">
                    Agradecemos profundamente tu interés en formar parte de Asistente de Beneficios. En este momento <strong className="text-gray-800">no estamos recibiendo nuevas solicitudes</strong> para expandir el equipo. 
                    <br/><br/>
                    Por favor, mantente atento a nuestras próximas aperturas.
                </p>
                
                <button onClick={onClose} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-xl relative z-10">
                    Entendido, volver
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTS ---
const AgentRegistrationForm = ({ onCancel, onSubmit, initialData = null, generalSettings }) => {
    const availableStates = generalSettings?.activeStates ? FULL_US_STATES.filter(s => generalSettings.activeStates.includes(s.abbr)) : FULL_US_STATES;
    const [formData, setFormData] = useState(initialData ? { id: initialData.id, fullName: initialData.fullName, email: initialData.email, phone: initialData.phone, companies: initialData.companies, isAgency: initialData.isAgency, bio: initialData.bio } : { fullName: '', email: '', phone: '', companies: '', isAgency: false, bio: '' });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedRemote, setAcceptedRemote] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);   
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
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto z-[100] animate-fade-in [scrollbar-gutter:stable]">
                <div className="grid min-h-[100dvh] place-items-center p-4 py-10">
                <div className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl animate-slide-up my-8">
                    <button onClick={onCancel} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10"><X size={20}/></button>
                    
                    <div className="p-6 md:p-8 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">{initialData ? 'Editar Solicitud' : 'Únete al Equipo'}</h2>
                        <p className="text-gray-500 text-sm mt-1">{initialData ? 'Corrige los datos del aspirante antes de aprobarlo.' : 'Completa tu perfil profesional para enviar la solicitud.'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-3">
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
                                                {availableStates.map(st => <option key={st.abbr} value={st.abbr}>{st.name}</option>)}
                                            </select>
                                            {availableStates.length < 50 && generalSettings?.waitlistUrl && (
                                                <a href={generalSettings.waitlistUrl} target="_blank" rel="noopener noreferrer" className="block mt-1.5 text-[9px] text-blue-500 hover:text-blue-600 underline">
                                                    ¿Tu estado no aparece? Anótate aquí.
                                                </a>
                                            )}
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

                        <div className="pt-2 space-y-3">
                            {/* NUEVO: Checkbox de Venta Remota */}
                            <label className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                                    <input type="checkbox" required checked={acceptedRemote} onChange={e => setAcceptedRemote(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-blue-300 rounded cursor-pointer checked:bg-blue-600 checked:border-blue-600 transition-all" />
                                    <Check size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                </div>
                                <span className="text-xs font-medium text-blue-900 leading-relaxed">
                                    Entiendo que los clientes de esta plataforma son para atención <strong>100% a distancia (Telesales)</strong>. Confirmo que las compañías que represento permiten la venta y emisión de pólizas por teléfono o videollamada.
                                </span>
                            </label>

                            {/* Checkbox de Términos y Condiciones */}
                            <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                                    <input type="checkbox" required checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-black checked:border-black transition-all" />
                                    <Check size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                </div>
                                <span className="text-xs font-medium text-gray-600 leading-relaxed">
                                    He leído y acepto los <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }} className="font-bold text-black underline decoration-2 decoration-gray-300 hover:decoration-black cursor-pointer">Términos y Condiciones de Uso</span> para formar parte del equipo.
                                </span>
                            </label>
                        </div>

                        <div className="pt-3 mt-2 border-t border-gray-100">
                            <button type="submit" disabled={isSubmitting || formData.bio.length > 150 || emailError || phoneError || !acceptedTerms || !acceptedRemote} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
                                {isSubmitting ? (initialData ? 'Guardando...' : 'Enviando...') : (initialData ? 'Guardar Cambios' : 'Enviar Solicitud')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        {showTermsModal && <TermsModal type="agent" onClose={() => setShowTermsModal(false)} />}
        </>
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
            const actionCodeSettings = {
                url: window.location.origin + window.location.pathname + '#recuperar',
                handleCodeInApp: false
            };
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            setResetMsg('Enlace mágico enviado. Revisa tu bandeja.');
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
    const [isWritingComplete, setIsWritingComplete] = useState(false);

    // Temporizador para el efecto de Fade-In ajustado a 3 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsWritingComplete(true);
        }, 3000); // <-- CAMBIO A 3 SEGUNDOS
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col w-full pt-4 pb-10 min-h-0 px-2 md:px-0">
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400;1,600&display=swap');
                @keyframes letterFadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}} />

            {/* Diseño del papel texturizado/crema */}
            <div className="bg-[#FCFBF8] p-6 md:p-10 rounded-[2rem] border border-[#EBE5D9] relative mb-6 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#E11D48] via-rose-400 to-[#E11D48] opacity-80"></div>
                
                {/* SOLUCIÓN AL CORAZÓN NEGRO: Color incrustado y opacidad pura */}
                <div className="absolute -bottom-10 -right-10 pointer-events-none" style={{ opacity: 0.03 }}>
                    <Heart size={200} color="#E11D48" fill="#E11D48" />
                </div>
                
                {/* SOLUCIÓN AL PESTAÑEO: Se inicia invisible (opacity: 0) desde la línea 1 de ejecución */}
                <div 
                    className="italic space-y-4 leading-relaxed pb-4 relative z-10 mt-2 min-h-[150px]"
                    style={{ fontFamily: "'Crimson Text', Georgia, serif", opacity: 0, animation: 'letterFadeIn 3s ease-in-out forwards' }}
                >
                    <p className="font-semibold text-[#9F1239] text-2xl md:text-3xl">{letter.salutation}</p>
                    <p className="text-xl md:text-2xl text-gray-800 tracking-wide">{letter.body}</p>
                    <p className="font-semibold text-[#9F1239] text-2xl md:text-3xl pt-4">{letter.closing}</p>
                </div>
                
                {/* ÁREA DE ACCIÓN REDUCIDA */}
                <div 
                    className={`mt-8 md:mt-10 relative w-full flex items-center justify-center p-5 md:p-6 rounded-3xl transition-all duration-500 ${
                        !isWritingComplete
                        ? 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed'
                        : !isSigned 
                        ? 'bg-rose-50/80 border-2 border-dashed border-[#E11D48] hover:bg-rose-100/80 shadow-inner cursor-pointer' 
                        : 'bg-white border border-gray-100 shadow-sm'
                    }`} 
                    onClick={(!isSigned && isWritingComplete) ? () => setIsSigned(true) : undefined}
                >
                    {!isSigned ? (
                        <div className={`flex flex-col items-center justify-center text-center ${isWritingComplete ? 'animate-pulse' : 'text-gray-400'}`}>
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 shadow-sm transition-colors ${isWritingComplete ? 'bg-[#E11D48] text-white shadow-rose-500/40' : 'bg-gray-200 text-gray-400 shadow-none'}`}>
                                <PenTool size={24} />
                            </div>
                            <span className={`font-black text-lg md:text-xl uppercase tracking-widest mb-1 font-sans ${isWritingComplete ? 'text-[#E11D48]' : 'text-gray-400'}`}>
                                {isWritingComplete ? "Tocar Aquí" : "Espere..."}
                            </span>
                            <span className={`font-bold text-xs md:text-sm font-sans ${isWritingComplete ? 'text-rose-800' : 'text-gray-400'}`}>
                                {isWritingComplete ? "Para sellar la promesa" : "Leyendo carta..."}
                            </span>
                        </div>
                    ) : (
                        <div className="animate-stamp relative py-2">
                            <div className="border-[4px] border-[#E11D48] rounded-full w-24 h-24 md:w-28 md:h-28 flex items-center justify-center transform -rotate-12 opacity-95 bg-white shadow-xl">
                                <div className="border-2 border-[#E11D48] rounded-full w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center text-[#E11D48] border-dashed">
                                    <Heart size={24} fill="currentColor" className="mb-1" />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] leading-none font-sans">Promesa</span>
                                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] mt-1 text-rose-800 font-sans">Sellada</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="shrink-0 animate-slide-up pb-8">
                <p className="text-center text-gray-500 text-sm md:text-base font-medium mb-4">
                    {!isWritingComplete ? "Por favor lea la carta de compromiso..." : isSigned ? "✓ Su compromiso de amor ha quedado registrado." : "Descuide, esto es sólo un acto simbólico."}
                </p>
                <button 
                    onClick={onContinue} 
                    disabled={!isSigned || !isWritingComplete} 
                    className={`w-full py-4 md:py-5 rounded-full font-bold text-lg md:text-xl shadow-xl transition-all flex items-center justify-center gap-2 ${isSigned && isWritingComplete ? 'bg-[#E11D48] text-white hover:scale-[1.02]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    Continuar <ChevronRight size={24}/>
                </button>
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

const ContactForm = ({ onSubmit, onSuccess, data, scheduleConfig, onAdminTrigger, generalSettings, bookedSlots }) => {
    const availableStates = generalSettings?.activeStates ? FULL_US_STATES.filter(s => generalSettings.activeStates.includes(s.abbr)) : FULL_US_STATES;
    const [name, setName] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [age, setAge] = useState(''); // <-- NUEVO CAMPO EDAD
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
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isToday = date === todayStr;
        
        // Sumamos 1 hora (60 minutos) a la hora actual para crear el margen de preparación
        const bufferTime = new Date(now.getTime() + 60 * 60 * 1000);

        dayConfig.blocks.forEach(block => {
            let current = new Date(`${date}T${block.start}`);
            const end = new Date(`${date}T${block.end}`);
            while(current < end) {
                const timeStr = current.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true}).toLowerCase().replace('am', 'a.m.').replace('pm', 'p.m.');
                
                // Si es hoy, bloqueamos si la hora del bloque es menor al margen de preparación (ahora + 1 hr)
                if(isToday && current < bufferTime) { 
                    current.setMinutes(current.getMinutes() + 60); 
                    continue; 
                }
                
                slots.push(timeStr);
                current.setMinutes(current.getMinutes() + 60); 
            }
        });
        slots.sort((a, b) => new Date('1970/01/01 ' + a.replace('a.m.','AM').replace('p.m.','PM')) - new Date('1970/01/01 ' + b.replace('a.m.','AM').replace('p.m.','PM')));
        
        const finalSlots = slots.filter(timeStr => {
            if (!generalSettings?.strictCalendarMode || !state) return true;
            const tz = STATE_TZ[state];
            if (!tz) return true;
            const utcMs = zonedDateTimeToUtcMs(date, timeStr, tz);
            return !bookedSlots.includes(String(utcMs));
        });
        
        setAvailableSlots(finalSlots); setTime(''); 
    }, [date, scheduleConfig, state, generalSettings?.strictCalendarMode, bookedSlots]);

    const ageNum = parseInt(age, 10);
    const isAgeValid = ageNum >= 18 && ageNum <= 85;
    const isFormValid = name && age && isAgeValid && phone.replace(/\D/g, '').length === 10 && state && (noEmail || email) && date && time && acceptedTerms;

    useEffect(() => {
        if (status === 'success') {
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
        }
    }, [status]);

    // --- NUEVO ESTADO: Manejador de error para fechas pasadas ---
    const [dateErrorMsg, setDateErrorMsg] = useState('');

    // Calculamos la fecha de HOY para permitir citas el mismo día (Movido arriba para poder usarlo en la validación)
    const todayObj = new Date();
    // Ajuste de zona horaria básico: evitamos que a las 11:59pm se desfase
    const minDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        
        // --- 🛡️ BARRERA CONTRA FECHAS DEL PASADO (Para Móviles) ---
        setDateErrorMsg(''); // Limpiamos errores previos
        if (date && date < minDate) {
            setDateErrorMsg('Ha seleccionado una fecha que ya pasó. Por favor, elija el día de hoy o una fecha futura.');
            return; // Detiene el envío
        }
        // ----------------------------------------------------------

        if(!isFormValid || status !== 'idle') return;
        setStatus('submitting');
        
        const tz = STATE_TZ[state];
        const utcSlotId = (generalSettings?.strictCalendarMode && tz) ? String(zonedDateTimeToUtcMs(date, time, tz)) : null;
        
        const result = await onSubmit({ name, age, phone, email: noEmail ? 'No proporcionado' : email, state, callType, date, time, utcSlotId });
        
        if (result === "SLOT_TAKEN") {
            setDateErrorMsg('Alguien más acaba de reservar este horario. Por favor, elija otro rápidamente.');
            setStatus('idle');
            setTime('');
            return;
        }

        setStatus('success');
        onSuccess();
    };

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
                        <p className="text-gray-500 mb-6 text-sm md:text-base">Ha dado un paso gigante de amor.</p>
                        
                        <div className="bg-rose-50 p-5 md:p-6 rounded-2xl text-rose-800 italic text-sm md:text-base shadow-inner mb-6 w-full">
                            "No hay mayor tranquilidad que saber que, pase lo que pase, su familia estará protegida. Gracias por cuidarlos hoy."
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
                                En breve recibirá por correo electrónico todos los datos de su especialista. Gracias por utilizar nuestos servicios.
                            </p>
                        </div>

                        <button onClick={() => window.location.reload()} className="mt-2 text-gray-400 font-medium hover:text-gray-600 text-xs md:text-sm underline transition-colors">Volver al inicio</button>
                    </div>
                ) : (
               <>
                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><User size={16} className="text-rose-500"/> Datos de Contacto</h3>
                        <div className="space-y-3">
                            <div><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Nombre Completo</label><input type="text" className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="Ej. Maria Perez" value={name} onChange={e => setName(e.target.value)} disabled={status !== 'idle'} /></div>
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Edad</label>
                                <input 
                                    type="number" 
                                    min="18" 
                                    max="85" 
                                    className={`w-full p-3 md:p-4 rounded-xl border text-sm md:text-base font-medium outline-none transition-all focus:ring-2 ${age && !isAgeValid ? 'border-red-400 bg-red-50 text-red-700 focus:bg-red-50 focus:ring-red-400' : 'border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:ring-rose-500'}`} 
                                    placeholder="Ej: 55" 
                                    value={age} 
                                    onChange={e => setAge(e.target.value)} 
                                    disabled={status !== 'idle'} 
                                />
                                {age && !isAgeValid && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1 animate-fade-in flex items-center gap-1">
                                        <AlertTriangle size={10} strokeWidth={3}/> Edad para agendar: 18 a 85 años.
                                    </p>
                                )}
                            </div>
                            <div><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Teléfono Celular</label><input type="tel" className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all" placeholder="Ej: (555) 123-4567" value={phone} onChange={e => setPhone(formatPhoneNumber(e.target.value))} maxLength="14" disabled={status !== 'idle'} /></div>
                            <div>
                                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 tracking-wider">Estado (EE.UU.)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 md:left-4 top-3.5 md:top-4 text-gray-400" size={18}/>
                                    <select className="w-full p-3 md:p-4 pl-10 md:pl-10 rounded-xl border border-gray-200 bg-gray-50 text-sm md:text-base font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all appearance-none text-gray-700" value={state} onChange={e => setState(e.target.value)} disabled={status !== 'idle'}>
                                        <option value="">Seleccione su Estado</option>
                                        {availableStates.map(s => <option key={s.abbr} value={s.name}>{s.name}</option>)}
                                    </select>
                                    {availableStates.length < 50 && (
                                        <p className="text-[10px] text-gray-400 mt-2 ml-1 leading-tight font-medium">
                                            Si su estado no aparece, es porque por el momento no contamos con cobertura en esa área.{' '}
                                            {generalSettings?.waitlistUrl && (
                                                <a href={generalSettings.waitlistUrl} target="_blank" rel="noopener noreferrer" className="text-black font-bold hover:text-gray-700 underline underline-offset-2 transition-colors">
                                                    Únase a nuestra lista de espera aquí.
                                                </a>
                                            )}
                                        </p>
                                    )}
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
                        {!noEmail ? (
                            <div className="space-y-2.5">
                                <input type="email" className="w-full p-3 md:p-4 rounded-xl border border-gray-200 bg-white text-sm md:text-base font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="ejemplo@correo.com" value={email} onChange={e => setEmail(e.target.value)} disabled={status !== 'idle'} />
                                {/* Botones de Autocompletado para Adultos Mayores */}
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                    {['@gmail.com', '@yahoo.com', '@hotmail.com', '@icloud.com'].map(domain => (
                                        <button 
                                            key={domain}
                                            type="button"
                                            disabled={status !== 'idle'}
                                            onClick={() => {
                                                const base = email.split('@')[0]; // Toma solo el nombre si ya pusieron un arroba (corrige errores)
                                                setEmail(base + domain);
                                            }}
                                            className="px-3.5 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-600 hover:text-blue-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
                                        >
                                            {domain}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl text-xs md:text-sm flex items-start gap-2"><Shield size={16} className="shrink-0 mt-0.5"/><span>No hay problema, conocerá a su especialista en su cita.</span></div>
                        )}
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
                            <div>
                                <div className="relative">
                                    {!date && (
                                        <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm md:text-base font-medium">Seleccione un día...</span>
                                        </div>
                                    )}
                                    <input 
                                        type="date" 
                                        min={minDate} 
                                        className={`w-full p-3 md:p-4 rounded-xl border ${dateErrorMsg ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 bg-gray-50 text-gray-700'} text-sm md:text-base font-medium outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all ${!date ? 'text-transparent' : ''}`} 
                                        value={date} 
                                        onChange={e => { setDate(e.target.value); setDateErrorMsg(''); }} 
                                        disabled={status !== 'idle'} 
                                    />
                                </div>
                            </div>
                            {date && (
                                <div className="animate-fade-in"><label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase ml-1 mb-1.5 block tracking-wider">Horarios Disponibles</label>{availableSlots.length > 0 ? (<div className="grid grid-cols-2 md:grid-cols-3 gap-2">{availableSlots.map(slot => (<button key={slot} onClick={() => setTime(slot)} disabled={status !== 'idle'} className={`py-2.5 md:py-3 px-2 text-xs md:text-sm rounded-lg border transition-colors outline-none ${time === slot ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-md' : 'bg-white border-gray-200 text-gray-600'}`}>{slot}</button>))}</div>) : (<div className="text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300"><p className="text-xs md:text-sm text-gray-500">Lo sentimos, no hay cupos disponibles o está cerrado este día.</p></div>)}</div>
                            )}
                        </div>
                    </div>
                    
                    {/* --- SECCIÓN FINAL AGRUPADA PARA REDUCIR ESPACIOS --- */}
                    <div className="flex flex-col gap-3 !mt-2 px-2 sm:px-0">
                        
                        {/* Términos y Condiciones */}
                        <label className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors shadow-sm">
                            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} disabled={status !== 'idle'} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-rose-500 checked:border-rose-500 transition-all disabled:opacity-50" />
                                <Check size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                            </div>
                            <span className="text-[10px] md:text-xs font-medium text-gray-500 leading-normal">
                                He leído y acepto los <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }} className="font-bold text-gray-700 underline decoration-2 decoration-gray-300 hover:decoration-gray-700 cursor-pointer transition-colors">Términos y Condiciones de Uso</span>. Entiendo que seré contactado por un especialista licenciado.
                            </span>
                        </label>

                        {/* Botón y Textos inferiores */}
                        <div className="w-full flex flex-col gap-2">
                            {date && date < minDate && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-bold animate-fade-in shadow-sm mb-1">
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                    <p>Ha seleccionado una fecha pasada. Por favor, elija hoy o una fecha futura.</p>
                                </div>
                            )}
                            <button onClick={(e) => { if(date && date < minDate) { e.preventDefault(); return; } handleFinalSubmit(e); }} disabled={!isFormValid || status !== 'idle'} className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 md:gap-3 hover:scale-[1.02] ${status === 'success' ? 'bg-green-600 text-white cursor-default' : 'bg-[#E11D48] text-white'}`}>
                                {status === 'submitting' ? (<>Enviando... <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full"></div></>) : (<>Programar Cita <Check className="inline" size={20} strokeWidth={3} /></>)}
                            </button>
                            
                            {status === 'idle' && (
                                <div className="flex flex-col items-center gap-1.5 mt-1">
                                    <p className="text-center text-[10px] md:text-xs text-gray-400 px-2 leading-tight">Cuando sea asignado un especialista le notificaremos por correo electrónico si lo proporcionó.</p>
                                    <button type="button" onClick={() => { sessionStorage.removeItem('funnelStepIndex'); sessionStorage.removeItem('funnelLeadData'); window.location.reload(); }} className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-gray-800 transition-colors border-b-2 border-transparent hover:border-gray-800 pb-0.5">Volver a la pantalla principal</button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
                )}
            </div>
            {showTermsModal && <TermsModal type="prospect" onClose={() => setShowTermsModal(false)} />}
        </div>
    );
};

const AgentSelectionModal = ({ agents, onClose, onSelect, contextLeads = [], allLeads = [] }) => {
    const [search, setSearch] = useState('');
    const hasExistingAssignment = contextLeads.some(lead => lead.assignedTo && lead.assignedTo !== '');
    
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

    // --- ALGORITMO DE COMPATIBILIDAD (EL CEREBRO) ---
    const processedAgents = agents.map(agent => {
        if (!contextLeads || contextLeads.length === 0) return { ...agent, assignableLeads: [] };

        // 1. Extraer los estados donde el agente tiene licencia
        let agentStates = [];
        if (agent.licensesArray && agent.licensesArray.length > 0) {
            agentStates = agent.licensesArray.map(lic => FULL_US_STATES.find(s => s.abbr === lic.state)?.name).filter(Boolean);
        } else if (agent.license) {
            const matches = agent.license.match(/\(([^)]+)\)/g);
            if (matches) {
                agentStates = matches.map(m => FULL_US_STATES.find(s => s.abbr === m.replace(/[()]/g, '').trim())?.name).filter(Boolean);
            }
        }

        // 2. Filtrar cuáles leads específicos puede tomar este agente
        const assignableLeads = contextLeads.filter(cLead => {
            // Regla A: ¿Tiene licencia en este estado?
            if (cLead.state && !agentStates.includes(cLead.state)) return false;

            // Regla B: ¿Tiene su agenda libre a esta hora?
            if (!cLead.date) return true; 
            const targetTime24h = getClean24h(cLead.localTime || getLocalTimeInfo(cLead.date, cLead.time, cLead.state) || cLead.time);
            if (!targetTime24h) return true;

            const hasConflict = allLeads.some(exLead => {
                if (exLead.id === cLead.id) return false; 
                if (exLead.assignedTo !== agent.id) return false; 
                if (exLead.status === 'archived') return false; 
                if (exLead.date !== cLead.date) return false; 
                const exTime24h = getClean24h(exLead.localTime || getLocalTimeInfo(exLead.date, exLead.time, exLead.state) || exLead.time);
                return exTime24h === targetTime24h;
            });

            return !hasConflict;
        });

        return { ...agent, assignableLeads };
    })
    // 3. SOLO mostrar agentes que puedan tomar al menos 1 lead
    .filter(agent => contextLeads.length === 0 || agent.assignableLeads.length > 0)
    // 4. Ordenar a los mejores prospectos (los que pueden tomar más leads) arriba
    .sort((a, b) => b.assignableLeads.length - a.assignableLeads.length);

    // Filtro de búsqueda manual por texto
    const filteredAgents = processedAgents.filter(a => {
        const term = search.toLowerCase();
        return (a.name && a.name.toLowerCase().includes(term)) || 
               (a.email && a.email.toLowerCase().includes(term)) ||
               (a.license && a.license.toLowerCase().includes(term));
    });

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-fade-in">
            <div className="glass-card bg-white/95 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[85vh] animate-slide-up relative">
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">Asignar Agente</h3>
                        <p className="text-[10px] uppercase tracking-widest text-green-600 font-bold mt-1 bg-green-50 inline-block px-2 py-0.5 rounded border border-green-100">Cumple con los requisitos</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={18}/></button>
                </div>
                <div className="mb-4 relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={16}/>
                    <input type="text" placeholder="Buscar por nombre o correo..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all text-sm" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                    {hasExistingAssignment && (
                        <button onClick={() => onSelect('', [])} className="w-full text-left p-3.5 hover:bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-medium transition-colors mb-2">
                            <span className="flex items-center gap-2"><MinusCircle size={16}/> Quitar Asignación actual</span>
                        </button>
                    )}
                    {filteredAgents.map(agent => (
                        <button key={agent.id} onClick={() => onSelect(agent.id, agent.assignableLeads)} className="w-full flex items-center justify-between p-3 hover:bg-rose-50/50 rounded-xl border border-transparent hover:border-rose-100 transition-all text-left group">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-rose-100 to-white text-rose-600 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-rose-50 font-bold">
                                    {agent.photo ? <img src={agent.photo} className="w-full h-full object-cover"/> : agent.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="font-bold text-gray-900 group-hover:text-rose-700 transition-colors truncate">{agent.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                                </div>
                            </div>
                            {/* BADGE DE COMPATIBILIDAD (Solo visible si es asignación en lote) */}
                            {contextLeads.length > 1 && (
                                <div className="shrink-0 text-right pl-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${agent.assignableLeads.length === contextLeads.length ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                        {agent.assignableLeads.length}/{contextLeads.length}
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                    {filteredAgents.length === 0 && (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100"><Users size={16} className="text-gray-300"/></div>
                            <p className="text-sm font-bold text-gray-600">No hay agentes disponibles</p>
                            <p className="text-[10px] mt-1.5 max-w-[200px] mx-auto text-center leading-relaxed">Nadie en tu equipo tiene la licencia o el tiempo libre para tomar estos prospectos.</p>
                        </div>
                    )}
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
    
    // --- ESTADO Y POLICÍA ---
    const [tempStatus, setTempStatus] = useState(lead.agentStatus || 'activo');
    const [showExitPolice, setShowExitPolice] = useState(false);
    
    const [isEditingDateTime, setIsEditingDateTime] = useState(false);
    const [editDate, setEditDate] = useState(lead.date || '');
    const [editTime, setEditTime] = useState(lead.time || '');
    const [dialog, setDialog] = useState(null);

    // FUNCIÓN INTERCEPTORA DE SALIDA
    const handleAttemptClose = () => {
        // Si eres Admin, O si el agente ya cerró la venta definitivamente, sales directo
        if (!isAgentView || lead.agentStatus === 'vendido') {
            onClose(); 
            return;
        }
        setShowExitPolice(true); // Si eres Agente y la venta sigue abierta, alto ahí policía
    };

    const handleConfirmExit = async () => {
        if (tempStatus !== lead.agentStatus) {
            await onUpdate(lead.id, { agentStatus: tempStatus });
            
            // 🔥 DISPARADOR SILENCIOSO PARA MAKE (SOLO SI SE VA COMO VENDIDO) 🔥
            if (tempStatus === 'vendido' && lead.email && lead.email !== 'No proporcionado') {
                try {
                    const whDoc = await getDoc(doc(db, 'settings', 'webhooks'));
                    if (whDoc.exists()) {
                        const hooks = whDoc.data();
                        const url = hooks.master || hooks.telegram;
                        if (url) {
                            fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    evento: 'venta_cerrada', 
                                    datos: { lead: lead, agent: agents.find(a => a.id === lead.assignedTo) || null } 
                                })
                            }).catch(err => console.error(err));
                        }
                    }
                } catch (error) { console.error(error); }
            }
        }
        setShowExitPolice(false);
        onClose();
    };

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
        
        // NUEVO: Lógica de liberación y reasignación de espacios globales
        const tz = STATE_TZ[lead.state];
        let newUtcSlotId = null;
        if (tz) {
            const newUtcMs = zonedDateTimeToUtcMs(editDate, editTime, tz);
            if (newUtcMs) newUtcSlotId = String(newUtcMs);
        }

        const updateData = { date: editDate, time: editTime };
        if (newUtcSlotId) updateData.utcSlotId = newUtcSlotId;

        await onUpdate(lead.id, updateData);
        
        // Si tenía un espacio anterior y acaba de cambiar, lo borramos de la bóveda pública para liberarlo
        if (lead.utcSlotId && lead.utcSlotId !== newUtcSlotId) {
            try {
                const { getFirestore, deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
                const db = getFirestore();
                await deleteDoc(doc(db, 'booked_slots', lead.utcSlotId));
            } catch (e) {
                console.error("Error liberando el espacio anterior:", e);
            }
        }

        // Si estamos en modo estricto, ocupamos el NUEVO espacio en la bóveda pública
        if (newUtcSlotId) {
            try {
                const { getFirestore, setDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
                const db = getFirestore();
                await setDoc(doc(db, 'booked_slots', newUtcSlotId), { takenAt: Date.now() });
            } catch (e) {
                console.error("Error reservando el nuevo espacio:", e);
            }
        }

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

            {/* --- MODAL DEL POLICÍA DE ESTATUS (Solo para Agentes) --- */}
            {showExitPolice && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col shadow-2xl animate-slide-up border border-gray-100 overflow-hidden">
                        <div className="p-6 text-center border-b border-gray-100 bg-gray-50/50">
                            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                                <Activity size={28}/>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Antes de irte...</h3>
                            <p className="text-sm text-gray-500 mt-2 font-medium">Confirma el estatus actual de este prospecto para mantener tus métricas al día.</p>
                        </div>
                        <div className="p-6 flex flex-col gap-3">
                            <select 
                                value={tempStatus} 
                                onChange={(e) => setTempStatus(e.target.value)}
                                className={`w-full p-4 border rounded-xl outline-none focus:ring-2 font-bold cursor-pointer shadow-sm transition-all duration-300 ${
                                    tempStatus === 'activo' ? 'bg-blue-50 border-blue-200 text-blue-700 focus:border-blue-500 focus:ring-blue-500/20' :
                                    tempStatus === 'seguimiento' ? 'bg-amber-50 border-amber-200 text-amber-700 focus:border-amber-500 focus:ring-amber-500/20' :
                                    tempStatus === 'vendido' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20' :
                                    'bg-rose-50 border-rose-200 text-rose-700 focus:border-rose-500 focus:ring-rose-500/20'
                                }`}
                            >
                                <option value="activo" className="bg-white text-gray-800">Cita Programada</option>
                                <option value="seguimiento" className="bg-white text-gray-800">En Seguimiento</option>
                                <option value="vendido" className="bg-white text-gray-800">Venta Cerrada</option>
                                <option value="descartado" className="bg-white text-gray-800">Descartado</option>
                            </select>
                            
                            {/* TEXTO DE AYUDA DINÁMICO Y ADVERTENCIA */}
                            <div className="min-h-[20px] text-center mt-2">
                                {tempStatus === 'activo' && <p className="text-[11px] font-medium text-blue-600/80 italic animate-fade-in px-2">Todavía no ha atendido al Prospecto.</p>}
                                {tempStatus === 'seguimiento' && <p className="text-[11px] font-medium text-amber-600/80 italic animate-fade-in px-2">Hay interés, pero el cliente necesita pensarlo o reagendar.</p>}
                                
                                {/* ADVERTENCIA INTEGRADA AL SELECCIONAR VENTA CERRADA */}
                                {tempStatus === 'vendido' && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left animate-fade-in shadow-sm mx-1">
                                        <p className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1.5 mb-1 uppercase tracking-widest"><AlertTriangle size={14}/> Acción Definitiva</p>
                                        <p className="text-[11px] leading-relaxed font-medium text-emerald-600">Al guardar y salir, ya no podrás modificar el estatus de este cliente y el sistema le pedirá de inmediato tu calificación.</p>
                                    </div>
                                )}
                                
                                {tempStatus === 'descartado' && <p className="text-[11px] font-medium text-rose-600/80 italic animate-fade-in px-2">El prospecto no califica o dio un no definitivo.</p>}
                            </div>

                            <div className="flex gap-3 mt-3">
                                <button onClick={() => setShowExitPolice(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                    Cancelar
                                </button>
                                <button onClick={handleConfirmExit} className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 hover:scale-[1.02] transition-all shadow-md">
                                    Guardar y Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white/80 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-gray-200">
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 pr-2">
                    <button onClick={handleAttemptClose} className="p-2 md:p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors shrink-0 shadow-sm"><ArrowLeft size={20} className="text-gray-700"/></button>
                    <div className="truncate">
                        <h2 className="font-bold text-lg md:text-xl text-gray-900 truncate tracking-tight">
                            {lead.name}
                        </h2>
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
                                
                                <div className={`flex flex-col rounded-2xl p-4 md:p-5 border transition-colors duration-300 shadow-sm ${
                                    (!lead.agentStatus || lead.agentStatus === 'activo') ? 'bg-blue-50/60 border-blue-100' :
                                    lead.agentStatus === 'seguimiento' ? 'bg-amber-50/60 border-amber-100' :
                                    lead.agentStatus === 'vendido' ? 'bg-emerald-50/60 border-emerald-100' :
                                    'bg-rose-50/60 border-rose-100'
                                }`}>
                                    <span className="text-[10px] uppercase font-bold tracking-widest block mb-2 text-gray-500">
                                        Estatus de la Gestión
                                    </span>
                                    <div className="relative">
                                        {lead.agentStatus === 'vendido' && isAgentView ? (
                                            /* --- ESTADO BLOQUEADO: VENTA CERRADA DEFINITIVA (SOLO AGENTES) --- */
                                            <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 font-bold text-sm md:text-base px-4 py-3.5 rounded-xl shadow-sm flex items-center justify-between cursor-not-allowed">
                                                <span className="flex items-center gap-2">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    Venta Cerrada
                                                </span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                            </div>
                                        ) : (
                                            /* --- SELECT NORMAL PARA DEMÁS ESTATUS (Y PARA EL ADMIN SIEMPRE) --- */
                                            <>
                                                <select
                                                    value={lead.agentStatus || 'activo'}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        
                                                        if (newStatus === 'vendido' && isAgentView) {
                                                            // 1. INTERCEPTOR: LANZAR ADVERTENCIA (Solo al Agente)
                                                            setDialog({
                                                                title: 'Sellar Venta Cerrada',
                                                                message: '¿Estás seguro de marcar a este cliente como Venta Cerrada?\n\nEsta acción es DEFINITIVA. Ya no podrás modificar el estatus de este cliente, pero seguirás teniendo acceso a su ficha técnica. El sistema le pedirá tu calificación.',
                                                                type: 'info',
                                                                onConfirm: async () => {
                                                                    setTempStatus('vendido');
                                                                    await onUpdate(lead.id, { agentStatus: 'vendido' });
                                                                    
                                                                    // 🔥 DISPARADOR SILENCIOSO PARA MAKE 🔥
                                                                    if (lead.email && lead.email !== 'No proporcionado') {
                                                                        try {
                                                                            const whDoc = await getDoc(doc(db, 'settings', 'webhooks'));
                                                                            if (whDoc.exists()) {
                                                                                const hooks = whDoc.data();
                                                                                const url = hooks.master || hooks.telegram;
                                                                                if (url) {
                                                                                    fetch(url, {
                                                                                        method: 'POST',
                                                                                        headers: { 'Content-Type': 'application/json' },
                                                                                        body: JSON.stringify({ 
                                                                                            evento: 'venta_cerrada', 
                                                                                            datos: { lead: lead, agent: agents.find(a => a.id === lead.assignedTo) || null } 
                                                                                        })
                                                                                    }).catch(err => console.error(err));
                                                                                }
                                                                            }
                                                                        } catch (error) { console.error(error); }
                                                                    }
                                                                    setDialog(null);
                                                                },
                                                                onCancel: () => {
                                                                    setTempStatus(lead.agentStatus || 'activo');
                                                                    setDialog(null);
                                                                }
                                                            });
                                                        } else {
                                                            // 2. ACTUALIZACIÓN NORMAL (O si el Admin está haciendo el cambio)
                                                            setTempStatus(newStatus);
                                                            onUpdate(lead.id, { agentStatus: newStatus });
                                                        }
                                                    }}
                                                    className={`appearance-none w-full font-bold text-sm md:text-base pl-4 pr-10 py-3.5 rounded-xl outline-none cursor-pointer shadow-sm transition-all duration-300 border ${
                                                        (!lead.agentStatus || lead.agentStatus === 'activo') ? 'bg-white text-blue-700 border-blue-200 focus:ring-2 focus:ring-blue-500/20' :
                                                        lead.agentStatus === 'seguimiento' ? 'bg-white text-amber-700 border-amber-200 focus:ring-2 focus:ring-amber-500/20' :
                                                        lead.agentStatus === 'vendido' ? 'bg-emerald-50 text-emerald-700 border-emerald-500 focus:ring-2 focus:ring-emerald-500/20' :
                                                        'bg-white text-rose-700 border-rose-200 focus:ring-2 focus:ring-rose-500/20'
                                                    }`}
                                                >
                                                    <option value="activo" className="text-gray-800">Cita Programada</option>
                                                    <option value="seguimiento" className="text-gray-800">En Seguimiento</option>
                                                    <option value="vendido" className="text-gray-800">Venta Cerrada</option>
                                                    <option value="descartado" className="text-gray-800">Descartado</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={
                                                        (!lead.agentStatus || lead.agentStatus === 'activo') ? 'text-blue-400' :
                                                        lead.agentStatus === 'seguimiento' ? 'text-amber-400' :
                                                        lead.agentStatus === 'vendido' ? 'text-emerald-500' :
                                                        'text-rose-400'
                                                    }><path d="m6 9 6 6 6-6"/></svg>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

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
                                    <p className={`text-sm ${lead.email === 'No proporcionado' ? 'font-medium italic text-gray-400' : 'font-medium text-gray-600'}`}>
                                        {lead.email === 'No proporcionado' ? 'Email no proporcionado' : lead.email}
                                    </p>
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
                                {lead.age && (
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-3 px-1">
                                        <span className="text-sm text-gray-500 font-medium">Edad del solicitante</span>
                                        <span className="font-bold text-gray-900 text-sm text-right">{lead.age} años</span>
                                    </div>
                                )}
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
                            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-widest"><Briefcase size={16} className="text-rose-500"/> Asignación</h3>
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
                <AgentSelectionModal 
                    agents={agents.filter(a => a.status !== 'inactive')} 
                    contextLeads={[lead]} 
                    allLeads={allLeads} 
                    onClose={() => setShowAgentSelector(false)} 
                    onSelect={(agentId) => { 
                        const selectedAgent = agents.find(a => a.id === agentId);
                        if (!selectedAgent) {
                            setDialog({ title: 'Quitar Asignación', message: '¿Estás seguro de quitar la asignación actual?', type: 'warning', onConfirm: () => { onAssignAgent(lead.id, ''); setShowAgentSelector(false); setDialog(null); }, onCancel: () => setDialog(null)});
                            return;
                        }
                        setDialog({ title: 'Asignar Agente', message: `¿Estás seguro de asignar este prospecto a ${selectedAgent.name}? Esto enviará los correos automáticamente.`, type: 'info', onConfirm: () => { onAssignAgent(lead.id, agentId); setShowAgentSelector(false); setDialog(null); }, onCancel: () => setDialog(null)});
                    }}
                />
            )}
        </div>
    );
};

const AgentDetailView = ({ agent, leads, reviews = [], onClose, onLeadClick, onSaveAgent, onDeleteAgent, onDeleteReview }) => {
    // Calculadora de estrellas estilo Amazon
    const agentReviews = reviews.filter(r => r.agentId === agent.id).sort((a,b) => b.timestamp - a.timestamp);
    const avgRating = agentReviews.length > 0 ? (agentReviews.reduce((acc, r) => acc + r.rating, 0) / agentReviews.length).toFixed(1) : 0;

    // --- NUEVO: FUNCIÓN PARA BORRAR RESEÑA ---
    const handleDeleteReview = (rev) => {
        setDialog({
            title: 'Eliminar Reseña',
            message: `¿Estás seguro de eliminar permanentemente la reseña de ${rev.leadName}? Esto ajustará las métricas del agente automáticamente.`,
            type: 'danger',
            onConfirm: async () => { await onDeleteReview(rev.id); setDialog(null); },
            onCancel: () => setDialog(null)
        });
    };

    const [innerSearch, setInnerSearch] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(agent);
    
    // --- NUEVO: Estado para manejar las licencias dinámicamente en la edición ---
    const [licenses, setLicenses] = useState(agent.licensesArray || []);
    
    const [dialog, setDialog] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // LIGHTBOX PARA LA FICHA

    useEffect(() => { 
        setFormData(agent); 
        setLicenses(agent.licensesArray || []);
    }, [agent]);

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
    
    // --- NUEVO: Manejadores para el constructor de licencias ---
    const handleLicenseChange = (index, field, value) => {
        const newLics = [...licenses];
        newLics[index][field] = value;
        setLicenses(newLics);
    };

    const handleLicenseFileChange = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1048576) { alert("La foto de la licencia no debe superar 1MB."); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            const newLics = [...licenses];
            newLics[index].fileStr = reader.result;
            newLics[index].fileName = file.name;
            setLicenses(newLics);
        };
        reader.readAsDataURL(file);
    };

    const addLicense = () => setLicenses([...licenses, { state: '', number: '', fileStr: '', fileName: '' }]);
    const removeLicense = (index) => setLicenses(licenses.filter((_, i) => i !== index));

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        // Auto-generamos el resumen de texto para las búsquedas, basado en el array dinámico
        const updatedLicenseSummary = licenses.filter(l => l.state && l.number).map(l => `${l.number} (${l.state})`).join(', ');

        await onSaveAgent({ 
            ...formData, 
            licensesArray: licenses, 
            license: updatedLicenseSummary || 'Sin estados configurados',
            timestamp: agent.timestamp || Date.now() 
        });
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
                                    
                                    {/* NUEVO: ESTRELLAS DEL AGENTE (SIN FONDO, SCROLL SUAVE) */}
                                    {agentReviews.length > 0 && (
                                        <button 
                                            onClick={() => document.getElementById('seccion-resenas').scrollIntoView({ behavior: 'smooth' })}
                                            className="flex items-center gap-1.5 mt-1 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                            title="Ver reseñas"
                                        >
                                            <div className="flex text-amber-400 gap-0.5">
                                                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.round(avgRating) ? "currentColor" : "none"} className={s <= Math.round(avgRating) ? "text-amber-400" : "text-gray-300"}/>)}
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-700">{avgRating} <span className="font-normal text-gray-400">({agentReviews.length})</span></span>
                                        </button>
                                    )}

                                    {agent.bio && <p className="text-sm text-gray-500 italic mt-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-balance leading-relaxed">"{agent.bio}"</p>}
                                    
                                    <div className="w-full space-y-3 text-sm mt-6 text-left">
                                        {agent.email && <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 hover:text-blue-600 transition-colors cursor-pointer"><Mail size={16} className="text-gray-400 shrink-0"/> <span className="truncate font-medium">{agent.email}</span></a>}
                                        {agent.phone && <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 hover:text-blue-600 transition-colors cursor-pointer"><Phone size={16} className="text-gray-400 shrink-0"/> <span className="font-medium">{agent.phone}</span></a>}
                                        
                                        {agent.companies && <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100"><Building size={16} className="text-gray-400 shrink-0"/> <span className="truncate font-medium">{agent.companies}</span></div>}
                                        {agent.isAgency && <div className="inline-flex mt-1 bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-purple-100"><Users size={12} className="mr-1"/> Tiene Agencia</div>}

                                        {/* BLOQUE ELEGANTE DE LICENCIAS CON MINIATURAS */}
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
                                    
                                    {/* CONSTRUCTOR DE LICENCIAS INTEGRADO */}
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2"><FileText size={14}/> Licencias</h3>
                                        <div className="space-y-3">
                                            {licenses.map((lic, index) => (
                                                <div key={index} className="grid grid-cols-1 gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative">
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <select value={lic.state} onChange={e => handleLicenseChange(index, 'state', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs focus:border-blue-400 text-gray-700">
                                                                <option value="">Estado</option>
                                                                {FULL_US_STATES.map(st => <option key={st.abbr} value={st.abbr}>{st.abbr}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="flex-[2]">
                                                            <input type="text" placeholder="Número" value={lic.number} onChange={e => handleLicenseChange(index, 'number', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs focus:border-blue-400" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="w-full p-2 bg-gray-50 border border-dashed border-gray-300 hover:border-blue-400 rounded-lg text-[10px] text-center text-gray-500 cursor-pointer flex items-center justify-center gap-1 overflow-hidden transition-colors">
                                                            {lic.fileName || lic.fileStr ? <span className="text-green-600 font-bold truncate">✅ Foto lista</span> : <span>Subir foto de licencia</span>}
                                                            <input type="file" accept="image/*" onChange={(e) => handleLicenseFileChange(index, e)} className="hidden" />
                                                        </label>
                                                    </div>
                                                    <button type="button" onClick={() => removeLicense(index)} className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-500 hover:bg-red-200 rounded-full p-1 shadow-sm transition-colors"><X size={10} strokeWidth={3}/></button>
                                                </div>
                                            ))}
                                            {licenses.length === 0 && <p className="text-xs text-gray-400 italic">No hay licencias registradas.</p>}
                                        </div>
                                        <button type="button" onClick={addLicense} className="mt-3 text-xs font-bold text-blue-600 flex items-center gap-1 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-sm w-full justify-center">
                                            <Plus size={14}/> Agregar Estado
                                        </button>
                                    </div>
                                    
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
                        {/* ... MANTENEMOS INTACTA TU PARTE DERECHA DE CARTERA ASIGNADA ... */}
                        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-soft border border-gray-100 flex-1 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg md:text-xl"><Briefcase size={22} className="text-gray-400"/> Cartera Asignada</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">Gestionando <strong className="text-gray-900">{assignedLeads.length}</strong> prospectos</p>
                                </div>
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                    <input type="text" placeholder="Buscar prospecto..." className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-black focus:ring-2 focus:ring-black/5 transition-all text-sm font-medium" value={innerSearch} onChange={(e) => setInnerSearch(e.target.value)} />
                                </div>
                            </div>
                            
                            {/* AQUÍ ESTÁ LA MAGIA DEL SCROLL CONTROLADO */}
                            <div className="overflow-y-auto pr-2 space-y-3 scrollbar-hide max-h-[450px]">
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

                        {/* --- LISTA DE RESEÑAS DEL AGENTE ESTILO AMAZON --- */}
                        <div id="seccion-resenas" className="bg-white p-5 md:p-8 rounded-3xl shadow-soft border border-gray-100 flex-1 flex flex-col mt-6 scroll-mt-24">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100">
                                    <Star size={24} fill="currentColor"/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg md:text-xl tracking-tight">Reseñas de Clientes</h3>
                                    <p className="text-sm text-gray-500 mt-1 font-medium">Testimonios verificados</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {agentReviews && agentReviews.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-bold text-sm">Aún no hay reseñas.</p>
                                    </div>
                                ) : (
                                    agentReviews && agentReviews.map(rev => (
                                    <div key={rev.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                                        <button onClick={() => handleDeleteReview(rev)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" title="Eliminar Reseña">
                                            <Trash2 size={14}/>
                                        </button>
                                        <div className="flex justify-between items-start mb-3 pr-8">
                                            <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                <User size={14} className="text-gray-400"/> {rev.leadName}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-gray-200">
                                                {new Date(rev.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex text-amber-400 mb-3 gap-0.5">
                                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= rev.rating ? "currentColor" : "none"} className={s <= rev.rating ? "text-amber-400" : "text-gray-300"}/>)}
                                        </div>
                                        {rev.comment && <p className="text-gray-600 text-sm italic leading-relaxed bg-white p-3 rounded-xl border border-gray-100">"{rev.comment}"</p>}
                                    </div>
                                ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminCalendar = ({ leads, agents = [], onLeadClick }) => {
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
                                            <div className="text-[9px] truncate text-gray-500 font-medium flex items-center gap-1"><Briefcase size={10} className="text-gray-400 shrink-0"/> {agentName}</div>
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
                                        <div className="font-medium text-[10px] md:text-xs text-gray-500 truncate flex items-center gap-1"><Briefcase size={12} className="text-gray-400 shrink-0"/> {agentName}</div>
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
                                            <span className="flex items-center gap-1"><Briefcase size={12}/> {agentName}</span>
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
                </div>
            </div>

            {view === 'month' && renderMonth()}
            {view === 'week' && renderWeek()}
            {view === 'day' && renderDay()}
            {view === 'year' && renderYear()}
        </div>
    );
};

// --- NUEVO: PANTALLA DE CONFIGURACIÓN DEL SISTEMA (CON BOTÓN MÁGICO) ---
const SystemSettingsScreen = ({ webhooks, generalSettings, schedule, onSaveWebhooks, onSaveGeneral, onUpdateSchedule, onClose }) => {
    const [localHooks, setLocalHooks] = useState(webhooks || { telegram: '', assignment: '' });
    const [acceptingAgents, setAcceptingAgents] = useState(generalSettings?.acceptingAgents !== false);
    const [regPrice, setRegPrice] = useState(generalSettings?.regularPrice ?? 45);
    const [offPrice, setOffPrice] = useState(generalSettings?.offerPrice ?? 35);
    // --- NUEVO ESTADO: ESTADOS OPERATIVOS ---
    const [activeStates, setActiveStates] = useState(generalSettings?.activeStates || ALL_US_STATES);
    const [waitlistUrl, setWaitlistUrl] = useState(generalSettings?.waitlistUrl || '');
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Estados para la animación del botón
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const verifyPassword = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, auth.currentUser.email, password);
            setIsAuthenticated(true);
            setPassword('');
        } catch (err) {
            setError('Contraseña de administrador incorrecta.');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setIsSaved(false); // Reiniciamos por si acaso
        
        await onSaveWebhooks(localHooks);
        await onSaveGeneral({ 
            ...generalSettings, 
            acceptingAgents, 
            regularPrice: Number(regPrice), 
            offerPrice: Number(offPrice),
            activeStates: activeStates,
            waitlistUrl: waitlistUrl
        });
        
        setIsSaving(false);
        setIsSaved(true); // ¡Activamos el color verde!
        
        // Devolvemos el botón a la normalidad después de 2.5 segundos
        setTimeout(() => {
            setIsSaved(false);
        }, 2500);
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-[#F5F5F7] z-[200] flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
                        <Lock size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Área Restringida</h2>
                    <p className="text-sm text-gray-500 mb-8">Ingresa tu contraseña de administrador para gestionar el sistema.</p>
                    <form onSubmit={verifyPassword} className="space-y-4">
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-black transition-all text-center font-bold"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoFocus
                        />
                        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 py-4 bg-black text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform">Entrar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#F5F5F7] z-[200] flex flex-col animate-fade-in overflow-hidden font-sans">
            {/* Header Superior con el Botón Animado */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 h-20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h2 className="font-bold text-xl text-gray-900 tracking-tight">Configuración del Sistema</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Panel Maestro</p>
                    </div>
                </div>
                
                {/* --- BOTÓN MÁGICO --- */}
                <button 
                    onClick={handleSave} 
                    disabled={isSaving || isSaved}
                    className={`px-8 py-3 rounded-full font-bold text-sm shadow-xl transition-all duration-300 flex items-center justify-center gap-2 min-w-[180px] ${
                        isSaved 
                            ? 'bg-green-500 text-white hover:scale-100 cursor-default ring-4 ring-green-500/20' 
                            : 'bg-black text-white hover:scale-105'
                    }`}
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Guardando...
                        </div>
                    ) : isSaved ? (
                        <>
                            <Check size={18} strokeWidth={3} className="animate-scale-up" /> 
                            ¡Guardado!
                        </>
                    ) : (
                        <>
                            <Save size={16}/> 
                            Guardar Cambios
                        </>
                    )}
                </button>
            </header>

            {/* Contenido Principal */}
            <div className="flex-1 overflow-y-auto p-4 md:p-12">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* SECCIÓN 1: RECLUTAMIENTO (Bento Card) */}
                    <div className="md:col-span-7 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
                                <UserPlus size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Reclutamiento de Agentes</h3>
                            <p className="text-gray-500 font-medium mb-8">Controla la entrada de nuevos especialistas a tu equipo de ventas.</p>
                        </div>
                        
                        <div className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${acceptingAgents ? 'bg-green-50 border-green-100' : 'bg-rose-50 border-rose-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${acceptingAgents ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                <div>
                                    <p className="font-bold text-gray-900">{acceptingAgents ? 'Convocatoria Abierta' : 'Convocatoria Cerrada'}</p>
                                    <p className="text-xs text-gray-500">{acceptingAgents ? 'Los aspirantes pueden enviar su solicitud.' : 'El formulario está bloqueado para el público.'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setAcceptingAgents(!acceptingAgents)}
                                className={`w-14 h-8 rounded-full p-1 transition-all relative shadow-inner ${acceptingAgents ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${acceptingAgents ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>

                    {/* SECCIÓN 2: PRECIOS MARKETPLACE (Bento Card) */}
                    <div className="md:col-span-5 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 border border-amber-100 shadow-sm">
                            <DollarSign size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Precios</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Precio Regular por Cita</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-5 font-black text-gray-400 text-xl pointer-events-none">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-10 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-gray-900 text-xl outline-none focus:bg-white focus:border-amber-400 transition-all"
                                        value={regPrice}
                                        onChange={e => setRegPrice(e.target.value)}
                                    />
                                    <span className="absolute right-5 font-bold text-gray-400 text-xs tracking-widest pointer-events-none">USD</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Precio Oferta / Urgente</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-5 font-black text-rose-400 text-xl pointer-events-none">$</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-10 pr-14 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl font-black text-rose-600 text-xl outline-none focus:bg-white focus:border-rose-400 transition-all"
                                        value={offPrice}
                                        onChange={e => setOffPrice(e.target.value)}
                                    />
                                    <span className="absolute right-5 font-bold text-rose-400 text-xs tracking-widest pointer-events-none">USD</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: WEBHOOKS Y AUTOMATIZACIÓN (Bento Card Ancha) */}
                    <div className="md:col-span-12 bg-gray-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                    <Settings size={24} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight">Automatización (Webhooks Make)</h3>
                                    <p className="text-gray-400 text-sm">Gestiona los túneles de información con tus herramientas externas.</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-3 ml-1">Webhook Maestro (Make)</label>
                                    <input 
                                        type="text" 
                                        placeholder="https://hook.make.com/..."
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500 transition-all text-sm font-medium"
                                        value={localHooks.master || localHooks.telegram || ''}
                                        onChange={e => setLocalHooks({...localHooks, master: e.target.value, telegram: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-3 ml-1">Link Lista de Espera</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: https://airtable.com/..."
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500 transition-all text-sm font-medium"
                                        value={waitlistUrl}
                                        onChange={e => setWaitlistUrl(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Cualquier cambio aquí afectará inmediatamente las notificaciones de Telegram y el envío de correos electrónicos. Asegúrate de que las URLs de Make estén activas.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 4: MERCADOS OPERATIVOS */}
                    <div className="md:col-span-12 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-2">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Mercados Operativos</h3>
                                <p className="text-gray-500 text-sm mt-1">Activa o desactiva los estados donde tienes presencia y agentes.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 gap-4">
                            <span className="text-sm font-bold text-gray-700">Estados activados: <span className="text-emerald-600">{activeStates.length} de 50</span></span>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => setActiveStates(ALL_US_STATES)} className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:text-black shadow-sm transition-colors">Activar Todos</button>
                                <button onClick={() => setActiveStates([])} className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:text-red-500 shadow-sm transition-colors">Apagar Todos</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {FULL_US_STATES.map(state => {
                                const isActive = activeStates.includes(state.abbr);
                                return (
                                    <button 
                                        key={state.abbr}
                                        onClick={() => setActiveStates(prev => isActive ? prev.filter(s => s !== state.abbr) : [...prev, state.abbr])}
                                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${isActive ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 opacity-60'}`}
                                    >
                                        <span className={`text-xs font-bold truncate pr-2 ${isActive ? 'text-emerald-900' : 'text-gray-500'}`}>{state.name}</span>
                                        <div className={`w-3 h-3 rounded-full shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECCIÓN 5: HORARIO LABORAL (Movido desde la Agenda) */}
                    <div className="md:col-span-12 mb-12">
                        <ScheduleSettings schedule={schedule} onUpdate={onUpdateSchedule} />
                    </div>

                </div>
            </div>
        </div>
    );
};

const OfferPreviewModal = ({ offerSetup, agents, generalSettings, onClose, onSendOffer }) => {
    const agent = agents.find(a => a.id === offerSetup.agentId);
    const leads = offerSetup.leads;
    const defaultPrice = (generalSettings?.regularPrice || 45) * leads.length;
    const [price, setPrice] = useState(defaultPrice);

    if (!agent) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative animate-slide-up border border-gray-100 text-center">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={18}/></button>
                
                <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-amber-200">
                    <DollarSign size={32} strokeWidth={2}/>
                </div>
                
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Nota de Cobro</h2>
                <p className="text-sm text-gray-500 mb-6">Generando oferta directa para <strong>{agent.name}</strong></p>

                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 text-left">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Resumen del paquete</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                        {leads.map(l => (
                            <div key={l.id} className="flex items-center justify-between text-sm">
                                <span className="font-bold text-gray-800 truncate pr-2">{l.name}</span>
                                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500 shrink-0">{l.state || 'N/A'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Total a Cobrar</label>
                    <div className="flex items-center justify-center border-b-2 border-dashed border-gray-300 focus-within:border-rose-500 transition-colors pb-2 w-full">
                        <span className="text-3xl font-black text-gray-400 mr-1">$</span>
                        <input 
                            type="number" 
                            min="0"
                            className="text-center text-4xl font-black text-gray-900 bg-transparent outline-none w-28 md:w-32"
                            value={price}
                            onChange={e => {
                                const val = e.target.value;
                                // Solo permite actualizar si está vacío (para borrar) o si es un número mayor o igual a cero
                                if (val === '' || Number(val) >= 0) {
                                    setPrice(val);
                                }
                            }}
                        />
                    </div>
                </div>

                <button 
                    onClick={() => onSendOffer(price)} 
                    disabled={price === '' || Number(price) < 0}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    <Check size={18}/> Enviar Oferta al Agente
                </button>
                <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
                    Esta oferta vencerá en 24h o en la hora de la cita más próxima (lo que ocurra primero).
                </p>
            </div>
        </div>
    );
};
                                                                   
const AdminDashboard = ({ leads, agents, agentRequests = [], reviews = [], onApproveRequest, onRejectRequest, onUpdateAgentRequest, schedule, webhooks, generalSettings, onUpdateLead, bulkUpdateLeads, bulkDeleteLeads, onDeleteLead, onDeleteReview, onSaveAgent, onDeleteAgent, onUpdateSchedule, onUpdateWebhooks, onUpdateGeneralSettings, onClose, onLogout }) => {    
    
    // NUEVO: ESTADO PARA EL MODAL DE SALIDA
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    // --- NUEVO: FILTRO DE ESTATUS PARA ASIGNADOS ---
    const [adminSelectedStatusFilters, setAdminSelectedStatusFilters] = useState([]);
    const [isAdminStatusFilterOpen, setIsAdminStatusFilterOpen] = useState(false);
                                                                   
    // --- SENSOR DE SEGURIDAD: AUTO-CIERRE POR INACTIVIDAD (60 MIN) CON AVISO PREVIO ---
    const [showInactivityWarning, setShowInactivityWarning] = useState(false);
    const [inactivityCountdown, setInactivityCountdown] = useState(120);
    const isWarningVisible = useRef(false);

    useEffect(() => {
        let warningTimer;
        let countdownInterval;

        const resetAll = () => {
            if (isWarningVisible.current) return; 
            
            clearTimeout(warningTimer);
            clearInterval(countdownInterval);
            
            const TOTAL_TIME = 60 * 60 * 1000; // 60 minutos
            const WARNING_TIME = TOTAL_TIME - (2 * 60 * 1000); // 58 minutos (Aviso 2 min antes)

            warningTimer = setTimeout(() => {
                isWarningVisible.current = true;
                setShowInactivityWarning(true);
                
                const logoutTime = Date.now() + (2 * 60 * 1000); 
                
                countdownInterval = setInterval(() => {
                    const secondsLeft = Math.ceil((logoutTime - Date.now()) / 1000);
                    if (secondsLeft <= 0) {
                        clearInterval(countdownInterval);
                        onLogout();
                    } else {
                        setInactivityCountdown(secondsLeft);
                    }
                }, 1000);
            }, WARNING_TIME);
        };

        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => document.addEventListener(event, resetAll));
        resetAll();

        return () => {
            clearTimeout(warningTimer);
            clearInterval(countdownInterval);
            activityEvents.forEach(event => document.removeEventListener(event, resetAll));
        };
    }, [onLogout]);
    // -----------------------------------------------------------------

    const ADMIN_TABS = ['active', 'marketplace', 'urgent', 'offers', 'assigned', 'archived', 'agents', 'schedule'];
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
    
    // --- NUEVO ESTADO Y MOTOR DE OFERTAS DIRECTAS ---
    const [offerSetup, setOfferSetup] = useState(null);

    const handleSendOffer = (price) => {
        if (!offerSetup) return;
        const numericPrice = Number(price);

        // 🎁 REGLA DEL DUEÑO: SI EL PRECIO ES $0, SE ASIGNA DIRECTO (REGALO)
        if (numericPrice <= 0) {
            const assignableIds = offerSetup.leads.map(l => l.id);
            const selectedAgent = agents.find(a => a.id === offerSetup.agentId);

            // Asignación directa y eliminación de cualquier bloqueo de oferta previa
            bulkUpdateLeads(assignableIds, { assignedTo: offerSetup.agentId, status: 'assigned', offer: null });
            
            // Disparar Webhooks (Correo al agente)
            if (selectedAgent) {
                offerSetup.leads.forEach(leadObj => triggerAssignmentWebhook(leadObj, selectedAgent));
            }

            setOfferSetup(null);
            setSelectedLeads([]);
            setIndividualAgentSelectLeadId(null);
            setIsBulkAgentSelectOpen(false);

            setDialog({ 
                title: '🎁 Asignación Gratuita', 
                message: `Has asignado ${assignableIds.length} prospectos a ${selectedAgent?.name || 'el agente'} sin costo. Ya están disponibles en su cartera.`, 
                type: 'success', 
                onConfirm: () => setDialog(null) 
            });
            return; // Detenemos la función aquí
        }

        // 💳 LÓGICA NORMAL: NOTA DE COBRO (> $0)
        const bundleId = `OFR-${Date.now().toString().slice(-6)}`;
        const nowMs = Date.now();
        
        // Calcular expiración dinámica: 24h o la hora de la cita más próxima
        let minHoursUntil = 24;
        offerSetup.leads.forEach(l => {
            if (l.hoursUntil !== 999 && l.hoursUntil > 0 && l.hoursUntil < minHoursUntil) {
                minHoursUntil = l.hoursUntil;
            }
        });
        const expiresAt = nowMs + (minHoursUntil * 60 * 60 * 1000);

        const updateData = {
            status: 'pending_payment',
            offer: {
                agentId: offerSetup.agentId,
                price: numericPrice,
                expiresAt: expiresAt,
                bundleId: bundleId
            }
        };

        bulkUpdateLeads(offerSetup.leads.map(l => l.id), updateData);
        
        setOfferSetup(null);
        setSelectedLeads([]);
        setIndividualAgentSelectLeadId(null);
        setIsBulkAgentSelectOpen(false);

        setDialog({ 
            title: 'Oferta Enviada', 
            message: `La propuesta de cobro por $${numericPrice} ha sido enviada exitosamente. Los prospectos estarán bloqueados hasta que el agente pague o expire el tiempo.`, 
            type: 'success', 
            onConfirm: () => setDialog(null) 
        });
    };

    // --- MEMORIA PARA NO PERDER LA PANTALLA AL RECARGAR ---
    const [showFullSettings, setShowFullSettings] = useState(() => {
        return sessionStorage.getItem('adminShowSettings') === 'true';
    });

    useEffect(() => {
        sessionStorage.setItem('adminShowSettings', showFullSettings);
    }, [showFullSettings]);
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

    // --- NUEVO: MOTOR DE AGRUPACIÓN DE OFERTAS PARA EL ADMIN ---
    const pendingOffersLeads = processedLeads.filter(l => l.status === 'pending_payment' && l.offer);
    const adminBundles = {};
    pendingOffersLeads.forEach(l => {
        const bId = l.offer.bundleId;
        if (!adminBundles[bId]) {
            adminBundles[bId] = { 
                id: bId, 
                leads: [], 
                agentId: l.offer.agentId, 
                price: l.offer.price, 
                expiresAt: l.offer.expiresAt 
            };
        }
        adminBundles[bId].leads.push(l);
    });
    const groupedOffers = Object.values(adminBundles).sort((a, b) => a.expiresAt - b.expiresAt);

    const [viewingBundle, setViewingBundle] = useState(null); // Estado para el desglose de la nota

    const getFilteredLeads = () => {
        let list = [];
        if(activeTab === 'active') list = processedLeads.filter(l => l.status === 'new' && !l.assignedTo);
        else if(activeTab === 'marketplace') list = processedLeads.filter(l => l.status === 'marketplace' && !l.assignedTo && l.hoursUntil > 2);
        else if(activeTab === 'urgent') list = processedLeads.filter(l => l.status !== 'archived' && !l.assignedTo && l.hoursUntil <= 2);
        else if(activeTab === 'assigned') list = processedLeads.filter(l => l.status !== 'archived' && l.assignedTo);
        else if(activeTab === 'offers') list = processedLeads.filter(l => l.status === 'pending_payment');
        else if(activeTab === 'archived') list = processedLeads.filter(l => l.status === 'archived');
        else list = processedLeads; // Seguridad

        // Filtro de Estatus (Aplica en Asignados y Archivados si hay opciones seleccionadas)
        if ((activeTab === 'assigned' || activeTab === 'archived') && adminSelectedStatusFilters.length > 0) {
            list = list.filter(l => adminSelectedStatusFilters.includes(l.agentStatus || 'activo'));
        }

        // Buscador por texto (Búsqueda refinada sobre la pestaña actual)
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            let searchSource = activeTab === 'assigned' ? list : processedLeads; 

            return searchSource.filter(l => 
                (l.name && l.name.toLowerCase().includes(lower)) || 
                (l.phone && l.phone.includes(lower)) || 
                (l.email && l.email.toLowerCase().includes(lower)) || 
                (l.state && l.state.toLowerCase().includes(lower)) ||
                (l.notes && l.notes.toLowerCase().includes(lower))
            );
        }

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

        const url = webhooks.master || webhooks.telegram || webhooks.assignment;
        if (url) {
            fetch(url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    evento: 'asignacion_agente', 
                    datos: { lead: translatedLead, agent: agentObj } 
                })
            }).catch(e => console.error("Error Webhook Asignación:", e));
        }
    };

    const handleBulkAction = (action) => {
        let title = 'Acción en Lote';
        let msg = `¿Deseas aplicar esta acción a los ${selectedLeads.length} prospectos seleccionados?`;
        let type = 'warning';

        if (action === 'delete') { title = 'Eliminar Prospectos'; msg = `¿Estás seguro de eliminar permanentemente ${selectedLeads.length} prospectos?`; type = 'danger'; }
        if (action === 'archive') { title = 'Archivar Prospectos'; msg = `¿Mover ${selectedLeads.length} prospectos al archivo?`; }
        if (action === 'restore') { title = 'Restaurar Prospectos'; msg = `¿Devolver ${selectedLeads.length} prospectos a la bandeja principal?`; }
        if (action === 'marketplace') { title = 'Enviar a Tienda'; msg = `¿Enviar ${selectedLeads.length} prospectos al Marketplace para su venta?`; type = 'info'; }

        setDialog({
            title: title,
            message: msg,
            type: type,
            onConfirm: async () => {
                setDialog(null);
                if(action === 'delete') await bulkDeleteLeads(selectedLeads);
                else if(action === 'archive') await bulkUpdateLeads(selectedLeads, { status: 'archived' });
                else if(action === 'restore') await bulkUpdateLeads(selectedLeads, { status: 'new' });
                else if(action === 'marketplace') await bulkUpdateLeads(selectedLeads, { status: 'marketplace' });
                setSelectedLeads([]);
            },
            onCancel: () => setDialog(null)
        });
    };

    const handleDeleteLead = (e, id) => { 
        e.stopPropagation(); 
        setDialog({
            title: 'Eliminar Prospecto',
            message: '¿Estás seguro de eliminar este prospecto permanentemente? Esta acción no se puede deshacer.',
            type: 'danger',
            onConfirm: () => { onDeleteLead(id); setDialog(null); },
            onCancel: () => setDialog(null)
        });
    };

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
            <CustomDialog 
                isOpen={showLogoutConfirm} 
                title="Cerrar Sesión" 
                message="¿Estás seguro de que deseas salir del panel de administración?" 
                type="warning" 
                onConfirm={onLogout} 
                onCancel={() => setShowLogoutConfirm(false)} 
            />
            {/* MODAL DE INACTIVIDAD BANCARIA */}
            {showInactivityWarning && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col shadow-2xl animate-slide-up border border-gray-100 overflow-hidden text-center p-8">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner animate-pulse">
                            <Clock size={32} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">¿Sigues ahí?</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed font-medium">
                            Por tu seguridad, cerraremos tu sesión por inactividad en <br/>
                            <span className="text-3xl font-black text-red-600 font-mono mt-3 block">
                                {Math.floor(inactivityCountdown / 60)}:{(inactivityCountdown % 60).toString().padStart(2, '0')}
                            </span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { isWarningVisible.current = false; setShowInactivityWarning(false); }} className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] transition-transform">
                                Sí, seguir conectado
                            </button>
                            <button onClick={onLogout} className="w-full py-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm">
                                Cerrar Sesión Segura
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

{/* HEADER + SEARCH (UNIFICADO) */}
<div className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 z-20 sticky top-0 shrink-0">

    {/* IZQUIERDA: LOGO + TÍTULO + BOTONES MÓVILES */}
    <div className="flex items-center justify-between w-full md:w-auto shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-1 shrink-0">
                <img 
                    src="https://imnufit.com/wp-content/uploads/2026/03/log5.png" 
                    alt="Logo Asistente de Beneficios" 
                    className="w-full h-full object-contain drop-shadow-sm"
                />
            </div>
            <div className="leading-tight">
                <h2 className="font-bold text-gray-900 text-base md:text-lg tracking-tight">
                    Admin<span className="font-light">Panel</span>
                </h2>
            </div>
        </div>

        {/* Botones de acción solo visibles en Móvil */}
        <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setShowFullSettings(true)} className="w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><Settings size={16} /></button>
            <button onClick={() => setShowLogoutConfirm(true)} className="w-9 h-9 flex items-center justify-center bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-full transition-colors"><LogOut size={16} /></button>
        </div>
    </div>

    {/* CENTRO: BARRA DE BÚSQUEDA */}
    {activeTab !== 'schedule' && (
        <div className="relative w-full md:max-w-md lg:max-w-lg group shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={16}/>
            <input
                type="text"
                placeholder={`Buscar ${activeTab === 'agents' ? 'agente por estado o nombre' : 'prospecto globalmente'}...`}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 rounded-xl outline-none transition-all text-sm font-medium shadow-inner focus:shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
    )}

    {/* DERECHA: SWITCHES Y BOTONES DESKTOP */}
    <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-3 shrink-0">
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            <button
                onClick={() => onUpdateGeneralSettings({ ...generalSettings, marketplaceMode: !generalSettings?.marketplaceMode })}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 h-9 md:h-10 rounded-xl border text-[11px] md:text-xs font-semibold transition-all whitespace-nowrap ${
                    generalSettings?.marketplaceMode
                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
            >
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${generalSettings?.marketplaceMode ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="hidden lg:inline">Auto-Marketplace</span>
                <span className="lg:hidden">Auto-Marketplace</span>
            </button>
        
            <button
                onClick={() => onUpdateGeneralSettings({ ...generalSettings, strictCalendarMode: !generalSettings?.strictCalendarMode })}
                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 h-9 md:h-10 rounded-xl border text-[11px] md:text-xs font-semibold transition-all whitespace-nowrap ${
                    generalSettings?.strictCalendarMode
                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
            >
                <Calendar size={13} className={`${generalSettings?.strictCalendarMode ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="hidden lg:inline">Estricto</span>
                <span className="lg:hidden">Estricto</span>
            </button>
        </div>

        <div className="hidden md:block w-px h-6 bg-gray-200 mx-1"></div>
        
        <button
            onClick={() => setShowFullSettings(true)}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm shrink-0"
        >
            <Settings size={16} />
        </button>
        
        <button
            onClick={() => setShowLogoutConfirm(true)}
            className="hidden md:flex items-center justify-center gap-2 px-4 h-10 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 rounded-xl hover:bg-red-50 transition-all shadow-sm shrink-0"
        >
            <LogOut size={14} /> Salir
        </button>
    </div>
</div>

            {/* Pestañas de Navegación Admin */}
            <div className="flex px-4 md:px-6 gap-6 md:gap-8 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm overflow-x-auto z-10 scrollbar-hide shrink-0 pt-2 pb-0">
                {['active', 'marketplace', 'urgent', 'offers', 'assigned', 'archived', 'agents', 'schedule'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => {setActiveTab(tab); setSelectedLeads([]); setSearchTerm('');}}
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
                        {tab === 'offers' && (
                            <>
                                Ofertas
                                {groupedOffers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm animate-pulse leading-none">{groupedOffers.length}</span>}
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
                        <AdminCalendar leads={processedLeads} agents={agents} onLeadClick={setViewingLead} />
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
                                                    setDialog({ title: 'Rechazar Solicitud', message: `¿Estás seguro de rechazar la solicitud de ${req.fullName}? Se le enviará un correo de notificación automáticamente.`, type: 'danger', onConfirm: () => { onRejectRequest(req); setDialog(null); }, onCancel: () => setDialog(null) });
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
                                {currentViewAgents.map(agent => {
                                    // AQUÍ CALCULAMOS EL RATING DE CADA AGENTE INDIVIDUALMENTE
                                    const agReviews = reviews.filter(r => r.agentId === agent.id);
                                    const agAvgRating = agReviews.length > 0 ? (agReviews.reduce((acc, r) => acc + r.rating, 0) / agReviews.length).toFixed(1) : 0;

                                    return (
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
                                                    {/* RATING ESTILO AMAZON */}
                                                    {agReviews.length > 0 && (
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <div className="flex text-amber-400">
                                                                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= Math.round(agAvgRating) ? "currentColor" : "none"} className={s <= Math.round(agAvgRating) ? "text-amber-400" : "text-gray-300"}/>)}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-700">{agAvgRating} <span className="font-normal text-gray-400">({agReviews.length})</span></span>
                                                        </div>
                                                    )}
                                                    
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
                                    );
                                })}
                                {currentViewAgents.length === 0 && <div className="col-span-full text-center py-20 text-gray-400 font-medium">No se encontraron agentes {agentSubTab}.</div>}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'offers' ? (
                    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {groupedOffers.map(bundle => {
                                const agentObj = agents.find(a => a.id === bundle.agentId);
                                if (!agentObj) return null;
                                return (
                                    <div key={bundle.id} onClick={() => setViewingBundle(bundle)} className="bg-white p-6 rounded-[2.5rem] shadow-soft border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                        {/* Badge de Precio Flotante */}
                                        <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-1.5 rounded-full font-black text-sm shadow-lg shadow-green-500/20">
                                            ${bundle.price}
                                        </div>

                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-gray-50 overflow-hidden mb-4 shadow-sm group-hover:border-rose-100 transition-colors">
                                                {agentObj.photo ? <img src={agentObj.photo} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">{agentObj.name.charAt(0)}</div>}
                                            </div>
                                            
                                            <h3 className="text-xl font-black text-gray-900 group-hover:text-rose-600 transition-colors">{agentObj.name}</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">{bundle.id}</p>

                                            <div className="w-full space-y-3">
                                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                                    <Phone size={14} className="text-rose-500"/> {agentObj.phone}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                                    <Mail size={14} className="text-rose-500"/> <span className="truncate">{agentObj.email}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-50 w-full flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bundle.leads.length} Prospectos</span>
                                                <div className="flex items-center gap-1 text-rose-500 font-mono text-[10px] font-bold animate-pulse">
                                                    <Clock size={12}/> {Math.floor((bundle.expiresAt - Date.now()) / (1000 * 60 * 60))}h restantes
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {groupedOffers.length === 0 && (
                                <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                                    <DollarSign size={40} className="mx-auto text-gray-200 mb-4"/>
                                    <p className="text-gray-400 font-bold">No hay notas de cobro pendientes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto bg-transparent md:bg-white md:rounded-3xl md:shadow-soft border-0 md:border border-gray-100 md:overflow-hidden pb-20 md:pb-0 flex flex-col">
                        
                        {/* NUEVO: FILTRO ELEGANTE REUBICADO ENCIMA DE LA TABLA */}
                        {(activeTab === 'assigned' || activeTab === 'archived') && (
                            <div className="px-4 md:px-6 py-3 border-b border-gray-100 bg-white flex justify-end shrink-0">
                                <div className="relative w-full sm:w-64 z-30">
                                    <button 
                                        onClick={() => setIsAdminStatusFilterOpen(!isAdminStatusFilterOpen)} 
                                        className="w-full pl-4 pr-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 shadow-sm transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                            <span className="truncate">
                                                {adminSelectedStatusFilters.length === 0 
                                                    ? 'Filtrar por Estatus...' 
                                                    : `${adminSelectedStatusFilters.length} Seleccionado(s)`}
                                            </span>
                                        </div>
                                        <ChevronRight size={12} className={`text-gray-400 shrink-0 transition-transform ${isAdminStatusFilterOpen ? '-rotate-90' : 'rotate-90'}`} />
                                    </button>

                                    {isAdminStatusFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsAdminStatusFilterOpen(false)}></div>
                                            <div className="absolute top-[calc(100%+8px)] right-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-slide-up z-50">
                                                <div className="p-2 flex flex-col gap-1">
                                                    {[
                                                        { id: 'vendido', label: 'Venta Cerrada', color: 'emerald' },
                                                        { id: 'seguimiento', label: 'En Seguimiento', color: 'amber' },
                                                        { id: 'descartado', label: 'Descartado', color: 'rose' },
                                                        { id: 'activo', label: 'Cita Programada', color: 'blue' }
                                                    ].map(st => {
                                                        const count = leads.filter(l => {
                                                            if (activeTab === 'assigned') return l.assignedTo && l.status !== 'archived' && (l.agentStatus || 'activo') === st.id;
                                                            if (activeTab === 'archived') return l.status === 'archived' && (l.agentStatus || 'activo') === st.id;
                                                            return false;
                                                        }).length;
                                                        const isSelected = adminSelectedStatusFilters.includes(st.id);
                                                        
                                                        return (
                                                            <label key={st.id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                                                                <input type="checkbox" className="custom-checkbox shrink-0" checked={isSelected} onChange={() => { setAdminSelectedStatusFilters(prev => prev.includes(st.id) ? prev.filter(f => f !== st.id) : [...prev, st.id]); }} />
                                                                <span className="text-sm font-semibold text-gray-700 flex-1 flex justify-between items-center group-hover:text-black transition-colors">
                                                                    {st.label}
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors ${isSelected ? `bg-${st.color}-50 text-${st.color}-600 border-${st.color}-200` : 'bg-gray-100 text-gray-500 border-transparent'}`}>
                                                                        {count}
                                                                    </span>
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                                {adminSelectedStatusFilters.length > 0 && (
                                                    <div className="p-2 border-t border-gray-100 bg-gray-50">
                                                        <button onClick={() => setAdminSelectedStatusFilters([])} className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-black hover:border-gray-300 transition-colors shadow-sm">Limpiar Filtro</button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

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
                                            <div className="flex flex-col items-start gap-1">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider items-center gap-1 ${lead.status === 'archived' ? 'bg-gray-100 text-gray-500' : lead.assignedTo ? 'bg-purple-50 text-purple-700 border border-purple-100' : (!lead.assignedTo && lead.hoursUntil <= 2) ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : (lead.status === 'marketplace' && lead.hoursUntil <= 3) ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm' : lead.status === 'marketplace' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                                {lead.status === 'archived' ? 'Archivado' : lead.assignedTo ? 'Asignado' : (!lead.assignedTo && lead.hoursUntil <= 2) ? 'Urgente' : (lead.status === 'marketplace' && lead.hoursUntil <= 3) ? <>Oferta <span className="opacity-70 text-[10px]">🔥</span></> : lead.status === 'marketplace' ? 'En Tienda' : 'Bandeja'}
                                            </span>
                                            {lead.assignedTo && (activeTab === 'assigned' || activeTab === 'archived') && (
                                                <span className={`inline-flex px-1.5 py-0.5 rounded shadow-sm text-[8px] font-extrabold uppercase tracking-widest shrink-0 ${
                                                    (lead.agentStatus === 'vendido') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    (lead.agentStatus === 'seguimiento') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    (lead.agentStatus === 'descartado') ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                    {lead.agentStatus === 'vendido' ? 'Venta Cerrada' :
                                                     lead.agentStatus === 'seguimiento' ? 'En Seguimiento' :
                                                     lead.agentStatus === 'descartado' ? 'Descartado' : 'Cita Programada'}
                                                </span>
                                            )}
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
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest items-center gap-1 ${lead.status === 'archived' ? 'bg-gray-100 text-gray-500' : lead.assignedTo ? 'bg-purple-50 text-purple-700 border border-purple-100' : (!lead.assignedTo && lead.hoursUntil <= 2) ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : (lead.status === 'marketplace' && lead.hoursUntil <= 3) ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm' : lead.status === 'marketplace' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                                    {lead.status === 'archived' ? 'Archivado' : lead.assignedTo ? 'Asignado' : (!lead.assignedTo && lead.hoursUntil <= 2) ? 'Urgente' : (lead.status === 'marketplace' && lead.hoursUntil <= 3) ? <>Oferta <span className="opacity-70 text-[9px]">🔥</span></> : lead.status === 'marketplace' ? 'En Tienda' : 'Bandeja'}
                                                </span>
                                                {lead.assignedTo && (activeTab === 'assigned' || activeTab === 'archived') && (
                                                    <span className={`inline-flex px-1.5 py-0.5 rounded shadow-sm text-[8px] font-extrabold uppercase tracking-widest shrink-0 ${
                                                        (lead.agentStatus === 'vendido') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                        (lead.agentStatus === 'seguimiento') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                        (lead.agentStatus === 'descartado') ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                                    }`}>
                                                        {lead.agentStatus === 'vendido' ? 'Venta Cerrada' :
                                                         lead.agentStatus === 'seguimiento' ? 'En Seguimiento' :
                                                         lead.agentStatus === 'descartado' ? 'Descartado' : 'Cita Programada'}
                                                    </span>
                                                )}
                                            </div>
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
                    generalSettings={generalSettings}
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
                        onUpdateLead(leadId, { 
                            assignedTo: '', 
                            status: isFuture ? 'new' : 'archived' 
                        });
                    } else {
                        // Si hay un agentId, abrimos la Nota de Cobro en lugar de asignar directo
                        setOfferSetup({ agentId: agentId, leads: [assignedLead] });
                        setViewingLead(null); // Cerramos la ficha para que se vea el modal de cobro limpio
                    }
                }}
                />
            )}

            {viewingAgent && (
                <AgentDetailView 
                    agent={agents.find(a => a.id === viewingAgent.id) || viewingAgent} 
                    leads={processedLeads} 
                    reviews={reviews}
                    onClose={() => setViewingAgent(null)} 
                    onLeadClick={(l) => { setViewingAgent(null); setViewingLead(l); }} 
                    onSaveAgent={handleSaveAgent}
                    onDeleteAgent={onDeleteAgent}
                    onDeleteReview={onDeleteReview}
                />
            )}                        
            <CustomDialog isOpen={!!dialog} {...dialog} />

            {isBulkAgentSelectOpen && (
                <AgentSelectionModal 
                    agents={activeAgentsList} 
                    contextLeads={selectedLeads.map(id => processedLeads.find(l => l.id === id)).filter(Boolean)} 
                    allLeads={processedLeads} 
                    onClose={() => setIsBulkAgentSelectOpen(false)}
                    onSelect={(agentId, assignableLeads) => { 
                        
                        // 👇 NUEVA LÓGICA DE DESASIGNACIÓN EN LOTE 👇
                        if (!agentId) {
                            setDialog({
                                title: 'Quitar Asignación',
                                message: `¿Estás seguro de quitar la asignación a estos ${selectedLeads.length} prospectos?`,
                                type: 'warning',
                                onConfirm: () => {
                                    const now = Date.now();
                                    selectedLeads.forEach(id => {
                                        const lead = processedLeads.find(l => l.id === id);
                                        if (lead) {
                                            const timeInfo = getAgentLocalDateTime(lead.date, lead.time, lead.state);
                                            const isFuture = timeInfo ? timeInfo.localMs > now : true;
                                            onUpdateLead(id, { assignedTo: '', status: isFuture ? 'new' : 'archived' });
                                        }
                                    });
                                    setSelectedLeads([]);
                                    setIsBulkAgentSelectOpen(false);
                                    setDialog(null);
                                },
                                onCancel: () => setDialog(null)
                            });
                            return;
                        }
                        // 👆 FIN NUEVA LÓGICA 👆

                        const selectedAgent = agents.find(a => a.id === agentId);
                        const assignableIds = assignableLeads.map(l => l.id);

                        const executeAssignment = () => {
                            setOfferSetup({ agentId: agentId, leads: assignableLeads });
                            setDialog(null);
                        };
                        
                        if (assignableIds.length < selectedLeads.length) {
                            const omitidos = selectedLeads.length - assignableIds.length;
                            setDialog({
                                title: 'Asignación Parcial',
                                message: `El agente ${selectedAgent.name} solo puede tomar ${assignableIds.length} de los ${selectedLeads.length} prospectos seleccionados.\n\n¿Deseas generar la nota de cobro por estos ${assignableIds.length} y dejar los otros ${omitidos} en la bandeja?`,
                                type: 'warning',
                                onConfirm: executeAssignment,
                                onCancel: () => setDialog(null)
                            });
                        } else {
                            setDialog({
                                title: 'Generar Oferta',
                                message: `¿Estás seguro de crear una nota de cobro para ${selectedAgent.name} con estos ${assignableIds.length} prospectos?`,
                                type: 'info',
                                onConfirm: executeAssignment,
                                onCancel: () => setDialog(null)
                            });
                        }
                    }} 
                />
            )}

            {individualAgentSelectLeadId && (
                <AgentSelectionModal 
                    agents={activeAgentsList} 
                    contextLeads={[processedLeads.find(l => l.id === individualAgentSelectLeadId)].filter(Boolean)} 
                    allLeads={processedLeads} 
                    onClose={() => setIndividualAgentSelectLeadId(null)} 
                    onSelect={(agentId, assignableLeads) => { 
                        const leadToAssign = processedLeads.find(l => l.id === individualAgentSelectLeadId);
                        const selectedAgent = agents.find(a => a.id === agentId);
                        
                        if (!agentId) {
                            setDialog({
                                title: 'Quitar Asignación',
                                message: '¿Estás seguro de quitar la asignación actual?',
                                type: 'warning',
                                onConfirm: () => {
                                    const now = Date.now();
                                    const timeInfo = getAgentLocalDateTime(leadToAssign.date, leadToAssign.time, leadToAssign.state);
                                    const isFuture = timeInfo ? timeInfo.localMs > now : true;

                                    onUpdateLead(individualAgentSelectLeadId, { 
                                        assignedTo: '',
                                        status: isFuture ? 'new' : 'archived'
                                    }); 
                                    setIndividualAgentSelectLeadId(null); 
                                    setDialog(null);
                                },
                                onCancel: () => setDialog(null)
                            });
                            return;
                        }

                        setDialog({
                            title: 'Generar Oferta',
                            message: `¿Deseas preparar una nota de cobro a ${selectedAgent.name} por este prospecto?`,
                            type: 'info',
                            onConfirm: () => {
                                setOfferSetup({ agentId: agentId, leads: [leadToAssign] });
                                setDialog(null);
                            },
                            onCancel: () => setDialog(null)
                        });
                    }} 
                />
            )}

            {/* RENDERIZAMOS EL MODAL DE LA NOTA DE COBRO SI HAY OFERTA EN CURSO */}
            {offerSetup && (
                <OfferPreviewModal
                    offerSetup={offerSetup}
                    agents={agents}
                    generalSettings={generalSettings}
                    onClose={() => setOfferSetup(null)}
                    onSendOffer={handleSendOffer}
                />
            )}
            {/* MODAL DE DESGLOSE DE OFERTA (PARA EL ADMIN) */}
            {viewingBundle && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90000] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative animate-slide-up border border-gray-100">
                        <button onClick={() => setViewingBundle(null)} className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={18}/></button>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-inner">
                                <FileText size={28}/>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 leading-tight">Detalle de Cobro</h2>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{viewingBundle.id}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Agente Responsable</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0">
                                        {agents.find(a=>a.id === viewingBundle.agentId)?.photo ? <img src={agents.find(a=>a.id === viewingBundle.agentId).photo} className="w-full h-full object-cover"/> : <User className="w-full h-full p-2 text-gray-300"/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{agents.find(a=>a.id === viewingBundle.agentId)?.name}</p>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <a href={`tel:${agents.find(a=>a.id === viewingBundle.agentId)?.phone}`} className="text-[11px] text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 font-medium"><Phone size={10}/> {agents.find(a=>a.id === viewingBundle.agentId)?.phone}</a>
                                            <a href={`mailto:${agents.find(a=>a.id === viewingBundle.agentId)?.email}`} className="text-[11px] text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 font-medium"><Mail size={10}/> {agents.find(a=>a.id === viewingBundle.agentId)?.email}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Contenido del Paquete</span>
                                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                                    {viewingBundle.leads.map(l => (
                                        <div key={l.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-gray-100">
                                            <span className="font-bold text-gray-700">{l.name}</span>
                                            <span className="text-[10px] font-bold text-rose-500 uppercase">{l.state}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-black rounded-[2rem] text-white mb-6">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Monto de la Oferta</p>
                                <p className="text-3xl font-black">${viewingBundle.price}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Vencimiento</p>
                                <p className="text-xs font-mono font-bold text-rose-400">{new Date(viewingBundle.expiresAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                setDialog({
                                    title: 'Cancelar Oferta',
                                    message: '¿Estás seguro de cancelar esta nota de cobro? Los prospectos volverán a la bandeja principal inmediatamente.',
                                    type: 'danger',
                                    onConfirm: () => {
                                        bulkUpdateLeads(viewingBundle.leads.map(l=>l.id), { status: 'new', offer: null });
                                        setViewingBundle(null);
                                        setDialog(null);
                                    },
                                    onCancel: () => setDialog(null)
                                });
                            }}
                            className="w-full py-4 rounded-2xl text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <X size={18}/> Cancelar y Liberar Leads
                        </button>
                    </div>
                </div>
            )}

            {showFullSettings && (
                <SystemSettingsScreen 
                    webhooks={webhooks} 
                    generalSettings={generalSettings}
                    schedule={schedule}
                    onSaveWebhooks={onUpdateWebhooks} 
                    onSaveGeneral={onUpdateGeneralSettings}
                    onUpdateSchedule={onUpdateSchedule}
                    onClose={() => setShowFullSettings(false)} 
                />
            )}
        </div>
    );
};

// --- PORTAL DEL AGENTE (SaaS Premium V8 - Precios Dinámicos y Auto-Expiración) ---
// --- NUEVO: MODAL ELEGANTE DE SOPORTE PARA AGENTES ---
const AgentSupportModal = ({ onClose }) => {
    const email = 'asistentedebeneficios@gmail.com';
    const modalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col shadow-2xl animate-slide-up border border-gray-100 overflow-hidden relative">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors z-10"><X size={18}/></button>
                
                <div className="p-8 md:p-10 text-center space-y-5 flex flex-col items-center pt-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100 mb-2">
                        <HelpCircle size={32} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Soporte al Agente</h2>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                        Estamos aquí para servirte. Si tienes algún inconveniente o duda con tu cuenta, por favor escríbenos. Las peticiones serán atendidas con mucho gusto en el orden en que fueron recibidas.
                    </p>
                    
                    <div className="w-full pt-4">
                        <a href={`mailto:${email}`} className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-2 group">
                            <Mail size={18} className="group-hover:scale-110 transition-transform" /> Enviar Correo
                        </a>
                        <p className="text-[11px] font-bold text-gray-400 mt-4 bg-gray-50 py-2 rounded-lg border border-gray-100 select-all tracking-wider">
                            {email}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
                                                                   
const AgentPortal = ({ leads, agent, reviews = [], onUpdateLead, onLogout, generalSettings, webhooks }) => {
    
    // NUEVO: ESTADO PARA EL MODAL DE SALIDA
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // --- ESTRELLAS DEL AGENTE Y MODAL ---
    const agentReviews = reviews.filter(r => r.agentId === agent.id).sort((a,b) => b.timestamp - a.timestamp);
    const avgRating = agentReviews.length > 0 ? (agentReviews.reduce((acc, r) => acc + r.rating, 0) / agentReviews.length).toFixed(1) : 0;
    const [showReviewsModal, setShowReviewsModal] = useState(false);

    // --- SENSOR DE SEGURIDAD: AUTO-CIERRE POR INACTIVIDAD (30 MIN) CON AVISO PREVIO ---
    const [showInactivityWarning, setShowInactivityWarning] = useState(false);
    const [inactivityCountdown, setInactivityCountdown] = useState(120);
    const isWarningVisible = useRef(false);

    useEffect(() => {
        let warningTimer;
        let countdownInterval;

        const resetAll = () => {
            // Si la alerta ya saltó, ignoramos los movimientos del mouse para obligarlo a hacer clic en el botón
            if (isWarningVisible.current) return; 
            
            clearTimeout(warningTimer);
            clearInterval(countdownInterval);
            
            const TOTAL_TIME = 30 * 60 * 1000; // 30 minutos
            const WARNING_TIME = TOTAL_TIME - (2 * 60 * 1000); // 28 minutos (Lanza aviso faltando 2 min)

            warningTimer = setTimeout(() => {
                isWarningVisible.current = true;
                setShowInactivityWarning(true);
                
                // Calcula el momento exacto en el futuro para evitar retrasos si se minimiza la pestaña
                const logoutTime = Date.now() + (2 * 60 * 1000); 
                
                countdownInterval = setInterval(() => {
                    const secondsLeft = Math.ceil((logoutTime - Date.now()) / 1000);
                    if (secondsLeft <= 0) {
                        clearInterval(countdownInterval);
                        onLogout();
                    } else {
                        setInactivityCountdown(secondsLeft);
                    }
                }, 1000);
            }, WARNING_TIME);
        };

        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => document.addEventListener(event, resetAll));
        resetAll();

        return () => {
            clearTimeout(warningTimer);
            clearInterval(countdownInterval);
            activityEvents.forEach(event => document.removeEventListener(event, resetAll));
        };
    }, [onLogout]);
    // -----------------------------------------------------------------

    const regularPrice = generalSettings?.regularPrice ?? 45;
    const offerPrice = generalSettings?.offerPrice ?? 35;
    // Si está inactivo, le borramos el Marketplace de sus opciones
    const TABS = agent.status === 'inactive' ? ['clientes', 'agenda', 'historial'] : ['marketplace', 'ofertas', 'clientes', 'agenda', 'historial'];
    const [viewingLead, setViewingLead] = useState(null);
    const [dialog, setDialog] = useState(null);
    const [showSupportModal, setShowSupportModal] = useState(false); // <-- ESTE ES EL ESTADO DEL MODAL DE SOPORTE
    
    // --- MÁGIA: RELOJ INTERNO (Actualiza la pantalla cada SEGUNDO para los Countdowns) ---
    const [timeTick, setTimeTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTimeTick(t => t + 1), 1000); 
        return () => clearInterval(timer);
    }, []);

    // --- NUEVO: DETECTOR DE REGRESO DE STRIPE BLINDADO ---
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('success') === 'true') {
            setDialog({ 
                title: '¡Adquisición Exitosa! 🎉', 
                message: 'Tu pago se ha procesado de manera segura y correcta. Los prospectos ya están en tu cartera listos para que los contactes.', 
                type: 'success', 
                onConfirm: () => setDialog(null) 
            });
            window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        }
        
        if (urlParams.get('canceled') === 'true') {
            // 🔥 SOLUCIÓN CRÍTICA: Eliminamos la memoria para que no dispare Make
            localStorage.removeItem('pendingPurchasedLeads');

            // Dejamos un recado en la sesión para liberar los leads cuando Firebase cargue
            sessionStorage.setItem('releaseCanceledLeads', 'true');

            setDialog({ 
                title: 'Compra Cancelada', 
                message: 'Has cancelado el proceso de pago. No se hizo ningún cargo a tu tarjeta y los prospectos han sido liberados.', 
                type: 'warning', 
                onConfirm: () => setDialog(null) 
            });
            window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        }
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
    const [selectedStatusFilters, setSelectedStatusFilters] = useState([]);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
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

    // --- NUEVO: MOTOR DE AGRUPACIÓN DE OFERTAS ---
    const myDirectOffers = processedLeads.filter(l => l.status === 'pending_payment' && l.offer?.agentId === agent.id);
    const bundles = {};
    myDirectOffers.forEach(l => {
        const bId = l.offer.bundleId;
        if (!bundles[bId]) {
            bundles[bId] = { 
                id: bId, 
                leads: [], 
                expiresAt: l.offer.expiresAt, 
                price: l.offer.price 
            };
        }
        bundles[bId].leads.push(l);
    });
    const offerBundles = Object.values(bundles).sort((a, b) => a.expiresAt - b.expiresAt);

    // Función para el Countdown Visual de cada tarjeta
    const getRemainingTime = (expiresAt) => {
        const diff = expiresAt - Date.now();
        if (diff <= 0) return "Expirado";
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return `${h}h ${m}m ${s}s`;
    };
    
    // Citas activas: La más próxima va arriba (Oculta las Ventas Cerradas)
    const activeClients = myLeads.filter(l => l.status !== 'archived' && l.agentStatus !== 'vendido').sort((a, b) => a.hoursUntil - b.hoursUntil);
    // Citas archivadas: La que pasó más recientemente va arriba (Incluye las Ventas Cerradas)
    const archivedClients = myLeads.filter(l => l.status === 'archived' || l.agentStatus === 'vendido').sort((a, b) => b.hoursUntil - a.hoursUntil);
    
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
    
    // --- NUEVA REGLA DE NEGOCIO: EXTRAER ESTADOS PERMITIDOS DEL AGENTE ---
    let agentLicensedStateNames = [];
    if (agent.licensesArray && agent.licensesArray.length > 0) {
        // Extraemos los nombres completos basados en las abreviaciones de sus licencias
        agentLicensedStateNames = agent.licensesArray.map(lic => {
            const stateObj = FULL_US_STATES.find(s => s.abbr === lic.state);
            return stateObj ? stateObj.name : null;
        }).filter(Boolean);
    } else if (agent.license) {
        // Soporte para agentes antiguos que solo tienen el texto "12345 (FL)"
        const matches = agent.license.match(/\(([^)]+)\)/g);
        if (matches) {
            agentLicensedStateNames = matches.map(m => {
                const abbr = m.replace(/[()]/g, '').trim();
                const stateObj = FULL_US_STATES.find(s => s.abbr === abbr);
                return stateObj ? stateObj.name : null;
            }).filter(Boolean);
        }
    }

    // Filtro Inteligente del Marketplace (LICENCIA + BLOQUEO DE CARRITO)
    const LOCK_TIME_MS = 10 * 60 * 1000; // 10 minutos
    const nowMs = Date.now();

    const allAvailableLeads = processedLeads.filter(l => {
        const isMarketplace = l.status === 'marketplace' && !l.assignedTo && l.hoursUntil > 2;
        if (!isMarketplace) return false;
        
        // 1. Bloqueo de Seguridad: Licencia
        if (!l.state) return false; 
        if (!agentLicensedStateNames.includes(l.state)) return false;

        // 2. Bloqueo de Concurrencia: Ocultar si otro agente lo tiene en su carrito
        const isLocked = l.lockedBy && l.lockedAt && (nowMs - l.lockedAt < LOCK_TIME_MS);
        if (isLocked && l.lockedBy !== agent.id) return false; // Oculto para los demás

        return true;
    });
    
    // Motor matemático: Cuenta cuántos leads hay por cada estado (solo de los permitidos)
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

    // Lógica del Temporizador y Liberación de Leads
    useEffect(() => {
        let timer;
        if (cart.length > 0 && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            cart.forEach(leadId => onUpdateLead(leadId, { lockedBy: null, lockedAt: null }));
            setCart([]); 
            setTimeLeft(600); 
            setDialog({ title: 'Tiempo Expirado', message: 'El tiempo para reservar ha expirado. Las citas han sido liberadas para el resto del equipo.', type: 'warning', onConfirm: () => setDialog(null) });
        } else if (cart.length === 0) {
            setTimeLeft(600);
        }
        return () => clearInterval(timer);
    }, [cart, timeLeft]);

    // --- NUEVO: AUTO-LIMPIEZA DEL CARRITO EN TIEMPO REAL (ANTIRROBO) ---
    useEffect(() => {
        if (cart.length === 0) return;
        
        const nowMs = Date.now();
        let cartChanged = false;
        
        const validCart = cart.filter(leadId => {
            const lead = processedLeads.find(l => l.id === leadId);
            // Si el lead no existe o ya fue asignado
            if (!lead || lead.assignedTo) {
                cartChanged = true; return false;
            }
            // Si es una nota de cobro directa, la dejamos pasar sin aplicar el filtro antirrobo del marketplace
            if (lead.status === 'pending_payment') {
                return true;
            }
            // Si no es nota de cobro, TIENE que ser del marketplace
            if (lead.status !== 'marketplace') {
                cartChanged = true; return false;
            }
            // Si otro agente lo bloqueó milisegundos antes
            const isLockedByOther = lead.lockedBy && lead.lockedBy !== agent.id && lead.lockedAt && (nowMs - lead.lockedAt < (10 * 60 * 1000));
            if (isLockedByOther) {
                cartChanged = true; return false;
            }
            return true;
        });

        if (cartChanged) {
            setCart(validCart);
            setDialog({
                title: 'Prospecto Reservado',
                message: 'Uno de los prospectos de tu carrito acaba de ser tomado por otro agente fracciones de segundo antes. Tu carrito ha sido actualizado.',
                type: 'warning',
                onConfirm: () => setDialog(null)
            });
            if (validCart.length === 0) setTimeLeft(600);
        }
    }, [processedLeads]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const toggleCart = (leadId, isBlocked) => { 
        if (isBlocked) return; 
        
        // Bloqueo manual extra por si hace clic en el milisegundo exacto
        const leadActual = processedLeads.find(l => l.id === leadId);
        const isLockedByOther = leadActual && leadActual.lockedBy && leadActual.lockedBy !== agent.id && leadActual.lockedAt && (Date.now() - leadActual.lockedAt < (10 * 60 * 1000));
        
        if (isLockedByOther && !cart.includes(leadId)) {
            setDialog({ title: '¡Gana el más rápido!', message: 'Otro agente acaba de tomar este prospecto hace un instante.', type: 'warning', onConfirm: () => setDialog(null) });
            return;
        }

        const isRemoving = cart.includes(leadId);
        
        setCart(prev => isRemoving ? prev.filter(id => id !== leadId) : [...prev, leadId]); 
        
        onUpdateLead(leadId, { 
            lockedBy: isRemoving ? null : agent.id, 
            lockedAt: isRemoving ? null : Date.now() 
        });

        if (cart.length === 0 && !isRemoving) setTimeLeft(600);
    };

    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // --- NUEVO SENSOR: DESATASCAR BOTÓN SI EL USUARIO HACE "SWIPE BACK" ---
    useEffect(() => {
        // Detecta si la pestaña vuelve a estar visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setIsCheckingOut(false);
            }
        };
        // Detecta si el navegador sacó la página de su memoria caché (BFCache)
        const handlePageShow = (event) => {
            if (event.persisted) {
                setIsCheckingOut(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    // --- NUEVO: MOTOR DE WEBHOOKS PARA COMPRAS ---
    const triggerAssignmentWebhook = (leadObj, agentObj) => {
        if (!webhooks || (!webhooks.assignment && !webhooks.master && !webhooks.telegram)) return;
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
            policy_for: leadObj.policy_for ? (Array.isArray(leadObj.policy_for) ? leadObj.policy_for.map(val => policyMap[val] || val).join(', ') : policyMap[leadObj.policy_for] || leadObj.policy_for) : '',
            motivation: leadObj.motivation ? (Array.isArray(leadObj.motivation) ? leadObj.motivation.map(val => motivationMap[val.toLowerCase()] || val).join(', ') : motivationMap[leadObj.motivation.toLowerCase()] || leadObj.motivation) : '',
            coverage_amount: coverageMap[safeCoverage] || leadObj.coverage_amount,
            time: leadObj.localTime || leadObj.time
        };

        const url = webhooks.master || webhooks.telegram || webhooks.assignment;
        if (url) {
            fetch(url, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    evento: 'asignacion_agente', 
                    datos: { lead: translatedLead, agent: agentObj } 
                })
            }).catch(e => console.error("Error Webhook Asignación:", e));
        }
    };

    // Motor de Acciones Post-Stripe (Espera a que Firebase entregue los leads)
    useEffect(() => {
        if (leads.length === 0) return;

        // 1. Si regresó exitoso (Disparamos a Make)
        const pendingLeadsJSON = localStorage.getItem('pendingPurchasedLeads');
        if (pendingLeadsJSON) {
            try {
                const purchasedIds = JSON.parse(pendingLeadsJSON);
                purchasedIds.forEach(id => {
                    const leadData = leads.find(l => l.id === id);
                    if (leadData) {
                        triggerAssignmentWebhook(leadData, agent);
                    }
                });
                localStorage.removeItem('pendingPurchasedLeads'); // Limpiamos la memoria tras el envío
            } catch (e) {
                console.error("Error disparando webhooks post-compra", e);
            }
        }

        // 2. Si regresó cancelado (Liberamos los leads bloqueados con seguridad)
        if (sessionStorage.getItem('releaseCanceledLeads') === 'true') {
            leads.forEach(l => {
                if (l.lockedBy === agent.id) {
                    onUpdateLead(l.id, { lockedBy: null, lockedAt: null });
                }
            });
            sessionStorage.removeItem('releaseCanceledLeads');
        }
    }, [leads, agent, webhooks, onUpdateLead]);

    const handleCheckout = async (directItems = null, directLeadIds = null) => {
        // Usamos los IDs que vienen del botón de Ofertas, o si no, usamos el carrito normal
        const checkoutLeadIds = directLeadIds || cart;
        
        if (checkoutLeadIds.length === 0) return;
        
        setIsCheckingOut(true);
        try {
            // 1. Usamos los items directos (Ofertas) o empaquetamos los del carrito (Marketplace)
            const items = directItems || checkoutLeadIds.map(leadId => {
                // Buscamos en 'processedLeads' (la base de datos completa) para no perder los leads de Ofertas
                const lead = processedLeads.find(l => l.id === leadId);
                const isFireSale = lead && lead.hoursUntil <= 3;
                return {
                    name: `Prospecto en ${lead ? lead.state : 'US'}`,
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
                    leadIds: checkoutLeadIds
                })
            });

            const result = await response.json();
            
            // 3. Redirigimos a la pantalla segura de Stripe
            if (result.url) {
                // NUEVO: Guardamos la lista de compras en la memoria para el regreso
                localStorage.setItem('pendingPurchasedLeads', JSON.stringify(checkoutLeadIds));
                window.location.href = result.url;
            } else {
                setDialog({ title: 'Error de Conexión', message: 'No pudimos conectar con la pasarela de pagos. Por favor, intenta de nuevo.', type: 'danger', onConfirm: () => setDialog(null) });
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error("Error Stripe:", error);
            setDialog({ title: 'Error de Red', message: 'Hubo un fallo de comunicación. Verifica tu conexión e intenta de nuevo.', type: 'danger', onConfirm: () => setDialog(null) });
            setIsCheckingOut(false);
        }
    };

    return (
        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans animate-fade-in relative pb-24 overflow-x-hidden">
            <CustomDialog isOpen={!!dialog} {...dialog} />        
            <CustomDialog 
                isOpen={showLogoutConfirm} 
                title="Cerrar Sesión" 
                message="¿Estás seguro de que deseas salir de tu portal?" 
                type="warning" 
                onConfirm={onLogout} 
                onCancel={() => setShowLogoutConfirm(false)} 
            />
            {/* MODAL DE INACTIVIDAD BANCARIA */}
            {showInactivityWarning && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col shadow-2xl animate-slide-up border border-gray-100 overflow-hidden text-center p-8">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner animate-pulse">
                            <Clock size={32} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">¿Sigues ahí?</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed font-medium">
                            Por tu seguridad, cerraremos tu sesión por inactividad en <br/>
                            <span className="text-3xl font-black text-red-600 font-mono mt-3 block">
                                {Math.floor(inactivityCountdown / 60)}:{(inactivityCountdown % 60).toString().padStart(2, '0')}
                            </span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => { isWarningVisible.current = false; setShowInactivityWarning(false); }} className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.02] transition-transform">
                                Sí, seguir conectado
                            </button>
                            <button onClick={onLogout} className="w-full py-4 bg-gray-50 border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm">
                                Cerrar Sesión Segura
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header Minimalista */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 md:px-6 py-3 flex justify-between items-center z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600 text-xs border border-gray-200 overflow-hidden shrink-0">
                        {agent.photo ? <img src={agent.photo} className="w-full h-full object-cover"/> : agent.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 text-sm tracking-tight truncate">{agent.name}</h2>
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">Portal Corporativo</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    {/* ESTRELLAS DEL AGENTE: Botón Premium (Píldora Blanca) */}
                    {agentReviews.length > 0 && (
                        <button 
                            onClick={() => setShowReviewsModal(true)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all mr-1 md:mr-2 group outline-none"
                            title="Ver mis reseñas"
                        >
                            <Star size={14} className="text-amber-400 group-hover:scale-110 transition-transform" fill="currentColor" />
                            <span className="text-xs font-black text-gray-800 tracking-tight leading-none mt-[1px]">{avgRating}</span>
                        </button>
                    )}

                    <button onClick={() => setShowSupportModal(true)} className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1.5 px-2 py-1">
                        <HelpCircle size={16}/> <span className="hidden md:inline">Soporte</span>
                    </button>
                    <div className="w-px h-4 bg-gray-200 hidden md:block"></div>
                    <button onClick={() => setShowLogoutConfirm(true)} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 px-2 py-1">
                        <LogOut size={14}/> <span className="hidden md:inline">Salir</span>
                    </button>
                </div>
            </div>

            {/* Pestañas de Navegación */}
            <div className="flex px-4 md:px-6 gap-6 md:gap-8 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm overflow-x-auto z-10 scrollbar-hide shrink-0 pt-2 pb-0">
                {(agent.status === 'inactive' ? ['clientes', 'agenda'] : ['marketplace', 'ofertas', 'clientes', 'agenda']).map(tab => (
                    <button key={tab} onClick={() => {setActiveTab(tab); setViewingLead(null);}} className={`py-3 text-xs md:text-sm font-semibold tracking-wide border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {tab === 'marketplace' && (
                                    <>
                                        Marketplace
                                        {availableLeads.length > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm leading-none min-w-[20px] text-center animate-pulse-once">
                                                {availableLeads.length}
                                            </span>
                                        )}
                                    </>
                                )}
                                {tab === 'ofertas' && (
                                    <>
                                        Ofertas
                                        {offerBundles.length > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm leading-none min-w-[20px] text-center animate-pulse">
                                                {offerBundles.length}
                                            </span>
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

            {/* VISTA NUEVA: OFERTAS DIRECTAS */}
            {activeTab === 'ofertas' && (
                <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full overflow-y-auto animate-fade-in">
                    <div className="mb-4 md:mb-6 px-1">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Ofertas Exclusivas</h1>
                        <p className="text-gray-500 text-xs md:text-sm mt-1">Paquetes seleccionados por el administrador para ti.</p>
                    </div>

                    {offerBundles.length === 0 ? (
                        <div className="text-center p-16 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                                <DollarSign size={28} className="text-gray-300"/>
                            </div>
                            <p className="text-gray-500 font-bold">No tienes ofertas pendientes</p>
                            <p className="text-xs text-gray-400 mt-1">Cuando el admin te asigne prospectos directamente, aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {offerBundles.map(bundle => (
                                <div key={bundle.id} className="bg-white rounded-[2rem] p-6 shadow-soft border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all border-l-4 border-l-amber-400">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                                                <BadgeCheck size={20}/>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 leading-tight">Paquete Directo</h4>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bundle.id}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-1">Vence en:</span>
                                            <div className="bg-rose-50 px-3 py-1 rounded-full text-rose-600 font-mono font-black text-xs border border-rose-100 animate-pulse">
                                                {getRemainingTime(bundle.expiresAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {bundle.leads.map(l => (
                                            <div key={l.id} className="flex flex-col bg-gray-50 p-4 rounded-2xl border border-gray-100/80 shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></div>
                                                        <span className="text-sm font-bold text-gray-800">{l.name}</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold bg-white text-gray-500 px-2 py-1 rounded shadow-sm uppercase tracking-widest border border-gray-200">{l.state}</span>
                                                </div>
                                                
                                                {/* Bloque Elegante de Fecha y Hora */}
                                                <div className="pl-4 ml-1 border-l-2 border-gray-200/60">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 capitalize mb-1.5">
                                                        <CalendarDays size={12} className="text-gray-400"/>
                                                        {l.date ? new Date(l.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }) : 'Sin fecha asignada'}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-bold text-blue-600 flex items-center gap-1 text-[11px] bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50">
                                                            <Clock size={10}/> {l.localTime || l.time} <span className="text-[8px] uppercase tracking-widest font-normal text-blue-400">(Tú Hora)</span>
                                                        </span>
                                                        {l.localTime !== l.time && (
                                                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                                <span className="text-gray-300">|</span> {l.time} <span className="text-[8px] uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 shadow-sm">en {l.state}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-50 gap-4">
                                        <div className="w-full sm:w-auto flex justify-between sm:block items-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total a pagar</p>
                                            <p className="text-3xl font-black text-gray-900">${bundle.price}</p>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button 
                                                onClick={() => {
                                                    setDialog({
                                                        title: 'Rechazar Oferta',
                                                        message: '¿Estás seguro de que deseas rechazar este paquete exclusivo? Los prospectos serán liberados y perderás esta oportunidad.',
                                                        type: 'warning',
                                                        onConfirm: () => {
                                                            // Devuelve los prospectos a la bandeja y borra el rastro de la oferta y bloqueos
                                                            bundle.leads.forEach(l => onUpdateLead(l.id, { status: 'new', offer: null, lockedBy: null, lockedAt: null }));
                                                            setDialog(null);
                                                        },
                                                        onCancel: () => setDialog(null)
                                                    });
                                                }}
                                                className="flex-1 sm:flex-none bg-gray-100 text-gray-500 px-4 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <X size={16}/> Rechazar
                                            </button>
                                           <button 
                                                disabled={isCheckingOut}
                                                onClick={() => {
                                                    const items = [{ name: `Paquete Exclusivo ${bundle.id}`, price: bundle.price }];
                                                    // Mandamos a Stripe directo sin meterlo al carrito del Marketplace
                                                    handleCheckout(items, bundle.leads.map(l => l.id));
                                                }}
                                                className="flex-[2] sm:flex-none bg-black text-white px-6 py-3.5 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                            >
                                                {isCheckingOut ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Preparando Pago...
                                                    </>
                                                ) : (
                                                    <>
                                                        Aceptar y Pagar <ChevronRight size={16}/>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                        
                        {/* CONTENEDOR DERECHO: Filtros y Buscador */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto z-30">
                            
                            {/* FILTRO MÚLTIPLE ELEGANTE (Solo Citas Pasadas) */}
                            {showArchived && (
                                <div className="relative w-full sm:w-60 shrink-0">
                                    <button 
                                        onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)} 
                                        className="w-full pl-4 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 shadow-sm transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                            <span className="truncate">
                                                {selectedStatusFilters.length === 0 
                                                    ? 'Filtrar por Estatus...' 
                                                    : `${selectedStatusFilters.length} Seleccionado(s)`}
                                            </span>
                                        </div>
                                        <ChevronRight size={12} className={`text-gray-400 shrink-0 transition-transform ${isStatusFilterOpen ? '-rotate-90' : 'rotate-90'}`} />
                                    </button>

                                    {/* Menú Flotante de Checkboxes Premium */}
                                    {isStatusFilterOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsStatusFilterOpen(false)}></div>
                                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-slide-up z-50">
                                                <div className="p-2 flex flex-col gap-1">
                                                    {[
                                                        { id: 'vendido', label: 'Venta Cerrada', color: 'emerald' },
                                                        { id: 'seguimiento', label: 'En Seguimiento', color: 'amber' },
                                                        { id: 'descartado', label: 'Descartado', color: 'rose' },
                                                        { id: 'activo', label: 'Cita Programada', color: 'blue' }
                                                    ].map(st => {
                                                        const count = archivedClients.filter(c => (c.agentStatus || 'activo') === st.id).length;
                                                        const isSelected = selectedStatusFilters.includes(st.id);
                                                        
                                                        return (
                                                            <label key={st.id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="custom-checkbox shrink-0"
                                                                    checked={isSelected} 
                                                                    onChange={() => {
                                                                        setSelectedStatusFilters(prev => 
                                                                            prev.includes(st.id) ? prev.filter(f => f !== st.id) : [...prev, st.id]
                                                                        );
                                                                    }} 
                                                                />
                                                                <span className="text-sm font-semibold text-gray-700 flex-1 flex justify-between items-center group-hover:text-black transition-colors">
                                                                    {st.label}
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors ${isSelected ? `bg-${st.color}-50 text-${st.color}-600 border-${st.color}-200` : 'bg-gray-100 text-gray-500 border-transparent'}`}>
                                                                        {count}
                                                                    </span>
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                                {selectedStatusFilters.length > 0 && (
                                                    <div className="p-2 border-t border-gray-100 bg-gray-50">
                                                        <button 
                                                            onClick={() => setSelectedStatusFilters([])} 
                                                            className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-black hover:border-gray-300 transition-colors shadow-sm"
                                                        >
                                                            Limpiar Filtro
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Buscador Interno de Clientes */}
                            <div className="relative w-full lg:w-64 group shrink-0">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={16}/>
                                <input 
                                    type="text" 
                                    placeholder="Buscar cliente o teléfono..." 
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all text-sm font-medium shadow-sm" 
                                    value={clientSearchTerm} 
                                    onChange={e => setClientSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>
                    
                    {(() => {
                        // APLICAMOS EL FILTRO MÚLTIPLE EN TIEMPO REAL
                        const displayClients = currentClientsList.filter(client => {
                            if (!showArchived || selectedStatusFilters.length === 0) return true;
                            const status = client.agentStatus || 'activo';
                            return selectedStatusFilters.includes(status);
                        });

                        return displayClients.length === 0 ? (
                            <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={24} className="text-gray-300"/></div>
                                <p className="text-gray-500 font-medium text-sm">{!showArchived ? 'No tienes próximas citas agendadas.' : 'No se encontraron citas con ese filtro.'}</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                                {displayClients.map(lead => {
                                let fDate = "Sin fecha";
                                if (lead.date) {
                                    fDate = new Date(lead.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                                }
                                return (
                                    <div key={lead.id} onClick={() => setViewingLead(lead)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center group">
                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-semibold text-sm border border-gray-200 shrink-0 shadow-sm">{lead.name.charAt(0)}</div>
                                            <div className="min-w-0 flex flex-col gap-1.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className={`font-bold text-sm truncate ${showArchived ? 'text-gray-500' : 'text-gray-900'}`}>{lead.name}</h4>
                                                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold border border-blue-100 text-[10px] shrink-0"><Calendar size={10}/> {fDate}</span>
                                                    
                                                    {/* ETIQUETAS DE ESTATUS PREMIUM (Visibles en la lista) */}
                                                    {lead.agentStatus === 'vendido' && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                                                            Venta Cerrada
                                                        </span>
                                                    )}
                                                    {lead.agentStatus === 'seguimiento' && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                                                            En Seguimiento
                                                        </span>
                                                    )}
                                                    {lead.agentStatus === 'descartado' && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                                                            Descartado
                                                        </span>
                                                    )}
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
                    )
                    })()}
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
                    <div className="w-full md:w-auto max-w-[400px] bg-black/95 backdrop-blur-md text-white p-1.5 md:p-2 rounded-2xl md:rounded-full shadow-2xl flex items-center justify-between gap-2 border border-white/10 pointer-events-auto overflow-hidden transition-all">
                        {!isCheckingOut ? (
                            <>
                                <div className="flex items-center gap-2 md:gap-4 pl-3 md:pl-4">
                                    <span className="text-[11px] md:text-sm font-medium text-gray-200 whitespace-nowrap"><span className="font-bold text-white">{cart.length}</span> leads</span>
                                    <div className="w-px h-4 bg-white/20"></div>
                                    <span className="text-rose-400 font-mono font-bold text-[11px] md:text-sm flex items-center gap-1 whitespace-nowrap"><Clock size={12}/> {formatTime(timeLeft)}</span>
                                </div>
                                <button onClick={() => handleCheckout(null, null)} className="bg-white text-black px-4 md:px-6 py-2.5 rounded-xl md:rounded-full text-xs md:text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-lg">
                                    Pagar ${cartTotal} <ChevronRight size={14}/>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center justify-between w-full px-4 py-1.5 gap-4 animate-fade-in">
                                <div className="flex flex-col w-full">
                                    <span className="text-[11px] md:text-sm font-bold text-white flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                                        Redirigiendo a Stripe...
                                    </span>
                                    <span className="text-[9px] md:text-[10px] text-rose-400 font-medium mt-1">
                                        ℹ️ Termina tu compra pronto. Te quedan {Math.floor(timeLeft / 60)} min.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL DE RESEÑAS DEL AGENTE (Solo Lectura) */}
            {showReviewsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="bg-white rounded-3xl w-full max-w-md flex flex-col shadow-2xl animate-slide-up border border-gray-100 overflow-hidden relative max-h-[80vh]">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100">
                                    <Star size={20} fill="currentColor"/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">Mis Reseñas</h3>
                                    <p className="text-[10px] text-gray-500">Calificación Global: {avgRating} de 5.0</p>
                                </div>
                            </div>
                            <button onClick={() => setShowReviewsModal(false)} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-gray-500 transition-colors shadow-sm"><X size={16}/></button>
                        </div>
                        <div className="p-5 overflow-y-auto space-y-4 bg-gray-50/30">
                            {agentReviews.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <Star size={24} className="text-gray-300 mx-auto mb-2"/>
                                    <p className="text-gray-400 font-bold text-sm">Aún no tienes reseñas.</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Tus clientes recibirán el enlace pronto.</p>
                                </div>
                            ) : (
                                agentReviews.map(rev => (
                                    <div key={rev.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                                <User size={12} className="text-gray-400"/> {rev.leadName}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                {new Date(rev.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex text-amber-400 mb-2 gap-0.5">
                                            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= rev.rating ? "currentColor" : "none"} className={s <= rev.rating ? "text-amber-400" : "text-gray-200"}/>)}
                                        </div>
                                        {rev.comment && <p className="text-gray-600 text-xs italic leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">"{rev.comment}"</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AQUI RENDERIZAMOS EL MODAL DE SOPORTE */}
            {showSupportModal && <AgentSupportModal onClose={() => setShowSupportModal(false)} />}
        </div>
    );
};

const PortalLoginScreen = ({ onLogin, onOpenRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMsg, setResetMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
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
            setResetMsg('Recuperación enviada al email.');
        } catch (err) { setError('Error al enviar correo.'); }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans animate-fade-in selection:bg-rose-500 selection:text-white overflow-x-hidden">
            
            {/* CABECERA PREMIUM */}
                <header className="fixed top-0 left-0 w-full z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                        
                        {/* IZQUIERDA: LOGO */}
                        <div className="flex items-center w-[160px] sm:w-[200px] shrink-0">
                            <img 
                                src="https://imnufit.com/wp-content/uploads/2026/03/logoRedletraBlanco.png" 
                                alt="Asistente de Beneficios"
                                className="h-9 sm:h-11 w-auto object-contain opacity-95 hover:opacity-100 transition-all duration-300"
                            />
                        </div>
                
                        {/* DERECHA: BOTÓN */}
                        <button 
                            onClick={scrollToLogin} 
                            className="bg-white/10 hover:bg-white/20 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-bold border border-white/10 transition-all active:scale-95 shrink-0 whitespace-nowrap"
                        >
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
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-400 group-hover:scale-110 transition-transform"><Users size={24}/></div>
                                <div><h3 className="text-white font-bold text-base mb-1">Citas Exclusivas</h3><p className="text-xs text-gray-400 leading-relaxed">Acceso en tiempo real con clientes de alta intención.</p></div>
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
                            <p className="text-gray-400 text-sm mt-3 font-medium">Gestiona tu portafolio y escala tus ventas.</p>
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
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full p-4 pr-12 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-rose-500/50 focus:bg-white/10 focus:ring-4 focus:ring-rose-500/5 transition-all text-white placeholder:text-gray-600 font-medium" value={password} onChange={e=>setPassword(e.target.value)} required/>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
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

// --- NUEVO: COMPONENTE DE TESTIMONIOS AUTOMÁTICOS (CORREGIDO PARA MÓVILES) ---
const TestimonialsSection = () => {
    const TESTIMONIALS = [
        { name: "María González", state: "Texas", text: "Pensé que por mi edad y mi condición médica no me aceptarían. Fue un alivio descubrir que no piden examen médico. El agente resolvió todo en una sola llamada.", rating: 5 },
        { name: "José y Ana Ramírez", state: "Florida", text: "Nuestro mayor miedo era dejarle gastos a nuestros hijos el día que faltemos. Ahora pagamos una cuota pequeña y tenemos la paz mental de que no serán una carga.", rating: 5 },
        { name: "Carmen Torres", state: "California", text: "Excelente servicio y mucha empatía. Me explicaron cada detalle en español y sin presiones. Saber que mi familia estará protegida es el mejor regalo que pude darles.", rating: 5 }
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="py-8 md:py-16 bg-white w-full overflow-hidden relative">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-4 md:mb-5">
                    <Star size={12} fill="currentColor"/> Historias Reales
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-10 md:mb-12 tracking-tight text-balance">Familias que ya protegieron su futuro</h3>
                
                {/* AJUSTE DE ALTURA RESPONSIVA: Altura perfecta para móviles, iPad y PC */}
                <div className="relative min-h-[260px] sm:min-h-[240px] md:min-h-[220px]">
                    {TESTIMONIALS.map((test, idx) => (
                        <div key={idx} className={`absolute inset-0 transition-all duration-700 ease-in-out ${current === idx ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-12 pointer-events-none z-0'}`}>
                            {/* AJUSTE DE PADDING: Menos padding en móvil (p-5), normal en escritorio (md:p-8) */}
                            <div className="bg-rose-50/40 border border-rose-100 rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-sm h-full flex flex-col justify-center items-center">
                                
                                <div className="flex justify-center gap-1 mb-4 md:mb-5">
                                    {[...Array(test.rating)].map((_, i) => <Star key={i} size={16} className="text-amber-400" fill="currentColor"/>)}
                                </div>
                                
                                {/* AJUSTE DE TEXTO: Más pequeño en móvil (text-sm), mediano en tablet (md:text-base), normal en desktop (lg:text-lg) */}
                                <p className="text-gray-700 text-sm md:text-base lg:text-lg italic font-medium leading-relaxed mb-6 md:mb-8 text-balance max-w-2xl">
                                    "{test.text}"
                                </p>
                                
                                <div className="flex flex-col items-center mt-auto">
                                    <span className="font-bold text-gray-900 text-sm md:text-base">{test.name}</span>
                                    <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mt-1">{test.state}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-center gap-2 mt-8 md:mt-10">
                    {TESTIMONIALS.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrent(idx)} className={`h-2.5 rounded-full transition-all duration-300 ${current === idx ? 'bg-rose-500 w-8' : 'bg-gray-200 w-2.5 hover:bg-rose-300'}`}></button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- NUEVO: PÁGINA "QUIÉNES SOMOS" (DISEÑO WOW - BENTO GRID APPLE STYLE) ---
const AboutUsPage = ({ onClose }) => {
    return (
        <div className="min-h-screen bg-[#F5F5F7] font-sans animate-fade-in pb-20 md:pb-32 relative selection:bg-rose-500 selection:text-white">
            {/* Cabecera Flotante Premium */}
            <header className="fixed top-0 left-0 w-full z-50 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button onClick={onClose} className="px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm rounded-full transition-all flex items-center gap-2 text-gray-700 text-sm font-bold group">
                        <ArrowLeft size={18} className="text-gray-400 group-hover:text-gray-800 transition-colors shrink-0"/> 
                        <span className="hidden sm:inline">Volver</span>
                    </button>
                    <div className="flex items-center w-[150px] sm:w-[180px] shrink-0">
                        <img 
                            src="https://imnufit.com/wp-content/uploads/2026/03/lognomb1.png" 
                            alt="Asistente de Beneficios"
                            className="h-8 sm:h-10 w-auto object-contain"
                        />
                    </div>
                </div>
            </header>

            <div className="pt-32 md:pt-40 px-4 md:px-8 max-w-6xl mx-auto">
                
                {/* 1. HERO SECTION: Espectacular y limpio */}
                <div className="text-center mb-16 md:mb-24">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 tracking-tighter mb-6 leading-[1.05] text-balance">
                        Protegemos <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 bg-300% animate-gradient">
                            su legado.
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto text-balance">
                        No somos un call center. Somos la plataforma que devuelve la tranquilidad a las familias hispanas.
                    </p>
                </div>

                {/* 2. BENTO GRID: Adiós al "Documento de Word" */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                    
                    {/* Tarjeta Gigante: Nuestra Historia */}
                    <div className="md:col-span-12 bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                        <div className="absolute -top-24 -right-24 text-rose-50 opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <Heart size={400} fill="currentColor" strokeWidth={0}/>
                        </div>
                        <div className="relative z-10 max-w-4xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">
                                <Activity size={14} className="text-rose-500"/> El Origen
                            </div>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight md:leading-tight mb-8 text-balance">
                                Ninguna familia debería enfrentar el dolor de una pérdida sumándole la angustia de las deudas.
                            </h2>
                            <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed md:leading-relaxed text-balance">
                                Sabemos que hablar del futuro y de los gastos finales no es fácil. A menudo está lleno de tabúes, miedos y mucha desinformación. Creamos Asistente de Beneficios para transformar un proceso que antes era confuso e invasivo, en un acto de amor claro, seguro y desde la comodidad de su hogar.
                            </p>
                        </div>
                    </div>

                    {/* Tarjeta Izquierda: Qué Hacemos */}
                    <div className="md:col-span-7 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner"><Users size={28}/></div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 tracking-tight">Especialistas a su medida.</h3>
                        <p className="text-gray-500 text-lg leading-relaxed font-medium">
                            Somos una plataforma tecnológica y humana que conecta a familias de todo el país con <strong>especialistas certificados</strong> en gastos finales. Evaluamos su situación en minutos, sin exámenes médicos, y le conectamos con pólizas respaldadas por las aseguradoras más sólidas de EE.UU.
                        </p>
                    </div>

                    {/* Tarjeta Derecha: El Control */}
                    <div className="md:col-span-5 bg-gradient-to-br from-gray-900 to-black text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-8 border border-white/20"><Settings size={28}/></div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight text-white">Usted tienes el control absoluto.</h3>
                        <p className="text-gray-400 text-lg leading-relaxed font-medium">
                            No hacemos llamadas frías. Usted decide cómo, cuándo y con quién hablar. Sin letras pequeñas, sin sorpresas.
                        </p>
                    </div>
                </div>

                {/* 3. GRID DE VALORES (Elegante y Visual) */}
                <div className="mt-24 md:mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Nuestros Pilares</h2>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Pilar 1 */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Heart size={24}/></div>
                            <h4 className="font-bold text-xl text-gray-900 mb-3">Empatía Pura</h4>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">No tratamos con números, sino con familias y legados. Escuchamos sin juzgar ni presionar.</p>
                        </div>
                        {/* Pilar 2 */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Search size={24}/></div>
                            <h4 className="font-bold text-xl text-gray-900 mb-3">Transparencia</h4>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">Cero letras pequeñas. Sabrá exactamente qué cubre su plan y garantizamos que su cuota nunca subirá.</p>
                        </div>
                        {/* Pilar 3 */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Lock size={24}/></div>
                            <h4 className="font-bold text-xl text-gray-900 mb-3">Privacidad</h4>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">Su confianza lo es todo. Usamos encriptación para que sus datos estén 100% blindados.</p>
                        </div>
                        {/* Pilar 4 */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Activity size={24}/></div>
                            <h4 className="font-bold text-xl text-gray-900 mb-3">Humano</h4>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">La tecnología agiliza el proceso, pero siempre pondremos a un experto de carne y hueso frente a usted.</p>
                        </div>
                    </div>
                </div>

                {/* 4. CIERRE ÉPICO */}
                <div className="mt-24 md:mt-32">
                    <div className="bg-white p-10 md:p-20 rounded-[3rem] text-center border border-gray-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-rose-400/20 rounded-full blur-[80px]"></div>
                        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]"></div>
                        
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <p className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-snug md:leading-snug mb-8 tracking-tight">
                                "Creemos que el mejor regalo que le puede dejar a los suyos no es una cuenta bancaria, sino la paz mental de saber que todo está resuelto."
                            </p>
                            <p className="text-rose-600 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                                Nosotros estamos aquí para ayudarle a sellar esa promesa.
                            </p>
                            <button onClick={onClose} className="mt-12 bg-black text-white px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                                <ChevronLeft size={16}/> Volver a pagína principal
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- NUEVA PANTALLA: EVALUACIÓN DEL AGENTE POR EL CLIENTE ---
const ClientReviewScreen = ({ leadId, db }) => {
    const [lead, setLead] = useState(null);
    const [agent, setAgent] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                const leadDoc = await getDoc(doc(db, 'leads', leadId));

                if (!leadDoc.exists()) {
                    setStatus('error');
                    setErrorMessage('El ID del prospecto no existe en la base de datos.');
                    return;
                }

                const leadData = { id: leadDoc.id, ...leadDoc.data() };

                if (leadData.reviewed) {
                    setStatus('already_submitted');
                    return;
                }

                if (!leadData.assignedTo) {
                    setStatus('error');
                    setErrorMessage('El prospecto no tiene ningún agente asignado.');
                    return;
                }

                const agentDoc = await getDoc(doc(db, 'agents', leadData.assignedTo));

                if (!agentDoc.exists()) {
                    setStatus('error');
                    setErrorMessage('El agente asignado a este prospecto ya no existe.');
                    return;
                }

                setLead(leadData);
                setAgent({ id: agentDoc.id, ...agentDoc.data() });
                setStatus('ready');
            } catch (e) {
                setStatus('error');
                setErrorMessage(`Error al cargar la evaluación: ${e.message}`);
            }
        };

        fetchReviewData();
    }, [leadId, db]);

    const handleSubmit = async () => {
        if (rating === 0) return;

        setStatus('submitting');

        try {
            await addDoc(collection(db, 'reviews'), {
                agentId: agent.id,
                leadId: lead.id,
                leadName: lead.name || '',
                rating: Number(rating),
                comment: comment || '',
                timestamp: Date.now()
            });

            await updateDoc(doc(db, 'leads', lead.id), {
                reviewed: true
            });

            setStatus('submitted');
        } catch (e) {
            setStatus('error');
            setErrorMessage(`Error al guardar la evaluación: ${e.message}`);
        }
    };

    if (status === 'loading' || status === 'submitting') {
        return (
            <div className="min-h-[100dvh] bg-[#F5F5F7] flex flex-col items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold">
                    {status === 'loading' ? 'Preparando evaluación...' : 'Enviando...'}
                </p>
            </div>
        );
    }

    if (status === 'already_submitted') {
        return (
            <div className="min-h-[100dvh] bg-[#F5F5F7] flex flex-col items-center justify-center font-sans p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluación Recibida</h2>
                <p className="text-gray-500">Ya ha calificado a su especialista anteriormente. ¡Gracias por su tiempo!</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[100dvh] bg-[#F5F5F7] flex flex-col items-center justify-center font-sans p-6 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <X size={40} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace no válido</h2>
                <p className="text-gray-500 mb-6">Este enlace de evaluación ya no está disponible o es incorrecto.</p>

                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-mono text-left max-w-md w-full border border-red-200 shadow-inner">
                    <span className="font-bold uppercase tracking-widest text-[10px] block mb-1">Diagnóstico del Sistema:</span>
                    {errorMessage}
                </div>
            </div>
        );
    }

    if (status === 'submitted') {
        return (
            <div className="min-h-[100dvh] bg-[#F5F5F7] flex flex-col items-center justify-center font-sans p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-green-500/20">
                    <Star size={48} className="text-white" fill="currentColor" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">¡Muchas Gracias!</h2>
                <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
                    Su opinión nos ayuda a mantener el nivel de excelencia que su familia merece.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#F5F5F7] flex flex-col font-sans p-4 sm:p-8 animate-fade-in">
            <div className="w-full max-w-lg mx-auto bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-gray-100 mt-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-50 to-white pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500 mb-6 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                        Su opinión es valiosa
                    </span>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 text-balance">
                        ¿Cómo fue su experiencia?
                    </h2>

                    <p className="text-gray-500 text-sm mb-8">
                        Por favor evalúe la atención que recibió de su especialista asignado.
                    </p>

                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
                        {agent.photo ? (
                            <img src={agent.photo} className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-gray-400" />
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 mb-6">Especialista Licenciado</p>

                    {/* INSTRUCCIÓN CLARA PARA ADULTOS MAYORES */}
                    <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-full mb-5 shadow-sm animate-pulse">
                        <p className="text-xs sm:text-sm font-extrabold text-amber-700 tracking-wide flex items-center gap-2">
                            👇 Elija entre 1 a 5 estrellas.
                        </p>
                    </div>

                    <div className="flex gap-2 sm:gap-3 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                            >
                                <Star
                                    size={40}
                                    className={`transition-colors duration-300 ${star <= (hoverRating || rating) ? 'text-amber-400' : 'text-gray-200'}`}
                                    fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="w-full text-left mb-8">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">
                            Déjenos un mensaje (Opcional)
                        </label>
                        <textarea
                            rows="3"
                            placeholder="Excelente atención, muy paciente..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 transition-all text-sm text-gray-800 resize-none"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="w-full bg-black text-white py-4 sm:py-5 rounded-2xl font-bold text-base shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        <Check size={20} /> Enviar Calificación
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE DE ACTIVACIÓN SIMPLIFICADO (CAMINO 1 Y 2) ---
const AgentActivationScreen = ({ activationEmail, db, auth }) => {
    const [status, setStatus] = useState('loading'); 
    const [targetAgent, setTargetAgent] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Buscamos al agente en tu lista de equipo
                const q = query(collection(db, 'agents'), where('email', '==', activationEmail.toLowerCase()));
                const snap = await getDocs(q);
                
                if (snap.empty) {
                    setStatus('not_found');
                    return;
                }
                
                const agentData = { id: snap.docs[0].id, ...snap.docs[0].data() };
                setTargetAgent(agentData);

                // Verificamos si ya existe en la bóveda de contraseñas de Google
                try {
                    const methods = await fetchSignInMethodsForEmail(auth, activationEmail.toLowerCase());
                    if (methods.length > 0) {
                        setStatus('returning'); // CAMINO 2: YA TIENE CUENTA
                    } else {
                        setStatus('new'); // CAMINO 1: 100% NUEVO
                    }
                } catch (e) {
                    setStatus('new'); // Si Google bloquea la verificación, asumimos nuevo y el "catch" del registro hará el resto
                }
            } catch (e) {
                setStatus('not_found');
            }
        };
        checkStatus();
    }, [activationEmail, db, auth]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-white/10 border-t-rose-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">Validando invitación...</p>
            </div>
        );
    }

    // --- CAMINO 2: AGENTE QUE YA EXISTÍA (MENSAJE ELEGANTE) ---
    if (status === 'returning') {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-sans px-4 text-center animate-fade-in">
                <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 w-full max-w-md backdrop-blur-xl shadow-2xl">
                    <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-inner">
                        <BadgeCheck size={36}/>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">¡Bienvenido de vuelta!</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        Este correo ya cuenta con credenciales registradas en nuestro sistema. Puedes acceder a tu portal directamente.
                    </p>
                    <button onClick={() => window.location.hash = '#portal'} className="w-full bg-white text-black py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all shadow-lg">
                        Ir al Login
                    </button>
                </div>
            </div>
        );
    }

    // --- CAMINO 1: AGENTE NUEVO (FORMULARIO NORMAL) ---
    if (status === 'new') {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-sans px-4 text-center animate-fade-in">
                <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 w-full max-w-md backdrop-blur-xl shadow-2xl">
                    <div className="w-20 h-20 bg-rose-500/10 text-rose-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-inner">
                        <Lock size={36}/>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Crea tu contraseña</h2>
                    <p className="text-gray-400 text-sm mb-8 font-medium">Configura tu acceso al portal de agentes.</p>
                    
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const p1 = e.target.p1.value;
                        const p2 = e.target.p2.value;
                        if (p1 !== p2) { alert('Las contraseñas no coinciden'); return; }
                        
                        setIsSubmitting(true);
                        try {
                            // 1. Crear cuenta
                            await createUserWithEmailAndPassword(auth, activationEmail, p1);
                            // 2. Sellar ficha en base de datos
                            await updateDoc(doc(db, 'agents', targetAgent.id), { isActivated: true });
                            
                            localStorage.setItem('isAdminLoggedIn', 'true');
                            window.location.hash = '#portal';
                            window.location.reload();
                        } catch (error) {
                            setIsSubmitting(false);
                            if (error.code === 'auth/email-already-in-use') {
                                setStatus('returning'); // Si choca, saltamos al mensaje elegante
                            } else {
                                alert("Error: " + error.message);
                            }
                        }
                    }} className="space-y-4 text-left">
                        <input name="p1" type="password" required placeholder="Contraseña nueva" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-rose-500/50 transition-all" disabled={isSubmitting} />
                        <input name="p2" type="password" required placeholder="Confirmar contraseña" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-rose-500/50 transition-all" disabled={isSubmitting} />
                        <button type="submit" disabled={isSubmitting} className="w-full bg-rose-600 text-white py-5 rounded-2xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Procesando...</> : 'Activar mi cuenta'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Pantalla para correos no encontrados
    return (
        <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-center">
             <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 max-w-sm">
                <X size={40} className="mx-auto text-gray-500 mb-4"/>
                <h2 className="text-white font-bold text-xl">Acceso no válido</h2>
                <p className="text-gray-400 text-sm mt-2">No tienes una invitación pendiente o el correo no coincide.</p>
                <button onClick={() => window.location.hash = '#portal'} className="mt-6 text-rose-500 font-bold text-sm">Ir al inicio</button>
             </div>
        </div>
    );
};

// --- NUEVA PANTALLA: RECUPERACIÓN DE CONTRASEÑA PREMIUM ---
const PasswordRecoveryScreen = ({ auth }) => {
    const [status, setStatus] = useState('verifying'); // verifying, ready, success, error
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const match = window.location.href.match(/[?&]oobCode=([^&]+)/);
    const oobCode = match ? match[1] : null;

    useEffect(() => {
        if (!oobCode) {
            setStatus('error');
            return;
        }
        verifyPasswordResetCode(auth, oobCode).then((userEmail) => {
            setEmail(userEmail);
            setStatus('ready');
        }).catch(e => {
            setStatus('error');
        });
    }, [oobCode, auth]);

    const handleReset = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (newPassword !== confirmPassword) { setErrorMsg('Las contraseñas no coinciden.'); return; }
        if (newPassword.length < 6) { setErrorMsg('La contraseña debe tener al menos 6 caracteres.'); return; }

        try {
            const btn = document.getElementById('btn-reset');
            btn.innerHTML = 'Actualizando credenciales...';
            btn.disabled = true;

            await confirmPasswordReset(auth, oobCode, newPassword);
            
            setStatus('success');
            setTimeout(() => {
                // Limpiamos el código de la URL antes de recargar para que no choque
                window.history.replaceState(null, '', window.location.pathname + '#portal');
                window.location.reload();
            }, 2000);
        } catch (error) {
            setErrorMsg('El enlace ha expirado o ya fue utilizado.');
            document.getElementById('btn-reset').innerHTML = 'Actualizar Contraseña';
            document.getElementById('btn-reset').disabled = false;
        }
    };

    if (status === 'verifying') {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-sans">
                <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">Validando Seguridad...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-sans px-4 text-center animate-fade-in relative overflow-hidden">
                <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 w-full max-w-md backdrop-blur-xl shadow-2xl relative z-10">
                    <div className="w-20 h-20 bg-red-500/10 text-red-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-inner"><X size={36}/></div>
                    <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Enlace Inválido</h2>
                    <p className="text-gray-400 text-sm mb-8 font-medium leading-relaxed">Este enlace de recuperación ha expirado o ya fue utilizado. Solicita uno nuevo desde el Login.</p>
                    <button onClick={() => { window.location.href = window.location.origin + window.location.pathname + '#portal'; window.location.reload(); }} className="w-full bg-white/10 text-white py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-colors">Volver al Login</button>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-sans px-4 text-center animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20"><Check size={40} strokeWidth={3}/></div>
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">¡Contraseña Actualizada!</h2>
                <p className="text-green-400 text-sm font-medium">Redirigiendo al portal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center font-sans px-4 text-center animate-fade-in relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 w-full max-w-md backdrop-blur-xl shadow-2xl relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-inner"><Lock size={36}/></div>
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Nueva Contraseña</h2>
                <p className="text-gray-400 text-sm mb-2 font-medium">Restableciendo acceso para:</p>
                <div className="inline-block bg-white/10 px-4 py-1.5 rounded-full text-blue-300 text-[11px] font-mono tracking-widest mb-8 border border-white/5">{email}</div>

                <form onSubmit={handleReset} className="space-y-4 text-left">
                    <div>
                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] ml-1 mb-2">Nueva contraseña</label>
                        <input type="password" required placeholder="Mínimo 6 caracteres" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-600" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] ml-1 mb-2">Confirmar contraseña</label>
                        <input type="password" required placeholder="Repite tu contraseña" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-600" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
                    </div>
                    {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] font-bold text-center">{errorMsg}</div>}
                    <button id="btn-reset" type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-5 rounded-2xl font-bold hover:scale-[1.02] transition-all mt-4">Actualizar Contraseña</button>
                </form>
            </div>
        </div>
    );
};

// --- NUEVO COMPONENTE: FLUJO MINIMALISTA (AJUSTADO) ---
const ProcessFlow = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeSteps, setActiveSteps] = useState([]);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                    
                    // Secuencia de animación de los nodos
                    const timer1 = setTimeout(() => setActiveSteps(prev => [...prev, 0]), 400);
                    const timer2 = setTimeout(() => setActiveSteps(prev => [...prev, 1]), 1000);
                    const timer3 = setTimeout(() => setActiveSteps(prev => [...prev, 2]), 1600);
                    const timer4 = setTimeout(() => setActiveSteps(prev => [...prev, 3]), 2200);

                    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
                }
            });
        }, { threshold: 0.35 });

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, [isVisible]);

    const steps = [
        { title: "Usted elige sus preferencias", icon: Check },
        { title: "Programa una breve llamada", icon: CalendarDays },
        { title: "Nuestro agente le ofrece las mejores opciones", icon: User },
        { title: "Califica nuestro servicio", icon: Star }
    ];

    return (
        <div ref={sectionRef} className="w-full py-8 flex flex-col items-center justify-center">
            
            {/* Título Minimalista (Reducido) */}
            <div className={`text-center mb-8 md:mb-12 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">Un camino, simplificado.</h3>
            </div>

            {/* Contenedor del Flujo */}
            <div className="relative w-full max-w-3xl mx-auto px-4 md:px-0">
                
                {/* LÍNEAS DE PROGRESO */}
                {/* Línea Base Gris */}
                <div className="absolute left-[31px] md:left-[10%] top-0 md:top-[23px] bottom-0 md:bottom-auto w-[2px] md:w-[80%] md:h-[2px] bg-gray-200 rounded-full z-0"></div>
                
                {/* Línea Animada Azul */}
                <div 
                    className="absolute left-[31px] md:left-[10%] top-0 md:top-[23px] bg-gradient-to-r from-blue-400 to-blue-600 rounded-full z-10 transition-all ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                    style={{
                        width: window.innerWidth >= 768 ? (isVisible ? '80%' : '0%') : '2px',
                        height: window.innerWidth < 768 ? (isVisible ? '100%' : '0%') : '2px',
                        transitionDuration: '2.5s'
                    }}
                ></div>

                {/* NODOS */}
                <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
                    {steps.map((step, idx) => {
                        const isActive = activeSteps.includes(idx);
                        const Icon = step.icon;

                        return (
                            <div key={idx} className={`flex flex-row md:flex-col items-center gap-4 md:gap-3 w-full md:w-auto md:w-1/4 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${idx * 200}ms` }}>
                                
                                {/* Icono circular (Más pequeño) */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 bg-white relative ${isActive ? 'border-blue-600 shadow-md scale-105' : 'border-gray-200 shadow-sm'}`}>
                                    <Icon size={20} className={`transition-colors duration-500 ${isActive ? 'text-blue-600' : 'text-gray-300'}`} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                
                                {/* Texto (Más pequeño) */}
                                <span className={`text-sm md:text-xs tracking-wide md:text-center leading-tight transition-colors duration-500 ${isActive ? 'text-gray-800 font-bold' : 'text-gray-400 font-medium'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mensaje de Control Inferior */}
            <div className={`mt-10 md:mt-14 text-center transition-all duration-1000 delay-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 text-xs md:text-sm text-gray-500 shadow-sm transition-transform duration-300 hover:scale-105">
                    <ShieldCheck className="text-blue-500" size={16} />
                    <span className="font-medium tracking-wide">Sin presiones. Usted tiene el control total.</span>
                </div>
            </div>

        </div>
    );
};

const App = () => {
    // --- META PIXEL ANDROMEDA LOADER ---
    useEffect(() => {
        !(function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1654543972543555'); // <-- REEMPLAZA CON TU ID REAL
        fbq('track', 'PageView');
    }, []);
    // --- FAVICON DINÁMICO ---
    useEffect(() => {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = 'https://imnufit.com/wp-content/uploads/2026/03/log5.png';
        document.title = 'Asistente de Beneficios';
    }, []);

    // --- MENU Y MODALES GLOBALES ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProspectTermsFromMenu, setShowProspectTermsFromMenu] = useState(false);
    const [showContactUsModal, setShowContactUsModal] = useState(false);

    // --- MEMORIA DEL EMBUDO ---
    const [stepIndex, setStepIndex] = useState(() => {
        // NUEVO: Detector de enlaces directos para campañas de Meta Ads
        const isDirectCampaign = window.location.href.toLowerCase().includes('proteger');
        
        const savedStep = sessionStorage.getItem('funnelStepIndex');
        const parsedSavedStep = savedStep !== null ? parseInt(savedStep, 10) : 0;
        
        // Si el enlace tiene la palabra clave y es una sesión nueva, salta al paso 1
        if (isDirectCampaign && parsedSavedStep === 0) {
            return 1; 
        }
        
        return parsedSavedStep;
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
    const [showAboutUs, setShowAboutUs] = useState(false);

    // --- GUARDAR EN TIEMPO REAL ---
    useEffect(() => {
        sessionStorage.setItem('funnelStepIndex', stepIndex.toString());
        sessionStorage.setItem('funnelLeadData', JSON.stringify(leadData));
    }, [stepIndex, leadData]);
    
    // --- NUEVO: Estado de verificación para evitar el pestañeo ---
    const [isVerifying, setIsVerifying] = useState(true); 
    
    // --- RUTAS INTELIGENTES ---
    const [isPortalRoute, setIsPortalRoute] = useState(window.location.hash === '#portal' || window.location.hostname.startsWith('portal.'));
    const [isReviewRoute, setIsReviewRoute] = useState(window.location.hash.startsWith('#evaluar/'));
    const [isActivationRoute, setIsActivationRoute] = useState(window.location.hash.startsWith('#activar/'));
    const [isRecoveryRoute, setIsRecoveryRoute] = useState(window.location.hash.startsWith('#recuperar') || window.location.href.includes('mode=resetPassword'));
    
    const reviewLeadId = isReviewRoute ? window.location.hash.split('/')[1] : null;
    const activationEmail = isActivationRoute ? decodeURIComponent(window.location.hash.split('/')[1]) : null;

    useEffect(() => {
        if (window.location.hostname.startsWith('portal.')) setIsPortalRoute(true);

        const handleHashChange = () => {
            setIsPortalRoute(window.location.hash === '#portal' || window.location.hostname.startsWith('portal.'));
            setIsReviewRoute(window.location.hash.startsWith('#evaluar/'));
            setIsActivationRoute(window.location.hash.startsWith('#activar/'));
            setIsRecoveryRoute(window.location.hash.startsWith('#recuperar') || window.location.href.includes('mode=resetPassword'));
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
    const { leads, agents, agentRequests, reviews, schedule, webhooks, generalSettings, user, bookedSlots, addLead, updateLead, bulkUpdateLeads, bulkDeleteLeads, deleteLead, deleteReview, saveAgent, deleteAgent, approveAgentRequest, rejectAgentRequest, updateAgentRequest, updateSchedule, updateWebhooks, updateGeneralSettings, adminLogin, adminLogout } = useFirebaseDatabase();
    const currentStep = STEPS[stepIndex];


    // --- LIMPIEZA AUTOMÁTICA: ARCHIVADO Y OFERTAS EXPIRADAS ---
    useEffect(() => {
        if (!leads || leads.length === 0 || !bulkUpdateLeads) return;
        
        const checkExpirations = () => {
            const now = Date.now();
            
            // 1. AUTO-ARCHIVADO DE CITAS PASADAS (Con margen de gracia de 2 horas)
            const GRACE_PERIOD = 7200000; 
            const toArchive = leads.filter(l => {
                if (l.status === 'archived' || !l.date || !l.time) return false;
                const timeInfo = getAgentLocalDateTime(l.date, l.time, l.state);
                return timeInfo && (timeInfo.localMs + GRACE_PERIOD) < now;
            }).map(l => l.id);

            if (toArchive.length > 0) {
                bulkUpdateLeads(toArchive, { status: 'archived' });
            }

            // 2. AUTO-CANCELACIÓN DE OFERTAS EXPIRADAS
            const expiredOffers = leads.filter(l => {
                // Buscamos leads que estén pendientes de pago y cuya fecha de expiración ya pasó
                return l.status === 'pending_payment' && l.offer && l.offer.expiresAt && l.offer.expiresAt <= now;
            }).map(l => l.id);

            if (expiredOffers.length > 0) {
                // Las devolvemos a la bandeja principal ("new") y limpiamos el rastro de la oferta
                bulkUpdateLeads(expiredOffers, { 
                    status: 'new', 
                    offer: null,
                    lockedBy: null,
                    lockedAt: null
                });
            }
        };

        checkExpirations();
        const interval = setInterval(checkExpirations, 60000); // Revisa silenciosamente cada 60 segundos
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
        const res = await addLead(finalData); 
        if (res === "SLOT_TAKEN") return "SLOT_TAKEN";
        
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
                    age: finalData.age || 'No especificada',
                    date: formattedDate,
                    callType: callTypeMap[finalData.callType] || finalData.callType,
                    policy_for: translatedPolicy,
                    motivation: translatedMotivation,
                    coverage_amount: formattedCoverage
                };

                // Enviamos los datos al Webhook Maestro con su etiqueta
                const url = webhooks?.master || webhooks?.telegram;
                if (url) {
                    fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            evento: 'nuevo_prospecto',
                            datos: { lead: webhookPayload, agent: null } // Cajas estandarizadas
                        })
                    }).catch(e => console.error("Fetch de prospecto fallido", e));
                }
            } catch (err) { 
                console.error("Error procesando los datos para el Webhook:", err); 
            }
        }
    };
    const completeSuccess = () => { 
        setIsSuccess(true); 
        sessionStorage.removeItem('funnelStepIndex');
        sessionStorage.removeItem('funnelLeadData');

        // 🔥 SEÑAL PARA ANDROMEDA (META ADS)
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'Asesoría Gastos Finales',
            content_category: 'Seguros',
            // Enviamos el estado para que Andromeda aprenda en qué regiones conviertes mejor
            address_state: leadData.state || 'Unknown', 
            value: 0.00, // Puedes asignar un valor estimado si quieres
            currency: 'USD'
        });
    }
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
        sessionStorage.removeItem('adminShowSettings'); // Limpiamos la memoria de la tuerca
        // Obligamos al navegador a quedarse en la ruta del portal al salir
        window.location.hash = '#portal';
    };

    // RENDERIZADO DE RECUPERACIÓN DE CONTRASEÑA
    if (isRecoveryRoute) {
        return <PasswordRecoveryScreen auth={auth} />;
    }

    // RENDERIZADO DE RUTA DE EVALUACIÓN (Prioridad Absoluta)
    if (isReviewRoute && reviewLeadId) {
        return <ClientReviewScreen leadId={reviewLeadId} db={db} />;
    }

    // --- RENDERIZADO DE ACTIVACIÓN DE AGENTES ---
    if (isActivationRoute && activationEmail) {
        return <AgentActivationScreen activationEmail={activationEmail} db={db} auth={auth} />;
    }

   if (isPortalRoute && !showAdmin) {
        if (showRegister) {
            if (generalSettings?.acceptingAgents === false) {
                return <RegistrationClosedModal onClose={() => setShowRegister(false)} />;
            }
            return (
                <div className="min-h-screen bg-[#F5F5F7]">
                        <AgentRegistrationForm
                            generalSettings={generalSettings}
                            onCancel={() => setShowRegister(false)}
                            onSubmit={async (data) => {
                                try {
                                    // Quitamos el ID vacío para que Firebase no se moleste y cree uno nuevo
                                    const { id, ...datosLimpios } = data;
                                    await addDoc(collection(db, 'agent_requests'), { ...datosLimpios, status: 'pending', timestamp: Date.now() }); 
                                    
                                    // Disparo al Webhook Maestro: Nuevo Agente
                                    const url = webhooks?.master || webhooks?.telegram;
                                    if (url) {
                                        fetch(url, {
                                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ 
                                                evento: 'nuevo_agente', 
                                                datos: { lead: null, agent: datosLimpios } 
                                            })
                                        }).catch(e => console.error("Error Webhook Agente:", e));
                                    }
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
            return <AgentPortal leads={leads} agent={currentAgent} reviews={reviews} onUpdateLead={updateLead} onLogout={handleLogout} generalSettings={generalSettings} webhooks={webhooks} />;
        }

        if (isSuperAdmin) {
            return (
                <AdminDashboard 
                    leads={leads} 
                    agents={agents} 
                    agentRequests={agentRequests}
                    reviews={reviews}
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
                    onDeleteReview={deleteReview} 
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
        if (generalSettings?.acceptingAgents === false) {
            return <RegistrationClosedModal onClose={() => setShowAgentFormFromHome(false)} />;
        }
        return (
            <AgentRegistrationForm 
                generalSettings={generalSettings}
                onCancel={() => setShowAgentFormFromHome(false)} 
                onSubmit={async (data) => {
                    try {
                        const { id, ...datosLimpios } = data;
                        await addDoc(collection(db, 'agent_requests'), { ...datosLimpios, status: 'pending', timestamp: Date.now() }); 
                        
                        // Disparo al Webhook Maestro: Nuevo Agente
                        const url = webhooks?.master || webhooks?.telegram;
                        if (url) {
                            fetch(url, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ evento: 'nuevo_agente', datos: { lead: null, agent: datosLimpios } })
                            }).catch(e => console.error("Error Webhook Agente:", e));
                        }
                    } catch (e) { 
                        console.error("Error crítico de guardado:", e); 
                        throw e; 
                    }
                }}
            />
        );
    }

// --- PANTALLA: QUIÉNES SOMOS ---
    if (showAboutUs) {
        return <AboutUsPage onClose={() => setShowAboutUs(false)} />;
    }                                                                   
                                                                   
    if (stepIndex === 0) return (
        <div className="min-h-[100dvh] w-full flex flex-col bg-white overflow-y-auto font-sans relative">
            {/* CABECERA PÁGINA PRINCIPAL Y MENÚ */}
            <header className="fixed top-0 left-0 w-full z-[100] bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
                    
                    {/* IZQUIERDA: SOLO LOGO SIN MOVER LA CABECERA */}
                    <div className="flex items-center w-[180px] md:w-[220px] shrink-0 overflow-hidden">
                        <div className="flex items-center h-10 md:h-12">
                            <img
                                src="https://imnufit.com/wp-content/uploads/2026/03/lognomb1.png"
                                alt="Asistente de Beneficios"
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </div>
                    
                    {/* DERECHA: BOTÓN MENÚ */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 text-gray-700 hover:text-rose-600 transition-colors group shrink-0 outline-none">
                        <span className="text-xs font-bold uppercase tracking-widest hidden sm:block mt-0.5 group-hover:text-rose-600 transition-colors">MENÚ</span>
                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-rose-50 group-hover:border-rose-200 transition-colors shadow-sm shrink-0">
                            {/* Solución: size estricto en los iconos del menú */}
                            {isMenuOpen ? <X size={20} className="text-rose-600" /> : <Menu size={20} />}
                        </div>
                    </button>

                    {/* DROPDOWN MENU */}
                    {isMenuOpen && (
                        <>
                            {/* Fondo oscuro para cerrar al hacer clic afuera */}
                            <div className="fixed inset-0 top-16 md:top-20 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)}></div>
                            
                            {/* Cuadro del menú flotante */}
                            <div className="absolute top-[4.5rem] md:top-[5.5rem] right-4 md:right-8 w-[260px] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up flex flex-col p-2">
                                <button onClick={() => { setShowAboutUs(true); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-colors text-left w-full group">
                                    <HelpCircle size={18} className="text-rose-500 shrink-0 group-hover:scale-110 transition-transform" /> Quiénes somos
                                </button>
                                <button onClick={() => { setShowProspectTermsFromMenu(true); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-colors text-left w-full group">
                                    <FileText size={18} className="text-gray-400 shrink-0 group-hover:scale-110 transition-transform" /> Términos y Condiciones
                                </button>
                                <button onClick={() => { setShowAgentFormFromHome(true); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-colors text-left w-full group">
                                    <UserPlus size={18} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform" /> Únete al equipo
                                </button>
                                <button onClick={() => { setShowContactUsModal(true); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-colors text-left w-full group">
                                    <Mail size={18} className="text-green-500 shrink-0 group-hover:scale-110 transition-transform" /> Contáctenos
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>
            
            {/* Hero Section con Imágenes */}
            <div className="relative pt-32 pb-16 px-6 lg:px-12 bg-gradient-to-b from-rose-50/50 via-white to-white overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Text Content */}
                    <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 pt-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight text-balance leading-[1.1]">
                            Proteja el futuro de <span className="text-rose-600">quienes más ama</span>
                        </h1>
                        <p className="text-gray-500 mb-10 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
                            Planifique hoy para evitar preocupaciones financieras mañana. Descubra si califica para un seguro de gastos finales y dele a su familia la tranquilidad que merecen.
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

            {/* SECCIÓN DE TESTIMONIOS */}
            <TestimonialsSection />

            {/* Trust Grid */}
            <div className="py-12 md:py-24 px-6 max-w-7xl mx-auto w-full">
                <div className="text-center mb-12 md:mb-20">
                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">¿Por qué confiar en nosotros?</h2>
                    <p className="text-gray-500 text-base md:text-xl max-w-2xl mx-auto font-medium">Una experiencia diseñada para su tranquilidad. Sin letras pequeñas, sin presiones.</p>
                </div>

                {/* --- NUEVO: FLUJO INSERTADO AQUÍ (Márgenes ajustados) --- */}
                <div className="mb-12 md:mb-16">
                    <ProcessFlow />
                </div>
                {/* ------------------------------------------------------- */}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><Settings size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">Usted Tiene el Control</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">No hacemos llamadas inesperadas ni visitas repentinas a su hogar. Usted decide cuándo y cómo hablar con nosotros.</p>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><ShieldCheck size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">100% Seguro y Privado</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">Su privacidad está garantizada. Sus datos están encriptados y nunca venderemos su información a terceros.</p>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><BadgeCheck size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">Agentes Licenciados</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">Será atendido exclusivamente por profesionales certificados y con licencia oficial en su estado de residencia.</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><Star size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">Compañías Acreditadas</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed">Le conectamos únicamente con aseguradoras de primer nivel, sólidas financieramente y acreditadas por el BBB.</p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-2">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-5 md:mb-6"><Clock size={28}/></div>
                        <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">Proceso Transparente</h3>
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-2xl">Programe su cita en menos de 2 minutos. Muchas de las pólizas no requieren examen médico y ofrecen cobertura inmediata desde el primer día.</p>
                    </div>
                </div>

                {/* Image Call to Action Final */}
                <div className="mt-20 md:mt-32 relative rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto w-full group">
                    <img src="https://imnufit.com/wp-content/uploads/2026/03/Gemini_Generated_Image_jhi98yjhi98yjhi9-scaled.png" alt="Cuidado y tranquilidad familiar" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent"></div>
                    <div className="relative z-10 p-8 md:p-20 text-left max-w-3xl">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">El mejor regalo es la <span className="text-rose-400">tranquilidad</span></h2>
                        <p className="text-gray-300 mb-10 text-base md:text-xl font-medium leading-relaxed max-w-xl">No deje para mañana la seguridad de los que más ama hoy. Averigue sus opciones de forma gratuita, segura y sin compromisos.</p>
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
            
            {/* Modal de Términos (Llamado desde el menú) */}
            {showProspectTermsFromMenu && <TermsModal type="prospect" onClose={() => setShowProspectTermsFromMenu(false)} />}
            {/* Modal de Contacto (Llamado desde el menú) */}
            {showContactUsModal && <ContactUsModal onClose={() => setShowContactUsModal(false)} />}
        </div>
    );
    return (
        <div className="min-h-[100dvh] w-full flex flex-col bg-[#FAFAFA] relative">
        
            {reinforcement && (<div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-immediate-red text-white text-center"><div className="mb-6 bg-white/20 p-6 rounded-full backdrop-blur-sm border border-white/30"><reinforcement.icon size={48} fill="currentColor" className="text-white" /></div><h2 className="text-3xl font-bold mb-4">{reinforcement.title}</h2><p className="text-lg leading-relaxed opacity-90 mb-10 max-w-sm">"{reinforcement.text}"</p><button onClick={next} className="bg-white text-rose-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-2">Continuar <ChevronRight size={20} /></button></div>)}
            
            <div className={`pt-8 pb-4 px-6 flex flex-col items-center shrink-0 ${currentStep.isLetter || isSuccess ? 'opacity-0 h-0 overflow-hidden pt-0 pb-0' : ''} transition-all duration-500`}><HeartProgress percentage={fillPercent} isBeating={false} /></div>
            
            <div className="w-full max-w-xl mx-auto flex flex-col flex-1">
                <div key={stepIndex} className="flex-1 px-4 md:px-6 pb-12 flex flex-col animate-slide-up">
                    {currentStep.isForm ? <ContactForm onSubmit={saveData} onSuccess={completeSuccess} data={leadData} scheduleConfig={schedule} onAdminTrigger={() => setShowLogin(true)} generalSettings={generalSettings} bookedSlots={bookedSlots} /> : currentStep.isFAQ ? <FAQStep options={currentStep.faqOptions} onContinue={() => { setLeadData(p => ({ ...p, userQuestion: "Vio FAQ" })); next(); }} /> : currentStep.isLetter ? <LetterStep data={leadData} onContinue={next} /> : (
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
