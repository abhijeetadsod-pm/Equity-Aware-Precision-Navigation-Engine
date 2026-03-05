# Equity-Aware Precision Navigation Engine (React Prototype)

This is a **demo app** you can run on your own computer.
It does not need a backend or database.

## Easiest way to view it (non-technical steps)

### 1) Install 2 tools once
- **Node.js (LTS)**: https://nodejs.org
- **Visual Studio Code**: https://code.visualstudio.com (optional, but helpful)

After installing Node.js, restart your computer once if prompted.

### 2) Open the project folder
If someone sent you this project as a zip:
- Unzip it.
- Remember the folder location.

### 3) Open a terminal in that folder
- **Windows**: Open the folder, right-click inside it, choose **"Open in Terminal"**.
- **Mac**: Open Terminal app, type `cd ` (with a space), then drag the folder into Terminal and press Enter.

### 4) Install app packages (one-time)
Run:

```bash
npm install
```

Wait until it finishes.

### 5) Start the demo
Run:

```bash
npm run dev
```

You will see a line with a local address, usually:
- `http://localhost:5173/`

Open that link in your browser.

---

## What you should see
- A **Patient Selector** with Patient A, B, and C.
- A **Rule Engine** section with an **Enable Equity Amplification** toggle.
- A **Priority Banner** showing High/Standard/Low priority.
- A **Why is this patient ...?** explanation section.
- **Recommended Actions** buttons (clicking them shows a confirmation toast message).
- A **Metrics Dashboard** that updates as you switch patients and toggle rules.

---

## Quick demo walkthrough
1. Keep **Enable Equity Amplification = ON**.
2. Click **Patient A** → should show **High Priority**.
3. Click **Patient B** → should show **Standard Priority**.
4. Click **Patient C** → should show **Low Priority**.
5. Turn **Enable Equity Amplification = OFF**.
6. Go back to **Patient A** → now uses NCCN score only (not equity signals in tier assignment).

---

## If something goes wrong

### "npm" command not found
Node.js is not installed correctly. Reinstall from https://nodejs.org and reopen terminal.

### "403" or package download error during `npm install`
This is usually a network or company firewall restriction.
Try:
- A different network (e.g., home Wi-Fi)
- VPN off/on depending on your company policy
- Asking IT to allow access to `registry.npmjs.org`

### Port already in use
If `npm run dev` says the port is busy, run:

```bash
npm run dev -- --port 5174
```

Then open the new URL shown in terminal.
