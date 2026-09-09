# Contributing to Spatial Glass UI

Thank you for contributing to **Spatial Glass UI**, a hardware-accelerated WebGL glassmorphism spatial design system with seamless Phantom DOM accessibility mirroring.

## Setup & Testing

```bash
npm install
npx vitest run
```

### Architecture Overview

- **Shader Pass**: Three.js custom physical glass shaders (`GlassmorphismMaterial.ts`).
- **Phantom DOM**: Maintains an invisible synchronized HTML mirror for screen readers (WCAG AAA accessibility compliance) and SEO crawlers without degrading WebGL draw call performance.

## Submitting Contributions

1. Fork the repo and create a feature branch (`git checkout -b feat/my-ui-component`).
2. Verify all tests pass with `npx vitest run`.
3. Submit a Pull Request.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
