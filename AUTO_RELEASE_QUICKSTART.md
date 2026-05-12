# Auto-Release Quick Start

This guide shows how to trigger automated builds and releases for Chromium browser installers.

## What's Configured

Your Chromium project now has fully automated release infrastructure:

✅ **Auto-Release Workflow** - Builds installers when you push version tags
✅ **Nightly Builds** - Automated daily builds for testing
✅ **Multi-Platform** - Windows, macOS, Linux all built in parallel
✅ **GitHub Releases** - Automatic release creation with formatted notes
✅ **Asset Upload** - All installers uploaded as release assets

## Quick Start (30 seconds)

### Option 1: Create Release via Git Tag

```bash
# Create a version tag
git tag v1.0.0

# Push to GitHub
git push origin v1.0.0

# Done! GitHub Actions will:
# 1. Build all installers
# 2. Create GitHub release
# 3. Upload all assets
```

### Option 2: Create Release via GitHub UI

1. Go to your GitHub repository
2. Click **"Releases"** → **"Create a new release"**
3. Enter tag: `v1.0.0`
4. Add release title and description
5. Click **"Publish release"**
6. GitHub Actions automatically triggers builds

### Option 3: Manual Trigger (Using GitHub CLI)

```bash
# Install GitHub CLI if needed: https://cli.github.com
gh workflow run auto-release.yml -f version=v1.0.0
```

## Monitoring the Build

### Watch Live in GitHub UI

1. Go to **Actions** tab
2. Click **"Auto-Release"** workflow
3. Click the running workflow
4. Watch build progress for each platform

### Build Stages

```
├── build-windows (x86, x64, arm64) ─┐
├── build-macos (x64, arm64)         ├─► create-release
└── build-linux (x86, x64, arm, arm64)┘
```

All builds run in parallel, then creates release once complete.

### Typical Timeline

- **Build Start**: ~2 minutes to download dependencies
- **Windows Build**: ~30-45 min (3 architectures)
- **macOS Build**: ~25-40 min (2 architectures)
- **Linux Build**: ~20-30 min (4 architectures)
- **Release Creation**: ~5 min
- **Total**: ~50 minutes (all parallel)

## Check Results

### GitHub Releases

1. Go to **"Releases"** page
2. See new release with all installers
3. Download any installer you want
4. See formatted release notes with installation instructions

### Workflow Artifacts

If builds fail before release:
1. Go to **Actions** → **"Auto-Release"**
2. Click the failed run
3. Scroll to **"Artifacts"** section
4. Download specific installer artifacts for debugging

## Nightly Builds

Automatic builds run daily at **2 AM UTC**:

```bash
# To see nightly builds
gh run list --workflow=nightly-build.yml
```

**Useful for**:
- Testing latest changes daily
- QA validation before release
- Early bug detection

**Nightly artifacts** stored for 7 days, release artifacts for 30 days.

## Generated Installers

### What You Get

**Windows** (3 architectures):
- `chromium-1.0.0-x86.exe` - 32-bit
- `chromium-1.0.0-x64.exe` - 64-bit
- `chromium-1.0.0-arm64.exe` - ARM64

**macOS** (2 architectures):
- `chromium-1.0.0-x64.dmg` - Intel Macs
- `chromium-1.0.0-arm64.dmg` - Apple Silicon

**Linux** (4 architectures):
- `chromium-1.0.0-amd64.deb` - Debian/Ubuntu
- `chromium-1.0.0-x86_64.rpm` - RedHat/Fedora
- `chromium-1.0.0.AppImage` - Universal/Portable

### Total: ~9 installers per release

## Release Notes Format

Automatically generated with:
- Download links for each platform
- Supported architectures
- Installation instructions per platform
- Build metadata (commit, date, build type)

Example:
```
# Chromium Browser Release v1.0.0

## Downloads
### Windows
- chromium-1.0.0-x86.exe
- chromium-1.0.0-x64.exe
- Supports: x86, x64, ARM64

### macOS
- chromium-1.0.0-x64.dmg
- chromium-1.0.0-arm64.dmg
- Supports: Intel, Apple Silicon

### Linux
- chromium-1.0.0-amd64.deb
- chromium-1.0.0-x86_64.rpm
- chromium-1.0.0.AppImage
- Supports: x86, x64, ARM, ARM64

## Installation Instructions
[Platform-specific steps for each installer type]
```

## Version Numbering

Valid version formats:
```
v1.0.0           # Release version
v1.0.0-beta.1    # Beta release (marked as prerelease)
v1.0.0-alpha     # Alpha release (marked as prerelease)
release-2024-05  # Date-based release
```

**Not valid**:
```
1.0.0            # Missing 'v' prefix
release1.0.0     # Wrong format
v1.0             # Too short
```

## Troubleshooting

### Build Fails

**Check the logs**:
1. Go to **Actions**
2. Click failed workflow
3. Expand the failed step
4. Look for error messages

**Common issues**:
- ❌ Depot tools not installed → Workflow installs automatically ✓
- ❌ Missing dependencies → Workflow installs automatically ✓
- ❌ Disk space issues → Rare on GitHub runners ✓
- ❌ Network timeouts → Retry the workflow ✓

### Release Not Created

- Check tag format: must start with `v` or `release-`
- View workflow logs for errors
- Verify GitHub token has write permissions

### Some Assets Missing

- Windows: MSI optional (if WiX not available, .exe still created)
- Linux: AppImage optional (if appimagetool not available, .deb/.rpm created)
- macOS: All assets should be present

## Examples

### Example 1: Release v2.0.0
```bash
git tag v2.0.0
git push origin v2.0.0
# Automatically creates release with all installers
```

### Example 2: Beta Release
```bash
git tag v2.0.0-beta.1
git push origin v2.0.0-beta.1
# Creates pre-release marked as "beta"
```

### Example 3: Nightly Build
- Automatically runs daily at 2 AM UTC
- Check artifacts in Actions → Nightly Build
- Useful for testing

## Customization

### Modify Build Flags

Edit `.github/workflows/auto-release.yml`:
```yaml
args='target_os="win" ... your_custom_flag=true'
```

### Change Nightly Schedule

Edit `.github/workflows/nightly-build.yml`:
```yaml
- cron: '0 2 * * *'  # Change to any cron schedule
```

### Add Code Signing

For production (optional):
1. Add signing certificate to GitHub Secrets
2. Add signing steps to workflows
3. See `AUTO_RELEASE_GUIDE.md` for details

## Next Steps

1. **Create your first release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Monitor the build**:
   - Go to Actions tab
   - Watch workflow run

3. **Verify the release**:
   - Go to Releases page
   - Check all installers present
   - Download and test

4. **Celebrate** 🎉
   - You have fully automated releases!
   - All platforms built in parallel
   - Professional release process

## Files

- **Workflows**: `.github/workflows/auto-release.yml`, `.github/workflows/nightly-build.yml`
- **Build Scripts**: `build_all_installers.py`, `build_installers.sh`, `build_installers.bat`
- **Documentation**: `AUTO_RELEASE_GUIDE.md` (detailed), `INSTALLER_BUILD_GUIDE.md` (build details)

## Support

- **Auto-Release Details**: See `AUTO_RELEASE_GUIDE.md`
- **Build Details**: See `INSTALLER_BUILD_GUIDE.md`
- **Quick Reference**: `INSTALLER_SETUP_SUMMARY.md`
- **Visual Overview**: `INSTALLER_VISUAL_OVERVIEW.md`

---

**Status**: ✅ **Ready to Use**

Push a tag and watch the magic happen! 🚀
