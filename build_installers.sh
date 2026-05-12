#!/bin/bash
# Copyright 2024 The Chromium Authors
# Build script for creating Chromium installers on Unix-like systems

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Print colored output
print_status() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Build Chromium installers for all platforms.

OPTIONS:
    --all              Build all installers for current platform
    --windows          Build Windows installers (.exe, .msi)
    --macos            Build macOS installer (.app, .dmg)
    --linux            Build Linux installers (.deb, .rpm, .appimage)
    --arch ARCH        Set architecture (x86, x64, arm, arm64) [default: x64]
    --debug            Build debug version
    --help             Show this help message

EXAMPLES:
    # Build all installers
    $0 --all

    # Build for Linux
    $0 --linux --arch x64

    # Build for macOS ARM64
    $0 --macos --arch arm64

EOF
}

# Parse arguments
ARCH="x64"
BUILD_TYPE="release"
BUILD_ALL=false
BUILD_WINDOWS=false
BUILD_MACOS=false
BUILD_LINUX=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            BUILD_ALL=true
            shift
            ;;
        --windows)
            BUILD_WINDOWS=true
            shift
            ;;
        --macos)
            BUILD_MACOS=true
            shift
            ;;
        --linux)
            BUILD_LINUX=true
            shift
            ;;
        --arch)
            ARCH="$2"
            shift 2
            ;;
        --debug)
            BUILD_TYPE="debug"
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Determine platform if --all is specified
if [ "$BUILD_ALL" = true ]; then
    SYSTEM=$(uname -s)
    case "$SYSTEM" in
        Darwin)
            BUILD_MACOS=true
            ;;
        Linux)
            BUILD_LINUX=true
            ;;
        MINGW*|MSYS*|CYGWIN*)
            BUILD_WINDOWS=true
            ;;
        *)
            print_error "Unsupported system: $SYSTEM"
            exit 1
            ;;
    esac
fi

# If nothing specified, show usage
if [ "$BUILD_WINDOWS" = false ] && [ "$BUILD_MACOS" = false ] && [ "$BUILD_LINUX" = false ]; then
    show_usage
    exit 1
fi

print_status "Chromium Installer Builder"
echo ""
echo "System:  $(uname -s)"
echo "Arch:    $ARCH"
echo "Type:    $BUILD_TYPE"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 not found"
    exit 1
fi

print_success "Python 3 found: $(python3 --version)"

# Check GN
if ! command -v gn &> /dev/null; then
    print_error "GN not found in PATH"
    exit 1
fi

print_success "GN found"

# Check Ninja
if ! command -v ninja &> /dev/null; then
    print_error "Ninja not found in PATH"
    exit 1
fi

print_success "Ninja found: $(ninja --version)"

echo ""

# Build Windows
if [ "$BUILD_WINDOWS" = true ]; then
    print_status "Building Windows installers..."
    cd "$SCRIPT_DIR"
    python3 build_all_installers.py --windows --arch "$ARCH"
    print_success "Windows build completed"
    echo ""
fi

# Build macOS
if [ "$BUILD_MACOS" = true ]; then
    print_status "Building macOS installer..."
    cd "$SCRIPT_DIR"
    python3 build_all_installers.py --macos --arch "$ARCH"
    print_success "macOS build completed"
    echo ""
fi

# Build Linux
if [ "$BUILD_LINUX" = true ]; then
    print_status "Building Linux installers..."
    
    # Check for optional tools
    if ! command -v appimagetool &> /dev/null; then
        print_warning "appimagetool not found - AppImage generation will be skipped"
        print_warning "Install: sudo apt install appimagetool"
    else
        print_success "appimagetool found"
    fi
    
    cd "$SCRIPT_DIR"
    python3 build_all_installers.py --linux --arch "$ARCH"
    print_success "Linux build completed"
    echo ""
fi

print_status "All builds completed!"
print_success "Installers available in: $SCRIPT_DIR/out/Release"
