import React, { useEffect, useState } from 'react';
import { AdminRepository } from '../../../data/repositories/AdminRepository';
import { LocationRepository } from '../../../data/repositories/LocationRepository';
import { UserRole } from '../../../common/enums';
import { Button } from '../Button';
import { Input } from '../Input';
import { ViewDetailsDialog } from '../ViewDetailsDialog';
import { EditMemberDialog } from '../EditMemberDialog';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { toast } from 'react-toastify';
import noImage from "../../../assets/no-image.jpg";



export const DistrictAdminManagement = () => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewAdmin, setViewAdmin] = useState<any>(null);
    const [editAdmin, setEditAdmin] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        state: '',
        district: '',
        role: UserRole.DISTRICT_ADMIN
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        adminId: string | null;
        adminName: string;
    }>({ isOpen: false, adminId: null, adminName: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchAdmins = async () => {
        try {
            const data = await AdminRepository.getDistrictAdmins();
            console.log('Fetched District Admins:', data);
            if (Array.isArray(data)) {
                setAdmins(data);
            } else {
                console.error('Invalid district admins data format:', data);
                setAdmins([]);
            }
        } catch (error) {
            console.error('Failed to fetch admins', error);
            setAdmins([]);
        }
    };

    useEffect(() => {
        fetchAdmins();
        fetchStates();
    }, []);

    const fetchStates = async () => {
        try {
            const data = await LocationRepository.getStates();
            setStates(data);
        } catch (error) {
            console.error('Failed to fetch states', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'phone') {
            const phoneValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: phoneValue });
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
            case 'password':
                if (!trimmed) message = 'Password is required';
                else if (trimmed.length < 6) message = 'Password must be at least 6 characters';
                break;
            case 'state':
                if (!trimmed) message = 'State is required';
                break;
            case 'district':
                if (!trimmed) message = 'District is required';
                break;
            default:
                break;
        }

        if (message) setErrors(prev => ({ ...prev, [name]: message }));
        else if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        setFormData({ ...formData, state, district: '' });
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

    const handleCreate = async (e: React.FormEvent) => {       
        e.preventDefault();

        // Validation Logic
        const newErrors: { [key: string]: string } = {};
        const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{1,49}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        else if (!nameRegex.test(formData.name.trim())) newErrors.name = 'Name must contain only letters and spaces (2-50 chars)';

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email.trim())) newErrors.email = 'Invalid email format';

        if (!formData.password.trim()) newErrors.password = 'Password is required';
        else if (formData.password.trim().length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!phoneRegex.test(formData.phone.trim())) newErrors.phone = 'Phone number must be exactly 10 digits';

        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.district.trim()) newErrors.district = 'District is required';

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsLoading(true);
        try {
                const formDataToSend = new FormData();

        // Append text fields
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formDataToSend.append(key, String(value));
            }
        });
            if (photo) {
               
                 formDataToSend.append('photo', photo);
            }

            await AdminRepository.createDistrictAdmin(formDataToSend);
            toast.success('District Admin created successfully');
            setFormData({ name: '', email: '', password: '', phone: '', state: '', district: '', role: UserRole.DISTRICT_ADMIN });
            setPhoto(null);
            setErrors({});
            fetchAdmins();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create admin';
            
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

    const handleBlockToggle = async (id: string) => {
        try {
            await AdminRepository.toggleBlockStatus(id);
            toast.success('Admin status updated');
            fetchAdmins();
        } catch (error) {
            console.error('Failed to update status', error);
            toast.error('Failed to update admin status');
        }
    };

    const handleDeleteClick = (admin: any) => {
        setDeleteDialog({ isOpen: true, adminId: admin._id, adminName: admin.name });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.adminId) return;
        try {
            setDeleteLoading(true);
            await AdminRepository.deleteDistrictAdmin(deleteDialog.adminId);
            toast.success('District admin deleted');
            setDeleteDialog({ isOpen: false, adminId: null, adminName: '' });
            fetchAdmins();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete admin');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Create District Admin</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Input 
                        label="Password" 
                        name="password"
                        type="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        onBlur={(e) => validateField('password', e.target.value)}
                        required 
                        error={errors.password}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={(e) => validateField('phone', e.target.value)}
                            required
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-brand bg-white dark:bg-gray-800 dark:text-white ${
                                errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700'
                            }`}
                        />
                        {errors.phone && <span className="text-xs text-red-500 ml-1">{errors.phone}</span>}
                    </div>

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
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passport Size Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-black hover:file:bg-brand/20 dark:file:bg-gray-700 dark:file:text-gray-300"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">Create Admin</Button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Existing District Admins</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand text-black border-b border-brand-600">
                            <tr>
                             <th className="p-4 text-sm font-medium text-black">Photo</th>
                                <th className="p-4 text-sm font-medium text-black">Name</th>
                                <th className="p-4 text-sm font-medium text-black">Email</th>
                                <th className="p-4 text-sm font-medium text-black">State</th>
                                <th className="p-4 text-sm font-medium text-black">District</th>
                                <th className="p-4 text-sm font-medium text-black">Status</th>
                                <th className="p-4 text-sm font-medium text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {admins.map((admin: any) => (
                                <tr key={admin._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                     <td className="p-4 font-medium text-gray-800 dark:text-gray-200"><img src={admin.photoUrl||noImage} alt="Admin Photo" className="w-10 h-10 rounded-full object-cover" /></td>
                                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{admin.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{admin.email}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{admin.state || 'N/A'}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{admin.district || 'N/A'}</td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${admin.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {admin.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={() => handleBlockToggle(admin._id)}
                                                className={admin.isBlocked ? "text-sm font-medium text-green-600 hover:text-green-500" : "text-sm font-medium text-red-600 hover:text-red-500"}
                                            >
                                                {admin.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                            <button
                                                onClick={() => setEditAdmin(admin)}
                                                className="text-sm font-medium text-black hover:text-gray-700"
                                            >
                                                Edit
                                            </button>
                                            {admin.deletable && (
                                                <button
                                                    onClick={() => handleDeleteClick(admin)}
                                                    className="text-sm font-medium text-red-600 hover:text-red-500"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setViewAdmin(admin)}
                                                className="text-sm font-medium text-gray-600 hover:text-gray-500"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No district admins found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ViewDetailsDialog
                isOpen={!!viewAdmin}
                onClose={() => setViewAdmin(null)}
                data={viewAdmin}
                title="District Admin Details"
            />

            <EditMemberDialog
                isOpen={!!editAdmin}
                onClose={() => setEditAdmin(null)}
                member={editAdmin}
                onSuccess={() => {
                    fetchAdmins();
                    setEditAdmin(null);
                }}
            />

            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                title="Delete District Admin"
                message={`Are you sure you want to delete ${deleteDialog.adminName}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDangerous={true}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteDialog({ isOpen: false, adminId: null, adminName: '' })}
                isLoading={deleteLoading}
            />
        </div>
    );
};
