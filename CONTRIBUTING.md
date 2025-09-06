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

```bash
npm run dev    # Start development server
npm run build  # Production build  
npm run lint   # Run ESLint
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