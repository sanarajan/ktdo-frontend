import { Link } from 'react-router-dom';
import { FaUserPlus, FaSignInAlt, FaIdCard, FaShieldAlt, FaUsers } from 'react-icons/fa';


const HomePage = () => {
    return (
        <div className="min-h-screen bg-brand">
            {/* Navigation */}
            <nav className="bg-black border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="KTDO Logo" className="w-8 h-8 object-contain" />
                            <h1 className="text-xl font-bold text-white">KTDO</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
                            <Link to="/about" className="text-gray-300 hover:text-white transition">About</Link>
                            <Link to="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
                            <Link to="/register" className="text-brand hover:text-brand-400 transition font-medium">Register</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <img src="/logo.png" alt="KTDO Logo" className="w-32 h-32 object-contain mx-auto mb-8 shadow-2xl rounded-full bg-black/10 p-2" />
                    <h2 className="text-5xl font-extrabold text-black mb-6">
                        Professional Driver Membership Platform
                    </h2>
                    <p className="text-xl text-gray-900 mb-12 max-w-3xl mx-auto font-medium">
                        Join our community of professional drivers. Get your official ID card,
                        access exclusive benefits, and connect with fellow drivers.
                    </p>

                    {/* Hidden Login/Signup Buttons - Ready for Future Activation */}
                    <div className="hidden gap-4 justify-center mb-16" id="driver-auth-buttons">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition shadow-lg"
                        >
                            <FaUserPlus /> Sign Up Now
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black border-2 border-black font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
                        >
                            <FaSignInAlt /> Member Login
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    <div className="bg-black p-8 rounded-xl border border-gray-800 hover:border-brand transition shadow-xl">
                        <div className="bg-brand w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <FaIdCard className="text-2xl text-black" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Official ID Card</h3>
                        <p className="text-gray-400">
                            Get your professional driver ID card with unique identification number.
                        </p>
                    </div>

                    <div className="bg-black p-8 rounded-xl border border-gray-800 hover:border-brand transition shadow-xl">
                        <div className="bg-brand w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <FaShieldAlt className="text-2xl text-black" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Verified Status</h3>
                        <p className="text-gray-400">
                            Instant verification and approval for registered professional drivers.
                        </p>
                    </div>

                    <div className="bg-black p-8 rounded-xl border border-gray-800 hover:border-brand transition shadow-xl">
                        <div className="bg-brand w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <FaUsers className="text-2xl text-black" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Community Network</h3>
                        <p className="text-gray-400">
                            Join a network of professional drivers across multiple districts.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black border-t border-gray-800 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Kerala Taxi Driver's Organization (KTDO). All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
