# PM2 Process Manager — A Practical Guide for AI Agents

> **Audience**: Autonomous or semi-autonomous software agents that need to launch, monitor, and recycle long-running Node/JavaScript (or any executable) processes without getting blocked.

---

## 1  What Is PM2?

PM2 is a **production-grade daemon process manager** for Node.js and generic binaries. It keeps applications *alive*, provides unified logging, supports clustering, and can generate OS-level startup scripts. Think of it as a lightweight supervisor (like `systemd`, `supervisord`) with a developer-friendly CLI and JSON API.

### Key Capabilities

| Capability | Why It Matters for Agents |
|------------|---------------------------|
| **Non-blocking starts** | `pm2 start …` returns immediately, letting your agent continue. |
| **Restart policies** | Auto-restart on crash, memory limit, or file changes (`--watch`). |
| **Unified logs** | Streams stdout/err to files you can tail or query. |
| **Named processes** | Address processes deterministically (`pm2 restart dev-server`). |
| **JSON output** | Machine-readable status via `pm2 jlist` or `pm2 show --json`. |
| **Startup scripts** | Survive host reboots (`pm2 startup` + `pm2 save`). |
| **Cluster mode** | Scale across CPU cores with zero code change. |

---

## 2  When to Choose PM2

| Use PM2 if… | Consider something else if… |
|-------------|---------------------------------------------|
| You need **multiple** background services with life-cycle control. | You only need a *single* short-lived script — use `&` or `nohup`. |
| Your agent must parse structured status info. | You require full container orchestration — use Docker/K8s. |
| You want transparent log rotation & retention. | You’re already using `systemd` units per app and prefer its tooling. |

PM2 shines during **development** (hot reload, pretty `pm2 monit`) *and* in small-to-medium production deployments where you control the host.

---

## 3  Installation

```bash
npm install -g pm2           # or: yarn global add pm2
pm2 -v                       # verify
```

> **Tip**: Pin a specific major version in CI/agent environments to avoid surprises.

---

## 4  Basic Workflow Cheatsheet

| Action | Command | Notes |
|--------|---------|-------|
| Start a script | `pm2 start npm --name dev -- run dev` | Wraps any `npm run` script. |
| List processes | `pm2 list` | One-line table. |
| Machine list | `pm2 jlist` | Raw JSON — ideal for agents. |
| Show details | `pm2 show dev` | Add `--json` for JSON. |
| Live logs | `pm2 logs dev` | Use `--lines 100` for tail. |
| Restart | `pm2 restart dev` | Zero-downtime if Node cluster mode. |
| Stop | `pm2 stop dev` | Keeps entry in table. |
| Delete | `pm2 delete dev` | Removes from PM2 state file. |
| Watch & reload | `pm2 start app.js --watch` | Restart on file change. |

---

## 5  Persistent Reboots

```bash
pm2 startup            # detect init system & print command
sudo env PATH=$PATH pm2 startup <init> -u <user> --hp <home>
pm2 save               # save current process list
```

*Agents should run `pm2 save` after **every change** (start/stop/delete) if they rely on reboot persistence.*

To disable:
```bash
pm2 unstartup
```

---

## 6  Log Management

* Default location: `~/.pm2/logs/<name>-out.log` and `-error.log`.
* `pm2 logs` aggregates in real time.
* `pm2 flush` empties all logs; rotate manually or with `pm2 install pm2-logrotate`.

Agents can tail logs:
```bash
tail -n 50 -F ~/.pm2/logs/dev-out.log &
```
Or parse structured output you emit as JSON.

---

## 7  Using an Ecosystem File (Multi-service Config)

`ecosystem.config.js` example:
```js
module.exports = {
  apps: [
    {
      name: "dev-server",
      script: "npm",
      args: "run dev",
      cwd: "/workspace/myapp",
      watch: true,
      env: { NODE_ENV: "development" },
    },
    {
      name: "api",
      script: "dist/index.js",
      instances: 4,
      exec_mode: "cluster",
    },
  ],
};
```
Run with `pm2 start ecosystem.config.js`, then manage by *name* (`pm2 restart api`).

An agent can generate or patch this JSON on the fly, start it once, and rely on names thereafter.

---

## 8  Programmatic Control Patterns

### 8.1  Shell-only Agents

1. **Spawn**
   ```bash
   pm2 start npm --name dev -- run dev
   ```
2. **Poll status** every few seconds:
   ```bash
   pm2 jlist | jq -e '.[] | select(.name=="dev" and .pm2_env.status=="online")'
   ```
3. **Trigger actions** (`restart`, `stop`) based on conditions.

### 8.2  Node.js Agents (API)

```js
import pm2 from 'guides/pm2';

pm2.connect(() => {
   pm2.start({
      name: 'dev',
      script: 'npm',
      args: 'run dev',
   }, err => {
      if (err) throw err;
      pm2.disconnect();
   });
});
```

### 8.3  Python Agents (CLI Parsing)

```python
import json, subprocess, time

def wait_online(name, timeout=120):
    deadline = time.time() + timeout
    while time.time() < deadline:
        j = json.loads(subprocess.check_output(['pm2', 'jlist']))
        if any(p['name']==name and p['pm2_env']['status']=='online' for p in j):
            return True
        time.sleep(2)
    return False
```

---

## 9  Example End-to-End Flow for an AI Agent

1. **Ensure PM2 installed** (or install globally).
2. `pm2 start npm --name dev -- run dev`
3. **Wait until online** using `pm2 jlist`.
4. **Tail logs** to detect "Compiled successfully".
5. **Interact with the running service** (e.g., open http://localhost:3000).
6. On code change **restart**: `pm2 restart dev`.
7. **Persist**: `pm2 save` (if reboots matter).
8. **Cleanup**: `pm2 delete dev` when done.

---

## 10  Troubleshooting

| Symptom | Fix |
|---------|-----|
| Process restarts repeatedly | Check exit code with `pm2 logs`, fix underlying error. |
| App doesn’t auto-start after reboot | Re-run `pm2 startup` & `pm2 save`, verify root permissions. |
| High memory | Use `--max-memory-restart 500M` to auto-restart. |
| Logs too big | Install `pm2-logrotate` or run `pm2 flush`. |
| PM2 itself crashes | Update Node & PM2, or run via `pm2-runtime` in Docker. |

---

## 11  Further Reading

* [PM2 Official Docs](https://pm2.keymetrics.io/)
* [Quick Start Guide](https://pm2.keymetrics.io/docs/usage/quick-start/)
* [Startup Script Guide](https://pm2.keymetrics.io/docs/usage/startup/)
* [Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
* [API Reference](https://pm2.keymetrics.io/docs/usage/pm2-api/)

---

*Updated Jul 24 2025*
