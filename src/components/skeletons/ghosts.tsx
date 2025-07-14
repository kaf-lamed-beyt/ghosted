'use client';

import { skeleton } from '@/lib/constants';
import {
  HStack,
  Box,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react';

export const FollowersGhosts = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => (
        <HStack
          key={idx}
          spacing={4}
          p={{ lg: 4, md: 4, base: 3 }}
          bg="var(--color-heavy-grey)"
          rounded="lg"
          shadow="sm"
          width="100%"
          border="1px solid var(--color-alt-white)">
          <SkeletonCircle
            size="10"
            startColor={skeleton.startColor}
            endColor={skeleton.endColor}
          />

          <Box flex="1">
            <SkeletonText
              noOfLines={1}
              spacing="2"
              skeletonHeight="3"
              width="40%"
              startColor={skeleton.startColor}
              endColor={skeleton.endColor}
            />
            <SkeletonText
              noOfLines={2}
              spacing="1"
              skeletonHeight="3"
              mt="2"
              startColor={skeleton.startColor}
              endColor={skeleton.endColor}
            />
            <SkeletonText
              noOfLines={1}
              skeletonHeight="2"
              mt="2"
              width="30%"
              startColor={skeleton.startColor}
              endColor={skeleton.endColor}
            />
          </Box>

          <Skeleton
            height="30px"
            width="70px"
            rounded="md"
            startColor={skeleton.startColor}
            endColor={skeleton.endColor}
          />
        </HStack>
      ))}
    </>
  );
};
