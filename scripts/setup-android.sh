#!/usr/bin/env bash
set -euo pipefail

# scripts/setup-android.sh
# Instala Android Studio, SDK command-line tools, componentes do SDK e cria um AVD (Linux - Debian/Ubuntu)
# Uso: sudo ./scripts/setup-android.sh [--no-avd] [--start-emulator] [--yes]

SKIP_AVD=0
START_EMU=0
ASSUME_YES=0
AVD_NAME="dyeshopAVD"
ANDROID_API="android-33"
SYSTEM_IMAGE="system-images;android-33;google_apis;x86_64"
BUILD_TOOLS="build-tools;33.0.0"

while [[ ${#} -gt 0 ]]; do
  case "$1" in
    --no-avd) SKIP_AVD=1; shift ;;
    --start-emulator) START_EMU=1; shift ;;
    --yes|-y) ASSUME_YES=1; shift ;;
    -h|--help) echo "Usage: $0 [--no-avd] [--start-emulator] [--yes]"; exit 0 ;;
    *) echo "Unknown argument: $1"; echo "Usage: $0 [--no-avd] [--start-emulator] [--yes]"; exit 1 ;;
  esac
done

confirm() {
  if [[ "$ASSUME_YES" -eq 1 ]]; then
    return 0
  fi
  read -r -p "$1 [y/N] " ans
  case "$ans" in
    [Yy]*) return 0 ;;
    *) return 1 ;;
  esac
}

require_sudo() {
  if [[ $(id -u) -ne 0 ]]; then
    echo "Some steps require sudo. You may be prompted for your password."
  fi
}

