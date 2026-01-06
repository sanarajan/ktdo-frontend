import React, { useState, useEffect } from 'react';
import { LocationRepository } from '../../data/repositories/LocationRepository';
import { Button } from './Button';
import { Input } from './Input';
import { toast } from 'react-toastify';
import axios from '../../config/axios';
import { UserRole } from '../../common/enums';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { ImageValidator } from '../../utils/ImageValidator';
import { SUCCESS_MESSAGES } from '../../common/successMessages';
import { ERROR_MESSAGES } from '../../common/errorMessages';

interface AddMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ isOpen, onClose, onSuccess }) => {
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
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isOpen) {
            if (user?.role === UserRole.DISTRICT_ADMIN) {
                // Pre-fill and lock for District Admin
                const userState = (user as any).state || '';
                setFormData(prev => ({
                    ...prev,
                    state: userState,
                    district: (user as any).district || ''
                }));

                // Fetch districts for this state so the dropdown shows the value correctly
                if (userState) {
                    const fetchDistricts = async () => {
                        try {
                            const data = await LocationRepository.getDistricts(userState);
                            setDistricts(data);
                        } catch (error) {
                            console.error('Failed to fetch districts', error);
                        }
                    };
                    fetchDistricts();
                }
            }

            const fetchStates = async () => {
                try {
                    const data = await LocationRepository.getStates();
                    setStates(data);
                    try {
                        const codes = await LocationRepository.getStateCodes();
                        setStateCodes(codes);
                        
                        // Auto-select state code for district admin after codes are loaded
                        if (user?.role === UserRole.DISTRICT_ADMIN) {
                            const userState = (user as any).state || '';
                            if (userState) {
                                const mapping = codes.find(s => s.state === userState);
                                if (mapping) {
                                    setFormData(prev => ({
                                        ...prev,
                                        stateCode: mapping.code
                                    }));
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Failed to fetch state codes', err);
                    }
                } catch (error) {
                    console.error('Failed to fetch states', error);
                }
            };
            fetchStates();
        }
    }, [isOpen, user]);

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        setFormData(prev => ({ ...prev, state, district: '', stateCode: '', rtoCode: '', stateRtoCode: '' }));
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

    const handleStateCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateCode = e.target.value;
        const newStateRtoCode = stateCode && formData.rtoCode ? `${stateCode}-${formData.rtoCode}` : '';
        setFormData(prev => ({ ...prev, stateCode, stateRtoCode: newStateRtoCode }));
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
            const phoneValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: phoneValue });
        } else if (name === 'pin') {
            const pinValue = value.replace(/\D/g, '').slice(0, 6);
            setFormData({ ...formData, [name]: pinValue });
        } else if (name === 'name') {
            const cleanedName = value.replace(/[^a-zA-Z\s'.-]/g, '').slice(0, 50);
            setFormData({ ...formData, [name]: cleanedName });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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

        if (message) setErrors(prev => ({ ...prev, [name]: message }));
        else if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};
        const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,49}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        const pinRegex = /^\d{6}$/;
        const rtoRegex = /^\d{1,2}$/;

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        else if (!nameRegex.test(formData.name.trim())) newErrors.name = 'Name must contain only letters and spaces (2-50 chars)';

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email.trim())) newErrors.email = 'Invalid email format';

        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!phoneRegex.test(formData.phone.trim())) newErrors.phone = 'Phone number must be exactly 10 digits';

        if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.district.trim()) newErrors.district = 'District is required';
        if (!formData.houseName.trim()) newErrors.houseName = 'House name is required';
        if (!formData.place.trim()) newErrors.place = 'Place is required';
        if (!formData.pin.trim()) newErrors.pin = 'Pin code is required';
        else if (!pinRegex.test(formData.pin.trim())) newErrors.pin = 'Pin code must be exactly 6 digits';
        if (!formData.rtoCode.trim()) newErrors.rtoCode = 'RTO code is required';
        else if (!rtoRegex.test(formData.rtoCode.trim())) newErrors.rtoCode = 'RTO code must be numeric (1-2 digits)';

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            toast.error(ERROR_MESSAGES.FORM_ERRORS);
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    data.append(key, String(value));
                }
            });
            if (photo) {
                data.append('photo', photo);
            }

            await axios.post('/admin/member', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success(SUCCESS_MESSAGES.MEMBER_ADDED);
            
            // Clear form after successful submission
            setFormData({
                name: '',
                email: '',
                phone: '',
                bloodGroup: '',
                state: user?.role === UserRole.DISTRICT_ADMIN ? (user as any).state : '',
                district: user?.role === UserRole.DISTRICT_ADMIN ? (user as any).district : '',
                houseName: '',
                place: '',
                pin: '',
                stateCode: user?.role === UserRole.DISTRICT_ADMIN ? (stateCodes.find(s => s.state === (user as any).state)?.code || '') : '',
                rtoCode: '',
                stateRtoCode: ''
            });
            setPhoto(null);
            setPhotoPreview('');
            setPhotoError('');
            setPhotoInfo('');
            setErrors({});
            
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || ERROR_MESSAGES.MEMBER_ADD_FAILED;
            
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
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Member</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Photo
                        </label>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            Formats: JPG, JPEG, PNG | Size: 30 KB - 300 KB | Portrait orientation required
                        </p>
                        <div className="flex gap-3 items-start">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                    onChange={handlePhotoChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 dark:file:bg-gray-700 dark:file:text-gray-300"
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
                                <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden border-2 border-brand shadow-md">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Name"
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
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value="+91"
                                className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white w-20"
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
                                className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 dark:text-white ${
                                    errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                            />
                        </div>
                        {errors.phone && <span className="text-xs text-red-500 ml-1">{errors.phone}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group</label>
                        <select
                            className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                errors.bloodGroup ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                            <select
                                className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                    errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                value={formData.state}
                                onChange={handleStateChange}
                                onBlur={(e) => validateField('state', e.target.value)}
                                required
                                disabled
                            >
                                <option value="">Select State</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            {errors.state && <span className="text-xs text-red-500 ml-1">{errors.state}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">District</label>
                            <select
                                className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                    errors.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                onBlur={(e) => validateField('district', e.target.value)}
                                required
                                disabled
                            >
                                <option value="">Select District</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                            {errors.district && <span className="text-xs text-red-500 ml-1">{errors.district}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State Code</label>
                                <select
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-brand bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                                    value={formData.stateCode}
                                    onChange={handleStateCodeChange}
                                    disabled
                                >
                                    <option value="">Select State Code</option>
                                    {stateCodes.map(sc => (
                                        <option key={sc.state} value={sc.code}>{sc.code}</option>
                                    ))}
                                </select>
                            </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">RTO Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.rtoCode}
                                onChange={handleRtoCodeChange}
                                onBlur={(e) => validateField('rtoCode', e.target.value)}
                                placeholder="01, 02, etc."
                                required
                                maxLength={2}
                                inputMode="numeric"
                                className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 dark:text-white ${
                                    errors.rtoCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                            />
                            {errors.rtoCode && <span className="text-xs text-red-500 ml-1">{errors.rtoCode}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State RTO Code</label>
                            <input
                                type="text"
                                value={formData.stateRtoCode}
                                readOnly
                                placeholder="KL-01, TN-01, etc."
                                className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <Input
                        label="House Name / No"
                        name="houseName"
                        value={formData.houseName}
                        onChange={handleChange}
                        onBlur={(e) => validateField('houseName', e.target.value)}
                        required
                        error={errors.houseName}
                    />
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

                    <div className="flex justify-end space-x-2 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Add Member
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
