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

export interface Follower {
  username: string;
  avatarUrl?: string;
  fetchedAt: Date;
  githubId: number;
  bio: string | null;
  location: string | null;
  name: string | null;
  isFollowing: boolean;
}

export interface Ghost extends Omit<Follower, 'fetchedAt'> {
  userId: number;
  unfollowedAt: Date;
}

export interface User extends Omit<Follower, 'fetchedAt' | 'isFollowing'> {
  email?: string | null;
  createdAt: Date;
  token?: string;
  followers: number;
  following: number;
  id: number;
}

interface GHFollowersDatabase {
  humans: () => Promise<User[]>;
  human: (id: number) => Promise<User | null>;
  addFollowers: (followers: Follower[], githubId: number) => Promise<void>;
  addGhosts: (ghosts: Ghost[], userId: number) => Promise<void>;
  getFollowersByDate: (date: Date) => Promise<Follower[]>;
  clearOldSnapshots?: (retainDays?: number) => Promise<void>;
  createUser: (user: Omit<User, 'id'>) => Promise<void>;
  getFollowers: (id: number) => Promise<Follower[]>;
  getGhosts: (id: number) => Promise<Ghost[]>;
  removeFollowers: (usernames: string[], userId: number) => Promise<void>;
  removeGhosts: (usernames: string[], userId: number) => Promise<void>;
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
    async human(id) {
      const [data] = await sql<User[]>`
        select * from users
        where github_id = ${id}
      `;
      return data;
    },
    async addFollowers(followers, githubId) {
      const now = new Date();
      await Promise.all(
        followers.map(
          (f) => sql<Follower[]>`
            insert into followers (username, avatar_url, bio, location, fetched_at, github_id, name, is_following)
            values (${f.username}, ${f.avatarUrl || ''}, ${f.bio}, ${f.location}, ${now}, ${githubId}, ${f.name}, ${f.isFollowing})
          `
        )
      );
    },
    async addGhosts(ghosts, userId) {
      const now = new Date();
      await Promise.all(
        ghosts.map(
          (g) => sql<Ghost[]>`
            insert into unfollowers (username, avatar_url, bio, location, github_id, name, user_id, unfollowed_at)
            values (${g.username}, ${g.avatarUrl || ''}, ${g.bio}, ${g.location}, ${g.githubId}, ${g.name}, ${userId}, ${now})
            on conflict (github_id, user_id)
            do update set unfollowed_at = excluded.unfollowed_at
          `
        )
      );
    },
    async removeGhosts(usernames, userId) {
      await sql`
        delete from unfollowers
        where user_id = ${userId}
        and username = any(${usernames})
      `;
    },
    async removeFollowers(usernames, githubId) {
      await sql`
        delete from followers
        where github_id = ${githubId}
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
        insert into users (email, github_id, location, username, bio, avatar_url, created_at, followers, following, name)
        values (
          ${user.email ?? null},
          ${user.githubId},
          ${user.location},
          ${user.username},
          ${user.bio},
          ${user.avatarUrl ?? null},
          ${user.createdAt},
          ${user.followers},
          ${user.following},
          ${user.name}
        )
        on conflict (github_id) do nothing
      `;
    },
    async getFollowers(id) {
      const rows = await sql<Follower[]>`
          select *
          from followers
          where github_id = ${id}
        `;

      return rows;
    },
    async getGhosts(id) {
      return await sql<Ghost[]>`
          select *
          from unfollowers
          where user_id = ${id}
        `;
    },
    async updateFollowerFollowState(args) {
      await sql`
        with latest as (
          select id from followers
          where github_id = ${args.githubId} and username = ${args.username}
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
