import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaUserPlus, FaSignInAlt, FaIdCard, FaShieldAlt, FaUsers, FaArrowRight, FaBars, FaTimes } from 'react-icons/fa';

const HomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-brand selection:text-black">
            
            {/* Navigation - Ultra Modern Glass Style */}
            <nav className="fixed top-0 w-full z-50 bg-black/60  backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <motion.img 
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                src="/logo.png" alt="KTDO Logo" className="w-10 h-10 object-contain" 
                            />
                            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-brand to-yellow-500 bg-clip-text text-transparent">
                                KTDO
                            </h1>
                        </div>
                        
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className="text-sm font-medium text-brand hover:text-brand transition">Home</Link>
                            <Link to="/about" className="text-sm font-medium text-gray-400 hover:text-brand transition">About</Link>
                            <Link to="/contact" className="text-sm font-medium text-gray-400 hover:text-brand transition">Contact</Link>
                            <Link to="/register" className="px-5 py-2.5 bg-brand text-black rounded-full text-sm font-bold hover:shadow-[0_0_20px_rgba(255,204,0,0.4)] transition-all">
                                Register Now
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button onClick={toggleMenu} className="md:hidden text-brand">
                            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION WITH INDUSTRIAL BANNER */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                
                {/* 1. The Background Image Banner */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero-driver.jpg" 
                        alt="Professional Driver Banner" 
                        className="w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    {/* 2. Professional Gradient Overlay (The Secret Sauce) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505]"></div>
                </div>

                {/* 3. Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/30 bg-brand/10 text-brand text-xs font-bold mb-8 tracking-widest uppercase">
                           <span className="relative flex h-2 w-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                           </span>
                          KTDO 
                        </div>
                        
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
                           Register to   <br />
                            <span className="text-brand">Create Your ID Card.</span>
                        </h2>
                        
                        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                           Please ensure all details are entered accurately. The information you provide in this form will be printed exactly as written on your final ID card. 
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/register" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-brand text-black font-black rounded-2xl hover:scale-105 transition-all shadow-2xl">
                                <FaUserPlus /> Add your details
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/admin" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md">
                                <FaSignInAlt /> Watch video
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Ambient Glow for extra depth */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/10 blur-[150px] rounded-full -z-5" />
            </section>

            {/* Bento Grid Features */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: <FaIdCard />, title: "Digital ID Card", desc: "Automated identification generation with unique member protocols.", color: "from-brand/20" },
                        { icon: <FaShieldAlt />, title: "Verified Protocols", desc: "Multi-tier verification system ensuring community trust and safety.", color: "from-blue-500/10" },
                        { icon: <FaUsers />, title: "Statewide Network", desc: "Seamlessly connecting drivers across all districts of Kerala.", color: "from-purple-500/10" }
                    ].map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -10 }}
                            className={`p-8 rounded-3xl bg-gradient-to-br ${feature.color} to-[#050505]/50 border border-white/5 backdrop-blur-md group hover:border-brand/40 transition-all shadow-2xl`}
                        >
                            <div className="bg-brand text-black w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-[0_0_15px_rgba(255,204,0,0.3)]">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-black mb-4 group-hover:text-brand transition-colors">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 opacity-50 mx-auto mb-4" />
                    <p className="text-gray-500 text-xs tracking-[4px] uppercase font-bold">
                        &copy; {new Date().getFullYear()} KTDO Ecosystem
                    </p>
                    <p className="text-[10px] text-gray-600 font-mono italic mt-4">Built with MERN x Clean Architecture</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;