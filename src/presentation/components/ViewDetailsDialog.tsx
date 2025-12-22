import { Dialog } from '@headlessui/react';
import { FaTimes } from 'react-icons/fa';

interface ViewDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    title: string;
}

export const ViewDetailsDialog = ({ isOpen, onClose, data, title }: ViewDetailsDialogProps) => {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                        <Dialog.Title className="text-xl font-bold text-gray-800 dark:text-white">
                            {title}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                                <p className="text-gray-800 dark:text-white font-medium">{data.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                                <p className="text-gray-800 dark:text-white">{data.email}</p>
                            </div>
                            {data.phone && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                                    <p className="text-gray-800 dark:text-white">{data.phone}</p>
                                </div>
                            )}
                            {data.licenseNumber && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">License Number</label>
                                    <p className="text-gray-800 dark:text-white">{data.licenseNumber}</p>
                                </div>
                            )}
                            {data.vehicleNumber && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Number</label>
                                    <p className="text-gray-800 dark:text-white">{data.vehicleNumber}</p>
                                </div>
                            )}
                            {data.address && (
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                                    <p className="text-gray-800 dark:text-white">{data.address}</p>
                                </div>
                            )}
                            {data.district && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">District</label>
                                    <p className="text-gray-800 dark:text-white">{data.district}</p>
                                </div>
                            )}
                            {data.uniqueId && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique ID</label>
                                    <p className="text-gray-800 dark:text-white font-mono">{data.uniqueId}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                                <p className="text-gray-800 dark:text-white">{data.role}</p>
                            </div>
                            {data.status && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                    <p className="text-gray-800 dark:text-white">{data.status}</p>
                                </div>
                            )}
                            {data.isBlocked !== undefined && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</label>
                                    <p className={data.isBlocked ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                                        {data.isBlocked ? 'Blocked' : 'Active'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
