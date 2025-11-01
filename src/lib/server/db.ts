import postgres from 'postgres';
import {
  PGHOST,
  PGPORT,
  PGDATABASE,
  PGUSERNAME,
  PGPASSWORD,
  PGSSLMODE,
} from '../constants';
import { FollowStateUpdateParams } from '../client/mutations';

const isValidSSLValue = (
  sslstring: string
): sslstring is 'require' | 'allow' | 'prefer' | 'verify-full' =>
  ['require', 'allow', 'prefer', 'verify-full'].includes(sslstring);
const validSSLValue = (sslstring: string | undefined) => {
  return sslstring
    ? isValidSSLValue(sslstring)
      ? sslstring
      : undefined
    : undefined;
};

const sql = postgres({
  host: PGHOST,
  port: Number(PGPORT),
  database: PGDATABASE,
  user: PGUSERNAME,
  password: PGPASSWORD,
  ssl: validSSLValue(PGSSLMODE),
  transform: {
    ...postgres.camel,
    undefined: null,
  },
});

export type Platform = 'github' | 'tiktok';

export interface Follower {
  username: string;
  platform: Platform;
  avatarUrl?: string;
  fetchedAt: Date;
  userId: number;
  bio: string | null;
  location: string | null;
  name: string | null;
  isFollowing: boolean;
  firstFollowedAt: Date;
}

export interface Ghost extends Omit<Follower, 'fetchedAt'> {
  userId: number;
  unfollowedAt: Date;
}

export interface User {
  id: number;
  platform: Platform;
  platformId: string;
  username: string;
  avatarUrl?: string;
  email?: string | null;
  createdAt: Date;
  token?: string;
  followers: number;
  following: number;
  name: string | null;
  bio: string | null;
  location: string | null;
  firstFollowedAt: Date;
}

interface GHFollowersDatabase {
  humans: () => Promise<User[]>;
  human: (platformId: string, platform: Platform) => Promise<User | null>;
  addFollowers: (followers: Follower[], userId: number, platform: Platform) => Promise<void>;
  addGhosts: (ghosts: Ghost[], userId: number, platform: Platform) => Promise<void>;
  getFollowersByDate: (date: Date) => Promise<Follower[]>;
  clearOldSnapshots?: (retainDays?: number) => Promise<void>;
  createUser: (user: Omit<User, 'id' | 'firstFollowedAt'>) => Promise<void>;
  getFollowers: (userId: number, platform: Platform) => Promise<Follower[]>;
  getGhosts: (userId: number, platform: Platform) => Promise<Ghost[]>;
  removeFollowers: (usernames: string[], userId: number, platform: Platform) => Promise<void>;
  removeGhosts: (usernames: string[], userId: number, platform: Platform) => Promise<void>;
  updateFollowerFollowState: (params: FollowStateUpdateParams) => Promise<void>;
}

export function db(): GHFollowersDatabase {
  return {
    async humans() {
      const result = await sql<User[]>`
        select * from users
      `;
      return result;
    },
    async human(platformId, platform) {
      const [data] = await sql<User[]>`
        select * from users
        where platform_id = ${platformId}
        and platform = ${platform}
      `;
      return data;
    },
    async addFollowers(followers, userId, platform) {
      const now = new Date();
      await Promise.all(
        followers.map(
          (f) => sql<Follower[]>`
            insert into followers (username, avatar_url, bio, location, fetched_at, user_id, name, is_following, first_followed_at, platform)
            values (${f.username}, ${f.avatarUrl || ''}, ${f.bio}, ${f.location}, ${now}, ${userId}, ${f.name}, ${f.isFollowing}, ${now}, ${platform})
            on conflict (username, platform, user_id)
            do update set
              fetched_at = excluded.fetched_at,
              avatar_url = excluded.avatar_url,
              bio = excluded.bio,
              location = excluded.location,
              name = excluded.name,
              is_following = excluded.is_following
          `
        )
      );
    },
    async addGhosts(ghosts, userId, platform) {
      const now = new Date();
      await Promise.all(
        ghosts.map(
          (g) => sql<Ghost[]>`
            insert into unfollowers (username, avatar_url, bio, location, name, user_id, unfollowed_at, platform)
            values (${g.username}, ${g.avatarUrl || ''}, ${g.bio}, ${g.location}, ${g.name}, ${userId}, ${now}, ${platform})
            on conflict (username, platform, user_id)
            do update set unfollowed_at = excluded.unfollowed_at
          `
        )
      );
    },
    async removeGhosts(usernames, userId, platform) {
      await sql`
        delete from unfollowers
        where user_id = ${userId}
        and platform = ${platform}
        and username = any(${usernames})
      `;
    },
    async removeFollowers(usernames, userId, platform) {
      await sql`
        delete from followers
        where user_id = ${userId}
        and platform = ${platform}
        and username = any(${usernames})
      `;
    },
    async getFollowersByDate(date) {
      const dateStr = date.toISOString().split('T')[0];
      const result = await sql<Follower[]>`
        select username, avatar_url, fetched_at
        from followers
        where fetched_at::date = ${dateStr}
      `;
      return result;
    },
    async createUser(user) {
      await sql`
        insert into users (email, platform, platform_id, location, username, bio, avatar_url, created_at, followers, following, name)
        values (
          ${user.email ?? null},
          ${user.platform},
          ${user.platformId},
          ${user.location},
          ${user.username},
          ${user.bio},
          ${user.avatarUrl ?? null},
          ${user.createdAt},
          ${user.followers},
          ${user.following},
          ${user.name}
        )
        on conflict (platform, platform_id) do nothing
      `;
    },
    async getFollowers(userId, platform) {
      const rows = await sql<Follower[]>`
          select *
          from followers
          where user_id = ${userId}
          and platform = ${platform}
        `;

      return rows;
    },
    async getGhosts(userId, platform) {
      return await sql<Ghost[]>`
          select *
          from unfollowers
          where user_id = ${userId}
          and platform = ${platform}
        `;
    },
    async updateFollowerFollowState(args) {
      await sql`
        with latest as (
          select id from followers
          where user_id = ${args.userId}
          and username = ${args.username}
          and platform = ${args.platform}
          order by fetched_at desc
          limit 1
        )
        update followers
        set is_following = ${args.isFollowing}
        where id in (select id from latest)
      `;
    },
  };
}
