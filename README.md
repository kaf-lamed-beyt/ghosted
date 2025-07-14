## Ghosted! 👻

GitHub followers come and go, now you'll know.

## Why?

I spend a lot of time on GitHub, sometimes, I'd randomly notice that the follower count on my profile increased and vice versa.

There's no way for me to know. I want to.

So I decided to embark on this. I'm glad it is here now after procrastinating for seven months &mdash; mostly because of "skill issues".

## Want to contribute?

Create a version of this repo on your account by making a fork, clone it, and install the dependencies.

### Grab the .env variables

Run the command below to get the content of `.env.tpl` into `.env`

```shell
cp .env.tpl .env
```

### Setup psql

Before you go any further, you'll need to install postgres. [This article](https://www.tigerdata.com/blog/how-to-install-psql-on-mac-ubuntu-debian-windows) covers how to on Ubuntu, macOS and Windows.

When you're done with the postgres setup, you'll need to create a dev db. Start a postgres session with this command in your terminal

```shell
psql postgres
```

This takes you into the default interactive shell environment where you can write sql queries.

```sql
create database ghosted_local;
create role admin with login password 'dodo';
grant all privileges on database ghosted_local to admin;
```

If the above seems like a lot of work, you can simply do the following and you'll have a db created for you.

```shell
createdb ghosted_local
```

Now that you have a database, you need to run the migrations. with this command

```shell
pnpm db:migrate
```

### Create an Oauth app

For authentication, it is just ideal that I go with GitHub Oauth. At this point, you'll need to create an Oauth app.

Go to your [settings page](https://github.com/settings/developers) on GitHub and create a new one. Copy the `client_id` and `client_secret` and assign them as values to `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` repectively in your `.env` file.

Because Oauth apps can not have callback routes pointing to `http://localhost:3000`, i'd recommend you tunnel the app with ngrok so you get a temporary link to include as the callback or homepage URL.

With that said, you'd update the `NEXT_PUBLIC_APP_URL` variable with your ngrok link.

### Basic encryption

For session management, I'm doing something basic by encrypting the data via the crypto module. So you don't run into any error(s), you'll need to generate a passphrase with:

```shell
openssl rand -hex 32
```

Copy the result and assign it to `CRY_KEY` in the `.env` file.

### Email delivery

I use Resend to manage emails for the snapshot job. If you need to work on any bug/feature related to this, get an API key on [Resend](https://resend.com)

When you're done with the steps outlined, you can install the dependencies with `pnpm i` and start the dev server.

## Jobs

Upstash provides the jobs instantiation &mdash; bi-hourly and weekly. So you don't run into issues, I doubt you would though, so long as you don't `curl` the routes explicitly locally.

But, say, you get the urge to do so, please get the necessary API keys on [Upstash](https://upstash.com). You'd need to switch to the **QStash** tab, and create the respective jobs under **"Schedlues"**.

_[Sidenote]_: make sure to always do `pnpm format` before you push so the CI can pass.
