# Android setup for DYeShop

This document describes the helper scripts in `scripts/` and recommended workflow for running an Android emulator locally and in CI.

## Quick usage

- Install system deps and Android Studio (interactive):
  - `./scripts/setup-android.sh`  
- Install without creating AVD: `./scripts/setup-android.sh --no-avd --yes`
- Create AVD and start emulator (desktop): `./scripts/setup-android.sh --start-emulator`

## Headless emulator script (CI-friendly)

We provide `scripts/start-emulator-headless.sh` which:
- creates the `dyeshopAVD` AVD if it does not exist
- starts the emulator in headless mode with SwiftShader (`-no-window -gpu swiftshader_indirect`)
- waits for the emulator to finish booting (configurable via `--timeout-secs`)

Example:

```
./scripts/start-emulator-headless.sh --force --timeout-secs 300
```

Notes:
- Boot times vary by host. On some CI runners the emulator may take several minutes to boot. If booting times out, increase `--timeout-secs` or use a pre-baked snapshot.
- If your runner supports KVM (self-hosted runner), ensure the `kvm` group is enabled and your user is a member.

## Recommended CI approach (GitHub Actions)

Rather than starting and waiting for the emulator manually, the community `reactivecircus/android-emulator-runner` action does a lot of heavy lifting (creates emulator, starts, waits, uses snapshots):

```yaml
name: E2E Android
on: [push]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: 17

      - name: Install Android SDK packages
        run: |
          yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses
          $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager "platforms;android-33" "system-images;android-33;google_apis;x86_64" "platform-tools" "emulator"

      - name: Start emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 33
          target: google_apis
          arch: x86_64
          emulator-options: -no-window -gpu swiftshader_indirect
          force-avd-creation: true

      - name: Wait for emulator
        run: adb devices --list

      - name: Run Playwright E2E (example)
        run: npx playwright test --project=chromium

```

This approach is reliable in GitHub Actions because the action manages snapshots and waiting for boot.

## When to use `scripts/start-emulator-headless.sh`

- Use it on self-hosted runners where KVM is available and you control the host.
- Use it for ad-hoc local automation on headless machines.

## Troubleshooting

- If `adb` is not found: ensure `$ANDROID_SDK_ROOT/platform-tools` is in your PATH (reload shell or `source ~/.profile`).
- If emulator boot hangs: try increasing the timeout, use `-no-snapshot-load`, or enable KVM.
- If running in GitHub Actions and emulator fails to boot reliably, prefer `reactivecircus/android-emulator-runner`.

---

If you want, I can also add a GitHub Actions workflow template to `.github/workflows/android-emulator.yml` that uses the recommended action.
