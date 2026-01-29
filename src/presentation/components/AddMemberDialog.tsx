import React, { useState, useEffect, useRef } from 'react';
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
import { FaUserPlus, FaTimes, FaCamera, FaTint, FaMapMarkerAlt, FaIdCard, FaCrop, FaCheck } from 'react-icons/fa';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

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
        licenceNumber: '',
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
    const [showCropper, setShowCropper] = useState<boolean>(false);
    const [tempImageSrc, setTempImageSrc] = useState<string>('');
    const imageRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper | null>(null);
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [stateCodes, setStateCodes] = useState<{ state: string; code: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isOpen) {
            if (user?.role === UserRole.DISTRICT_ADMIN) {
                const userState = (user as any).state || '';
                setFormData(prev => ({
                    ...prev,
                    state: userState,
                    district: (user as any).district || ''
                }));

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
        const rtoCode = e.target.value.replace(/\D/g, '').slice(0, 2);
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
            case 'licenceNumber':
                if (!trimmed) message = 'Licence number is required';
                else if (trimmed.length < 5 || trimmed.length > 20) message = 'Licence number must be 5-20 characters';
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

        if (!file) {
            setPhoto(null);
            return;
        }

        try {
            // BEFORE CROP: Validate file type, max size, and corruption
            const validation = await ImageValidator.validateBeforeCrop(file);
            if (!validation.valid) {
                setPhotoError(validation.error || 'Image validation failed');
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
        } catch (error: any) {
            setPhotoError(error.message || 'Failed to validate image');
            setPhoto(null);
            e.target.value = '';
        }
    };

    // Initialize cropper when modal opens
    useEffect(() => {
        if (showCropper && imageRef.current && !cropperRef.current) {
            cropperRef.current = new Cropper(imageRef.current, {
                aspectRatio: 413 / 531, // ✅ CORRECT PASSPORT RATIO
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.8,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,   // ✅ user can move
                cropBoxResizable: true, // ✅ Allow resize
                toggleDragModeOnDblclick: false,
            } as any);

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
                height: 531,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            canvas.toBlob(async (blob: Blob | null) => {
                if (blob) {
                    const croppedFile = new File([blob], 'cropped-photo.jpg', { type: 'image/jpeg' });

                    // AFTER CROP: Validate dimensions, aspect ratio, and orientation
                    const validation = await ImageValidator.validateAfterCrop(croppedFile);
                    if (!validation.valid) {
                        setPhotoError(validation.error || 'Cropped image validation failed');
                        toast.error(validation.error || 'Cropped image validation failed');
                        return;
                    }

                    setPhoto(croppedFile);

                    // Show preview of cropped image
                    const previewUrl = URL.createObjectURL(croppedFile);
                    setPhotoPreview(previewUrl);

                    const sizeKB = ImageValidator.getFileSizeKB(croppedFile);
                    setPhotoInfo(`✓ Image cropped successfully (${sizeKB} KB, 413x531)`);

                    // Close cropper
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
        if (!formData.licenceNumber.trim()) newErrors.licenceNumber = 'Licence number is required';
        else if (formData.licenceNumber.trim().length < 5 || formData.licenceNumber.trim().length > 20) newErrors.licenceNumber = 'Licence number must be 5-20 characters';
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

            setFormData({
                name: '',
                email: '',
                phone: '',
                bloodGroup: '',
                licenceNumber: '',
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">

                {/* Header Styling */}
                <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center text-brand">
                            <FaUserPlus size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Register New Member</h2>
                            <p className="text-xs text-gray-500">Provide accurate details for membership registration</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Main Form Content */}
                <form id="add-member-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 dark:bg-gray-900">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Sidebar: Photo & Vital Info */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">Profile Photo</label>
                                <div className="flex flex-col items-center">
                                    <label className="relative cursor-pointer group">
                                        <div className="w-40 h-52 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center transition-all group-hover:border-brand">
                                            {photoPreview ? (
                                                <div className="relative w-full h-full">
                                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Prevent triggering the file input
                                                            setPhoto(null);
                                                            setPhotoPreview('');
                                                            setPhotoInfo('');
                                                            setPhotoError('');
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md z-10"
                                                        title="Clear Photo"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center px-4">
                                                    <FaCamera className="mx-auto text-gray-300 mb-2 text-2xl" />
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-tight">Upload Portrait<br />(30KB-300KB)</span>
                                                </div>

                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            ref={(input) => {
                                                if (input && !photo) input.value = '';
                                            }}
                                        />
                                        {!photoPreview && (
                                            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                                                <span className="bg-brand text-white text-[9px] px-3 py-1 rounded-full shadow-lg font-bold uppercase tracking-tighter">Click to browse</span>
                                            </div>
                                        )}
                                    </label>
                                    {photoError && <p className="text-red-500 text-[10px] mt-4 font-bold bg-red-50 px-2 py-1 rounded">✗ {photoError}</p>}
                                    {photoInfo && <p className="text-green-500 text-[10px] mt-4 font-bold bg-green-50 px-2 py-1 rounded">{photoInfo}</p>}
                                </div>

                                <div className="mt-8">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FaTint className="text-red-500" /> Blood Group
                                    </label>
                                    <select
                                        className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-brand bg-white dark:bg-gray-900 text-sm dark:text-white transition-all outline-none ${errors.bloodGroup ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        value={formData.bloodGroup}
                                        onChange={(e) => {
                                            setFormData({ ...formData, bloodGroup: e.target.value });
                                            if (errors.bloodGroup) setErrors(prev => ({ ...prev, bloodGroup: '' }));
                                        }}
                                        onBlur={(e) => validateField('bloodGroup', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Group</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    {errors.bloodGroup && <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1">{errors.bloodGroup}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Main Inputs: Form Details */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Personal Info Section */}
                            <section>
                                <h3 className="text-[11px] font-black text-brand uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                    <FaIdCard /> Identity Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} onBlur={(e) => validateField('name', e.target.value)} maxLength={50} required error={errors.name} />
                                    <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={(e) => validateField('email', e.target.value)} required error={errors.email} />

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Phone Number</label>
                                        <div className={`flex rounded-xl overflow-hidden border transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
                                            <span className="px-4 flex items-center bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm font-bold border-r border-gray-200 dark:border-gray-700">+91</span>
                                            <input name="phone" value={formData.phone} onChange={handleChange} onBlur={(e) => validateField('phone', e.target.value)} required maxLength={10} className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 text-sm outline-none dark:text-white" />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1">{errors.phone}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Input label="Licence Number" name="licenceNumber" value={formData.licenceNumber} onChange={handleChange} onBlur={(e) => validateField('licenceNumber', e.target.value)} maxLength={20} required error={errors.licenceNumber} />
                                    </div>
                                </div>
                            </section>

                            {/* Address Section */}
                            <section>
                                <h3 className="text-[11px] font-black text-brand uppercase tracking-[2px] mb-4 flex items-center gap-2">
                                    <FaMapMarkerAlt /> Address & Location
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">State</label>
                                        <select disabled className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 text-gray-500 text-sm cursor-not-allowed" value={formData.state}>
                                            <option value="">Select State</option>
                                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">District</label>
                                        <select disabled className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 text-gray-500 text-sm cursor-not-allowed" value={formData.district}>
                                            <option value="">Select District</option>
                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>

                                    {/* Codes Grid */}
                                    <div className="md:col-span-2 grid grid-cols-3 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-gray-400">State Code</label>
                                            <input readOnly value={formData.stateCode} className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-500 text-sm text-center font-bold" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">RTO Code <span className="text-red-500">*</span></label>
                                            <input value={formData.rtoCode} onChange={handleRtoCodeChange} onBlur={(e) => validateField('rtoCode', e.target.value)} placeholder="01" required maxLength={2} className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-900 text-sm text-center font-bold outline-none focus:ring-2 focus:ring-brand dark:text-white ${errors.rtoCode ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-gray-400">State RTO Code</label>
                                            <input readOnly value={formData.stateRtoCode} className="px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-500 text-sm text-center font-bold" />
                                        </div>
                                        {errors.rtoCode && <p className="col-span-3 text-red-500 text-[10px] font-semibold">{errors.rtoCode}</p>}
                                    </div>

                                    <Input label="House Name / No" name="houseName" value={formData.houseName} onChange={handleChange} onBlur={(e) => validateField('houseName', e.target.value)} required error={errors.houseName} />
                                    <Input label="Place" name="place" value={formData.place} onChange={handleChange} onBlur={(e) => validateField('place', e.target.value)} required error={errors.place} />
                                    <div className="md:col-span-2">
                                        <Input label="Pin Code" name="pin" value={formData.pin} onChange={handleChange} onBlur={(e) => validateField('pin', e.target.value)} maxLength={6} required error={errors.pin} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </form>

                {/* Footer Styling */}
                <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={loading} className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors">
                        Cancel
                    </button>
                    <Button type="submit" form="add-member-form" isLoading={loading} className="px-10 py-2.5 rounded-xl bg-brand hover:bg-brand-dark shadow-lg shadow-brand/20 text-sm font-bold tracking-wide">
                        Register Member
                    </Button>
                </div>
            </div>

            {/* Image Cropper Modal */}
            {showCropper && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center text-brand">
                                    <FaCrop size={16} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crop Profile Photo</h3>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden p-6 bg-gray-50 dark:bg-gray-800">
                            <div className="w-full h-full flex items-center justify-center">
                                <img
                                    ref={imageRef}
                                    src={tempImageSrc}
                                    alt="Crop preview"
                                    className="max-w-full max-h-[60vh]"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Drag to reposition • Resize crop box for desired framing
                            </p>
                            <div className="flex items-center gap-3">
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