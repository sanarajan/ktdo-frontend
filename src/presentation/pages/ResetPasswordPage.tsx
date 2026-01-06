import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { logout } from '../../store/authSlice';
import { toast } from 'react-toastify';
import { SUCCESS_MESSAGES } from '../../common/successMessages';
import { ERROR_MESSAGES } from '../../common/errorMessages';

const ResetPasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error(ERROR_MESSAGES.ALL_FIELDS_REQUIRED);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH);
            return;
        }

        if (newPassword.length < 6) {
            toast.error(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
            return;
        }

        try {
            setLoading(true);
            await AuthRepository.resetPassword(currentPassword, newPassword);
            toast.success(SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
            
            // Logout user
            dispatch(logout());
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            
            // Redirect to login
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (error: any) {
            console.error('Reset password error:', error);
            toast.error(error.response?.data?.message || ERROR_MESSAGES.PASSWORD_RESET_FAILED);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Reset Password</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-700 dark:text-white"
                            placeholder="Enter current password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-700 dark:text-white"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-700 dark:text-white"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-brand text-black font-bold rounded-lg hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
