import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaUserPlus, FaHome, FaArrowRight } from 'react-icons/fa';

const RegistrationSuccessPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4 selection:bg-brand">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl relative z-10 text-center shadow-2xl"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                    className="w-24 h-24 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand/30 shadow-[0_0_50px_rgba(255,215,0,0.1)]"
                >
                    <FaCheckCircle className="text-brand text-5xl" />
                </motion.div>

                {/* Content */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
                >
                    Registration <span className="text-brand">Complete!</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-400 text-lg mb-12 max-w-md mx-auto leading-relaxed"
                >
                    Thank you for joining us. Your application has been submitted successfully and is currently under review by our team.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link
                        to="/register"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-brand hover:bg-brand-dark text-black font-bold rounded-2xl transition-all shadow-lg shadow-brand/20 group"
                    >
                        <FaUserPlus />
                        Continue Registration
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        to="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all backdrop-blur-sm"
                    >
                        <FaHome className="text-brand" />
                        Back to Home
                    </Link>
                </motion.div>

                {/* Footer Info */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-sm text-gray-500 font-medium"
                >
                    Need help? <Link to="/contact" className="text-brand hover:underline">Contact Support</Link>
                </motion.p>
            </motion.div>
        </div>
    );
};

export default RegistrationSuccessPage;
