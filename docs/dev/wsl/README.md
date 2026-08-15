# WSL prerequisites for FaceFile

This project is not intended to be developed from a Windows-native shell. The app and its AWS Amplify deployment tooling are Linux-oriented, and the closest match to the deployment environment is WSL (Ubuntu or Debian).

Using WSL helps avoid a lot of cross-platform mismatches between the source environment and the target runtime. In practice, the AWS Amplify sandbox and Node-based tooling behave much more predictably when the code is run from Linux rather than from PowerShell, Git Bash, or a Windows-only toolchain.

This guide covers the prerequisites you need before you run the repo from WSL.

Important: WSL is a full, separate Linux environment. It is not just "Git Bash" or a Windows shell with a few commands. Any tools you want to use for development in this environment must be installed inside WSL itself, including Node, npm, Git, AWS tooling, and any editor/CLI utilities you want to run from the Linux side.

This also applies to VS Code: if you want to run terminal-based development inside WSL, install the WSL extension in Windows VS Code and open the folder from the WSL environment. Tools like Claude Code, documentation viewers, or other dev utilities are not automatically available just because they are installed on Windows.

## Using VS Code with WSL

The simplest setup is to do the work directly in WSL and not bounce the project through Windows.

1. In WSL, create your normal user account, create a workspace folder like `~/work`, and clone the repo there.
2. Open the folder directly from the WSL filesystem, such as `~/work/facefile`, in VS Code.
3. Use the integrated terminal in that VS Code window, which is already running inside the Linux environment.

This is better than trying to open a Windows-side clone and then rely on a translation layer between WSL and Windows. The project is meant to run in Linux, and using a Windows path or a Windows terminal adds avoidable path, auth, and dependency mismatches.

If you want to use Claude Code, documentation viewers, or other tooling from within the editor, install them in the WSL environment itself so they are resolving against the same Linux runtime and file system as the app.

## Required tools

### 1. WSL with Ubuntu/Debian

Use a modern Ubuntu-based WSL distribution.

Recommended:

- Ubuntu 22.04 LTS or newer
- Windows 11 with WSL2 enabled

Check your distro:

```bash
cat /etc/os-release
```

If needed, install WSL and set Ubuntu as your default distribution:

```bash
wsl --install -d Ubuntu
```

Then reopen the Linux terminal.

Important: create a normal Linux user account for development and do not use the root account. In WSL, you should work from your regular user home directory, not as `root`.

For this repo, the expected workflow is to run as the user `brent`, not as `root`.

To switch to the user account in WSL, run:

```bash
su - brent
```

Then verify:

```bash
whoami
# should show: brent
mkdir -p ~/work
cd ~/work
```

If you ever see yourself in `/root`, exit and switch back to your normal user before continuing.

#### Make WSL always log in as your user

If WSL is dropping you into root on every new terminal, fix the default user instead of running `su - brent` each time.

Check your current default user from Windows PowerShell:

```powershell
wsl -l -v
```

Then try logging in as your user explicitly:

```powershell
wsl -d <YourDistroName> -u brent
```

If that works, set it permanently:

```powershell
wsl -d <YourDistroName> --set-default-user brent
```

Or the older syntax:

```powershell
ubuntu config --default-user brent
```

Now WSL will always open as `brent`, not `root`.

Do not run project commands with `sudo` unless a package manager or installer specifically requires it. For this project, use the normal user account (`brent`) for cloning, npm install, running the sandbox, and launching the frontend.

Then clone this repo into a subdirectory under your user account, for example:

```bash
git clone <repo-url> ~/work/facefile
cd ~/work/facefile
```

Avoid cloning into `/root` or running the project as the `root` user.

### 2. Node.js via nvm

This repo uses Node 22 and expects a modern npm toolchain.

Install `nvm` in WSL:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Then reload your shell:

```bash
source ~/.bashrc
```

If you use zsh instead:

```bash
source ~/.zshrc
```

Install the supported Node version:

```bash
nvm install 22
nvm use 22
node -v
npm -v
```

Expected result:

- `node` version should be 22.x
- `npm` should be available and working

#### Make `sudo` see your nvm-installed Node

