import {
  Button,
  Center,
  Heading,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { GithubLogoIcon, TiktokLogoIcon } from '@phosphor-icons/react/ssr';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Center height="100vh" px={4}>
      <VStack spacing={8} maxW="md" w="full">
        <VStack spacing={2}>
          <Heading size="2xl" fontWeight="800">
            Sign in to Ghosted.
          </Heading>
          <Text color="grey" textAlign="center" fontSize="lg">
            Choose your platform to get started
          </Text>
        </VStack>

        <Stack direction="column" spacing={4} w="full">
          <Link href="/auth/github/login" style={{ width: '100%' }}>
            <Button
              w="full"
              size="lg"
              background="var(--color-heavy-grey)"
              color="#fff"
              fontWeight="400"
              fontSize="15px"
              _hover={{
                background: 'var(--color-heavy-grey)',
                opacity: 0.9,
              }}
              borderRadius="12px"
              border="1px solid var(--color-alt-white)"
              leftIcon={<GithubLogoIcon />}>
              Continue with GitHub
            </Button>
          </Link>

          <Link href="/auth/tiktok/login" style={{ width: '100%' }}>
            <Button
              w="full"
              size="lg"
              fontSize="15px"
              background="var(--color-heavy-grey)"
              color="#fff"
              fontWeight="400"
              _hover={{
                background: 'var(--color-heavy-grey)',
                opacity: 0.9,
              }}
              borderRadius="12px"
              border="1px solid var(--color-alt-white)"
              leftIcon={<TiktokLogoIcon />}>
              Continue with TikTok
            </Button>
          </Link>
        </Stack>

        <Text
          color="var(--color-text-disabled)"
          fontSize="sm"
          textAlign="center">
          Track who follows and unfollows you across platforms
        </Text>
      </VStack>
    </Center>
  );
}
