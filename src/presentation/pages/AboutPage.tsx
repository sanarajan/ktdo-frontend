import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Navigation */}
            <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center">
                            <h1 className="text-2xl font-bold text-white">
                                Driver<span className="text-indigo-500">Connect</span>
                            </h1>
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
                            <Link to="/about" className="text-white font-medium">About</Link>
                            <Link to="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
                            <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 transition font-medium">Admin</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold text-white mb-8">About DriverConnect</h1>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 mb-8">
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

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">What We Offer</h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-500 mt-1">✓</span>
                            <span>Official driver ID cards with unique identification numbers</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-500 mt-1">✓</span>
                            <span>Instant verification and approval for registered drivers</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-500 mt-1">✓</span>
                            <span>District-wise organization and management</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-500 mt-1">✓</span>
                            <span>Professional profile management</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-indigo-500 mt-1">✓</span>
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
