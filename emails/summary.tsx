import { EmailPayload } from '@/lib/server/email';
import {
  Html,
  Heading,
  Text,
  Section,
  Container,
  Link,
} from '@react-email/components';

export const GhostedSummary = ({
  username,
  newFollowers,
  ghosts,
}: Omit<EmailPayload, 'to'>) => {
  const hasNew = newFollowers.length > 0;
  const hasGhosts = ghosts.length > 0;

  let ctaText = '';
  if (hasNew && hasGhosts) {
    ctaText =
      'Mixed vibes. Meet your fans and do whatever you want with your ghosts 😮‍💨';
  } else if (hasNew) {
    ctaText = `Superstar vibes only. Go meet your fan${ghosts.length > 1 ? 's' : ''} 😎`;
  } else if (hasGhosts) {
    ctaText = 'Ghosts won’t unfollow themselves. Get ‘em! 👻';
  }

  return (
    <Html lang="en">
      <Section
        style={{
          padding: '24px 20px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          backgroundColor: '#f9f9f9',
        }}>
        <Container
          style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
          <Heading
            as="h2"
            style={{
              fontWeight: '400',
              fontSize: '20px',
              marginBottom: '12px',
            }}>
            👀 GitHub Activity Update
          </Heading>

          <Text style={{ fontSize: '14px', marginBottom: '16px' }}>
            {username}, here’s what happened with your followers:
          </Text>

          {hasNew && (
            <>
              <Text style={{ fontSize: '14px', margin: '12px 0 4px' }}>
                <strong>⚡️ New Followers:</strong>
              </Text>
              <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                {newFollowers.map((f) => (
                  <Link
                    key={f.username}
                    href={`https://github.com/${f.username}`}
                    style={{
                      color: 'var(--color-text-disabled)',
                      textDecoration: 'underline',
                    }}>
                    <li style={{ fontSize: '14px', listStyle: 'none' }}>
                      {f.username}
                    </li>
                  </Link>
                ))}
              </ul>
            </>
          )}

          {hasGhosts && (
            <>
              <Text
                style={{
                  fontSize: '14px',
                  margin: '16px 0 4px',
                  fontWeight: '400',
                }}>
                👻 Ghosts
              </Text>
              <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                {ghosts.map((f) => (
                  <Link
                    key={f.username}
                    href={`https://github.com/${f.username}`}
                    style={{
                      color: 'var(--color-text-disabled)',
                      textDecoration: 'underline',
                    }}>
                    <li style={{ fontSize: '14px', listStyle: 'none' }}>
                      {f.username}
                    </li>
                  </Link>
                ))}
              </ul>
            </>
          )}

          {ctaText && (
            <Text style={{ fontSize: '14px', marginTop: '24px' }}>
              {ctaText}{' '}
              <Link
                href="https://ghosted.dev/dashboard"
                style={{ color: '#0d6efd', textDecoration: 'underline' }}>
                Visit your dashboard
              </Link>
              .
            </Text>
          )}
        </Container>
      </Section>
    </Html>
  );
};
