import type { SVGProps } from 'react';

interface BrandLogoProps extends SVGProps<SVGSVGElement> {
    showWordmark?: boolean;
}

export function BrandLogo({ showWordmark = true, className = '', ...props }: BrandLogoProps) {
    return (
        <span className={`inline-flex items-center gap-3 ${className}`}>
            <svg
                aria-hidden="true"
                viewBox="0 0 44 44"
                fill="none"
                className="h-10 w-10 shrink-0"
                {...props}
            >
                <path d="M8 21.5h28l-2.4 9.1a4 4 0 0 1-3.9 3H14.3a4 4 0 0 1-3.9-3L8 21.5Z" fill="currentColor" opacity=".16" />
                <path d="M8 21.5h28l-2.4 9.1a4 4 0 0 1-3.9 3H14.3a4 4 0 0 1-3.9-3L8 21.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M11 21.5c.8-3.3 3.1-5 5.2-5 1.9 0 2.7 1.2 3.8 1.2s1.9-1.2 3.8-1.2c2.1 0 4.4 1.7 5.2 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M14 13.5c1.5-2.5 3-2.5 4.5 0M23 13.5c1.5-2.5 3-2.5 4.5 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            {showWordmark && <span className="text-lg font-bold tracking-[-0.04em]">RiceBowl</span>}
        </span>
    );
}
