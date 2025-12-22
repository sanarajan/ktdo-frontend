import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { setCredentials } from '../../store/authSlice';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await AuthRepository.login(email, password);
            dispatch(setCredentials({ user: data.user, token: data.tokens.accessToken }));
            toast.success('Login Successful');
            navigate('/dashboard'); // Should redirect based on role
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="KTDO Logo" className="w-24 h-24 object-contain mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Welcome Back
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                    />
                    <Button type="submit" isLoading={isLoading} className="mt-2">
                        Sign In
                    </Button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Register as Driver
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
