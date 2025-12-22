import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { LocationRepository } from '../../data/repositories/LocationRepository';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from 'react-toastify';
import { ApprovalStatus, UserRole } from '../../common/enums';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        licenseNumber: '',
        vehicleNumber: '',
        phone: '',
        address: '',
        post: '',
        pin: '',
        bloodGroup: '',
        emergencyContact: '',
        state: '',
        district: ''
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchStates = async () => {
            try {
                const data = await LocationRepository.getStates();
                setStates(data);
            } catch (error) {
                console.error('Failed to fetch states', error);
            }
        };
        fetchStates();
    }, []);

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        setFormData({ ...formData, state, district: '' });
        if (state) {
            try {
                const data = await LocationRepository.getDistricts(state);
                setDistricts(data);
            } catch (error) {
                console.error('Failed to fetch districts', error);
            }
        } else {
            setDistricts([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            data.append('role', UserRole.MEMBER);
            data.append('status', ApprovalStatus.PENDING);
            if (photo) {
                data.append('photo', photo);
            }

            await AuthRepository.registerDriver(data);
            toast.success('Registration setup successful! Please wait for approval.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="KTDO Logo" className="w-20 h-20 object-contain mb-4" />
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Driver Registration
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                        <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
                        <Input label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required />
                        <Input label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} required />

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                            <select
                                name="state"
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={formData.state}
                                onChange={handleStateChange}
                                required
                            >
                                <option value="">Select State</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">District</label>
                            <select
                                name="district"
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                required
                                disabled={!formData.state}
                            >
                                <option value="">Select District</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        <Input label="Address" name="address" value={formData.address} onChange={handleChange} className="md:col-span-2" />
                        <Input label="Post" name="post" value={formData.post} onChange={handleChange} />
                        <Input label="Pin Code" name="pin" value={formData.pin} onChange={handleChange} />
                        <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                        <Input label="Emergency Contact No" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passport Size Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                            />
                        </div>
                    </div>

                    <Button type="submit" isLoading={isLoading} className="mt-4">
                        Register
                    </Button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
