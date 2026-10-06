# Rufus

Rufus is a long-running OpenComputer coding agent for the three
Serverless Agents repositories. A Slack mention starts a durable session. The
agent clones the selected repository into its persistent workspace, follows the
repository instructions, edits code, runs tests, and opens draft pull requests.
Replies in the same Slack thread continue the same session, checkout, branch,
and pull request after the local deploy command has exited.

The implementation is intentionally native and small. There is no custom Slack
receiver, queue, worker, GitHub wrapper, or agent loop. OpenComputer supplies
the coding harness, computer, durable session, GitHub credential refresh, and
Slack ingress/replies.

## Source

`opencomputer/project.ts` declares the project and its single `rufus` agent.
`opencomputer/agents/rufus/agent.ts` declares the managed GitHub permissions,
selects the model and built-in shell, and defines the repository workflow and
safety policy.

The GitHub installation selection is the hard repository boundary. The prompt
also names the three intended repositories, but prompt text is not an access
control. Install the managed App only on:

- `diggerhq/serverless-agents-ws`
- `diggerhq/opencomputer`
- `diggerhq/blue`

## Verify locally

Prerequisites: Node.js 22 or later.

```bash
npm install
npm run check
```

`doctor` is local and side-effect-free. It validates the OpenComputer project
without logging in or contacting the service.

## Deploy to Development

```bash
npm run opencomputer -- login
npm run opencomputer -- link --create-project "rufus"
npm run deploy
```

The one-shot deploy advances `development` and exits. No local process must
remain running.

Connect the managed GitHub App to Development:

```bash
npm run opencomputer -- github connect --environment development
npm run opencomputer -- github status --json
```

In GitHub, select only the three repositories listed above. The short-lived
installation token is available to code inside the agent computer, so anyone
who can direct the Slack bot can exercise the installation's declared authority.
The App may write repository contents and pull requests, read checks, and
dispatch GitHub Actions. Cloudflare credentials stay in repository environments
and Actions secrets; they are never installed in the agent computer.

## Cloudflare Development verification

Rufus can close the loop after opening a draft pull request when an owning
repository provides an existing GitHub Actions workflow for a specifically
named Development or preview target. It may:

1. inspect the workflow and applicable repository instructions;
2. dispatch the workflow for the exact pushed branch or commit;
3. watch its checks and capture the workflow and deployment URLs;
4. run the repository-owned smoke or health check against that deployment; and
5. fix its branch and repeat the same non-production verification.

This repository deliberately does not hold a Cloudflare API token. Each target
repository owns its Wrangler configuration, GitHub environment, secrets,
deployment workflow, and cleanup policy. A target repository is ready for this
loop only when it has a workflow that:

- names Development or preview in both its UI and configuration;
- cannot select a Production environment or Production Wrangler config;
- accepts a branch or immutable commit as input;
- emits the deployment URL and runs a bounded smoke check; and
- uses GitHub environment protection and scoped Cloudflare credentials.

If that contract is absent, Rufus reports the missing capability. It must not
create a direct credential path or repurpose a Production workflow.

## Connect Slack

Open the project URL printed by deploy, select **Development**, then open
**Connections → Slack**:

1. Choose **Create Slack bot** and name it.
2. In Slack's app settings, generate an App configuration access token for the
   intended workspace and paste the access token into OpenComputer.
3. Approve the installation in Slack.
4. Invite the bot to a private engineering channel and mention it once.

OpenComputer consumes the configuration token once and does not store it.
Development and Production have separate Slack credentials and thread routing.

## Try it

Start with a bounded read/test task:

> @Rufus Clone diggerhq/blue, read its repository instructions, run
> the narrowest tests for Slack event parsing, and report the exact commands and
> results. Do not change files.

Then try a change:

> @Rufus In diggerhq/opencomputer, fix the selected issue. Start from
> the fetched default branch, add focused tests, run the relevant checks, and
> open a draft PR. If that repository has an explicitly non-production
> Cloudflare workflow, deploy this branch there, run its smoke check, and keep
> improving the branch until it passes. Do not deploy Production or merge.

Continue in the same Slack thread to update the same branch and PR. Start a new
thread for independent work.

## Security and operating boundary

- GitHub permissions are limited to Actions, checks, repository contents, pull
  requests, and metadata; GitHub repository selection limits which repositories
  are reachable.
- The agent may execute repository test code in its isolated computer. Treat
  repository content and test scripts as untrusted.
- The agent never deploys or mutates Production. It can dispatch only an
  existing repository-owned Development or preview workflow and never receives
  reusable Cloudflare credentials.
- Slack identity is not mapped to GitHub ACLs. Restrict who can invoke the bot
  by controlling the Slack conversations it joins and the repositories granted
  to the GitHub installation.
- Existing sessions remain pinned to the deployment with which they started.
  Redeploying affects new conversations, not an already-running thread.