`sudo` resets your shell's `PATH` by default (a security feature called `secure_path`), so it can't find `node`/`npm`/`npx` installed by nvm under `~/.nvm`. Any command that needs both `sudo` and a Node-based CLI — for example `sudo npx playwright install-deps` (see [E2E test prerequisites](#e2e-test-prerequisites-playwright) below) — will fail with `sudo: npx: command not found` until this is fixed.

Add this to the end of `~/.bashrc`:

```bash
# sudo strips PATH by default, so it can't see nvm-managed node/npm/npx.
# This preserves the current PATH into sudo'd commands (nvm's documented fix).
alias sudo='sudo env PATH="$PATH"'
```

Then reload your shell:

```bash
source ~/.bashrc
```

After this, `sudo npx ...`, `sudo npm ...`, and `sudo node ...` all resolve against whatever Node version `nvm` currently has active, in every new shell — no need to repeat this per version switch or per command.

### 3. Git

Git is required for cloning and working with the repo.

```bash
git --version
```

If it is not installed:

```bash
sudo apt update
sudo apt install git -y
```

Set your Git identity before committing or creating branches in this repo:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Verify the config:

```bash
git config --global --list
```

### 4. Build tools for native dependencies

Some Node packages and frontend tooling may need build essentials.

Install the common Linux build prerequisites:

```bash
sudo apt update
sudo apt install -y build-essential curl ca-certificates python3 unzip
```

This is especially important when using npm install on a fresh WSL environment.

If you hit an error like `Command 'unzip' not found`, install it explicitly:

```bash
sudo apt install unzip
```

After the AWS CLI install succeeds, clean up the temporary zip file:

```bash
rm -f ~/awscliv2.zip
```

## AWS / Amplify prerequisites

This repo uses the Amplify Gen 2 sandbox workflow and AWS resources. Before running the backend, you need AWS access configured in WSL.

### 5. AWS CLI

Install the AWS CLI v2:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

Verify:

```bash
aws --version
```

### 6. AWS credentials

For this project, use the AWS SSO profile flow instead of static IAM access keys when your account is configured for AWS IAM Identity Center.

Configure a local AWS profile in WSL:

```bash
aws configure sso
```

You will be prompted for:

- SSO session name (for example: `amplify-admin`)
- SSO start URL
- SSO region (for example: `us-west-2`)
- profile name (for example: `amplify-policy-799537122768`)

Then sign in and refresh the local credentials:

```bash
aws sso login --profile default
```

Verify the profile works:

```bash
aws sts get-caller-identity --profile default
```

This is the correct flow for an AWS account using SSO roles, and it avoids storing long-lived access keys in your WSL environment.

If your account is not using SSO, then static access keys are the fallback, but in the org shown here you should use the SSO profile path.

### 7. Amplify CLI tooling

This repo installs the Amplify dependencies at the repo root via npm, so you do not need a global Amplify install for normal local work.

The project expects the root package dependencies to be installed:

```bash
cd ~/work/facefile
npm install
```

That installs the root tooling used for:

- `ampx sandbox`
- `ampx pipeline-deploy`
- `tsx amplify/seed.ts`

## Frontend prerequisites

The Angular app in `frontend/` also expects a clean Node environment and package install.

Install frontend dependencies:

```bash
cd ~/work/facefile/frontend
npm install
```

The repo expects `npm run sync-outputs` to be used when `amplify_outputs.json` changes, so the frontend can read backend config at runtime.

## E2E test prerequisites (Playwright)

The e2e suite in `e2e/` uses Playwright, which drives a real headless Chromium. Install its dependencies:

```bash
cd ~/work/facefile/e2e
npm install
```

Playwright's headless browser binary needs a large set of Linux shared libraries (GTK, fonts, codecs, `libnspr4.so`, `libnss3.so`, and similar) that a fresh WSL install does not have. Without them, `npm run test:e2e` fails immediately with errors like:

```
error while loading shared libraries: libnspr4.so: cannot open shared object file: No such file or directory
```

Install the missing system libraries with Playwright's own installer (requires `sudo`, so make sure the [`sudo` + nvm PATH fix](#make-sudo-see-your-nvm-installed-node) above is in place first):

```bash
sudo npx playwright install-deps
```

Verify it worked:

```bash
cd ~/work/facefile/e2e
npm run test:e2e
```

## Recommended environment check

After setup, verify all core tools work:

```bash
node -v
npm -v
git --version
aws --version
```

Then from the repo root:

```bash
cd ~/work/facefile
npm install
```

If the dependencies install cleanly, your WSL environment is ready for the project.

## Running the app for e2e tests

From the repo root in WSL, start the backend sandbox and the frontend app in separate terminals.

### Start the Amplify sandbox

```bash
cd ~/work/facefile
npm run sandbox
```

This starts the local AWS sandbox deployment that the app depends on.

### Start the frontend

In a second terminal:

```bash
cd ~/work/facefile/frontend
npm run sync-outputs
npm run start
```

The frontend should serve the app locally, typically on:

- http://localhost:4200

### Seed the app, if needed

After the sandbox is up and stable, initialize the seeded default data if required by your workflow:

```bash
cd ~/work/facefile
npm run seed
```

### Run e2e tests

Once both the Amplify sandbox and the frontend are running (and the [Playwright system dependencies](#e2e-test-prerequisites-playwright) are installed), run the suite from the `e2e/` folder:

```bash
cd ~/work/facefile/e2e
npm run test:e2e
```

Other useful variants:

```bash
npm run test:e2e:headed   # run with a visible browser window
npm run test:e2e:ui       # interactive Playwright UI mode
npm run test:e2e:report   # open the HTML report from the last run
npm run test:e2e:prod     # run against the deployed prod config instead of local
```

## Notes for this repo

This project is not a typical single-process app. It expects:

- Node 22 in WSL
- AWS credentials available to the Linux environment
- Amplify sandbox access to deploy resources
- A separate Angular frontend running under `frontend/`
- Runtime-generated `amplify_outputs.json` that the frontend reads via `/amplify_outputs.json`

The root instruction file in this repo also notes that the backend is deployed via AWS Amplify Gen 2, not via a local Node/Express process.

## Common WSL gotchas

- If `nvm` is not recognized, close and reopen the WSL terminal after installation.
- If `aws` is not recognized, reopen the terminal or add it to your PATH.
- If `npm install` fails, install the build tools package first:

```bash
sudo apt install -y build-essential
```

- If the Angular frontend cannot find backend config, run:

```bash
cd ~/work/facefile/frontend
npm run sync-outputs
```

---

This is the minimum prerequisite setup needed to work on FaceFile from WSL.
