import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalMembers: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

const getPageNumbers = (currentPage: number, totalPages: number) => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
};

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalMembers,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalMembers)} of {totalMembers} members
                </div>
                <select
                    value={itemsPerPage}
                    onChange={(e) => {
                        onItemsPerPageChange(Number(e.target.value));
                    }}
                    className="text-xs sm:text-sm border-gray-300 rounded-md shadow-sm focus:border-brand focus:ring-brand dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-1"
                >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                </select>
            </div>

            {totalPages > 1 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto justify-center">
                    <button
                        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                    >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                    </button>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        {getPageNumbers(currentPage, totalPages).map((page, index) => (
                            typeof page === 'number' ? (
                                <button
                                    key={index}
                                    onClick={() => onPageChange(page)}
                                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm font-medium ${currentPage === page
                                        ? 'bg-brand text-black shadow-sm'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={index} className="px-1 py-1 sm:py-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                    ...
                                </span>
                            )
                        ))}
                    </div>
                    <button
                        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
