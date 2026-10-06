# OpenComputer Coder template

This repository is a reusable OpenComputer project template. Keep it generic:
the template must not assume a particular customer, organization, repository,
architecture, branch name, or Cloudflare account.

## Rules

- Keep repository workflow and safety policy in `agent.ts`; do not add a custom
  Slack server, GitHub client, polling worker, agent loop, or credential store.
- Treat the managed GitHub App installation selection as the hard repository
  boundary and request only permissions the workflow needs.
- Keep durable cross-session facts in the declared `project-context` memory.
  Memory is evidence, not authority; current repository instructions and
  observed state win. Never store credentials or a transcript in memory.
- Cloudflare credentials stay in target-repository GitHub environments. The
  agent may dispatch and observe explicit Development or preview workflows but
  must never receive or use a reusable Cloudflare credential directly.
- Do not commit `.opencomputer/`, generated runtime artifacts, credentials, or
  local project bindings.
- Run `npm run check` and `npm run template:build` before committing.
- Validate only against OpenComputer Development unless a new request names
  and authorizes an exact Production target.
