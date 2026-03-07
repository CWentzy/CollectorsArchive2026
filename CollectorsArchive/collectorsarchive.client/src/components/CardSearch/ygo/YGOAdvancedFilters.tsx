import { Box, Chip, Divider, Group, MultiSelect, Stack, Tabs, Text } from "@mantine/core"
import { MonsterSubType, SpellSubType, SuperType, TrapSubType } from "./schema"

function SectionTitle({ title, withDivider }: { title: string; withDivider?: boolean }) {
	return (
		<Box mb={4}>
			<Text size="sm" fw={500}>
				{title}
			</Text>
			{withDivider && <Divider mt={2} />}
		</Box>
	)
}

function MonsterFilters() {
	return (
		<Stack gap="md" p="sm">
			{/* Attribute */}
			<div>
				<MultiSelect label="Attribute" clearable searchable placeholder="Select attributes" />
			</div>

			{/* Monster Type */}
			<div>
				<MultiSelect
					label="Monster Type"
					clearable
					hidePickedOptions
					searchable
					data={Object.values(MonsterSubType).sort((a, b) => a.localeCompare(b))} // sorted alphabetically
					placeholder="Select monster types"
				/>
			</div>
		</Stack>
	)
}

function SpellFilters() {
	return (
		<Stack gap="xs" p="sm">
			<SectionTitle title="Sub Type" withDivider />
			<Chip.Group multiple>
				<Group justify="flex-start" gap="xs">
					{Object.values(SpellSubType).map((icon) => (
						<Chip value={icon} key={icon}>
							{icon}
						</Chip>
					))}
				</Group>
			</Chip.Group>
		</Stack>
	)
}

function TrapFilters() {
	return (
		<Stack gap="xs" p="sm">
			<SectionTitle title="Sub Type" withDivider />
			<Chip.Group multiple>
				<Group justify="flex-start" gap="xs">
					{Object.values(TrapSubType).map((icon) => (
						<Chip value={icon} key={icon}>
							{icon}
						</Chip>
					))}
				</Group>
			</Chip.Group>
		</Stack>
	)
}

export default function YGOAdvancedFilters() {
	return (
		<>
			<Tabs defaultValue={SuperType.monster} defaultChecked variant="default">
				<Tabs.List>
					{Object.values(SuperType).map((type) => {
						return (
							<Tabs.Tab value={type} key={type}>
								{type} Card
							</Tabs.Tab>
						)
					})}
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
		</>
	)
}
