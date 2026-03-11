/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				config.ts
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			YGO-specific filter configuration, which includes default values, field keys,
 * 									and validation logic.
 */

import type { CardSearchFormValues } from "../CardSearchFormContext"
import type { GameFilterConfig } from "../gameFilterConfigs"
import {
	MAX_ATK_DEF,
	MAX_CARD_LEVEL,
	MAX_PENDULUM_LEVEL,
	MIN_ATK_DEF,
	MIN_CARD_LEVEL,
	MIN_PENDULUM_LEVEL,
	YGO_FIELD_KEYS,
	YGOSearchDefaultFilters,
} from "./schema"

export const ygoFilterConfig: GameFilterConfig = {
	defaultValues: YGOSearchDefaultFilters,
	fieldKeys: YGO_FIELD_KEYS,
	validate: {
		levelRange: (value: never) => {
			const range = value as [number, number] | undefined
			if (range) {
				const [min, max] = range
				if (min < MIN_CARD_LEVEL || max > MAX_CARD_LEVEL || min > max) {
					return "Level range is invalid"
				}
			}
			return null
		},
		pendulumRange: (value: never) => {
			const range = value as [number, number] | undefined
			if (range) {
				const [min, max] = range
				if (min < MIN_PENDULUM_LEVEL || max > MAX_PENDULUM_LEVEL || min > max) {
					return "Pendulum range is invalid"
				}
			}
			return null
		},
		minATK: (value: never, values: CardSearchFormValues) => {
			const minATK = value as number | undefined
			if (minATK !== undefined && values.maxATK !== undefined) {
				if (minATK < MIN_ATK_DEF || minATK > values.maxATK) {
					return "Value cannot be greater than ATK (Max)"
				}
			}
			return null
		},
		maxATK: (value: never, values: CardSearchFormValues) => {
			const maxATK = value as number | undefined
			if (maxATK !== undefined && values.minATK !== undefined) {
				if (maxATK > MAX_ATK_DEF || values.minATK > maxATK) {
					return "Value cannot be less than ATK (Min)"
				}
			}
			return null
		},
		minDEF: (value: never, values: CardSearchFormValues) => {
			const minDEF = value as number | undefined
			if (minDEF !== undefined && values.maxDEF !== undefined) {
				if (minDEF < MIN_ATK_DEF || minDEF > values.maxDEF) {
					return "Value cannot be greater than DEF (Max)"
				}
			}
			return null
		},
		maxDEF: (value: never, values: CardSearchFormValues) => {
			const maxDEF = value as number | undefined
			if (maxDEF !== undefined && values.minDEF !== undefined) {
				if (maxDEF > MAX_ATK_DEF || values.minDEF > maxDEF) {
					return "Value cannot be less than DEF (Min)"
				}
			}
			return null
		},
	},
}
