#!/usr/bin/env bash
set -euo pipefail

# scripts/prefill-avd-snapshot.sh
# Boot the emulator, perform optional setup, save a snapshot and package it for reuse in CI.
# Usage: ./scripts/prefill-avd-snapshot.sh [--avd NAME] [--snapshot NAME] [--out PATH]

AVD_NAME="dyeshopAVD"
SNAP_NAME="dyeshop_quickboot"
OUT_DIR=".github/avd-snapshots"
TIMEOUT=300

while [[ ${#} -gt 0 ]]; do
  case "$1" in
    --avd) AVD_NAME="$2"; shift 2 ;;
    --snapshot) SNAP_NAME="$2"; shift 2 ;;
    --out) OUT_DIR="$2"; shift 2 ;;
    -h|--help) echo "Usage: $0 [--avd NAME] [--snapshot NAME] [--out PATH]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT
PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator"
export PATH

# If snapshot already exists, package and exit (fast path)
SNAP_DIR="$HOME/.android/avd/${AVD_NAME}.avd/snapshots/$SNAP_NAME"
if [[ -d "$SNAP_DIR" ]]; then
  echo "Found existing snapshot: $SNAP_NAME. Packaging..."
  mkdir -p "$OUT_DIR"
  ZIP_PATH="$OUT_DIR/${AVD_NAME}__${SNAP_NAME}.zip"
  (cd "$HOME/.android/avd/${AVD_NAME}.avd" && zip -r -q "$ZIP_PATH" "snapshots/$SNAP_NAME")
  echo "Snapshot packaged at $ZIP_PATH"
  exit 0
fi

# Start emulator (no window) and wait for boot
nohup "$ANDROID_SDK_ROOT/emulator/emulator" -avd "$AVD_NAME" -no-window -gpu swiftshader_indirect -no-snapshot-load -no-boot-anim -no-audio > /tmp/emulator-prefill.log 2>&1 &
PID=$!

SECONDS=0
while true; do
  if adb devices | awk '/emulator-/{print $1; exit}' >/dev/null 2>&1; then
    EMU_ID=$(adb devices | awk '/emulator-/{print $1; exit}')
    if adb -s "$EMU_ID" shell getprop sys.boot_completed 2>/dev/null | grep -q '1'; then
      echo "Emulator booted: $EMU_ID"
      break
    fi
  fi
  sleep 2
  if [[ $SECONDS -ge $TIMEOUT ]]; then
    echo "Timed out waiting for emulator to boot (see /tmp/emulator-prefill.log)" >&2
    kill $PID || true
    exit 2
  fi
done

# Optional: place any setup/installation commands here (install apks, push files)
# e.g. adb -s $EMU_ID install path/to/app.apk

# Save snapshot
adb -s "$EMU_ID" emu avd snapshot save "$SNAP_NAME"

# Give it a moment to flush
sleep 2

# Kill emulator
adb -s "$EMU_ID" emu kill || true

mkdir -p "$OUT_DIR"
SNAP_DIR="$HOME/.android/avd/${AVD_NAME}.avd/snapshots/$SNAP_NAME"
if [[ -d "$SNAP_DIR" ]]; then
  ZIP_PATH="$OUT_DIR/${AVD_NAME}__${SNAP_NAME}.zip"
  (cd "$HOME/.android/avd/${AVD_NAME}.avd" && zip -r -q "$ZIP_PATH" "snapshots/$SNAP_NAME")
  echo "Snapshot packaged at $ZIP_PATH"
else
  echo "Snapshot directory not found: $SNAP_DIR" >&2
  exit 1
fi

exit 0
