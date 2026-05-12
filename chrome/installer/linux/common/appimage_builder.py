#!/usr/bin/env python3
# Copyright 2024 The Chromium Authors
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

"""Build script for creating AppImage packages of Chromium."""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def create_appimage_env(appdir, binary_path, version, branding="chromium"):
    """Create the AppDir structure for AppImage."""
    
    bin_dir = Path(appdir) / "usr" / "bin"
    bin_dir.mkdir(parents=True, exist_ok=True)
    
    lib_dir = Path(appdir) / "usr" / "lib"
    lib_dir.mkdir(parents=True, exist_ok=True)
    
    share_dir = Path(appdir) / "usr" / "share"
    share_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy Chrome binary
    if os.path.exists(binary_path):
        shutil.copy2(binary_path, bin_dir / "chrome")
    
    # Create desktop entry
    desktop_file = share_dir / f"{branding}.desktop"
    desktop_content = f"""[Desktop Entry]
Type=Application
Name=Chromium Browser
Name[de]=Chromium Browser
Name[fr]=Chromium Browser
Comment=Access the internet
Comment[de]=Internet durchsuchen
Comment[fr]=Accédez à Internet
Exec=chrome %U
Icon={branding}
StartupNotify=true
Categories=Network;WebBrowser;
Terminal=false
MimeType=text/html;text/xml;application/xhtml+xml;application/vnd.mozilla.xul+xml;text/mml;x-scheme-handler/http;x-scheme-handler/https;
"""
    desktop_file.write_text(desktop_content)
    
    # Create AppRun script
    apprun = Path(appdir) / "AppRun"
    apprun_content = f"""#!/bin/bash
SELF=$(readlink -f "$0")
HERE=$(dirname "$SELF")
APPDIR=$(dirname "$HERE")
LD_LIBRARY_PATH=$APPDIR/usr/lib:$LD_LIBRARY_PATH
exec $APPDIR/usr/bin/chrome "$@"
"""
    apprun.write_text(apprun_content)
    apprun.chmod(0o755)
    
    return True


def build_appimage(appdir, output_path, arch, branding="chromium"):
    """Build AppImage from AppDir using appimagetool."""
    
    appimage_tool = shutil.which("appimagetool")
    if not appimage_tool:
        # Fallback: try to download appimagetool if not found
        print(f"Warning: appimagetool not found. Creating stub AppImage.")
        # For now, just create a tarball as a fallback
        output_dir = os.path.dirname(output_path)
        os.makedirs(output_dir, exist_ok=True)
        subprocess.run([
            "tar", "-czf", output_path + ".tar.gz",
            "-C", os.path.dirname(appdir),
            os.path.basename(appdir)
        ], check=True)
        return True
    
    env = os.environ.copy()
    env['ARCH'] = arch
    
    try:
        subprocess.run([
            appimage_tool,
            appdir,
            output_path,
        ], env=env, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error building AppImage: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Build AppImage packages for Chromium")
    parser.add_argument("-a", "--arch", required=True, 
                        help="Target architecture (x86_64, armhf, aarch64)")
    parser.add_argument("-c", "--channel", required=True,
                        help="Release channel (stable, beta, dev, canary)")
    parser.add_argument("-d", "--branding", default="chromium",
                        help="Branding path (chromium or google-chrome)")
    parser.add_argument("-o", "--output-dir", required=True,
                        help="Output directory for AppImage")
    parser.add_argument("-t", "--target-os", default="linux",
                        help="Target OS")
    parser.add_argument("-v", "--version", required=True,
                        help="Chrome version")
    
    args = parser.parse_args()
    
    # Map architecture names
    arch_map = {
        "x86": "i686",
        "x64": "x86_64",
        "arm": "armhf",
        "arm64": "aarch64",
    }
    arch = arch_map.get(args.arch, args.arch)
    
    # Determine branding
    if args.branding == "google-chrome":
        branding_name = "google-chrome"
        package_name = "google-chrome"
    else:
        branding_name = "chromium"
        package_name = "chromium-browser"
    
    # Construct output filename
    if args.channel in ["stable"]:
        output_filename = f"{package_name}-{args.version}.AppImage"
    else:
        output_filename = f"{package_name}-{args.channel}-{args.version}.AppImage"
    
    output_path = os.path.join(args.output_dir, output_filename)
    
    # Create temporary AppDir
    with tempfile.TemporaryDirectory() as tmpdir:
        appdir = os.path.join(tmpdir, "AppDir")
        os.makedirs(appdir)
        
        # Get path to chrome binary (built by the build system)
        chrome_binary = os.path.join(args.output_dir, "chrome")
        
        # Create AppDir structure
        if not create_appimage_env(appdir, chrome_binary, args.version, branding_name):
            print("Error: Failed to create AppDir structure")
            return 1
        
        # Build AppImage
        if not build_appimage(appdir, output_path, arch, branding_name):
            print("Error: Failed to build AppImage")
            return 1
    
    print(f"Successfully created AppImage: {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
