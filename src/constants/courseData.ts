import { 
  Hand, 
  Palette, 
  Hash, 
  Box, 
  Activity, 
  MapPin, 
  User, 
  Search, 
  PlusCircle, 
  MessageCircle, 
  HelpCircle, 
  Clock, 
  Heart, 
  ArrowRightLeft, 
  Compass, 
  ShoppingBag, 
  History, 
  AlertCircle, 
  Info, 
  Navigation, 
  Calendar, 
  MessageSquare, 
  ShoppingBasket, 
  BookOpen, 
  Gamepad, 
  CheckCircle, 
  Lightbulb, 
  FileText, 
  Users, 
  TrendingUp, 
  Flag,
  Rocket,
  Brain,
  Zap,
  Star,
  Trophy
} from "lucide-react";

export interface Unit {
  id: string;
  title: string;
  icon: any;
  progress: number;
  isNew?: boolean;
}

export interface Level {
  id: string;
  title: string;
  subtitle: string;
  units: Unit[];
}

export const COURSE_DATA: Level[] = [
  {
    id: "level-1",
    title: "Nivel 1: Punto de partida",
    subtitle: "Da tus primeros pasos en el idioma con lo esencial.",
    units: [
      { id: "u1-1", title: "Bienvenido", icon: Hand, progress: 100 },
      { id: "u1-2", title: "Colores", icon: Palette, progress: 65 },
      { id: "u1-3", title: "Números", icon: Hash, progress: 0, isNew: true },
      { id: "u1-4", title: "Objetos", icon: Box, progress: 0 },
      { id: "u1-5", title: "Acciones", icon: Activity, progress: 0 },
      { id: "u1-6", title: "Ubicación", icon: MapPin, progress: 0 },
    ]
  },
  {
    id: "level-2",
    title: "Nivel 2: Entender y responder",
    subtitle: "Comienza a describir lo que te rodea y quién eres.",
    units: [
      { id: "u2-1", title: "Hablar de ti", icon: User, progress: 0 },
      { id: "u2-2", title: "Describir cosas", icon: Search, progress: 0 },
      { id: "u2-3", title: "Cantidades", icon: PlusCircle, progress: 0 },
      { id: "u2-4", title: "Acciones", icon: Activity, progress: 0 },
      { id: "u2-5", title: "Preguntas", icon: HelpCircle, progress: 0 },
      { id: "u2-6", title: "Pedir ayuda", icon: AlertCircle, progress: 0 },
    ]
  },
  {
    id: "level-3",
    title: "Nivel 3: Bases para comunicarte",
    subtitle: "Establece rutinas y expresa tus gustos personales.",
    units: [
      { id: "u3-1", title: "Rutinas", icon: Clock, progress: 0 },
      { id: "u3-2", title: "Gustos", icon: Heart, progress: 0 },
      { id: "u3-3", title: "Comparaciones", icon: ArrowRightLeft, progress: 0 },
      { id: "u3-4", title: "Direcciones", icon: Compass, progress: 0 },
      { id: "u3-5", title: "Compras", icon: ShoppingBag, progress: 0 },
      { id: "u3-6", title: "Pasado simple", icon: History, progress: 0 },
    ]
  },
  {
    id: "level-4",
    title: "Nivel 4: Conversaciones cotidianas",
    subtitle: "Resuelve problemas del día a día y haz planes.",
    units: [
      { id: "u4-1", title: "Problemas y soluciones", icon: Info, progress: 0 },
      { id: "u4-2", title: "Pedir información", icon: HelpCircle, progress: 0 },
      { id: "u4-3", title: "Dar direcciones", icon: Navigation, progress: 0 },
      { id: "u4-4", title: "Hablar del pasado", icon: History, progress: 0 },
      { id: "u4-5", title: "Hacer planes", icon: Calendar, progress: 0 },
      { id: "u4-6", title: "Expresar opiniones", icon: MessageSquare, progress: 0 },
    ]
  },
  {
    id: "level-5",
    title: "Nivel 5: Comunicación fluida básica",
    subtitle: "Mejora tu fluidez en situaciones interactivas.",
    units: [
      { id: "u5-1", title: "Resolver problemas cotidianos", icon: Lightbulb, progress: 0 },
      { id: "u5-2", title: "Compras y precios", icon: ShoppingBasket, progress: 0 },
      { id: "u5-3", title: "Describir experiencias pasadas", icon: BookOpen, progress: 0 },
      { id: "u5-4", title: "Direcciones y ubicaciones", icon: MapPin, progress: 0 },
      { id: "u5-5", title: "Gustos y preferencias", icon: Heart, progress: 0 },
      { id: "u5-6", title: "Juegos de construcción", icon: Gamepad, progress: 0 },
    ]
  },
  {
    id: "level-6",
    title: "Nivel 6: Comunicación independiente",
    subtitle: "Toma decisiones y gestiona situaciones complejas.",
    units: [
      { id: "u6-1", title: "Explicar situaciones", icon: FileText, progress: 0 },
      { id: "u6-2", title: "Tomar decisiones", icon: CheckCircle, progress: 0 },
      { id: "u6-3", title: "Contar historias", icon: BookOpen, progress: 0 },
      { id: "u6-4", title: "Trabajar en equipo", icon: Users, progress: 0 },
      { id: "u6-5", title: "Negociar", icon: TrendingUp, progress: 0 },
      { id: "u6-6", title: "Resolver problemas", icon: AlertCircle, progress: 0 },
    ]
  },
  {
    id: "level-7",
    title: "Nivel 7: Conversaciones con confianza",
    subtitle: "Narra experiencias detalladas y colabora con otros.",
    units: [
      { id: "u7-1", title: "Narrar experiencias y planes", icon: History, progress: 0 },
      { id: "u7-2", title: "Dar y pedir direcciones avanzadas", icon: Navigation, progress: 0 },
      { id: "u7-3", title: "Expresar opiniones y sugerencias", icon: MessageSquare, progress: 0 },
      { id: "u7-4", title: "Resolución de problemas", icon: Lightbulb, progress: 0 },
      { id: "u7-5", title: "Negociación y colaboración", icon: Users, progress: 0 },
      { id: "u7-6", title: "Revisión general y juegos", icon: Gamepad, progress: 0 },
    ]
  },
  {
    id: "level-8",
    title: "Nivel 8: Hablo con confianza",
    subtitle: "Domina el storytelling y misiones complejas.",
    units: [
      { id: "u8-1", title: "Narrar experiencias", icon: BookOpen, progress: 0 },
      { id: "u8-2", title: "Explicar ideas", icon: Lightbulb, progress: 0 },
      { id: "u8-3", title: "Discutir opciones", icon: CheckCircle, progress: 0 },
      { id: "u8-4", title: "Persuadir", icon: TrendingUp, progress: 0 },
      { id: "u8-5", title: "Storytelling", icon: Flag, progress: 0 },
      { id: "u8-6", title: "Misiones complejas", icon: Rocket, progress: 0 },
    ]
  }
];
