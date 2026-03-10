/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				YGOAdvancedFilters.tsx
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			YGO-specific advanced filters component for card search.
 */

import {
	Box,
	Button,
	Chip,
	Flex,
	Group,
	MultiSelect,
	NumberInput,
	RangeSlider,
	SegmentedControl,
	Space,
	Stack,
	Tabs,
	Text,
} from "@mantine/core"
import { ShieldHalfIcon, SwordsIcon } from "lucide-react"
import { useCardSearchFormContext } from "../CardSearchFormContext"
import {
	Attribute,
	Classification,
	MAX_ATK_DEF,
	MAX_CARD_LEVEL,
	MAX_PENDULUM_LEVEL,
	MIN_ATK_DEF,
	MIN_CARD_LEVEL,
	MIN_PENDULUM_LEVEL,
	MonsterSubType,
	SpellSubType,
	SuperType,
	TrapSubType,
} from "./schema"

function ChipSection<T extends string>({ title, fieldPath, data }: { title: string; fieldPath: string; data: T[] }) {
	const form = useCardSearchFormContext()
	const path = fieldPath as never

	function handleClear() {
		form.setFieldValue(path, [])
	}

	return (
		<Stack gap={4}>
			<Box mb={4}>
				<Group gap="xs">
					<Text size="sm" fw={500}>
						{title}
					</Text>
				</Group>
			</Box>

			<Chip.Group key={form.key(path)} {...form.getInputProps(path)} multiple>
				<Group justify="flex-start" gap="xs">
					{data.map((item) => (
						<Chip key={item} value={item}>
							{item}
						</Chip>
					))}
					<Button variant="transparent" size="compact-xs" onClick={handleClear}>
						Clear All
					</Button>
				</Group>
			</Chip.Group>
		</Stack>
	)
}

