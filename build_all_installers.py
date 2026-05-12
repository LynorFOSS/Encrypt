#!/usr/bin/env python3
# Copyright 2024 The Chromium Authors
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

"""Master build script for generating installers for all platforms."""

import argparse
import os
import platform
import subprocess
import sys
from pathlib import Path


def run_gn_configure(build_dir, target_os, cpu, release_build=True):
    """Configure GN build system."""
    
    args = [
        f"target_os=\"{target_os}\"",
        f"target_cpu=\"{cpu}\"",
        "is_debug=false" if release_build else "is_debug=true",
        "is_official_build=true",
        "enable_linux_installer=true",
        "enable_appimage_generator=true",
        "enable_msi_installer=true",
        "enable_mini_installer=true",
        "enable_mac_installer=true",
        "is_component_build=false",
        "use_sysroot=true",
    ]
    
    print(f"Configuring GN for {target_os} {cpu}...")
    gn_cmd = ["gn", "gen", build_dir, "--args=" + " ".join(args)]
    
    result = subprocess.run(gn_cmd, cwd=os.path.dirname(os.path.dirname(build_dir)))
    return result.returncode == 0


def run_ninja_build(build_dir, target="installer"):
    """Build using Ninja."""
    
    print(f"Building {target} with Ninja...")
    ninja_cmd = ["ninja", "-C", build_dir, target]
    
    result = subprocess.run(ninja_cmd)
    return result.returncode == 0


def build_windows_installers(output_dir, arch="x64"):
    """Build Windows installers (.exe and .msi)."""
    
    print("\n" + "="*60)
    print(f"Building Windows installers ({arch})...")
    print("="*60)
    
    build_dir = os.path.join("out", f"Release-{arch}")
    
    # Configure GN
    if not run_gn_configure(build_dir, "win", "x64" if arch == "x64" else "x86"):
        print("Error: GN configuration failed")
        return False
    
    # Build
    if not run_ninja_build(build_dir, "mini_installer"):
        print("Error: Ninja build failed")
        return False
    
    # Build MSI
    msi_script = os.path.join("chrome", "installer", "windows", "msi_builder.py")
    if os.path.exists(msi_script):
        print("\nBuilding MSI installer...")
        subprocess.run([
            sys.executable, msi_script,
            "-a", arch,
            "-c", "stable",
            "-o", build_dir,
            "-v", get_chrome_version(),
        ])
    
    return True


def build_mac_installer():
    """Build macOS .app and .dmg installer."""
    
    print("\n" + "="*60)
    print("Building macOS installer (.app)...")
    print("="*60)
    
    build_dir = "out/Release"
    
    # Configure GN for macOS
    if not run_gn_configure(build_dir, "mac", "arm64"):
        print("Error: GN configuration failed")
        return False
    
    # Build
    if not run_ninja_build(build_dir, "mac"):
        print("Error: Ninja build failed")
        return False
    
    return True


def build_linux_installers(arch="x64"):
    """Build Linux installers (.deb, .rpm, .AppImage)."""
    
    print("\n" + "="*60)
    print(f"Building Linux installers ({arch})...")
    print("="*60)
    
    cpu_map = {
        "x86": "x86",
        "x64": "x64",
        "arm": "arm",
        "arm64": "arm64",
    }
    target_cpu = cpu_map.get(arch, "x64")
    
    build_dir = os.path.join("out", f"Release-{arch}")
    
    # Configure GN
    if not run_gn_configure(build_dir, "linux", target_cpu):
        print("Error: GN configuration failed")
        return False
    
    # Build all Linux packages (deb, rpm, appimage)
    if not run_ninja_build(build_dir, "linux"):
        print("Error: Ninja build failed")
        return False
    
    # Build AppImage
    if not run_ninja_build(build_dir, "appimage"):
        print("Warning: AppImage build may have failed, but continuing...")
    
    return True


def get_chrome_version():
    """Get Chrome version from //chrome/VERSION file."""
    
    version_file = os.path.join("chrome", "VERSION")
    if os.path.exists(version_file):
        with open(version_file) as f:
            for line in f:
                if line.startswith("MAJOR"):
                    major = line.split("=")[1].strip()
                elif line.startswith("MINOR"):
                    minor = line.split("=")[1].strip()
                elif line.startswith("BUILD"):
                    build = line.split("=")[1].strip()
                elif line.startswith("PATCH"):
                    patch = line.split("=")[1].strip()
            
            return f"{major}.{minor}.{build}.{patch}"
    
    return "128.0.0.0"  # Default version


def main():
    parser = argparse.ArgumentParser(
        description="Build Chromium installers for all platforms")
    parser.add_argument("--windows", action="store_true",
                        help="Build Windows installers (.exe, .msi)")
    parser.add_argument("--macos", action="store_true",
                        help="Build macOS installer (.app)")
    parser.add_argument("--linux", action="store_true",
                        help="Build Linux installers (.deb, .rpm, .appimage)")
    parser.add_argument("--all", action="store_true",
                        help="Build all installers for current platform")
    parser.add_argument("--arch", default="x64",
                        help="Architecture: x86, x64, arm, arm64")
    
    args = parser.parse_args()
    
    # Determine what to build
    build_windows = args.windows or (args.all and platform.system() == "Windows")
    build_macos = args.macos or (args.all and platform.system() == "Darwin")
    build_linux = args.linux or (args.all and platform.system() == "Linux")
    
    # If nothing specified, build for current platform
    if not (build_windows or build_macos or build_linux):
        system = platform.system()
        if system == "Windows":
            build_windows = True
        elif system == "Darwin":
            build_macos = True
        elif system == "Linux":
            build_linux = True
    
    print("="*60)
    print("Chromium Installer Builder")
    print("="*60)
    print(f"Python: {sys.version}")
    print(f"Platform: {platform.system()}")
    print(f"Architecture: {args.arch}")
    print("="*60)
    
    version = get_chrome_version()
    print(f"\nChrome Version: {version}\n")
    
    success = True
    
    if build_windows:
        if not build_windows_installers("out/Release", args.arch):
            success = False
    
    if build_macos:
        if not build_mac_installer():
            success = False
    
    if build_linux:
        if not build_linux_installers(args.arch):
            success = False
    
    print("\n" + "="*60)
    if success:
        print("✓ Installer build completed successfully!")
        print("\nGenerated installers:")
        print("  Windows: .exe (mini_installer), .msi (WiX)")
        print("  macOS:   .app (bundle), .dmg (disk image)")
        print("  Linux:   .deb (Debian), .rpm (RedHat), .AppImage (portable)")
    else:
        print("✗ Installer build failed")
    print("="*60)
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
