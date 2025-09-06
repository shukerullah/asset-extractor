# Contributing

## Quick Start

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/username/asset-extractor.git
   cd asset-extractor
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

**Install dependencies:**
```bash
npm install
cd backend && pip install -r requirements.txt
```

**Start development:**
```bash
npm run dev:full    # Start both services
# Visit: http://localhost:3000
```

**Other commands:**
```bash
npm run dev         # Frontend only
npm run backend     # Backend only  
npm run build       # Production build  
npm run lint        # Run ESLint
```

## Code Style

- Use TypeScript for all code
- Follow existing patterns
- Use conventional commits: `feat: add feature` or `fix: bug fix`

## Before Submitting

- Run `npm run build` successfully
- Run `npm run lint` with no errors
- Test your changes locally

## Pull Request Process

1. Ensure builds pass
2. Write clear commit messages
3. Request review from maintainers