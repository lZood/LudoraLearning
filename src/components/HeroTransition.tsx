import React from "react";

interface HeroTransitionProps {
    showShadow?: boolean;
    transitionColor?: string;
}

export default function HeroTransition({ showShadow = true, transitionColor = "#f5f1e4" }: HeroTransitionProps) {
    return (
        <div
            className="relative w-full h-[50px] rounded-t-[50px] z-20 pointer-events-none"
            style={{
                backgroundColor: transitionColor,
                marginTop: "-50px",
                boxShadow: showShadow ? "0 -20px 50px rgba(0,0,0,0.1)" : "none"
            }}
        />
    );
}
