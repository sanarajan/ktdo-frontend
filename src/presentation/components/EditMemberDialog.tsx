import { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { FaMapMarkerAlt, FaCheck, FaTimes, FaCamera, FaCrop, FaUserEdit, FaInfoCircle } from 'react-icons/fa';
import { Input } from './Input';
import { Button } from './Button';
import { toast } from 'react-toastify';
import { AdminRepository } from '../../data/repositories/AdminRepository';
import { LocationRepository } from '../../data/repositories/LocationRepository';
import { UserRole } from '../../common/enums';
import { ImageValidator } from '../../utils/ImageValidator';
import noImage from "../../assets/no-image.jpg";
import { SUCCESS_MESSAGES } from '../../common/successMessages';
import { ERROR_MESSAGES } from '../../common/errorMessages';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

interface EditMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    onSuccess: () => void;
}

export const EditMemberDialog = ({ isOpen, onClose, member, onSuccess }: EditMemberDialogProps) => {
    /* --- LOGIC PRESERVED EXACTLY AS PROVIDED --- */
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        houseName: '',
        place: '',
        state: '',
        district: '',
        workingState: '',
        workingDistrict: '',
        pin: '',
        stateCode: '',
        rtoCode: '',
        stateRtoCode: '',
        bloodGroup: '',
        licenceNumber: ''
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoError, setPhotoError] = useState<string>('');
    const [photoInfo, setPhotoInfo] = useState<string>('');
    const [isPhotoDeleted, setIsPhotoDeleted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [permanentDistricts, setPermanentDistricts] = useState<string[]>([]);

    const [preview, setPreview] = useState<string | null>(null);
    const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Cropper State
    const [showCropper, setShowCropper] = useState<boolean>(false);
    const [tempImageSrc, setTempImageSrc] = useState<string>('');
    const imageRef = useRef<HTMLImageElement>(null);
    const cropperRef = useRef<Cropper | null>(null);

    useEffect(() => {
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

    useEffect(() => {
        if (member) {
            let parsedStateCode = (member as any).stateCode || '';
            let parsedRtoCode = (member as any).rtoCode || '';
            const stateRtoCode = (member as any).stateRtoCode || '';

            if (stateRtoCode && !parsedStateCode && !parsedRtoCode) {
                const parts = stateRtoCode.split('-');
                if (parts.length >= 2) {
                    parsedStateCode = parts[0];
                    parsedRtoCode = parts[1];
                }
            }

            setFormData({
                name: member.name || '',
                email: member.email || '',
                phone: member.phone || '',
                houseName: (member as any).houseName || '',
                place: (member as any).place || '',
                workingState: (member as any).workingState || '',
                workingDistrict: (member as any).workingDistrict || '',
                state: (member as any).state || '',
                district: (member as any).district || '',
                stateCode: parsedStateCode,
                rtoCode: parsedRtoCode,
                stateRtoCode: stateRtoCode || (parsedStateCode && parsedRtoCode ? `${parsedStateCode}-${parsedRtoCode}` : ''),
                pin: member.pin || '',
                bloodGroup: member.bloodGroup || '',
                licenceNumber: (member as any).licenceNumber || ''
            });

            // Fetch permanent districts if state exists
            const permanentState = (member as any).state;
            if (permanentState) {
                const fetchPermanentDistricts = async () => {
                    try {
                        const data = await LocationRepository.getDistricts(permanentState);
                        setPermanentDistricts(data);
                    } catch (error) {
                        console.error('Failed to fetch permanent districts', error);
                    }
                };
                fetchPermanentDistricts();
            }
            const memberPhoto = member.photoUrl || noImage;
            setOriginalPhotoUrl(memberPhoto);
            setPreview(memberPhoto);
            setPhoto(null);
            setIsPhotoDeleted(false);
            setPhotoError('');
            setPhotoInfo('');
            setErrors({});
            if ((member as any).workingState) {
                fetchDistricts((member as any).workingState);
            }
        }
    }, [member]);

    // Reset cropper state when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setShowCropper(false);
            setPhoto(null);
            setTempImageSrc('');
            if (cropperRef.current) {
                cropperRef.current.destroy();
                cropperRef.current = null;
            }
        }
    }, [isOpen]);

    // Initialize Cropper
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
                height: 413,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            canvas.toBlob(async (blob: Blob | null) => {
                if (blob) {
                    const croppedFile = new File([blob], 'cropped-photo.jpg', { type: 'image/jpeg' });

                    const validation = await ImageValidator.validateAfterCrop(croppedFile);
                    if (!validation.valid) {
                        setPhotoError(validation.error || 'Cropped image validation failed');
                        toast.error(validation.error || 'Cropped image validation failed');
                        return;
                    }

                    setPhoto(croppedFile);
                    setIsPhotoDeleted(false);
                    const previewUrl = URL.createObjectURL(croppedFile);
                    setPreview(previewUrl);

                    const sizeKB = ImageValidator.getFileSizeKB(croppedFile);
                    setPhotoInfo(`✓ Image cropped successfully (${sizeKB} KB, 413x413)`);

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
        // Also clear the file input if needed, but since we use state, it's fine.
        // We might want to revert photo to null if they cancel the crop of a NEW image.
        setPhoto(null);
    };

    const fetchDistricts = async (state: string) => {
        try {
            const data = await LocationRepository.getDistricts(state);
            setDistricts(data);
        } catch (error) {
            console.error('Failed to fetch districts', error);
        }
    };



    const handlePermanentStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        setFormData(prev => ({ ...prev, state: state, district: '' }));
        if (errors.state) setErrors(prev => ({ ...prev, state: '' }));

        if (state) {
            try {
                const data = await LocationRepository.getDistricts(state);
                setPermanentDistricts(data);
            } catch (error) {
                console.error('Failed to fetch permanent districts', error);
            }
        } else {
            setPermanentDistricts([]);
        }
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
            case 'workingState':
                if (!trimmed) message = 'State is required';
                break;
            case 'workingDistrict':
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
            case 'state':
                if (!trimmed) message = 'State is required';
                break;
            case 'district':
                if (!trimmed) message = 'District is required';
                break;
            case 'rtoCode':
                if (!trimmed) message = 'RTO code is required';
                else if (!rtoRegex.test(trimmed)) message = 'RTO code must be numeric (1-2 digits)';
                break;
            case 'licenceNumber':
                if (!trimmed) message = 'Licence number is required';
                else if (trimmed.length < 5 || trimmed.length > 20) message = 'Licence number must be 5-20 characters';
                break;
        }
        if (message) setErrors(prev => ({ ...prev, [name]: message }));
        else if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPhotoError('');
        setPhotoInfo('');

        if (!file) return;

        try {
            const validation = await ImageValidator.validateBeforeCrop(file);
            if (!validation.valid) {
                setPhotoError(validation.error || 'Image validation failed');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setTempImageSrc(event.target?.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset input to allow re-selecting same file
        } catch (error: any) {
            setPhotoError(error.message || 'Failed to validate image');
            e.target.value = '';
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
        if (!formData.workingState.trim()) newErrors.workingState = 'State is required';
        if (!formData.workingDistrict.trim()) newErrors.workingDistrict = 'District is required';

        if (member.role === UserRole.MEMBER) {
            if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
            if (!formData.licenceNumber.trim()) newErrors.licenceNumber = 'Licence number is required';
            else if (formData.licenceNumber.trim().length < 5 || formData.licenceNumber.trim().length > 20) newErrors.licenceNumber = 'Licence number must be 5-20 characters';
            if (formData.houseName && !formData.houseName.trim()) newErrors.houseName = 'House name is required';
            if (formData.place && !formData.place.trim()) newErrors.place = 'Place is required';
            if (formData.pin && !formData.pin.trim()) newErrors.pin = 'Pin code is required';
            else if (formData.pin && !pinRegex.test(formData.pin.trim())) newErrors.pin = 'Pin code must be exactly 6 digits';
            if (formData.rtoCode && !formData.rtoCode.trim()) newErrors.rtoCode = 'RTO code is required';
            else if (formData.rtoCode && !rtoRegex.test(formData.rtoCode.trim())) newErrors.rtoCode = 'RTO code must be numeric (1-2 digits)';
            if (!formData.state) newErrors.state = 'State is required';
            if (!formData.district) newErrors.district = 'District is required';
        }

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            toast.error(ERROR_MESSAGES.FORM_ERRORS);
            return;
        }

        setIsLoading(true);
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formDataToSend.append(key, String(value));
                }
            });
            if (photo) {
                formDataToSend.append('photo', photo);
            } else if (isPhotoDeleted) {
                formDataToSend.append('deletePhoto', 'true');
            }
            await AdminRepository.updateMember(member._id, formDataToSend);
            toast.success(SUCCESS_MESSAGES.MEMBER_UPDATED);
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || ERROR_MESSAGES.MEMBER_UPDATE_FAILED;
            if (errorMessage.toLowerCase().includes('phone')) {
                setErrors(prev => ({ ...prev, phone: errorMessage }));
            } else if (errorMessage.toLowerCase().includes('email')) {
                setErrors(prev => ({ ...prev, email: errorMessage }));
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!member) return null;

    return (
        <>
            <Dialog
                open={isOpen}
                onClose={() => {
                    // Prevent closing if cropper is open
                    if (!showCropper) onClose();
                }}
                className="relative z-50"
            >
                {/* Backdrop */}
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 max-h-[90vh]">

                        {/* Header: Modern & Bold */}
                        <div className="flex justify-between items-center px-10 py-7 bg-white dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                                    <FaUserEdit size={24} />
                                </div>
                                <div>
                                    <Dialog.Title className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        Edit Profile
                                    </Dialog.Title>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Update Member Records</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-10 space-y-10">

                                {/* Photo Upload Section: Elegant Circle Preview */}
                                <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl relative">
                                            <img
                                                src={preview || "/no-image.jpg"}
                                                alt="Preview"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <FaCamera className="text-white text-2xl" />
                                                <input type="file" accept=".jpg,.jpeg,.png" onChange={handlePhotoChange} className="hidden" />
                                            </label>
                                        </div>

                                        {/* Clear Button - Only show if current preview is different from original (meaning a new file was selected) OR if we just want to allow clearing generally. 
                                        But requirement said: "revert to original". If photo state is set, it means a new file is there. */}
                                        {/* Clear Button Logic:
                                            Show if:
                                            1. A new photo is selected (photo !== null)
                                            2. OR No new photo, but original exists and is NOT yet deleted (show X to delete original)
                                            3. Hide if already deleted (preview is noImage) - or maybe show 'Undo'? 
                                               Requirement: "when delete this default image too then clear image" -> implies standard delete.
                                        */}
                                        {(photo || (!isPhotoDeleted && originalPhotoUrl && originalPhotoUrl !== noImage)) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (photo) {
                                                        // Case 1: Has new photo -> Revert to Original state
                                                        setPhoto(null);
                                                        setPreview(originalPhotoUrl || noImage);
                                                        // Note: If original state was "deleted", this reverts to THAT? 
                                                        // No, usually assume revert to DB state. 
                                                        setIsPhotoDeleted(false);
                                                    } else {
                                                        // Case 2: No new photo, has Original -> Delete state
                                                        setIsPhotoDeleted(true);
                                                        setPreview(noImage);
                                                    }
                                                    setPhotoError('');
                                                    setPhotoInfo('');
                                                }}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-20"
                                                title={photo ? "Revert to Original" : "Remove Photo"}
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white">Profile Picture</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                                            Square Portrait JPG/PNG, 15KB - 2MB. Click the image to update.
                                        </p>
                                        {photoError && <p className="text-xs font-bold text-red-500 flex items-center justify-center md:justify-start gap-1"><span>✗</span> {photoError}</p>}
                                        {photoInfo && <p className="text-xs font-bold text-green-500">{photoInfo}</p>}
                                    </div>
                                </div>

                                {/* Section 1: Core Details */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-brand">
                                        <FaInfoCircle size={14} />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Personal Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} onBlur={(e) => validateField('name', e.target.value)} maxLength={50} required error={errors.name} />
                                        <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={(e) => validateField('email', e.target.value)} required error={errors.email} />

                                        {/* Styled Phone Input */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                                            <div className="flex gap-2">
                                                <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold text-sm border border-transparent flex items-center">+91</div>
                                                <input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    onBlur={(e) => validateField('phone', e.target.value)}
                                                    required
                                                    type="tel"
                                                    maxLength={10}
                                                    className={`flex-1 px-5 py-3 rounded-2xl border bg-white dark:bg-gray-800 dark:text-white transition-all focus:ring-4 focus:ring-brand/10 outline-none ${errors.phone ? 'border-red-500' : 'border-gray-100 dark:border-gray-700 focus:border-brand'}`}
                                                />
                                            </div>
                                            {errors.phone && <span className="text-[10px] font-bold text-red-500 ml-1">{errors.phone}</span>}
                                        </div>

                                        {member.role === UserRole.MEMBER && (
                                            <>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Blood Group</label>
                                                    <select
                                                        className={`px-5 py-3.5 rounded-2xl border bg-white dark:bg-gray-800 dark:text-white appearance-none transition-all outline-none focus:ring-4 focus:ring-brand/10 ${errors.bloodGroup ? 'border-red-500' : 'border-gray-100 dark:border-gray-700 focus:border-brand'}`}
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
                                                </div>
                                                <Input label="Licence Number" name="licenceNumber" value={formData.licenceNumber} onChange={handleChange} onBlur={(e) => validateField('licenceNumber', e.target.value)} maxLength={20} required error={errors.licenceNumber} />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Permanent Address */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-brand">
                                        <FaMapMarkerAlt size={14} />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Permanent Address</h3>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/20 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {member.role === UserRole.MEMBER && (
                                            <>
                                                <div className="flex flex-col gap-1.5 px-1">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">State</label>
                                                    <select
                                                        className={`px-5 py-3.5 rounded-2xl border bg-white dark:bg-gray-800 dark:text-white appearance-none transition-all outline-none focus:ring-4 focus:ring-brand/10 ${errors.state ? 'border-red-500' : 'border-gray-100 dark:border-gray-700 focus:border-brand'}`}
                                                        value={formData.state}
                                                        onChange={handlePermanentStateChange}
                                                        onBlur={(e) => validateField('state', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select State</option>
                                                        {states.map(state => <option key={state} value={state}>{state}</option>)}
                                                    </select>
                                                </div>

                                                <div className="flex flex-col gap-1.5 px-1">
                                                    <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">District</label>
                                                    <select
                                                        disabled={!formData.state}
                                                        className={`px-5 py-3.5 rounded-2xl border bg-white dark:bg-gray-800 dark:text-white appearance-none transition-all outline-none focus:ring-4 focus:ring-brand/10 disabled:opacity-50 ${errors.district ? 'border-red-500' : 'border-gray-100 dark:border-gray-700 focus:border-brand'}`}
                                                        value={formData.district}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, district: e.target.value });
                                                            if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
                                                        }}
                                                        onBlur={(e) => validateField('district', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select District</option>
                                                        {permanentDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>

                                                <Input label="House Name / No" name="houseName" value={formData.houseName} onChange={handleChange} required error={errors.houseName} />
                                                <Input label="Place" name="place" value={formData.place} onChange={handleChange} required error={errors.place} />
                                                <div className="md:col-span-2">
                                                    <Input label="Pin Code" name="pin" value={formData.pin} onChange={handleChange} maxLength={6} required error={errors.pin} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Section 2: Working Location & RTO */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-brand">
                                        <FaMapMarkerAlt size={14} />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Admin Approval</h3>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/20 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-1.5 opacity-60">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Working State</label>
                                            <select className="px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed" value={formData.workingState} disabled>
                                                {states.map(state => <option key={state} value={state}>{state}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5 opacity-60">
                                            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Working District</label>
                                            <select className="px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-not-allowed" value={formData.workingDistrict} disabled>
                                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>

                                        {member.role === UserRole.MEMBER && (
                                            <div className="md:col-span-2 grid grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">State Code</p>
                                                    <p className="font-mono font-bold text-brand">{formData.stateCode || '—'}</p>
                                                </div>
                                                <div className="space-y-1 border-x border-gray-100 dark:border-gray-800 px-4">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">RTO Code</p>
                                                    <input
                                                        type="text"
                                                        value={formData.rtoCode}
                                                        onChange={handleRtoCodeChange}
                                                        maxLength={2}
                                                        className="w-full bg-transparent font-bold outline-none text-gray-800 dark:text-white"
                                                        placeholder="01"
                                                    />
                                                </div>
                                                <div className="space-y-1 pl-4">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">System Code</p>
                                                    <p className="font-mono font-bold text-gray-800 dark:text-white">{formData.stateRtoCode || '—'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer: Fixed & Polished */}
                            <div className="sticky bottom-0 px-10 py-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <Button type="submit" isLoading={isLoading} className="px-10 py-3 shadow-lg shadow-brand/20">
                                    Update Profile
                                </Button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
            {/* Image Cropper Modal - Moved OUTSIDE Dialog to prevent closing parent on interaction */}
            {
                showCropper && (
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

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
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
                )
            }
        </>
    );
};