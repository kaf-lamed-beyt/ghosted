import { fileURLToPath } from 'url';
import postgres from 'postgres';
import shift from 'postgres-shift';
import '@dotenvx/dotenvx/config';

const { PGHOST, PGPORT, PGDATABASE, PGUSERNAME, PGPASSWORD, PGSSLMODE } =
  process.env;

/**
 *
 * @param {string} sslstring
 * @returns {sslstring is 'require' | 'allow' | 'prefer' | 'verify-full'}
 */
const isValidSSLValue = (sslstring) =>
  ['require', 'allow', 'prefer', 'verify-full'].includes(sslstring);
/**
 *
 * @param {string|undefined} sslstring
 */
const validSSLValue = (sslstring) => {
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
  idle_timeout: 1,
});

const migrationsDir = new URL('./migrations', import.meta.url);

shift({
  sql,
  path:
    migrationsDir.protocol === 'file:'
      ? fileURLToPath(migrationsDir)
      : migrationsDir.toString(),
  before: (ctx) => {
    if (ctx) {
      const { migration_id, name } = ctx;
      console.log('🔁 Running migration:', migration_id, name);
    }
  },
})
  .then(() => {
    console.log('✅ Migrations complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
