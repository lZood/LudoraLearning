"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        // Force scroll to top on page reload and initial mount
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []); // Only on mount

    useEffect(() => {
        // Optional: also scroll to top on path changes if needed
        // But for now, just the initial load as requested
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
