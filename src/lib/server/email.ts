import { resend } from '../resend';
import { Follower } from './db';
import { GhostedSummary } from '../../../emails/summary';
import { EMAIL_DOMAIN, NODE_ENV } from '../constants';

export type EmailPayload = {
  to: string;
  username: string;
  newFollowers: Follower[];
  ghosts: Follower[];
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
    subject = '👻 One person ghosted you on GitHub, this week';
  } else if (ghostCount > 1) {
    subject = `👻 You've been ghosted by ${ghostCount} people`;
  } else if (newFollowersCount === 1) {
    subject = `🎉 This week, one new person followed you on GitHub`;
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
