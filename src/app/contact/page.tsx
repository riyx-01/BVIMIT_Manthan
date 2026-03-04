'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollWrapper from '@/components/ScrollWrapper';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would send to an API endpoint
        setSubmitted(true);
    };

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-16 px-4 min-h-screen relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-manthan-maroon/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gold-gradient mb-4">
                            Contact Us
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Have questions about Manthan 2026? Reach out to us and we&apos;ll get back to you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <ScrollWrapper padding="p-8">
                                <h2 className="font-ancient text-2xl font-bold text-[#3d2b1f] mb-6 uppercase tracking-wider">
                                    Get in Touch
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-manthan-maroon/10 flex items-center justify-center flex-shrink-0">
                                            <Mail size={20} className="text-manthan-maroon" />
                                        </div>
                                        <div>
                                            <h3 className="font-ancient text-[#3d2b1f] font-medium uppercase text-sm">Email</h3>
                                            <p className="text-[#5c4033] text-sm">manthan@bvimit.co.in</p>
                                            <p className="text-[#5c4033] text-sm italic">support@manthan2026.in</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-manthan-maroon/10 flex items-center justify-center flex-shrink-0">
                                            <Phone size={20} className="text-manthan-maroon" />
                                        </div>
                                        <div>
                                            <h3 className="font-ancient text-[#3d2b1f] font-medium uppercase text-sm">Phone</h3>
                                            <p className="text-[#5c4033] text-sm font-semibold">+91 123 456 7890</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-manthan-maroon/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin size={20} className="text-manthan-maroon" />
                                        </div>
                                        <div>
                                            <h3 className="font-ancient text-[#3d2b1f] font-medium uppercase text-sm">Address</h3>
                                            <p className="text-[#5c4033] text-sm italic">
                                                BVIMIT, Sector-8, Belapur,<br />
                                                CBD, Navi Mumbai - 400614
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollWrapper>

                            {/* Coordinators */}
                            <ScrollWrapper padding="p-8">
                                <h2 className="font-ancient text-xl font-bold text-[#3d2b1f] mb-4 uppercase tracking-wider">
                                    Scribes of the Realm
                                </h2>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Uday Bhoi', role: 'General Secretary', phone: '+91 123 456 7890' },
                                        { name: 'Ameya Bagwe', role: 'Technical Head', phone: '+91 123 456 7891' },
                                        { name: 'Sameer Sawant', role: 'Cultural Head', phone: '+91 123 456 7892' },
                                    ].map((coord) => (
                                        <div key={coord.name} className="flex items-center justify-between p-3 border-b border-[#3d2b1f]/10">
                                            <div>
                                                <p className="text-[#3d2b1f] text-sm font-bold uppercase">{coord.name}</p>
                                                <p className="text-[#5c4033] text-xs font-serif italic">{coord.role}</p>
                                            </div>
                                            <a href={`tel:${coord.phone}`} className="text-manthan-maroon hover:text-manthan-crimson text-sm font-bold">
                                                {coord.phone}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </ScrollWrapper>
                        </div>

                        {/* Contact Form */}
                        <ScrollWrapper padding="p-8">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <MessageSquare size={48} className="mx-auto text-manthan-maroon mb-4" />
                                    <h3 className="font-ancient text-2xl font-bold text-[#3d2b1f] mb-2 uppercase">
                                        Inscribed!
                                    </h3>
                                    <p className="text-[#5c4033] italic">
                                        Your message has been received by the scribes. We&apos;ll get back to you soon.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-ancient text-2xl font-bold text-[#3d2b1f] mb-6 uppercase tracking-wider">
                                        Send a Message
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-sm text-[#3d2b1f] font-bold uppercase mb-1.5 ml-1">Your Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                className="parchment-input w-full px-4 py-3 text-[#3d2b1f] text-sm placeholder-[#5c4033]/40"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#3d2b1f] font-bold uppercase mb-1.5 ml-1">Email</label>
                                            <input
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="parchment-input w-full px-4 py-3 text-[#3d2b1f] text-sm placeholder-[#5c4033]/40"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#3d2b1f] font-bold uppercase mb-1.5 ml-1">Subject</label>
                                            <input
                                                type="text"
                                                required
                                                value={form.subject}
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                className="parchment-input w-full px-4 py-3 text-[#3d2b1f] text-sm placeholder-[#5c4033]/40"
                                                placeholder="Subject"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#3d2b1f] font-bold uppercase mb-1.5 ml-1">Message</label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={form.message}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                className="parchment-input w-full px-4 py-3 text-[#3d2b1f] text-sm placeholder-[#5c4033]/40 resize-none h-32"
                                                placeholder="Your message..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-gradient-to-r from-manthan-maroon to-manthan-crimson text-white font-ancient font-bold uppercase tracking-[0.2em] shadow-xl shadow-manthan-maroon/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-4"
                                        >
                                            <Send size={18} />
                                            Dispatch Message
                                        </button>
                                    </form>
                                </>
                            )}
                        </ScrollWrapper>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
