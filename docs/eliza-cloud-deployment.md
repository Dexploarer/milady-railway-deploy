# Eliza Cloud Deployment Runbook

Use this runbook to put Eliza Cloud live for Milady at `https://elizacloud.ai`.

## Scope

This deploy has two codebases:

1. `milady`
   The local app, onboarding flow, homepage, and remote-backend attach flow.

2. `../eliza-cloud-v2`
   The Eliza Cloud control plane that will run on Railway.
   This is the only managed server/control-plane deploy for Eliza Cloud.

## Code state

The code-side work is already in place:

- Local / Cloud / Remote onboarding is wired in the Milady app.
- Eliza Cloud branding and URL defaults are wired through the app.
- Managed launches now hand off from `elizacloud.ai` to `app.milady.ai` with one-time launch sessions.
- Railway config-as-code exists in `../eliza-cloud-v2/railway.toml`.
- The Railway env template exists at `../eliza-cloud-v2/deploy/milady-cloud.railway.env.example`.

## What you need before touching Railway

- A production Postgres database for `elizacloud.ai`
- A production Redis instance (or Upstash REST credentials)
- A Privy app for Eliza Cloud
- At least one production AI provider key
- A deployed Milady web frontend at `https://app.milady.ai`
- DNS control for `milady.ai`
- Railway project access

For full managed Eliza Cloud provisioning, you also need:

- AWS credentials and ECS/ECR/shared ALB resources
- A wildcard TLS certificate for `*.containers.elizacloud.ai`
- JWT signing keys plus a `GATEWAY_BOOTSTRAP_SECRET`
- If you want hosted user apps, a domain policy such as `apps.elizacloud.ai`

## Railway enactment

1. Create a Railway project from `../eliza-cloud-v2`.
2. Keep the root directory at the repo root.
3. Confirm Railway detects `railway.toml`.
4. Copy the variables from `../eliza-cloud-v2/deploy/milady-cloud.railway.env.example`.
5. Replace every placeholder with production values.
6. Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL` to `https://elizacloud.ai`.
7. Set `NEXT_PUBLIC_MILADY_APP_URL` to `https://app.milady.ai`.
8. Set `ELIZA_CLOUD_AGENT_BASE_DOMAIN` to the public managed-agent zone, for example `containers.elizacloud.ai`.
9. If you are enabling hosted apps, set `APP_DOMAIN` to the hosted app zone you want to use.
10. If you are enabling managed provisioning, fill the full AWS/ECS/JWT block before first public test.

## DNS

1. In Railway, attach the custom domain `elizacloud.ai`.
2. Railway will issue the target record for the subdomain.
3. In your DNS provider, create the `cloud` record exactly as Railway instructs.
4. Wait for Railway to finish certificate provisioning before smoke testing login.

If you also want hosted app subdomains, create the wildcard DNS you choose for `APP_DOMAIN`.
Example: `*.apps.elizacloud.ai`.

If you also want container hostnames, create the wildcard DNS for `*.containers.elizacloud.ai` and make sure the wildcard certificate ARN in AWS matches that domain.

Deploy the Milady app frontend separately at `app.milady.ai`. Eliza Cloud redirects there and exchanges a one-time launch session to attach the frontend to the selected managed backend.

## Auth and OAuth

### Privy

Configure the Privy app used by Eliza Cloud with:

- Allowed domain: `elizacloud.ai`
- App URL: `https://elizacloud.ai`
- Webhook endpoint: `https://elizacloud.ai/api/privy/webhook`

### Provider callback URLs

Add the Eliza Cloud callbacks for every provider you actually enable:

- Generic OAuth providers: `https://elizacloud.ai/api/v1/oauth/{platform}/callback`
- Twitter/X automation: `https://elizacloud.ai/api/v1/twitter/callback`
- Discord bot OAuth: `https://elizacloud.ai/api/v1/discord/callback`

If you do not enable a provider yet, do not configure it yet.

## Billing and email

If billing is going live:

- Stripe webhook endpoint: `https://elizacloud.ai/api/stripe/webhook`
- Set all Stripe keys and price IDs in Railway

If transactional email is going live:

- Set SendGrid or SMTP credentials
- Set the sender to a mailbox such as `noreply@elizacloud.ai`

## Launch smoke test

Run these checks after Railway finishes deploying and the custom domain is green:

1. Open `https://elizacloud.ai/login?returnTo=%2Fdashboard%2Fmilady`
2. Open `https://www.elizacloud.ai/auth/cli-login?session=test-session`
3. Open `https://elizacloud.ai/api/health`
4. Verify the homepage `Get the app` and `Eliza Cloud` CTAs on `milady`
5. In the Milady app onboarding:
   - `Local` starts a local backend
   - `Cloud -> Eliza Cloud` reaches Eliza Cloud
   - `Cloud -> Remote Milady` accepts backend URL + access key
6. Test a real remote self-hosted backend using `MILADY_API_TOKEN`
7. If managed provisioning is enabled, create one Eliza Cloud instance, launch it from `/dashboard/milady`, and confirm `app.milady.ai` opens already attached with onboarding skipped

## What you still must do manually

These actions are intentionally not automated inside the repo:

- Create the Railway project and populate secrets
- Create the production Postgres and Redis instances
- Point DNS for `elizacloud.ai`
- Configure Privy production domains and webhook
- Configure any provider callback allowlists you enable
- Configure Stripe webhook and live price IDs if billing is enabled
- Configure AWS/ECS resources if managed provisioning is enabled

## Fastest path to first production test

If your goal is the first live Eliza Cloud smoke test with the fewest moving parts:

1. Deploy only Eliza Cloud to Railway
2. Set Postgres, Redis, Privy, `CRON_SECRET`, and one AI key
3. Point `elizacloud.ai`
4. Verify login and docs on the custom domain
5. Test Milady app onboarding against `Cloud -> Eliza Cloud`

Then add billing, hosted app domains, and managed AWS provisioning once the base Eliza Cloud deployment is stable.
