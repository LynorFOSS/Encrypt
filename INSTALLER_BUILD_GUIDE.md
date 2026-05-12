# Chromium Multi-Platform Installer Build Guide

This document describes how to build Chromium browser installers for all supported platforms.

## Supported Installers

### Windows
- **chrome.exe** - Standalone installer (.exe) created by mini_installer
- **chrome-version.msi** - Windows installer package (requires WiX Toolset)

### macOS  
- **Google Chrome.app** - Application bundle (.app)
- **Google Chrome-version.dmg** - Disk image (.dmg) for distribution

### Linux
- **chromium-browser-version-1_amd64.deb** - Debian/Ubuntu package
- **chromium-browser-version-1.x86_64.rpm** - RedHat/Fedora package
- **chromium-browser-version.AppImage** - Portable AppImage (runs on any Linux)

## Quick Start

### Build All Installers (Current Platform)
```bash
python3 build_all_installers.py --all
```

### Build Specific Platform
```bash
# Windows installers
python3 build_all_installers.py --windows

# macOS installer
python3 build_all_installers.py --macos

# Linux installers
python3 build_all_installers.py --linux
```

### Specify Architecture
```bash
python3 build_all_installers.py --all --arch x64
```

## Prerequisites

### All Platforms
- Python 3.6+
- GN build system
- Ninja build tool
- Clang/LLVM toolchain

### Windows
- Visual Studio 2022 or Build Tools
- **For MSI generation:** WiX Toolset 3.11 or later
  - Download: https://wixtoolset.org/
  - MSI building is optional; .exe will always be built

### macOS
- Xcode Command Line Tools
- macOS 10.13+
- Apple Developer tools

### Linux
- Linux 4.4+
- Build essential tools (gcc, g++, make)
- **For AppImage generation:** appimagetool (optional)
  - `sudo apt install appimagetool` (Debian/Ubuntu)
  - Or download from: https://github.com/AppImage/AppImageKit/releases

## Detailed Build Configuration

### GN Configuration Flags

The build system automatically enables these flags:

```gn
# Enable all installer types
target_os="linux|mac|win"
target_cpu="x86|x64|arm|arm64"
is_official_build=true
is_component_build=false
enable_linux_installer=true
enable_appimage_generator=true
enable_msi_installer=true
enable_mini_installer=true
enable_mac_installer=true
```

### Custom GN Configuration

To configure manually:

```bash
# Windows (x64)
gn gen out/Release --args='target_os="win" target_cpu="x64" is_official_build=true enable_mini_installer=true enable_msi_installer=true'

# macOS (ARM64)
gn gen out/Release --args='target_os="mac" target_cpu="arm64" is_official_build=true enable_mac_installer=true'

# Linux (x64)
gn gen out/Release --args='target_os="linux" target_cpu="x64" is_official_build=true enable_linux_installer=true enable_appimage_generator=true'

# Build
ninja -C out/Release installer
```

## Build Output Locations

After building, installers are located in:

```
out/Release/
├── chrome.exe                                    (Windows)
├── chrome-128.0.0.0.msi                        (Windows)
├── google-chrome.stable_128.0.0.0-1_amd64.deb  (Linux)
├── google-chrome.stable-128.0.0.0-1.x86_64.rpm (Linux)
├── chromium-128.0.0.0.AppImage                 (Linux)
└── Chromium/                                    (macOS .app bundle)
```

## Building Individual Installers

### Windows .exe (Mini Installer)

```bash
gn gen out/Release --args='target_os="win" target_cpu="x64" is_official_build=true enable_mini_installer=true is_component_build=false'
ninja -C out/Release mini_installer
```

Output: `out/Release/chrome.exe`

### Windows .msi (WiX)

Requires WiX Toolset installed.

```bash
python3 chrome/installer/windows/msi_builder.py \
  -a x64 \
  -c stable \
  -o out/Release \
  -v 128.0.0.0
```

Output: `out/Release/chrome-128.0.0.0.msi`

### macOS .app Bundle

```bash
gn gen out/Release --args='target_os="mac" target_cpu="arm64" is_official_build=true enable_mac_installer=true'
ninja -C out/Release chrome
```

Output: `out/Release/Chromium.app`

### macOS .dmg Disk Image

```bash
gn gen out/Release --args='target_os="mac" target_cpu="arm64" is_official_build=true enable_mac_installer=true'
ninja -C out/Release mac
```

Output: `out/Release/Chromium-128.0.0.0.dmg`

