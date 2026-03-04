'use client';

import { useState, useEffect, useCallback, Suspense, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Event, RegistrationFormData, TeamMember, TeamRegistration } from '@/lib/types';
import ScrollWrapper from '@/components/ScrollWrapper';
import AnimatedButton from '@/components/AnimatedButton';
import {
    formatFee,
    categoryColors,
    categoryIcons,
} from '@/lib/constants';
import {
    ArrowLeft, ArrowRight, Check, CreditCard, AlertTriangle,
    User, Mail, Phone, Building, GraduationCap, BookOpen,
    ShieldCheck, Sparkles
} from 'lucide-react';

declare global {
    interface Window {
        Razorpay?: new (options: Record<string, unknown>) => {
            on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
            open: () => void;
        };
    }
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];
const steps = [
    { id: 1, label: 'Basic Info' },
    { id: 2, label: 'Events' },
    { id: 3, label: 'Payment' },
];

function getTeamBounds(event: Event): { min: number; max: number } {
    if (event.team_size_fixed && event.team_size_fixed > 0) {
        return { min: event.team_size_fixed, max: event.team_size_fixed };
    }
    if (event.team_size_min && event.team_size_max) {
        return { min: event.team_size_min, max: event.team_size_max };
    }
    if (event.team_size > 1) {
        return { min: event.team_size, max: event.team_size };
    }
    return { min: 1, max: 1 };
}

function needsTeamDetails(event: Event): boolean {
    return getTeamBounds(event).max > 1;
}

function getDefaultTeamSize(event: Event): number {
    return getTeamBounds(event).min;
}

function normalizeMembers(members: TeamMember[], expectedCount: number): TeamMember[] {
    const normalized = members.slice(0, expectedCount);
    while (normalized.length < expectedCount) {
        normalized.push({ name: '' });
    }
    return normalized;
}

