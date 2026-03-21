import { QuestionLevel, QuestionCategory } from './questions';

const LEVEL_PROGRESSION: QuestionLevel[] = ['Pre-A1', 'A1', 'A1-alto', 'A2', 'A2-alto', 'B1'];

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
}

const ACHIEVEMENT_DB: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (levels: Record<QuestionCategory, QuestionLevel>) => boolean;
}> = [
    {
        id: 'base_structures',
        title: 'Estructuras Base Dominadas',
        description: 'Has sentado las bases del idioma con éxito.',
        icon: '★',
        condition: (levels) => levels['Gramática y Vocabulario'] !== 'Pre-A1'
    },
    {
        id: 'instruction_master',
        title: 'Comprensión de Instrucciones',
        description: 'Capacidad para seguir directrices complejas.',
        icon: '★',
        condition: (levels) => levels['Comprensión Auditiva'] !== 'Pre-A1'
    },
    {
        id: 'visual_explorer',
        title: 'Explorador de Mapas',
        description: 'Excelente identificación de patrones visuales.',
        icon: '★',
        condition: (levels) => LEVEL_PROGRESSION.indexOf(levels['Identificación Visual']) >= 2
    },
    {
        id: 'legend_scribe',
        title: 'Escriba de Libros y Plumas',
        description: 'Tu escritura empieza a contar grandes historias.',
        icon: '★',
        condition: (levels) => LEVEL_PROGRESSION.indexOf(levels['Producción Escrita']) >= 3
    },
    {
        id: 'eloquent_bard',
        title: 'Bardo de la Aldea',
        description: 'Tu voz resuena con claridad y propósito en el Overworld.',
        icon: '★',
        condition: (levels) => LEVEL_PROGRESSION.indexOf(levels['Producción Oral']) >= 3
    },
    {
        id: 'grammar_master',
        title: 'Maestro de Encantamientos',
        description: 'Dominio avanzado de las reglas rúnicas del lenguaje.',
        icon: '★',
        condition: (levels) => levels['Gramática y Vocabulario'] === 'B1'
    },
    {
        id: 'hawk_ear',
        title: 'Oído de Gato Relevador',
        description: 'No se te escapa ni un susurro de los creepers.',
        icon: '★',
        condition: (levels) => levels['Comprensión Auditiva'] === 'B1'
    },
    {
        id: 'redstone_engineer',
        title: 'Ingeniero de Redstone',
        description: 'Lógica impecable en la estructura de tus oraciones.',
        icon: '★',
        condition: (levels) => LEVEL_PROGRESSION.indexOf(levels['Gramática y Vocabulario']) >= 4
    },
    {
        id: 'polyglot_scout',
        title: 'Explorador del End',
        description: 'Versatilidad legendaria en múltiples áreas del lenguaje.',
        icon: '★',
        condition: (levels) => {
            const totalIndex = Object.values(levels).reduce((acc, lvl) => acc + LEVEL_PROGRESSION.indexOf(lvl), 0);
            const averageIndex = totalIndex / Object.keys(levels).length;
            return averageIndex >= 4; // B1/A2-alto average
        }
    },
    {
        id: 'steve_apprentice',
        title: 'Aprendiz de Steve',
        description: 'Estás dando tus primeros pasos con valentía.',
        icon: '★',
        condition: (levels) => Object.values(levels).every(lvl => lvl === 'Pre-A1' || lvl === 'A1')
    }
];

export function getTopAchievements(categoryLevels: Record<QuestionCategory, QuestionLevel>): Achievement[] {
    const earned = ACHIEVEMENT_DB.filter(a => a.condition(categoryLevels));
    
    // Sort logic: those with more complex conditions (e.g. B1 before A1) should be prioritized
    // For simplicity, we'll just pick those that meet higher levels first, or just the last two earned.
    
    // Let's just return the last 2 from the earned list (usually the more "advanced" ones based on the order in DB)
    return earned.slice(-2).map(({ id, title, description, icon }) => ({ id, title, description, icon }));
}
