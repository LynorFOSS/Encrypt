@echo off
REM Copyright 2024 The Chromium Authors
REM Build script for creating Chromium installers on Windows

setlocal enabledelayedexpansion

REM Color codes (using echo with special characters)
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "NC=[0m"

REM Parse arguments
set "ARCH=x64"
set "BUILD_TYPE=release"
set "BUILD_ALL=false"
set "BUILD_WINDOWS=false"
set "BUILD_MACOS=false"
set "BUILD_LINUX=false"

:parse_args
if "%~1"=="" goto done_parsing
if "%~1"=="--all" (
    set "BUILD_ALL=true"
    shift
    goto parse_args
)
if "%~1"=="--windows" (
    set "BUILD_WINDOWS=true"
    shift
    goto parse_args
)
if "%~1"=="--macos" (
    set "BUILD_MACOS=true"
    shift
    goto parse_args
)
if "%~1"=="--linux" (
    set "BUILD_LINUX=true"
    shift
    goto parse_args
)
if "%~1"=="--arch" (
    set "ARCH=%~2"
    shift
    shift
    goto parse_args
)
if "%~1"=="--debug" (
    set "BUILD_TYPE=debug"
    shift
    goto parse_args
)
if "%~1"=="--help" (
    call :show_usage
    exit /b 0
)
echo Unknown option: %~1
call :show_usage
exit /b 1

:done_parsing

REM If --all specified, build for current platform (Windows)
if "%BUILD_ALL%"=="true" (
    set "BUILD_WINDOWS=true"
)

REM If nothing specified, show usage
if "%BUILD_WINDOWS%"=="false" (
    if "%BUILD_MACOS%"=="false" (
        if "%BUILD_LINUX%"=="false" (
            call :show_usage
            exit /b 1
        )
    )
)

echo.
echo ========================================
echo Chromium Installer Builder
echo ========================================
echo System:  Windows
echo Arch:    %ARCH%
echo Type:    %BUILD_TYPE%
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo Error: Python not found
        exit /b 1
    )
    set "PYTHON=python3"
) else (
    set "PYTHON=python"
)

echo [OK] Python found: 
%PYTHON% --version

REM Check GN
where gn >nul 2>&1
if errorlevel 1 (
    echo Error: GN not found in PATH
    exit /b 1
)
echo [OK] GN found

REM Check Ninja
where ninja >nul 2>&1
if errorlevel 1 (
    echo Error: Ninja not found in PATH
    exit /b 1
)
echo [OK] Ninja found

REM Check for WiX (optional)
where candle >nul 2>&1
if errorlevel 1 (
    echo [WARNING] WiX Toolset not found - MSI generation will be skipped
    echo [INFO] Install WiX from: https://wixtoolset.org/
) else (
    echo [OK] WiX Toolset found
)

echo.

REM Build Windows
if "%BUILD_WINDOWS%"=="true" (
    echo ========================================
    echo Building Windows installers...
    echo ========================================
    %PYTHON% build_all_installers.py --windows --arch %ARCH%
    if errorlevel 1 (
        echo Error: Windows build failed
        exit /b 1
    )
    echo [OK] Windows build completed
    echo.
)

REM Build macOS
if "%BUILD_MACOS%"=="true" (
    echo ========================================
    echo Building macOS installer...
    echo ========================================
    echo Note: macOS build requires macOS system - this is not supported on Windows
    echo Skipping macOS build
    echo.
)

REM Build Linux
if "%BUILD_LINUX%"=="true" (
    echo ========================================
    echo Building Linux installers...
    echo ========================================
    echo Note: Linux build requires Linux system - this is not supported on Windows
    echo Skipping Linux build
    echo.
)

echo ========================================
echo All builds completed!
echo Installers available in: out\Release
echo ========================================

exit /b 0

:show_usage
echo.
echo Usage: %~nx0 [OPTIONS]
echo.
echo Build Chromium installers for all platforms.
echo.
echo OPTIONS:
echo     --all              Build all installers for current platform
echo     --windows          Build Windows installers (.exe, .msi)
echo     --macos            Build macOS installer (.app, .dmg)
echo     --linux            Build Linux installers (.deb, .rpm, .appimage)
echo     --arch ARCH        Set architecture (x86, x64, arm, arm64) [default: x64]
echo     --debug            Build debug version
echo     --help             Show this help message
echo.
echo EXAMPLES:
echo     REM Build all installers for Windows
echo     %~nx0 --all
echo.
echo     REM Build for x86 architecture
echo     %~nx0 --windows --arch x86
echo.
exit /b 0
