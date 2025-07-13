'use client';

import { useState } from 'react';
import { Follower, User } from '@/lib/server/db';
import { Avatar, Box, Button, HStack, Text } from '@chakra-ui/react';
import { MapPinIcon } from '@phosphor-icons/react';
import { Geist } from 'next/font/google';
import { Octokit } from 'octokit';
import { toast } from 'sonner';
import { updateFollowState } from '@/lib/client/mutations';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

interface GitHubUserProps {
  data: Follower;
  user: User;
}

export const GitHubUser = ({ data, user }: GitHubUserProps) => {
  const [isFollowing, setIsFollowing] = useState(data.isFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    setLoading(true);
    const octokit = new Octokit({ auth: user.token });

    try {
      if (isFollowing) {
        await octokit.rest.users.unfollow({
          username: data.username,
        });
        await updateFollowState({
          githubId: user.githubId,
          isFollowing: false,
          username: data.username,
        });
        setIsFollowing(false);
        toast.success(`You unfollowed ${data.username}`);
      } else {
        await octokit.rest.users.follow({
          username: data.username,
        });
        await updateFollowState({
          githubId: user.githubId,
          isFollowing: true,
          username: data.username,
        });
        setIsFollowing(true);
        toast.success(`Followed ${data.username}`);
      }
    } catch (err) {
      console.error('Error toggling follow state:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HStack
      key={data.username}
      spacing={4}
      p={{ lg: 4, md: 4, base: 3 }}
      bg="var(--color-heavy-grey)"
      rounded="lg"
      shadow="sm"
      align="flex-start"
      border="1px solid var(--color-alt-white)"
      transition="background 0.2s">
      <Avatar src={data.avatarUrl} name={data.username} size="md" />
      <Box flex="1">
        <HStack spacing={{ lg: 2, md: 2, base: 1 }} flexWrap="wrap">
          <Text
            className={geist.className}
            fontWeight={{ lg: '500', md: '500', base: '400' }}
            fontSize="sm">
            {data.name}
          </Text>
          <Text
            color="var(--color-text-disabled)"
            fontSize={{ lg: 'md', md: 'md', base: 'sm' }}>
            {data.username}
          </Text>
        </HStack>
        {data.bio && (
          <Text
            fontSize="sm"
            noOfLines={2}
            color="var(--color-text-disabled)"
            mt={1}>
            {data.bio}
          </Text>
        )}
        {data.location && (
          <HStack spacing={1} mt={1}>
            <MapPinIcon size={14} color="var(--color-text-disabled)" />
            <Text fontSize="xs" color="var(--color-text-disabled)">
              {data.location}
            </Text>
          </HStack>
        )}
      </Box>
      <Button
        size="sm"
        isLoading={loading}
        background="var(--color-slate)"
        color="white"
        fontWeight="400"
        border="1px solid var(--color-dark-charcoal)"
        _hover={{ opacity: 0.85 }}
        onClick={handleToggleFollow}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
    </HStack>
  );
};
