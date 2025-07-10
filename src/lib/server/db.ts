import postgres from "postgres";

const { PGHOST, PGPORT, PGDATABASE, PGUSERNAME, PGPASSWORD, PGSSLMODE } =
  process.env;

const isValidSSLValue = (
  sslstring: string
): sslstring is 'require' | 'allow' | 'prefer' | 'verify-full' =>
  ['require', 'allow', 'prefer', 'verify-full'].includes(sslstring)
const validSSLValue = (sslstring: string | undefined) => {
  return sslstring
    ? isValidSSLValue(sslstring)
      ? sslstring
      : undefined
    : undefined
}

export const sql = postgres({
  host: PGHOST,
  port: Number(PGPORT),
  database: PGDATABASE,
  user: PGUSERNAME,
  password: PGPASSWORD,
  ssl: validSSLValue(PGSSLMODE),
  transform: {
    ...postgres.camel,
    undefined: null,
  }
})

export interface Follower {
  username: string;
  avatar_url?: string;
  fetched_at: Date;
}

export interface User extends Pick<Follower, "avatar_url" | "username"> {
  github_id: number;
  email?: string;
  created_at: string;
}

export interface GHFollowersDatabase {
  addFollowers: (followers: Follower[]) => Promise<void>;
  getFollowersByDate: (date: Date) => Promise<Follower[]>;
  getMostRecentSnapshot: () => Promise<Follower[]>;
  clearOldSnapshots?: (retainDays?: number) => Promise<void>;
  createUser: (user: User) => Promise<void>;
  getUserByGitHubId: (id: number) => Promise<User | null>;
}

export function db(): GHFollowersDatabase {
  return {
    async addFollowers(followers) {
      const now = new Date();
      await Promise.all(
        followers.map(
          (f) => sql<Follower[]>`
          insert into followers (username, avatar_url, fetched_at)
          values (${f.username}, ${f.avatar_url || ""}, ${now})
        `,
        ),
      );
    },
    async getFollowersByDate(date) {
      const dateStr = date.toISOString().split("T")[0];
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
        insert into users (email, github_id, username, avatar_url)
        values (
          ${user.email ?? null},
          ${user.github_id},
          ${user.username},
          ${user.avatar_url ?? null}
        )
        on conflict (github_id) do nothing
      `;
    },
    async getUserByGitHubId(id) {
      const [user] = await sql<User[]>`
        select * from users where github_id = ${id}
      `
      return user
    },
    async getMostRecentSnapshot() {
      const result = await sql<Follower[]>`
        select username, avatar_url, fetched_at
        from followers
        where fetched_at = (
          select max(fetched_at) from followers
        )
      `
      return result
    }
  };
}
