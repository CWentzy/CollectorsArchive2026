// Super Types
export const SuperType = {
	monster: "Monster",
	spell: "Spell",
	trap: "Trap",
} as const

export type SuperType = (typeof SuperType)[keyof typeof SuperType]

// Monster Card
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
