import React, { useState, useEffect } from 'react';
import { LocationRepository } from '../../data/repositories/LocationRepository';
import { Button } from './Button';
import { Input } from './Input';
import { toast } from 'react-toastify';
import axios from '../../config/axios';
import { UserRole } from '../../common/enums';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface AddMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        licenseNumber: '',
        vehicleType: '',
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
    const [loading, setLoading] = useState(false);

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
                } catch (error) {
                    console.error('Failed to fetch states', error);
                }
            };
            fetchStates();
        }
    }, [isOpen, user]);

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

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {

            // 
             const data = new FormData();
             Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    data.append(key, String(value));
                }
             });
            if (photo) {
               
                 data.append('photo', photo);
            }
            //      

            await axios.post('/admin/member', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Member added successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Member</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <Input
                        label="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <Input
                        label="Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <Input
                        label="License Number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    />
                    <Input
                        label="Vehicle Type"
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                            <select
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={formData.state}
                                onChange={handleStateChange}
                                required
                                disabled={user?.role === UserRole.DISTRICT_ADMIN}
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
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                required
                                disabled={!formData.state || user?.role === UserRole.DISTRICT_ADMIN}
                            >
                                <option value="">Select District</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Input label="Post" value={formData.post} onChange={(e) => setFormData({ ...formData, post: e.target.value })} />
                    <Input label="Pin Code" value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value })} />
                    <Input label="Blood Group" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} />
                    <Input label="Emergency Contact No" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                        />
                    </div>

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
