// Mapa nombre-de-icono (guardado en units.icon) -> componente lucide.
// Permite renderizar iconos desde datos de BD (strings) sin perder el set original.
import {
    Hand, Palette, Hash, Box, Activity, MapPin, User, Search, PlusCircle,
    MessageCircle, HelpCircle, Clock, Heart, ArrowRightLeft, Compass, ShoppingBag,
    History, AlertCircle, Info, Navigation, Calendar, MessageSquare, ShoppingBasket,
    BookOpen, Gamepad, CheckCircle, Lightbulb, FileText, Users, TrendingUp, Flag,
    Rocket, Brain, Zap, Star, Trophy, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
    Hand, Palette, Hash, Box, Activity, MapPin, User, Search, PlusCircle,
    MessageCircle, HelpCircle, Clock, Heart, ArrowRightLeft, Compass, ShoppingBag,
    History, AlertCircle, Info, Navigation, Calendar, MessageSquare, ShoppingBasket,
    BookOpen, Gamepad, CheckCircle, Lightbulb, FileText, Users, TrendingUp, Flag,
    Rocket, Brain, Zap, Star, Trophy,
};

export function iconFromName(name?: string | null): LucideIcon {
    return (name && ICONS[name]) || BookOpen;
}