main() {
  echo "== DYeShop Android dev installer =="
  echo "This script targets Debian/Ubuntu-based systems."

  require_sudo

  if ! command -v apt-get >/dev/null 2>&1; then
    echo "Error: apt-get not found. This script supports Debian/Ubuntu-based distros only." >&2
    exit 1
  fi

  if [[ $ASSUME_YES -ne 1 ]]; then
    echo "This will install packages with sudo (snapd, openjdk, qemu-kvm, etc) and modify your shell rc files to set ANDROID_SDK_ROOT."
    confirm "Proceed with installation?" || (echo "Aborting." && exit 1)
  fi

  sudo apt-get update

  echo "* Installing system dependencies (snapd, wget, unzip, openjdk, qemu-kvm, libvirt)"
  sudo apt-get install -y snapd wget unzip ca-certificates curl gnupg lsb-release \
    openjdk-17-jdk-headless qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils

  echo "* Ensuring snapd is running and in PATH"
  sudo systemctl enable --now snapd.socket || true

  if ! command -v snap >/dev/null 2>&1; then
    echo "Error: snap not available after install." >&2
    exit 1
  fi

  if ! snap list | grep -q '^android-studio'; then
    echo "* Installing Android Studio via snap"
    sudo snap install android-studio --classic || echo "Snap install failed; you can install Android Studio manually from https://developer.android.com/studio"
  else
    echo "* Android Studio already installed via snap"
  fi

  # Set default SDK path
  export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
  mkdir -p "$ANDROID_SDK_ROOT"

  CMDLINE_CANDIDATES=( \
    "https://dl.google.com/android/repository/commandlinetools-linux-latest.zip" \
    "https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip" \
    "https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip" \
    "https://dl.google.com/android/repository/commandlinetools-linux-8301080_latest.zip" \
  )
  TMPDIR=$(mktemp -d)
  trap 'rm -rf "$TMPDIR"' EXIT
  echo "* Downloading Android command-line tools"
  if [[ ! -x "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]]; then
    mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"
    success=0
    for url in "${CMDLINE_CANDIDATES[@]}"; do
      echo "Trying $url ..."
      if curl -fL --retry 3 --retry-delay 2 -o "$TMPDIR/cmdline-tools.zip" "$url"; then
        echo "Downloaded $url"
        unzip -q "$TMPDIR/cmdline-tools.zip" -d "$TMPDIR"
        if [[ -d "$TMPDIR/cmdline-tools" ]]; then
          rm -rf "$ANDROID_SDK_ROOT/cmdline-tools/latest"
          mv "$TMPDIR/cmdline-tools" "$ANDROID_SDK_ROOT/cmdline-tools/latest"
        else
          extracted="$(find "$TMPDIR" -maxdepth 1 -type d -name 'cmdline-tools*' | head -n1)"
          if [[ -n "$extracted" ]]; then
            rm -rf "$ANDROID_SDK_ROOT/cmdline-tools/latest"
            mv "$extracted" "$ANDROID_SDK_ROOT/cmdline-tools/latest"
          else
            rm -rf "$ANDROID_SDK_ROOT/cmdline-tools/latest"
            mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools/latest"
            unzip -q "$TMPDIR/cmdline-tools.zip" -d "$ANDROID_SDK_ROOT/cmdline-tools/latest"
          fi
        fi
        echo "Command-line tools installed to $ANDROID_SDK_ROOT/cmdline-tools/latest"
        success=1
        break
      else
        echo "Failed to download $url"
      fi
    done
    if [[ $success -ne 1 ]]; then
      echo "Failed to download Android command-line tools automatically. Please download from https://developer.android.com/studio#command-line-tools and place the archive into $ANDROID_SDK_ROOT, then re-run the script." >&2
      exit 1
    fi
  else
    echo "* Command-line tools already present"
  fi

  # Ensure shell rc files have ANDROID_SDK_ROOT and PATH entries
  SHELL_RC="$HOME/.bashrc"
  if [[ -n "${ZSH_VERSION-}" ]]; then
    SHELL_RC="$HOME/.zshrc"
  fi

  add_path_line() {
    local file="$1"
    local line="$2"
    touch "$file"
    if ! grep -Fq "$line" "$file" 2>/dev/null; then
      echo "$line" >> "$file"
      echo "Added to $file: $line"
    fi
  }

  add_path_line "$HOME/.profile" "export ANDROID_SDK_ROOT=\"$ANDROID_SDK_ROOT\""
  add_path_line "$SHELL_RC" "export ANDROID_SDK_ROOT=\"$ANDROID_SDK_ROOT\""
  add_path_line "$HOME/.profile" "export PATH=\"\$PATH:\$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:\$ANDROID_SDK_ROOT/platform-tools:\$ANDROID_SDK_ROOT/emulator\""
  add_path_line "$SHELL_RC" "export PATH=\"\$PATH:\$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:\$ANDROID_SDK_ROOT/platform-tools:\$ANDROID_SDK_ROOT/emulator\""

  echo "* Installing SDK components (platform-tools, emulator, platform $ANDROID_API, build-tools and system image)"
  export PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"

  yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1 || true

  "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --install "platform-tools" "emulator" "platforms;$ANDROID_API" "$BUILD_TOOLS" "$SYSTEM_IMAGE" || {
    echo "sdkmanager failed to install some packages. Check network or rerun the script." >&2
    exit 1
  }

  echo "* Installed packages:" 
  ls -1 "$ANDROID_SDK_ROOT" || true

  if [[ $SKIP_AVD -eq 0 ]]; then
    echo "* Creating AVD named $AVD_NAME (if not present)"
    export PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/emulator"

    if "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/avdmanager" list avd | grep -q "Name: $AVD_NAME"; then
      echo "AVD $AVD_NAME already exists"
    else
      echo "yes" | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/avdmanager" create avd -n "$AVD_NAME" -k "$SYSTEM_IMAGE" -d "pixel" --force
      echo "Created AVD $AVD_NAME"
    fi
  else
    echo "* Skipping AVD creation (--no-avd)"
  fi

  echo "* Accepting licenses"
  yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1 || true

  echo "* Adding current user to kvm group (may require logout/login)"
  TARGET_USER="${SUDO_USER:-$USER}"
  sudo usermod -aG kvm "$TARGET_USER" || true

  echo "Done. Please reload your shell (source ~/.profile or open a new terminal) to pick up ANDROID_SDK_ROOT and updated PATH."

  if [[ $START_EMU -eq 1 ]]; then
    echo "* Starting emulator $AVD_NAME"
    nohup "$ANDROID_SDK_ROOT/emulator/emulator" -avd "$AVD_NAME" -gpu auto -no-snapshot-load >/dev/null 2>&1 &
    echo "Emulator starting in background (use 'adb devices' to check)."
  fi

  rm -rf "$TMPDIR"
  echo "All set! Verify with: source ~/.profile && adb devices"
}

main "$@"
