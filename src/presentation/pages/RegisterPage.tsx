import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { LocationRepository } from '../../data/repositories/LocationRepository';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from 'react-toastify';
import { ApprovalStatus, UserRole } from '../../common/enums';
import { ImageValidator } from '../../utils/ImageValidator';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bloodGroup: '',
        state: '',
        district: '',
        houseName: '',
        place: '',
        pin: '',
        stateCode: '',
        rtoCode: '',
        stateRtoCode: ''
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [photoError, setPhotoError] = useState<string>('');
    const [photoInfo, setPhotoInfo] = useState<string>('');
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [stateCodes, setStateCodes] = useState<{ state: string; code: string }[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const data = await LocationRepository.getStates();
                setStates(data);
                try {
                    const codes = await LocationRepository.getStateCodes();
                    setStateCodes(codes);
                } catch (err) {
                    console.error('Failed to fetch state codes', err);
                }
            } catch (error) {
                console.error('Failed to fetch states', error);
            }
        };
        fetchStates();
    }, []);

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        // Auto-select state code if available
        let selectedStateCode = '';
        if (state) {
            const mapping = stateCodes.find(s => s.state === state);
            if (mapping) {
                selectedStateCode = mapping.code;
            }
        }
        setFormData(prev => ({ ...prev, state, district: '', stateCode: selectedStateCode, rtoCode: '', stateRtoCode: '' }));
        
        if (errors.state) setErrors(prev => ({ ...prev, state: '' }));

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

    const handleRtoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rtoCode = e.target.value.replace(/\D/g, '').slice(0, 2); // Only allow numeric input
        const newStateRtoCode = formData.stateCode && rtoCode ? `${formData.stateCode}-${rtoCode}` : '';
        setFormData(prev => ({ ...prev, rtoCode, stateRtoCode: newStateRtoCode }));
        if (errors.rtoCode) setErrors(prev => ({ ...prev, rtoCode: '' }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Allow only digits and max 10 characters
            const phoneValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: phoneValue });
        } else if (name === 'pin') {
            // Pin code: digits only, max 6
            const pinValue = value.replace(/\D/g, '').slice(0, 6);
            setFormData({ ...formData, [name]: pinValue });
        } else if (name === 'name') {
            // Name: letters, spaces, select punctuation, max 50
            const cleanedName = value.replace(/[^a-zA-Z\s'.-]/g, '').slice(0, 50);
            setFormData({ ...formData, [name]: cleanedName });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateField = (name: string, value: string) => {
        const trimmed = value.trim();
        const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,49}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        const pinRegex = /^\d{6}$/;
        const rtoRegex = /^\d{1,2}$/;

        let message = '';
        switch (name) {
            case 'name':
                if (!trimmed) message = 'Name is required';
                else if (!nameRegex.test(trimmed)) message = 'Name must contain only letters and spaces (2-50 chars)';
                break;
            case 'email':
                if (!trimmed) message = 'Email is required';
                else if (!emailRegex.test(trimmed)) message = 'Invalid email format';
                break;
            case 'phone':
                if (!trimmed) message = 'Phone number is required';
                else if (!phoneRegex.test(trimmed)) message = 'Phone number must be exactly 10 digits';
                break;
            case 'bloodGroup':
                if (!trimmed) message = 'Blood group is required';
                break;
            case 'state':
                if (!trimmed) message = 'State is required';
                break;
            case 'district':
                if (!trimmed) message = 'District is required';
                break;
            case 'houseName':
                if (!trimmed) message = 'House name is required';
                break;
            case 'place':
                if (!trimmed) message = 'Place is required';
                break;
            case 'pin':
                if (!trimmed) message = 'Pin code is required';
                else if (!pinRegex.test(trimmed)) message = 'Pin code must be exactly 6 digits';
                break;
            case 'rtoCode':
                if (!trimmed) message = 'RTO code is required';
                else if (!rtoRegex.test(trimmed)) message = 'RTO code must be numeric (1-2 digits)';
                break;
            default:
                break;
        }

        if (message) {
            setErrors(prev => ({ ...prev, [name]: message }));
        } else if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPhotoError('');
        setPhotoInfo('');
        setPhotoPreview('');

        if (!file) {
            setPhoto(null);
            return;
        }

        try {
            // Validate image
            const validation = await ImageValidator.validateImage(file);
            if (!validation.valid) {
                setPhotoError(validation.error || 'Image validation failed');
                setPhoto(null);
                e.target.value = ''; // Reset input
                return;
            }

            // Show success info
            const sizeKB = ImageValidator.getFileSizeKB(file);
            setPhotoInfo(`✓ Image valid (${sizeKB} KB)`);
            setPhoto(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } catch (error: any) {
            setPhotoError(error.message || 'Failed to validate image');
            setPhoto(null);
            e.target.value = ''; // Reset input
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate photo is selected
        if (!photo) {
            toast.error('Please upload a valid passport size photo');
            return;
        }

        // Validation Logic
        const newErrors: { [key: string]: string } = {};

        const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,49}$/; // letters and spaces, min 2 chars
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (!nameRegex.test(formData.name.trim())) {
            newErrors.name = 'Name must contain only letters and spaces (2-50 chars)';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        const phoneRegex = /^\d{10}$/;
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
        }

        const pinRegex = /^\d{6}$/;

        if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.district) newErrors.district = 'District is required';
        if (!formData.houseName.trim()) newErrors.houseName = 'House name is required';
        if (!formData.place.trim()) newErrors.place = 'Place is required';
        if (!formData.pin.trim()) {
            newErrors.pin = 'Pin code is required';
        } else if (!pinRegex.test(formData.pin)) {
            newErrors.pin = 'Pin code must be exactly 6 digits';
        }
        if (!formData.rtoCode.trim()) {
            newErrors.rtoCode = 'RTO code is required';
        } else if (!/^\d{1,2}$/.test(formData.rtoCode)) {
            newErrors.rtoCode = 'RTO code must be numeric (1-2 digits)';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    data.append(key, String(value));
                }
            });
            data.append('role', UserRole.MEMBER);
            data.append('status', ApprovalStatus.PENDING);
            data.append('photo', photo);

            await AuthRepository.registerDriver(data);
            toast.success('Registration successful! Please wait for approval.');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            
            // Check if it's a phone or email already exists error
            if (errorMessage.toLowerCase().includes('phone')) {
                setErrors(prev => ({ ...prev, phone: errorMessage }));
                toast.error(errorMessage);
            } else if (errorMessage.toLowerCase().includes('email')) {
                setErrors(prev => ({ ...prev, email: errorMessage }));
                toast.error(errorMessage);
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

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

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-black dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
                    {/* Header */}
                    <div className="bg-brand px-8 py-6">
                        <div className="flex flex-col items-center">
                            <h2 className="text-3xl font-bold text-black">Driver Registration</h2>
                            <p className="text-gray-800 mt-2">Join our professional driver community</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Passport Size Photo <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-400 mb-2">
                                Formats: JPG, JPEG, PNG | Size: 30 KB - 300 KB | Portrait orientation required
                            </p>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                        onChange={handlePhotoChange}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-black hover:file:bg-brand-400"
                                    />
                                    {photoError && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <span>✗</span> {photoError}
                                        </p>
                                    )}
                                    {photoInfo && (
                                        <p className="text-green-500 text-sm mt-2">
                                            {photoInfo}
                                        </p>
                                    )}
                                </div>
                                {photoPreview && (
                                    <div className="w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden border-2 border-brand shadow-lg">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name and Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={(e) => validateField('name', e.target.value)}
                                maxLength={50}
                                required
                                error={errors.name}
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={(e) => validateField('email', e.target.value)}
                                required
                                error={errors.email}
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-300">Phone Number</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value="+91"
                                    className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 w-20"
                                />
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    onBlur={(e) => validateField('phone', e.target.value)}
                                    required
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white text-gray-900 placeholder-gray-400 ${
                                        errors.phone 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                />
                            </div>
                            {errors.phone && <span className="text-xs text-red-500 ml-1">{errors.phone}</span>}
                        </div>

                        {/* Blood Group */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-300">Blood Group</label>
                            <select
                                name="bloodGroup"
                                className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white text-gray-900 ${
                                    errors.bloodGroup 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300'
                                }`}
                                value={formData.bloodGroup}
                                onChange={(e) => {
                                    setFormData({ ...formData, bloodGroup: e.target.value });
                                    if (errors.bloodGroup) setErrors(prev => ({ ...prev, bloodGroup: '' }));
                                }}
                                onBlur={(e) => validateField('bloodGroup', e.target.value)}
                                required
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                            {errors.bloodGroup && <span className="text-xs text-red-500 ml-1">{errors.bloodGroup}</span>}
                        </div>

                        {/* State and District */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-300">State</label>
                                <select
                                    name="state"
                                    className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white text-gray-900 ${
                                        errors.state 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    value={formData.state}
                                    onChange={handleStateChange}
                                    onBlur={(e) => validateField('state', e.target.value)}
                                    required
                                >
                                    <option value="">Select State</option>
                                    {states.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                {errors.state && <span className="text-xs text-red-500 ml-1">{errors.state}</span>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-300">District</label>
                                <select
                                    name="district"
                                    className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white text-gray-900 ${
                                        errors.district 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    value={formData.district}
                                    onChange={(e) => {
                                        setFormData({ ...formData, district: e.target.value });
                                        if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
                                    }}
                                    onBlur={(e) => validateField('district', e.target.value)}
                                    required
                                    disabled={!formData.state}
                                >
                                    <option value="">Select District</option>
                                    {districts.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                                {errors.district && <span className="text-xs text-red-500 ml-1">{errors.district}</span>}
                            </div>
                        </div>

                        {/* RTO Code Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-300">State Code</label>
                                <input
                                    type="text"
                                    className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 cursor-not-allowed"
                                    value={formData.stateCode}
                                    readOnly
                                    placeholder="Auto-selected"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-300">
                                    RTO Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.rtoCode}
                                    onChange={handleRtoCodeChange}
                                    onBlur={(e) => validateField('rtoCode', e.target.value)}
                                    placeholder="01, 02, etc."
                                    required
                                    maxLength={2}
                                    inputMode="numeric"
                                    className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white text-gray-900 placeholder-gray-400 ${
                                        errors.rtoCode 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                />
                                {errors.rtoCode && <span className="text-xs text-red-500 ml-1">{errors.rtoCode}</span>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-300">State RTO Code</label>
                                <input
                                    type="text"
                                    value={formData.stateRtoCode}
                                    readOnly
                                    placeholder="KL-01"
                                    className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Address Fields */}
                        <Input
                            label="House Name / No"
                            name="houseName"
                            value={formData.houseName}
                            onChange={handleChange}
                            onBlur={(e) => validateField('houseName', e.target.value)}
                            required
                            error={errors.houseName}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Place"
                                name="place"
                                value={formData.place}
                                onChange={handleChange}
                                onBlur={(e) => validateField('place', e.target.value)}
                                required
                                error={errors.place}
                            />
                            <Input
                                label="Pin Code"
                                name="pin"
                                value={formData.pin}
                                onChange={handleChange}
                                onBlur={(e) => validateField('pin', e.target.value)}
                                inputMode="numeric"
                                maxLength={6}
                                required
                                error={errors.pin}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button type="submit" isLoading={isLoading} className="w-full bg-brand text-black hover:bg-brand-400">
                                Register Now
                            </Button>
                        </div>

                        {/* Login Link */}
                        {/* <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-brand dark:text-brand-400 hover:text-brand-500 font-medium">
                                Sign In
                            </Link>
                        </p> */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
