import { useState } from 'react';
import { DistrictAdminManagement } from '../components/admin/DistrictAdminManagement';
import { MemberManagement } from '../components/admin/MemberManagement';
import { FaUsers, FaUserShield, FaChartPie, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

const MainAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'district-admins' | 'members'>('overview');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
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
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaChartPie className="text-2xl text-indigo-600 dark:text-indigo-400" />
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
                ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
        >
            <Icon className="text-lg" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <img src="/logo.png" alt="KTDO Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                            KTDO <span className="text-xs ml-1 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 block w-fit mt-1">Admin</span>
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 py-6 space-y-1">
                    <NavItem id="overview" label="Overview" icon={FaChartPie} />
                    <NavItem id="district-admins" label="District Admins" icon={FaUserShield} />
                    <NavItem id="members" label="Members" icon={FaUsers} />
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
