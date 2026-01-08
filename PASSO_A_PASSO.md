# 📋 PASSO A PASSO — Executar o emulador e a app (Android / VS Code)

Este guia rápido mostra como preparar, iniciar e depurar o emulador Android e executar o aplicativo DYeShop localmente usando o VS Code.

---

## Requisitos
- Linux (Debian/Ubuntu) com sudo
- Android SDK (o script `scripts/setup-android.sh` instala automaticamente)
- `adb` e `emulator` (vêm com o Android SDK)
- Node.js e dependências do projeto (execute `npm install` no projeto)
- VS Code + extensão ShellCheck (opcional, já instalada se pediu)

---

## 1) Instalar SDK e criar AVD
1. Abra um terminal no diretório do projeto.
2. Execute:

   sudo ./scripts/setup-android.sh --yes

   - Isso instala command-line tools, packages (platform-tools, emulator, platform-33, build-tools, system-image) e cria um AVD `dyeshopAVD` (a menos que use `--no-avd`).
3. Reinicie o shell ou carregue o perfil:

   source ~/.profile

---

## 2) Iniciar o emulador (headless)
- Pelo script (recomendado):

  ./scripts/start-emulator-headless.sh --force --timeout-secs 600

  - `--force` reinicia se já houver um emulador.
  - `--snapshot NAME` restaura um snapshot salvo (se houver).
  - Use `--timeout-secs` para ajustar o tempo máximo de espera.

- Pelo VS Code (Task):
  - Command Palette → Tasks: Run Task → "Start Emulator (headless)".

- Verifique boot:

  adb devices
  adb -s <emulator-id> shell getprop sys.boot_completed

---

## 3) Iniciar o servidor Next (app)
- Inicie em background (ou use task do VS Code):

  nohup npm run dev > /tmp/next-dev.log 2>&1 &
  tail -f /tmp/next-dev.log

- Confirme que o server está em `http://localhost:3000`.

---

## 4) Conectar emulador ao servidor local
- Opção 1: usar `adb reverse` (recomendado):

  adb reverse tcp:3000 tcp:3000

  - Após isso, no emulador acesse `http://10.0.2.2:3000` ou `http://localhost:3000` (dependendo do navegador do emulador).

- Opção 2: abrir URL diretamente na VM Android:

  adb shell am start -a android.intent.action.VIEW -d "http://10.0.2.2:3000"

---

## 5) Depurar com VS Code (Chrome)
1. Execute as Tasks: "Start Emulator (headless)" e "Start Next Dev" (ou o composto "Start App+Emulator").
2. Abra o painel Run and Debug (Ctrl+Shift+D) e execute a configuração "Launch Chrome against localhost:3000".
3. Defina breakpoints nos arquivos `.tsx` e recarregue a página no Chrome lançado pelo debug.

---

## 6) Dicas e resolução de problemas
- Se o emulador não iniciar ou ficar lento, verifique se `/dev/kvm` está disponível ou aumente `--timeout-secs`.
- Se o navegador do emulador não alcançar o servidor, confirme `adb reverse` e que o servidor está escutando em `localhost:3000`.
- Logs úteis:
  - Emulador: `/tmp/emulator-<AVD>.log`
  - Next dev: `/tmp/next-dev.log`
- Para criar e empacotar um snapshot (pra CI): veja `scripts/prefill-avd-snapshot.sh`.

---

Se quiser, posso também adicionar um trecho no README do projeto com estes passos e/ou criar um job GitHub Actions de exemplo que restaura um snapshot e executa os testes Playwright.

---

**Observação final:** aponte qual é a **mensagem exata de erro** que você está vendo na **linha 6** de `src/pages/_app.tsx` (copie/cole aqui ou abra o painel "Problems" no VS Code — Ctrl+Shift+M). Eu vou corrigir o problema assim que tiver a mensagem precisa.