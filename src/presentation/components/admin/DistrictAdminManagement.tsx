import React, { useEffect, useState } from 'react';
import { AdminRepository } from '../../../data/repositories/AdminRepository';
import { LocationRepository } from '../../../data/repositories/LocationRepository';
import { UserRole } from '../../../common/enums';
import { Button } from '../Button';
import { Input } from '../Input';
import { ViewDetailsDialog } from '../ViewDetailsDialog';
import { EditMemberDialog } from '../EditMemberDialog';
import { toast } from 'react-toastify';

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });
            if (photo) {
                formDataToSend.append('photo', photo);
            }

            await AdminRepository.createDistrictAdmin(formDataToSend);
            toast.success('District Admin created successfully');
            setFormData({ name: '', email: '', password: '', phone: '', state: '', district: '', role: UserRole.DISTRICT_ADMIN });
            setPhoto(null);
            fetchAdmins();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create admin');
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

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Create District Admin</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                    <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />

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
                            onChange={e => setFormData({ ...formData, district: e.target.value })}
                            required
                            disabled={!formData.state}
                        >
                            <option value="">Select District</option>
                            {districts.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passport Size Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-300"
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
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="p-4 text-sm font-medium text-gray-500">Name</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Email</th>
                                <th className="p-4 text-sm font-medium text-gray-500">State</th>
                                <th className="p-4 text-sm font-medium text-gray-500">District</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="p-4 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {admins.map((admin: any) => (
                                <tr key={admin._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
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
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                            >
                                                Edit
                                            </button>
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
        </div>
    );
};
