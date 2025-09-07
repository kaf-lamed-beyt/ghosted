import { emailContainer, emailHeading, emailSection } from '@/lib/constants';
import { User } from '@/lib/server/db';
import {
  Container,
  Heading,
  Html,
  Section,
  Text,
} from '@react-email/components';

export const Welcome = ({ user }: { user: string }) => {
  return (
    <Html lang="en">
      <Section style={emailSection}>
        <Container style={emailContainer}>
          <Heading style={emailHeading}>
            Hey {user}, welcome to Ghosted! 👻
          </Heading>
          <Text style={{ fontSize: '14px', marginBottom: '16px' }}>
            You’re here because you care — maybe a little too much. That’s fine.
            I get it. I do too.
          </Text>
          <Text style={{ fontSize: '14px', marginBottom: '16px' }}>
            Every week, I’ll send you the receipts of people who follow or ghost
            you, and now it is up to you to decide what's next from there.
          </Text>
          <Text>
            See ya on Sunday, <br />
            <i>Seven!</i>
          </Text>
        </Container>
      </Section>
    </Html>
  );
};
