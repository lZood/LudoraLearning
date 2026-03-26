'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';

export interface HapticHandle {
  trigger: () => void;
}

/**
 * Reusable Haptic Trigger component that uses the iOS 'switch' trick
 * to trigger the Taptic Engine on iOS 17.4+ and Vibration API on Android.
 */
const HapticTrigger = forwardRef<HapticHandle>((_, ref) => {
  const switchRef = useRef<HTMLInputElement>(null);

  const trigger = () => {
    if (typeof window === 'undefined') return;

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

    if (isIOS && switchRef.current) {
      // Simulate a switch toggle for iOS Taptic Engine feedback
      switchRef.current.click();
    } else if ("vibrate" in navigator) {
      // Standard Android/PWA Vibration API
      navigator.vibrate(10);
    }
  };

  useImperativeHandle(ref, () => ({
    trigger
  }));

  return (
    <input
      type="checkbox"
      ref={switchRef}
      style={{
        position: 'absolute',
        opacity: 0,
        pointerEvents: 'none',
        width: 0,
        height: 0,
        zIndex: -1
      }}
      aria-hidden="true"
      tabIndex={-1}
      /* @ts-ignore - 'switch' is a new iOS specific attribute for Taptic feedback */
      switch="true"
    />
  );
});

HapticTrigger.displayName = 'HapticTrigger';

export default HapticTrigger;
