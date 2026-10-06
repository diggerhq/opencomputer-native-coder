# Rufus

This repository defines one native OpenComputer agent. Keep it deliberately
small: OpenComputer owns the coding harness, durable computer, GitHub runtime
credential, Slack routing, and long-running session lifecycle.

## Rules

- Keep repository identities and safety policy in `agent.ts`; do not add a
  custom Slack server, GitHub client, polling worker, or credential store.
- Request only the GitHub permissions the workflow needs.
- Cloudflare credentials stay in target-repository GitHub environments. The
  agent may dispatch and observe explicit Development or preview workflows but
  must never receive or use a reusable Cloudflare credential directly.
- Do not commit `.opencomputer/`, generated runtime artifacts, credentials, or
  local project bindings.
- Run `npm run check` before committing.
- Validate only against OpenComputer Development unless a new request names
  and authorizes an exact Production target.
