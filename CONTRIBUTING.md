# Contributing to Looper

Thank you for your interest in contributing to Looper! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different opinions and approaches

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported
2. Verify it's reproducible
3. Collect relevant information (device, OS version, steps to reproduce)

Create a bug report with:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Device and OS information

### Suggesting Features

Feature suggestions are welcome! Create an issue with:
- Clear description of the feature
- Use case and benefits
- Potential implementation approach
- Mockups/wireframes if applicable

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "Add feature: description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### PR Guidelines

- Keep changes focused and atomic
- Write clear commit messages
- Update documentation if needed
- Add comments for complex logic
- Test on both iOS and Android when possible
- Ensure TypeScript checks pass
- Follow existing code style

## Development Setup

See [QUICKSTART.md](./QUICKSTART.md) for quick setup or [SETUP.md](./SETUP.md) for detailed instructions.

## Code Style

### TypeScript
- Use TypeScript for all new code
- Define types for props and state
- Avoid `any` types
- Use interfaces for object shapes

### Components
- Functional components with hooks
- Props interface defined above component
- Styles defined at bottom of file
- Use meaningful component names

### Example Component Structure
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default MyComponent;
```

### Naming Conventions

- **Components**: PascalCase (`LoopPad.tsx`)
- **Files**: camelCase for utilities (`helpers.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_BPM`)
- **Functions**: camelCase (`playSound()`)
- **Interfaces**: PascalCase with I prefix optional (`User` or `IUser`)

### File Organization

```
src/
├── components/       # Reusable UI components
├── screens/          # Screen components
├── services/         # Business logic, API calls
├── navigation/       # Navigation configuration
├── hooks/            # Custom React hooks
├── utils/            # Helper functions
├── config/           # App configuration
└── types/            # TypeScript type definitions
```

## Testing

### Before Submitting
- [ ] Test on real device (not just simulator)
- [ ] Test on both iOS and Android if possible
- [ ] Test with Supabase connected
- [ ] Test in demo mode (without Supabase)
- [ ] Verify audio functionality
- [ ] Check UI on different screen sizes
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`

### Manual Testing Checklist
- [ ] App launches without errors
- [ ] Navigation works between screens
- [ ] Loop pad triggers sounds
- [ ] Projects can be saved/loaded
- [ ] Social features work (with Supabase)
- [ ] No console warnings
- [ ] Performance is smooth

## Areas for Contribution

### Good First Issues
- Add new sound packs
- Improve UI/UX
- Add more colors/themes
- Documentation improvements
- Bug fixes

### Medium Complexity
- Add new effects
- Improve audio service
- Add new social features
- Performance optimizations
- Accessibility improvements

### Advanced Features
- Sequencer/timeline
- Audio recording
- Real-time collaboration
- MIDI support
- Audio effects (reverb, delay)

## Documentation

When adding features, update:
- README.md if it affects setup/usage
- ARCHITECTURE.md for architectural changes
- Code comments for complex logic
- JSDoc for public APIs

## Git Workflow

### Commit Messages

Format: `type: description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat: add reverb effect to audio service
fix: resolve audio playback issue on Android
docs: update setup instructions for M1 Macs
refactor: simplify sound loading logic
```

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/doc-topic` - Documentation
- `refactor/area-refactored` - Refactoring

## Review Process

1. **Automated checks** run on PR
2. **Code review** by maintainer
3. **Testing** by reviewer
4. **Approval** and merge
5. **Release** in next version

## Questions?

- Open an issue for discussion
- Check existing issues and PRs
- Read the documentation
- Ask in PR comments

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing to Looper! 🎵
