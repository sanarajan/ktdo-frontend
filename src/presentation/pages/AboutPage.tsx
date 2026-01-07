import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Added for modern smooth animations
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const AboutPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    return (
        <div className="min-h-screen bg-black">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
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
                            <Link to="/" className="text-sm font-medium text-gray-400 hover:text-brand transition">Home</Link>
                            <Link to="/about" className="text-sm font-medium text-brand hover:text-brand transition">About</Link>
                            <Link to="/contact" className="text-sm font-medium text-gray-400 hover:text-brand transition">Contact</Link>
                            <Link to="/register" className="px-5 py-2.5 bg-brand text-black rounded-full text-sm font-bold hover:shadow-[0_0_20px_rgba(255,204,0,0.4)] transition-all">
                                Register Now
                            </Link>
                        </div>

                        {/* Mobile Burger Menu Button */}
                        <button 
                            onClick={toggleMenu}
                            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-brand transition-all"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        </button>
                    </div>

                    {/* Mobile Menu - Animated Dropdown */}
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden"
                        >
                            <div className="px-6 py-4 space-y-3">
                                <Link 
                                    to="/" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-brand hover:bg-white/5 transition-all"
                                >
                                    Home
                                </Link>
                                <Link 
                                    to="/about" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-medium text-brand bg-brand/10 border border-brand/20 hover:bg-brand/20 transition-all"
                                >
                                    About
                                </Link>
                                <Link 
                                    to="/contact" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-brand hover:bg-white/5 transition-all"
                                >
                                    Contact
                                </Link>
                                <Link 
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-4 py-3 bg-brand text-black rounded-lg text-sm font-bold hover:shadow-[0_0_20px_rgba(255,204,0,0.4)] transition-all text-center"
                                >
                                    Register Now
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold text-white mb-8 mt-7">About DriverConnect</h1>

                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        DriverConnect is dedicated to empowering professional drivers by providing
                        a comprehensive membership platform that offers official identification,
                        verification, and community support.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        We believe in creating a unified network of professional drivers who can
                        benefit from official recognition, streamlined verification processes, and
                        access to exclusive member benefits.
                    </p>
                </div>

                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">What We Offer</h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="text-brand mt-1">✓</span>
                            <span>Official driver ID cards with unique identification numbers</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-brand mt-1">✓</span>
                            <span>Instant verification and approval for registered drivers</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-brand mt-1">✓</span>
                            <span>District-wise organization and management</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-brand mt-1">✓</span>
                            <span>Professional profile management</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-brand mt-1">✓</span>
                            <span>Community networking opportunities</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                    <p className="text-gray-300 leading-relaxed">
                        To become the leading platform for professional driver registration and
                        verification, creating a trusted ecosystem that benefits drivers, employers,
                        and the broader transportation community.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-400">
                        <p>&copy; 2024 DriverConnect. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;
