// Dataset del Phonetic Chart (inglés americano / General American), ~41 fonemas.
// Cada fonema: símbolo IPA, categoría, palabra clave (keyword) que lo ejemplifica,
// la parte de la keyword que suena (highlight) y 2-3 palabras de ejemplo.

export type PhCategory = 'vowel_short' | 'vowel_long' | 'diphthong' | 'consonant_voiceless' | 'consonant_voiced';

export interface Phoneme {
    ipa: string;              // símbolo (sin barras), ej. "iː"
    category: PhCategory;
    keyword: string;          // palabra que ejemplifica el sonido
    keywordHighlight?: string;// la parte de la keyword que suena (ej. "ee" en sheep)
    examples: string[];
}

export const PHONEMES: Phoneme[] = [
    { ipa: 'ɪ', category: 'vowel_short', keyword: 'ship', keywordHighlight: 'i', examples: ['bit', 'fish', 'kit'] },
    { ipa: 'ɛ', category: 'vowel_short', keyword: 'bed', keywordHighlight: 'e', examples: ['head', 'pen', 'dress'] },
    { ipa: 'æ', category: 'vowel_short', keyword: 'cat', keywordHighlight: 'a', examples: ['bat', 'trap', 'man'] },
    { ipa: 'ʌ', category: 'vowel_short', keyword: 'cup', keywordHighlight: 'u', examples: ['but', 'jump', 'love'] },
    { ipa: 'ʊ', category: 'vowel_short', keyword: 'foot', keywordHighlight: 'oo', examples: ['book', 'put', 'good'] },
    { ipa: 'ə', category: 'vowel_short', keyword: 'about', keywordHighlight: 'a', examples: ['sofa', 'banana', 'comma'] },
    { ipa: 'ɚ', category: 'vowel_short', keyword: 'letter', keywordHighlight: 'er', examples: ['teacher', 'doctor', 'butter'] },

    { ipa: 'iː', category: 'vowel_long', keyword: 'sheep', keywordHighlight: 'ee', examples: ['see', 'key', 'machine'] },
    { ipa: 'uː', category: 'vowel_long', keyword: 'goose', keywordHighlight: 'oo', examples: ['blue', 'who', 'food'] },
    { ipa: 'ɔː', category: 'vowel_long', keyword: 'thought', keywordHighlight: 'ough', examples: ['law', 'dawn', 'bought'] },
    { ipa: 'ɑː', category: 'vowel_long', keyword: 'father', keywordHighlight: 'a', examples: ['spa', 'palm', 'car'] },
    { ipa: 'ɝ', category: 'vowel_long', keyword: 'nurse', keywordHighlight: 'ur', examples: ['bird', 'work', 'learn'] },

    { ipa: 'eɪ', category: 'diphthong', keyword: 'face', keywordHighlight: 'a', examples: ['say', 'day', 'rain'] },
    { ipa: 'aɪ', category: 'diphthong', keyword: 'price', keywordHighlight: 'i', examples: ['time', 'my', 'light'] },
    { ipa: 'ɔɪ', category: 'diphthong', keyword: 'boy', keywordHighlight: 'oy', examples: ['coin', 'toy', 'voice'] },
    { ipa: 'oʊ', category: 'diphthong', keyword: 'goat', keywordHighlight: 'oa', examples: ['go', 'no', 'show'] },
    { ipa: 'aʊ', category: 'diphthong', keyword: 'mouth', keywordHighlight: 'ou', examples: ['now', 'cow', 'house'] },

    { ipa: 'p', category: 'consonant_voiceless', keyword: 'pen', keywordHighlight: 'p', examples: ['spin', 'top', 'happy'] },
    { ipa: 't', category: 'consonant_voiceless', keyword: 'tea', keywordHighlight: 't', examples: ['stop', 'cat', 'water'] },
    { ipa: 'k', category: 'consonant_voiceless', keyword: 'key', keywordHighlight: 'k', examples: ['cat', 'back', 'school'] },
    { ipa: 'f', category: 'consonant_voiceless', keyword: 'fish', keywordHighlight: 'f', examples: ['five', 'off', 'phone'] },
    { ipa: 'θ', category: 'consonant_voiceless', keyword: 'think', keywordHighlight: 'th', examples: ['thumb', 'bath', 'math'] },
    { ipa: 's', category: 'consonant_voiceless', keyword: 'snake', keywordHighlight: 's', examples: ['see', 'kiss', 'city'] },
    { ipa: 'ʃ', category: 'consonant_voiceless', keyword: 'ship', keywordHighlight: 'sh', examples: ['shoe', 'wash', 'nation'] },
    { ipa: 'tʃ', category: 'consonant_voiceless', keyword: 'chair', keywordHighlight: 'ch', examples: ['cheese', 'watch', 'church'] },
    { ipa: 'h', category: 'consonant_voiceless', keyword: 'hat', keywordHighlight: 'h', examples: ['hot', 'hello', 'behind'] },

    { ipa: 'b', category: 'consonant_voiced', keyword: 'bat', keywordHighlight: 'b', examples: ['back', 'job', 'rabbit'] },
    { ipa: 'd', category: 'consonant_voiced', keyword: 'dog', keywordHighlight: 'd', examples: ['day', 'mad', 'did'] },
    { ipa: 'g', category: 'consonant_voiced', keyword: 'goat', keywordHighlight: 'g', examples: ['got', 'bag', 'give'] },
    { ipa: 'v', category: 'consonant_voiced', keyword: 'van', keywordHighlight: 'v', examples: ['voice', 'have', 'love'] },
    { ipa: 'ð', category: 'consonant_voiced', keyword: 'this', keywordHighlight: 'th', examples: ['that', 'mother', 'the'] },
    { ipa: 'z', category: 'consonant_voiced', keyword: 'zoo', keywordHighlight: 'z', examples: ['zip', 'buzz', 'lazy'] },
    { ipa: 'ʒ', category: 'consonant_voiced', keyword: 'vision', keywordHighlight: 'si', examples: ['measure', 'pleasure', 'beige'] },
    { ipa: 'dʒ', category: 'consonant_voiced', keyword: 'jump', keywordHighlight: 'j', examples: ['judge', 'gym', 'bridge'] },
    { ipa: 'm', category: 'consonant_voiced', keyword: 'man', keywordHighlight: 'm', examples: ['mouse', 'swim', 'hammer'] },
    { ipa: 'n', category: 'consonant_voiced', keyword: 'net', keywordHighlight: 'n', examples: ['no', 'sun', 'dinner'] },
    { ipa: 'ŋ', category: 'consonant_voiced', keyword: 'sing', keywordHighlight: 'ng', examples: ['song', 'finger', 'drink'] },
    { ipa: 'l', category: 'consonant_voiced', keyword: 'leg', keywordHighlight: 'l', examples: ['light', 'ball', 'yellow'] },
    { ipa: 'r', category: 'consonant_voiced', keyword: 'red', keywordHighlight: 'r', examples: ['run', 'car', 'around'] },
    { ipa: 'w', category: 'consonant_voiced', keyword: 'wet', keywordHighlight: 'w', examples: ['win', 'away', 'queen'] },
    { ipa: 'j', category: 'consonant_voiced', keyword: 'yes', keywordHighlight: 'y', examples: ['you', 'use', 'yard'] },
];

export const PH_GROUPS: { category: PhCategory; title: string; subtitle: string; bg: string; border: string; text: string; tile: string; badge?: string }[] = [
    { category: 'vowel_short', title: 'Vocales cortas', subtitle: 'Sonidos rápidos', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', tile: 'bg-blue-100 border-blue-300' },
    { category: 'vowel_long', title: 'Vocales largas', subtitle: 'Sonidos estirados', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', tile: 'bg-sky-200 border-sky-400' },
    { category: 'diphthong', title: 'Diptongos', subtitle: 'Dos vocales juntas', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', tile: 'bg-cyan-100 border-cyan-300' },
    { category: 'consonant_voiceless', title: 'Consonantes sordas', subtitle: 'Sin vibración: solo aire', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', tile: 'bg-amber-100 border-amber-300', badge: 'SORDA' },
    { category: 'consonant_voiced', title: 'Consonantes sonoras', subtitle: 'Vibra la garganta', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', tile: 'bg-rose-100 border-rose-300', badge: 'SONORA' },
];
