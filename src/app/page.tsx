import { getSession } from '@/lib/server/session';
import { Button, Center, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

export default async function Home() {
  const session = await getSession();
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
        <Link href={session?.token ? '/dashboard' : '/auth/login'}>
          <Button
            background="var(--color-heavy-grey)"
            color="#fff"
            width="fit-content"
            px="2em"
            fontWeight="400"
            _hover={{
              background: 'var(--color-heavy-grey)',
            }}
            borderRadius="18px"
            border="1px solid var(--color-alt-white)">
            Get Started
          </Button>
        </Link>
      </Center>
    </Center>
  );
}
