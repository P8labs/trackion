import { Anchor, Button, Group, Image, Paper, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <Paper
      component="header"
      radius={0}
      pos="sticky"
      top={0}
      className="backdrop-blur-md! bg-transparent!"
      style={{
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}
    >
      <Group h={64} justify="space-between">
        <Link className="flex items-center -ml-1" to="/">
          <Image src="/trackion_t.png" alt="Trackion" w={32} h={32} />
          <Text fw={700} size="xl">
            Trackion
          </Text>
        </Link>

        <Group visibleFrom="md">
          <Anchor href="/about" c="dimmed">
            About
          </Anchor>

          <Anchor href="/downloads" c="dimmed">
            Downloads
          </Anchor>

          <Button component={Link} to="/auth" variant="default">
            Let's Begin
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
