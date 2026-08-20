# Fixed Income Order Execution System

This is a capstone project for a broker-dealer style fixed income trading platform. It is built with Next.js, TypeScript, Tailwind CSS, Recharts, and Lucide icons. The application currently uses static JSON data to simulate market instruments, trades, portfolios, news, rates, and admin data. There is no backend or database yet.

The product brief, data requirements, page requirements, and design system are in [prompt.MD](prompt.MD). Read it before starting a feature. The repository also includes contribution guidance in [AGENTS.md](AGENTS.md).

## Quick Start

### 1. Install the prerequisites

- Node.js 20 or newer
- Git
- VS Code (recommended)
- A GitHub account if you want to use GitHub Copilot

### 2. Clone and install

```bash
git clone <repository-url>
cd capstone
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Next.js will refresh the page as you edit files.

### 4. Check your work

Run these commands before opening a pull request:

```bash
npm run lint
npm run build
```

## Project Structure

```text
app/          Routes and page layouts (Next.js App Router)
components/   Reusable UI, layout, order, and chart components
data/         Static JSON data used by the demo application
lib/           Types, data-access functions, theme, and utilities
public/       Public assets
scripts/      Data-generation scripts
```

All static application data lives in the [data](data) folder. If you are working on instruments, trades, portfolios, rates, news, benchmarks, dealers, or any other data-related feature, start by checking the relevant JSON file there. Update the JSON in `data/` when the demo data needs to change, then use the typed functions in [lib/data.ts](lib/data.ts) rather than importing JSON directly into components. Add or update interfaces in [lib/types.ts](lib/types.ts) when a data shape changes. Keep reusable visual behavior in `components/` instead of duplicating it inside pages.

## Recommended AI-Assisted Development Workflow

AI tools can speed up development, but every generated change must still be reviewed, run, and tested by the contributor.

### Step 1: Understand the feature

1. Read [prompt.MD](prompt.MD) and the relevant existing page or component.
2. Check the current application in the browser with `npm run dev`.
3. Decide the smallest useful change. Avoid changing unrelated files.

### Step 2: Develop the idea with Claude

Before asking an implementation tool to write code, describe the idea on the Claude website. Include:

- What user problem the feature solves
- Which route or workflow it affects
- The data it needs
- How it should look and behave
- Any edge cases or validation rules

Ask Claude to turn the discussion into a precise implementation prompt. The prompt should name the files to inspect, expected behavior, constraints from [prompt.MD](prompt.MD), and acceptance criteria. Review that prompt before giving it to a coding agent.

### Step 3: Implement with VS Code and GitHub Copilot

1. Open the repository in VS Code.
2. Install or enable the **GitHub Copilot** and **GitHub Copilot Chat** extensions.
3. Sign in to GitHub inside VS Code when prompted.
4. Open the Copilot Chat view and choose **Agent** mode. In some VS Code versions this is called the **Agent window** or **Agent mode**.
5. Give Copilot the reviewed prompt and ask it to inspect the relevant files before editing.
6. Ask it to work in small steps. After each step, inspect the diff and run the relevant check.

Useful context to include in a Copilot request:

```text
Read prompt.MD and AGENTS.md first. Work only on [feature]. Reuse existing components and data-access patterns. Keep the UBS-inspired white, black, red, and positive-green design system. Make the smallest focused change, then tell me which files changed and how to verify it.
```

### Step 4: Alternative: ChatGPT Codex

You can also use ChatGPT's IDE integration or Codex to work on this repository. Open the repository in the Codex-supported environment, provide [prompt.MD](prompt.MD) as project context, and give it the same reviewed implementation prompt. Ask it to inspect the existing code first, make a focused change, and report its validation results.

Copilot, Claude, and Codex may produce different solutions. Prefer the solution that matches the existing architecture, is easiest to review, and passes the repository checks.

## Contribution Workflow

1. Create a branch for your work:

   ```bash
   git switch -c feature/short-description
   ```

2. Make one focused change at a time.
3. Check the UI at desktop and tablet widths when changing frontend code.
4. Run `npm run lint` and `npm run build`.
5. Review `git diff` and remove debug code, unused imports, accidental formatting changes, and generated files that do not belong in the change.
6. Commit with a clear message and push your branch:

   ```bash
   git add .
   git commit -m "Add concise description of change"
   git push -u origin feature/short-description
   ```

7. Open a pull request that explains what changed, why it changed, how it was tested, and includes screenshots for visual changes.

Do not commit secrets, API keys, `.env` files, `node_modules`, or build output. Do not replace another contributor's changes without checking the diff and discussing the conflict.

## Development Conventions

- Keep the app data-driven. Static JSON is the current source of truth; structure data access so a future API can replace it cleanly.
- Reuse `Button`, `Badge`, `Card`, `DataTable`, `SectionHeader`, chart wrappers, and related components.
- Preserve the institutional visual language: white backgrounds, black text, UBS red for emphasis and negative values, and green only for positive values.
- Use TypeScript types instead of `any` where practical.
- Keep tables readable and responsive, and include loading, empty, and error states where the workflow needs them.
- Do not add a dependency when an existing component or browser API is sufficient.

## Useful Commands

```bash
npm run dev       # Start the local development server
npm run lint      # Run ESLint
npm run build     # Create a production build and catch integration errors
npm run start     # Serve the production build locally
```

## Helpful References

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Recharts documentation](https://recharts.org/)
- [Lucide React documentation](https://lucide.dev/guide/packages/lucide-react)
