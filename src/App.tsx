import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Calendar, 
  Users, 
  Store, 
  DollarSign, 
  Settings, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Menu, 
  X, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  User,
  LayoutDashboard,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Check,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Key,
  CalendarPlus,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  History,
  Award,
  Volume2,
  Copy,
  Share2,
  Upload,
  Image,
  Scissors
} from 'lucide-react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  useParams, 
  useNavigate, 
  Navigate,
  Link,
  useLocation,
  useSearchParams
} from 'react-router-dom';
import { format, addMinutes, startOfDay, endOfDay, parseISO, setHours, setMinutes, isSameDay, parse, startOfMonth, endOfMonth, addDays, isBefore, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO SUPABASE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing! Please check your environment variables.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// --- COOKIE UTILS ---
const CLIENT_COOKIE_KEY = 'barbershop_client_info';

const getClientCookie = () => {
  const match = document.cookie.match(new RegExp('(^| )' + CLIENT_COOKIE_KEY + '=([^;]+)'));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch (e) {
      return null;
    }
  }
  return null;
};

const setClientCookie = (name: string, phone: string) => {
  const data = JSON.stringify({ name, phone });
  document.cookie = `${CLIENT_COOKIE_KEY}=${encodeURIComponent(data)}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
};

// --- LOGGING UTILS ---
const createLog = async (action: string, details: string, barbershopId?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('activity_logs').insert({
      user_email: user?.email || 'anonymous',
      action,
      details,
      barbershop_id: barbershopId
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
};

// --- CONSTANTS ---
const MASTER_EMAILS = ['mateusaparecidoferreira@outlook.com', 'fast01light@gmail.com'];

// --- TYPES ---
type Barbershop = {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  logo_url: string;
  banner_url: string;
  whatsapp_number: string;
  owner_id?: string;
  owner_email?: string;
  is_active?: boolean;
  expiration_date?: string;
  creation_date?: string;
  appointment_interval?: number;
};

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  image_url?: string;
};

type Professional = {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
};

type Appointment = {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  services_snapshot?: any[];
  start_time: string;
  end_time: string;
  status: string;
  clients?: { name: string; phone: string };
  services?: { name: string; price: number };
  professionals?: { name: string };
  total_price?: number;
};

// --- COMPONENTS ---

const Button = ({ children, onClick, className, variant = 'primary', size = 'md', disabled = false, type = 'button' }: any) => {
  const variants: any = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-white text-black border border-gray-200 hover:bg-gray-50',
    outline: 'bg-transparent border-2 border-black text-black hover:bg-black hover:text-white',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100',
    dark: 'bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800',
  };

  const sizes: any = {
    sm: 'px-2.5 py-1.5 text-[10px] sm:text-xs gap-1',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
  };

  const hasPadding = !className?.includes('p-') && !className?.includes('px-') && !className?.includes('py-');
  const sizeClass = hasPadding ? sizes[size] : '';
  const hasGap = className?.includes('gap-');

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 whitespace-nowrap ${sizeClass} ${!hasGap && !sizeClass ? 'gap-2' : ''} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, name, defaultValue, required }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>}
      <div className="relative">
        <input
          type={inputType}
          name={name}
          defaultValue={defaultValue}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all pr-12"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Mobile Handle */}
        <div className="sm:hidden flex justify-center pt-4">
          <div className="w-12 h-1.5 bg-gray-100 rounded-full" />
        </div>
        
        <div className="flex justify-between items-center p-6 sm:p-8 pb-4 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 sm:w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
            {variant === 'danger' ? <Trash2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              variant="primary" 
              className={variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}
              onClick={() => { onConfirm(); onClose(); }}
            >
              {confirmText}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS ---
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Calendar className="w-8 h-8 text-blue-600 animate-pulse" />
      </div>
    </div>
    <p className="mt-4 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-widest animate-pulse">Carregando...</p>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

// --- PAGES ---

const LandingPage = () => {
  const [user, setUser] = useState<any>(null);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    const fetchBarbershops = async () => {
      try {
        const { data } = await supabase
          .from('barbershops')
          .select('*')
          .order('name');
        
        // Filter in frontend to handle complex logic (expiration, disabled prefix)
        const activeShops = (data || []).filter(shop => {
          const isExpired = shop.expiration_date ? isBefore(parseISO(shop.expiration_date), new Date()) : true;
          const isInactive = (shop as any).is_active === false || shop.owner_email?.startsWith('disabled:') || isExpired;
          return !isInactive;
        });
        
        setBarbershops(activeShops);
      } catch (error) {
        console.error('Erro ao buscar estabelecimentos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBarbershops();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 flex flex-col font-sans selection:bg-blue-200">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <CalendarCheck className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">Agenda Fácil</h1>
        </div>
        {MASTER_EMAILS.includes(user?.email || '') && (
          <Link to="/master" className="text-xs font-bold bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-200 flex items-center gap-2 hover:bg-yellow-200 transition-colors">
            <ShieldCheck className="w-4 h-4" /> Agenda Fácil
          </Link>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-16 max-w-6xl mx-auto w-full flex flex-col items-center">
        <div className="text-center max-w-3xl mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Agendamento Simplificado
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-gray-900 leading-tight">
            Encontre o estabelecimento ideal e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">agende seu horário.</span>
          </h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Escolha um dos nossos estabelecimentos parceiros e garanta seu atendimento sem filas e sem complicação.
          </p>
        </div>

        {loading ? (
          <div className="py-20">
            <LoadingSpinner />
          </div>
        ) : barbershops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {barbershops.map(shop => (
              <Link key={shop.id} to={`/${shop.slug}`} className="group block">
                <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 relative">
                  <div className="relative">
                    <div className="h-48 relative overflow-hidden bg-black">
                      {shop.banner_url ? (
                        <img src={shop.banner_url} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20 group-hover:scale-105 transition-transform duration-700">
                          <Store className="w-20 h-20 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                    </div>
                    {shop.logo_url ? (
                      <img src={shop.logo_url} alt="Logo" className="absolute -bottom-6 left-6 w-20 h-20 rounded-2xl border-4 border-white object-cover bg-white shadow-lg z-10" />
                    ) : (
                      <div className="absolute -bottom-6 left-6 w-20 h-20 rounded-2xl border-4 border-white bg-zinc-100 shadow-lg z-10 flex items-center justify-center">
                        <Store className="w-8 h-8 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="pt-10 pb-8 px-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{shop.name}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-2 mb-6 font-medium">
                      <Phone className="w-4 h-4 text-gray-400" /> {shop.whatsapp_number || 'Não informado'}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors">Agendar agora</span>
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border border-gray-100 rounded-[40px] w-full max-w-2xl shadow-xl shadow-blue-900/5">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhum estabelecimento encontrado</h3>
            <p className="text-gray-500 text-lg">Ainda não há estabelecimentos cadastrados na plataforma.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center mt-auto">
        <Link to="/portal" className="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1">
          <Settings className="w-3 h-3" /> Acesso do Parceiro
        </Link>
      </footer>
    </div>
  );
};

const PublicBarbershop = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  // Selection state
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState(() => {
    const saved = getClientCookie();
    return saved || { name: '', phone: '' };
  });
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(() => !!getClientCookie());
  const [isBooking, setIsBooking] = useState(false);
  const [dayAppointments, setDayAppointments] = useState<any[]>([]);
  const [rangeAppointments, setRangeAppointments] = useState<any[]>([]);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [workingHoursOverrides, setWorkingHoursOverrides] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: shop } = await supabase.from('barbershops').select('*').eq('slug', slug).single();
      if (shop) {
        setBarbershop(shop);
        const { data: svcs } = await supabase.from('services').select('*').eq('barbershop_id', shop.id).order('name', { ascending: true });
        const mappedSvcs = (svcs || []).map(s => ({ ...s, image_url: s.description || s.image_url }));
        const { data: profs } = await supabase.from('professionals').select('*').eq('barbershop_id', shop.id).order('name', { ascending: true });
        const { data: hours } = await supabase.from('working_hours').select('*').eq('barbershop_id', shop.id);
        const { data: overrides } = await supabase.from('working_hours_overrides').select('*').eq('barbershop_id', shop.id);
        setServices(mappedSvcs);
        setProfessionals(profs || []);
        setWorkingHours(hours || []);
        setWorkingHoursOverrides(overrides || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (barbershop && step === 3) {
      fetchDayAppointments();
    }
  }, [selectedDate, barbershop, step]);

  useEffect(() => {
    if (barbershop && step === 3) {
      // Fetch appointments for the next 30 days to calculate available days
      const fetchRangeAppointments = async () => {
        const start = startOfDay(new Date());
        const end = endOfDay(addDays(new Date(), 30));
        const { data } = await supabase
          .from('appointments')
          .select('start_time, end_time, status, professional_id')
          .eq('barbershop_id', barbershop.id)
          .gte('start_time', start.toISOString())
          .lte('start_time', end.toISOString());
        
        setRangeAppointments(data || []);
      };
      fetchRangeAppointments();
    }
  }, [barbershop, step]);

  const fetchDayAppointments = async () => {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);
    const { data } = await supabase
      .from('appointments')
      .select('start_time, end_time, status, professional_id')
      .eq('barbershop_id', barbershop?.id)
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString());
    
    setDayAppointments(data || []);
  };

  const getAvailableTimeSlots = (date: Date = selectedDate) => {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 1. Verificar se existe uma exceção para esta data específica
    const override = workingHoursOverrides.find(o => o.specific_date === dateStr);
    
    let config;
    if (override) {
      if (!override.is_active) return []; // Data bloqueada
      config = override;
    } else {
      // 2. Se não houver exceção, usar a configuração padrão do dia da semana
      config = workingHours.find(h => h.day_of_week === dayOfWeek);
    }
    
    if (!config || !config.is_active) return [];

    const slots: string[] = [];
    const baseDate = new Date(2000, 0, 1);
    const isToday = isSameDay(date, new Date());
    const now = new Date();

    const parseTime = (timeStr: string) => {
      if (!timeStr) return baseDate;
      const parts = timeStr.split(':');
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      const d = new Date(baseDate);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    // Usar a nova coluna 'intervals' se disponível, caso contrário usar start_time/end_time
    const intervals = (config.intervals && Array.isArray(config.intervals) && config.intervals.length > 0)
      ? config.intervals
      : [{ start: config.start_time || '09:00', end: config.end_time || '18:00' }];

    intervals.forEach((interval: { start: string, end: string }) => {
      let current = parseTime(interval.start);
      const end = parseTime(interval.end);

      if (current >= end) return;

      while (current < end) {
        const timeStr = format(current, 'HH:mm');
        
        if (isToday) {
          const [h, m] = timeStr.split(':').map(Number);
          const slotDateTime = setMinutes(setHours(startOfDay(new Date()), h), m);
          if (slotDateTime > now) {
            if (!slots.includes(timeStr)) slots.push(timeStr);
          }
        } else {
          if (!slots.includes(timeStr)) slots.push(timeStr);
        }
        
        current = addMinutes(current, barbershop?.appointment_interval || 30);
      }
    });

    return slots.sort();
  };

  const timeSlots = getAvailableTimeSlots(selectedDate);

  const isSlotTaken = (time: string, dateAppointments: any[] = dayAppointments, slotDate: Date = selectedDate) => {
    if (!selectedProfessional || selectedServices.length === 0) return false;

    const [hours, minutes] = time.split(':').map(Number);
    const slotStart = setMinutes(setHours(slotDate, hours), minutes);
    const totalDuration = selectedServices.reduce((acc, s) => acc + (s.duration_minutes || 30), 0);
    const slotEnd = addMinutes(slotStart, totalDuration);

    return dateAppointments.some(appt => {
      if (appt.status === 'cancelled') return false;
      if (appt.professional_id !== selectedProfessional.id) return false;

      const apptStart = parseISO(appt.start_time);
      const apptEnd = parseISO(appt.end_time);

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      return slotStart < apptEnd && slotEnd > apptStart;
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return rangeAppointments.filter(a => {
      const apptDate = parseISO(a.start_time);
      return apptDate >= start && apptDate <= end;
    });
  };

  const availableDays = React.useMemo(() => {
    if (step !== 3) return [];
    
    const days: Date[] = [];
    let currentDate = new Date();
    
    // Check up to 30 days ahead to find 7 available days
    for (let i = 0; i < 30; i++) {
      if (days.length >= 7) break;
      
      const dateToCheck = new Date(currentDate);
      dateToCheck.setDate(dateToCheck.getDate() + i);
      
      const slots = getAvailableTimeSlots(dateToCheck);
      const dateAppointments = getAppointmentsForDate(dateToCheck);
      
      const hasAvailable = slots.some(slot => !isSlotTaken(slot, dateAppointments, dateToCheck));
      
      if (hasAvailable) {
        days.push(dateToCheck);
      }
    }
    
    return days;
  }, [step, rangeAppointments, workingHours, workingHoursOverrides, selectedProfessional, selectedServices]);

  React.useEffect(() => {
    if (availableDays.length > 0 && !availableDays.some(d => isSameDay(d, selectedDate))) {
      setSelectedDate(availableDays[0]);
    }
  }, [availableDays, selectedDate]);

  const handleBooking = async () => {
    if (!barbershop || selectedServices.length === 0 || !selectedProfessional || !selectedTime) return;
    setIsBooking(true);

    try {
      // 1. Create or find client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .upsert({ 
          barbershop_id: barbershop.id,
          name: clientInfo.name,
          phone: clientInfo.phone
        }, { onConflict: 'phone,barbershop_id' })
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Create appointment
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = setMinutes(setHours(selectedDate, hours), minutes);
      const totalDuration = selectedServices.reduce((acc, s) => acc + (s.duration_minutes || 30), 0);
      const totalPrice = selectedServices.reduce((acc, s) => acc + (s.price || 0), 0);
      const endTime = addMinutes(startTime, totalDuration);

      const { error: apptError } = await supabase
        .from('appointments')
        .insert({
          barbershop_id: barbershop.id,
          client_id: client.id,
          professional_id: selectedProfessional.id,
          service_id: selectedServices[0].id, // Keep for backward compatibility
          services_snapshot: selectedServices, // New JSONB column
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          total_price: totalPrice,
          status: 'scheduled'
        });

      if (apptError) throw apptError;

      // Save client info to cookie for future bookings
      setClientCookie(clientInfo.name, clientInfo.phone);
      setIsClientLoggedIn(true);

      setStep(5); // Success
      toast.success('Agendamento realizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao agendar: ' + error.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!barbershop) return <div className="p-8 text-center">Estabelecimento não encontrado.</div>;

  const isExpired = barbershop.expiration_date ? isBefore(parseISO(barbershop.expiration_date), new Date()) : true;
  const isInactive = (barbershop as any).is_active === false || barbershop.owner_email?.startsWith('disabled:') || isExpired;

  if (isInactive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="p-8 max-w-md w-full text-center space-y-6 border-none shadow-xl">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Estabelecimento Indisponível</h2>
            <p className="text-gray-500">Este estabelecimento está temporariamente desativado ou com a licença expirada. Entre em contato com o estabelecimento para mais informações.</p>
          </div>
          <Button onClick={() => navigate('/')} className="w-full py-6">Voltar para o Início</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="relative mb-12 sm:mb-14">
        <div className="relative h-40 sm:h-48 bg-black overflow-hidden">
          <button 
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 z-20 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {barbershop.banner_url ? (
            <img src={barbershop.banner_url} className="w-full h-full object-cover opacity-60" alt="Banner" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Store className="w-20 h-20 text-white" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white p-1 shadow-2xl border border-zinc-100">
            {barbershop.logo_url ? (
              <img src={barbershop.logo_url} className="w-full h-full object-cover rounded-xl sm:rounded-2xl" alt="Logo" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded-xl sm:rounded-2xl">
                <Store className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">{barbershop.name}</h1>
        <p className="text-zinc-500 text-sm mt-1 flex items-center justify-center sm:justify-start gap-1">
          <Phone className="w-3 h-3" /> {barbershop.whatsapp_number}
        </p>
      </div>

      <main className="mt-8 px-4 sm:px-6 max-w-lg mx-auto flex-1">
        {/* Progress Indicator */}
        {step < 5 && (
          <div className="mb-8 flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black rounded-full -z-10 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= s ? 'bg-black text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">O que você precisa hoje?</h2>
              <p className="text-gray-500 text-sm mt-1">Selecione um ou mais serviços</p>
            </div>
            <div className="space-y-3">
              {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <Card 
                    key={service.id} 
                    onClick={() => {
                      if (isSelected) {
                        setSelectedServices(selectedServices.filter(s => s.id !== service.id));
                      } else {
                        setSelectedServices([...selectedServices, service]);
                      }
                    }}
                    className={`flex justify-between items-center transition-all duration-200 overflow-hidden ${isSelected ? 'border-black ring-1 ring-black bg-gray-50/50' : 'hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      {service.image_url && (
                        <img src={service.image_url} alt={service.name} className="w-16 h-16 object-cover bg-gray-100 flex-shrink-0" />
                      )}
                      <div className={service.image_url ? "py-2" : "p-4"}>
                        <p className="font-bold text-lg text-gray-900">{service.name}</p>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {service.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pr-4">
                      <p className="font-bold text-lg text-gray-900">R$ {service.price}</p>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black' : 'border-gray-300'}`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {selectedServices.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10 animate-in slide-in-from-bottom-4">
                <div className="max-w-md mx-auto flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-black text-gray-900">R$ {selectedServices.reduce((acc, s) => acc + (s.price || 0), 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Duração</p>
                    <p className="text-lg font-bold text-gray-900">{selectedServices.reduce((acc, s) => acc + (s.duration_minutes || 30), 0)} min</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setStep(2)}
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                >
                  Continuar <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
            {selectedServices.length > 0 && <div className="h-28"></div>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Quem vai te atender?</h2>
                <p className="text-gray-500 text-sm mt-1">Escolha o profissional</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {professionals.map(prof => (
                <Card 
                  key={prof.id} 
                  onClick={() => { setSelectedProfessional(prof); setStep(3); }}
                  className="text-center flex flex-col items-center gap-4 hover:border-black transition-colors"
                >
                  <div className="relative">
                    <img src={prof.avatar_url} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{prof.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prof.bio}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(2)} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Quando?</h2>
                <p className="text-gray-500 text-sm mt-1">Escolha a data e horário</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Datas Disponíveis</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-1 no-scrollbar">
                {availableDays.length > 0 ? (
                  availableDays.map((date, i) => {
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? 'bg-black text-white shadow-lg shadow-black/20 scale-105' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                      >
                        <span className={`text-[10px] uppercase font-bold ${isSelected ? 'opacity-80' : 'opacity-60'}`}>{format(date, 'EEE', { locale: ptBR })}</span>
                        <span className="text-xl font-bold">{format(date, 'dd')}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full text-center py-8 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500 text-sm">
                    Nenhum horário disponível nos próximos dias.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Horários</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeSlots.map(time => {
                  const taken = isSlotTaken(time);
                  return (
                    <button
                      key={time}
                      disabled={taken}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-xl font-bold border transition-all ${taken ? 'opacity-30 bg-gray-50 cursor-not-allowed' : selectedTime === time ? 'bg-black text-white border-black shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-black'}`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {selectedTime && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 animate-in slide-in-from-bottom-4">
                <Button className="w-full max-w-md mx-auto h-14 text-lg font-bold shadow-lg shadow-black/10 flex items-center justify-center gap-2" onClick={() => setStep(4)}>
                  Continuar <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
            {selectedTime && <div className="h-24"></div>}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(3)} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Quase lá!</h2>
                <p className="text-gray-500 text-sm mt-1">Confirme seus dados e o agendamento</p>
              </div>
            </div>

            {isClientLoggedIn ? (
              <Card className="p-5 flex items-center justify-between bg-white border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="text-gray-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{clientInfo.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{clientInfo.phone}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsClientLoggedIn(false)}
                  className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Trocar
                </button>
              </Card>
            ) : (
              <Card className="space-y-5 bg-white border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900">Seus Dados</h3>
                <Input 
                  label="Seu Nome" 
                  placeholder="Como quer ser chamado?" 
                  value={clientInfo.name}
                  onChange={(e: any) => setClientInfo({...clientInfo, name: e.target.value})}
                />
                <Input 
                  label="WhatsApp" 
                  placeholder="(00) 00000-0000" 
                  value={clientInfo.phone}
                  onChange={(e: any) => setClientInfo({...clientInfo, phone: e.target.value})}
                />
              </Card>
            )}

            <div className="bg-white border border-gray-200 p-4 sm:p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Resumo do Pedido</h3>
              
              <div className="space-y-3">
                {selectedServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center text-sm sm:text-base">
                    <span className="text-gray-600">{service.name}</span>
                    <span className="font-bold text-gray-900">R$ {service.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="h-px bg-gray-100 my-4"></div>
              
              <div className="space-y-3 text-[13px] sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2"><User className="w-4 h-4" /> Profissional</span>
                  <span className="font-bold text-gray-900">{selectedProfessional?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Data</span>
                  <span className="font-bold text-gray-900">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Horário</span>
                  <span className="font-bold text-gray-900">{selectedTime}</span>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 sm:p-6 rounded-b-3xl">
                <span className="text-gray-900 font-bold uppercase tracking-wider text-xs sm:text-sm">Total a Pagar</span>
                <span className="font-black text-xl sm:text-2xl text-gray-900">R$ {selectedServices.reduce((acc, s) => acc + (s.price || 0), 0)}</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg shadow-lg shadow-black/10" 
              onClick={handleBooking} 
              disabled={isBooking || !clientInfo.name || !clientInfo.phone}
            >
              {isBooking ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-8 py-10 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Agendamento Solicitado!</h2>
              <p className="text-gray-500 max-w-sm mx-auto">Sua solicitação foi enviada. O estabelecimento irá confirmar em breve.</p>
            </div>
            
            <Card className="text-left bg-white border-gray-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detalhes</p>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Pendente</span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-900">{selectedServices.map(s => s.name).join(', ')}</p>
                <p className="text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4" /> {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {selectedTime}</p>
                <p className="text-gray-600 flex items-center gap-2"><User className="w-4 h-4" /> Com {selectedProfessional?.name}</p>
              </div>
            </Card>

            <div className="space-y-3">
              <Button 
                className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 text-lg"
                onClick={() => {
                  const msg = `Olá! Fiz uma solicitação de agendamento pelo app e gostaria de confirmar:\n\n*Cliente:* ${clientInfo.name}\n*Serviço:* ${selectedServices.map(s => s.name).join(', ')}\n*Data:* ${format(selectedDate, 'dd/MM/yyyy')}\n*Horário:* ${selectedTime}\n*Profissional:* ${selectedProfessional?.name}\n*Status:* Pendente de Confirmação`;
                  openWhatsApp(barbershop.whatsapp_number, msg);
                }}
              >
                <MessageSquare className="w-5 h-5" /> Enviar via WhatsApp
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full h-14 text-gray-500 hover:text-gray-900"
              >
                Fazer outro agendamento
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center">
        <Link to="/portal" className="text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1">
          <Settings className="w-3 h-3" /> Acesso do Parceiro
        </Link>
      </footer>
    </div>
  );
};

const MasterLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas');
      setLoading(false);
      return;
    }

    if (!MASTER_EMAILS.includes(data.user?.email || '')) {
      await supabase.auth.signOut();
      setError('Acesso negado. Apenas o Master pode acessar esta área.');
      setLoading(false);
      return;
    }

    toast.success('Login Master efetuado com sucesso!');
    onLogin();
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Digite seu e-mail master primeiro');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error('Erro ao enviar e-mail: ' + error.message);
    } else {
      toast.success('E-mail de recuperação enviado!');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 border-none shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="w-16 h-16 text-yellow-400 mb-4" />
          <h1 className="text-2xl font-black text-center">Acesso Master</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">Área Restrita</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="E-mail Master" 
            type="email" 
            value={email} 
            onChange={(e: any) => setEmail(e.target.value)} 
            required 
          />
          <div className="space-y-1">
            <Input 
              label="Senha" 
              type="password" 
              value={password} 
              onChange={(e: any) => setPassword(e.target.value)} 
              required 
            />
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-[10px] font-bold text-gray-500 hover:text-yellow-400 uppercase tracking-wider transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          <Button className="w-full py-4" type="submit" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

const PartnerLogin = () => {
  const [step, setStep] = useState<'email' | 'password' | 'confirm-email' | 'blocked'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.blocked) {
      setStep('blocked');
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Reset showPassword when step changes
  useEffect(() => {
    setShowPassword(false);
  }, [step]);

  const handleCheckEmail = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      let isRegistered = false;
      let hasUserId = false;

      // 1. Busca na tabela partner_access (ignorando case)
      const { data: partner } = await supabase
        .from('partner_access')
        .select('user_id, barbershop_id')
        .ilike('email', cleanEmail)
        .maybeSingle();

      let barbershopId = partner?.barbershop_id;
      if (partner) {
        isRegistered = true;
        if (partner.user_id) hasUserId = true;
      }

      // 2. Busca na tabela barbershops
      const { data: shop } = await supabase
        .from('barbershops')
        .select('id, owner_id, is_active, expiration_date')
        .ilike('owner_email', cleanEmail)
        .maybeSingle();

      if (shop) {
        isRegistered = true;
        if (shop.owner_id) hasUserId = true;
        if (!barbershopId) barbershopId = shop.id;
        setExpirationDate(shop.expiration_date);
      }

      if (MASTER_EMAILS.includes(cleanEmail)) {
        isRegistered = true;
        hasUserId = true;
      }

      // 3. Verifica se está desativado (pelo prefixo disabled: ou pela coluna is_active/expiration_date)
      const { data: disabledShopByEmail } = await supabase
        .from('barbershops')
        .select('id')
        .ilike('owner_email', `disabled:${cleanEmail}`)
        .maybeSingle();

      if (disabledShopByEmail) {
        setStep('blocked');
        setLoading(false);
        return;
      }

      // Se achamos um ID de estabelecimento, verificamos o status real dele
      if (barbershopId) {
        const { data: bShop } = await supabase
          .from('barbershops')
          .select('is_active, expiration_date')
          .eq('id', barbershopId)
          .maybeSingle();

        if (bShop) {
          setExpirationDate(bShop.expiration_date);
          const isExpired = bShop.expiration_date ? isBefore(parseISO(bShop.expiration_date), new Date()) : true;
          if (bShop.is_active === false || isExpired) {
            setStep('blocked');
            setLoading(false);
            return;
          }
        }
      }

      if (isRegistered) {
        setNeedsAuth(!hasUserId);
        setStep('password');
      } else {
        toast.error('Este e-mail não está cadastrado como parceiro. Entre em contato com o suporte.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao verificar e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    if (needsAuth && password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Tenta logar primeiro (funciona para usuários existentes, mesmo com needsAuth = true devido a falha de sincronização)
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
        email: cleanEmail, 
        password 
      });
      
      if (loginData.session) {
        const isMaster = MASTER_EMAILS.includes(cleanEmail);
        if (isMaster) {
          toast.success('Login Master efetuado com sucesso!');
          navigate('/master');
          return;
        }

        if (expirationDate) {
          const daysLeft = differenceInDays(parseISO(expirationDate), new Date());
          if (daysLeft >= 0 && daysLeft <= 10) {
            toast.warning(`Atenção: Restam ${daysLeft} dias para o bloqueio da sua conta. Renove sua licença!`, {
              duration: 6000,
            });
          } else {
            toast.success('Login efetuado com sucesso!');
          }
        } else {
          toast.success('Login efetuado com sucesso!');
        }
        createLog('Login', 'Parceiro efetuou login');
        navigate('/portal');
        return;
      }

      if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
          setStep('confirm-email');
          return;
        }

        if (loginError.message.includes('Invalid login credentials')) {
          // Se não tem user_id, pode ser o primeiro acesso. Vamos tentar criar a conta.
          if (needsAuth) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: cleanEmail,
              password,
            });

            if (signUpError) {
              if (signUpError.message.includes('rate limit')) {
                throw new Error('Limite de tentativas excedido. Aguarde alguns minutos.');
              }
              if (signUpError.message.includes('User already registered') || signUpError.message.includes('already exists')) {
                // A conta já existia, então a senha que digitaram estava incorreta
                toast.error('Senha incorreta. Tente novamente.');
                return;
              }
              throw signUpError;
            }

            // Conta criada com sucesso!
            if (signUpData.user && !signUpData.session) {
              // Requer confirmação de e-mail
              setStep('confirm-email');
              return;
            }

            // Logado com sucesso
            if (expirationDate) {
              const daysLeft = differenceInDays(parseISO(expirationDate), new Date());
              if (daysLeft >= 0 && daysLeft <= 10) {
                toast.warning(`Atenção: Restam ${daysLeft} dias para o bloqueio da sua conta. Renove sua licença!`, {
                  duration: 6000,
                });
              } else {
                toast.success('Login efetuado com sucesso!');
              }
            } else {
              toast.success('Login efetuado com sucesso!');
            }
            navigate('/portal');
            return;
          } else {
            // Já tem user_id, então a conta existe e a senha está errada
            toast.error('Senha incorreta. Tente novamente.');
            return;
          }
        }

        // Outros erros de login
        throw loginError;
      }
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Digite seu e-mail primeiro');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error('Erro ao enviar e-mail: ' + error.message);
    } else {
      toast.success('E-mail de recuperação enviado!');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans selection:bg-zinc-200">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-white rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Store className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Portal do Parceiro</h1>
          <p className="text-zinc-500 mt-2 text-sm">
            {step === 'email' && 'Digite seu e-mail para começar.'}
            {step === 'password' && (needsAuth ? 'Primeiro acesso! Crie sua senha de acesso.' : 'Bem-vindo de volta! Digite sua senha.')}
            {step === 'confirm-email' && 'Quase lá!'}
            {step === 'blocked' && 'Acesso Restrito'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleCheckEmail} className="space-y-5">
            <div className="space-y-2 w-full">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e: any) => setEmail(e.target.value)} 
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1 mb-2">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">E-mail</p>
                <p className="text-sm font-medium text-zinc-900 truncate">{email}</p>
              </div>
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[10px] font-bold text-zinc-500 hover:text-zinc-950 uppercase tracking-wider transition-colors"
                >
                  Alterar
                </button>
              </div>
            </div>
            <div className="space-y-2 w-full">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                {needsAuth ? "Crie uma Senha (mín. 6 caracteres)" : "Senha"}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e: any) => setPassword(e.target.value)} 
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] font-bold text-zinc-500 hover:text-zinc-950 uppercase tracking-wider transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processando...' : (needsAuth ? 'Definir Senha e Acessar' : 'Entrar')}
            </button>
          </form>
        )}

        {step === 'confirm-email' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 text-zinc-950 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-950">Confirme seu E-mail</h2>
            <p className="text-sm text-zinc-500">
              Enviamos um link de confirmação para <strong className="text-zinc-900">{email}</strong>. 
              Por favor, verifique sua caixa de entrada (e spam) e clique no link para ativar sua conta.
            </p>
            <button 
              onClick={() => setStep('password')}
              className="w-full mt-6 py-4 px-6 rounded-2xl font-bold bg-transparent border-2 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95"
            >
              Já confirmei, tentar novamente
            </button>
          </div>
        )}

        {step === 'blocked' && (
          <div className="text-center space-y-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-950">Acesso Restrito</h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Este estabelecimento está temporariamente desativado ou com a licença expirada. Por favor, entre em contato com o suporte para regularizar a situação.
            </p>
            <button 
              onClick={() => { setStep('email'); setEmail(''); setPassword(''); }} 
              className="w-full mt-6 py-4 px-6 rounded-2xl font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-all active:scale-95"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const getServicesNames = (appt: any) => {
  if (appt.services_snapshot && Array.isArray(appt.services_snapshot) && appt.services_snapshot.length > 0) {
    return appt.services_snapshot.map((s: any) => s.name).join(', ');
  }
  // Fallback para agendamentos antigos ou join simples
  const serviceObj = Array.isArray(appt.services) ? appt.services[0] : appt.services;
  return serviceObj?.name || 'Serviço';
};

export const getAppointmentPrice = (appt: any) => {
  // 1. Se total_price estiver definido, usa ele (garantindo que seja número)
  if (appt.total_price != null) return Number(appt.total_price);
  
  // 2. Se houver snapshot de serviços, soma os preços
  if (appt.services_snapshot && Array.isArray(appt.services_snapshot) && appt.services_snapshot.length > 0) {
    return appt.services_snapshot.reduce((acc: number, s: any) => acc + Number(s.price || 0), 0);
  }
  
  // 3. Fallback para o objeto services do join (pode ser array ou objeto único)
  const services = Array.isArray(appt.services) ? appt.services : (appt.services ? [appt.services] : []);
  return services.reduce((acc: number, s: any) => acc + Number(s?.price || 0), 0);
};

export const getAppointmentDuration = (appt: any) => {
  if (appt.services_snapshot && Array.isArray(appt.services_snapshot) && appt.services_snapshot.length > 0) {
    return appt.services_snapshot.reduce((acc: number, s: any) => acc + Number(s.duration_minutes || 0), 0);
  }
  const services = Array.isArray(appt.services) ? appt.services : (appt.services ? [appt.services] : []);
  return services.reduce((acc: number, s: any) => acc + Number(s?.duration_minutes || 0), 0);
};

export const DEFAULT_WHATSAPP_TEMPLATES: Record<string, string> = {
  scheduled: "Opa, {cliente}! Passando pra dar aquele salve sobre o seu horário na {estabelecimento} em {data} pra {servicos}. Não vai esquecer hein?! Tamo te esperando! 💈🔥",
  confirmed: "Salve, {cliente}! Bora dar um tapa no visual? Seu horário na {estabelecimento} tá confirmado pra {data} ({servicos}). A cadeira já tá reservada, só chegar! 💈",
  completed: "Fala, {cliente}! Valeu demais pela visita na {estabelecimento} hoje! O corte ficou brabo, hein? Esperamos você na próxima! 👊",
  cancelled: "Olá {cliente}. Infelizmente seu agendamento na {estabelecimento} para o dia {data} ({servicos}) precisou ser CANCELADO. Por favor, entre em contato para reagendar.",
  no_show: "E aí, {cliente}, sentimos sua falta na {estabelecimento} hoje! 😕 A gente sabe que imprevistos acontecem, mas tenta não furar da próxima, beleza? Bora agendar um novo horário pra deixar o visual em dia?"
};

export const getWhatsAppMessage = (appt: any, barbershopName: string, statusOverride?: string, templates?: any[]) => {
  const status = statusOverride || appt.status;
  const clientName = appt.clients?.name || 'Cliente';
  const dateStr = format(parseISO(appt.start_time), "dd/MM 'às' HH:mm");
  const services = getServicesNames(appt);
  const isPast = isBefore(parseISO(appt.start_time), new Date());

  // Mapeamento de status para trigger_type
  let triggerType = 'scheduled';
  if (status === 'completed') triggerType = 'completed';
  else if (status === 'confirmed') {
    // Se o horário já passou e não foi forçado o status 'confirmed', envia mensagem de ausência
    triggerType = (isPast && !statusOverride) ? 'no_show' : 'confirmed';
  }
  else if (status === 'cancelled') triggerType = 'cancelled';
  else if (status === 'no_show') triggerType = 'no_show';

  // Busca template customizado
  const customTemplate = templates?.find(t => t.trigger_type === triggerType);

  let msg = customTemplate?.message_template || DEFAULT_WHATSAPP_TEMPLATES[triggerType as keyof typeof DEFAULT_WHATSAPP_TEMPLATES] || DEFAULT_WHATSAPP_TEMPLATES.scheduled;

  msg = msg.replace(/{cliente}/g, clientName);
  msg = msg.replace(/{estabelecimento}/g, barbershopName);
  msg = msg.replace(/{data}/g, dateStr);
  msg = msg.replace(/{servicos}/g, services);
  return msg;
};

export const openWhatsApp = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  // Se não começar com 55 e tiver 10 ou 11 dígitos (padrão BR), adiciona 55
  const fullPhone = (cleanPhone.length >= 10 && !cleanPhone.startsWith('55')) ? `55${cleanPhone}` : cleanPhone;
  
  // No mobile, whatsapp://send abre direto o app sem passar pela página de confirmação do navegador
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isMobile) {
    window.location.href = `whatsapp://send?phone=${fullPhone}&text=${encodeURIComponent(message)}`;
  } else {
    // No desktop, api.whatsapp.com/send é mais garantido
    window.open(`https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(message)}`, '_blank');
  }
};

const PartnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [workingHoursOverrides, setWorkingHoursOverrides] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [financialFilters, setFinancialFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    serviceId: 'all',
    professionalId: 'all'
  });
  const [user, setUser] = useState<any>(null);
  const [whatsappTemplates, setWhatsappTemplates] = useState<any[]>([]);
  const [agendaQueryDate, setAgendaQueryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [agendaQueryProfessional, setAgendaQueryProfessional] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState<'all' | 'recurring_absent'>('all');
  const [isRemarketingModalOpen, setIsRemarketingModalOpen] = useState(false);
  const [isClientDetailsModalOpen, setIsClientDetailsModalOpen] = useState(false);
  const [selectedClientForRemarketing, setSelectedClientForRemarketing] = useState<any>(null);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<any>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [remarketingMessage, setRemarketingMessage] = useState('');
  
  // Modals
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string>('');
  const [isIntervalModalOpen, setIsIntervalModalOpen] = useState(false);
  const [editingIntervals, setEditingIntervals] = useState<any[]>([]);
  const [editingDateStr, setEditingDateStr] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'info';
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirm = (config: { title: string; message: string; onConfirm: () => void; variant?: 'danger' | 'info' }) => {
    setConfirmModalConfig(config);
    setIsConfirmModalOpen(true);
  };

  // Settings state
  const [settings, setSettings] = useState({
    name: '',
    whatsapp_number: '',
    primary_color: '#1a1a1a',
    secondary_color: '#ffffff',
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetShopId = searchParams.get('shopId');

  const handleModalImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, folder: 'avatars' | 'services') => {
    const file = event.target.files?.[0];
    if (!file || !barbershop) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    const toastId = toast.loading('Fazendo upload da imagem...');

    try {
      try {
        await supabase.storage.createBucket('barbershop-assets', { public: true });
      } catch (e) {
        // Ignore
      }

      const itemId = editingItem?.id || Math.random().toString(36).substring(2, 15);
      const fileName = `${folder}/${barbershop.id}/${itemId}`;

      const { error: uploadError } = await supabase.storage
        .from('barbershop-assets')
        .upload(fileName, file, { 
          upsert: true, 
          cacheControl: '3600',
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('barbershop-assets')
        .getPublicUrl(fileName);

      const urlWithCacheBuster = `${publicUrl}?t=${new Date().getTime()}`;
      setModalImageUrl(urlWithCacheBuster);
      
      toast.success('Imagem atualizada com sucesso!', { id: toastId });
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        toast.error(`Erro de permissão no Storage.`, { id: toastId });
      } else {
        toast.error(`Erro ao fazer upload: ${error.message}`, { id: toastId });
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file || !barbershop) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    const toastId = toast.loading(`Fazendo upload do ${type === 'logo' ? 'logo' : 'banner'}...`);

    try {
      try {
        await supabase.storage.createBucket('barbershop-assets', { public: true });
      } catch (e) {
        // Ignore if bucket already exists
      }

      const fileName = `${type}s/${barbershop.id}`;

      const { error: uploadError } = await supabase.storage
        .from('barbershop-assets')
        .upload(fileName, file, { 
          upsert: true, 
          cacheControl: '3600',
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('barbershop-assets')
        .getPublicUrl(fileName);

      const urlWithCacheBuster = `${publicUrl}?t=${new Date().getTime()}`;
      const updateData = type === 'logo' ? { logo_url: urlWithCacheBuster } : { banner_url: urlWithCacheBuster };

      const { error: updateError } = await supabase
        .from('barbershops')
        .update(updateData)
        .eq('id', barbershop.id);

      if (updateError) throw updateError;

      setBarbershop({ ...barbershop, ...updateData });
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} atualizado com sucesso!`, { id: toastId });
      
      fetchBarbershopData(barbershop.id);
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.message?.includes('row-level security') || error.message?.includes('policy') || error.message?.includes('new row violates')) {
        toast.error(`Erro de permissão no Storage. Crie o bucket 'barbershop-assets' no Supabase como Público e adicione as políticas de INSERT/UPDATE.`, { id: toastId, duration: 10000 });
      } else {
        toast.error(`Erro ao fazer upload: ${error.message}`, { id: toastId });
      }
    }
  };

  const notifiedApptIds = useRef<Set<string>>(new Set());

  // Carrega IDs já notificados do localStorage ao iniciar
  useEffect(() => {
    if (!barbershop?.id) return;
    const saved = localStorage.getItem(`notified_appts_${barbershop.id}`);
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        if (Array.isArray(ids)) {
          ids.forEach(id => notifiedApptIds.current.add(id));
        }
      } catch (e) {
        console.error('Erro ao carregar IDs notificados:', e);
      }
    }
  }, [barbershop?.id]);

  useEffect(() => {
    if (appointments.length === 0 || !barbershop?.id) return;

    // Verifica se há novos agendamentos com status 'scheduled' que ainda não foram notificados
    const newScheduled = appointments.filter(a => 
      a.status === 'scheduled' && !notifiedApptIds.current.has(a.id)
    );

    if (newScheduled.length > 0) {
      // Dispara a notificação (som e toast)
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(err => console.log('Erro ao reproduzir som:', err));
      
      toast.success('🔔 Novo agendamento recebido!', {
        description: `${newScheduled.length} novo(s) cliente(s) solicitou(aram) um horário.`,
        duration: 10000,
      });
      
      setNotification('🔔 Novo agendamento recebido!');
      setTimeout(() => setNotification(null), 6000);

      // Marca como notificado e salva no localStorage
      newScheduled.forEach(a => notifiedApptIds.current.add(a.id));
      const idsToSave = Array.from(notifiedApptIds.current).slice(-200); // Mantém apenas os últimos 200 para não sobrecarregar
      localStorage.setItem(`notified_appts_${barbershop.id}`, JSON.stringify(idsToSave));
    }

    // Garante que todos os IDs atuais sejam conhecidos (mesmo os não pendentes)
    let changed = false;
    appointments.forEach(a => {
      if (!notifiedApptIds.current.has(a.id)) {
        notifiedApptIds.current.add(a.id);
        changed = true;
      }
    });
    
    if (changed) {
      const idsToSave = Array.from(notifiedApptIds.current).slice(-200);
      localStorage.setItem(`notified_appts_${barbershop.id}`, JSON.stringify(idsToSave));
    }
  }, [appointments, barbershop?.id]);

  useEffect(() => {
    if (!barbershop) return;

    const channel = supabase
      .channel(`barbershop-${barbershop.id}-changes`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'appointments'
      }, (payload) => {
        console.log('Evento de agendamento recebido:', payload.eventType, payload);
        
        // Filtrar manualmente pelo barbershop_id para garantir que o evento é deste estabelecimento
        const newShopId = (payload.new as any)?.barbershop_id;
        const oldShopId = (payload.old as any)?.barbershop_id;
        
        if (newShopId !== barbershop.id && oldShopId !== barbershop.id) {
          return;
        }

        // Apenas recarrega os dados. O useEffect de 'appointments' cuidará da notificação.
        fetchBarbershopData(barbershop.id);
      })
      .subscribe((status) => {
        console.log('Status da inscrição Realtime:', status);
      });

    // Fallback de Polling: Atualiza os dados a cada 30 segundos caso o Realtime falhe
    const pollingInterval = setInterval(() => {
      console.log('Executando atualização automática (polling)...');
      fetchBarbershopData(barbershop.id);
    }, 30000);

    return () => { 
      supabase.removeChannel(channel); 
      clearInterval(pollingInterval);
    };
  }, [barbershop]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
      
      // 1. Tenta buscar acesso na tabela partner_access
      let { data: partnerAccess } = await supabase
        .from('partner_access')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // 2. Se não achar por ID, tenta por e-mail (pré-registro do Master)
      if (!partnerAccess && user.email) {
        const { data: accessByEmail } = await supabase
          .from('partner_access')
          .select('*')
          .ilike('email', user.email)
          .maybeSingle();
        
        if (accessByEmail) {
          // Vincula o user.id ao acesso pré-registrado
          const { data: updatedAccess, error: updateError } = await supabase
            .from('partner_access')
            .update({ user_id: user.id })
            .eq('id', accessByEmail.id)
            .select()
            .maybeSingle();
          
          if (updateError) {
            console.error('Erro ao vincular acesso:', updateError);
          } else if (updatedAccess) {
            partnerAccess = updatedAccess;
          }
        }
      }

      // 3. Agora busca o estabelecimento vinculado ao acesso ou ao e-mail do administrador
      let shop = null;
      
      // Se o Master estiver acessando um shop específico via URL
      if (targetShopId && MASTER_EMAILS.includes(user.email || '')) {
        const { data: s } = await supabase
          .from('barbershops')
          .select('*')
          .eq('id', targetShopId)
          .maybeSingle();
        shop = s;
      } else if (partnerAccess?.barbershop_id) {
        const { data: s } = await supabase
          .from('barbershops')
          .select('*')
          .eq('id', partnerAccess.barbershop_id)
          .maybeSingle();
        shop = s;
      }

      // 4. Fallback: busca por owner_id ou owner_email na tabela barbershops
      if (!shop) {
        const { data: s } = await supabase
          .from('barbershops')
          .select('*')
          .or(`owner_id.eq.${user.id},owner_email.eq.${user.email}`)
          .limit(1)
          .maybeSingle();
        shop = s;

        if (shop) {
          const updates: any = {};
          if (!shop.owner_id) updates.owner_id = user.id;
          
          if (Object.keys(updates).length > 0) {
            await supabase.from('barbershops').update(updates).eq('id', shop.id);
          }

          // Se achamos o estabelecimento mas não tinha partner_access, criamos agora (migração)
          if (!partnerAccess) {
             await supabase.from('partner_access').insert({
               barbershop_id: shop.id,
               email: user.email,
               full_name: user.user_metadata?.full_name || 'Parceiro Legado',
               user_id: user.id,
               role: 'admin'
             });
          }
        }
      }

      if (shop) {
        const isMaster = MASTER_EMAILS.includes(user.email || '');
        const isExpired = shop.expiration_date ? isBefore(parseISO(shop.expiration_date), new Date()) : true;
        
        if (!isMaster && (shop.owner_email?.startsWith('disabled:') || shop.is_active === false || isExpired)) {
          await supabase.auth.signOut();
          navigate('/login', { state: { blocked: true } });
          return;
        }
        
        setBarbershop(shop);
        fetchWhatsappTemplates(shop.id);
        setSettings({
          name: shop.name,
          whatsapp_number: shop.whatsapp_number || '',
          primary_color: shop.primary_color || '#1a1a1a',
          secondary_color: shop.secondary_color || '#ffffff',
        });
        fetchBarbershopData(shop.id);
      } else {
        if (MASTER_EMAILS.includes(user.email || '')) {
          navigate('/master');
          return;
        }
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const fetchBarbershopData = async (shopId: string) => {
    const { data: appts } = await supabase
      .from('appointments')
      .select('*, clients(name, phone), services(name, price, duration_minutes), professionals(name, avatar_url)')
      .eq('barbershop_id', shopId)
      .order('start_time', { ascending: false });
    
    const { data: svcs } = await supabase.from('services').select('*').eq('barbershop_id', shopId).order('name', { ascending: true });
    const mappedSvcs = (svcs || []).map(s => ({ ...s, image_url: s.description || s.image_url }));
    const { data: profs } = await supabase.from('professionals').select('*').eq('barbershop_id', shopId).order('name', { ascending: true });
    const { data: clis } = await supabase.from('clients').select('*').eq('barbershop_id', shopId);
    const { data: hours } = await supabase.from('working_hours').select('*').eq('barbershop_id', shopId).order('day_of_week', { ascending: true });
    const { data: overrides } = await supabase.from('working_hours_overrides').select('*').eq('barbershop_id', shopId);

    setAppointments(appts || []);
    setServices(mappedSvcs);
    setProfessionals(profs || []);
    setClients(clis || []);
    setWorkingHours(hours || []);
    setWorkingHoursOverrides(overrides || []);
    setLoading(false);
  };

  const fetchWhatsappTemplates = async (shopId: string) => {
    const { data } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('barbershop_id', shopId);
    setWhatsappTemplates(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDelete = async (table: string, id: string) => {
    openConfirm({
      title: 'Excluir Item',
      message: 'Tem certeza que deseja excluir este item?',
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) toast.error(error.message);
        else {
          toast.success('Item excluído com sucesso!');
          if (barbershop) fetchBarbershopData(barbershop.id);
        }
      }
    });
  };

  const handleSaveSettings = async () => {
    if (!barbershop) return;
    try {
      const { error } = await supabase
        .from('barbershops')
        .update(settings)
        .eq('id', barbershop.id);
      
      if (error) throw error;
      toast.success('Configurações salvas!');
      createLog('Configurações', 'Alterou configurações do estabelecimento', barbershop.id);
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    }
  };

  const handleSaveTemplate = async (triggerType: string, template: string) => {
    if (!barbershop) return;
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .upsert({
          barbershop_id: barbershop.id,
          trigger_type: triggerType,
          message_template: template
        }, { onConflict: 'barbershop_id, trigger_type' });
      
      if (error) throw error;
      toast.success('Modelo salvo com sucesso!');
      fetchWhatsappTemplates(barbershop.id);
    } catch (error: any) {
      toast.error('Erro ao salvar modelo: ' + error.message);
    }
  };

  const handleSaveService = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      barbershop_id: barbershop?.id,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      duration_minutes: Number(formData.get('duration')),
      description: modalImageUrl || null,
    };

    try {
      if (editingItem) {
        const { error } = await supabase.from('services').update(data).eq('id', editingItem.id);
        if (error) throw error;
        createLog('Serviço', `Editou serviço: ${data.name}`, barbershop?.id);
      } else {
        const { error } = await supabase.from('services').insert(data);
        if (error) throw error;
        createLog('Serviço', `Criou novo serviço: ${data.name}`, barbershop?.id);
      }
      setIsServiceModalOpen(false);
      toast.success('Serviço salvo com sucesso!');
      if (barbershop) fetchBarbershopData(barbershop.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveProfessional = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      barbershop_id: barbershop?.id,
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
      avatar_url: modalImageUrl || null,
    };

    try {
      if (editingItem) {
        await supabase.from('professionals').update(data).eq('id', editingItem.id);
      } else {
        await supabase.from('professionals').insert(data);
      }
      setIsProfessionalModalOpen(false);
      toast.success('Profissional salvo com sucesso!');
      if (barbershop) fetchBarbershopData(barbershop.id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateStatus = async (appointment: any, newStatus: string, triggerTypeOverride?: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointment.id);
    
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Status do agendamento atualizado!');
    if (barbershop) fetchBarbershopData(barbershop.id);

    // Enviar notificação via WhatsApp se houver telefone
    if (appointment.clients?.phone && ['confirmed', 'cancelled', 'completed', 'no_show'].includes(newStatus)) {
      const msg = getWhatsAppMessage(appointment, barbershop?.name || 'Estabelecimento', triggerTypeOverride || newStatus, whatsappTemplates);
      openWhatsApp(appointment.clients.phone, msg);
    }
  };

  const handleSaveWorkingHours = async (dayIndex: number, field: string, value: any) => {
    if (!barbershop) return;
    
    // 1. Tentar encontrar o registro no estado local
    let existing = workingHours.find(h => h.day_of_week === dayIndex);
    
    // 2. Se não estiver no estado local, buscar no banco para ter certeza absoluta
    if (!existing) {
      const { data: dbHours } = await supabase
        .from('working_hours')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .eq('day_of_week', dayIndex)
        .limit(1);
      
      if (dbHours && dbHours.length > 0) existing = dbHours[0];
    }

    const data: any = {
      barbershop_id: barbershop.id,
      day_of_week: dayIndex,
      start_time: existing ? (field === 'start_time' ? value : (existing.start_time || '09:00')) : (field === 'start_time' ? value : '09:00'),
      end_time: existing ? (field === 'end_time' ? value : (existing.end_time || '18:00')) : (field === 'end_time' ? value : '18:00'),
      intervals: existing ? (field === 'intervals' ? value : (existing.intervals || [])) : (field === 'intervals' ? value : []),
      is_active: existing ? (field === 'is_active' ? value : existing.is_active) : (field === 'is_active' ? value : true)
    };

    try {
      let error;
      if (existing?.id) {
        // Se temos o ID, fazemos um UPDATE explícito
        const { error: updateError } = await supabase
          .from('working_hours')
          .update(data)
          .eq('id', existing.id);
        error = updateError;
      } else {
        // Se não temos o ID, tentamos um UPSERT baseado nas colunas únicas
        // Isso é mais seguro que um INSERT puro caso o registro tenha sido criado entre o fetch e o save
        const { error: upsertError } = await supabase
          .from('working_hours')
          .upsert(data, { onConflict: 'barbershop_id,day_of_week' });
        error = upsertError;
      }
      
      if (error) throw error;
      
      // Recarregar dados para garantir sincronia
      toast.success('Horário salvo com sucesso!');
      fetchBarbershopData(barbershop.id);
    } catch (error: any) {
      console.error('Erro ao salvar horário:', error);
      toast.error('Erro ao salvar horário: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleSaveDateOverride = async (date: string, field: string, value: any) => {
    if (!barbershop) return;
    
    let existing = workingHoursOverrides.find(o => o.specific_date === date);
    
    if (!existing) {
      const { data: dbOverrides } = await supabase
        .from('working_hours_overrides')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .eq('specific_date', date)
        .limit(1);
      
      if (dbOverrides && dbOverrides.length > 0) existing = dbOverrides[0];
    }
    
    const data: any = {
      barbershop_id: barbershop.id,
      specific_date: date,
      start_time: existing ? (field === 'start_time' ? value : (existing.start_time || '09:00')) : (field === 'start_time' ? value : '09:00'),
      end_time: existing ? (field === 'end_time' ? value : (existing.end_time || '18:00')) : (field === 'end_time' ? value : '18:00'),
      intervals: existing ? (field === 'intervals' ? value : (existing.intervals || [])) : (field === 'intervals' ? value : []),
      is_active: existing ? (field === 'is_active' ? value : existing.is_active) : (field === 'is_active' ? value : true)
    };

    try {
      let error;
      if (existing?.id) {
        const { error: updateError } = await supabase
          .from('working_hours_overrides')
          .update(data)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: upsertError } = await supabase
          .from('working_hours_overrides')
          .upsert(data, { onConflict: 'barbershop_id,specific_date' });
        error = upsertError;
      }
      
      if (error) throw error;
      toast.success('Exceção salva com sucesso!');
      fetchBarbershopData(barbershop.id);
    } catch (error: any) {
      console.error('Erro ao salvar exceção:', error);
      toast.error('Erro ao salvar exceção: ' + error.message);
    }
  };

  const handleDeleteDateOverride = async (id: string) => {
    try {
      const { error } = await supabase
        .from('working_hours_overrides')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Exceção excluída com sucesso!');
      if (barbershop) fetchBarbershopData(barbershop.id);
    } catch (error: any) {
      toast.error('Erro ao excluir exceção: ' + error.message);
    }
  };

  const renderCalendar = () => {
    const start = startOfDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
    const end = endOfDay(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));
    
    // Ajustar para começar no Domingo
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(new Date(day));
      day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 text-[10px] font-bold uppercase hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hoje
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="text-center text-[9px] font-black uppercase text-gray-400 py-2">{d}</div>
          ))}
          {days.map((d, i) => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const isCurrentMonth = d.getMonth() === currentMonth.getMonth();
            const override = workingHoursOverrides.find(o => o.specific_date === dateStr);
            const dayOfWeek = d.getDay();
            const defaultHours = workingHours.find(h => h.day_of_week === dayOfWeek);
            
            const isPastDay = isBefore(startOfDay(d), startOfDay(new Date()));
            const isActive = override ? override.is_active : (defaultHours?.is_active ?? false);
            const isToday = isSameDay(d, new Date());

            return (
              <div
                key={i}
                className={`aspect-square p-1 rounded-xl border flex flex-col items-center justify-between transition-all relative ${
                  !isCurrentMonth ? 'opacity-20 bg-gray-50' : 
                  isPastDay ? 'opacity-60 bg-gray-200 cursor-not-allowed' :
                  !isActive ? 'bg-red-50 border-red-100' : (override ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200')
                } ${isToday ? 'ring-2 ring-black ring-offset-2' : ''}`}
              >
                <span className={`text-[10px] font-bold ${isToday ? 'text-black' : 'text-gray-500'}`}>{d.getDate()}</span>
                {isCurrentMonth && !isPastDay && (
                  <div className="flex flex-col items-center gap-1 w-full h-full justify-center">
                    <button 
                      onClick={() => {
                        // Lógica corrigida para buscar intervalos:
                        // 1. Se houver override, tenta usar override.intervals, depois override.start_time/end_time
                        // 2. Se não houver override, usa defaultHours.intervals, depois defaultHours.start_time/end_time
                        let intervals = [];
                        if (override && override.intervals && Array.isArray(override.intervals) && override.intervals.length > 0) {
                          intervals = override.intervals;
                        } else if (override && override.start_time && override.end_time) {
                          intervals = [{ start: override.start_time, end: override.end_time }];
                        } else if (defaultHours && defaultHours.intervals && Array.isArray(defaultHours.intervals) && defaultHours.intervals.length > 0) {
                          intervals = defaultHours.intervals;
                        } else {
                          intervals = [{ start: defaultHours?.start_time || '09:00', end: defaultHours?.end_time || '18:00' }];
                        }
                        
                        setEditingIntervals(isActive ? intervals : [{ start: '09:00', end: '18:00' }]);
                        setEditingDateStr(dateStr);
                        setIsIntervalModalOpen(true);
                      }}
                      className={`w-full h-full flex items-center justify-center rounded-lg transition-colors ${
                        isActive ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-red-100 text-red-400 hover:bg-red-200'
                      }`}
                    >
                      {isActive ? <Edit className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  </div>
                )}
                {override && (
                  <div className="absolute top-1 right-1 w-1 h-1 bg-blue-500 rounded-full" title="Horário Customizado" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <LoadingScreen />;

  if (!barbershop && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-2xl font-bold">Você ainda não tem um estabelecimento vinculado.</h1>
        <p className="text-gray-500">Entre em contato com o suporte Master para vincular sua conta.</p>
        <Button onClick={() => navigate('/')}>Voltar para Home</Button>
      </div>
    );
  }

  const filteredFinancialAppointments = appointments.filter(a => {
    const apptDate = format(parseISO(a.start_time), 'yyyy-MM-dd');
    const isCompleted = a.status === 'completed';
    const isInDateRange = apptDate >= financialFilters.startDate && apptDate <= financialFilters.endDate;
    const hasSnapshot = !!(a.services_snapshot && Array.isArray(a.services_snapshot) && a.services_snapshot.length > 0);
    const isServiceMatch = financialFilters.serviceId === 'all' || 
      (hasSnapshot 
        ? a.services_snapshot?.some((s: any) => s.id === financialFilters.serviceId)
        : a.service_id === financialFilters.serviceId);
    const isProfessionalMatch = financialFilters.professionalId === 'all' || a.professional_id === financialFilters.professionalId;
    
    return isCompleted && isInDateRange && isServiceMatch && isProfessionalMatch;
  });

  const totalRevenue = filteredFinancialAppointments.reduce((acc, a) => acc + getAppointmentPrice(a), 0);

  const headerColor = barbershop?.primary_color || '#1a1a1a';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="border-b p-4 sm:p-6 flex justify-between items-center sticky top-0 z-10 text-white" style={{ backgroundColor: headerColor }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors mr-1"
            title="Voltar para o Início"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {barbershop?.logo_url ? (
            <img src={barbershop.logo_url} className="w-10 h-10 rounded-xl object-cover border border-white/20" alt="Logo" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
              <Store className="w-5 h-5 text-white" />
            </div>
          )}
          <h1 className="font-bold text-base sm:text-lg">{barbershop?.name || 'Portal do Parceiro'}</h1>
        </div>
        <button onClick={handleLogout} className="p-2 text-white/70 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">Resumo de Hoje</h2>
              <p className="text-xs text-gray-400 font-bold uppercase">{format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Faturamento Hoje</p>
                <p className="text-2xl font-black text-green-700">
                  R$ {appointments
                    .filter(a => isSameDay(parseISO(a.start_time), new Date()) && a.status === 'completed')
                    .reduce((acc, a) => acc + getAppointmentPrice(a), 0)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Atendimentos Hoje</p>
                <p className="text-2xl font-black">
                  {appointments.filter(a => isSameDay(parseISO(a.start_time), new Date()) && a.status === 'completed').length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pendentes Hoje</p>
                <p className="text-2xl font-black text-yellow-600">
                  {appointments.filter(a => isSameDay(parseISO(a.start_time), new Date()) && a.status === 'scheduled').length}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Confirmados Hoje</p>
                <p className="text-2xl font-black text-blue-600">
                  {appointments.filter(a => isSameDay(parseISO(a.start_time), new Date()) && a.status === 'confirmed').length}
                </p>
              </Card>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">Agenda de Hoje</h2>
                <button onClick={() => setActiveTab('agenda')} className="text-xs font-bold text-gray-400">Ver Agenda</button>
              </div>
              {appointments
                .filter(a => isSameDay(parseISO(a.start_time), new Date()) && (a.status === 'confirmed' || a.status === 'scheduled'))
                .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
                .map((appt) => (
                <Card key={appt.id} className={`p-4 flex items-center justify-between border-l-4 ${
                  appt.status === 'completed' ? 'border-l-green-500' : 
                  appt.status === 'confirmed' ? 'border-l-blue-500' : 
                  appt.status === 'cancelled' ? 'border-l-red-500' : 'border-l-yellow-500'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="text-gray-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{appt.clients?.name}</p>
                      <p className="text-[10px] text-gray-500">{getServicesNames(appt)} • {appt.professionals?.name}</p>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-sm">{format(parseISO(appt.start_time), 'HH:mm')}</p>
                        <p className={`text-[9px] font-bold uppercase ${
                          appt.status === 'completed' ? 'text-green-500' : 
                          appt.status === 'confirmed' ? 'text-blue-500' : 
                          appt.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'
                        }`}>{appt.status === 'scheduled' ? 'Pendente' : appt.status}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {appt.status === 'scheduled' && (
                          <div className="flex gap-2 sm:gap-1">
                            <button 
                              onClick={() => handleUpdateStatus(appt, 'confirmed')}
                              className="p-3 sm:p-1 bg-blue-50 text-blue-600 rounded-xl sm:rounded-lg hover:bg-blue-100 transition-colors"
                              title="Confirmar"
                            >
                              <CheckCircle2 className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(appt, 'cancelled')}
                              className="p-3 sm:p-1 bg-red-50 text-red-600 rounded-xl sm:rounded-lg hover:bg-red-100 transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                </Card>
              ))}
              {appointments.filter(a => isSameDay(parseISO(a.start_time), new Date())).length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-bold">Nenhum agendamento para hoje</p>
                </div>
              )}
            </div>

            {/* Próximos Dias */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Próximos Dias</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Confirmados</p>
              </div>
              
              {(() => {
                const futureAppts = appointments
                  .filter(a => a.status === 'confirmed' && parseISO(a.start_time) > new Date() && !isSameDay(parseISO(a.start_time), new Date()))
                  .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());

                const groups = futureAppts.reduce((acc: any, appt) => {
                  const date = format(parseISO(appt.start_time), 'yyyy-MM-dd');
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(appt);
                  return acc;
                }, {});

                const entries = Object.entries(groups);

                if (entries.length === 0) {
                  return (
                    <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-bold">Nenhum agendamento confirmado para os próximos dias</p>
                    </div>
                  );
                }

                return entries.map(([date, appts]: [string, any]) => (
                  <div key={date} className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                      {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <div className="space-y-2">
                      {appts.map((appt: any) => (
                        <Card key={appt.id} className="p-4 flex items-center justify-between border-l-4 border-l-blue-500">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="text-gray-400 w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{appt.clients?.name}</p>
                              <p className="text-[10px] text-gray-500">{getServicesNames(appt)} • {appt.professionals?.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{format(parseISO(appt.start_time), 'HH:mm')}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xl">Agenda</h2>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                  Gerencie agendamentos
                </p>
              </div>
            </div>
            
            {/* Seletor de Status */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {[
                { id: 'scheduled', label: 'Pendentes (Geral)', color: 'bg-yellow-500' },
                { id: 'confirmed', label: 'Confirmados (Hoje)', color: 'bg-blue-500' },
                { id: 'completed', label: 'Finalizados (Hoje)', color: 'bg-green-500' },
                { id: 'cancelled', label: 'Cancelados (Hoje)', color: 'bg-red-500' }
              ].map((column) => {
                const columnAppts = appointments.filter(a => 
                  a.status === column.id && 
                  (column.id === 'scheduled' ? true : isSameDay(parseISO(a.start_time), new Date()))
                ).sort((a, b) => {
                  if (column.id === 'scheduled') {
                    const aIsToday = isSameDay(parseISO(a.start_time), new Date());
                    const bIsToday = isSameDay(parseISO(b.start_time), new Date());
                    if (aIsToday && !bIsToday) return -1;
                    if (!aIsToday && bIsToday) return 1;
                  }
                  return parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime();
                });
                
                return (
                  <div key={column.id} className="min-w-[280px] w-[280px] space-y-4 snap-start">
                    <div className="flex items-center gap-2 px-1">
                      <div className={`w-2 h-2 rounded-full ${column.color}`} />
                      <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500">{column.label}</h3>
                      <span className="ml-auto text-[10px] font-bold bg-gray-200 px-2 py-0.5 rounded-full">
                        {columnAppts.length}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {columnAppts.map((appt) => (
                        <Card 
                          key={appt.id} 
                          className={`p-4 space-y-3 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            column.id === 'scheduled' && isSameDay(parseISO(appt.start_time), new Date()) ? 'border-l-yellow-400 bg-yellow-50/30' :
                            column.id === 'confirmed' ? 'border-l-blue-400 bg-blue-50/30' :
                            column.id === 'completed' ? 'border-l-green-400 bg-green-50/30' :
                            column.id === 'cancelled' ? 'border-l-red-400 bg-red-50/30' :
                            'border-l-gray-200'
                          }`}
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setIsAppointmentModalOpen(true);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm">{appt.clients?.name}</p>
                              <p className="text-[10px] text-gray-500">{getServicesNames(appt)} • {appt.professionals?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-xs">{format(parseISO(appt.start_time), 'HH:mm')}</p>
                              {!isSameDay(parseISO(appt.start_time), new Date()) ? (
                                <p className="text-[9px] text-gray-400 font-bold">{format(parseISO(appt.start_time), 'dd/MM')}</p>
                              ) : column.id === 'scheduled' ? (
                                <p className="text-[9px] text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded font-bold mt-1 inline-block">HOJE</p>
                              ) : null}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2 border-t border-gray-50">
                            {column.id === 'scheduled' && (
                              <>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(appt, 'confirmed');
                                  }}
                                  className="flex-1 bg-blue-50 text-blue-600 text-[10px] font-bold py-3 sm:py-1.5 rounded-lg"
                                >
                                  Confirmar
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(appt, 'cancelled');
                                  }}
                                  className="flex-1 bg-red-50 text-red-600 text-[10px] font-bold py-3 sm:py-1.5 rounded-lg"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            {column.id === 'confirmed' && (
                              <>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(appt, 'completed');
                                  }}
                                  className="flex-1 bg-green-50 text-green-600 text-[10px] font-bold py-3 sm:py-1.5 rounded-lg"
                                >
                                  Finalizar
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(appt, 'cancelled');
                                  }}
                                  className="flex-1 bg-red-50 text-red-600 text-[10px] font-bold py-3 sm:py-1.5 rounded-lg"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            {(column.id === 'completed' || column.id === 'cancelled') && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(appt, 'scheduled');
                                }}
                                className="flex-1 bg-gray-50 text-gray-600 text-[10px] font-bold py-3 sm:py-1.5 rounded-lg"
                              >
                                Reabrir
                              </button>
                            )}
                          </div>
                        </Card>
                      ))}
                      {columnAppts.length === 0 && (
                        <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                          <p className="text-[10px] font-bold uppercase">Vazio</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seção de Consulta por Dia */}
            <div className="mt-8 space-y-4 border-t pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Consultar Dia</h3>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                    Veja todos os agendamentos de uma data
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={agendaQueryDate}
                  onChange={(e) => setAgendaQueryDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm font-medium flex-1"
                />
                <select
                  value={agendaQueryProfessional}
                  onChange={(e) => setAgendaQueryProfessional(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm font-medium flex-1"
                >
                  <option value="all">Todos os Profissionais</option>
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {appointments
                  .filter(a => {
                    const apptDate = format(parseISO(a.start_time), 'yyyy-MM-dd');
                    const matchesDate = apptDate === agendaQueryDate;
                    const matchesProf = agendaQueryProfessional === 'all' || a.professional_id === agendaQueryProfessional;
                    return matchesDate && matchesProf;
                  })
                  .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
                  .map((appt) => (
                    <Card 
                      key={appt.id} 
                      className={`p-4 flex items-center justify-between border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        appt.status === 'completed' ? 'border-l-green-500' : 
                        appt.status === 'confirmed' ? 'border-l-blue-500' : 
                        appt.status === 'cancelled' ? 'border-l-red-500' : 'border-l-yellow-500'
                      }`}
                      onClick={() => {
                        setSelectedAppointment(appt);
                        setIsAppointmentModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="text-gray-400 w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{appt.clients?.name}</p>
                          <p className="text-[10px] text-gray-500">{getServicesNames(appt)} • {appt.professionals?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-sm">{format(parseISO(appt.start_time), 'HH:mm')}</p>
                          <p className={`text-[9px] font-bold uppercase ${
                            appt.status === 'completed' ? 'text-green-500' : 
                            appt.status === 'confirmed' ? 'text-blue-500' : 
                            appt.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'
                          }`}>{appt.status === 'scheduled' ? 'Pendente' : appt.status}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {appt.status === 'scheduled' && (
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(appt, 'confirmed');
                                }}
                                className="p-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Confirmar"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(appt, 'cancelled');
                                }}
                                className="p-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                {appointments.filter(a => {
                  const apptDate = format(parseISO(a.start_time), 'yyyy-MM-dd');
                  const matchesDate = apptDate === agendaQueryDate;
                  const matchesProf = agendaQueryProfessional === 'all' || a.professional_id === agendaQueryProfessional;
                  return matchesDate && matchesProf;
                }).length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-bold">Nenhum agendamento para esta data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">Clientes</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setClientFilter('all')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${clientFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setClientFilter('recurring_absent')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${clientFilter === 'recurring_absent' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  Ausentes (25 dias+)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {clients
                .filter(client => {
                  if (clientFilter === 'all') return true;
                  
                  const clientAppts = appointments.filter(a => a.client_id === client.id && a.status === 'completed');
                  if (clientAppts.length < 2) return false; // Not recurring

                  const lastAppt = clientAppts.sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime())[0];
                  if (!lastAppt) return false;

                  const daysSinceLast = differenceInDays(new Date(), parseISO(lastAppt.start_time));
                  return daysSinceLast >= 25;
                })
                .map(client => {
                  const clientAppts = appointments.filter(a => a.client_id === client.id && a.status === 'completed');
                  const lastAppt = clientAppts.sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime())[0];
                  const daysSinceLast = lastAppt ? differenceInDays(new Date(), parseISO(lastAppt.start_time)) : null;

                  return (
                    <Card 
                      key={client.id} 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group"
                      onClick={() => {
                        setSelectedClientForDetails(client);
                        setIsClientDetailsModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <User className="text-gray-400 w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.phone}</p>
                          {daysSinceLast !== null && (
                            <p className={`text-[10px] font-bold uppercase mt-1 ${daysSinceLast >= 25 ? 'text-orange-500' : 'text-gray-400'}`}>
                              Última vez: {daysSinceLast} dias atrás
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Atendimentos</p>
                          <p className="font-bold">{clientAppts.length}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientForRemarketing(client);
                            setIsRemarketingModalOpen(true);
                          }}
                          className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">Financeiro</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Apenas Finalizados
              </div>
            </div>

            {/* Filtros */}
            <Card className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Início</label>
                  <Input 
                    type="date" 
                    value={financialFilters.startDate} 
                    onChange={(e: any) => setFinancialFilters({...financialFilters, startDate: e.target.value})}
                    className="h-8 text-[11px] font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Fim</label>
                  <Input 
                    type="date" 
                    value={financialFilters.endDate} 
                    onChange={(e: any) => setFinancialFilters({...financialFilters, endDate: e.target.value})}
                    className="h-8 text-[11px] font-bold"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Serviço</label>
                  <select 
                    value={financialFilters.serviceId}
                    onChange={(e) => setFinancialFilters({...financialFilters, serviceId: e.target.value})}
                    className="w-full h-8 bg-gray-50 border-none rounded-lg text-[11px] font-bold px-2 focus:ring-1 focus:ring-black"
                  >
                    <option value="all">Todos os Serviços</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Profissional</label>
                  <select 
                    value={financialFilters.professionalId}
                    onChange={(e) => setFinancialFilters({...financialFilters, professionalId: e.target.value})}
                    className="w-full h-8 bg-gray-50 border-none rounded-lg text-[11px] font-bold px-2 focus:ring-1 focus:ring-black"
                  >
                    <option value="all">Todos os Profissionais</option>
                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            </Card>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6 bg-green-50 border-green-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-bold uppercase tracking-wider">Faturamento Período</p>
                  <p className="text-4xl font-black text-green-700 mt-2">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-green-600 font-bold uppercase">Atendimentos</p>
                  <p className="text-xl font-black text-green-700">{filteredFinancialAppointments.length}</p>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Resumo por Profissional</h3>
              {professionals.map(prof => {
                const profRevenue = filteredFinancialAppointments
                  .filter(a => a.professional_id === prof.id)
                  .reduce((acc, a) => acc + getAppointmentPrice(a), 0);
                const profCount = filteredFinancialAppointments.filter(a => a.professional_id === prof.id).length;
                
                if (profRevenue === 0 && financialFilters.professionalId !== 'all' && financialFilters.professionalId !== prof.id) return null;
                if (profRevenue === 0 && financialFilters.professionalId === 'all') return null;

                return (
                  <Card key={prof.id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={prof.avatar_url || 'https://i.pravatar.cc/150'} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-bold">{prof.name}</p>
                        <p className="text-[10px] text-gray-400">{profCount} atendimentos</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">R$ {profRevenue.toFixed(2)}</p>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Resumo por Serviço</h3>
              {services.map(service => {
                const serviceAppointments = filteredFinancialAppointments.filter(a => {
                  const hasSnapshot = !!(a.services_snapshot && Array.isArray(a.services_snapshot) && a.services_snapshot.length > 0);
                  return hasSnapshot 
                    ? a.services_snapshot?.some((s: any) => s.id === service.id)
                    : a.service_id === service.id;
                });

                const serviceRevenue = serviceAppointments.reduce((acc, a) => {
                  const hasSnapshot = !!(a.services_snapshot && Array.isArray(a.services_snapshot) && a.services_snapshot.length > 0);
                  if (hasSnapshot) {
                    const s = a.services_snapshot?.find((s: any) => s.id === service.id);
                    return acc + Number(s ? s.price : 0);
                  }
                  return acc + getAppointmentPrice(a);
                }, 0);

                const count = serviceAppointments.length;
                
                if (serviceRevenue === 0 && financialFilters.serviceId !== 'all' && financialFilters.serviceId !== service.id) return null;
                if (serviceRevenue === 0 && financialFilters.serviceId === 'all') return null;

                return (
                  <Card key={service.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{service.name}</p>
                      <p className="text-[10px] text-gray-400">{count} atendimentos</p>
                    </div>
                    <p className="font-bold text-green-600">R$ {serviceRevenue.toFixed(2)}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'servicos' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('ajustes')}
                className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-xl flex-1 truncate">Serviços</h2>
              <Button size="sm" className="flex-shrink-0" onClick={() => { setEditingItem(null); setModalImageUrl(''); setIsServiceModalOpen(true); }}>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Novo Serviço</span><span className="sm:hidden">Novo</span>
              </Button>
            </div>
            <div className="space-y-3">
              {services.map(service => (
                <Card key={service.id} className="p-4 flex items-center justify-between overflow-hidden">
                  <div className="flex items-center gap-4">
                    {service.image_url ? (
                      <img src={service.image_url} alt={service.name} className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Image className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.duration_minutes} min • R$ {service.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400" onClick={() => { setEditingItem(service); setModalImageUrl(service.image_url || ''); setIsServiceModalOpen(true); }}><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-red-400" onClick={() => handleDelete('services', service.id)}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profissionais' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('ajustes')}
                className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-xl flex-1 truncate">Profissionais</h2>
              <Button size="sm" className="flex-shrink-0" onClick={() => { setEditingItem(null); setModalImageUrl(''); setIsProfessionalModalOpen(true); }}>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Novo Profissional</span><span className="sm:hidden">Novo</span>
              </Button>
            </div>
            <div className="space-y-3">
              {professionals.map(prof => (
                <Card key={prof.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={prof.avatar_url || 'https://i.pravatar.cc/150'} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold">{prof.name}</p>
                      <p className="text-xs text-gray-500">{prof.bio}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400" onClick={() => { setEditingItem(prof); setModalImageUrl(prof.avatar_url || ''); setIsProfessionalModalOpen(true); }}><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-red-400" onClick={() => handleDelete('professionals', prof.id)}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ajustes' && (
          <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-2xl">Ajustes</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Sistema Online
              </div>
            </div>

            {/* Gerenciamento */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Gerenciamento</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card 
                  className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors border-none shadow-sm bg-blue-50/50"
                  onClick={() => setActiveTab('servicos')}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                    <Store className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">Serviços</span>
                </Card>
                <Card 
                  className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-purple-50 transition-colors border-none shadow-sm bg-purple-50/50"
                  onClick={() => setActiveTab('profissionais')}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">Profissionais</span>
                </Card>
                <Card 
                  className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-green-50 transition-colors border-none shadow-sm bg-green-50/50"
                  onClick={() => setIsWhatsappModalOpen(true)}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">WhatsApp</span>
                </Card>
                <Card 
                  className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-amber-50 transition-colors border-none shadow-sm bg-amber-50/50"
                  onClick={() => {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                    audio.play().then(() => {
                      toast.success('Alertas sonoros ativados!');
                    }).catch(() => {
                      toast.error('Clique novamente para ativar o som');
                    });
                  }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm">Testar Som</span>
                </Card>
              </div>

              {/* Personalização Visual */}
              <div className="space-y-4 pt-4">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Personalização Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="font-bold text-sm">Logo do Estabelecimento</h3>
                        <p className="text-xs text-gray-500 mt-1">Imagem quadrada (ex: 400x400px). Aparece no seu perfil e nos agendamentos.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                          {barbershop?.logo_url ? (
                            <img src={barbershop.logo_url} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Store className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input 
                            type="file" 
                            id="logo-upload" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'logo')}
                          />
                          <label 
                            htmlFor="logo-upload" 
                            className="inline-flex items-center justify-center px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-800 transition-colors w-full sm:w-auto"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Alterar Logo
                          </label>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="font-bold text-sm">Banner de Fundo</h3>
                        <p className="text-xs text-gray-500 mt-1">Imagem horizontal (ex: 1200x400px). Fica no topo da sua página.</p>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="w-full h-24 rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50">
                          {barbershop?.banner_url ? (
                            <img src={barbershop.banner_url} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Image className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <input 
                            type="file" 
                            id="banner-upload" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'banner')}
                          />
                          <label 
                            htmlFor="banner-upload" 
                            className="inline-flex items-center justify-center px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-800 transition-colors w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Alterar Banner
                          </label>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Configurações de Agendamento */}
              <div className="space-y-4 pt-4">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Configurações de Agendamento</h3>
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-sm">Intervalo de Agendamento</h3>
                      <p className="text-xs text-gray-500 mt-1">Defina o intervalo de tempo entre os horários disponíveis na sua agenda.</p>
                    </div>
                    <select 
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-black outline-none"
                      value={barbershop?.appointment_interval || 30}
                      onChange={async (e) => {
                        const newInterval = parseInt(e.target.value);
                        if (barbershop) {
                          const { error } = await supabase.from('barbershops').update({ appointment_interval: newInterval }).eq('id', barbershop.id);
                          if (!error) {
                            toast.success('Intervalo atualizado com sucesso!');
                            setBarbershop({ ...barbershop, appointment_interval: newInterval });
                            fetchBarbershopData(barbershop.id);
                          } else {
                            console.error('Erro ao atualizar intervalo:', error);
                            toast.error(`Erro ao atualizar intervalo: ${error.message}`);
                          }
                        }
                      }}
                    >
                      <option value={10}>10 em 10 minutos</option>
                      <option value={15}>15 em 15 minutos</option>
                      <option value={20}>20 em 20 minutos</option>
                      <option value={30}>30 em 30 minutos</option>
                      <option value={40}>40 em 40 minutos</option>
                      <option value={45}>45 em 45 minutos</option>
                      <option value={60}>1 em 1 hora</option>
                      <option value={90}>1 hora e 30 minutos</option>
                      <option value={120}>2 em 2 horas</option>
                      <option value={180}>3 em 3 horas</option>
                    </select>
                  </div>
                </Card>
              </div>

              {/* Disponibilidade */}
              <div className="space-y-4 pt-4">
                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Disponibilidade</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm">Calendário Mensal</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[10px] uppercase font-bold text-gray-400"
                        onClick={() => {
                          if (barbershop) {
                            openConfirm({
                              title: 'Resetar Horários',
                              message: 'Deseja limpar todas as exceções e voltar aos horários padrão?',
                              variant: 'danger',
                              onConfirm: async () => {
                                await supabase.from('working_hours_overrides').delete().eq('barbershop_id', barbershop.id);
                                fetchBarbershopData(barbershop.id);
                              }
                            });
                          }
                        }}
                      >
                        Resetar
                      </Button>
                    </div>
                    {renderCalendar()}
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold text-sm mb-4">Horários Padrão (Semanal)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
                        const config = workingHours.find(h => h.day_of_week === index) || {
                          is_active: false,
                          start_time: '09:00',
                          end_time: '18:00'
                        };
                        
                        return (
                          <div key={day} className={`p-4 transition-all border rounded-2xl flex flex-col justify-between ${config.is_active ? 'bg-white border-gray-100' : 'bg-gray-50 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${config.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <p className="font-bold text-xs">{day}</p>
                              </div>
                              <button 
                                onClick={() => handleSaveWorkingHours(index, 'is_active', !config.is_active)}
                                className={`w-8 h-4 rounded-full transition-colors relative ${config.is_active ? 'bg-black' : 'bg-gray-300'}`}
                              >
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${config.is_active ? 'right-0.5' : 'left-0.5'}`} />
                              </button>
                            </div>
                            
                            {config.is_active ? (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  {(() => {
                                    const intervals = (config.intervals && Array.isArray(config.intervals) && config.intervals.length > 0)
                                      ? config.intervals
                                      : [{ start: config.start_time || '09:00', end: config.end_time || '18:00' }];
                                    
                                    return intervals.map((interval: any, i: number) => (
                                      <div key={i} className="space-y-1 p-2 bg-gray-100 rounded-xl relative group">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[7px] font-black text-gray-400 uppercase">Turno {i + 1}</span>
                                          {intervals.length > 1 && (
                                            <button 
                                              onClick={() => {
                                                const newIntervals = intervals.filter((_: any, idx: number) => idx !== i);
                                                handleSaveWorkingHours(index, 'intervals', newIntervals);
                                              }}
                                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <Trash2 className="w-2.5 h-2.5" />
                                            </button>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <input 
                                            type="time" 
                                            value={(interval.start || '09:00').substring(0, 5)}
                                            onChange={(e) => {
                                              const newIntervals = [...intervals];
                                              newIntervals[i] = { ...newIntervals[i], start: e.target.value };
                                              handleSaveWorkingHours(index, 'intervals', newIntervals);
                                            }}
                                            className="w-full p-1 bg-white border-none rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-black"
                                          />
                                          <input 
                                            type="time" 
                                            value={(interval.end || '18:00').substring(0, 5)}
                                            onChange={(e) => {
                                              const newIntervals = [...intervals];
                                              newIntervals[i] = { ...newIntervals[i], end: e.target.value };
                                              handleSaveWorkingHours(index, 'intervals', newIntervals);
                                            }}
                                            className="w-full p-1 bg-white border-none rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-black"
                                          />
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full h-6 text-[8px] uppercase font-bold text-gray-400 border border-dashed border-gray-200 hover:border-gray-400 rounded-xl"
                                  onClick={() => {
                                    const intervals = (config.intervals && Array.isArray(config.intervals) && config.intervals.length > 0)
                                      ? config.intervals
                                      : [{ start: config.start_time || '09:00', end: config.end_time || '18:00' }];
                                    const lastEnd = intervals[intervals.length - 1].end;
                                    const newIntervals = [...intervals, { start: lastEnd, end: '22:00' }];
                                    handleSaveWorkingHours(index, 'intervals', newIntervals);
                                  }}
                                >
                                  <Plus className="w-2 h-2 mr-1" /> Adicionar Turno
                                </Button>
                              </div>
                            ) : (
                              <div className="h-[72px] flex items-center justify-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Fechado</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </div>


            
            {/* Links e Acesso */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Divulgação</h3>
              <Card className="p-8 border-none rounded-[32px] overflow-hidden relative bg-zinc-950 text-white shadow-2xl shadow-black/20">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl opacity-30" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Link de Agendamento</p>
                      <h4 className="text-lg font-black tracking-tight">Sua vitrine digital</h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
                      <div className="flex-1 px-3 py-2 overflow-hidden">
                        <p className="text-sm font-mono text-white/70 truncate">
                          {window.location.origin}/{barbershop?.slug}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/${barbershop?.slug}`);
                            toast.success('Link copiado!', {
                              description: 'Agora é só colar na sua bio do Instagram.'
                            });
                          }}
                          className="p-3 rounded-xl bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                          title="Copiar Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => window.open(`/${barbershop?.slug}`)}
                          className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                          title="Abrir Página"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                      💡 <span className="text-white/80">Dica de mestre:</span> Coloque este link no campo "Site" do seu perfil do Instagram. Isso aumenta em até 40% a taxa de agendamentos espontâneos.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-10">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
          { id: 'agenda', icon: Calendar, label: 'Agenda', badge: appointments.filter(a => a.status === 'scheduled').length },
          { id: 'clientes', icon: Users, label: 'Clientes' },
          { id: 'financeiro', icon: DollarSign, label: 'Financeiro' },
          { id: 'ajustes', icon: Settings, label: 'Ajustes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 min-w-[50px] transition-colors relative ${activeTab === tab.id ? 'text-black' : 'text-gray-400'}`}
          >
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-1">{tab.label}</span>
            {activeTab === tab.id && <div className="w-1 h-1 rounded-full mt-1 bg-black" />}
          </button>
        ))}
      </nav>

      {/* Modals */}
      <Modal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)} 
        title={editingItem ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-24 h-24 rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
              {modalImageUrl ? (
                <img src={modalImageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <input 
                type="file" 
                id="service-image-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleModalImageUpload(e, 'services')}
              />
              <label 
                htmlFor="service-image-upload" 
                className="inline-flex items-center justify-center px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {modalImageUrl ? 'Alterar Imagem' : 'Adicionar Imagem'}
              </label>
            </div>
          </div>
          <Input label="Nome" name="name" defaultValue={editingItem?.name} required />
          <Input label="Preço (R$)" name="price" type="number" defaultValue={editingItem?.price} required />
          <div className="space-y-2 w-full">
            <label className="text-sm font-bold text-gray-700 ml-1">Duração</label>
            <select 
              name="duration" 
              defaultValue={editingItem?.duration_minutes || 30} 
              required 
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white text-sm font-medium"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1 hora e 30 minutos</option>
              <option value={120}>2 horas</option>
              <option value={150}>2 horas e 30 minutos</option>
              <option value={180}>3 horas</option>
              <option value={240}>4 horas</option>
            </select>
          </div>
          <Button className="w-full" type="submit">Salvar</Button>
        </form>
      </Modal>

      <Modal 
        isOpen={isProfessionalModalOpen} 
        onClose={() => setIsProfessionalModalOpen(false)} 
        title={editingItem ? 'Editar Profissional' : 'Novo Profissional'}
      >
        <form onSubmit={handleSaveProfessional} className="space-y-4">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
              {modalImageUrl ? (
                <img src={modalImageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleModalImageUpload(e, 'avatars')}
              />
              <label 
                htmlFor="avatar-upload" 
                className="inline-flex items-center justify-center px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {modalImageUrl ? 'Alterar Avatar' : 'Adicionar Avatar'}
              </label>
            </div>
          </div>
          <Input label="Nome" name="name" defaultValue={editingItem?.name} required />
          <Input label="Bio" name="bio" defaultValue={editingItem?.bio} required />
          <Button className="w-full" type="submit">Salvar</Button>
        </form>
      </Modal>

      <Modal 
        isOpen={isIntervalModalOpen} 
        onClose={() => setIsIntervalModalOpen(false)} 
        title="Editar Intervalos"
      >
        <div className="space-y-4">
          {editingIntervals.map((interval, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input 
                type="time" 
                value={interval.start} 
                onChange={(e: any) => {
                  const newIntervals = [...editingIntervals];
                  newIntervals[index].start = e.target.value;
                  setEditingIntervals(newIntervals);
                }} 
              />
              <Input 
                type="time" 
                value={interval.end} 
                onChange={(e: any) => {
                  const newIntervals = [...editingIntervals];
                  newIntervals[index].end = e.target.value;
                  setEditingIntervals(newIntervals);
                }} 
              />
              <button 
                onClick={() => {
                  const newIntervals = editingIntervals.filter((_, i) => i !== index);
                  setEditingIntervals(newIntervals);
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setEditingIntervals([...editingIntervals, { start: '09:00', end: '18:00' }])}
            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl font-bold text-gray-400 hover:border-black hover:text-black transition-all"
          >
            + Adicionar Intervalo
          </button>
          <Button 
            onClick={() => {
              handleSaveDateOverride(editingDateStr, 'intervals', editingIntervals);
              setIsIntervalModalOpen(false);
            }}
            className="w-full"
          >
            Salvar
          </Button>
        </div>
      </Modal>

      <Modal 
        isOpen={isRemarketingModalOpen} 
        onClose={() => setIsRemarketingModalOpen(false)} 
        title="Remarketing"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <User className="text-gray-400 w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">{selectedClientForRemarketing?.name}</p>
              <p className="text-xs text-gray-500">{selectedClientForRemarketing?.phone}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Escolha uma mensagem</p>
            
            {[
              {
                title: "Saudade / Convite",
                msg: `E aí, ${selectedClientForRemarketing?.name}! Tudo certo? Faz um tempo que você não aparece na ${barbershop?.name}. Bora dar aquele tapa no visual pra renovar? A cadeira tá te esperando! 💈✂️`,
                icon: MessageSquare
              },
              {
                title: "Promoção / Fidelidade",
                msg: `Fala, ${selectedClientForRemarketing?.name}! Notamos que você tá sumido. Que tal um desconto especial pra sua próxima visita na ${barbershop?.name}? Bora agendar um horário pra essa semana? 👊🔥`,
                icon: DollarSign
              },
              {
                title: "Lembrete de Manutenção",
                msg: `Opa, ${selectedClientForRemarketing?.name}! Já faz uns dias desde o seu último corte. Pra manter o estilo em dia, o ideal é dar uma retocada agora. Tem uns horários massa disponíveis, bora? 💈⚡`,
                icon: Clock
              }
            ].map((option, i) => (
              <button
                key={i}
                onClick={() => {
                  if (selectedClientForRemarketing?.phone) {
                    openWhatsApp(selectedClientForRemarketing.phone, option.msg);
                  }
                }}
                className="w-full p-4 border border-gray-100 rounded-2xl flex items-center gap-4 hover:bg-gray-50 transition-all text-left group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <option.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{option.title}</p>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{option.msg}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)} 
        title="Detalhes do Agendamento"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <User className="text-gray-400 w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{selectedAppointment.clients?.name}</p>
                <p className="text-sm text-gray-500">{selectedAppointment.clients?.phone}</p>
              </div>
              {selectedAppointment.clients?.phone && (selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'completed') && (
                <button 
                  onClick={() => {
                    const msg = getWhatsAppMessage(selectedAppointment, barbershop?.name || 'Estabelecimento', undefined, whatsappTemplates);
                    openWhatsApp(selectedAppointment.clients.phone, msg);
                  }}
                  className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                  title="Enviar mensagem WhatsApp"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">Serviços</p>
                <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                  {selectedAppointment.services_snapshot && selectedAppointment.services_snapshot.length > 0 ? (
                    selectedAppointment.services_snapshot.map((s: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <p className="font-bold text-base">{s.name}</p>
                        <p className="font-bold text-gray-600">R$ {s.price}</p>
                      </div>
                    ))
                  ) : (
                    (() => {
                      const services = Array.isArray(selectedAppointment.services) 
                        ? selectedAppointment.services 
                        : [selectedAppointment.services];
                      return services.filter(Boolean).map((s: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <p className="font-bold text-base">{s.name}</p>
                          <p className="font-bold text-gray-600">R$ {s.price}</p>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-xl font-black text-green-600">R$ {getAppointmentPrice(selectedAppointment).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Duração</p>
                  <p className="text-xl font-black text-gray-700">{getAppointmentDuration(selectedAppointment)} min</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Horário</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="font-bold">{format(parseISO(selectedAppointment.start_time), 'HH:mm')}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Data</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="font-bold">{format(parseISO(selectedAppointment.start_time), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Profissional</p>
                <div className="flex items-center gap-2">
                  <img src={selectedAppointment.professionals?.avatar_url || 'https://i.pravatar.cc/150'} className="w-6 h-6 rounded-full object-cover" />
                  <p className="font-bold">{selectedAppointment.professionals?.name}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              {selectedAppointment.clients?.phone && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Comunicação WhatsApp</p>
                  <div className="flex gap-2">
                    {(() => {
                      const isPast = isBefore(parseISO(selectedAppointment.start_time), new Date());
                      const buttons = [];

                      if (selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') {
                        buttons.push(
                          <Button 
                            key="remind"
                            variant="outline"
                            className="flex-1 border-green-200 text-green-600 hover:bg-green-50 h-12 gap-2"
                            onClick={() => {
                              const msg = getWhatsAppMessage(selectedAppointment, barbershop?.name || 'Estabelecimento', 'scheduled', whatsappTemplates);
                              openWhatsApp(selectedAppointment.clients.phone, msg);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-bold">Lembrar Horário</span>
                          </Button>
                        );
                      }

                      if (selectedAppointment.status === 'confirmed' && isPast) {
                        buttons.push(
                          <Button 
                            key="no_show"
                            variant="outline"
                            className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 h-12 gap-2"
                            onClick={() => {
                              const msg = getWhatsAppMessage(selectedAppointment, barbershop?.name || 'Estabelecimento', 'no_show', whatsappTemplates);
                              openWhatsApp(selectedAppointment.clients.phone, msg);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-bold">Ausência</span>
                          </Button>
                        );
                      }

                      if (selectedAppointment.status === 'completed') {
                        buttons.push(
                          <Button 
                            key="thanks"
                            variant="outline"
                            className="flex-1 border-green-200 text-green-600 hover:bg-green-50 h-12 gap-2"
                            onClick={() => {
                              const msg = getWhatsAppMessage(selectedAppointment, barbershop?.name || 'Estabelecimento', 'completed', whatsappTemplates);
                              openWhatsApp(selectedAppointment.clients.phone, msg);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-bold">Agradecer</span>
                          </Button>
                        );
                      }

                      if (selectedAppointment.status === 'cancelled') {
                        buttons.push(
                          <Button 
                            key="msg"
                            variant="outline"
                            className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 h-12 gap-2"
                            onClick={() => {
                              const msg = getWhatsAppMessage(selectedAppointment, barbershop?.name || 'Estabelecimento', 'cancelled', whatsappTemplates);
                              openWhatsApp(selectedAppointment.clients.phone, msg);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-bold">Enviar Mensagem</span>
                          </Button>
                        );
                      }

                      return buttons;
                    })()}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Ações do Agendamento</p>
                <div className="flex gap-3">
                  {selectedAppointment.status === 'scheduled' && (
                    <>
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                        onClick={() => {
                          handleUpdateStatus(selectedAppointment, 'confirmed');
                          setIsAppointmentModalOpen(false);
                        }}
                      >
                        Confirmar
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-12"
                        onClick={() => {
                          handleUpdateStatus(selectedAppointment, 'cancelled');
                          setIsAppointmentModalOpen(false);
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  {selectedAppointment.status === 'confirmed' && (
                    <div className="flex flex-col gap-2 w-full">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 h-12"
                        onClick={() => {
                          handleUpdateStatus(selectedAppointment, 'completed');
                          setIsAppointmentModalOpen(false);
                        }}
                      >
                        Finalizar Atendimento
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-12"
                          onClick={() => {
                            handleUpdateStatus(selectedAppointment, 'cancelled');
                            setIsAppointmentModalOpen(false);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 h-12"
                          onClick={() => {
                            handleUpdateStatus(selectedAppointment, 'cancelled', 'no_show');
                            setIsAppointmentModalOpen(false);
                          }}
                        >
                          Faltou
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedAppointment.status === 'completed' && (
                    <Button 
                      className="w-full h-12"
                      variant="outline"
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment, 'scheduled');
                        setIsAppointmentModalOpen(false);
                      }}
                    >
                      Reabrir Agendamento
                    </Button>
                  )}
                  {(selectedAppointment.status === 'cancelled' || selectedAppointment.status === 'no_show') && (
                    <Button 
                      className="w-full h-12"
                      variant="outline"
                      onClick={() => {
                        handleUpdateStatus(selectedAppointment, 'scheduled');
                        setIsAppointmentModalOpen(false);
                      }}
                    >
                      Reabrir Agendamento
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      {notification && (
        <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-2xl shadow-lg z-[100] animate-in slide-in-from-top-4">
          {notification}
        </div>
      )}

      <Modal 
        isOpen={isWhatsappModalOpen} 
        onClose={() => setIsWhatsappModalOpen(false)} 
        title="Modelos de WhatsApp"
      >
        <div className="space-y-6 pb-8">
          <div className="bg-green-50 p-4 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Configurações</p>
              <p className="text-xs text-green-600 font-medium">Personalize as mensagens automáticas</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { id: 'scheduled', label: 'Agendamento', desc: 'Enviada quando o cliente faz um novo agendamento.' },
              { id: 'confirmed', label: 'Confirmação', desc: 'Enviada quando você confirma o horário do cliente.' },
              { id: 'completed', label: 'Finalização', desc: 'Enviada após você marcar o serviço como concluído.' },
              { id: 'cancelled', label: 'Cancelamento', desc: 'Enviada quando o agendamento é cancelado.' },
              { id: 'no_show', label: 'Não Compareceu', desc: 'Enviada quando o cliente falta ao compromisso.' }
            ].map(trigger => {
            const templateObj = whatsappTemplates.find(t => t.trigger_type === trigger.id);
            const template = templateObj?.message_template || DEFAULT_WHATSAPP_TEMPLATES[trigger.id as keyof typeof DEFAULT_WHATSAPP_TEMPLATES] || '';
            
            return (
              <Card key={trigger.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{trigger.label}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{trigger.desc}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleSaveTemplate(trigger.id, template)}
                  >
                    Salvar
                  </Button>
                </div>
                <textarea 
                  value={template}
                  onChange={(e) => {
                    setWhatsappTemplates(prev => {
                      const exists = prev.find(t => t.trigger_type === trigger.id);
                      if (exists) {
                        return prev.map(t => t.trigger_type === trigger.id ? { ...t, message_template: e.target.value } : t);
                      } else {
                        return [...prev, { trigger_type: trigger.id, message_template: e.target.value, barbershop_id: barbershop?.id }];
                      }
                    });
                  }}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-black outline-none"
                  rows={3}
                />
                <p className="text-[10px] text-gray-400">Variáveis: {`{cliente}, {estabelecimento}, {data}, {servicos}`}</p>
              </Card>
            );
          })}
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isClientDetailsModalOpen} 
        onClose={() => setIsClientDetailsModalOpen(false)} 
        title="Ficha do Cliente"
      >
        {selectedClientForDetails && (() => {
          const clientAppts = appointments.filter(a => a.client_id === selectedClientForDetails.id);
          const completedAppts = clientAppts.filter(a => a.status === 'completed');
          const totalSpent = completedAppts.reduce((acc, a) => acc + getAppointmentPrice(a), 0);
          const avgTicket = completedAppts.length > 0 ? totalSpent / completedAppts.length : 0;
          
          // Favorite Professional
          const profCounts: any = {};
          completedAppts.forEach(a => {
            const name = a.professionals?.name || 'Desconhecido';
            profCounts[name] = (profCounts[name] || 0) + 1;
          });
          const favoriteProf = Object.entries(profCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-';

          // Favorite Service
          const svcCounts: any = {};
          completedAppts.forEach(a => {
            const names = getServicesNames(a).split(', ');
            names.forEach((name: string) => {
              svcCounts[name] = (svcCounts[name] || 0) + 1;
            });
          });
          const favoriteSvc = Object.entries(svcCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-';

          // Preferred Time
          const hourCounts: any = {};
          completedAppts.forEach(a => {
            const hour = format(parseISO(a.start_time), 'HH');
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
          });
          const preferredHour = Object.entries(hourCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-';

          return (
            <div className="space-y-6 p-4 max-h-[80vh] overflow-y-auto">
              {/* Header Info */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedClientForDetails.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedClientForDetails.phone}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Gasto</p>
                  <p className="text-lg font-black text-blue-700">R$ {totalSpent.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-2xl">
                  <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Ticket Médio</p>
                  <p className="text-lg font-black text-green-700">R$ {avgTicket.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl">
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Frequência</p>
                  <p className="text-lg font-black text-purple-700">{completedAppts.length}x</p>
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border border-gray-100 rounded-2xl flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Profissional</p>
                    <p className="text-xs font-bold truncate">{favoriteProf}</p>
                  </div>
                </div>
                <div className="p-3 border border-gray-100 rounded-2xl flex items-center gap-3">
                  <Store className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Serviço</p>
                    <p className="text-xs font-bold truncate">{favoriteSvc}</p>
                  </div>
                </div>
                <div className="p-3 border border-gray-100 rounded-2xl flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Horário</p>
                    <p className="text-xs font-bold">{preferredHour ? `${preferredHour}:00` : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4" /> Histórico de Atendimentos
                </h4>
                <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {clientAppts.map((appt, idx) => (
                    <div key={appt.id} className="relative pl-10">
                      <div className={`absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                        appt.status === 'completed' ? 'bg-green-500' :
                        appt.status === 'cancelled' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="bg-white border border-gray-50 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold">{format(parseISO(appt.start_time), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            appt.status === 'completed' ? 'bg-green-50 text-green-600' :
                            appt.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {appt.status === 'completed' ? 'Finalizado' : appt.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium">{getServicesNames(appt)}</p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" /> {appt.professionals?.name}
                          </p>
                          <p className="text-xs font-black text-gray-900">R$ {getAppointmentPrice(appt).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {clientAppts.length === 0 && (
                    <p className="text-center text-gray-400 text-xs py-4">Nenhum atendimento registrado.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        variant={confirmModalConfig.variant}
      />
    </div>
  );
};

const MasterDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shops' | 'partners' | 'licensing' | 'clients' | 'finance' | 'logs'>('dashboard');
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [financeMonth, setFinanceMonth] = useState(new Date().getMonth());
  const [financeYear, setFinanceYear] = useState(new Date().getFullYear());
  const [clientFilter, setClientFilter] = useState<'all' | 'recurring_absent'>('all');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [isInitialDateModalOpen, setIsInitialDateModalOpen] = useState(false);
  const [isClientDetailsModalOpen, setIsClientDetailsModalOpen] = useState(false);
  const [isRemarketingModalOpen, setIsRemarketingModalOpen] = useState(false);
  const [selectedClientForRemarketing, setSelectedClientForRemarketing] = useState<any>(null);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<any>(null);
  const [remarketingMessage, setRemarketingMessage] = useState('');
  const [initialDateValue, setInitialDateValue] = useState('');
  const [shopToRenew, setShopToRenew] = useState<Barbershop | null>(null);
  const [shopsPage, setShopsPage] = useState(1);
  const [licensingPage, setLicensingPage] = useState(1);
  const [clientsPage, setClientsPage] = useState(1);
  const [tempLogoUrl, setTempLogoUrl] = useState('');
  const [tempBannerUrl, setTempBannerUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'info';
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirm = (config: { title: string; message: string; onConfirm: () => void; variant?: 'danger' | 'info' }) => {
    setConfirmModalConfig(config);
    setIsConfirmModalOpen(true);
  };

  const openShopModal = (shop?: any) => {
    setEditingShop(shop || null);
    setTempLogoUrl(shop?.logo_url || '');
    setTempBannerUrl(shop?.banner_url || '');
    setIsShopModalOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    const toastId = toast.loading(`Fazendo upload do ${type === 'logo' ? 'logo' : 'banner'}...`);
    setUploadingImage(true);

    try {
      try {
        await supabase.storage.createBucket('barbershop-assets', { public: true });
      } catch (e) {
        // Ignore if bucket already exists
      }

      const fileId = editingShop?.id || Math.random().toString(36).substring(2, 15);
      const fileName = `${type}s/${fileId}_${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from('barbershop-assets')
        .upload(fileName, file, { 
          upsert: true, 
          cacheControl: '3600',
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('barbershop-assets')
        .getPublicUrl(fileName);

      if (type === 'logo') {
        setTempLogoUrl(publicUrl);
      } else {
        setTempBannerUrl(publicUrl);
      }

      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} enviado com sucesso!`, { id: toastId });
    } catch (error: any) {
      toast.error('Erro ao fazer upload: ' + error.message, { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };
  const [logsPage, setLogsPage] = useState(1);
  const itemsPerPage = 10;
  const logsPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const checkMaster = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && MASTER_EMAILS.includes(user.email || '')) {
        setIsAuthorized(true);
        setUser(user);
        fetchData();
      } else {
        setLoading(false);
      }
    };
    checkMaster();
  }, []);

  useEffect(() => {
    setClientsPage(1);
  }, [clientSearch, selectedShopId, clientFilter]);

  useEffect(() => {
    setShopsPage(1);
    setLicensingPage(1);
    setClientsPage(1);
    setLogsPage(1);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const { data: shops } = await supabase.from('barbershops').select('*').order('name');
    const { data: profs } = await supabase.from('partner_access').select('*');
    const { data: clis } = await supabase.from('clients').select('*, barbershops(name)').order('name');
    const { data: appts } = await supabase.from('appointments').select('*, professionals(name), services(name, price)').order('start_time', { ascending: false });
    const { data: activityLogs } = await supabase.from('activity_logs').select('*, barbershops(name)').order('created_at', { ascending: false }).limit(500);
    
    setBarbershops(shops || []);
    setProfiles(profs || []);
    setClients(clis || []);
    setAppointments(appts || []);
    setLogs(activityLogs || []);
    setLoading(false);
  };

  const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }: { totalItems: number, itemsPerPage: number, currentPage: number, onPageChange: (page: number) => void }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-6 pb-4">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-[10px] uppercase font-bold px-4"
        >
          Anterior
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${currentPage === page ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
            >
              {page}
            </button>
          ))}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-[10px] uppercase font-bold px-4"
        >
          Próxima
        </Button>
      </div>
    );
  };

  const handleSetInitialExpiration = async (e: FormEvent) => {
    e.preventDefault();
    if (!shopToRenew || !initialDateValue) return;
    try {
      const { error } = await supabase.from('barbershops').update({
        expiration_date: new Date(initialDateValue).toISOString()
      }).eq('id', shopToRenew.id);
      if (error) throw error;
      setIsInitialDateModalOpen(false);
      setInitialDateValue('');
      toast.success('Vencimento inicial definido com sucesso!');
      createLog('Licenciamento', `Definiu vencimento inicial para ${shopToRenew.name} como ${initialDateValue}`, shopToRenew.id);
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao definir vencimento: ' + error.message);
    }
  };

  const handleSaveShop = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      whatsapp_number: formData.get('whatsapp') as string,
      logo_url: formData.get('logo_url') as string,
      banner_url: formData.get('banner_url') as string,
      primary_color: formData.get('primary_color') as string,
    };

    try {
      if (editingShop) {
        const { error } = await supabase.from('barbershops').update(data).eq('id', editingShop.id);
        if (error) throw error;
        createLog('Estabelecimento', `Editou estabelecimento: ${data.name}`, editingShop.id);
      } else {
        const insertData = { ...data, creation_date: new Date().toISOString() };
        const { data: newShop, error } = await supabase.from('barbershops').insert(insertData).select().single();
        if (error) throw error;
        createLog('Estabelecimento', `Criou novo estabelecimento: ${data.name}`, newShop?.id);
      }
      setIsShopModalOpen(false);
      toast.success('Estabelecimento salvo com sucesso!');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao salvar estabelecimento: ' + error.message);
      console.error('Detalhes do erro:', error);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      barbershop_id: formData.get('barbershop_id') as string || null,
    };

    try {
      if (editingProfile) {
        const { error } = await supabase.from('partner_access').update(data).eq('id', editingProfile.id);
        if (error) throw error;
        createLog('Parceiro', `Editou parceiro: ${data.email}`, data.barbershop_id || undefined);
      } else {
        const { error } = await supabase.from('partner_access').insert(data);
        if (error) throw error;
        createLog('Parceiro', `Criou novo parceiro: ${data.email}`, data.barbershop_id || undefined);
      }
      setIsProfileModalOpen(false);
      toast.success('Parceiro salvo com sucesso!');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao salvar parceiro: ' + error.message);
      console.error('Detalhes do erro:', error);
    }
  };

  const handleToggleShopStatus = async (shop: Barbershop) => {
    const isCurrentlyActive = (shop as any).is_active !== false;
    
    openConfirm({
      title: isCurrentlyActive ? 'Desativar Estabelecimento' : 'Reativar Estabelecimento',
      message: `Tem certeza que deseja ${isCurrentlyActive ? 'desativar' : 'ativar'} o acesso ao estabelecimento ${shop.name}?`,
      variant: isCurrentlyActive ? 'danger' : 'info',
      onConfirm: async () => {
        try {
          await supabase.from('barbershops').update({ is_active: !isCurrentlyActive }).eq('id', shop.id);
          toast.success(`Status alterado para ${!isCurrentlyActive ? 'Ativo' : 'Inativo'}!`);
          createLog('Estabelecimento', `${!isCurrentlyActive ? 'Ativou' : 'Desativou'} acesso de ${shop.name}`, shop.id);
          fetchData();
        } catch (error: any) {
          toast.error('Erro ao alterar status: ' + error.message);
        }
      }
    });
  };

  const handleAddDays = async (shop: Barbershop, days: number) => {
    const now = new Date();
    const currentExpiration = (shop as any).expiration_date ? new Date((shop as any).expiration_date) : now;
    
    // Se a licença já expirou (data de expiração < agora), começamos a contar a partir de hoje.
    // Se a licença ainda é válida, somamos os dias à data de expiração atual.
    const baseDate = currentExpiration < now ? now : currentExpiration;
    const newExpiration = addDays(baseDate, days);
    
    const updateData: any = { expiration_date: newExpiration.toISOString() };
    if (!(shop as any).creation_date) {
      updateData.creation_date = now.toISOString();
    }
    
    try {
      await supabase.from('barbershops').update(updateData).eq('id', shop.id);
      toast.success('Licenciamento atualizado com sucesso!');
      createLog('Licenciamento', `Adicionou ${days} dias de licença para ${shop.name}`, shop.id);
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao atualizar licenciamento: ' + error.message);
    }
  };

  const handleResetPassword = async (profile: any) => {
    const email = profile.email;
    if (!email) return;
    
    openConfirm({
      title: 'Resetar Senha',
      message: `Tem certeza que deseja resetar a senha do parceiro ${email}? Isso forçará o parceiro a criar uma nova senha no próximo acesso.`,
      variant: 'info',
      onConfirm: async () => {
        try {
          // 1. Find the user in auth.users (Supabase Admin API is needed for this, 
          // but since we are in the client, we assume we have a function to handle this securely 
          // or we are using a service role key on the backend).
          // Since we are in the client, we'll call a hypothetical edge function or backend route.
          const { error } = await supabase.functions.invoke('reset-partner-password', {
            body: { email }
          });

          if (error) throw error;

          toast.success(`Senha do parceiro ${email} resetada com sucesso!`);
          fetchData();
        } catch (error: any) {
          toast.error('Erro ao resetar senha: ' + error.message);
        }
      }
    });
  };

  const handleDeleteShop = async (id: string) => {
    openConfirm({
      title: 'Excluir Estabelecimento',
      message: 'Tem certeza? Isso apagará permanentemente todos os agendamentos, pagamentos, serviços, profissionais, clientes e registros deste estabelecimento.',
      variant: 'danger',
      onConfirm: async () => {
        const toastId = toast.loading('Excluindo estabelecimento e dados relacionados...');
        try {
          const shop = barbershops.find((s: any) => s.id === id);
          
          // Delete related data in order to satisfy foreign key constraints
          // 1. Logs and secondary data
          // Update logs to preserve them but link to a "deleted" state
          try {
            const shopName = shop?.name || id;
            await supabase
              .from('activity_logs')
              .update({ 
                deleted_barbershop_name: shopName,
                barbershop_id: null 
              })
              .eq('barbershop_id', id);
          } catch (e) {
            console.error('Failed to update activity_logs:', e);
          }

          await supabase.from('whatsapp_templates').delete().eq('barbershop_id', id);
          await supabase.from('working_hours_overrides').delete().eq('barbershop_id', id);
          await supabase.from('working_hours').delete().eq('barbershop_id', id);
          
          // 2. Payments (depends on appointments)
          await supabase.from('payments').delete().eq('barbershop_id', id);
          
          // 3. Appointments (depends on services, professionals, clients)
          await supabase.from('appointments').delete().eq('barbershop_id', id);
          
          // 4. Core entities
          await supabase.from('services').delete().eq('barbershop_id', id);
          await supabase.from('professionals').delete().eq('barbershop_id', id);
          await supabase.from('partner_access').delete().eq('barbershop_id', id);
          await supabase.from('profiles').delete().eq('barbershop_id', id);
          await supabase.from('clients').delete().eq('barbershop_id', id);
          
          // Finally delete the barbershop itself
          const { error } = await supabase.from('barbershops').delete().eq('id', id);
          
          if (error) throw error;
          
          toast.success('Estabelecimento e todos os dados vinculados foram excluídos!', { id: toastId });
          createLog('Estabelecimento', `Excluiu estabelecimento: ${shop?.name || id}`, id);
          fetchData();
        } catch (error: any) {
          toast.error('Erro ao excluir estabelecimento: ' + error.message, { id: toastId });
          console.error('Erro ao excluir:', error);
        }
      }
    });
  };

  const handleDeleteProfile = async (id: string) => {
    openConfirm({
      title: 'Excluir Parceiro',
      message: 'Tem certeza que deseja excluir este parceiro?',
      variant: 'danger',
      onConfirm: async () => {
        const profile = profiles.find((p: any) => p.id === id);
        const { error } = await supabase.from('partner_access').delete().eq('id', id);
        if (error) {
          toast.error('Erro ao excluir parceiro: ' + error.message);
          console.error('Erro ao excluir:', error);
        } else {
          toast.success('Parceiro excluído com sucesso!');
          createLog('Parceiro', `Excluiu parceiro: ${profile?.email || id}`, profile?.barbershop_id);
          fetchData();
        }
      }
    });
  };

  if (loading) return <LoadingScreen />;

  if (!isAuthorized) {
    return <MasterLogin onLogin={() => { setIsAuthorized(true); fetchData(); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar / Hamburger Menu */}
      <div className={`fixed inset-y-0 left-0 z-20 w-64 bg-black text-white transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="p-6 flex justify-between items-center">
          <h2 className="font-bold text-xl tracking-tighter">Agenda Fácil</h2>
          <button onClick={() => setIsMenuOpen(false)} className="lg:hidden"><X /></button>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <button onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
            <LayoutDashboard className="w-4 h-4" /> Início
          </button>
          <button onClick={() => { setActiveTab('shops'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'shops' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
            <Store className="w-4 h-4" /> Estabelecimentos
          </button>
          <button onClick={() => { setActiveTab('partners'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'partners' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
            <Users className="w-4 h-4" /> Parceiros
          </button>
          <button onClick={() => { setActiveTab('clients'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'clients' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
            <User className="w-4 h-4" /> Clientes
          </button>
          <button onClick={() => { setActiveTab('licensing'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'licensing' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
            <ShieldCheck className="w-4 h-4" /> Licenciamento
          </button>
          <button onClick={() => { setActiveTab('finance'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'finance' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
            <DollarSign className="w-4 h-4" /> Financeiro
          </button>
          <button onClick={() => { setActiveTab('logs'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'logs' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
            <History className="w-4 h-4" /> Logs de Atividade
          </button>
          <div className="pt-4 mt-4 border-t border-gray-800">
            <button onClick={() => navigate('/')} className="w-full text-left p-3 rounded-lg flex items-center gap-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Sair para o Início
            </button>
          </div>
        </nav>
      </div>

      <div className="flex-1">
        <header className="bg-black p-4 sm:p-6 flex justify-between items-center sticky top-0 z-10 border-b border-gray-800 text-white">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden"><Menu /></button>
          <h1 className="font-bold text-lg sm:text-xl tracking-tighter">Agenda Fácil</h1>
          <button onClick={() => supabase.auth.signOut().then(() => { setIsAuthorized(false); navigate('/master'); })} className="p-2 text-red-500 hover:text-red-600 transition-colors" title="Sair">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-6 bg-white border-none shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Estabelecimentos</p>
                    <p className="text-3xl font-black">{barbershops.length}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                    <TrendingUp className="w-3 h-3" /> 
                    {barbershops.filter(s => s.is_active !== false).length} Ativos
                  </div>
                </Card>

                <Card className="p-6 bg-white border-none shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Total de Clientes</p>
                    <p className="text-3xl font-black">{clients.length}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full w-fit">
                    <Users className="w-3 h-3" /> Global
                  </div>
                </Card>

                <Card className="p-6 bg-white border-none shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                      <CalendarCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Agendamentos Hoje</p>
                    <p className="text-3xl font-black">
                      {appointments.filter(a => isSameDay(parseISO(a.start_time), new Date())).length}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                    <CheckCircle2 className="w-3 h-3" /> {appointments.filter(a => isSameDay(parseISO(a.start_time), new Date()) && a.status === 'completed').length} Concluídos
                  </div>
                </Card>

                <Card className="p-6 bg-white border-none shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Vencimentos Próximos</p>
                    <p className="text-3xl font-black">
                      {barbershops.filter(s => {
                        if (!s.expiration_date) return false;
                        const days = differenceInDays(parseISO(s.expiration_date), new Date());
                        return days >= 0 && days <= 7;
                      }).length}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full w-fit">
                    <Clock className="w-3 h-3" /> Próximos 7 dias
                  </div>
                </Card>

                <Card className="p-6 bg-white border-none shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Licenças Expiradas</p>
                    <p className="text-3xl font-black">
                      {barbershops.filter(s => s.expiration_date && isBefore(parseISO(s.expiration_date), new Date())).length}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                    <AlertCircle className="w-3 h-3" /> Requer Atenção
                  </div>
                </Card>

                <Card className="p-6 bg-black text-white border border-gray-800 shadow-xl flex flex-col justify-center gap-3">
                  <div className="text-center mb-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Centro de Comando</p>
                    <h4 className="text-sm font-black">Ações Rápidas</h4>
                  </div>
                  <Button 
                    onClick={() => openShopModal()} 
                    variant="dark" 
                    className="w-full text-xs h-11 px-4 border-gray-800 hover:border-gray-700 hover:bg-zinc-800/50"
                  >
                    <div className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center mr-2">
                      <Plus className="w-3 h-3 text-blue-500" />
                    </div>
                    Novo Estabelecimento
                  </Button>
                  <Button 
                    onClick={() => { setClientFilter('recurring_absent'); setActiveTab('clients'); }} 
                    variant="dark" 
                    className="w-full text-xs h-11 px-4 border-gray-800 hover:border-gray-700 hover:bg-zinc-800/50"
                  >
                    <div className="w-6 h-6 bg-orange-500/10 rounded-lg flex items-center justify-center mr-2">
                      <MessageSquare className="w-3 h-3 text-orange-500" />
                    </div>
                    Remarketing
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('partners')} 
                    variant="dark" 
                    className="w-full text-xs h-11 px-4 border-gray-800 hover:border-gray-700 hover:bg-zinc-800/50"
                  >
                    <div className="w-6 h-6 bg-purple-500/10 rounded-lg flex items-center justify-center mr-2">
                      <Users className="w-3 h-3 text-purple-500" />
                    </div>
                    Gerenciar Parceiros
                  </Button>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-white border-none shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Crescimento da Base
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Novos Estabelecimentos (Mês)</span>
                      <span className="font-bold">
                        {barbershops.filter(s => {
                          if (!(s as any).creation_date) return false;
                          const date = parseISO((s as any).creation_date);
                          return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Novos Clientes (Mês)</span>
                      <span className="font-bold">
                        {clients.filter(c => {
                          if (!(c as any).created_at) return false;
                          const date = parseISO((c as any).created_at);
                          return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
                        }).length}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white border-none shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Status Geral
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Taxa de Conclusão (Hoje)</span>
                      <span className="font-bold">
                        {(() => {
                          const todayAppts = appointments.filter(a => isSameDay(parseISO(a.start_time), new Date()));
                          if (todayAppts.length === 0) return '0%';
                          const completed = todayAppts.filter(a => a.status === 'completed').length;
                          return `${Math.round((completed / todayAppts.length) * 100)}%`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Média de Clientes / Loja</span>
                      <span className="font-bold">
                        {barbershops.length > 0 ? Math.round(clients.length / barbershops.length) : 0}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold">Financeiro Global</h2>
                <div className="flex gap-2">
                  <select 
                    value={financeMonth} 
                    onChange={(e) => setFinanceMonth(Number(e.target.value))}
                    className="p-2 rounded-xl border border-gray-200 text-sm font-bold bg-white"
                  >
                    {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                  <select 
                    value={financeYear} 
                    onChange={(e) => setFinanceYear(Number(e.target.value))}
                    className="p-2 rounded-xl border border-gray-200 text-sm font-bold bg-white"
                  >
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(() => {
                const filteredAppts = appointments.filter(a => {
                  const date = parseISO(a.start_time);
                  return date.getMonth() === financeMonth && date.getFullYear() === financeYear && a.status === 'completed';
                });

                const totalRevenue = filteredAppts.reduce((acc, a) => {
                  if (a.services_snapshot && Array.isArray(a.services_snapshot)) {
                    return acc + a.services_snapshot.reduce((sAcc: number, s: any) => sAcc + Number(s.price || 0), 0);
                  }
                  return acc;
                }, 0);

                const revenueByShop = barbershops.map(shop => {
                  const shopAppts = filteredAppts.filter(a => a.barbershop_id === shop.id);
                  const revenue = shopAppts.reduce((acc, a) => {
                    if (a.services_snapshot && Array.isArray(a.services_snapshot)) {
                      return acc + a.services_snapshot.reduce((sAcc: number, s: any) => sAcc + Number(s.price || 0), 0);
                    }
                    return acc;
                  }, 0);
                  return { ...shop, revenue, count: shopAppts.length };
                }).sort((a, b) => b.revenue - a.revenue);

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="p-6 bg-black text-white border-none shadow-xl">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Faturamento Total</p>
                        <p className="text-3xl font-black">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-gray-500 mt-2">Mês selecionado</p>
                      </Card>

                      <Card className="p-6 bg-white border-none shadow-sm">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                          <CalendarCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Atendimentos Concluídos</p>
                        <p className="text-3xl font-black">{filteredAppts.length}</p>
                        <p className="text-xs text-gray-500 mt-2">Em toda a rede</p>
                      </Card>

                      <Card className="p-6 bg-white border-none shadow-sm">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Ticket Médio Global</p>
                        <p className="text-3xl font-black">
                          R$ {(filteredAppts.length > 0 ? totalRevenue / filteredAppts.length : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Por atendimento</p>
                      </Card>
                    </div>

                    <Card className="p-6 bg-white border-none shadow-sm">
                      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Ranking de Faturamento por Unidade
                      </h3>
                      <div className="space-y-4">
                        {revenueByShop.map((shop, index) => (
                          <div key={shop.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-bold">{shop.name}</p>
                                <p className="text-xs text-gray-500">{shop.count} atendimentos</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-lg">R$ {shop.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Total no mês</p>
                            </div>
                          </div>
                        ))}
                        {revenueByShop.length === 0 && (
                          <p className="text-center text-gray-500 py-8">Nenhum faturamento registrado para este período.</p>
                        )}
                      </div>
                    </Card>
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === 'shops' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-6 bg-white border-none shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Total de Estabelecimentos</p>
                  <p className="text-3xl font-black">{barbershops.length}</p>
                </Card>
                <Card className="p-6 bg-white border-none shadow-sm flex items-center justify-center">
                  <Button onClick={() => openShopModal()} className="w-full h-full py-4">
                    <Plus className="w-5 h-5" /> Novo Estabelecimento
                  </Button>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="font-bold text-xl px-1">Estabelecimentos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barbershops.slice((shopsPage - 1) * itemsPerPage, shopsPage * itemsPerPage).map(shop => {
                    const adminPartner = profiles.find(p => p.barbershop_id === shop.id && p.role === 'admin');
                    const ownerEmail = adminPartner ? adminPartner.email : shop.owner_email;
                    const isOwnerDisabled = ownerEmail?.startsWith('disabled:');
                    const displayEmail = isOwnerDisabled ? ownerEmail.replace('disabled:', '') : ownerEmail;

                    return (
                    <Card key={shop.id} className="p-6 flex flex-col justify-between group hover:shadow-md transition-all border-none">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                            {shop.logo_url ? (
                              <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                              <Store className="text-gray-400 w-6 h-6" />
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openShopModal(shop)} className="p-2 text-blue-500 hover:text-blue-600 transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteShop(shop.id)} className="p-2 text-red-500 hover:text-red-600 transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            {(() => {
                              const isExpired = shop.expiration_date ? isBefore(parseISO(shop.expiration_date), new Date()) : true;
                              const isActive = (shop as any).is_active !== false && !isOwnerDisabled && !isExpired;
                              return (
                                <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                  {isActive ? 'Ativo' : isExpired ? 'Expirado' : 'Inativo'}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        <h3 className="font-bold text-lg">{shop.name}</h3>
                        <p className="text-xs text-gray-500 mb-4">/{shop.slug}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                            <User className="w-3 h-3" />
                            Administrador: {ownerEmail ? (isOwnerDisabled ? <span className="text-red-500 line-through">{displayEmail}</span> : displayEmail) : 'Não vinculado'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                            <Phone className="w-3 h-3" />
                            {shop.whatsapp_number || 'Sem WhatsApp'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                        <button 
                          onClick={() => window.open(`/${shop.slug}`)}
                          className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                          Ver Página <ExternalLink className="w-3 h-3" />
                        </button>
                        <div className="flex gap-2">
                          <Button 
                            variant={(shop as any).is_active === false ? "outline" : "ghost"}
                            size="sm" 
                            className={`text-[10px] uppercase font-bold ${(shop as any).is_active === false ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                            onClick={() => handleToggleShopStatus(shop)}
                          >
                            {(shop as any).is_active === false ? 'Reativar' : 'Desativar'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[10px] uppercase font-bold"
                            onClick={() => window.open(`/portal?shopId=${shop.id}`, '_blank')}
                          >
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )})}
                </div>
                <Pagination 
                  totalItems={barbershops.length} 
                  itemsPerPage={itemsPerPage} 
                  currentPage={shopsPage} 
                  onPageChange={setShopsPage} 
                />
              </div>
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1 gap-2">
                <h2 className="font-bold text-xl flex-1 truncate">Parceiros Registrados</h2>
                <Button variant="secondary" size="sm" onClick={() => { setEditingProfile(null); setIsProfileModalOpen(true); }} className="uppercase flex-shrink-0">
                  <Plus className="w-3 h-3" /> <span className="hidden sm:inline">Novo Parceiro</span><span className="sm:hidden">Novo</span>
                </Button>
              </div>
              <Card className="bg-white border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-bottom border-gray-100">
                        <th className="p-4 text-[10px] uppercase font-bold text-gray-400">Nome / E-mail</th>
                        <th className="p-4 text-[10px] uppercase font-bold text-gray-400">Cargo</th>
                        <th className="p-4 text-[10px] uppercase font-bold text-gray-400">Estabelecimento</th>
                        <th className="p-4 text-[10px] uppercase font-bold text-gray-400 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map(profile => {
                        const shop = barbershops.find(s => s.id === profile.barbershop_id);
                        return (
                          <tr key={profile.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-sm">{profile.full_name || 'Sem nome'}</p>
                              <p className="text-[10px] text-gray-400">{profile.email}</p>
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${profile.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                                {profile.role === 'admin' ? 'Administrador' : 'Profissional'}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-medium">{shop?.name || 'Não vinculado'}</p>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <button onClick={() => handleResetPassword(profile)} title="Resetar Senha" className="p-2 text-amber-500 hover:text-amber-600 transition-colors"><Key className="w-4 h-4" /></button>
                                <button onClick={() => { setEditingProfile(profile); setIsProfileModalOpen(true); }} title="Editar" className="p-2 text-blue-500 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteProfile(profile.id)} title="Excluir" className="p-2 text-red-500 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-bold text-xl">Clientes de Todos os Estabelecimentos</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setClientFilter('all')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${clientFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setClientFilter('recurring_absent')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${clientFilter === 'recurring_absent' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}
                  >
                    Ausentes (25 dias+)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Buscar cliente por nome..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-black outline-none transition-all shadow-sm appearance-none"
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(e.target.value)}
                  >
                    <option value="all">Todos os Estabelecimentos</option>
                    {barbershops.map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {(() => {
                  const filtered = clients.filter(client => {
                    // Filter by search term
                    if (clientSearch && !client.name.toLowerCase().includes(clientSearch.toLowerCase())) {
                      return false;
                    }

                    // Filter by barbershop
                    if (selectedShopId !== 'all' && client.barbershop_id !== selectedShopId) {
                      return false;
                    }

                    // Filter by status (all vs absent)
                    if (clientFilter === 'all') return true;
                    
                    const clientAppts = appointments.filter(a => a.client_id === client.id && a.status === 'completed');
                    if (clientAppts.length < 2) return false; // Not recurring

                    const lastAppt = clientAppts.sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime())[0];
                    if (!lastAppt) return false;

                    const daysSinceLast = differenceInDays(new Date(), parseISO(lastAppt.start_time));
                    return daysSinceLast >= 25;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-bold">Nenhum cliente encontrado com estes filtros</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {filtered.slice((clientsPage - 1) * itemsPerPage, clientsPage * itemsPerPage).map(client => {
                        const clientAppts = appointments.filter(a => a.client_id === client.id && a.status === 'completed');
                        const lastAppt = clientAppts.sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime())[0];
                        const daysSinceLast = lastAppt ? differenceInDays(new Date(), parseISO(lastAppt.start_time)) : null;

                        return (
                          <Card 
                            key={client.id} 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group"
                            onClick={() => {
                              setSelectedClientForDetails(client);
                              setIsClientDetailsModalOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <User className="text-gray-400 w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-bold">{client.name}</p>
                                <p className="text-xs text-gray-500">{client.phone}</p>
                                {client.barbershops?.name && (
                                  <p className="text-[10px] font-bold uppercase mt-1 text-gray-400">
                                    {client.barbershops.name}
                                  </p>
                                )}
                                {daysSinceLast !== null && (
                                  <p className={`text-[10px] font-bold uppercase mt-1 ${daysSinceLast >= 25 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    Última vez: {daysSinceLast} dias atrás
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Atendimentos</p>
                                <p className="font-bold">{clientAppts.length}</p>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedClientForRemarketing(client);
                                  setIsRemarketingModalOpen(true);
                                }}
                                className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                                title="Enviar WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </Card>
                        );
                      })}
                      <Pagination 
                        totalItems={filtered.length} 
                        itemsPerPage={itemsPerPage} 
                        currentPage={clientsPage} 
                        onPageChange={setClientsPage} 
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'licensing' && (
            <div className="space-y-4">
              <h2 className="font-bold text-xl px-1">Licenciamento de Estabelecimentos</h2>
              <Card className="bg-white border-none shadow-sm overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 text-[10px] uppercase font-bold text-gray-400">Estabelecimento</th>
                        <th className="p-4 text-[10px] uppercase font-bold text-gray-400">Data Criação</th>
                        <th className="p-4 text-[10px] uppercase font-bold text-gray-400">Data Vencimento</th>
                        <th className="p-4 text-[10px] uppercase font-bold text-gray-400 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barbershops.slice((licensingPage - 1) * itemsPerPage, licensingPage * itemsPerPage).map(shop => {
                        const adminPartner = profiles.find(p => p.barbershop_id === shop.id && p.role === 'admin');
                        const ownerEmail = adminPartner ? adminPartner.email : shop.owner_email;
                        const isOwnerDisabled = ownerEmail?.startsWith('disabled:');
                        const displayEmail = isOwnerDisabled ? ownerEmail.replace('disabled:', '') : ownerEmail;

                        return (
                        <tr key={shop.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-sm">{shop.name}</p>
                            <p className="text-[10px] text-gray-400">{displayEmail || 'Sem administrador vinculado'}</p>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {(shop as any).creation_date ? format(parseISO((shop as any).creation_date), 'dd/MM/yyyy') : (
                              <span className="text-gray-400">Não definida</span>
                            )}
                          </td>
                          <td className="p-4 text-sm font-bold">
                            {(shop as any).expiration_date ? (
                              <span className={isBefore(new Date((shop as any).expiration_date), new Date()) ? 'text-red-500' : 'text-green-600'}>
                                {format(parseISO((shop as any).expiration_date), 'dd/MM/yyyy')}
                              </span>
                            ) : (
                              <span className="text-gray-400">Vencido/Não definido</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              {!(shop as any).expiration_date ? (
                                <button onClick={() => { setShopToRenew(shop); setIsInitialDateModalOpen(true); }} title="Definir Vencimento" className="p-2 text-orange-500 hover:text-orange-600 transition-colors"><CalendarPlus className="w-4 h-4" /></button>
                              ) : (
                                <button onClick={() => { setShopToRenew(shop); setIsRenewalModalOpen(true); }} title="Renovar Licença" className="p-2 text-green-500 hover:text-green-600 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden divide-y divide-gray-50">
                  {barbershops.slice((licensingPage - 1) * itemsPerPage, licensingPage * itemsPerPage).map(shop => {
                    const adminPartner = profiles.find(p => p.barbershop_id === shop.id && p.role === 'admin');
                    const ownerEmail = adminPartner ? adminPartner.email : shop.owner_email;
                    const isOwnerDisabled = ownerEmail?.startsWith('disabled:');
                    const displayEmail = isOwnerDisabled ? ownerEmail.replace('disabled:', '') : ownerEmail;

                    return (
                      <div key={shop.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-base">{shop.name}</p>
                            <p className="text-[10px] text-gray-400">{displayEmail || 'Sem administrador vinculado'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!(shop as any).expiration_date ? (
                              <button onClick={() => { setShopToRenew(shop); setIsInitialDateModalOpen(true); }} className="p-3 bg-orange-50 text-orange-500 rounded-xl"><CalendarPlus className="w-5 h-5" /></button>
                            ) : (
                              <button onClick={() => { setShopToRenew(shop); setIsRenewalModalOpen(true); }} className="p-3 bg-green-50 text-green-500 rounded-xl"><RefreshCw className="w-5 h-5" /></button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Criação</p>
                            <p className="text-xs font-medium text-gray-600">
                              {(shop as any).creation_date ? format(parseISO((shop as any).creation_date), 'dd/MM/yyyy') : 'Não definida'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vencimento</p>
                            <p className="text-xs font-bold">
                              {(shop as any).expiration_date ? (
                                <span className={isBefore(new Date((shop as any).expiration_date), new Date()) ? 'text-red-500' : 'text-green-600'}>
                                  {format(parseISO((shop as any).expiration_date), 'dd/MM/yyyy')}
                                </span>
                              ) : (
                                <span className="text-gray-400">Vencido</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Pagination 
                  totalItems={barbershops.length} 
                  itemsPerPage={itemsPerPage} 
                  currentPage={licensingPage} 
                  onPageChange={setLicensingPage} 
                />
              </Card>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tighter">Logs de Atividade</h2>
                <button onClick={fetchData} className="p-2 text-gray-400 hover:text-black transition-colors"><RefreshCw className="w-5 h-5" /></button>
              </div>
              <Card className="overflow-hidden border-none shadow-sm">
                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data/Hora</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Usuário</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ação</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detalhes</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estabelecimento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {logs.slice((logsPage - 1) * logsPerPage, logsPage * logsPerPage).map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                            {format(parseISO(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </td>
                          <td className="p-4 text-xs font-medium text-gray-900">{log.user_email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              log.action === 'Login' ? 'bg-blue-50 text-blue-600' :
                              log.action === 'Estabelecimento' ? 'bg-purple-50 text-purple-600' :
                              log.action === 'Licenciamento' ? 'bg-green-50 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-600">{log.details}</td>
                          <td className="p-4 text-xs text-gray-500 italic">
                            {log.barbershops?.name || log.deleted_barbershop_name || '-'}
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 italic">Nenhum log registrado ainda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="sm:hidden divide-y divide-gray-50">
                  {logs.slice((logsPage - 1) * logsPerPage, logsPage * logsPerPage).map((log) => (
                    <div key={log.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-900">{log.user_email}</p>
                          <p className="text-[10px] text-gray-400">
                            {format(parseISO(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                          log.action === 'Login' ? 'bg-blue-50 text-blue-600' :
                          log.action === 'Estabelecimento' ? 'bg-purple-50 text-purple-600' :
                          log.action === 'Licenciamento' ? 'bg-green-50 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">{log.details}</p>
                      {(log.barbershops?.name || log.deleted_barbershop_name) && (
                        <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
                          <Store className="w-3 h-3" /> {log.barbershops?.name || log.deleted_barbershop_name}
                        </p>
                      )}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="p-8 text-center text-gray-400 italic text-sm">Nenhum log registrado ainda.</div>
                  )}
                </div>
                <Pagination 
                  totalItems={logs.length} 
                  itemsPerPage={logsPerPage} 
                  currentPage={logsPage} 
                  onPageChange={setLogsPage} 
                />
              </Card>
            </div>
          )}
        </main>

        <Modal 
          isOpen={isInitialDateModalOpen} 
          onClose={() => setIsInitialDateModalOpen(false)} 
          title={`Definir Vencimento Inicial: ${shopToRenew?.name}`}
        >
          <form onSubmit={handleSetInitialExpiration} className="space-y-4 p-4">
            <p className="text-sm text-gray-600 mb-4">
              Defina a primeira data de vencimento da licença para este estabelecimento.
            </p>
            <Input 
              label="Data de Vencimento" 
              type="date" 
              required 
              value={initialDateValue}
              onChange={(e: any) => setInitialDateValue(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsInitialDateModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Data</Button>
            </div>
          </form>
        </Modal>

        <Modal 
          isOpen={isRenewalModalOpen} 
          onClose={() => setIsRenewalModalOpen(false)} 
          title={`Renovar Licença: ${shopToRenew?.name}`}
        >
          <div className="space-y-4 p-4">
            <Button className="w-full" onClick={() => { if(shopToRenew) handleAddDays(shopToRenew, 31); setIsRenewalModalOpen(false); }}>1 Mês (31 dias)</Button>
            <Button className="w-full" onClick={() => { if(shopToRenew) handleAddDays(shopToRenew, 93); setIsRenewalModalOpen(false); }}>3 Meses (93 dias)</Button>
          </div>
        </Modal>

        <Modal 
          isOpen={isClientDetailsModalOpen} 
          onClose={() => setIsClientDetailsModalOpen(false)} 
          title="Ficha do Cliente"
        >
          {selectedClientForDetails && (() => {
            const clientAppts = appointments.filter(a => a.client_id === selectedClientForDetails.id);
            const completedAppts = clientAppts.filter(a => a.status === 'completed');
            const totalSpent = completedAppts.reduce((acc, a) => acc + getAppointmentPrice(a), 0);
            const avgTicket = completedAppts.length > 0 ? totalSpent / completedAppts.length : 0;
            
            // Favorite Professional
            const profCounts: any = {};
            completedAppts.forEach(a => {
              const name = a.professionals?.name || 'Desconhecido';
              profCounts[name] = (profCounts[name] || 0) + 1;
            });
            const favoriteProf = Object.entries(profCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-';

            // Favorite Service
            const svcCounts: any = {};
            completedAppts.forEach(a => {
              const names = getServicesNames(a).split(', ');
              names.forEach((name: string) => {
                svcCounts[name] = (svcCounts[name] || 0) + 1;
              });
            });
            const favoriteSvc = Object.entries(svcCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-';

            // Preferred Time
            const hourCounts: any = {};
            completedAppts.forEach(a => {
              const hour = format(parseISO(a.start_time), 'HH');
              hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });
            const preferredHour = Object.entries(hourCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-';

            return (
              <div className="space-y-6 p-4 max-h-[80vh] overflow-y-auto">
                {/* Header Info */}
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{selectedClientForDetails.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedClientForDetails.phone}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Gasto</p>
                    <p className="text-lg font-black text-blue-700">R$ {totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-2xl">
                    <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Ticket Médio</p>
                    <p className="text-lg font-black text-green-700">R$ {avgTicket.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-2xl">
                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Frequência</p>
                    <p className="text-lg font-black text-purple-700">{completedAppts.length}x</p>
                  </div>
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 border border-gray-100 rounded-2xl flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Profissional</p>
                      <p className="text-xs font-bold truncate">{favoriteProf}</p>
                    </div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-2xl flex items-center gap-3">
                    <Store className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Serviço</p>
                      <p className="text-xs font-bold truncate">{favoriteSvc}</p>
                    </div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-2xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Horário</p>
                      <p className="text-xs font-bold">{preferredHour ? `${preferredHour}:00` : '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4" /> Histórico de Atendimentos
                  </h4>
                  <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {clientAppts.map((appt, idx) => (
                      <div key={appt.id} className="relative pl-10">
                        <div className={`absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                          appt.status === 'completed' ? 'bg-green-500' :
                          appt.status === 'cancelled' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="bg-white border border-gray-50 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold">{format(parseISO(appt.start_time), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              appt.status === 'completed' ? 'bg-green-50 text-green-600' :
                              appt.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {appt.status === 'completed' ? 'Finalizado' : appt.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium">{getServicesNames(appt)}</p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <User className="w-3 h-3" /> {appt.professionals?.name}
                            </p>
                            <p className="text-xs font-black text-gray-900">R$ {getAppointmentPrice(appt).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {clientAppts.length === 0 && (
                      <p className="text-center text-gray-400 text-xs py-4">Nenhum atendimento registrado.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>

        <Modal 
          isOpen={isRemarketingModalOpen} 
          onClose={() => setIsRemarketingModalOpen(false)} 
          title="Remarketing via WhatsApp"
        >
          <div className="space-y-4 p-4">
            <p className="text-sm text-gray-600">
              Envie uma mensagem para <strong>{selectedClientForRemarketing?.name}</strong>.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Mensagem</label>
              <textarea 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none h-32"
                placeholder="Olá! Sentimos sua falta..."
                value={remarketingMessage}
                onChange={(e) => setRemarketingMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsRemarketingModalOpen(false)}>Cancelar</Button>
              <Button 
                onClick={() => {
                  if (!selectedClientForRemarketing?.phone) {
                    toast.error('Cliente não possui telefone cadastrado.');
                    return;
                  }
                  const phone = selectedClientForRemarketing.phone;
                  openWhatsApp(phone, remarketingMessage);
                  setIsRemarketingModalOpen(false);
                  setRemarketingMessage('');
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Enviar WhatsApp
              </Button>
            </div>
          </div>
        </Modal>

        <Modal 
          isOpen={isShopModalOpen} 
          onClose={() => setIsShopModalOpen(false)} 
          title={editingShop ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
        >
          <form onSubmit={handleSaveShop} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Informações Básicas</h4>
              <Input label="Nome do Estabelecimento" name="name" defaultValue={editingShop?.name} required />
              <Input label="Slug (URL amigável)" name="slug" defaultValue={editingShop?.slug} required placeholder="ex: vintage-cuts" />
              <Input label="WhatsApp (com DDD)" name="whatsapp" defaultValue={editingShop?.whatsapp_number} required placeholder="5511999999999" />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Identidade Visual</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                      {tempLogoUrl ? (
                        <img src={tempLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input type="hidden" name="logo_url" value={tempLogoUrl} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="master-logo-upload"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        disabled={uploadingImage}
                      />
                      <label 
                        htmlFor="master-logo-upload" 
                        className={`inline-flex items-center justify-center px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors w-full ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Alterar Logo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Banner</label>
                  <div className="flex flex-col gap-3">
                    <div className="w-full h-20 rounded-2xl border-2 border-gray-100 overflow-hidden bg-gray-50">
                      {tempBannerUrl ? (
                        <img src={tempBannerUrl} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Image className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input type="hidden" name="banner_url" value={tempBannerUrl} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="master-banner-upload"
                        onChange={(e) => handleImageUpload(e, 'banner')}
                        disabled={uploadingImage}
                      />
                      <label 
                        htmlFor="master-banner-upload" 
                        className={`inline-flex items-center justify-center px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors w-full ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Alterar Banner
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Cor do Cabeçalho (Painel)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      name="primary_color" 
                      defaultValue={editingShop?.primary_color || '#1a1a1a'} 
                      className="w-10 h-10 rounded-lg border-none cursor-pointer"
                    />
                    <input 
                      type="text" 
                      defaultValue={editingShop?.primary_color || '#1a1a1a'} 
                      className="flex-1 px-3 py-2 text-xs font-mono border border-gray-100 rounded-lg outline-none"
                      onChange={(e) => {
                        const colorInput = e.target.previousElementSibling as HTMLInputElement;
                        if (colorInput) colorInput.value = e.target.value;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button className="w-full py-4" type="submit">Salvar Estabelecimento</Button>
            </div>
          </form>
        </Modal>

        <Modal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
          title={editingProfile ? 'Editar Parceiro' : 'Novo Parceiro'}
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input label="Nome Completo" name="full_name" defaultValue={editingProfile?.full_name} required />
            <Input label="E-mail" name="email" defaultValue={editingProfile?.email} required type="email" />
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Cargo</label>
              <select name="role" defaultValue={editingProfile?.role || 'professional'} className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none">
                <option value="admin">Administrador (Admin)</option>
                <option value="professional">Profissional</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Estabelecimento</label>
              <select name="barbershop_id" defaultValue={editingProfile?.barbershop_id} className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none">
                <option value="">Nenhum</option>
                {barbershops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
            </div>
            <Button className="w-full" type="submit">Salvar Parceiro</Button>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmModalConfig.onConfirm}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          variant={confirmModalConfig.variant}
        />
      </div>
    </div>
  );
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error('Erro ao atualizar senha: ' + error.message);
    } else {
      toast.success('Senha atualizada com sucesso!');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Key className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Nova Senha</h1>
          <p className="text-zinc-500 mt-2 text-sm">Digite sua nova senha de acesso.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nova Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e: any) => setPassword(e.target.value)} 
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 outline-none transition-all"
            />
          </div>
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirmar Senha</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e: any) => setConfirmPassword(e.target.value)} 
              required
              placeholder="Repita a nova senha"
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 outline-none transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : 'Redefinir Senha'}
          </button>
          <div className="text-center">
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-950 uppercase tracking-wider transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PartnerLogin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/portal" element={<PartnerDashboard />} />
        <Route path="/master" element={<MasterDashboard />} />
        <Route path="/:slug" element={<PublicBarbershop />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
