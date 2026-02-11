import React, { useState, useEffect, useRef } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { FaCrop, FaCheck } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { LocationRepository } from '../../data/repositories/LocationRepository';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from 'react-toastify';
import { ApprovalStatus, UserRole } from '../../common/enums';
import { ImageValidator } from '../../utils/ImageValidator';
import { SUCCESS_MESSAGES } from '../../common/successMessages';
import { ERROR_MESSAGES } from '../../common/errorMessages';
import { FaUser, FaMapMarkerAlt, FaCamera, FaIdCardAlt, FaArrowLeft, FaTimes } from 'react-icons/fa';

interface RegisterFormData {
    name: string;
    email: string;
    phone: string;
    bloodGroup: string;
    licenceNumber: string;
    workingState: string;
    workingDistrict: string;
    houseName: string;
    place: string;
    pin: string;
    state: string;
    district: string;
    stateCode: string;
    rtoCode: string;
    stateRtoCode: string;
}

interface StateCodeMapping {
    state: string;
    code: string;
}

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        name: '', email: '', phone: '', bloodGroup: '', licenceNumber: '', workingState: '',
        workingDistrict: '', houseName: '', place: '', pin: '',
        state: '', district: '',
        stateCode: '', rtoCode: '', stateRtoCode: ''
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [photoError, setPhotoError] = useState<string>('');

    // Cropper state
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState('');
    const imageRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper | null>(null);

    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [permanentDistricts, setPermanentDistricts] = useState<string[]>([]);
    const [stateCodes, setStateCodes] = useState<StateCodeMapping[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const data = await LocationRepository.getStates();
                setStates(data);

                const codes = await LocationRepository.getStateCodes();
                setStateCodes(codes);
            } catch (err) { console.error(err); }
        };
        fetchStates();
    }, []);

    // Standardized logic for "This field is required" message
    const getFieldError = (name: keyof RegisterFormData, value: string): string => {
        const trimmed = value.trim();
        if (!trimmed) return 'this field is required';

        // Secondary validations
        if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'invalid email format';
        if (name === 'phone' && !/^\d{10}$/.test(trimmed)) return 'must be 10 digits';
        if (name === 'pin' && !/^\d{6}$/.test(trimmed)) return 'invalid pin code';
        if (name === 'licenceNumber' && (trimmed.length < 5 || trimmed.length > 20)) return 'must be 5-20 characters';

        return '';
    };

    const validateField = (name: keyof RegisterFormData, value: string) => {
        setErrors(prev => ({ ...prev, [name]: getFieldError(name, value) }));
    };

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        let selectedStateCode = '';
        if (state) {
            const mapping = stateCodes.find(s => s.state === state);
            if (mapping) selectedStateCode = mapping.code;
        }
        setFormData(prev => ({ ...prev, workingState: state, workingDistrict: '', stateCode: selectedStateCode, rtoCode: '', stateRtoCode: '' }));
        validateField('workingState', state);

        if (state) {
            try {
                const data = await LocationRepository.getDistricts(state);
                setDistricts(data);
            } catch (error) { console.error(error); }
        } else { setDistricts([]); }
    };

    const handlePermanentStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        setFormData(prev => ({ ...prev, state: state, district: '' }));
        validateField('state', state);

        if (state) {
            try {
                const data = await LocationRepository.getDistricts(state);
                setPermanentDistricts(data);
            } catch (error) { console.error(error); }
        } else { setPermanentDistricts([]); }
    };

    const handleRtoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rtoCode = e.target.value.replace(/\D/g, '').slice(0, 2);
        const newStateRtoCode = formData.stateCode && rtoCode ? `${formData.stateCode}-${rtoCode}` : '';
        setFormData(prev => ({ ...prev, rtoCode, stateRtoCode: newStateRtoCode }));
        validateField('rtoCode', rtoCode);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let processedValue = value;
        if (name === 'phone') processedValue = value.replace(/\D/g, '').slice(0, 10);
        else if (name === 'pin') processedValue = value.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, [name]: processedValue }));
        if (errors[name as keyof RegisterFormData]) validateField(name as keyof RegisterFormData, processedValue);
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPhotoError('');
        setPhotoPreview('');

        if (!file) {
            setPhoto(null);
            return;
        }

        // BEFORE CROP: Validate type, extension, max size, corruption
        const validation = await ImageValidator.validateBeforeCrop(file);
        if (!validation.valid) {
            setPhotoError(validation.error || 'Invalid image');
            setPhoto(null);
            e.target.value = '';
            return;
        }

        // Load image for cropping
        const reader = new FileReader();
        reader.onload = (event) => {
            setTempImageSrc(event.target?.result as string);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (showCropper && imageRef.current && !cropperRef.current) {
            cropperRef.current = new Cropper(imageRef.current, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.8,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
            });
        }
        return () => {
            if (cropperRef.current) {
                cropperRef.current.destroy();
                cropperRef.current = null;
            }
        };
    }, [showCropper]);

    const handleCropComplete = async () => {
        if (cropperRef.current) {
            const cropper = cropperRef.current as any;
            const canvas = cropper.getCroppedCanvas({
                width: 413,
                height: 413,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            canvas.toBlob(async (blob: Blob | null) => {
                if (blob) {
                    const croppedFile = new File([blob], 'cropped-photo.jpg', { type: 'image/jpeg' });

                    // AFTER CROP: Validate min size, exact 413x531, etc.
                    const validation = await ImageValidator.validateAfterCrop(croppedFile);
                    if (!validation.valid) {
                        setPhotoError(validation.error || 'Cropped image validation failed');
                        setPhoto(null);
                        setShowCropper(false);
                        setTempImageSrc('');
                        return;
                    }

                    setPhoto(croppedFile);
                    const previewUrl = URL.createObjectURL(croppedFile);
                    setPhotoPreview(previewUrl);
                    setShowCropper(false);
                    setTempImageSrc('');
                    if (cropperRef.current) {
                        cropperRef.current.destroy();
                        cropperRef.current = null;
                    }
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setTempImageSrc('');
        if (cropperRef.current) {
            cropperRef.current.destroy();
            cropperRef.current = null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        let hasErrors = false;

        (Object.keys(formData) as Array<keyof RegisterFormData>).forEach(key => {
            if (key !== 'stateRtoCode' && key !== 'stateCode') {
                const error = getFieldError(key, formData[key]);
                if (error) { newErrors[key] = error; hasErrors = true; }
            }
        });

        setErrors(newErrors);

        if (hasErrors) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([k, v]) => data.append(k, v));
            data.append('role', UserRole.MEMBER);
            data.append('status', ApprovalStatus.PENDING);
            data.append('photo', photo!);
            await AuthRepository.registerDriver(data);
            toast.success(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
            setTimeout(() => navigate('/registration-success'), 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.message || ERROR_MESSAGES.REGISTRATION_FAILED);
        } finally { setIsLoading(false); }
    };

    // Reusable Error Text component for consistency
    const FieldError = ({ msg }: { msg?: string }) => (
        msg ? <p className="text-red-400 text-[10px] font-medium mt-1 ml-1">{msg}</p> : null
    );

    return (
        <div className="min-h-screen bg-[#080808] text-white selection:bg-brand">
            {/* Navigation - Ultra Modern Glass Style (Synced with Home) */}
            <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo Section */}
                        <div className="flex items-center gap-3">
                            <motion.img
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                src="/logo.png"
                                alt="KTDO Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-brand to-yellow-500 bg-clip-text text-transparent">
                                KTDO
                            </h1>
                        </div>

                        {/* Back to Home Link - Styled like the Home nav items */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-brand transition">
                                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-brand" />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-32 pb-20 px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Driver <span className="text-brand">Registration</span></h2>
                        <p className="text-gray-400 font-medium">Professional Driver Enrollment Form</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-6">
                                <FaCamera className="text-brand text-xl" />
                                <h3 className="text-xl font-bold">Profile Identity</h3>
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className={`w-40 h-52 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all 
                                    ${photoPreview ? 'border-brand' : 'border-gray-700'}`}>
                                    {photoPreview ? (
                                        <div className="relative w-full h-full">
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPhoto(null);
                                                    setPhotoPreview('');
                                                    setPhotoError('');
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md z-10"
                                                title="Clear Photo"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <FaUser className="text-4xl text-gray-700" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <label className="block text-sm font-bold text-gray-300">Square Passport Photo (413x413, 15KB-2MB)</label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handlePhotoChange}
                                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-6 file:rounded-full file:bg-brand file:text-black file:font-bold cursor-pointer"
                                        ref={(input) => {
                                            // Reset input value when photo is cleared
                                            if (input && !photo) input.value = '';
                                        }}
                                    />

                                    <FieldError msg={photoError} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-8">
                                <FaIdCardAlt className="text-brand text-xl" />
                                <h3 className="text-xl font-bold">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} onBlur={() => validateField('name', formData.name)} error={errors.name} />
                                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={() => validateField('email', formData.email)} error={errors.email} />

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400">Phone Number</label>
                                    <div className="flex gap-2">
                                        <span className="px-4 py-3 bg-white/10 rounded-xl border border-white/10 text-brand font-bold">+91</span>
                                        <input name="phone" value={formData.phone} onChange={handleChange} onBlur={() => validateField('phone', formData.phone)} maxLength={10} className={`flex-1 px-4 py-3 rounded-xl bg-white/5 border ${errors.phone ? 'border-red-500' : 'border-white/10'} focus:ring-2 focus:ring-brand outline-none`} />
                                    </div>
                                    <FieldError msg={errors.phone} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400">Blood Group</label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onBlur={() => validateField('bloodGroup', formData.bloodGroup)} onChange={(e) => { setFormData(p => ({ ...p, bloodGroup: e.target.value })); validateField('bloodGroup', e.target.value); }} className={`px-4 py-3 rounded-xl bg-white/5 border ${errors.bloodGroup ? 'border-red-500' : 'border-white/10'} focus:ring-2 focus:ring-brand outline-none text-white`}>
                                        <option value="" className="bg-black">Select Group</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g} className="bg-black">{g}</option>)}
                                    </select>
                                    <FieldError msg={errors.bloodGroup} />
                                </div>

                                <Input label="Licence Number" name="licenceNumber" value={formData.licenceNumber} onChange={handleChange} onBlur={() => validateField('licenceNumber', formData.licenceNumber)} error={errors.licenceNumber} maxLength={20} />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-8">
                                <FaMapMarkerAlt className="text-brand text-xl" />
                                <h3 className="text-xl font-bold">Location & RTO</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400">Working State</label>
                                    <select name="workingState" value={formData.workingState} onBlur={() => validateField('workingState', formData.workingState)} onChange={handleStateChange} className={`px-4 py-3 rounded-xl bg-white/5 border ${errors.workingState ? 'border-red-500' : 'border-white/10'} text-white outline-none focus:ring-2 focus:ring-brand`}>
                                        <option value="" className="bg-black">Select State</option>
                                        {states.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                                    </select>
                                    <FieldError msg={errors.workingState} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400">Working District</label>
                                    <select name="workingDistrict" value={formData.workingDistrict} disabled={!formData.workingState} onBlur={() => validateField('workingDistrict', formData.workingDistrict)} onChange={(e) => { setFormData(p => ({ ...p, workingDistrict: e.target.value })); validateField('workingDistrict', e.target.value); }} className={`px-4 py-3 rounded-xl bg-white/5 border ${errors.workingDistrict ? 'border-red-500' : 'border-white/10'} text-white outline-none focus:ring-2 focus:ring-brand disabled:opacity-30`}>
                                        <option value="" className="bg-black">Select District</option>
                                        {districts.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                                    </select>
                                    <FieldError msg={errors.workingDistrict} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-brand/5 rounded-2xl border border-brand/20">
                                <div><label className="text-[10px] font-black text-gray-500 block mb-1 uppercase">State Code</label><input readOnly value={formData.stateCode} className="bg-transparent border-none text-brand font-bold" /></div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 block mb-1 uppercase">RTO Code *</label>
                                    <input type="text" placeholder="e.g. 01" value={formData.rtoCode} onChange={handleRtoCodeChange} onBlur={() => validateField('rtoCode', formData.rtoCode)} maxLength={2} className={`bg-white/10 rounded px-2 py-1 w-full outline-none focus:ring-1 ${errors.rtoCode ? 'ring-1 ring-red-500' : 'focus:ring-brand'}`} />
                                    <FieldError msg={errors.rtoCode} />
                                </div>
                                <div><label className="text-[10px] font-black text-gray-500 block mb-1 uppercase">Reg. Code</label><input readOnly value={formData.stateRtoCode} className="bg-transparent border-none text-white font-bold" /></div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <FaMapMarkerAlt className="text-brand text-xl" />
                                <h3 className="text-xl font-bold">Permanent Address</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400">State (as per Address)</label>
                                    <select name="state" value={formData.state} onBlur={() => validateField('state', formData.state)} onChange={handlePermanentStateChange} className={`px-4 py-3 rounded-xl bg-white/5 border ${errors.state ? 'border-red-500' : 'border-white/10'} text-white outline-none focus:ring-2 focus:ring-brand`}>
                                        <option value="" className="bg-black">Select State</option>
                                        {states.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                                    </select>
                                    <FieldError msg={errors.state} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-400">District (as per Address)</label>
                                    <select name="district" value={formData.district} disabled={!formData.state} onBlur={() => validateField('district', formData.district)} onChange={(e) => { setFormData(p => ({ ...p, district: e.target.value })); validateField('district', e.target.value); }} className={`px-4 py-3 rounded-xl bg-white/5 border ${errors.district ? 'border-red-500' : 'border-white/10'} text-white outline-none focus:ring-2 focus:ring-brand disabled:opacity-30`}>
                                        <option value="" className="bg-black">Select District</option>
                                        {permanentDistricts.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                                    </select>
                                    <FieldError msg={errors.district} />
                                </div>
                            </div>
                            <Input label="House Name" name="houseName" value={formData.houseName} onChange={handleChange} onBlur={() => validateField('houseName', formData.houseName)} error={errors.houseName} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Place" name="place" value={formData.place} onChange={handleChange} onBlur={() => validateField('place', formData.place)} error={errors.place} />
                                <Input label="Pin Code" name="pin" value={formData.pin} onChange={handleChange} onBlur={() => validateField('pin', formData.pin)} maxLength={6} error={errors.pin} />
                            </div>
                        </div>

                        <Button type="submit" isLoading={isLoading} className="w-full py-4 rounded-2xl bg-brand text-black font-black text-xl hover:shadow-[0_0_30px_rgba(255,204,0,0.4)] transition-all uppercase">
                            Complete Registration
                        </Button>
                    </form>
                </motion.div>
            </div>
            {/* Image Cropper Modal - Moved Outside for Z-Index Fix */}
            {showCropper && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-white/20 relative" style={{ zIndex: 100000 }}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 z-10 bg-white dark:bg-gray-900 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center text-brand">
                                    <FaCrop size={16} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crop Profile Photo</h3>
                            </div>
                        </div>

                        {/* Cropper Container - Fix for overflow and scrolling */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-800 relative min-h-[300px]">
                            <div className="w-full h-full flex items-center justify-center">
                                <img
                                    ref={imageRef}
                                    src={tempImageSrc}
                                    alt="Crop preview"
                                    className="max-w-full max-h-[60vh] object-contain block"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 z-10 relative rounded-b-2xl">
                            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                                Drag to reposition • Resize crop box
                            </p>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <button
                                    type="button"
                                    onClick={handleCropCancel}
                                    className="px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCropComplete}
                                    className="px-6 py-2 rounded-lg bg-brand hover:bg-brand-dark text-black font-bold text-sm shadow-lg shadow-brand/20 flex items-center gap-2 transition-all"
                                >
                                    <FaCheck size={14} />
                                    Apply Crop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;