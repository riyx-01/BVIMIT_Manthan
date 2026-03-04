'use client';

import { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Trophy, Music, BookOpen, Users, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { IntroContext } from '@/components/ClientLayout';
import ScrollWrapper from '@/components/ScrollWrapper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

export default function HomePage() {
    const { introComplete } = useContext(IntroContext);
    const { scrollYProgress } = useScroll();

    // Parallax and scroll effects
    const heroContentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    // Section assets
    const parchmentEdge = "/torn_parchment_edge_horizontal_1772561356303.png";

    const events = [
        { title: "Prompt2Website", category: "Technical", description: "The Vibe Coding Challenge" },
        { title: "TypeSprint", category: "Technical", description: "The Ultimate Typing Showdown" },
        { title: "QuizStorm", category: "Technical", description: "Battle of Brains" },
        { title: "NrityaVerse", category: "Cultural", description: "Where tradition meets expression" },
        { title: "SurTarang", category: "Cultural", description: "Ride the waves of melody" },
        { title: "Badminton", category: "Sports", description: "Outdoor sports challenge" },
        { title: "Box Cricket", category: "Sports", description: "The urban cricket league" },
        { title: "Volleyball", category: "Sports", description: "Power, Speed, Teamwork" },
        { title: "BGMI", category: "Sports", description: "The E-Sports Showdown" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: introComplete ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`${introComplete ? "block" : "hidden"} bg-transparent overflow-x-hidden`}
        >
            <Navbar />

            <main className="bg-transparent">
                {/* 1. HERO SECTION - CLEAN & VIDEO FOCUSED */}
                <section className="relative min-h-[90vh] flex items-center justify-center p-4 overflow-hidden pt-20">
                    {/* Hero Content */}
                    <motion.div
                        style={{ opacity: heroContentOpacity }}
                        className="relative z-10 text-center max-w-4xl mx-auto px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2 }}
                            className="mb-8"
                        >
                            <Image
                                src="/manthan_final_logo.png"
                                alt="Manthan 2026"
                                width={600}
                                height={240}
                                priority
                                className="mx-auto gold-glow drop-shadow-[0_0_30px_rgba(212,168,55,0.3)]"
                            />
                        </motion.div>

                        <h2 className="font-ancient text-4xl md:text-6xl text-gold-gradient tracking-widest uppercase mb-12">
                            Roots to Realms
                        </h2>

                        <Link
                            href="/events"
                            className="group relative inline-flex px-10 py-4 bg-manthan-maroon border border-manthan-gold/40 font-ancient text-lg text-manthan-gold font-bold uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Explore The Realms <ArrowRight />
                            </span>
                        </Link>
                    </motion.div>

                    <div className="absolute bottom-0 left-0 w-full h-32 z-20 translate-y-2">
                        <Image src={parchmentEdge} alt="" fill className="object-fill grayscale brightness-0 invert opacity-10" />
                    </div>
                </section>

                {/* 2. EVENT REALM CAROUSEL - Dynamic & Thematic */}
                <section className="relative py-24 pb-40 px-6 overflow-hidden">
                    <div className="max-w-[1400px] mx-auto relative z-10">
                        <div className="text-center mb-16">
                            <h3 className="font-ancient text-5xl md:text-7xl text-gold-gradient uppercase mb-4">The Arena</h3>
                            <p className="font-serif italic text-manthan-gold/60 text-xl">Chronicles of Competition & Grace</p>
                        </div>

                        <Swiper
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView={'auto'}
                            coverflowEffect={{
                                rotate: 30,
                                stretch: 0,
                                depth: 100,
                                modifier: 1,
                                slideShadows: false,
                            }}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            pagination={{ clickable: true }}
                            modules={[Autoplay, Pagination, EffectCoverflow]}
                            className="event-swiper !pb-20"
                        >
                            {events.map((event, idx) => (
                                <SwiperSlide key={idx} className="!w-[300px] md:!w-[400px]">
                                    <Link href={`/events?category=${event.category.toLowerCase()}`} className="block">
                                        <ScrollWrapper padding="p-10" className="min-h-[450px]">
                                            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#b8860b]/40" />
                                            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#b8860b]/40" />

                                            <div>
                                                <span className="font-ancient text-xs tracking-[0.3em] uppercase text-manthan-maroon mb-2 block">{event.category}</span>
                                                <h4 className="font-ancient text-3xl md:text-4xl text-[#3d2b1f] mb-6 leading-tight">{event.title}</h4>
                                                <div className="h-[2px] w-12 bg-manthan-maroon mb-6" />
                                                <p className="font-serif italic text-[#5c4033] text-lg leading-relaxed">
                                                    {event.description}
                                                </p>
                                            </div>

                                            <div className="mt-8 flex items-center gap-2 font-ancient font-bold text-manthan-maroon uppercase tracking-widest text-sm group-hover:gap-4 transition-all">
                                                Explore {event.category} <Sparkles size={16} />
                                            </div>
                                        </ScrollWrapper>
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>

                <section className="py-24 bg-transparent">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <ScrollWrapper padding="p-12">
                            <h2 className="font-ancient text-4xl text-[#3d2b1f] mb-4">Ascend to Legend</h2>
                            <p className="text-[#5c4033] mb-8 max-w-lg mx-auto italic">
                                Unleash the spirit of the ancients. The realms of Manthan 2026 await your legend. Scribe your name in the chronicles of history.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex px-12 py-4 bg-gradient-to-r from-manthan-maroon to-manthan-crimson text-white font-ancient font-bold uppercase tracking-[0.3em] shadow-xl shadow-manthan-maroon/20 hover:scale-105 transition-transform"
                            >
                                Register Inscriptions
                            </Link>
                        </ScrollWrapper>
                    </div>
                </section>
            </main>

            <Footer />
        </motion.div>
    );
}

