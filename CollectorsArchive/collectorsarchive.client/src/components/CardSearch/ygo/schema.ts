export const MIN_CARD_LEVEL = 0
export const MAX_CARD_LEVEL = 13

export const MIN_ATK_DEF = 0
export const MAX_ATK_DEF = 5000

// Super Types
export const SuperType = {
	monster: "Monster",
	spell: "Spell",
	trap: "Trap",
} as const

export type SuperType = (typeof SuperType)[keyof typeof SuperType]

// Monster Card
export const Attribute = {
	dark: "Dark",
	light: "Light",
	earth: "Earth",
	water: "Water",
	fire: "Fire",
	wind: "Wind",
	divine: "Divine",
} as const

export type Attribute = (typeof Attribute)[keyof typeof Attribute]

export const MonsterSubType = {
	spellcaster: "Spellcaster",
	dragon: "Dragon",
	zombie: "Zombie",
	warrior: "Warrior",
	beastwarrior: "Beast-Warrior",
	beast: "Beast",
	wingedbeast: "Winged Beast",
	fiend: "Fiend",
	fairy: "Fairy",
	insect: "Insect",
	dinosaur: "Dinosaur",
	reptile: "Reptile",
	fish: "Fish",
	seaserpent: "Sea Serpent",
	aqua: "Aqua",
	pyro: "Pyro",
	thunder: "Thunder",
	rock: "Rock",
	plant: "Plant",
	machine: "Machine",
	psychic: "Psychic",
	divinebeast: "Divine-Beast",
	wyrm: "Wyrm",
	cyberse: "Cyberse",
	illusion: "Illusion",
} as const

export type MonsterSubType = (typeof MonsterSubType)[keyof typeof MonsterSubType]

export const Classification = {
	normal: "Normal",
	effect: "Effect",
	ritual: "Ritual",
	fusion: "Fusion",
	synchro: "Synchro",
	xyz: "Xyz",
	toon: "Toon",
	spirit: "Spirit",
	union: "Union",
	gemini: "Gemini",
	tuner: "Tuner",
	flip: "Flip",
	pendulum: "Pendulum",
	link: "Link",
}

export type Classification = (typeof Classification)[keyof typeof Classification]

// Spell Card
export const SpellSubType = {
	equip: "Equip",
	field: "Field",
	quickPlay: "Quick-Play",
	ritual: "Ritual",
	continuous: "Continuous",
	normal: "Normal",
} as const

export type SpellSubType = (typeof SpellSubType)[keyof typeof SpellSubType]

// Trap Card
export const TrapSubType = {
	counter: "Counter",
	continuous: "Continuous",
	normal: "Normal",
} as const

export type TrapSubType = (typeof TrapSubType)[keyof typeof TrapSubType]

// Advanced Filters for Card Search
export interface YGOFormFilters {
	attributes?: Attribute[]
	subTypes?: MonsterSubType[] | SpellSubType[] | TrapSubType[]
	classifications?: Classification[]
	classificationsOperator?: "and" | "or"
	excludedClassifications?: Classification[]
	levelRange?: [number, number]
	minATK?: number
	maxATK?: number
	minDEF?: number
	maxDEF?: number
}

// Default values for advanced filters
export const YGOSearchDefaultFilters: YGOFormFilters = {}
