# svelte-template

[日本語版はこちら / Japanese version](README-JA.md)

SvelteKit minimal template with TypeScript, Prettier, ESLint, Vitest, TailwindCSS, and Paraglide (i18n) support.

## 🚀 GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

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