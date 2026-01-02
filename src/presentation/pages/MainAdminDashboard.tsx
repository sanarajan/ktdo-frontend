import { useState } from 'react';
import { DistrictAdminManagement } from '../components/admin/DistrictAdminManagement';
import { MemberManagement } from '../components/admin/MemberManagement';
import { FaUsers, FaUserShield, FaChartPie, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { useNavigate } from 'react-router-dom';

const MainAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'district-admins' | 'members'>('overview');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await AuthRepository.logout();
        } catch (err) {
            console.warn('Logout API failed, proceeding to clear client state', err);
        }
        dispatch(logout());
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'district-admins':
                return <DistrictAdminManagement />;
            case 'members':
                return <MemberManagement />;
            case 'overview':
            default:
                return (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="bg-brand/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaChartPie className="text-2xl text-brand-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">System Overview</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Welcome to the main administration panel. Use the sidebar to manage district admins and member records.
                        </p>
                    </div>
                );
        }
    };

    const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-r-4 ${activeTab === id
                ? 'bg-brand/10 border-brand text-brand'
                : 'border-transparent text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
        >
            <Icon className="text-lg" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black border-r border-gray-800 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <img src="/logo.png" alt="KTDO Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight">
                            KTDO <span className="text-xs ml-1 bg-brand text-black px-1.5 py-0.5 rounded block w-fit mt-1">Admin</span>
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 py-6 space-y-1">
                    <NavItem id="overview" label="Overview" icon={FaChartPie} />
                    <NavItem id="district-admins" label="District Admins" icon={FaUserShield} />
                    <NavItem id="members" label="Members" icon={FaUsers} />
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-900 hover:text-white transition-colors"
                    >
                        <FaSignOutAlt />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                        {activeTab.replace('-', ' ')}
                    </h2>
                    <div className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                {renderContent()}
            </main>
        </div>
    );
};

export default MainAdminDashboard;
