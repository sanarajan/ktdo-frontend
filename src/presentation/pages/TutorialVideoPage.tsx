import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaArrowLeft, FaVideo } from 'react-icons/fa';

const TutorialVideoPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center p-4 selection:bg-brand">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand/5 rounded-full blur-[120px]" />
            </div>

            {/* Navigation / Header */}
            <nav className="w-full max-w-7xl mx-auto flex justify-between items-center py-8 relative z-10">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-brand to-yellow-500 bg-clip-text text-transparent">
                        KTDO
                    </h1>
                </div>
                <Link to="/" className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-brand transition">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-brand" />
                    Back to Home
                </Link>
            </nav>

            <main className="flex-1 w-full max-w-5xl flex flex-col justify-center items-center relative z-10 py-12">
                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/30 bg-brand/10 text-brand text-[10px] font-bold mb-4 tracking-widest uppercase">
                        <FaVideo /> Tutorial Guide
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        How to <span className="text-brand">Register</span>
                    </h2>
                    <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
                        Watch this step-by-step video guide to learn how to complete your driver registration process accurately.
                    </p>
                </motion.div>

                {/* Video Player Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full aspect-video bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative group backdrop-blur-sm"
                >
                    {/* Placeholder for Video - Real video tag */}
                    <video
                        className="w-full h-full object-cover"
                        controls
                        poster="/hero-driver.jpg" // Using an existing image as poster
                    >
                        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Custom Overlay if not playing (Optional, letting native controls handle for simplicity as requested "play button on video") */}
                </motion.div>

                {/* Getting Started Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12"
                >
                    <Link
                        to="/register"
                        className="flex items-center gap-3 px-10 py-4 bg-brand hover:bg-brand-dark text-black font-bold rounded-2xl transition-all shadow-lg shadow-brand/20 group"
                    >
                        Start Registration Now
                        <FaPlayCircle className="group-hover:rotate-12 transition-transform" />
                    </Link>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center relative z-10">
                <p className="text-gray-600 text-[10px] tracking-[4px] uppercase font-bold">
                    &copy; {new Date().getFullYear()} KTDO Ecosystem
                </p>
            </footer>
        </div>
    );
};

export default TutorialVideoPage;
