#!/bin/bash

set -e

echo "== Instalando dependências =="
sudo apt update
sudo apt install -y \
  android-sdk \
  android-sdk-platform-tools \
  android-sdk-emulator \
  qemu-kvm \
  libvirt-daemon-system \
  libvirt-clients \
  bridge-utils

echo "== Variáveis de ambiente =="
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

mkdir -p $ANDROID_HOME

echo "== Instalando SDKs =="
sdkmanager --install \
  "platform-tools" \
  "emulator" \
  "platforms;android-34" \
  "system-images;android-34;google_apis_playstore;x86_64"

echo "== Criando AVD =="
avdmanager create avd \
  -n dyeshopAVD \
  -k "system-images;android-34;google_apis_playstore;x86_64" \
  --device "pixel" \
  --force

echo "== Iniciando emulador =="
emulator -avd dyeshopAVD



