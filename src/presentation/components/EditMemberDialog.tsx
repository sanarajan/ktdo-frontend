import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FaTimes } from 'react-icons/fa';
import { Input } from './Input';
import { Button } from './Button';
import { toast } from 'react-toastify';
import { AdminRepository } from '../../data/repositories/AdminRepository';
import { LocationRepository } from '../../data/repositories/LocationRepository';
import { UserRole } from '../../common/enums';
import noImage from "../../assets/no-image.jpg";

interface EditMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    onSuccess: () => void;
}

export const EditMemberDialog = ({ isOpen, onClose, member, onSuccess }: EditMemberDialogProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        licenseNumber: '',
        vehicleNumber: '',
        address: '',
        state: '',
        district: '',
        post: '',
        pin: '',
        bloodGroup: '',
        emergencyContact: ''
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [states, setStates] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
const [preview, setPreview] = useState<string | null>(null);

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

    // Update form data when member changes
    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name || '',
                email: member.email || '',
                phone: member.phone || '',
                password: '', // Always reset password field on load
                licenseNumber: member.licenseNumber || '',
                vehicleNumber: member.vehicleNumber || '',
                address: member.address || '',
                state: member.state || '',
                district: member.district || '',
                post: member.post || '',
                pin: member.pin || '',
                bloodGroup: member.bloodGroup || '',
                emergencyContact: member.emergencyContact || ''
            });
             setPreview(member.photoUrl || noImage);
        setPhoto(null);
            if (member.state) {
                fetchDistricts(member.state);
            }
        }
    }, [member]);

    const fetchDistricts = async (state: string) => {
        try {
            const data = await LocationRepository.getDistricts(state);
            setDistricts(data);
        } catch (error) {
            console.error('Failed to fetch districts', error);
        }
    };

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value;
        setFormData({ ...formData, state, district: '' });
        if (state) {
            await fetchDistricts(state);
        } else {
            setDistricts([]);
        }
    };
const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    }
};

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
}

            await AdminRepository.updateMember(member._id, formDataToSend);
            toast.success('Member updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update member');
        } finally {
            setIsLoading(false);
        }
    };

    if (!member) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

<div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">

                <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                        <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-white">
                            Edit Member
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <Input
                                label="New Password (leave blank to keep current)"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />

                            {member.role !== UserRole.DISTRICT_ADMIN && (
                                <>
                                    <Input
                                        label="License Number"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    />
                                    <Input
                                        label="Vehicle Number"
                                        value={formData.vehicleNumber}
                                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                    />
                                    <Input
                                        label="Address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="md:col-span-2"
                                    />
                                    <Input label="Post" value={formData.post} onChange={(e) => setFormData({ ...formData, post: e.target.value })} />
                                    <Input label="Pin Code" value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value })} />
                                    <Input label="Blood Group" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} />
                                    <Input label="Emergency Contact No" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
                                </>
                            )}
                        </div>

                        {/* Photo Upload Section */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {member.role === UserRole.DISTRICT_ADMIN ? 'Update Passport Photo' : 'Update Photo'}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                  onChange={handlePhotoChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                            />
                        </div>
                        <div className="flex justify-center mb-4">
    <img
        src={preview || "/no-image.jpg"}
        alt="Preview"
        className="w-28 h-28 rounded-full object-cover border"
    />
</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                <select
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
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <Button type="submit" isLoading={isLoading}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
