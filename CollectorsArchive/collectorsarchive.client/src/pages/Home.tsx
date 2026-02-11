import { useState } from "react";

// importing the images 
import homePageIcon from "../assets/homePageIcon.png";
import logoIcon from "../assets/logoIcon.png";
import messagesIcon from "../assets/messagesIcon.png";
import profileIcon from "../assets/profileIcon.png";
import reactSvg from "../assets/react.svg";
import scanIcon from "../assets/scanIcon.png";
import searchIcon from "../assets/searchIcon.png";

import {
  Box,
  Center,
  Title,
  Text,
  Image,
  Group,
  Stack,
  Button,
  Container,
} from "@mantine/core";

export default function HomePage() {
  const [userName] = useState("...");

  return (
	<>
	 
		<Box bg="#073745" c="white" mih="100vh">

		{/* this box is for header part  */}
		<Box component="header" p="md" bg="#073763">
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
				borderRadius: "8px",
				border: "1px solid #555",
				background: "#073763",
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
				<Button color="red" size="md">Messages</Button>
				<Button color="pink" size="md">View Friends</Button>
			</Group>
		</Container>

		{/* CARD GRID */}
		<Container mt="xl">
			<Box
				display="grid"
				style={{
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: "20px",
				}}
				>
				{Array.from({ length: 8 }).map((_, i) => (
					<Box
					key={i}
					bg="dark.7"
					h={150}
					style={{ borderRadius: "12px" }}
					/>
				))}
			</Box>
		</Container>

		{/* BOTTOM NAV */}
		<Box
			component="nav"
			pos="fixed"
			bottom={0}
			left={0}
			right={0}
			bg="#073763"
			p="sm"
		>
			<Group justify="space-around">
				<Stack align="center" gap={2}>
					<Image src={homePageIcon} w={28} />
					<Text fz="sm">Home</Text>
				</Stack>

				<Stack align="center" gap={2}>
					<Image src="/images/scanIcon.png" w={28} />
					<Text fz="sm">Scan Card</Text>
				</Stack>

				<Stack align="center" gap={2}>
					<Image src="/images/messagesIcon.png" w={28} />
					<Text fz="sm">Messages</Text>
				</Stack>

				<Stack align="center" gap={2}>
					<Image src="/images/profileIcon.png" w={28} />
					<Text fz="sm">Profile</Text>
				</Stack>
			</Group>
		</Box>

		{/* FOOTER */}
		<Box component="footer" mt="xl" p="md" ta="right">
			<Text fz={20} fw={500}>
			© 2026 Collector's Archive. All rights reserved.
			</Text>
		</Box>
		</Box>
	</>
  );
}
