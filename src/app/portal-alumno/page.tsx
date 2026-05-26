'use client';
import React, { useEffect, useState } from 'react';
import LoginForm from '@/components/portal-alumno/auth/LoginForm';
import RegisterForm from '@/components/portal-alumno/auth/RegisterForm';
import AuthLayout from '@/components/portal-alumno/auth/AuthLayout';
import EmailVerificationView from '@/components/portal-alumno/auth/EmailVerificationView';
import { motion, AnimatePresence } from 'framer-motion';

export default function PortalAlumnoPage() {
    // Mode can be 'login', 'register', or 'verification'
    const [mode, setMode] = useState<'login' | 'register' | 'verification'>('login');

    // ?mode=register abre el formulario de registro (lo usan los CTA de pricing).
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'register') {
            setMode('register');
        }
    }, []);
    const [userEmail, setUserEmail] = useState('');
    // Password vive solo en memoria del cliente durante el flujo de registro,
    // para poder pedir el reenvío del correo de confirmación. Se descarta
    // cuando el usuario sale del modo "verification".
    const [userPassword, setUserPassword] = useState('');

    const handleRegisterSuccess = (email: string, password: string) => {
        setUserEmail(email);
        setUserPassword(password);
        setMode('verification');
    };

    const handleCloseVerification = () => {
        setUserPassword('');
        setMode('login');
    };

    return (
        <AuthLayout
            // Los tres modos traen su propio título centrado, así que el AuthLayout queda en modo "centrado sin imagen".
            title=""
            subtitle=""
        >
            <div className="relative w-full">
                <AnimatePresence mode="wait">
                    {mode === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <LoginForm onSwitch={() => setMode('register')} />
                        </motion.div>
                    )}

                    {mode === 'register' && (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <RegisterForm 
                                onSwitch={() => setMode('login')} 
                                onSuccess={handleRegisterSuccess}
                            />
                        </motion.div>
                    )}

                    {mode === 'verification' && (
                        <motion.div
                            key="verification"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 bg-white lg:static lg:bg-transparent p-6 pb-12 lg:p-0 rounded-t-[40px] lg:rounded-none z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none"
                        >
                            <EmailVerificationView
                                email={userEmail}
                                password={userPassword}
                                onClose={handleCloseVerification}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Overlay for Verification */}
                {mode === 'verification' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                        onClick={handleCloseVerification}
                    />
                )}
            </div>
        </AuthLayout>
    );
}
