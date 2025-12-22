import { Link } from 'react-router-dom';
import { FaUserPlus, FaUserShield, FaCar, FaIdCard } from 'react-icons/fa';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-1/2 -left-1/2 w-[100vw] h-[100vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-1/2 right-0 w-[80vw] h-[80vw] bg-purple-600/10 rounded-full blur-[100px] transform translate-x-1/3"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
                    <FaCar className="text-indigo-400" />
                    <span>Driver<span className="text-indigo-400">Connect</span></span>
                </div>
                <div className="hidden md:flex gap-8 text-gray-300 font-medium">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#about" className="hover:text-white transition-colors">About</a>
                    <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                </div>
                <Link to="/login" className="hidden md:block px-6 py-2 rounded-full border border-gray-600 hover:border-indigo-400 hover:text-indigo-400 transition-all">
                    Sign In
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold tracking-wide uppercase">
                    Trusted by 10,000+ Drivers
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-200 drop-shadow-sm">
                    Professional Driver<br />Membership System
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12 leading-relaxed">
                    The ultimate platform for driver registration, ID card management, and district administration. Secure, fast, and compliant.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                    <Link to="/register" className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center justify-center gap-3">
                        <FaUserPlus />
                        Register Now
                        <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                    </Link>
                    <Link to="/admin" className="group px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-lg border border-gray-700 hover:border-gray-600 transition-all hover:scale-105 flex items-center justify-center gap-3">
                        <FaUserShield className="text-indigo-400" />
                        Admin Access
                    </Link>
                </div>
            </main>

            {/* Features Grid */}
            <section className="relative z-10 container mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="p-8 rounded-3xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-indigo-500/30 transition-all group">
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 text-2xl group-hover:scale-110 transition-transform">
                            <FaIdCard />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Digital ID Cards</h3>
                        <p className="text-gray-400 leading-relaxed">Instantly generate and manage verifiable digital ID cards for all verified members.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-3xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/30 transition-all group">
                        <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 text-2xl group-hover:scale-110 transition-transform">
                            <FaUserShield />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">District Admin</h3>
                        <p className="text-gray-400 leading-relaxed">Hierarchical management system allowing district-level control and monitoring.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-3xl bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/30 transition-all group">
                        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 text-2xl group-hover:scale-110 transition-transform">
                            <FaCar />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Vehicle Database</h3>
                        <p className="text-gray-400 leading-relaxed">Comprehensive database of driver vehicles, licenses, and compliance records.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
