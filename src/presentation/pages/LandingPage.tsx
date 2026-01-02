import { Link } from 'react-router-dom';
import { FaUserPlus, FaUserShield, FaCar, FaIdCard } from 'react-icons/fa';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-brand text-black font-sans selection:bg-black selection:text-brand overflow-hidden relative">

            {/* Navbar */}
            <header className="w-full" style={{ background: 'linear-gradient(90deg, black 75%, #ffd333 75%)' }}>
                <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
                        <FaCar className="text-brand" />
                        <span>Driver<span className="text-brand">Connect</span></span>
                    </div>
                    <div className="hidden md:flex gap-8 text-gray-300 font-medium">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <Link to="/login" className="hidden md:block px-6 py-2 rounded-full bg-black text-white hover:bg-gray-900 transition-all border border-gray-800">
                        Sign In
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-black/10 border border-black/20 text-black text-sm font-semibold tracking-wide uppercase">
                    Trusted by 10,000+ Drivers
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-black drop-shadow-sm">
                    Professional Driver<br />Membership System
                </h1>
                <p className="text-xl md:text-2xl text-gray-800 max-w-3xl mb-12 leading-relaxed">
                    The ultimate platform for driver registration, ID card management, and district administration. Secure, fast, and compliant.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                    <Link to="/register" className="group relative px-8 py-4 bg-black hover:bg-gray-900 rounded-xl font-bold text-lg shadow-lg shadow-black/30 transition-all hover:scale-105 flex items-center justify-center gap-3 text-white">
                        <FaUserPlus />
                        Register Now
                        <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                    </Link>
                    <Link to="/admin" className="group px-8 py-4 bg-black hover:bg-gray-900 rounded-xl font-bold text-lg border border-gray-800 hover:border-gray-700 transition-all hover:scale-105 flex items-center justify-center gap-3 text-white">
                        <FaUserShield className="text-brand" />
                        Admin Access
                    </Link>
                </div>
            </main>

            {/* Features Grid */}
            <section className="relative z-10 container mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="p-8 rounded-3xl bg-black backdrop-blur-xl border border-gray-800 hover:border-brand/50 transition-all group shadow-xl">
                        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 text-brand text-2xl group-hover:scale-110 transition-transform">
                            <FaIdCard />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Digital ID Cards</h3>
                        <p className="text-gray-400 leading-relaxed">Instantly generate and manage verifiable digital ID cards for all verified members.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-3xl bg-black backdrop-blur-xl border border-gray-800 hover:border-brand/50 transition-all group shadow-xl">
                        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 text-brand text-2xl group-hover:scale-110 transition-transform">
                            <FaUserShield />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">District Admin</h3>
                        <p className="text-gray-400 leading-relaxed">Hierarchical management system allowing district-level control and monitoring.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-3xl bg-black backdrop-blur-xl border border-gray-800 hover:border-brand/50 transition-all group shadow-xl">
                        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 text-brand text-2xl group-hover:scale-110 transition-transform">
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