### Linux .deb Package

```bash
gn gen out/Release --args='target_os="linux" target_cpu="x64" is_official_build=true enable_linux_installer=true'
ninja -C out/Release stable_deb
```

Output: `out/Release/chromium-browser-stable_128.0.0.0-1_amd64.deb`

### Linux .rpm Package

```bash
gn gen out/Release --args='target_os="linux" target_cpu="x64" is_official_build=true enable_linux_installer=true'
ninja -C out/Release stable_rpm
```

Output: `out/Release/chromium-browser-stable-128.0.0.0-1.x86_64.rpm`

### Linux .AppImage (Portable)

Requires `appimagetool` to be installed.

```bash
gn gen out/Release --args='target_os="linux" target_cpu="x64" is_official_build=true enable_appimage_generator=true'
ninja -C out/Release appimage
```

Output: `out/Release/chromium-128.0.0.0.AppImage`

## Cross-Compilation

### Build Windows Installers on Linux/Mac

```bash
# Install Windows cross-compilation tools
# On Linux: sudo apt install mingw-w64

gn gen out/Release --args='target_os="win" target_cpu="x64" use_goma=false'
ninja -C out/Release mini_installer
```

### Build Linux Installers on Windows/Mac

```bash
gn gen out/Release --args='target_os="linux" target_cpu="x64" use_sysroot=true'
ninja -C out/Release linux
```

### Build macOS Installers on Linux

Not recommended or supported - macOS build requires macOS system.

## Troubleshooting

### MSI Build Fails
- Install WiX Toolset: https://wixtoolset.org/
- Add WiX bin directory to PATH
- On Linux/Mac, MSI build will be skipped gracefully

### AppImage Generation Fails
- Install appimagetool: `sudo apt install appimagetool`
- Or download from: https://github.com/AppImage/AppImageKit/releases
- AppImage build will fallback to tarball if appimagetool not found

### GN Configuration Errors
- Clear build directory: `rm -rf out/Release`
- Ensure all dependencies installed
- Run: `gn gen out/Release --check` to validate configuration

### Ninja Build Fails
- Clear build directory
- Ensure ninja is in PATH: `which ninja`
- Check disk space and permissions
- Run: `ninja -C out/Release -d stats` for detailed diagnostics

## Environment Variables

```bash
# Parallel build jobs (default: auto-detect)
export NINJA_JOBS=8

# Use distributed compilation (if Goma available)
export GOMA_DIR=~/.goma

# Custom Python path
export PYTHON_PATH=/usr/bin/python3
```

## Signing and Code Signing

### Windows Code Signing
```bash
signtool sign /f certificate.pfx /p password /t http://timestamp.server \
  out/Release/chrome.exe out/Release/chrome-128.0.0.0.msi
```

### macOS Code Signing
```bash
codesign --deep --force --verify --verbose --sign "Developer ID Application" \
  out/Release/Chromium.app
```

## Release Distribution

### Recommended Hosting
- **Windows**: Upload .msi to website for direct download or include in update channel
- **macOS**: Create .dmg for distribution via website or App Store
- **Linux**: 
  - Upload .deb to Linux repositories (Launchpad, etc.)
  - Upload .rpm to RPM repositories (Copr, etc.)
  - Upload .AppImage to AppImageHub (appimage.github.io)

## CI/CD Integration

### GitHub Actions Example
See `.github/workflows/build-installers.yml` for automated builds.

### Build Command for CI
```bash
python3 build_all_installers.py --all --arch x64
```

## Development Notes

### Build System Files
- Configuration: `chrome/installer/installers.gni`
- Build rules: `chrome/installer/BUILD.gn`
- Platform-specific:
  - Windows: `chrome/installer/mini_installer/BUILD.gn`
  - macOS: `chrome/installer/mac/BUILD.gn`
  - Linux: `chrome/installer/linux/BUILD.gn`

### Scripts
- Master builder: `build_all_installers.py`
- AppImage builder: `chrome/installer/linux/common/appimage_builder.py`
- MSI builder: `chrome/installer/windows/msi_builder.py`

### Adding New Installers

To add a new installer type:
1. Add build flag to `installers.gni`
2. Create build target in platform-specific `BUILD.gn`
3. Add builder script if needed
4. Update master builder script `build_all_installers.py`
5. Document in this file

## License

These build scripts are part of Chromium and are covered by the same license:
https://chromium.googlesource.com/chromium/src/+/main/LICENSE
