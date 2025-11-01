export const {
  NEXT_PUBLIC_APP_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  PGHOST,
  PGPORT,
  PGDATABASE,
  PGUSERNAME,
  PGPASSWORD,
  PGSSLMODE,
  CRY_KEY,
  NODE_ENV,
  RESEND_KEY,
  GITHUB_PAT,
  EMAIL_DOMAIN,
} = process.env;

export const skeleton = {
  startColor: 'var(--color-dark-charcoal)',
  endColor: 'var(--color-alt-white)',
};

export const emailSection = {
  padding: '24px 20px',
  fontFamily: 'Helvetica, Arial, sans-serif',
  backgroundColor: '#f9f9f9',
};

export const emailContainer = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

export const emailHeading = {
  fontWeight: '400',
  fontSize: '20px',
  marginBottom: '12px',
};
