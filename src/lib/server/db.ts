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

export interface User extends Omit<Follower, 'fetchedAt' | 'isFollowing'> {
  email?: string | null;
  createdAt: Date;
  token?: string;
  followers: number;
  following: number;
}

interface GHFollowersDatabase {
  addFollowers: (followers: Follower[], githubId: number) => Promise<void>;
  getFollowersByDate: (date: Date) => Promise<Follower[]>;
  getMostRecentSnapshot: () => Promise<Follower[]>;
  clearOldSnapshots?: (retainDays?: number) => Promise<void>;
  createUser: (user: User) => Promise<void>;
  getUserByGitHubId: (id: number) => Promise<User | null>;
  getRecentSnapshotsForUser: (id: number) => Promise<Follower[][]>;
  updateFollowerFollowState: (params: FollowStateUpdateParams) => Promise<void>;
}

export function db(): GHFollowersDatabase {
  return {
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
    async getFollowersByDate(date) {
      const dateStr = date.toISOString().split('T')[0];
      const result = await sql<Follower[]>`
        select username, avatar_url, fetched_at
        from followers
        where fetched_at::date = ${dateStr}
      `;
      return result;
    },
    async clearOldSnapshots(retainDays = 30) {
      await sql`
        delete from followers
        where fetched_at < NOW() - INTERVAL '${retainDays} days'
      `;
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
    async getUserByGitHubId(id) {
      const [user] = await sql<User[]>`
        select * from users where github_id = ${id}
      `;
      return user;
    },
    async getMostRecentSnapshot() {
      const result = await sql<Follower[]>`
        select username, avatar_url, fetched_at
        from followers
        where fetched_at = (
          select max(fetched_at) from followers
        )
      `;
      return result;
    },
    async getRecentSnapshotsForUser(id) {
      const rows = await sql<Follower[]>`
          select *
          from followers
          where github_id = ${id}
            and fetched_at in (
              select distinct fetched_at
              from followers
              where github_id = ${id}
              order by fetched_at DESC
              limit 2
            )
          order by fetched_at desc
        `;

      const grouped = rows.reduce(
        (acc, row) => {
          const key = row.fetchedAt.toISOString();
          if (!acc[key]) acc[key] = [];
          acc[key].push(row);
          return acc;
        },
        {} as Record<string, Follower[]>
      );

      // we should just get the most recent two updates via timestamp
      const snapshots = Object.values(grouped).slice(0, 2);
      return snapshots;
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