function MonsterFilters() {
	const form = useCardSearchFormContext()

	const levelRange = form.getValues().levelRange || [MIN_CARD_LEVEL, MAX_CARD_LEVEL]
	const pendulumRange = form.getValues().pendulumRange || [MIN_PENDULUM_LEVEL, MAX_PENDULUM_LEVEL]

	return (
		<Stack gap="md" p="sm">
			{/* Attributes */}
			<ChipSection
				title="Attributes"
				fieldPath="attributes"
				data={Object.values(Attribute).sort((a, b) => a.localeCompare(b))}
			/>

			{/* Monster Types */}
			<MultiSelect
				key={form.key("subTypes")}
				{...form.getInputProps("subTypes")}
				label="Monster Types"
				clearable
				hidePickedOptions
				searchable
				data={Object.values(MonsterSubType).sort((a, b) => a.localeCompare(b))}
			/>

			{/* Card Types */}
			<Stack gap="xs">
				<MultiSelect
					key={form.key("classifications")}
					{...form.getInputProps("classifications")}
					label="Card Types"
					description="Options are disabled if they are already selected in the 'Excluded Card Types' filter below."
					clearable
					hidePickedOptions
					searchable
					data={Object.values(Classification)
						.sort((a, b) => a.localeCompare(b))
						.map((type) => ({
							label: type,
							value: type,
							disabled: form.getValues().excludedClassifications?.includes(type),
						}))}
				/>

				<Group gap="xs">
					<SegmentedControl
						key={form.key("classificationsOperator")}
						{...form.getInputProps("classificationsOperator")}
						data={[
							{ label: "AND", value: "and" },
							{ label: "OR", value: "or" },
						]}
						size="xs"
						w={100}
					/>
					<Text size="xs" c="dimmed">
						{form.getValues().classificationsOperator === "and"
							? "Card must match all selected types"
							: "Card can match any of the selected types"}
					</Text>
				</Group>
			</Stack>

			{/* Exclude Card Types */}
			<MultiSelect
				key={form.key("excludedClassifications")}
				{...form.getInputProps("excludedClassifications")}
				label="Exclude Card Types"
				description="Options are disabled if they are already included in the 'Card Types' filter above."
				clearable
				hidePickedOptions
				searchable
				data={Object.values(Classification)
					.sort((a, b) => a.localeCompare(b))
					.map((type) => ({
						label: type,
						value: type,
						disabled: form.getValues().classifications?.includes(type),
					}))}
			/>

			{/* Level */}
			<Stack gap={4}>
				<Text size="sm" fw={500}>
					Level
				</Text>
				<RangeSlider
					key={form.key("levelRange")}
					{...form.getInputProps("levelRange")}
					min={MIN_CARD_LEVEL}
					max={MAX_CARD_LEVEL}
					minRange={0}
					step={1}
				></RangeSlider>
				<Text size="xs" c="dimmed">
					{levelRange[0] === levelRange[1] ? levelRange[0] : `${levelRange[0]} - ${levelRange[1]}`}
				</Text>
			</Stack>

			{/* Pendulum */}
			<Stack gap={4}>
				<Text size="sm" fw={500}>
					Pendulum
				</Text>
				<RangeSlider
					key={form.key("pendulumRange")}
					{...form.getInputProps("pendulumRange")}
					min={MIN_PENDULUM_LEVEL}
					max={MAX_PENDULUM_LEVEL}
					minRange={0}
					step={1}
				></RangeSlider>
				<Text size="xs" c="dimmed">
					{pendulumRange[0] === pendulumRange[1] ? pendulumRange[0] : `${pendulumRange[0]} - ${pendulumRange[1]}`}
				</Text>
			</Stack>

			<Space />

			{/* ATK */}
			<div>
				<Flex gap="md" w="100%" wrap="wrap" align="flex-end">
					<NumberInput
						key={form.key("minATK")}
						{...form.getInputProps("minATK")}
						flex={1}
						label="ATK (Min)"
						leftSection={<SwordsIcon size={16} />}
						placeholder={MIN_ATK_DEF.toString() + " - " + MAX_ATK_DEF.toString()}
						min={MIN_ATK_DEF}
						max={MAX_ATK_DEF}
						stepHoldDelay={500}
						stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)} // from https://mantine.dev/core/number-input/#incrementdecrement-on-hold
					/>

					<NumberInput
						key={form.key("maxATK")}
						{...form.getInputProps("maxATK")}
						flex={1}
						label="ATK (Max)"
						leftSection={<SwordsIcon size={16} />}
						placeholder={MIN_ATK_DEF.toString() + " - " + MAX_ATK_DEF.toString()}
						min={MIN_ATK_DEF}
						max={MAX_ATK_DEF}
						stepHoldDelay={500}
						stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
					/>
				</Flex>
			</div>

			{/* DEF */}
			<div>
				<Flex gap="md" w="100%" wrap="wrap" align="flex-end">
					<NumberInput
						key={form.key("minDEF")}
						{...form.getInputProps("minDEF")}
						flex={1}
						label="DEF (Min)"
						leftSection={<ShieldHalfIcon size={16} />}
						placeholder={MIN_ATK_DEF.toString() + " - " + MAX_ATK_DEF.toString()}
						min={MIN_ATK_DEF}
						max={MAX_ATK_DEF}
						stepHoldDelay={500}
						stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
					/>

					<NumberInput
						key={form.key("maxDEF")}
						{...form.getInputProps("maxDEF")}
						flex={1}
						label="DEF (Max)"
						leftSection={<ShieldHalfIcon size={16} />}
						placeholder={MIN_ATK_DEF.toString() + " - " + MAX_ATK_DEF.toString()}
						min={MIN_ATK_DEF}
						max={MAX_ATK_DEF}
						stepHoldDelay={500}
						stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
					/>
				</Flex>
			</div>
		</Stack>
	)
}

function SpellFilters() {
	return (
		<Box p="sm">
			<ChipSection title="Sub Types" fieldPath="subTypes" data={Object.values(SpellSubType)} />
		</Box>
	)
}

function TrapFilters() {
	return (
		<Box p="sm">
			<ChipSection title="Sub Types" fieldPath="subTypes" data={Object.values(TrapSubType)} />
		</Box>
	)
}

export default function YGOAdvancedFilters() {
	return (
		<Tabs defaultValue={SuperType.monster} variant="default">
			<Tabs.List>
				{Object.values(SuperType).map((type) => (
					<Tabs.Tab value={type} key={type}>
						{type} Card
					</Tabs.Tab>
				))}
			</Tabs.List>

			<Tabs.Panel value={SuperType.monster} pt="xs">
				<MonsterFilters />
			</Tabs.Panel>

			<Tabs.Panel value={SuperType.spell} pt="xs">
				<SpellFilters />
			</Tabs.Panel>

			<Tabs.Panel value={SuperType.trap} pt="xs">
				<TrapFilters />
			</Tabs.Panel>
		</Tabs>
	)
}
