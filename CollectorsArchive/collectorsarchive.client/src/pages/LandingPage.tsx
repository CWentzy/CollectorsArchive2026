import { Box, Text, Button, Stack, Group, Image, Container } from "@mantine/core";
import { IconHome2 } from "@tabler/icons-react";
import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <Box
      bg="#073763"
      c="white"
      mih="100vh"
      w="100%"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* TOP NAV BAR */}
      <Group
        justify="flex-end"
        bg="#073763"
        p="xl"
        gap="xl"
        style={{
          position: "absolute",
          top: 50,
          right: 0,
          left: 0,
        }}
      >
        <Link
          to="/Home"
          style={{ textDecoration: "none" }} 
        >
          <Stack align="center" gap={2}>
            {/* this stack is for home icon and text */}
            <IconHome2 size={50} stroke={1} color="white" />
            <Text fz="lg" fw={600}>
              Home
            </Text>
          </Stack>
        </Link>


        <Stack align="center" gap={2}>
          <Image
            src="https://img.icons8.com/ios/30/FFFFFF/add-administrator.png"
            alt="add-administrator"
            w={50}
            h={50}
          />

          <Text fz="lg" fw={600}>Create Account</Text>
        </Stack>

        <Stack align="center" gap={3}>
          <Image
            src="https://img.icons8.com/ios/50/FFFFFF/login-rounded.png"
            width={45}
            height={45}
          />
          <Text fz="lg" fw={600}>Login</Text>
        </Stack>
      </Group>

      {/* MAIN CONTENT */}
      <Container ta="center">
        <Text fz={50} fw={900} mb="md">
          Collector’s Archive
        </Text>

        <Text fz={20} fw={400} opacity={0.8} mb="xl">
          anything about our web app can be display here .
        </Text>

        <Stack align="center" gap="xl" mt="xl">
          {/* Search Button */}
          <Button
            size="xl"
            radius="md"
            color="green"
            leftSection={<Image  src="https://img.icons8.com/ios/30/FFFFFF/search-more.png" width={30} />}
            style={{ width: 260 }}
          >
            Start Searching
          </Button>

          {/* Collect Button */}
          <Button
            size="xl"
            radius="md"
            color="blue"
            style={{ width: 260 }}
          >
            Start Collecting
          </Button>
        </Stack>
      </Container>

      <Text fz={16} fw={400} ta="center" mt="xl" opacity={0.6}>
        © 2026 Collector's Archive. All rights reserved.
      </Text>
    </Box>
  );
}
