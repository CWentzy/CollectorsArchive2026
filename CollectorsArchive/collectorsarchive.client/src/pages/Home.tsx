import { useState } from "react";

// importing the images 
import profileIcon from "../assets/profileIcon.png";
import scanIcon from "../assets/scanIcon.png";
import searchIcon from "../assets/searchIcon.png";

import {
  Box,
  Text,
  Image,
  Group,
  Stack,
  Button,
  Container,
  Input, 
  InputBase, 
  Combobox, 
  useCombobox 
} from "@mantine/core";

import { IconHome2 } from "@tabler/icons-react";

export default function HomePage() {
  {/* this is a place holder for the user  */}
  const [userName] = useState("...");

  return (
    <>
      <Box bg="#073763" c="white" mih="100vh" w="100%">
        {/* TOP NAVIGATION BAR */}
        <Group
          justify="flex-end"
          bg="#0A4A7A"
          p="xl"
          gap="xl"
          style={{
            position: "sticky",
            top: 10,
            zIndex: 20,
          }}
        >
          <Stack align="center" gap={2}>
            <IconHome2 size={50} stroke={1} color="white" />
            <Text fz="lg" fw={600}>Home</Text>
          </Stack>

          <Stack align="center" gap={3}>
            <Image src={scanIcon} width={45} height={45} />
            <Text fz="lg" fw={600}>Scan</Text>
          </Stack>

          {/* profile stack and icon */}
          <Stack align="center" gap={3}>
            <Image src={profileIcon} width={45} height={45} />
            <Text fz="lg" fw={600}>Profile</Text>
          </Stack>
        </Group>

        {/* this box is for header part  */}
        <Box component="header" p="md" bg="#0A4A7A">
          {/* the name and logo goes here */}
          {/* I have deleted the logo and text from here */}

          {/* this is for welcome text and user name is a place holder variable  */}
          <Text fz="xl" fw={900}>
            Welcome, {userName}
          </Text>

          {/* Search bar */}
          <Group mt="lg" align="center">
            <Image src={searchIcon} w={45} />

            <Box
              component="input"
              type="text"
              placeholder="Search games..."
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.1)",
                color: "white",
              }}
            />

            {/* Search button */} 
            <Button
              color="green"
              radius="sm"
              style={{ height: 40 }}
            >
              Search
            </Button>

            <Text> CLear</Text>
          </Group>
        </Box>
		<DropDownListForSearching />


        {/* quick access buttons */}
        <Container mt="xl">
          <Text fz={24} fw={600} mb="md">
            Quick Access
          </Text>

          <Group justify="space-between" wrap="wrap">
            <Button color="blue" size="md">Add Game</Button>
            <Button color="green" size="md">My Collection</Button>
            <Button color="grape" size="md">Wish List</Button>
            <Button color="yellow" size="md">Favorites</Button>
            <Button color="pink" size="md">View Friends</Button>
          </Group>
        </Container>

        {/* CARD GRID */}
        <Container mt="xl">
          <Box
            display="grid"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Box
                key={i}
                bg="rgba(255,255,255,0.08)"
                h={150}
                style={{ borderRadius: "12px" }}
              />
            ))}
          </Box>
        </Container>

        <Text fz={18} fw={500} ta="right" mt="xl" c="white">
          © 2026 Collector's Archive. All rights reserved.
        </Text>
      </Box>
    </>
  );
}



const GameTypes = ['Yu‑Gi‑Oh', 'Pokémon', 'Magic'];

// I am importing this function for user to search game easly, can be with the rarity or alphabets or any other criteria, this can be
// modified later inspiredd by mantine lool 
function DropDownListForSearching() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(null);

  const options = GameTypes.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        setValue(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          style={{
            width: 200,
            textAlign: "left",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "10px 12px",
            borderRadius: 6,
          }}
        >
          {value || <Input.Placeholder> Display Games</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

