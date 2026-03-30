# Contributing

Thanks for your interest in contributing to Asset Extractor! Here's how to get started.

## Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/asset-extractor.git
   cd asset-extractor
   ```

2. Start the API:
   ```bash
   cd api
   pip install -r requirements.txt
   python main.py
   ```

3. Start the frontend (separate terminal):
   ```bash
   cd web
   npm install
   npm run dev
   ```

## Project Structure

```
asset-extractor/
├── api/    Python backend (FastAPI + rembg)
└── web/    TypeScript frontend (Next.js 15)
```

Each service is fully independent — you can work on one without touching the other.

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add batch download support
fix: handle CORS for custom domains
perf: reduce image processing memory usage
refactor: extract canvas logic into custom hook
docs: update deployment guide
chore: bump rembg to 2.0.57
```

## Pull Request Process

1. Create a feature branch from `develop`:
   ```bash
   git checkout -b feat/your-feature develop
   ```
2. Make your changes
3. Test locally — both `api/` and `web/` should work
4. Push and open a PR against `develop`
5. Describe what you changed and why

## Code Standards

**Python (api/):**
- Single file (`main.py`) — keep it that way
- Comments only on non-obvious logic
- Follow existing code style

**TypeScript (web/):**
- Strict types, no `any`
- Functional components with hooks
- Component-scoped CSS modules

## Reporting Issues

Use [GitHub Issues](https://github.com/shukerullah/asset-extractor/issues). Include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser/OS if relevant
