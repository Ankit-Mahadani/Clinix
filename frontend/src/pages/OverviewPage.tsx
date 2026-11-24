import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DashboardStats, Doctor } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  Heart,
  Calendar as CalendarIcon,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Send,
  MessageSquare,
  Search,
  CheckCheck,
  UserCheck,
  Phone,
  Video,
  Award,
  Building,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'user';
  text: string;
  time: string;
}

interface ChatContact {
  id: number;
  name: string;
  specialization: string;
  hospital: string;
  avatarColor: string;
  status: 'Online' | 'In Consultation' | 'Away';
  lastMessage: string;
  lastTime: string;
}

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'doctors'>('info');

  // Doctor Tab Filter & Search
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Interactive Chat State
  const initialContacts: ChatContact[] = [
    {
      id: 1,
      name: 'Dr. Ethan Williams',
      specialization: 'Endocrinology',
      hospital: 'Endocrine & Diabetes Care Center',
      avatarColor: 'from-blue-500 to-indigo-600',
      status: 'Online',
      lastMessage: 'Fasting glucose levels look well managed. Continue current dosage.',
      lastTime: '10:42 AM',
    },
    {
      id: 2,
      name: 'Dr. Amira Al-Mansoor',
      specialization: 'Psychiatry',
      hospital: 'MindWell Behavioral Health',
      avatarColor: 'from-rose-500 to-pink-600',
      status: 'Online',
      lastMessage: 'Bi-weekly check-in scheduled for tomorrow morning.',
      lastTime: '09:15 AM',
    },
    {
      id: 3,
      name: 'Dr. Maya Lin Tanaka',
      specialization: 'Cardiology',
      hospital: 'Metro General Hospital',
      avatarColor: 'from-amber-500 to-orange-600',
      status: 'In Consultation',
      lastMessage: 'Holter monitor report has been uploaded to clinic records.',
      lastTime: 'Yesterday',
    },
    {
      id: 4,
      name: 'Dr. Marcus Vance',
      specialization: 'Neurology',
      hospital: 'Saint Jude Health',
      avatarColor: 'from-emerald-500 to-teal-600',
      status: 'Away',
      lastMessage: 'Refill requested for neuro-supportive vitamins.',
      lastTime: '2 days ago',
    },
  ];

  const [contacts] = useState<ChatContact[]>(initialContacts);
  const [activeContact, setActiveContact] = useState<ChatContact>(initialContacts[0]);
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>({
    1: [
      {
        id: 'm1',
        sender: 'doctor',
        text: 'Good morning! I have reviewed the latest lab metrics and HbA1c panel for the assigned care team.',
        time: '10:30 AM',
      },
      {
        id: 'm2',
        sender: 'user',
        text: 'Thank you Dr. Williams. The patient reported mild dizziness after the morning dosage.',
        time: '10:35 AM',
      },
      {
        id: 'm3',
        sender: 'doctor',
        text: 'Fasting glucose levels look well managed. Continue current dosage with meals, and let me know if dizziness persists.',
        time: '10:42 AM',
      },
    ],
    2: [
      {
        id: 'm4',
        sender: 'doctor',
        text: 'Hello, regarding the bi-weekly psychotherapy follow-up: how is the patient adjusting to the new cognitive routine?',
        time: '09:00 AM',
      },
      {
        id: 'm5',
        sender: 'user',
        text: 'Sleep cycle has improved significantly over the last 48 hours.',
        time: '09:10 AM',
      },
      {
        id: 'm6',
        sender: 'doctor',
        text: 'Bi-weekly check-in scheduled for tomorrow morning.',
        time: '09:15 AM',
      },
    ],
    3: [
      {
        id: 'm7',
        sender: 'doctor',
        text: 'Holter monitor report has been uploaded to clinic records. Rhythm is sinus with no pauses.',
        time: 'Yesterday',
      },
    ],
    4: [
      {
        id: 'm8',
        sender: 'doctor',
        text: 'Refill requested for neuro-supportive vitamins.',
        time: '2 days ago',
      },
    ],
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Calendar & Schedule State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(currentDate.getDate());

  // Consultation appointments mapped by date
  const scheduleAppointments: Record<number, Array<{
    id: string;
    time: string;
    doctor: string;
    specialty: string;
    patient: string;
    status: 'Confirmed' | 'In Progress' | 'Scheduled';
  }>> = {
    2: [
      {
        id: 'a1',
        time: '09:30 AM',
        doctor: 'Dr. Amira Al-Mansoor',
        specialty: 'Psychiatry',
        patient: 'Fatima Zahra Khan',
        status: 'Confirmed',
      },
      {
        id: 'a2',
        time: '02:00 PM',
        doctor: 'Dr. Ethan Williams',
        specialty: 'Endocrinology',
        patient: 'Lucas Jean Dupont',
        status: 'Scheduled',
      },
    ],
    18: [
      {
        id: 'a3',
        time: '10:00 AM',
        doctor: 'Dr. Ethan Williams',
        specialty: 'Endocrinology',
        patient: 'Lucas Jean Dupont',
        status: 'In Progress',
      },
      {
        id: 'a4',
        time: '01:30 PM',
        doctor: 'Dr. Amira Al-Mansoor',
        specialty: 'Psychiatry',
        patient: 'Fatima Zahra Khan',
        status: 'Confirmed',
      },
      {
        id: 'a5',
        time: '04:15 PM',
        doctor: 'Dr. Maya Lin Tanaka',
        specialty: 'Cardiology',
        patient: 'James Alexander Wilson',
        status: 'Scheduled',
      },
    ],
    25: [
      {
        id: 'a6',
        time: '11:00 AM',
        doctor: 'Dr. Marcus Vance',
        specialty: 'Neurology',
        patient: 'Harper Grace Evans',
        status: 'Scheduled',
      },
      {
        id: 'a7',
        time: '03:45 PM',
        doctor: 'Dr. Sarah Jenkins',
        specialty: 'Pediatrics',
        patient: 'Liam Noah Gallagher',
        status: 'Confirmed',
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes] = await Promise.all([
          api.dashboard.stats(),
          api.doctors.list({ page_size: 12 }),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (docsRes.success && docsRes.data) {
          const list = (docsRes.data as any).results || docsRes.data || [];
          setDoctors(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpis = stats?.kpis || {
    total_patients: 15,
    total_doctors: 10,
    active_mappings: 17,
    unassigned_patients: 0,
  };

  // Dynamic Calendar calculations
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // First day of month (convert Sunday=0 to Monday=0)
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  
  // Empty slots for previous month padding
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);
  // Current month day numbers
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Send message in Chat Tab
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg],
    }));
    setInputMessage('');

    // Trigger realistic doctor response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const docReplies = [
        `Understood. I have logged this into the clinical care chart and updated the attending notes.`,
        `Thank you for the update. Let's monitor vitals closely for the next 24 hours.`,
        `Received. I've synced this with the primary physician and assigned care team.`,
        `Confirmed. I will review this during my hospital rounds today.`,
      ];
      const randomReply = docReplies[Math.floor(Math.random() * docReplies.length)];

      const docMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), docMsg],
      }));
    }, 900);
  };

  // Specialties for Doctor Page Tab
  const availableSpecialties = [
    'All',
    'Cardiology',
    'Psychiatry',
    'Endocrinology',
    'Neurology',
    'Pediatrics',
    'Surgery',
    'General Medicine',
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All' || doc.specialization.toLowerCase() === selectedSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-6 animate-in fade-in duration-300">
      {/* Center Column: Dynamic Tabs & Content */}
      <div className="flex-1 flex flex-col space-y-6">
        {/* Navigation Tabs (Info, Chat, Doctor page) */}
        <div className="flex items-center gap-8 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('info')}
            className={`text-sm font-bold relative pb-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'text-[#1E2438] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#3B4EF8] after:rounded-full'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`text-sm font-bold relative pb-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'text-[#1E2438] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#3B4EF8] after:rounded-full'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>Chat</span>
            <span className="flex h-2 w-2 rounded-full bg-[#3B4EF8] animate-pulse"></span>
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`text-sm font-bold relative pb-2 transition-all cursor-pointer ${
              activeTab === 'doctors'
                ? 'text-[#1E2438] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#3B4EF8] after:rounded-full'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Doctor page
          </button>
        </div>

        {/* ===================== TAB 1: INFO ===================== */}
        {activeTab === 'info' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top 3 Hero Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: My Consultation (White Card) */}
              <Link
                to="/patients"
                className="group rounded-[28px] bg-white border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-between text-center min-h-[220px]"
              >
                {/* Medical Stethoscope & Clipboard Illustration */}
                <div className="flex h-24 w-24 items-center justify-center">
                  <svg className="h-20 w-20 transform group-hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none">
                    <rect x="22" y="16" width="56" height="72" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
                    <rect x="36" y="10" width="28" height="12" rx="4" fill="#3B4EF8" />
                    <line x1="32" y1="36" x2="68" y2="36" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="32" y1="48" x2="68" y2="48" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="32" y1="60" x2="54" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M72 40 C78 40, 84 48, 84 56 C84 68, 72 74, 56 74" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <circle cx="54" cy="74" r="5" fill="#F43F5E" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E2438]">My consultation</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {loading ? '...' : `${kpis.total_patients} consultations`}
                  </p>
                </div>
              </Link>

              {/* Card 2: Tests & Lab (Pastel Blue Card) */}
              <button
                onClick={() => setActiveTab('doctors')}
                className="group rounded-[28px] bg-[#F0F4FE] border border-[#E0E9FE] p-5 hover:shadow-md transition-all flex flex-col items-center justify-between text-center min-h-[220px] cursor-pointer"
              >
                {/* X-ray / Medical Folder Illustration */}
                <div className="flex h-24 w-24 items-center justify-center">
                  <svg className="h-20 w-20 transform group-hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none">
                    <rect x="18" y="24" width="46" height="60" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2" />
                    <rect x="34" y="16" width="48" height="62" rx="8" fill="#1E293B" />
                    <path d="M48 34 C44 40, 44 54, 50 60" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M68 34 C72 40, 72 54, 66 60" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="58" y1="28" x2="58" y2="64" stroke="#94A3B8" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E2438]">Tests & Specialists</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {loading ? '...' : `${kpis.total_doctors} results available`}
                  </p>
                </div>
              </button>

              {/* Card 3: Clinic Reports (Solid Royal Blue Card) */}
              <Link
                to="/mappings"
                className="group rounded-[28px] bg-[#3B4EF8] p-5 shadow-lg shadow-[#3B4EF8]/25 hover:shadow-xl transition-all flex flex-col items-center justify-between text-center min-h-[220px] text-white"
              >
                {/* White Band-Aid Cross Badge Illustration */}
                <div className="flex h-24 w-24 items-center justify-center">
                  <svg className="h-20 w-20 transform group-hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none">
                    <rect x="18" y="42" width="64" height="18" rx="9" transform="rotate(-30 50 50)" fill="#FFFFFF" fillOpacity="0.95" />
                    <rect x="18" y="42" width="64" height="18" rx="9" transform="rotate(30 50 50)" fill="#FFFFFF" fillOpacity="0.95" />
                    <rect x="42" y="42" width="16" height="16" rx="4" fill="#F87171" fillOpacity="0.8" />
                    <circle cx="28" cy="46" r="1.5" fill="#CBD5E1" />
                    <circle cx="72" cy="54" r="1.5" fill="#CBD5E1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Clinic reports</h3>
                  <p className="text-[11px] text-white/80 font-medium mt-0.5">
                    {loading ? '...' : `${kpis.active_mappings} reports active`}
                  </p>
                </div>
              </Link>
            </div>

            {/* Lower Split: Community Quick Assignment Card & View All Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Left Sub-card: Community / Quick Assignment */}
              <div className="rounded-[28px] bg-white border border-slate-100 p-6 shadow-xs flex flex-col justify-between space-y-5">
                <div>
                  <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                    Community Care
                  </span>
                  <h4 className="text-base font-bold text-[#1E2438] mt-1 leading-snug">
                    Join to our medicine volunteer care team
                  </h4>
                </div>

                {/* 2x2 Specs Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Place</span>
                    <div className="flex items-center gap-1.5 font-bold text-[#1E2438]">
                      <CalendarIcon className="h-3.5 w-3.5 text-amber-500" />
                      <span>Monday</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
                    <div className="flex items-center gap-1.5 font-bold text-[#1E2438]">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span>3 pm</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Goals</span>
                    <div className="flex items-center gap-1.5 font-bold text-[#1E2438]">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      <span>Help patients</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Condition</span>
                    <div className="flex items-center gap-1.5 font-bold text-[#1E2438]">
                      <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Primary doctor</span>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <Link
                  to="/mappings"
                  className="w-full py-2.5 rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] text-white text-xs font-bold text-center shadow-md shadow-[#3B4EF8]/20 transition-all active:scale-98 block cursor-pointer"
                >
                  Assign Care Team
                </Link>
              </div>

              {/* Right Sub-card: View all Schedule */}
              <div className="rounded-[28px] bg-white border border-slate-100 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#1E2438]">View all schedule</h4>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Doctor Rows */}
                <div className="space-y-3">
                  {doctors.slice(0, 4).length > 0 ? (
                    doctors.slice(0, 4).map((doc, idx) => {
                      const avatarGradients = [
                        'from-rose-400 to-pink-500',
                        'from-blue-400 to-indigo-500',
                        'from-amber-400 to-orange-500',
                        'from-emerald-400 to-teal-500',
                      ];
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setActiveTab('doctors');
                            setDoctorSearch(doc.name);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F6F8FB] transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-full bg-gradient-to-tr ${
                                avatarGradients[idx % avatarGradients.length]
                              } text-white font-bold text-xs flex items-center justify-center shadow-xs`}
                            >
                              {doc.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#1E2438]">{doc.specialization}</div>
                              <div className="text-[11px] text-slate-400 font-medium">{doc.name}</div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#3B4EF8] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 py-6 text-center">
                      Loading active clinical schedules...
                    </div>
                  )}
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="text-xs font-bold text-[#3B4EF8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full catalog</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: CHAT ===================== */}
        {activeTab === 'chat' && (
          <div className="rounded-[28px] bg-white border border-slate-100 p-6 shadow-xs flex flex-col md:flex-row gap-6 min-h-[560px] animate-in fade-in duration-200">
            {/* Left Column: Attending Contacts */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1E2438]">Consultations</h3>
                <span className="rounded-full bg-[#EEF2FC] px-2 py-0.5 text-[10px] font-bold text-[#3B4EF8]">
                  {contacts.length} Active
                </span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[460px] pr-1">
                {contacts.map((c) => {
                  const isSelected = activeContact.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveContact(c)}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#F0F4FE] border border-[#DCE4FB]'
                          : 'hover:bg-[#F6F8FB] border border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div
                          className={`h-9 w-9 rounded-full bg-gradient-to-tr ${c.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs`}
                        >
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        {c.status === 'Online' && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1E2438] truncate">{c.name}</span>
                          <span className="text-[10px] text-slate-400">{c.lastTime}</span>
                        </div>
                        <div className="text-[11px] text-[#3B4EF8] font-semibold">{c.specialization}</div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Chat Stream & Message Input */}
            <div className="flex-1 flex flex-col justify-between min-h-[460px]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full bg-gradient-to-tr ${activeContact.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-xs`}
                  >
                    {activeContact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E2438]">{activeContact.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {activeContact.specialization} • {activeContact.hospital}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Calling ${activeContact.name}...`)}
                    className="p-2 rounded-full text-slate-400 hover:bg-[#EEF2FC] hover:text-[#3B4EF8] transition-colors cursor-pointer"
                    title="Audio consultation"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => alert(`Starting telemedicine video consultation with ${activeContact.name}...`)}
                    className="p-2 rounded-full text-slate-400 hover:bg-[#EEF2FC] hover:text-[#3B4EF8] transition-colors cursor-pointer"
                    title="Video consultation"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate('/mappings')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FC] hover:bg-[#E0E9FD] px-3.5 py-1.5 text-xs font-bold text-[#3B4EF8] transition-colors cursor-pointer"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Assign Care Team</span>
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 py-4 space-y-3.5 overflow-y-auto max-h-[340px] pr-2">
                <div className="text-center">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Today &bull; Encrypted Clinical Channel
                  </span>
                </div>

                {(chatMessages[activeContact.id] || []).map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-2xs leading-relaxed ${
                          isUser
                            ? 'bg-[#3B4EF8] text-white rounded-br-xs'
                            : 'bg-[#F0F4FE] text-[#1E2438] border border-[#DCE4FB] rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                        <span>{msg.time}</span>
                        {isUser && <CheckCheck className="h-3 w-3 text-[#3B4EF8]" />}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3B4EF8] animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3B4EF8] animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3B4EF8] animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span>{activeContact.name} is drafting clinical response...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap items-center gap-2 pb-3">
                {[
                  'Request Lab Panel Review',
                  'Confirm Medication Refill',
                  'Schedule In-Person Consultation',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setInputMessage(chip)}
                    className="rounded-full bg-[#F6F8FB] hover:bg-[#EEF2FC] hover:text-[#3B4EF8] border border-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Send clinical note to ${activeContact.name}...`}
                  className="flex-1 rounded-full border border-slate-200 bg-[#F6F8FB] focus:bg-white px-4 py-2.5 text-xs font-medium text-[#1E2438] placeholder-slate-400 focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] text-white p-2.5 shadow-md shadow-[#3B4EF8]/20 disabled:opacity-40 transition-all cursor-pointer shrink-0"
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: DOCTOR PAGE ===================== */}
        {activeTab === 'doctors' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Search & Specialty Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#F6F8FB] p-3.5 rounded-2xl border border-slate-100">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Search doctors by name, specialty, or clinic..."
                  className="w-full rounded-full border border-slate-200/80 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-[#1E2438] placeholder-slate-400 focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 focus:border-[#3B4EF8] focus:outline-none cursor-pointer"
                >
                  {availableSpecialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>

                <Link
                  to="/doctors"
                  className="rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] text-white px-4 py-1.5 text-xs font-bold shadow-xs whitespace-nowrap transition-colors cursor-pointer"
                >
                  Manage Catalog
                </Link>
              </div>
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-[28px] border border-slate-100 p-8">
                  No medical doctors found matching &quot;{doctorSearch}&quot;.
                </div>
              ) : (
                filteredDoctors.map((doc, idx) => {
                  const avatarGradients = [
                    'from-rose-400 to-pink-500',
                    'from-blue-400 to-indigo-500',
                    'from-amber-400 to-orange-500',
                    'from-emerald-400 to-teal-500',
                    'from-purple-400 to-indigo-500',
                  ];
                  return (
                    <div
                      key={doc.id}
                      className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${
                              avatarGradients[idx % avatarGradients.length]
                            } text-white font-bold text-sm flex items-center justify-center shadow-xs`}
                          >
                            {doc.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="inline-block rounded-full bg-[#EEF2FC] px-2.5 py-0.5 text-[10px] font-bold text-[#3B4EF8]">
                              {doc.specialization}
                            </span>
                            <h3 className="text-sm font-bold text-[#1E2438] mt-1">{doc.name}</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Lic. #{doc.license_number}</p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-[#3B4EF8] bg-[#F0F4FE] px-2.5 py-1 rounded-full">
                          ${Number(doc.consultation_fee).toFixed(0)}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{doc.hospital}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{doc.years_of_experience} years clinical practice</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                          }}
                          className="flex-1 py-2 rounded-full bg-[#EEF2FC] hover:bg-[#E0E9FD] text-[#3B4EF8] text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Consult</span>
                        </button>
                        <Link
                          to="/mappings"
                          className="flex-1 py-2 rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] text-white text-xs font-bold text-center shadow-md shadow-[#3B4EF8]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Assign</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Mini-Calendar Widget & Doctor Illustration */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col justify-between space-y-6">
        {/* Mini-Calendar Card */}
        <div className="rounded-[28px] bg-white border border-slate-100 p-5 shadow-xs space-y-4">
          {/* Month Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[#3B4EF8]" />
              <span className="text-sm font-bold text-[#1E2438]">
                {currentMonthName} {currentYear}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-full text-slate-400 hover:bg-[#F6F8FB] hover:text-[#1E2438] transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  setCurrentDate(today);
                  setSelectedDay(today.getDate());
                }}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#3B4EF8] bg-[#EEF2FC] hover:bg-[#E0E9FD] transition-colors cursor-pointer"
                title="Jump to today"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-full text-slate-400 hover:bg-[#F6F8FB] hover:text-[#1E2438] transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
            {daysOfWeek.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Dynamic Day Grid with Padding */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
            {/* Previous month empty padding slots */}
            {paddingDays.map((pad) => (
              <div key={`pad-${pad}`} className="py-1 text-slate-200">
                &bull;
              </div>
            ))}

            {/* Current month days */}
            {calendarDays.map((day) => {
              const isSelected = selectedDay === day;
              const hasEvents = !!scheduleAppointments[day];

              return (
                <div key={day} className="flex flex-col items-center justify-center py-0.5">
                  <button
                    onClick={() => setSelectedDay(day)}
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#3B4EF8] text-white font-bold shadow-md shadow-[#3B4EF8]/25 scale-105'
                        : hasEvents
                        ? 'bg-[#F0F4FE] text-[#3B4EF8] font-bold hover:bg-[#E0E9FD]'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                  {hasEvents && !isSelected && (
                    <span className="h-1 w-1 rounded-full bg-[#3B4EF8] mt-0.5"></span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Day Agenda Drawer */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E2438]">
                {currentMonthName.slice(0, 3)} {selectedDay} Agenda
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                {scheduleAppointments[selectedDay]?.length || 0} consultations
              </span>
            </div>

            {scheduleAppointments[selectedDay] && scheduleAppointments[selectedDay].length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {scheduleAppointments[selectedDay].map((apt) => (
                  <div
                    key={apt.id}
                    className="p-2.5 rounded-2xl bg-[#F6F8FB] border border-slate-100 flex flex-col space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3B4EF8] text-[11px]">{apt.time}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          apt.status === 'In Progress'
                            ? 'bg-emerald-50 text-emerald-700'
                            : apt.status === 'Confirmed'
                            ? 'bg-[#EEF2FC] text-[#3B4EF8]'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <div className="font-bold text-[#1E2438]">{apt.doctor}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Patient: <span className="text-[#1E2438] font-semibold">{apt.patient}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#F6F8FB] text-center space-y-1.5">
                <p className="text-[11px] text-slate-400">
                  No appointments scheduled for {currentMonthName.slice(0, 3)} {selectedDay}.
                </p>
                <Link
                  to="/mappings"
                  className="inline-block rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] text-white px-3 py-1 text-[10px] font-bold shadow-2xs transition-colors"
                >
                  + Assign Doctor
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Character Illustration & Health Shield */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[240px]">
          {/* Floating cute health icons */}
          <div className="absolute top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-xs animate-bounce">
            <Heart className="h-4 w-4 fill-rose-500" />
          </div>
          <div className="absolute top-2 right-8 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#3B4EF8] shadow-xs">
            <Clock className="h-4 w-4" />
          </div>
          <div className="absolute bottom-6 right-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#3B4EF8] shadow-md border border-slate-100">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>

          {/* Friendly Doctor Vector Art */}
          <svg className="w-56 h-56" viewBox="0 0 200 200" fill="none">
            {/* Background circle aura */}
            <circle cx="100" cy="115" r="70" fill="#EEF2FC" />
            
            {/* Doctor Hair & Face */}
            <path d="M70 70 C60 90, 60 120, 65 140 C80 140, 80 100, 85 90" fill="#1E293B" />
            <path d="M130 70 C140 90, 140 120, 135 140 C120 140, 120 100, 115 90" fill="#1E293B" />
            
            {/* Head */}
            <circle cx="100" cy="80" r="24" fill="#FDE047" fillOpacity="0.4" />
            <circle cx="100" cy="80" r="22" fill="#FFE4E6" />
            
            {/* Glasses */}
            <circle cx="92" cy="78" r="6" stroke="#1E293B" strokeWidth="1.5" />
            <circle cx="108" cy="78" r="6" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="98" y1="78" x2="102" y2="78" stroke="#1E293B" strokeWidth="1.5" />

            {/* Smile */}
            <path d="M96 88 Q100 92 104 88" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hair bangs */}
            <path d="M78 68 Q100 50 122 68 Q100 62 78 68" fill="#1E293B" />

            {/* Doctor Lab Coat (White) */}
            <path d="M75 102 L60 180 L140 180 L125 102 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M85 102 L100 135 L115 102" fill="#EEF2FF" stroke="#3B4EF8" strokeWidth="2" />
            
            {/* Stethoscope */}
            <path d="M88 102 C88 125, 112 125, 112 102" stroke="#3B4EF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="128" r="4" fill="#F43F5E" />

            {/* Clipboard held in hands */}
            <rect x="85" y="125" width="30" height="42" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
            <rect x="92" y="122" width="16" height="6" rx="2" fill="#3B4EF8" />
            <line x1="90" y1="138" x2="110" y2="138" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="90" y1="146" x2="110" y2="146" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="90" y1="154" x2="104" y2="154" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hands */}
            <circle cx="82" cy="145" r="5" fill="#FFE4E6" />
            <circle cx="118" cy="145" r="5" fill="#FFE4E6" />
          </svg>
        </div>
      </div>
    </div>
  );
};
