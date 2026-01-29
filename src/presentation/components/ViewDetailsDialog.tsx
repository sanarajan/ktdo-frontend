import { Dialog } from '@headlessui/react';
import {
    FaTimes,
    FaExclamationTriangle,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaTint,
    FaMapMarkerAlt,
    FaIdCard,
    FaPrint,
    FaCheck,
    FaTrash,
    FaInfoCircle
} from 'react-icons/fa';
import { UserRole } from '../../common/enums';

interface ViewDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
    title: string;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onPrintId?: (data: any) => void;
    onDelete?: (id: string) => void;
    actionLoading?: boolean;
}

export const ViewDetailsDialog = ({ isOpen, onClose, data, title, onApprove, onReject, onPrintId, onDelete, actionLoading }: ViewDetailsDialogProps) => {
    if (!data) return null;
    const getStatusStyles = () => {
        if (data.isBlocked) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        if (data.status === 'APPROVED') return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        if (data.status === 'PENDING') return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    };
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* Soft Backdrop */}
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 max-h-[90vh]">

                    {/* Header: Clean & Minimal */}
                    <div className="flex justify-between items-center px-8 py-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                                <FaIdCard size={24} />
                            </div>
                            <div>
                                <Dialog.Title className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {title}
                                </Dialog.Title>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Overview</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50">

                        {/* Status Alert Banner */}
                        {data.status === 'REJECTED' && (
                            <div className="mx-8 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-4">
                                <div className="mt-1 p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
                                    <FaExclamationTriangle size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-red-800 dark:text-red-300">Application Rejected</p>
                                    {data.rejectionReason && (
                                        <p className="text-sm text-red-700/80 dark:text-red-400/80 italic mt-1">
                                            Reason: {data.rejectionReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Left Side: Profile Card */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    {data.photoUrl ? (
                                        <img
                                            src={data.photoUrl}
                                            alt={data.name}
                                            className="w-full aspect-[3/4] rounded-2xl object-cover shadow-inner mb-0"
                                        />
                                    ) : (
                                        <div className="w-full aspect-[3/4] rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-4">
                                            <FaUser size={48} />
                                        </div>
                                    )}
                                    <div className={`px-4 py-1 rounded-full text-[10px] text-center font-black uppercase tracking-widest shadow-sm ${getStatusStyles()}`}>
                                        {data.isBlocked ? 'Blocked' : data.status || 'Active'}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{data.name}</h4>
                                    </div>
                                </div>

                                {/* Mini Quick Info */}
                                <div className="bg-brand/5 dark:bg-brand/10 p-4 rounded-2xl space-y-3 border border-brand/10">
                                    <QuickInfo label="System Status" value={data.isBlocked ? 'Blocked' : 'Active'} color={data.isBlocked ? 'text-red-600' : 'text-green-600'} />
                                    <QuickInfo label="Role" value={data.role} />
                                    {data.uniqueId && <QuickInfo label="Member ID" value={data.uniqueId} isMono />}
                                </div>
                            </div>

                            {/* Right Side: Detailed Info Sections */}
                            <div className="lg:col-span-8 space-y-8">

                                {/* Section 1: Contact */}
                                <div className="space-y-4">
                                    <SectionHeader icon={<FaInfoCircle />} title="Personal Details" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <InfoBlock label="Phone Number" value={data.phone} icon={<FaPhone />} />
                                        {data.role === UserRole.MEMBER && data.bloodGroup && (
                                            <InfoBlock label="Blood Group" value={data.bloodGroup} icon={<FaTint className="text-red-500" />} />
                                        )}
                                        <InfoBlock label="Email" value={data.email} icon={<FaEnvelope />} />
                                        {data.role === UserRole.MEMBER && data.licenceNumber && (
                                            <InfoBlock label="Licence Number" value={data.licenceNumber} icon={<FaIdCard />} />
                                        )}
                                        {data.role === UserRole.MEMBER && data.status && (
                                            <InfoBlock label="Approval" value={data.status} />
                                        )}
                                    </div>
                                </div>

                                {/* Section 2: Address */}
                                <div className="space-y-4">
                                    <SectionHeader icon={<FaMapMarkerAlt />} title="Location" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        {(data.houseName || data.place) && (
                                            <div className="sm:col-span-2">
                                                <InfoBlock
                                                    label="Full Address"
                                                    value={`${data.houseName || ''}${data.houseName && data.place ? ', ' : ''}${data.place || ''}`}
                                                />
                                            </div>
                                        )}
                                        <InfoBlock label="District" value={data.district} />
                                        <InfoBlock label="State" value={data.state} />
                                        {data.role === UserRole.MEMBER && (
                                            <>
                                                <InfoBlock label="Pincode" value={data.pin} />
                                                <InfoBlock label="RTO Code" value={data.stateRtoCode} />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Admin Data */}
                                {data.role === UserRole.MEMBER && (
                                    <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-2xl">
                                        <InfoBlock label="Total Prints" value={data.printCount} />
                                        <InfoBlock label="Recorded By" value={data.createdBy} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions: Retaining exact logic from your working code */}
                    <div className="px-8 py-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-end gap-3 flex-shrink-0">

                        {/* Logic: PENDING Status */}
                        {data.status === 'PENDING' && onApprove && onReject && (
                            <>
                                <button
                                    disabled={actionLoading}
                                    onClick={() => onApprove(data._id || data.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm transition-all shadow-lg ${actionLoading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-500 shadow-green-200 dark:shadow-none'
                                        }`}
                                >
                                    <FaCheck /> {actionLoading ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                    disabled={actionLoading}
                                    onClick={() => onReject(data._id || data.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm transition-all shadow-lg ${actionLoading ? 'bg-red-300' : 'bg-red-600 hover:bg-red-500 shadow-red-200 dark:shadow-none'
                                        }`}
                                >
                                    <FaTimes /> {actionLoading ? 'Rejecting...' : 'Reject'}
                                </button>
                            </>
                        )}

                        {/* Logic: REJECTED Status */}
                        {data.status === 'REJECTED' && onApprove && (
                            <button
                                disabled={actionLoading}
                                onClick={() => onApprove(data._id || data.id)}
                                className={`px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all shadow-lg ${actionLoading ? 'bg-green-300' : 'bg-green-600 hover:bg-green-500 shadow-green-200 dark:shadow-none'
                                    }`}
                            >
                                {actionLoading ? 'Approving...' : 'Approve Now'}
                            </button>
                        )}

                        {/* Logic: APPROVED Status (Print) */}
                        {data.status === 'APPROVED' && !data.isBlocked && onPrintId && (
                            <button
                                onClick={() => onPrintId(data)}
                                className={
                                    (!data.photoUrl || data.photoUrl === 'null' || data.photoUrl === 'undefined' || data.photoUrl === '')
                                        ? "flex items-center gap-2 px-6 py-3 font-black rounded-2xl transition-all shadow-lg shadow-brand/20 text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                        : "flex items-center gap-2 px-6 py-3 font-black rounded-2xl transition-all shadow-lg shadow-brand/20 text-sm bg-brand text-black hover:bg-brand-400"
                                }
                            >
                                <FaPrint className={(!data.photoUrl || data.photoUrl === 'null' || data.photoUrl === 'undefined' || data.photoUrl === '') ? "text-red-500" : ""} />
                                {data.printCount && data.printCount > 0 ? 'Reprint Card' : 'Print ID Card'}
                            </button>
                        )}

                        {/* Logic: DELETE */}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(data._id || data.id)}
                                className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 rounded-2xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all"
                            >
                                <FaTrash size={12} /> Delete
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                        >
                            Close
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

/* --- Visual Helper Components (No logic, just styles) --- */

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="flex items-center gap-2 text-brand">
        <span className="text-sm">{icon}</span>
        <h3 className="text-xs font-black uppercase tracking-[0.15em]">{title}</h3>
    </div>
);

const InfoBlock = ({ label, value, icon }: { label: string, value: any, icon?: React.ReactNode }) => (
    <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
            {icon && <span className="opacity-50">{icon}</span>} {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value || '—'}</p>
    </div>
);

const QuickInfo = ({ label, value, color, isMono }: { label: string, value: any, color?: string, isMono?: boolean }) => (
    <div className="flex justify-between items-center text-[11px]">
        <span className="font-bold text-gray-400 uppercase tracking-tight">{label}</span>
        <span className={`font-black ${color || 'text-brand'} ${isMono ? 'font-mono' : ''}`}>{value || 'N/A'}</span>
    </div>
);