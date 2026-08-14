# FaceFile 💬  
Remember every face, every name — using science‑backed spaced repetition.

## What It Does
- Add colleagues with their **name**, **photo**, and **personal notes**
- Get **quizzed immediately** after adding someone (retrieval practice)
- See **scheduled reviews** via the **SM‑2 spaced repetition algorithm** right before you'd forget them
- Two quiz modes randomly mixed:
  - **Face → Name**
  - **Name → Face**
- Auto‑scheduled reminders appear on your dashboard when you log in

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Angular 19 · standalone components · signals · Tailwind CSS v3 |
| Backend | Node.js + Express |
| Database | DynamoDB |
| Scheduling | node-cron hourly check |
| Spaced Repetition | SM‑2 algorithm |
| Deployment | AWS Lambda - dynamoDB - AWS API Gateway - Route53 - ALB - CloudFormation  | 
| Local Deployment | Node server - local dynamoDB | 

Note: The application can be run locally, or it can be run in AWS. The code has layer separation so that the AWS Lambda code is completely separate as plumbing from the endpoints exposed.

## Running Locally

For WSL setup prerequisites, see [docs/dev/wsl/README.md](docs/dev/wsl/README.md).

**Prerequisites:** Node.js 22+

### 1. Backend

```bash
cd backend
cp .env.example .env      # configure DATABASE_URL, JWT secrets, FRONTEND_URL
npm install
npm run db:migrate        # creates SQLite DB and runs migrations
node prisma/seed.js       # seeds the default user (id=1)
npm run dev               # starts on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm install @rollup/rollup-win32-x64-msvc  # fixes npm optional-deps bug on Windows
npx @angular/cli@21 serve                  # starts on http://localhost:4200
```

Open [http://localhost:4200](http://localhost:4200) — API calls proxy automatically to the backend.

---

## AI-Assisted Development

### Cursor

1. Open the repo root in Cursor (`File → Open Folder`).
2. Cursor picks up `.claude/` and `CLAUDE.md` automatically for context — no extra config needed.
3. Start both servers (backend on 3001, frontend on 4200) as described above before asking Cursor to run or test anything.
4. Use Cursor's **Composer** (Ctrl+I / Cmd+I) for multi-file edits. Paste a story file from `docs/capabilities/` as context when working on a specific feature.

### Claude Code

[Claude Code](https://claude.ai/code) is a CLI that runs alongside your editor and has direct filesystem access.

**Install and launch:**

Install Claude Code by following the [official setup guide](https://code.claude.com/docs/en/setup#install-claude-code), then:

```bash
cd C:/Users/<you>/work/facefile
claude
```

**First-time setup in the session:**

```
> start the backend and frontend servers
```

Claude Code reads `CLAUDE.md` on startup — project conventions, the SM-2 data flow, and the single-user auth note are all pre-loaded into context.

**Useful prompts to get started:**

```
> run the backend in dev mode
> run the frontend dev server
> run the e2e tests
> /code-review          # review current branch changes
> /run                  # launch and smoke-test the app
```

**Tips:**
- Keep both servers running in separate terminals; Claude Code can start them for you with `! npm run dev` in each directory.
- The `.claude/prompt-snippets/` folder contains detailed conventions (e2e test layering, story format) — Claude Code loads these when relevant tasks are requested.
- Use `! <command>` in the Claude Code prompt to run a shell command and pipe its output directly into the conversation.

---

## Figma Design Integration

### Prerequisites

1. **Figma account** with access to the FaceFile design file.
2. A **Figma Personal Access Token** — generate one at Figma → Account Settings → Security → Personal access tokens.

---

### Cursor (and VS Code)

Install the official **Figma for VS Code** extension:

- Extension ID: `figma.figma-vscode-extension`
- Or search "Figma for VS Code" in the Extensions panel (Ctrl+Shift+X)

**Connect your account:**

1. Open the Command Palette (Ctrl+Shift+P) and run `Figma: Sign in`.
2. Paste your Personal Access Token when prompted.

**Usage:**

- Open any `.ts`, `.html`, or `.css` file, then click a Figma frame link — the extension renders the design alongside your code.
- In Dev Mode, right-click any element in Figma and copy its **link** (`Copy link to selection`). Paste it into the extension's link bar to jump directly to that node.
- CSS values, spacing tokens, and asset exports are available in the Dev panel on the right.

---

### Claude Code (via Figma MCP)

Claude Code can read Figma files directly through the **Figma MCP server**, letting you prompt Claude with design context without copy-pasting.

**1. Add your token to the environment**

Add to `backend/.env` (or your shell profile so it's globally available):

```
FIGMA_API_KEY=your_personal_access_token_here
```

**2. Register the MCP server with Claude Code**

```bash
claude mcp add figma npx -- -y figma-developer-mcp --figma-api-key=YOUR_TOKEN_HERE
```

This writes the server entry into your local Claude Code config. Restart Claude Code after running it.

**3. Verify the connection**

```
> /mcp
```

You should see `figma` listed as a connected server.

**Usage:**

Paste a Figma file URL or frame link into your prompt and Claude Code will fetch the node tree, styles, and layout directly:

```
> Here's the design for the quiz card: <figma-url>
> Implement it using Tailwind classes in the existing QuizCardComponent.
```

**Tip:** Share the URL to a specific frame or component rather than the whole file — it keeps the fetched context focused and avoids hitting token limits.
