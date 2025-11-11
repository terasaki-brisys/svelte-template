# svelte-template

[日本語版はこちら / Japanese version](README-JA.md)

SvelteKit minimal template with TypeScript, Prettier, ESLint, Vitest, TailwindCSS, and Paraglide (i18n) support.

## 🎯 Project

This template includes an **Event Scheduler** application:

- 📅 Schedule optimal dates from multiple candidates
- 🔗 Easy participant invitation via share URLs
- 📊 Real-time result aggregation
- 💾 Supabase (PostgreSQL + Edge Functions) backend
- 🌐 Hosted on GitHub Pages

For detailed setup instructions, see [SETUP.md](SETUP.md).

## 🚀 GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

## 📦 Automated Releases

This project uses [Release Please](https://github.com/googleapis/release-please) for automated versioning and CHANGELOG generation.

### How it works

1. **Commit with Conventional Commits format**:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update documentation"
   ```

2. **Release Please automatically**:
   - Creates Release PRs based on commit messages
   - Updates version in `app/package.json`
   - Generates `CHANGELOG.md`
   - Creates GitHub releases with tags

### Commit Types

- `feat:` - New features (bumps minor version)
- `fix:` - Bug fixes (bumps patch version)
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Other changes
- `BREAKING CHANGE:` - Breaking changes (bumps major version)

### GitHub Repository Settings Required

To enable Release Please, configure the following in your repository settings:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**:
   - ✅ Select **Read and write permissions**
   - ✅ Check **Allow GitHub Actions to create and approve pull requests**

### Setup Steps

1. **GitHub Repository Settings**
   - Go to repository Settings > Pages
   - Set Source to "GitHub Actions"

2. **Automatic Deployment**
   - Pushes to the `main` branch will automatically trigger deployment
   - GitHub Actions workflow will handle build and deployment

3. **Manual Deployment**
   - You can manually run the "Deploy to GitHub Pages" workflow from the GitHub Actions tab

## 💻 Development Environment Setup

### Dev Container Development (Recommended)

This project is Dev Container ready. With VS Code and Docker, you can start developing immediately.

```bash
# 1. Clone the repository
git clone https://github.com/[username]/svelte-template.git
cd svelte-template

# 2. Open with VS Code
code .

# 3. Run "Dev Container: Reopen in Container" in VS Code
# (Command Palette: Ctrl+Shift+P / Cmd+Shift+P)
```

Dev Container automatically configures:
- Node.js 22
- Required VS Code extensions (Svelte, Prettier, ESLint, TailwindCSS)
- Port forwarding (port 5173)

### Supabase Cloud Setup

This project uses Supabase Cloud for backend services. Follow these steps to set up your development environment:

```bash
# 1. Copy environment template
cd app
cp env.example .env.local

# 2. Create a new Supabase project at https://app.supabase.com
# 3. Copy your project URL and anon key to .env.local:
#    VITE_SUPABASE_URL=https://your-project-id.supabase.co
#    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
# 4. Login to Supabase (skip if SUPABASE_ACCESS_TOKEN is set)
npx supabase login
# 5. Link to your Supabase project
npx supabase link --project-ref <project_id>
# 6. Apply database migrations (from app directory)
npm run supabase:db:push
# 7. Deploy Edge Functions
npm run supabase:functions:deploy
```

### Database Management

**Reset all data (keep schema):**

To clear all data from the database while keeping the schema intact, run the following SQL in [Supabase SQL Editor](https://supabase.com/dashboard):

```sql
TRUNCATE TABLE public.events CASCADE;
```

This will delete all events, options, participants, votes, and links data.

**Reset schema and data:**

To completely reset the database including schema:

```bash
npm run supabase:db:reset
```

⚠️ This will delete everything and reapply all migrations from scratch.

### Local Development

```bash
# Start development server
cd app
pnpm install
pnpm dev

# Production build (for GitHub Pages)
pnpm run build:gh-pages
```

**Note**: The `pnpm dev` command automatically includes `--host 0.0.0.0`, enabling external access from Dev Container or Docker environments.

## 🌐 Internationalization

This project uses Paraglide for internationalization support:
- English (en)
- Japanese (ja)

Edit message files:
- `app/messages/en.json` - English
- `app/messages/ja.json` - Japanese

Demo page: `/demo/paraglide`

## 🛠️ Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Internationalization**: Paraglide
- **Testing**: Vitest + Playwright
- **Linting**: ESLint + Prettier
- **Deployment**: GitHub Pages (Static Adapter)