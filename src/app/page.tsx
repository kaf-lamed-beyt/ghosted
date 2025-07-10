import { Button, Center, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Center flexFlow="column" height="100vh" gap="2em">
      <Stack direction="column">
        <Text fontSize="80px" fontWeight="800" textAlign="center">
          Ghosted
        </Text>
        <Text color="grey" fontSize="22px" mt="-1em">
          GitHub followers come and go &mdash; catch who left. 👻
        </Text>
      </Stack>
      <Center gap=".4em">
        <Link download href="/auth/signup">
          <Button
            background="var(--heavy-grey)"
            color="#fff"
            width="fit-content"
            px="2em"
            fontWeight="400"
            _hover={{
              background: "var(--heavy-grey)",
            }}
            borderRadius="18px"
            border="1px solid var(--alt-white)"
          >
            Get Started
          </Button>
        </Link>
      </Center>
    </Center>
  );
}
