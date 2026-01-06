import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { SUCCESS_MESSAGES } from '../../common/successMessages';
// import { SuccessMessage } from '@driver-app/shared'; // Removed as per revert request

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement contact form submission
        toast.success(SUCCESS_MESSAGES.MESSAGE_SENT);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Navigation */}
            <nav className="bg-black border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="KTDO Logo" className="w-8 h-8 object-contain" />
                            <h1 className="text-xl font-bold text-white">KTDO</h1>
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
                            <Link to="/about" className="text-gray-300 hover:text-white transition">About</Link>
                            <Link to="/contact" className="text-white font-medium">Contact</Link>
                            <Link to="/register" className="text-brand hover:text-brand-400 transition font-medium">Register</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">Contact Us</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FaMapMarkerAlt className="text-black text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">Address</h3>
                                        <p className="text-gray-400">123 Driver Street, City, State 12345</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-brand w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FaPhone className="text-black text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">Phone</h3>
                                        <p className="text-gray-400">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-brand w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FaEnvelope className="text-black text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">Email</h3>
                                        <p className="text-gray-400">support@ktdo.org</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                            <h3 className="text-xl font-bold text-white mb-3">Office Hours</h3>
                            <div className="text-gray-400 space-y-2">
                                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                <p>Saturday: 10:00 AM - 4:00 PM</p>
                                <p>Sunday: Closed</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 mb-2 font-medium">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 font-medium">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 font-medium">Subject</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 font-medium">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-brand resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-brand text-black py-3 rounded-lg font-semibold hover:bg-brand-600 transition flex items-center justify-center gap-2"
                            >
                                <FaPaperPlane /> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Kerala Taxi Driver's Organization (KTDO). All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
