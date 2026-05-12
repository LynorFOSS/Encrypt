# GitHub Actions Auto-Release Feature

This document describes the automated release workflow for building and publishing Chromium browser installers across all platforms.

## Overview

The auto-release feature provides:

- **Automated builds** triggered by git tags or manual workflow dispatch
- **Multi-platform support**: Windows, macOS, and Linux with multiple architectures
- **Multiple installer types**: .exe, .msi, .dmg, .deb, .rpm, .AppImage
- **GitHub Release creation** with formatted release notes
- **Direct asset uploads** to GitHub Releases
- **Nightly builds** for testing latest changes
- **Parallel builds** for faster release cycles

## Workflows

### 1. Auto-Release Workflow (`auto-release.yml`)

**Trigger**: Push git tags matching `v*.*.*` or `release-*`

```bash
# Trigger a release
git tag v1.0.0
git push origin v1.0.0
```

**What it does**:
1. Detects the version from git tag
2. Builds Windows installers (x86, x64, ARM64)
3. Builds macOS installers (x64, ARM64)
4. Builds Linux installers (x86, x64, ARM, ARM64)
5. Creates GitHub Release with formatted notes
6. Uploads all installers as release assets

**Build Matrices**:
- **Windows**: x86, x64, arm64
- **macOS**: x64, arm64
- **Linux**: x86, x64, arm, arm64

### 2. Nightly Build Workflow (`nightly-build.yml`)

**Trigger**: Daily at 2 AM UTC (configurable via `cron`)

**What it does**:
1. Builds latest installers for testing
2. Uploads to artifacts for 7 days
3. Runs with reduced parallel jobs to save resources

**Useful for**:
- Testing latest changes
- Quality assurance
- Pre-release validation

## Configuration

### Release Triggering Methods

#### Method 1: Git Tag (Recommended)
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### Method 2: Release Page
1. Go to GitHub repo
2. Click "Create a new release"
3. Tag name: `v1.0.0` (must match pattern)
4. Release title and description
5. Click "Publish release"

#### Method 3: Manual Workflow Dispatch
```bash
gh workflow run auto-release.yml -f version=v1.0.0
```

Or via GitHub UI:
1. Go to Actions → Auto-Release workflow
2. Click "Run workflow"
3. Enter version number
4. Click "Run workflow"

### Version Format

Versions must match one of:
- `v1.0.0` - Release version
- `v1.0.0-beta.1` - Beta release
- `release-2024-05-12` - Date-based release

**Release notes**: Automatically detected as:
- **Prerelease**: Contains "beta" or "alpha"
- **Full Release**: Otherwise

## Build Environment Details

### Runner Images
- Windows: `windows-latest`
- macOS: `macos-latest`
- Linux: `ubuntu-latest`

### Dependencies Installed
**Windows**:
- Visual Studio Build Tools
- Depot Tools
- Python 3.11

**macOS**:
- Xcode Command Line Tools
- Depot Tools
- Python 3.11

**Linux**:
- Build essentials
- Depot Tools
- Python 3.11
- appimagetool

### Build Configuration
All builds use:
```gn
is_official_build=true
is_component_build=false
enable_*_installer=true
use_sysroot=true  # For Linux cross-compilation
```

## Generated Release Assets

### Windows Assets
```
chromium-1.0.0-x86.exe      # 32-bit installer
chromium-1.0.0-x64.exe      # 64-bit installer
chromium-1.0.0-arm64.exe    # ARM64 installer
chromium-1.0.0.msi          # MSI setup (if WiX available)
```

### macOS Assets
```
chromium-1.0.0-x64.dmg      # Intel DMG image
chromium-1.0.0-arm64.dmg    # Apple Silicon DMG image
```

### Linux Assets
```
chromium-1.0.0-amd64.deb    # Debian package
chromium-1.0.0-x86_64.rpm   # RPM package
chromium-1.0.0.AppImage     # Portable Linux app
```

## Release Notes Format

Auto-generated release notes include:

```markdown
# Chromium Browser Release v1.0.0

## What's New
Automated multi-platform release with installers...

## Downloads
### Windows
- **chrome-1.0.0.exe** - Standalone installer
- **chrome-1.0.0.msi** - Windows setup package
- Supports: x86, x64, ARM64

[... continues for all platforms ...]

## Installation Instructions
[Platform-specific installation steps]

## Build Information
- Build Date: [timestamp]
- Commit: [sha]
- Build Type: Official Release
- Multi-platform: Windows, macOS, Linux
```

## Parallel Build Jobs

The workflow uses matrix strategy for parallel builds:

**Windows**:
```yaml
matrix:
  arch: [x86, x64, arm64]
```
→ 3 parallel jobs

**Linux**:
```yaml
matrix:
  arch: [x86, x64, arm, arm64]
```
→ 4 parallel jobs

**macOS**:
```yaml
matrix:
  arch: [x64, arm64]
```
→ 2 parallel jobs