function estimateEventAmount(event: Event, teamRegistration?: TeamRegistration): number {
    const teamSize = needsTeamDetails(event)
        ? Math.max(1, teamRegistration?.team_size ?? getDefaultTeamSize(event))
        : 1;
    return event.fee_calculation === 'per_participant' ? event.fee * teamSize : event.fee;
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-manthan-black">
                <LoadingSpinner />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedEvent = searchParams.get('event');

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>(preselectedEvent ? [preselectedEvent] : []);
    const [formData, setFormData] = useState<RegistrationFormData>({
        name: '', email: '', phone: '', college: '', year: '', department: '',
        event_ids: [], team_registrations: [],
    });
    const [teamRegistrations, setTeamRegistrations] = useState<Record<string, TeamRegistration>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [razorpayReady, setRazorpayReady] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch('/api/events');
                const data = await res.json();
                const fetchedEvents = data.events || [];
                setEvents(fetchedEvents);
                if (preselectedEvent) {
                    const event = fetchedEvents.find((e: Event) => e.slug === preselectedEvent || e.id === preselectedEvent);
                    if (event) setSelectedIds([event.id]);
                }
            } catch (err) { console.error('Failed to fetch events:', err); }
            finally { setLoading(false); }
        }
        fetchEvents();
    }, [preselectedEvent]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            setRazorpayReady(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayReady(true);
        script.onerror = () => {
            setRazorpayReady(false);
            setPaymentError('Failed to load payment gateway. Please refresh and try again.');
        };
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }, []);

    const toggleEvent = useCallback((id: string) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
        setErrors(errs => ({ ...errs, events: '' }));
    }, []);

    useEffect(() => {
        setTeamRegistrations((prev) => {
            const next: Record<string, TeamRegistration> = {};
            for (const event of events) {
                if (!selectedIds.includes(event.id) || !needsTeamDetails(event)) continue;
                const existing = prev[event.id];
                const bounds = getTeamBounds(event);
                const safeSize = existing ? Math.min(bounds.max, Math.max(bounds.min, existing.team_size)) : getDefaultTeamSize(event);
                next[event.id] = {
                    event_id: event.id, team_name: existing?.team_name || '', team_size: safeSize,
                    members: normalizeMembers(existing?.members || [], Math.max(0, safeSize)),
                };
            }
            return next;
        });
    }, [events, selectedIds]);

    const updateTeamRegistration = useCallback((eventId: string, updater: (current: TeamRegistration) => TeamRegistration) => {
        setTeamRegistrations((prev) => {
            const event = events.find((entry) => entry.id === eventId);
            if (!event || !needsTeamDetails(event)) return prev;
            const existing = prev[eventId] || {
                event_id: eventId, team_name: '', team_size: getDefaultTeamSize(event),
                members: normalizeMembers([], Math.max(0, getDefaultTeamSize(event))),
            };
            const updated = updater(existing);
            const bounds = getTeamBounds(event);
            const clampedSize = Math.min(bounds.max, Math.max(bounds.min, updated.team_size));
            return {
                ...prev,
                [eventId]: { ...updated, team_size: clampedSize, members: normalizeMembers(updated.members || [], Math.max(0, clampedSize)) },
            };
        });
    }, [events]);

    const previewTotal = events.filter((e) => selectedIds.includes(e.id)).reduce((sum, e) => sum + estimateEventAmount(e, teamRegistrations[e.id]), 0);
    const selectedEvents = events.filter((e) => selectedIds.includes(e.id));

    const validateBasicInfo = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name || formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
        if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Enter a valid 10-digit mobile number';
        if (!formData.college || formData.college.trim().length < 2) newErrors.college = 'College name is required';
        if (!formData.year) newErrors.year = 'Select your year';
        if (!formData.department || formData.department.trim().length < 1) newErrors.department = 'Department is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEvents = (): boolean => {
        if (selectedIds.length === 0) { setErrors({ events: 'Please select at least one event' }); return false; }
        for (const event of selectedEvents) {
            if (!needsTeamDetails(event)) continue;
            const team = teamRegistrations[event.id];
            if (!team) { setErrors({ events: `Team details are required for ${event.name}` }); return false; }
            const bounds = getTeamBounds(event);
            if (team.team_size < bounds.min || team.team_size > bounds.max) {
                setErrors({ events: bounds.min === bounds.max ? `${event.name} requires exactly ${bounds.min} participants` : `${event.name} team size must be between ${bounds.min} and ${bounds.max}` });
                return false;
            }
            if (team.members.length !== Math.max(0, team.team_size)) { setErrors({ events: `${event.name} teammate details are incomplete` }); return false; }
            for (let index = 0; index < team.members.length; index++) {
                if (!team.members[index].name || team.members[index].name.trim().length < 2) {
                    setErrors({ events: `${event.name}: teammate ${index + 1} name is required` });
                    return false;
                }
            }
        }
        setErrors({}); return true;
    };

    const handlePayment = async () => {
        if (processing) return;
        setProcessing(true); setPaymentMessage(''); setPaymentError('');
        try {
            if (!validateBasicInfo() || !validateEvents()) { setProcessing(false); return; }
            if (!razorpayReady || !window.Razorpay) throw new Error('Payment gateway is still loading. Please try again.');
            if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) throw new Error('Payment key is not configured.');

            const teamPayload = selectedEvents.filter((event) => needsTeamDetails(event)).map((event) => {
                const team = teamRegistrations[event.id];
                return { event_id: event.id, team_name: team.team_name?.trim() || null, team_size: team.team_size, members: team.members.map((member) => ({ name: member.name })) };
            });

            const payload = { ...formData, event_ids: selectedIds, team_registrations: teamPayload };
            const orderResponse = await fetch('/api/payment/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const orderData = await orderResponse.json();
            if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create payment order.');

            const checkout = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: orderData.order.amount, currency: orderData.order.currency,
                name: 'Manthan 2026', description: `${selectedIds.length} event registration${selectedIds.length > 1 ? 's' : ''}`, order_id: orderData.order.id,
                prefill: { name: formData.name, email: formData.email, contact: formData.phone }, notes: { college: formData.college }, theme: { color: '#8B0000' },
                handler: async (response: any) => {
                    setProcessing(true); setPaymentError('');
                    try {
                        const verifyResponse = await fetch('/api/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) });
                        const verifyData = await verifyResponse.json();
                        if (!verifyResponse.ok) throw new Error(verifyData.error || 'Payment verification failed.');
                        setPaymentMessage('Payment verified successfully. Redirecting...');
                        router.push(`/confirmation/${verifyData.ticket_id || orderData.ticket_id}`);
                    } catch (error: any) { setPaymentError(getErrorMessage(error, 'Payment verification failed.')); }
                    finally { setProcessing(false); }
                },
                modal: { ondismiss: () => { setPaymentError('Payment was cancelled.'); setProcessing(false); } },
            });
            checkout.on('payment.failed', (response: any) => { setPaymentError(response.error?.description || 'Payment failed.'); setProcessing(false); });
            checkout.open();
            setProcessing(false);
        } catch (error: any) { setPaymentError(getErrorMessage(error, 'Unable to start payment.')); setProcessing(false); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-manthan-black">
            <LoadingSpinner />
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Background Video (Optimized) */}
            <div className="fixed inset-0 -z-10 w-full h-full">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 transition-opacity duration-1000">
                    <source src="https://k6iphva0ugo1rocg.public.blob.vercel-storage.com/extended%20.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="pt-24 px-6 md:pt-32 relative z-10">
                <div className="max-w-2xl mx-auto">
                    {/* Step indicators */}
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex items-center">
                                <button
                                    onClick={() => { if (s.id < step) { setStep(s.id); setDirection(-1); } }}
                                    className={`flex items-center gap-2 text-xs font-medium transition-all ${step === s.id ? 'text-manthan-gold' : step > s.id ? 'text-manthan-gold/60' : 'text-gray-600'}`}
                                >
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${step > s.id ? 'bg-manthan-maroon/20 border-manthan-maroon/40 text-manthan-maroon' : step === s.id ? 'bg-manthan-maroon border-manthan-maroon text-white' : 'bg-transparent border-gray-800 text-gray-600'}`}>
                                        {step > s.id ? <Check size={14} /> : s.id}
                                    </span>
                                    <span className="hidden sm:inline uppercase tracking-widest">{s.label}</span>
                                </button>
                                {i < steps.length - 1 && <div className={`w-12 sm:w-20 h-px mx-2 sm:mx-4 ${step > s.id ? 'bg-manthan-gold/40' : 'bg-gray-800'}`} />}
                            </div>
                        ))}
                    </div>

                    <ScrollWrapper padding="p-8 md:p-12 mb-20">
                        <AnimatePresence mode="wait" custom={direction}>
                            {step === 1 && (
                                <motion.div key="step1" custom={direction} initial={{ x: direction * 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction * -50, opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                                    <div className="text-center mb-8">
                                        <h2 className="font-ancient text-4xl font-bold text-[#3d2b1f] mb-2 uppercase tracking-widest text-shadow-sm">Inscribe Your Name</h2>
                                        <div className="h-px w-24 bg-manthan-maroon/30 mx-auto" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <FormField icon={<User size={18} />} label="Full Name" error={errors.name} focused={focusedField === 'name'}>
                                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} placeholder="Scribe your legendary name" className="w-full bg-transparent px-2 py-3 text-base text-[#3d2b1f] placeholder-[#3d2b1f]/40 focus:outline-none font-medium" />
                                        </FormField>
                                        <FormField icon={<Mail size={18} />} label="Email Realm" error={errors.email} focused={focusedField === 'email'}>
                                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="your@scroll.com" className="w-full bg-transparent px-2 py-3 text-base text-[#3d2b1f] placeholder-[#3d2b1f]/40 focus:outline-none font-medium" />
                                        </FormField>
                                        <FormField icon={<Phone size={18} />} label="Signal Number" error={errors.phone} focused={focusedField === 'phone'}>
                                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} placeholder="10 digits of your decree" maxLength={10} className="w-full bg-transparent px-2 py-3 text-base text-[#3d2b1f] placeholder-[#3d2b1f]/40 focus:outline-none font-medium" />
                                        </FormField>
                                        <FormField icon={<Building size={18} />} label="Great Hall (College)" error={errors.college} focused={focusedField === 'college'}>
                                            <input type="text" value={formData.college} onChange={(e) => setFormData({ ...formData, college: e.target.value })} onFocus={() => setFocusedField('college')} onBlur={() => setFocusedField(null)} placeholder="The name of your institution" className="w-full bg-transparent px-2 py-3 text-base text-[#3d2b1f] placeholder-[#3d2b1f]/40 focus:outline-none font-medium" />
                                        </FormField>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField icon={<GraduationCap size={18} />} label="Year of Study">
                                                <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full bg-transparent px-2 py-3 text-base text-[#3d2b1f] focus:outline-none font-medium appearance-none">
                                                    <option value="" className="bg-[#f4e4bc]">Select Year</option>
                                                    {yearOptions.map(y => <option key={y} value={y} className="bg-[#f4e4bc]">{y}</option>)}
                                                </select>
                                            </FormField>
                                            <FormField icon={<BookOpen size={18} />} label="Department">
                                                <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="CS, IT..." className="w-full bg-transparent px-2 py-3 text-base text-[#3d2b1f] placeholder-[#3d2b1f]/40 focus:outline-none font-medium" />
                                            </FormField>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <AnimatedButton onClick={() => { if (validateBasicInfo()) { setStep(2); setDirection(1); } }} icon={ArrowRight}>Proceed to Arena</AnimatedButton>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" custom={direction} initial={{ x: direction * 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction * -50, opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                                    <div className="text-center mb-8">
                                        <h2 className="font-ancient text-4xl font-bold text-[#3d2b1f] mb-2 uppercase tracking-widest text-shadow-sm">Choose Your Trial</h2>
                                        <div className="h-px w-24 bg-manthan-maroon/30 mx-auto" stroke-width="1.2" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {events.map((event) => (
                                            <div key={event.id} onClick={() => toggleEvent(event.id)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedIds.includes(event.id) ? 'border-manthan-maroon bg-manthan-maroon/10' : 'border-[#3d2b1f]/10 hover:border-manthan-maroon/30'}`}>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-ancient text-lg text-[#3d2b1f]">{event.name}</h4>
                                                        <span className="text-xs uppercase tracking-wider text-manthan-maroon font-bold">{event.category} · {formatFee(event.fee)}</span>
                                                    </div>
                                                    {selectedIds.includes(event.id) && <Check className="text-manthan-maroon" size={20} />}
                                                </div>
                                                {selectedIds.includes(event.id) && needsTeamDetails(event) && (
                                                    <div className="mt-4 pt-4 border-t border-manthan-maroon/20 space-y-3" onClick={(e) => e.stopPropagation()}>
                                                        <input type="text" placeholder="Team Name (Optional)" value={teamRegistrations[event.id]?.team_name || ''} onChange={(e) => updateTeamRegistration(event.id, cur => ({ ...cur, team_name: e.target.value }))} className="w-full bg-white/40 border border-[#3d2b1f]/20 rounded px-3 py-2 text-xs text-[#3d2b1f]" />
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {teamRegistrations[event.id]?.members.map((m, idx) => (
                                                                <input key={idx} type="text" placeholder={`Teammate ${idx + 1} Name`} value={m.name} onChange={(e) => updateTeamRegistration(event.id, cur => { const mem = [...cur.members]; mem[idx] = { name: e.target.value }; return { ...cur, members: mem }; })} className="w-full bg-white/40 border border-[#3d2b1f]/20 rounded px-3 py-2 text-xs text-[#3d2b1f]" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {errors.events && <p className="text-red-600 text-[11px] font-bold text-center italic">{errors.events}</p>}

                                    <div className="flex justify-between pt-4">
                                        <button onClick={() => { setStep(1); setDirection(-1); }} className="text-manthan-maroon text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
                                            <ArrowLeft size={16} /> Retreat
                                        </button>
                                        <AnimatedButton onClick={() => { if (validateEvents()) { setStep(3); setDirection(1); } }} icon={ShieldCheck}>Sacred Review</AnimatedButton>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" custom={direction} initial={{ x: direction * 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction * -50, opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                                    <div className="text-center mb-8">
                                        <h2 className="font-ancient text-4xl font-bold text-[#3d2b1f] mb-2 uppercase tracking-widest text-shadow-sm">Divine Inscription</h2>
                                        <div className="h-px w-24 bg-manthan-maroon/30 mx-auto" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded border border-[#3d2b1f]/10 bg-white/20">
                                            <h4 className="text-xs uppercase tracking-[0.2em] text-manthan-maroon font-bold mb-3">Voter Information</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm md:text-base">
                                                <div><p className="text-[#3d2b1f]/60 mb-1 leading-none uppercase text-[9px]">Scribe</p><p className="text-[#3d2b1f] font-bold">{formData.name}</p></div>
                                                <div><p className="text-[#3d2b1f]/60 mb-1 leading-none uppercase text-[9px]">Scroll</p><p className="text-[#3d2b1f] font-bold line-clamp-1">{formData.email}</p></div>
                                                <div><p className="text-[#3d2b1f]/60 mb-1 leading-none uppercase text-xs">Hall</p><p className="text-[#3d2b1f] font-bold line-clamp-1">{formData.college}</p></div>
                                                <div><p className="text-[#3d2b1f]/60 mb-1 leading-none uppercase text-xs">Amount</p><p className="text-manthan-maroon font-black text-lg">{formatFee(previewTotal)}</p></div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded border border-[#3d2b1f]/10 bg-white/20">
                                            <h4 className="text-xs uppercase tracking-[0.2em] text-manthan-maroon font-bold mb-3">Chosen Trials</h4>
                                            <div className="space-y-2">
                                                {selectedEvents.map(e => (
                                                    <div key={e.id} className="flex justify-between items-center text-sm md:text-base">
                                                        <span className="text-[#3d2b1f] leading-none">{e.name}</span>
                                                        <span className="text-manthan-maroon font-bold">{formatFee(estimateEventAmount(e, teamRegistrations[e.id]))}</span>
                                                    </div>
                                                ))}
                                                <div className="pt-2 mt-2 border-t border-[#3d2b1f]/10 flex justify-between items-center">
                                                    <span className="text-[#3d2b1f] font-black uppercase tracking-tighter">Total Offering</span>
                                                    <span className="text-manthan-maroon font-black text-xl">{formatFee(previewTotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {paymentError && <p className="text-red-600 text-[11px] font-bold text-center italic">{paymentError}</p>}
                                    {paymentMessage && <p className="text-manthan-maroon text-[11px] font-bold text-center animate-pulse italic">{paymentMessage}</p>}

                                    <div className="flex justify-between pt-4">
                                        <button onClick={() => { setStep(2); setDirection(-1); }} className="text-manthan-maroon text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
                                            <ArrowLeft size={16} /> Reconsider
                                        </button>
                                        <AnimatedButton onClick={handlePayment} icon={processing ? undefined : Sparkles} className={processing ? 'opacity-50 cursor-not-allowed' : ''}>
                                            {processing ? 'Inscribing...' : 'Ascend to Legend'}
                                        </AnimatedButton>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </ScrollWrapper>
                </div>
            </div>

            <Footer />
        </div>
    );
}

function FormField({ icon, label, children, error, focused }: { icon: ReactNode, label: string, children: ReactNode, error?: string, focused?: boolean }) {
    return (
        <div className="relative group">
            <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${focused ? 'bg-[#f4e4bc]/40 border-manthan-maroon shadow-[0_0_20px_rgba(139,0,0,0.1)]' : 'bg-[#f4e4bc]/20 border-[#3d2b1f]/10'}`}>
                <div className={`mt-3 transition-colors duration-300 ${focused ? 'text-manthan-maroon' : 'text-[#3d2b1f]/40'}`}>{icon}</div>
                <div className="flex-1">
                    <label className={`block text-xs uppercase tracking-[0.2em] font-black mb-1 transition-colors duration-300 ${focused ? 'text-manthan-maroon' : 'text-[#3d2b1f]/60'}`}>{label}</label>
                    {children}
                </div>
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute -bottom-5 left-4 text-[10px] text-red-600 font-bold italic tracking-wide">{error}</motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
