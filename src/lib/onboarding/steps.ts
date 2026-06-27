// Configuración declarativa del tour de onboarding (product tour tipo spotlight).
// Cada paso navega a una ruta real del dashboard y resalta un elemento [data-tour="anchor"].
// El paso de bienvenida usa anchor=null => tarjeta centrada sin recorte.

export type TourPlacement = 'auto' | 'top' | 'bottom' | 'left' | 'right';

export interface OnboardingStep {
  id: string;
  /** Ruta absoluta del dashboard donde vive el ancla. */
  route: string;
  /** Valor de data-tour del elemento a resaltar; null => tarjeta centrada. */
  anchor: string | null;
  emoji?: string;
  title: string;
  body: string;
  /** Colocación preferida del tooltip respecto al ancla (default 'auto'). */
  placement?: TourPlacement;
  /** Radio del recorte (px), idealmente similar al del elemento. */
  radius?: number;
  /** Padding del recorte alrededor del elemento (px). */
  padding?: number;
  /** Si el ancla no aparece en el timeout, saltar el paso (default true). */
  optional?: boolean;
}

export const ONBOARDING_HOME = '/portal-alumno/dashboard';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'bienvenida',
    route: ONBOARDING_HOME,
    anchor: null,
    emoji: '👋',
    title: '¡Bienvenido a Ludora!',
    body: 'En 30 segundos te muestro dónde está todo para que no te pierdas. ¿List@?',
  },
  {
    id: 'reunion',
    route: `${ONBOARDING_HOME}/calendario`,
    anchor: 'reunion',
    emoji: '🎙️',
    title: 'Tu primera reunión',
    body: 'Aquí agendas tus clases en vivo con tus Monedas Ludora (hasta 4 al mes). ¡Tu maestro te espera!',
    radius: 32,
  },
  {
    id: 'ruta',
    route: `${ONBOARDING_HOME}/cursos`,
    anchor: 'ruta',
    emoji: '🗺️',
    title: 'Tu ruta de aprendizaje',
    body: 'Este es tu mapa de niveles y unidades. Completa unidades para ganar XP y monedas.',
    placement: 'bottom',
  },
  {
    id: 'progreso',
    route: `${ONBOARDING_HOME}/reporte`,
    anchor: 'progreso',
    emoji: '📈',
    title: 'Tu progreso',
    body: 'Aquí ves tu nivel, racha, XP y unidades completadas, con recomendaciones para ti.',
  },
  {
    id: 'liga',
    route: `${ONBOARDING_HOME}/leaderboards`,
    anchor: 'liga',
    emoji: '🏆',
    title: 'La Liga semanal',
    body: 'Compite, sube de liga y aporta al Cofre de la Aldea para ganar recompensas.',
  },
  {
    id: 'tienda',
    route: `${ONBOARDING_HOME}/tienda`,
    anchor: 'tienda',
    emoji: '🛍️',
    title: 'La Tienda',
    body: 'Cambia tus Monedas por marcos, títulos y skins para personalizar tu perfil.',
    radius: 28,
  },
  {
    id: 'materiales',
    route: `${ONBOARDING_HOME}/materiales`,
    anchor: 'materiales',
    emoji: '📚',
    title: 'Materiales',
    body: 'Tu biblioteca de práctica: pronunciación, listening, gramática y más.',
  },
  {
    id: 'cierre',
    route: ONBOARDING_HOME,
    anchor: 'continuar',
    emoji: '🚀',
    title: '¡List@!',
    body: 'Empieza tu primera lección desde aquí. Siempre puedes volver a ver esta guía desde tu perfil.',
    placement: 'top',
  },
];
