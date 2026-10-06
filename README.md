# Durable Cloudflare Coder

A reusable OpenComputer template for a long-running coding agent. It works in
the GitHub repositories selected during installation, retains concise project
context across sessions, opens draft pull requests, and can verify branches
through repository-owned Cloudflare Development or preview workflows.

[Create this project in OpenComputer](https://app.opencomputer.dev/new?repository-url=https%3A%2F%2Fgithub.com%2Fdiggerhq%2Fopencomputer-native-coder)

The implementation is intentionally native and small. OpenComputer supplies
the coding harness, durable computer and sessions, memory tools, short-lived
GitHub credentials, and optional Slack routing. This project does not add a
custom receiver, queue, GitHub wrapper, agent loop, or Cloudflare credential.

## What the template creates

- one `coder` agent using the built-in shell;
- a managed GitHub App connection scoped by the repositories you select;
- a 16 KiB `project-context` document-memory resource; and
- policy for changes, draft pull requests, non-production Cloudflare deploys,
  smoke checks, iteration, and evidence-based reporting.

Repository selection is the hard access boundary. The agent discovers project
structure and operating rules from each repository's `AGENTS.md`, README,
workflows, and current Git/GitHub state. Nothing in this template is tied to a
specific organization or target repository.

## Install as a template

Open the link above, choose a project name, and connect GitHub. Select only the
repositories this agent should be able to change. The App may write repository
contents and pull requests, read checks, and dispatch GitHub Actions, so keep
the selection narrow.

The template intentionally has no automatic first run. `useMemory()` requires
an explicit session binding, and starting without one would fail before the
model runs. Create the durable document once, then bind it whenever you create
a session that should share this project context:

```bash
npm install
npm run opencomputer -- login
npm run opencomputer -- link --project <project-id-or-slug>
npm run opencomputer -- memory create project-context main \
  --title "Project context"
npm run opencomputer -- session create \
  --agent coder \
  --memory project-context=main:read-write \
  --keep \
  "Inspect the connected repository and report setup readiness. Do not change files."
```

Use the same `project-context=main` binding for independent sessions that
should share durable context. The agent updates only concise verified facts:
repository ownership, governing instructions, decisions, current branches and
draft PRs, verification results, safe deployment targets, and unresolved
risks. It does not save credentials or conversational transcripts. Freeze the
document if you want read-only memory:

```bash
npm run opencomputer -- memory freeze project-context main
```

Any channel or automation that creates sessions must bind that same document.
Existing sessions stay pinned to the deployment and memory binding with which
they started.

## Develop and validate the template

Prerequisite: Node.js 22 or later.

```bash
npm install
npm run check
npm run template:validate
npm run template:build
```

`doctor` and the template checks are local and side-effect-free. To work on a
project created from the template, link that checkout to its Development
project and deploy normally:

```bash
npm run opencomputer -- login
npm run opencomputer -- link --project <project-id-or-slug>
npm run deploy
npm run opencomputer -- github connect --environment development
```

The one-shot deploy advances Development and exits. No local process needs to
remain running.

## Cloudflare verification contract

The agent can close the loop only when a target repository already provides a
GitHub Actions workflow for an explicitly named Development or preview target.
That workflow should:

- name Development or preview in both its UI and configuration;
- be unable to select a Production environment or Production Wrangler config;
- accept an exact branch or immutable commit;
- emit the deployment URL and run a bounded smoke or health check; and
- use GitHub environment protection and narrowly scoped Cloudflare credentials.

The agent inspects that contract before dispatch, observes the workflow run,
records the URL, runs the repository-owned verification, and can fix its branch
and repeat. If the contract or required credentials are missing, it reports
the missing capability instead of gaining direct Cloudflare access.

## Try it

Start read-only:

> Inspect the connected repository, read all applicable agent instructions,
> identify its default branch and verification commands, and record a concise
> setup summary in project memory. Do not change files.

Then request a bounded change:

> Fix the selected issue on a new branch, add focused tests, run the relevant
> checks, and open a draft PR. If the repository has an explicitly
> non-production Cloudflare workflow, deploy this exact branch there, run its
> smoke check, and improve the branch until it passes. Do not deploy Production
> or merge.

## Security boundary

- GitHub repository selection limits which repositories are reachable.
- The agent may execute repository code in its isolated computer; treat it as
  untrusted.
- Cloudflare credentials remain in repository-owned GitHub environments and
  never enter the agent computer or memory.
- The agent never deploys or mutates Production without a separately named and
  explicitly authorized target.
- Slack identity is not automatically mapped to GitHub ACLs. Restrict who can
  invoke the bot through channel membership and the GitHub installation scope.
