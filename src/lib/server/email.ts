import { resend } from '../resend';
import { db, Follower, Ghost, User } from './db';
import { GhostedSummary } from '../../../emails/summary';
import { EMAIL_DOMAIN, NODE_ENV } from '../constants';
import { Welcome } from '../../../emails/welcome';

export type EmailPayload = {
  to: string;
  username: string;
  newFollowers: Follower[];
  ghosts: Ghost[];
};

export async function sendEmail(payload: EmailPayload) {
  if (!payload.to) return;

  const { to, username, newFollowers, ghosts } = payload;
  const ghostCount = ghosts.length;
  const newFollowersCount = newFollowers.length;

  let subject = '📬 Your GitHub follower update this week';
  if (ghostCount > 0 && newFollowersCount > 0) {
    subject = `Mixed vibes: ${newFollowersCount} followed you, ${ghostCount} unfollowed`;
  } else if (ghostCount === 1) {
    subject = '👻 One person ghosted you on GitHub, last week';
  } else if (ghostCount > 1) {
    subject = `👻 You've been ghosted by ${ghostCount} people`;
  } else if (newFollowersCount === 1) {
    subject = `🎉 Last week, one new person followed you on GitHub`;
  } else if (newFollowersCount > 1) {
    subject = `🙌🏽 Idan! ${newFollowersCount} people followed you recently`;
  }

  const domain =
    NODE_ENV === 'production' ? EMAIL_DOMAIN : 'onboarding@resend.dev';

  try {
    const response = await resend.emails.send({
      to,
      from: `"Ghosted!" <${domain}>`,
      subject: subject,
      react: GhostedSummary({ username, newFollowers, ghosts }),
    });
    console.log('Idan! Delivery to shana! 🔥', response);
  } catch (error) {
    console.error('nawa for you o!', error);
  }
}

const SUBJECTS = [
  'They unfollowed you? Now, you’ll know. 😉',
  'Because silence is not an option…',
  'The receipts are on their way 📉',
  'Petty looks good on you 👀',
  'Congrats — you’ve leveled up in pettiness 🎖️',
];

export async function welcome(user: Pick<User, 'githubId' | 'email' | 'name'>) {
  const human = await db().human(user.githubId);
  if (human) return;

  const domain =
    NODE_ENV === 'production' ? EMAIL_DOMAIN : 'onboarding@resend.dev';
  const index = Math.floor(Math.random() * SUBJECTS.length);
  const subject = SUBJECTS[index];

  try {
    const response = await resend.emails.send({
      subject,
      to: user.email ?? '',
      react: Welcome({ user: user.name ?? '' }),
      from: `"Seven from Ghosted!" <${domain}>`,
    });
    console.log('Idan, Welcome! 🔥', response);
  } catch (error) {
    console.error(error);
  }
}
