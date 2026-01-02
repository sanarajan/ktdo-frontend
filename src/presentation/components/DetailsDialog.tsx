import type { FC } from 'react';
import { type Driver } from '../../common/types';
import { ApprovalStatus } from '../../common/enums';
import { Button } from '../components/Button';

interface DetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    driver: Driver;
}

export const DetailsDialog: FC<DetailsDialogProps> = ({ isOpen, onClose, driver }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-2xl transform transition-all">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Driver Details</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Full Name</label>
                            <p className="font-medium text-gray-900 dark:text-gray-200">{driver.name}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Email</label>
                            <p className="font-medium text-gray-900 dark:text-gray-200">{driver.email}</p>
                        </div>
                        {/* License and vehicle fields removed */}
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Phone</label>
                            <p className="font-medium text-gray-900 dark:text-gray-200">{driver.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Address</label>
                            <p className="font-medium text-gray-900 dark:text-gray-200">{`${(driver as any).houseName || ''}${(driver as any).houseName && (driver as any).place ? ', ' : ''}${(driver as any).place || 'N/A'}`}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4 dark:border-gray-700">
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Status</span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${driver.status === ApprovalStatus.APPROVED ? 'bg-green-100 text-green-800' :
                                driver.status === ApprovalStatus.REJECTED ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {driver.status}
                            </span>
                        </div>
                        {driver.uniqueId && (
                            <div className="mt-2 text-center p-2 bg-brand/10 dark:bg-brand/20 rounded text-brand dark:text-brand-300 font-mono">
                                ID: {driver.uniqueId}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={onClose} variant="secondary">Close</Button>
                </div>
            </div>
        </div>
    );
};
