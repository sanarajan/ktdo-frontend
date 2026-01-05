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
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <div className="max-w-[450px] w-full bg-white rounded-[2rem] shadow-2xl relative overflow-hidden">
                
                {/* Decorative Yellow Line */}
                <div className="absolute top-[4.5rem] left-0 w-full h-4 bg-brand"></div>

                <div className="relative z-10 px-10 pt-8 pb-12">
                    {/* Logo Section */}
                    <div className="flex justify-center mb-6">
                        <div className="w-28 h-28 bg-white rounded-full p-2 shadow-lg flex items-center justify-center relative z-10">
                            <img src="/logo.png" alt="KTDO Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    {/* Header Text */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Please enter your details to sign in</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com"
                            className="bg-white border-gray-200 focus:border-brand focus:ring-brand"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your •••"
                            className="bg-white border-gray-200 focus:border-brand focus:ring-brand"
                        />
                        <Button 
                            type="submit" 
                            isLoading={isLoading} 
                            className="mt-4 w-full bg-brand text-black font-bold hover:bg-brand-400 shadow-md py-3 rounded-xl"
                        >
                            Sign In
                        </Button>
                    </form>
                    
                  
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