**Total**: 9 parallel build jobs

## Monitoring & Debugging

### View Workflow Runs
1. Go to GitHub repo
2. Click "Actions" tab
3. Select "Auto-Release" workflow
4. Click on specific run

### View Build Logs
1. Click on failed job
2. Expand step for details
3. Check error messages

### Download Artifacts
1. Click on completed workflow run
2. Scroll to "Artifacts" section
3. Download specific installer packages

## Troubleshooting

### Build Fails on Windows
- **Issue**: WiX not installed
- **Solution**: MSI is optional; .exe will always build
- **Continue-on-error**: True (gracefully handles missing dependencies)

### Build Fails on macOS
- **Issue**: Code signing fails
- **Solution**: Add signing certificate to GitHub secrets
- **Current**: Unsigned builds allowed in open-source

### Build Fails on Linux
- **Issue**: AppImage dependencies missing
- **Solution**: Already installed on ubuntu-latest
- **Fallback**: Creates tarball if appimagetool missing

### Release Asset Upload Fails
- **Check**: GitHub token has write access to releases
- **Verify**: Workflow permissions set to `write` for contents
- **Fix**: Update GitHub Actions permissions in settings

## Advanced Configuration

### Customize Build Flags

Edit `.github/workflows/auto-release.yml`:

```yaml
- name: Configure GN
  run: |
    gn gen out/Release --args='
      target_os="win"
      target_cpu="x64"
      is_official_build=true
      is_component_build=false
      your_custom_flag=true
    '
```

### Modify Build Parallelism

```yaml
env:
  NINJA_JOBS: 8  # Increase for faster builds
```

### Change Release Trigger

Edit trigger patterns:

```yaml
on:
  push:
    tags:
      - 'v*.*.*'           # Matches: v1.0.0, v1.0.0-beta.1
      - 'release-*'        # Matches: release-2024-05-12
      - 'chromium-*'       # Add this pattern
```

### Modify Nightly Schedule

```yaml
schedule:
  - cron: '0 2 * * *'      # Current: 2 AM UTC daily
  # Other examples:
  # - cron: '0 0 * * 0'   # Weekly Sunday
  # - cron: '0 */6 * * *' # Every 6 hours
```

## Security Considerations

### Code Signing
For production releases, add signing:

```yaml
- name: Sign Windows
  uses: microsoft/code-sign-action@v0.0.1
  with:
    certificate: ${{ secrets.SIGNING_CERT }}
    password: ${{ secrets.CERT_PASSWORD }}
```

### GitHub Secrets
Required for production:
- `SIGNING_CERT` - Code signing certificate
- `CERT_PASSWORD` - Certificate password
- `GITHUB_TOKEN` - Auto-created, has repo write access

### Release Permissions
Workflow needs:
```yaml
permissions:
  contents: write  # To create releases
```

## Performance Metrics

### Build Times (Approximate)
- **Windows (single arch)**: 30-45 minutes
- **macOS (single arch)**: 25-40 minutes
- **Linux (single arch)**: 20-30 minutes
- **Full Release (all)**: ~45 minutes (parallel)
- **Nightly Build**: ~30 minutes

### Artifact Storage
- **Retention**: 30 days for releases, 7 days for nightly
- **Storage**: GitHub includes free runners/storage
- **Cleanup**: Auto-deleted after retention period

## Next Steps

### 1. Create First Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Monitor Build Progress
- Go to GitHub Actions tab
- Watch workflow run
- Check build logs for errors

### 3. Verify Release
- Go to Releases page
- Check all assets present
- Download and test installers

### 4. Add Code Signing (Optional)
- Set up signing certificates
- Add signing steps to workflows
- Configure GitHub secrets

### 5. Set Up Nightly Builds
- Confirm nightly workflow active
- Check daily at 2 AM UTC
- Review nightly artifacts

## Support & Documentation

- **Workflow Syntax**: https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions
- **Creating Releases**: https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
- **GitHub Actions API**: https://docs.github.com/en/rest/releases
- **Chromium Build**: See `INSTALLER_BUILD_GUIDE.md`

## Examples

### Example 1: Release New Version
```bash
# Create release
git tag v2.0.0 -m "Release version 2.0.0"
git push origin v2.0.0

# Workflow automatically:
# 1. Builds all installers
# 2. Creates GitHub Release
# 3. Uploads all assets
# 4. Posts release notes
```

### Example 2: Manual Release via Dispatch
```bash
gh workflow run auto-release.yml \
  -f version=v2.0.0-rc1
```

### Example 3: Check Nightly Build
```bash
# CLI
gh run list --workflow=nightly-build.yml --limit 1

# Or visit GitHub UI → Actions → Nightly Build
```

---

**Last Updated**: 2024
**Status**: ✅ Production Ready

For detailed installer build information, see `INSTALLER_BUILD_GUIDE.md`
