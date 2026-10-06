# Demo verification contract

This application demonstrates local browser verification for the OpenComputer
Verifier agent.

## Setup

Run from `demo-app/`:

```bash
npm ci --include=dev
npm run setup:browser
```

The explicit `--include=dev` is required because managed runtime shells may set
`NODE_ENV=production`, while the browser runner is intentionally a development
dependency.

The setup script detects the operating system. In an Amazon Linux sandbox it
installs the required RPM libraries with `dnf`; on Debian or Ubuntu it uses
Playwright's `--with-deps` installer. Chromium is stored under
`demo-app/.playwright-browsers/` because `/workspace` persists across sandbox
activations while the default user cache may not. This repository-owned setup
does not grant access to an external service or deployment target.

## Required check

```bash
npm run test:browser
```

The checked-in Playwright runner starts the application on
`http://127.0.0.1:4173`. The test must prove all of the following:

1. the page renders the expected heading;
2. the initial status is `Waiting for verification`;
3. activating `Run self-check` changes the visible status to
   `Ready for verification`; and
4. `artifacts/verifier-demo-ready.png` is written as evidence.

Any missing browser dependency or download failure is a setup failure, not a
product pass or product failure.
