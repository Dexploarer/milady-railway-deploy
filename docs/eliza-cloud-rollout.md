# Eliza Cloud Rollout Plan

This document defines the Eliza Cloud rollout as three user-facing hosting paths that all share one onboarding entry point.

## Product paths

1. Local
   The backend runs on the user's machine with the current full-local behavior and full local permissions.

2. Eliza Cloud
   The frontend provisions and connects to a managed container through Eliza Cloud at `elizacloud.ai`.

3. Remote Milady backend
   The frontend connects to an already running Milady backend by address plus access key (`MILADY_API_TOKEN`).

## Architecture

### App onboarding

- Add a hosting-choice screen before provider setup.
- Local continues into the existing provider selection flow.
- Cloud splits into:
  - `Eliza Cloud`: submit onboarding with `runMode: "cloud"` and `cloudProvider: "elizacloud"`.
  - `Remote Milady`: switch the frontend API base to the remote backend and restart app bootstrap against that target.
- Persist the selected API base in session storage so reloads and popouts keep the same backend.
- Keep the existing RPC step, but treat Eliza Cloud as ready when the user is authenticated or has entered a cloud API key.

### Self-hosted remote backend

- The backend stays the canonical Milady API server.
- Browser clients must send a bearer token using `MILADY_API_TOKEN`.
- CORS must explicitly allow the frontend origin with `MILADY_ALLOWED_ORIGINS`.
- The onboarding access key shown to the user is the same value as `MILADY_API_TOKEN`.

### Eliza Cloud control plane

- `elizacloud.ai` should point at the production `eliza-cloud-v2` deploy.
- There is no separate Milady-specific cloud API service beyond that deploy.
- Eliza Cloud is the control plane, OAuth handler, billing surface, and user store.
- The deploy should use `NEXT_PUBLIC_APP_URL=https://elizacloud.ai`.
- Managed launches should redirect into `app.milady.ai` with a one-time launch session that injects the selected backend connection and skips onboarding.

### Railway deployment

- Deploy `eliza-cloud-v2` as a dedicated Railway service.
- Use the root `railway.toml` to standardize:
  - `builder = "RAILPACK"`
  - `startCommand = "bun run start"`
  - `healthcheckPath = "/login"`
- Attach the custom domain `elizacloud.ai`.
- Terminate TLS at Railway and keep the public app URL pinned to the custom domain.

## Operator checklist

### Milady app and API

- [x] Restore hosting-choice onboarding in the app.
- [x] Add `Eliza Cloud` and `Remote Milady` cloud sub-options.
- [x] Allow the frontend client to rebind to a remote backend during onboarding.
- [x] Persist the rebound API base for the current session.
- [x] Update cloud defaults and user-facing copy to Eliza Cloud.
- [x] Persist an Eliza Cloud API key during onboarding when the user chooses API-key auth.

### Self-hosted remote flow

- [x] Document secure remote backend deployment in the README.
- [x] Document address + access-key connection flow in the README.
- [x] Document Tailscale as the preferred private-network exposure path.
- [ ] Add a dedicated in-app "switch backend" settings surface after onboarding.
- [ ] Add a remote-backend connectivity diagnostic screen for auth/CORS/WS failures.

### Eliza Cloud control plane

- [x] Brand `eliza-cloud-v2` login metadata for Eliza Cloud.
- [x] Brand the CLI confirmation page for Eliza Cloud.
- [x] Add Railway config-as-code with a login healthcheck.
- [ ] Finish branding the rest of the `eliza-cloud-v2` dashboard shell, metadata, and public pages.
- [ ] Point all production cloud URLs and emails at `elizacloud.ai`.
- [ ] Update OAuth redirect allowlists in the auth provider configs for `elizacloud.ai`.
- [ ] Verify post-login session redirects and popup flows end-to-end against the Milady app.

### Infrastructure and release

- [ ] Create the Railway production project and attach `elizacloud.ai`.
- [ ] Set production secrets in Railway for auth, database, billing, queueing, and any container-provisioning providers used by `eliza-cloud-v2`.
- [ ] Run a production smoke test:
  - Local onboarding
  - Eliza Cloud provisioning
  - Remote self-host attach by URL + token
  - Desktop download flow from the homepage
- [ ] Cut a Milady release after the hosted flow is verified on the public domain.

## Remote backend deployment recipe

Use this when the user wants to host their own backend and connect from the Milady web frontend.

1. Install Milady on the target machine.
2. Set a non-loopback bind, a strong API token, and explicit allowed origins.
3. Expose the service over HTTPS or a private Tailscale URL.
4. In onboarding, choose `Cloud` -> `Remote Milady`, then enter:
   - backend address
   - access key (`MILADY_API_TOKEN`)

Recommended environment:

```bash
MILADY_API_BIND=0.0.0.0
MILADY_API_TOKEN=$(openssl rand -hex 32)
MILADY_ALLOWED_ORIGINS=https://elizacloud.ai,https://milady.ai
```

Optional Tailscale exposure:

```bash
tailscale serve --https=443 http://127.0.0.1:2138
```

For a public Tailscale-hosted URL:

```bash
tailscale funnel --https=443 http://127.0.0.1:2138
```

## Railway service recipe

Use this when deploying Eliza Cloud for Milady.

1. Deploy `eliza-cloud-v2` to Railway from its repo root.
2. Keep `NEXT_PUBLIC_APP_URL=https://elizacloud.ai`.
3. Attach the custom domain in Railway and wait for the managed certificate.
4. Point DNS for `elizacloud.ai` at the Railway-issued target.
5. Validate `/login` and `/auth/cli-login?session=test-session` before opening the public rollout.

The production enactment checklist now lives in `docs/eliza-cloud-deployment.md`.
