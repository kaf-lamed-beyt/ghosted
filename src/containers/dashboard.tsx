'use client';

import {
  Box,
  Text,
  VStack,
  Avatar,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Stack,
} from '@chakra-ui/react';
import { MapPinIcon, UsersIcon } from '@phosphor-icons/react';
import { useSWR } from '@/lib/swr';
import { Follower, User } from '@/lib/server/db';
import { GitHubUser } from '@/components/github-user';
import { FollowersGhosts } from '@/components/skeletons/ghosts';

export default function Dashboard({ user }: { user: User }) {
  const { data, isLoading, error } = useSWR('/api/followers');
  const ghostsCount = data?.ghosts.length || 0;
  const followersCount = data?.followers?.length || 0;

  return (
    <Stack
      py={{ base: '2em' }}
      px={{ xl: '12em', lg: '4em', md: '6em', base: '1em' }}
      minH="100vh"
      direction={{ lg: 'row', md: 'column', base: 'column' }}
      width="100%"
      gap={{ lg: '1.4em', md: '1em', base: '.8em' }}>
      <Box mb={8} p={{ lg: 6, md: 3, base: 0 }} height="fit-content">
        <Stack
          spacing={{ lg: 6, md: 3, base: 3 }}
          direction={{ lg: 'column', md: 'row', base: 'row' }}>
          <Avatar
            src={user.avatarUrl}
            size={{ lg: '3xl', md: 'xl', base: 'lg' }}
          />
          <VStack
            align="flex-start"
            spacing={{ lg: 2, md: 1, base: 1 }}
            flex={1}>
            <Box>
              <Text
                fontSize={{ lg: '2xl', md: 'xl', base: 'xl' }}
                fontWeight="bold"
                color="white">
                {user.name}
              </Text>
              <Text
                fontSize={{ lg: 'lg', md: 'md', base: 'md' }}
                color="var(--color-text-disabled)">
                {user.username}
              </Text>
            </Box>

            {user.bio && (
              <Text
                fontSize="md"
                maxW="md"
                display={{ lg: 'block', md: 'none', base: 'none' }}>
                {user.bio}
              </Text>
            )}

            <HStack
              spacing={4}
              mt={2}
              display={{ lg: 'flex', md: 'flex', base: 'none' }}>
              <HStack spacing={1}>
                <UsersIcon size={16} color="var(--color-text-disabled)" />
                <Text fontSize="sm" color="var(--color-text-disabled)">
                  <Text as="span" fontWeight="bold" color="white">
                    {followersCount}
                  </Text>{' '}
                  followers
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Text fontSize="sm" color="var(--color-text-disabled)">
                  <Text as="span" fontWeight="bold" color="white">
                    {ghostsCount}
                  </Text>{' '}
                  ghost{ghostsCount > 1 || ghostsCount === 0 ? 's' : ''}
                </Text>
              </HStack>
            </HStack>

            {user.location && (
              <HStack
                spacing={1}
                display={{ lg: 'flex', md: 'none', base: 'none' }}>
                <MapPinIcon size={16} color="var(--color-text-disabled)" />
                <Text fontSize="sm" color="var(--color-text-disabled)">
                  {user.location}
                </Text>
              </HStack>
            )}
          </VStack>
        </Stack>
      </Box>

      {isLoading ? (
        <VStack
          h="40vh"
          width="100%"
          spacing={{ lg: 5, md: 3, base: 3 }}
          mt={{ lg: '2em', md: '0', base: '0' }}>
          <FollowersGhosts />
        </VStack>
      ) : error ? (
        <Text color="red.400">Failed to load follower data.</Text>
      ) : (
        <Tabs variant="simple" width="100%" position="relative">
          <TabList borderColor="var(--color-slate)" position="sticky" top="0">
            <Tab
              _selected={{
                color: 'white',
                borderBottom: '2px solid var(--color-github-orange)',
              }}
              color="var(--color-text-disabled)">
              <HStack spacing={2}>
                <Text>Followers</Text>
                <Badge
                  background="var(--color-heavy-grey)"
                  color="white"
                  borderRadius="8px"
                  border="1px solid var(--color-alt-white)"
                  fontWeight="300">
                  {user.followers}
                </Badge>
              </HStack>
            </Tab>
            <Tab
              _selected={{
                color: 'white',
                borderBottom: '2px solid var(--color-github-orange)',
              }}
              color="var(--color-text-disabled)">
              <HStack spacing={2}>
                <Text>👻 Ghosts</Text>
                <Badge
                  background="var(--color-heavy-grey)"
                  color="white"
                  borderRadius="8px"
                  border="1px solid var(--color-alt-white)"
                  fontWeight="300">
                  {ghostsCount}
                </Badge>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <VStack align="stretch" spacing={3}>
                {user.followers === 0 ? (
                  <Text
                    color="var(--color-alt-white)"
                    textAlign="center"
                    py={8}>
                    No followers yet
                  </Text>
                ) : (
                  data?.followers.map((f: Follower) => (
                    <GitHubUser
                      data={f}
                      user={user}
                      key={`${crypto.randomUUID()}-${f.githubId}`}
                    />
                  ))
                )}
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              <VStack align="stretch" spacing={3}>
                {ghostsCount === 0 ? (
                  <Text
                    color="var(--color-text-disabled)"
                    textAlign="center"
                    py={8}>
                    Nobody has ghosted you, yet.
                  </Text>
                ) : (
                  data?.ghosts.map((ghost: Follower) => (
                    <GitHubUser
                      user={user}
                      data={ghost}
                      key={`${crypto.randomUUID()}-${ghost.githubId}`}
                    />
                  ))
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Stack>
  );
}
