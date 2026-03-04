'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/workforce', label: 'Workforce' },
    { href: '/sponsorship', label: 'Sponsorship' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Background change
            setScrolled(currentScrollY > 50);

            // Visibility toggle (hide on scroll down, show on scroll up)
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                setVisible(false);
            } else {
                setVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <motion.nav
            initial={{ y: 0 }}
            animate={{
                y: visible ? 0 : -100,
                opacity: visible ? 1 : 0
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
                ? 'py-2 bg-manthan-black/98 backdrop-blur-3xl border-b border-manthan-gold/40 shadow-[0_8px_32px_rgba(0,0,0,0.9)]'
                : 'py-4 bg-transparent'
                }`}
        >
            <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo Section - Elegant Ancient Indian Themed */}
                <Link href="/" className="group flex items-center gap-4 relative z-[110]">
                    <div className="relative">
                        <div className="relative p-1 rounded-full border border-manthan-gold/30 bg-manthan-black/40 shadow-[0_0_15px_rgba(212,168,55,0.3)]">
                            <Image
                                src="/bbbg-removebg-preview.png"
                                alt="College Logo"
                                width={50}
                                height={50}
                                priority
                                className={`transition-all duration-500 ${scrolled ? 'h-10 w-10' : 'h-12 w-12'} object-contain brightness-110 contrast-125`}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col relative">
                        <span className={`font-ancient font-black tracking-wider leading-none transition-all duration-500 ${scrolled ? 'text-2xl' : 'text-3xl md:text-4xl'
                            } text-gold-gradient drop-shadow-[0_2px_8px_rgba(212,168,55,0.4)]`}>
                            MANTHAN
                        </span>
                        <div className="h-[1px] bg-gradient-to-r from-manthan-gold via-manthan-crimson to-transparent mt-0.5" />
                    </div>
                </Link>

                {/* Desktop Links - Slimmer & Elegant */}
                <div className="hidden lg:flex items-center space-x-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative group py-1"
                        >
                            <span className={`font-ancient ${scrolled ? 'text-xs' : 'text-sm'} uppercase tracking-[0.2em] font-bold text-gray-300 group-hover:text-manthan-gold transition-all duration-300`}>
                                {link.label}
                            </span>
                            <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-manthan-gold transition-all duration-500 group-hover:w-full"></span>
                        </Link>
                    ))}

                    {/* Stylish Register Button - Slimmer */}
                    <Link
                        href="/register"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group px-6 py-2.5 overflow-hidden border border-manthan-gold/50 hover:border-manthan-gold transition-colors"
                    >
                        <span className="absolute inset-0 bg-gradient-to-tr from-manthan-maroon-dark to-manthan-crimson opacity-80 group-hover:opacity-100 transition-opacity"></span>
                        <span className="relative flex items-center gap-2 font-ancient font-bold text-manthan-gold group-hover:text-white transition-colors uppercase tracking-[0.15em] text-xs">
                            Register <Sparkles size={12} />
                        </span>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden relative z-[110] p-4 text-manthan-gold bg-manthan-gold/5 hover:bg-manthan-gold/20 rounded-xl border border-manthan-gold/20 transition-all duration-300"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={36} /> : <Menu size={36} />}
                </button>
            </div>

            {/* Full Screen Menu Overlay - Enhanced Styling */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[105] bg-manthan-black flex flex-col items-center justify-center p-8 lg:hidden"
                    >
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.2)_0%,transparent_70%)]"></div>
                            {/* Funky Background Artifacts */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-20 -left-20 w-[600px] h-[600px] border border-manthan-gold/5 rounded-full"
                            />
                        </div>

                        <div className="flex flex-col items-center space-y-10 relative z-10 w-full max-w-lg">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="w-full"
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between group w-full py-6 border-b border-manthan-gold/10"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-heading text-4xl md:text-5xl uppercase tracking-tighter text-gray-500 group-hover:text-manthan-gold transition-all duration-500">
                                                {link.label}
                                            </span>
                                            <span className="text-[10px] text-manthan-gold/30 uppercase tracking-[0.4em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore Realm</span>
                                        </div>
                                        <ChevronRight size={40} className="text-manthan-gold opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-10 group-hover:translate-x-0" />
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="pt-12 w-full"
                            >
                                <Link
                                    href="/register"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center py-6 bg-gradient-to-r from-manthan-maroon to-manthan-crimson text-white font-heading font-black text-2xl uppercase tracking-[0.3em] rounded-sm transform hover:scale-105 transition-all shadow-2xl shadow-manthan-maroon/40 border border-manthan-gold/20"
                                >
                                    JOIN THE LEGEND
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
