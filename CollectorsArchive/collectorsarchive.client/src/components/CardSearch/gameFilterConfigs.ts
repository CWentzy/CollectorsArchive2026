/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				gameFilterConfigs.ts
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			Defines game-specific filter configurations, including default values, field
 * 									keys, and validation logic for the card search form.
 */

import type { CardSearchFormValues } from "./CardSearchFormContext"
import { Game } from "./schema"
import { ygoFilterConfig } from "./ygo/config"

// Game-specific fields that can be dynamically added/removed (excludes base fields)
type GameFieldKey = Exclude<keyof CardSearchFormValues, "query" | "searchType" | "game">

export interface GameFilterConfig {
	defaultValues: Partial<CardSearchFormValues>
	fieldKeys: GameFieldKey[]
	validate: Partial<Record<GameFieldKey, (value: never, values: CardSearchFormValues) => string | null>>
}

export const gameFilterConfigs: Partial<Record<Game, GameFilterConfig>> = {
	[Game.ygo]: ygoFilterConfig,
}

/**
 * Get all field keys used by a specific game (for clearing on game switch)
 */
export function getGameFieldKeys(game: Game | undefined): GameFieldKey[] {
	if (!game) return []
	return gameFilterConfigs[game]?.fieldKeys ?? []
}

/**
 * Get default values for a specific game
 */
export function getGameDefaults(game: Game | undefined): Partial<CardSearchFormValues> {
	if (!game) return {}
	return gameFilterConfigs[game]?.defaultValues ?? {}
}

/**
 * Build validators that are specific to each field, and specific to each game.
 */
export function buildGameValidators() {
	const validators: Record<string, (value: never, values: CardSearchFormValues) => string | null> = {} // returns error message or null

	// For each game and its validators, wrap the validator in a custom function  which will ensure that the validator
	// only runs if the current game matches. It also reuses existing validators if multiple games share fields.
	for (const [game, config] of Object.entries(gameFilterConfigs)) {
		for (const [field, validator] of Object.entries(config.validate)) {
			const gameName = game as Game
			const existingValidator = validators[field]

			validators[field] = (value: never, values: CardSearchFormValues) => {
				// Skip validation if game doesn't match
				if (values.game !== gameName) return null

				// Run existing validator if it exists (for shared fields)
				if (existingValidator) {
					const existingResult = existingValidator(value, values)
					if (existingResult) return existingResult
				}

				return validator(value, values)
			}
		}
	}

	return validators
}
