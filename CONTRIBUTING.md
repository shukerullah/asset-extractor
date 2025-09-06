# 🤝 Contributing to Asset Extractor

Thank you for your interest in contributing! This document provides guidelines for contributing to Asset Extractor.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/asset-extractor.git
   cd asset-extractor
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔧 Development Setup

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python main.py       # Start FastAPI server
python test_local.py # Run tests
```

## 📝 Contribution Guidelines

### Code Style
- **TypeScript**: Use strict mode, proper typing
- **Python**: Follow PEP 8, use type hints
- **Commits**: Use conventional commit format
  ```
  feat(frontend): add new selection tool
  fix(backend): handle large image processing  
  docs: update API documentation
  ```

### Before Submitting
- ✅ Run `npm run build` successfully
- ✅ Run `npm run lint` with no errors  
- ✅ Test your changes locally
- ✅ Update documentation if needed
- ✅ Write clear commit messages

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, minimal steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens  
- **Screenshots**: If applicable

## ✨ Feature Requests

For new features:
- **Use case**: Describe the problem it solves
- **Proposed solution**: Your suggested approach
- **Alternatives**: Other approaches considered
- **Breaking changes**: Any backwards compatibility concerns

## 🎯 Areas for Contribution

### Frontend
- 🎨 UI/UX improvements
- 📱 Mobile responsiveness
- ♿ Accessibility enhancements
- 🔧 Canvas tools and features

### Backend  
- 🤖 Additional AI models
- ⚡ Performance optimizations
- 🛡️ Security improvements
- 📊 Monitoring and logging

### Documentation
- 📚 API documentation
- 🎥 Video tutorials  
- 🌐 Translations
- 📖 Usage examples

### Infrastructure
- 🐳 Docker improvements
- ☁️ Cloud platform integrations
- 🔄 CI/CD enhancements
- 🧪 Testing improvements

## 📋 Pull Request Process

1. **Update the README.md** with details of changes if needed
2. **Ensure all tests pass** and builds are successful
3. **Update version numbers** in package.json if applicable
4. **Request review** from maintainers
5. **Address feedback** promptly and respectfully

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] No breaking changes

## Screenshots (if applicable)
```

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to docs
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority:high`: Urgent issues

## 🎉 Recognition

Contributors will be:
- ✅ Listed in our README acknowledgments
- ✅ Mentioned in release notes for significant contributions
- ✅ Invited to join our contributor community

## 📞 Getting Help

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Create issues for bugs and features
- 📧 **Email**: Reach out directly for sensitive topics

## 📜 Code of Conduct

By participating, you agree to:
- 🤝 Be respectful and inclusive
- 💡 Focus on constructive feedback
- 🎯 Keep discussions on-topic
- 🚫 No harassment or discrimination

---

**Happy coding! 🚀 Thank you for contributing to Asset Extractor!**