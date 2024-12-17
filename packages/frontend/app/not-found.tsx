import { Button, Flex, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function NotFound() {
  return (
    <Flex h="100dvh" gap="md" align="center" direction="column" pt="33dvh">
      <Title>404 - Page not found</Title>
      <Text>The page you are looking for does not exist.</Text>
      <Button component={Link} href="/" variant="outline" size="lg">
        Go to home
      </Button>
    </Flex>
  );
}
