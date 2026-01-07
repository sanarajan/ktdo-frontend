import clsx from 'clsx';
import type { ReactNode } from 'react';

export type BreadcrumbItem = {
    label: ReactNode;
    href?: string;
    onClick?: () => void;
};

export const Breadcrumbs = ({ items, className }: { items: BreadcrumbItem[]; className?: string }) => {
    return (
        <nav aria-label="Breadcrumb" className={clsx("w-full", className)}>
            <div className="flex items-center gap-2 text-sm text-gray-400 overflow-x-auto whitespace-nowrap py-1">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {index > 0 && <span className="text-gray-600">/</span>}
                        {item.href ? (
                            <a
                                href={item.href}
                                onClick={item.onClick}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                {item.label}
                            </a>
                        ) : (
                            <span className="text-gray-200 font-medium">{item.label}</span>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
};
