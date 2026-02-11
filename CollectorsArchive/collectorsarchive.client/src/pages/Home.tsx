import { useState } from "react";

// importing the images 
import homePageIcon from "../assets/homePageIcon.png";
import logoIcon from "../assets/logoIcon.png";
import messagesIcon from "../assets/messagesIcon.png";
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
  Avatar
} from "@mantine/core";

import { IconHome2 } from "@tabler/icons-react";

export default function HomePage() {
  {/* this is a place holder for the user  */}
  const [userName] = useState("...");

  return (
    <>
      <Box bg="#073763" c="white" mih="100vh">

        {/* this box is for header part  */}
        <Box component="header" p="md" bg="#0A4A7A">
          
          {/* the name and logo goes here */}
          <Group justify="space-between">
            <Text fw={700} fz={28} ff="Georgia">
              Collector's Archive
            </Text>

            {/* the logo need to be changed in future */}
            <Image src={logoIcon} w={50} />
          </Group>

          {/* this is for welcome text and user name is a place holder variable  */}
          <Text mt="sm" fz="lg">
            Welcome, {userName}
          </Text>

          {/* Search bar */}
          <Group mt="md" align="center">
            <Image src={searchIcon} w={24} />

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
          </Group>
        </Box>

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

        <Group
          justify="space-around"
          bg="#0A4A7A"
          p="md"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <Stack align="center" gap={2}>
            <IconHome2 size={24} stroke={1.7} color="white" />
            <Text fz="xs" fw={600} c="white">Home</Text>
          </Stack>

          <Stack align="center" gap={2}>
            <Image src={scanIcon} width={26} height={26} />
            <Text fz="xs" fw={600} c="white">Scan</Text>
          </Stack>

          {/* profile stack and icon */}
          <Stack align="center" gap={2}>
            <Avatar radius="xl" />
            <Text fz="xs" fw={600} c="white">Profile</Text>
          </Stack>
        </Group>

        <Text fz={18} fw={500} ta="right" mt="xl" c="white">
          © 2026 Collector's Archive. All rights reserved.
        </Text>

      </Box>
    </>
  );
}
