#!/usr/bin/env bash
set -euo pipefail

# scripts/start-emulator-headless.sh
# Start (or create+start) an Android AVD in headless mode suitable for CI.
# Usage: ./scripts/start-emulator-headless.sh [--avd NAME] [--force] [--timeout-secs N]

AVD_NAME="dyeshopAVD"
FORCE=0
TIMEOUT=${TIMEOUT:-600}
WIPE_DATA=0
SNAPSHOT_NAME=""

while [[ ${#} -gt 0 ]]; do
  case "$1" in
    --avd) AVD_NAME="$2"; shift 2 ;;
    --snapshot) SNAPSHOT_NAME="$2"; shift 2 ;;
    --force) FORCE=1; shift ;;
    --timeout|--timeout-secs) TIMEOUT="$2"; shift 2 ;;
    --wipe-data) WIPE_DATA=1; shift ;;
    -h|--help) echo "Usage: $0 [--avd NAME] [--snapshot NAME] [--force] [--timeout-secs N] [--wipe-data]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT
PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator"
export PATH

if command -v adb >/dev/null 2>&1; then
  adb start-server >/dev/null 2>&1 || true
  EMU_ID=$(adb devices | awk '/emulator-/{print $1; exit}')
  if [[ -n "$EMU_ID" ]]; then
    echo "An emulator ($EMU_ID) appears to be running."
    if [[ "$FORCE" -eq 0 ]]; then
      echo "Use --force to restart emulator. Exiting."
      exit 0
    else
      echo "Killing existing emulator ($EMU_ID)..."
      adb -s "$EMU_ID" emu kill || true
      sleep 1
    fi
  fi
fi

# Create AVD if missing
if ! "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/avdmanager" list avd | grep -q "Name: $AVD_NAME"; then
  echo "Creating AVD: $AVD_NAME"
  echo "no" | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/avdmanager" create avd -n "$AVD_NAME" -k "system-images;android-33;google_apis;x86_64" -d "pixel" --force
fi

# Decide on acceleration flags: use hardware accel if /dev/kvm exists
EMULATOR_CMD=("$ANDROID_SDK_ROOT/emulator/emulator" -avd "$AVD_NAME" -no-window -gpu swiftshader_indirect -no-boot-anim -no-audio -no-metrics)
if [[ -c /dev/kvm ]]; then
  echo "/dev/kvm present: enabling hardware acceleration"
  # Let emulator auto-select accel (do not pass -no-accel)
else
  echo "/dev/kvm not present: running with TCG (slower)"
  # nothing to add; emulator will use TCG when KVM not available
fi
# If a snapshot name is provided, restore it; otherwise avoid loading any snapshot
if [[ -n "$SNAPSHOT_NAME" ]]; then
  echo "Will try to restore snapshot: $SNAPSHOT_NAME"
  EMULATOR_CMD+=("-snapshot" "$SNAPSHOT_NAME")
else
  EMULATOR_CMD+=("-no-snapshot-load")
fi
if [[ "$WIPE_DATA" -eq 1 ]]; then
  EMULATOR_CMD+=("-wipe-data")
fi

# Start emulator in background
nohup "${EMULATOR_CMD[@]}" > "/tmp/emulator-${AVD_NAME}.log" 2>&1 &
EMU_PID=$!
echo "Emulator started (pid=$EMU_PID); logs -> /tmp/emulator-${AVD_NAME}.log"

# Wait for boot
echo "Waiting for emulator to finish booting (timeout=${TIMEOUT}s)..."
SECONDS=0
# Wait for emulator to be recognized and fully booted
while true; do
  EMU_ID=$(adb devices | awk '/emulator-/{print $1; exit}') || true
  if [[ -n "$EMU_ID" ]]; then
    BOOTED=$(adb -s "$EMU_ID" shell getprop sys.boot_completed 2>/dev/null || true)
    if [[ "$BOOTED" = "1" ]]; then
      echo "Emulator $EMU_ID booted"
      break
    fi
    # If boot hasn't completed but system is up enough, print a progress hint
    if adb -s "$EMU_ID" shell getprop sys.booting 2>/dev/null | grep -q '1'; then
      echo "Emulator is booting... (elapsed ${SECONDS}s)"
    else
      echo "Waiting for emulator process to initialize... (elapsed ${SECONDS}s)"
    fi
  else
    echo "Waiting for emulator device to appear... (elapsed ${SECONDS}s)"
  fi
  sleep 3
  if [[ $SECONDS -ge $TIMEOUT ]]; then
    echo "Timed out waiting for emulator to boot. See /tmp/emulator-${AVD_NAME}.log" >&2
    # dump last 200 lines to help debugging
    echo "=== last /tmp/emulator-${AVD_NAME}.log ==="
    tail -n 200 "/tmp/emulator-${AVD_NAME}.log" || true
    exit 2
  fi
done

echo "Emulator ready - adb devices:" && adb devices

exit 0
