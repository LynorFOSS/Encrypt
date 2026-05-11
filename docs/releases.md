# Automated Release System

The Encrypt app uses GitHub Actions with electron-builder to automatically build and release platform-specific installers for Windows, macOS, and Linux.

## Release Formats

- **Windows**: `.exe` (NSIS installer), `.msi` (MSI installer), and `.exe` (portable)
- **macOS**: `.dmg` (disk image) and `.zip` (archived app)
- **Linux**: `.AppImage` (universal Linux executable) and `.deb` (Debian package)

## How to Create a Release

### 1. Tag a Version

```bash
git tag v0.2.0
git push origin v0.2.0
```

Version format: `v{major}.{minor}.{patch}` or `v{major}.{minor}.{patch}-{prerelease}` (e.g., `v0.2.0-alpha.1`)

### 2. GitHub Actions Workflow

When you push a version tag, the `release.yml` workflow will:

1. **Build for Windows** on a Windows runner
2. **Build for macOS** on a macOS runner  
3. **Build for Linux** on an Ubuntu runner
4. **Create a GitHub Release** with all artifacts attached

The release runs in parallel for speed and all artifacts are downloaded and attached to the GitHub Release.

### 3. Monitor the Build

View the progress on the [Actions tab](https://github.com/LynorFOSS/Encrypt/actions).

## Development Builds

To build locally without publishing:

```bash
# Build all platforms
npm run dist

# Build specific platform
npm run dist:win   # Windows only
npm run dist:mac   # macOS only
npm run dist:linux # Linux only
```

Artifacts appear in `dist/build/`.

## Code Signing (Optional)

The workflow is configured to support code signing. To enable:

### Windows Signing

1. Set these GitHub Secrets:
   - `WIN_CERTIFICATE`: Base64-encoded .pfx certificate file
   - `WIN_CERTIFICATE_PASSWORD`: Certificate password

2. Uncomment in `.github/workflows/release.yml`:
   ```yaml
   WIN_CERTIFICATE: ${{ secrets.WIN_CERTIFICATE }}
   WIN_CERTIFICATE_PASSWORD: ${{ secrets.WIN_CERTIFICATE_PASSWORD }}
   ```

### macOS Signing

1. Set these GitHub Secrets:
   - `APPLE_ID`: Your Apple ID email
   - `APPLE_ID_PASSWORD`: App-specific password from appleid.apple.com
   - `APPLE_TEAM_ID`: Your Apple Developer Team ID
   - `MAC_CERTIFICATE`: Base64-encoded .p12 certificate
   - `MAC_CERTIFICATE_PASSWORD`: Certificate password

2. Uncomment in `.github/workflows/release.yml`:
   ```yaml
   APPLE_ID: ${{ secrets.APPLE_ID }}
   APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
   APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
   CSC_LINK: ${{ secrets.MAC_CERTIFICATE }}
   CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTIFICATE_PASSWORD }}
   ```

### Linux Signing

Linux .AppImage and .deb packages don't require code signing by default.

## CI/CD Pipeline

The `ci.yml` workflow runs on every push and PR to:

- Lint code (ESLint, TypeScript)
- Run frontend tests (Vitest)
- Run backend tests (Pytest)
- Build the application
- Upload build artifacts

## Build Configuration

All platform-specific settings are in `package.json` under the `"build"` section:

- **Windows**: NSIS installer, MSI installer, portable exe
- **macOS**: DMG disk image, ZIP archive, code signing entitlements
- **Linux**: AppImage (universal), Debian package

## Troubleshooting

- **Build fails on Windows**: Check that Visual Studio Build Tools or msys2 is installed
- **macOS notarization fails**: Ensure APPLE_ID and password are set correctly
- **Linux AppImage missing**: Ensure libopenjp2-7 and build-essential are installed

## Manual Release on GitHub

If you need to create a release manually without git tags:

1. Go to [Releases](https://github.com/LynorFOSS/Encrypt/releases)
2. Click "Draft a new release"
3. Click "Choose a tag" → Create new tag (e.g., `v0.2.0`)
4. Title: `Encrypt v0.2.0`
5. Upload the built artifacts from `dist/build/`
6. Click "Publish release"
