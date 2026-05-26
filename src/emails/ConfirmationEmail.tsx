import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface ConfirmationEmailProps {
    token?: string;
    confirmationUrl?: string;
    email?: string;
}

// Los defaults son los placeholders de GoTrue. La API route los pasa tal cual,
// así que cuando esto se renderiza a HTML quedan literales en el output:
//   {{ .Token }}, {{ .ConfirmationURL }}, {{ .Email }}
// GoTrue los sustituye al momento de enviar el correo.
export default function ConfirmationEmail({
    token = '{{ .Token }}',
    confirmationUrl = '{{ .ConfirmationURL }}',
    email = '{{ .Email }}',
}: ConfirmationEmailProps) {
    return (
        <Html lang="es">
            <Head />
            <Preview>Confirma tu correo para empezar tu aventura en Ludora</Preview>
            <Body style={body}>
                <Container style={card}>
                    {/* Badge / logo */}
                    <Section style={{ textAlign: 'center', padding: '40px 32px 8px' }}>
                        <span style={badge}>Ludora Learning</span>
                    </Section>

                    {/* Titular */}
                    <Section style={{ textAlign: 'center', padding: '0 40px' }}>
                        <Heading as="h1" style={headingStyle}>
                            ¡Bienvenido, aventurero!
                        </Heading>
                        <Text style={subText}>
                            Estás a un paso de comenzar tu viaje con Ludora.
                            Confirma tu correo para activar tu cuenta.
                        </Text>
                    </Section>

                    {/* CTA principal */}
                    <Section style={{ textAlign: 'center', padding: '32px 40px 16px' }}>
                        <Button href={confirmationUrl} style={ctaButton}>
                            Confirmar mi correo
                        </Button>
                    </Section>

                    {/* Separador "O usa este código" */}
                    <Section style={{ padding: '0 40px' }}>
                        <Hr style={hr} />
                        <Text style={dividerText}>O usa este código</Text>
                    </Section>

                    {/* OTP */}
                    <Section style={{ textAlign: 'center', padding: '0 40px 32px' }}>
                        <div style={otpBox}>
                            <Text style={otpCode}>{token}</Text>
                        </div>
                        <Text style={tinyText}>
                            Pégalo en la pantalla de verificación. Expira en 60 minutos.
                        </Text>
                    </Section>

                    {/* Aviso de seguridad */}
                    <Section style={disclaimer}>
                        <Text style={disclaimerText}>
                            Si no creaste una cuenta en Ludora, puedes ignorar este correo.
                            Nadie podrá acceder sin completar este paso.
                        </Text>
                    </Section>
                </Container>

                {/* Pie de firma */}
                <Container style={{ maxWidth: 520, marginTop: 24, textAlign: 'center' as const }}>
                    <Text style={signature}>
                        Ludora Learning · Aprende inglés jugando
                        <br />
                        Este correo fue enviado a {email}
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

// ─── Estilos (inline, todo escala bien en email clients) ───────────────────────

const body: React.CSSProperties = {
    margin: 0,
    padding: '40px 16px',
    backgroundColor: '#f5f1e4',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: '#1a1a1a',
};

const card: React.CSSProperties = {
    maxWidth: 520,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(15, 84, 81, 0.08)',
};

const badge: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#1a1a1a',
    color: '#88e04f',
    fontWeight: 900,
    fontSize: 14,
    letterSpacing: 2,
    padding: '8px 16px',
    borderRadius: 999,
    textTransform: 'uppercase',
};

const headingStyle: React.CSSProperties = {
    margin: '8px 0 0',
    fontSize: 28,
    fontWeight: 900,
    color: '#1a1a1a',
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
};

const subText: React.CSSProperties = {
    margin: '16px 0 0',
    fontSize: 15,
    color: '#5a5a5a',
    lineHeight: 1.6,
};

const ctaButton: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#88e04f',
    color: '#1a1a1a',
    fontWeight: 900,
    fontSize: 16,
    textDecoration: 'none',
    padding: '16px 40px',
    borderRadius: 999,
    boxShadow: '0 4px 12px rgba(136, 224, 79, 0.35)',
};

const hr: React.CSSProperties = {
    borderTop: '1px solid #eeeae0',
    margin: '24px 0 12px',
};

const dividerText: React.CSSProperties = {
    margin: 0,
    fontSize: 11,
    color: '#9a9a9a',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 700,
    textAlign: 'center' as const,
};

const otpBox: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#f5f1e4',
    border: '2px dashed #1a1a1a',
    borderRadius: 16,
    padding: '20px 32px',
};

const otpCode: React.CSSProperties = {
    margin: 0,
    fontSize: 32,
    fontWeight: 900,
    letterSpacing: 8,
    color: '#0F5451',
    fontFamily: "'Courier New', monospace",
};

const tinyText: React.CSSProperties = {
    margin: '12px 0 0',
    fontSize: 13,
    color: '#7a7a7a',
    textAlign: 'center' as const,
};

const disclaimer: React.CSSProperties = {
    backgroundColor: '#fafaf6',
    borderTop: '1px solid #eeeae0',
    padding: '24px 40px 32px',
    textAlign: 'center' as const,
};

const disclaimerText: React.CSSProperties = {
    margin: 0,
    fontSize: 12,
    color: '#7a7a7a',
    lineHeight: 1.6,
};

const signature: React.CSSProperties = {
    margin: 0,
    fontSize: 11,
    color: '#9a9a9a',
    lineHeight: 1.6,
};
