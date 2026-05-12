# Quick Installer Build Reference

## What's Configured

Your Chromium build system is now configured to generate installers for all major platforms:

### ✅ Enabled Installers

| Platform | Installer Type | Filename Example | File Path |
|----------|-----------------|------------------|-----------|
| **Windows** | EXE (Mini Installer) | chrome.exe | out/Release/chrome.exe |
| **Windows** | MSI (Setup) | chrome-128.0.0.0.msi | out/Release/*.msi |
| **macOS** | APP (Bundle) | Chrome.app | out/Release/Chrome.app |
| **macOS** | DMG (Disk Image) | chrome-128.0.0.0.dmg | out/Release/*.dmg |
| **Linux** | DEB (Debian/Ubuntu) | chromium-browser_*.deb | out/Release/*.deb |
| **Linux** | RPM (RedHat/Fedora) | chromium-browser-*.rpm | out/Release/*.rpm |
| **Linux** | AppImage (Portable) | chromium-128.0.0.0.AppImage | out/Release/*.AppImage |

## Modified Files

### Build Configuration
- ✅ `chrome/installer/installers.gni` - Added MSI, AppImage, and mini_installer flags
- ✅ `chrome/installer/BUILD.gn` - Added Windows installer targets
- ✅ `chrome/installer/linux/BUILD.gn` - Added AppImage generation targets

### Build Scripts
- ✅ `build_all_installers.py` - Master build orchestrator
- ✅ `chrome/installer/linux/common/appimage_builder.py` - Linux AppImage builder
- ✅ `chrome/installer/windows/msi_builder.py` - Windows MSI builder
- ✅ `INSTALLER_BUILD_GUIDE.md` - Comprehensive documentation

## Basic Usage

### Option 1: Build All Installers (Recommended)
```bash
python3 build_all_installers.py --all
```

### Option 2: Build for Specific Platform
```bash
# Windows
python3 build_all_installers.py --windows

# macOS
python3 build_all_installers.py --macos

# Linux
python3 build_all_installers.py --linux
```

### Option 3: Manual GN + Ninja (Advanced)

#### Windows
```bash
gn gen out/Release --args='target_os="win" target_cpu="x64" is_official_build=true enable_mini_installer=true enable_msi_installer=true'
ninja -C out/Release mini_installer
```

#### macOS
```bash
gn gen out/Release --args='target_os="mac" target_cpu="arm64" is_official_build=true enable_mac_installer=true'
ninja -C out/Release mac
```

#### Linux
```bash
gn gen out/Release --args='target_os="linux" target_cpu="x64" is_official_build=true enable_linux_installer=true enable_appimage_generator=true'
ninja -C out/Release linux appimage
```

## Prerequisites by Platform

### Windows
- ✅ Chromium source code
- ✅ Visual Studio 2022 or Build Tools
- 📦 WiX Toolset (optional, for .msi): https://wixtoolset.org/

### macOS
- ✅ Chromium source code
- ✅ Xcode Command Line Tools
- ✅ Python 3.6+

### Linux
- ✅ Chromium source code
- ✅ Build essentials
- 📦 appimagetool (optional, for .AppImage): `sudo apt install appimagetool`

## Expected Output

After building, you'll find:

```
out/Release/
├── chrome.exe                          # Windows installer
├── chromium-*.msi                      # Windows setup (if WiX installed)
├── Chromium.app/                       # macOS bundle
├── chromium-*.dmg                      # macOS disk image
├── chromium-browser_*.deb              # Linux Debian
├── chromium-browser-*.rpm              # Linux RedHat
└── chromium-*.AppImage                 # Linux portable
```

## Key Features

✨ **Unified Build System**
- Single master builder script
- Automatic platform detection
- Consistent version numbering

🔧 **Flexible Configuration**
- Enable/disable specific installer types
- Cross-platform build support
- Custom architecture support

📦 **Complete Package Support**
- All common Linux distributions (.deb, .rpm)
- Portable Linux (.AppImage)
- Full macOS support (.app, .dmg)
- Windows setup (.exe, .msi)

## Troubleshooting

### MSI Not Building?
- Ensure WiX Toolset 3.11+ is installed
- Add WiX bin directory to PATH
- It's optional; .exe will always build

### AppImage Not Building?
- Install appimagetool: `sudo apt install appimagetool`
- Or download: https://github.com/AppImage/AppImageKit/releases
- It's optional; build continues if unavailable

### Build Fails?
1. Clear build directory: `rm -rf out/Release`
2. Run: `gn gen out/Release --check`
3. Verify all dependencies installed
4. See `INSTALLER_BUILD_GUIDE.md` for detailed troubleshooting

## Next Steps

1. **Review Configuration**: Check `INSTALLER_BUILD_GUIDE.md` for detailed docs
2. **Test Build**: Run `python3 build_all_installers.py --all` to test
3. **Customize**: Modify `installers.gni` to enable/disable specific types
4. **Deploy**: Set up CI/CD to automate builds (see guide for examples)
5. **Sign**: Add code signing for production releases

## Support Resources

- Chromium Documentation: https://chromium.googlesource.com/chromium/src/+/main/docs/
- GN Build System: https://gn.googlesource.com/gn/+/main/docs/
- WiX Toolset: https://wixtoolset.org/
- AppImageKit: https://github.com/AppImage/AppImageKit

---

For detailed information, see `INSTALLER_BUILD_GUIDE.md`
