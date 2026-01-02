import { Dialog } from '@headlessui/react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ConfirmationDialog = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDangerous = false,
    onConfirm,
    onCancel,
    isLoading = false
}: ConfirmationDialogProps) => {
    return (
        <Dialog open={isOpen} onClose={onCancel} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            {isDangerous && (
                                <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400" />
                            )}
                            <Dialog.Title className="text-lg font-bold text-gray-800 dark:text-white">
                                {title}
                            </Dialog.Title>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-400">{message}</p>
                    </div>

                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            disabled={isLoading}
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={onConfirm}
                            className={`px-4 py-2 rounded-lg transition disabled:opacity-50 ${
                                isDangerous
                                    ? 'bg-red-600 text-white hover:bg-red-500'
                                    : 'bg-brand text-black hover:bg-brand-600'
                            }`}
                        >
                            {isLoading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
