import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { pdf } from '@react-pdf/renderer';
import IdCardDocument from '../components/admin/IdCardDocument';
import { toast } from 'react-toastify';
import { FaIdCard, FaUser, FaSignOutAlt, FaDownload } from 'react-icons/fa';

const MemberDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const handleDownloadIdCard = async () => {
        if (!user) return;

        setIsGeneratingPDF(true);
        try {
            const blob = await pdf(<IdCardDocument driver={user as any} />).toBlob();
            if (blob) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                toast.success('ID Card generated successfully!');
            } else {
                toast.error('Failed to generate PDF Blob');
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate ID Card');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="KTDO Logo" className="w-8 h-8 object-contain" />
                            <h1 className="text-xl font-bold text-white">KTDO</h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}!</h2>
                    <p className="text-gray-400">Manage your driver profile and download your ID card</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Profile Card */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center">
                                <FaUser className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Profile Information</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm">Full Name</label>
                                <p className="text-white font-medium">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Email</label>
                                <p className="text-white font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Phone</label>
                                <p className="text-white font-medium">{(user as any).phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">License Number</label>
                                <p className="text-white font-medium">{(user as any).licenseNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Vehicle Number</label>
                                <p className="text-white font-medium">{(user as any).vehicleNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Address</label>
                                <p className="text-white font-medium">{(user as any).address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* ID Card Section */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center">
                                <FaIdCard className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Driver ID Card</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm">Unique ID</label>
                                <p className="text-white font-bold text-lg">{(user as any).uniqueId || 'Pending'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Status</label>
                                <span className="inline-block px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm font-semibold">
                                    {(user as any).status || 'APPROVED'}
                                </span>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleDownloadIdCard}
                                    disabled={isGeneratingPDF}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaDownload />
                                    {isGeneratingPDF ? 'Generating...' : 'View/Print ID Card'}
                                </button>
                            </div>

                            <p className="text-gray-400 text-sm text-center">
                                Download your official driver ID card in PDF format
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
