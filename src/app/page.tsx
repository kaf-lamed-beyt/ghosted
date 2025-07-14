import { getSession } from '@/lib/server/session';
import { Button, Center, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

export default async function Home() {
  const session = await getSession();
  return (
    <Center flexFlow="column" height="100vh" gap="2em">
      <Stack direction="column">
        <Text fontSize="80px" fontWeight="800" textAlign="center">
          Ghosted.
        </Text>
        <Text
          color="grey"
          fontSize={{ lg: '22px', md: '18px', base: '18px' }}
          mt="-1em"
          textAlign="center">
          GitHub followers come and go &mdash; catch who left. 👻
        </Text>
        <Text
          color="var(--color-text-disabled)"
          fontSize={{ lg: 'md', md: 'md', base: 'sm' }}
          textAlign="center"
          mt="0.5em">
          We take bi-hourly snapshots to spot changes fast &mdash; and send you
          a weekly summary so you don’t miss a thing.
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
