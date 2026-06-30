// Biblia de tematización Minecraft — ESTRUCTURAS (capa de datos pura).
// Mapea una unidad (`units`) a una "estructura" construible del mundo
// (casa/granja/mina/pozo/torre/faro/mercado/portal), derivando de su `icon`
// (nombre lucide, ver src/lib/unitIcons.ts) y, como respaldo, de su `title`.
// Sin cambios de DB. Ver §2 y §5.1 del master plan.

// Clave estable de la estructura (identidad propia).
export type StructureKey =
    | 'casa'
    | 'granja'
    | 'mina'
    | 'pozo'
    | 'torre'
    | 'faro'
    | 'mercado'
    | 'portal';

export interface Structure {
    key: StructureKey;
    label: string; // nombre visible (UI): "Construye la Granja"
}

const STRUCTURES: Record<StructureKey, Structure> = {
    casa: { key: 'casa', label: 'Casa' },
    granja: { key: 'granja', label: 'Granja' },
    mina: { key: 'mina', label: 'Mina' },
    pozo: { key: 'pozo', label: 'Pozo' },
    torre: { key: 'torre', label: 'Torre' },
    faro: { key: 'faro', label: 'Faro' },
    mercado: { key: 'mercado', label: 'Mercado' },
    portal: { key: 'portal', label: 'Portal' },
};

// Nombre de icono lucide (units.icon) -> estructura. Cubre el set de unitIcons.ts.
const ICON_TO_STRUCTURE: Record<string, StructureKey> = {
    Hand: 'casa',
    Palette: 'casa',
    Hash: 'mina',
    Box: 'casa',
    Activity: 'granja',
    MapPin: 'faro',
    User: 'casa',
    Search: 'mina',
    PlusCircle: 'granja',
    MessageCircle: 'mercado',
    HelpCircle: 'pozo',
    Clock: 'torre',
    Heart: 'casa',
    ArrowRightLeft: 'mercado',
    Compass: 'faro',
    ShoppingBag: 'mercado',
    History: 'torre',
    AlertCircle: 'torre',
    Info: 'pozo',
    Navigation: 'faro',
    Calendar: 'torre',
    MessageSquare: 'mercado',
    ShoppingBasket: 'mercado',
    BookOpen: 'pozo',
    Gamepad: 'casa',
    CheckCircle: 'granja',
    Lightbulb: 'torre',
    FileText: 'pozo',
    Users: 'mercado',
    TrendingUp: 'torre',
    Flag: 'faro',
    Rocket: 'portal',
    Brain: 'pozo',
    Zap: 'mina',
    Star: 'faro',
    Trophy: 'portal',
    // Alias de nombres lucide nuevos (units.icon usa el set moderno).
    CirclePlus: 'granja',
    CircleQuestionMark: 'pozo',
    CircleHelp: 'pozo',
    CircleAlert: 'torre',
    CircleCheck: 'granja',
    MessageCircleQuestion: 'mercado',
    MessagesSquare: 'mercado',
    Map: 'faro',
    MapPinned: 'faro',
};

// Palabras clave del título (respaldo cuando el icono no es concluyente).
const TITLE_KEYWORDS: Array<[RegExp, StructureKey]> = [
    [/granj|farm|cosech|comida|food|animal/i, 'granja'],
    [/mina|mine|cueva|cave|mineral|excav/i, 'mina'],
    [/pozo|well|agua|water|fuente/i, 'pozo'],
    [/torre|tower|reloj|tiempo|time/i, 'torre'],
    [/faro|light|guía|guia|mapa|map|brúj|bruj|navega/i, 'faro'],
    [/mercad|market|tienda|shop|trade|compra|vend|negoci/i, 'mercado'],
    [/portal|nether|jefe|boss|drag/i, 'portal'],
    [/casa|house|home|hogar|saludo|hola|hello/i, 'casa'],
];

// Resuelve la estructura de una unidad a partir de su icono y/o título.
// `icon` tiene prioridad (es dato estable); el título refina o sirve de respaldo.
export function structureFor(args: { icon?: string | null; title?: string | null }): Structure {
    const { icon, title } = args;
    if (icon && ICON_TO_STRUCTURE[icon]) return STRUCTURES[ICON_TO_STRUCTURE[icon]];
    if (title) {
        for (const [re, key] of TITLE_KEYWORDS) {
            if (re.test(title)) return STRUCTURES[key];
        }
    }
    // Respaldo seguro: la casa es la estructura "base" del mundo.
    return STRUCTURES.casa;
}
