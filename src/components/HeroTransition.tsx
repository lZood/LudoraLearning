import React from "react";

interface HeroTransitionProps {
    showShadow?: boolean;
}

export default function HeroTransition({ showShadow = true }: HeroTransitionProps) {
    return (
        <div
            className="relative w-full h-[50px] bg-[#f5f1e4] rounded-t-[50px] z-20 pointer-events-none"
            style={{
                marginTop: "-50px",
                boxShadow: showShadow ? "0 -20px 50px rgba(0,0,0,0.1)" : "none"
            }}
        />
    );
}
