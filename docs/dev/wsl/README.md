# WSL prerequisites for FaceFile

This project is designed to run in WSL (Ubuntu or Debian) for local development, and it expects a Linux environment that can install and run Node.js, npm, AWS tooling, and the Amplify sandbox workflow.

This guide covers the prerequisites you need before you run the repo from WSL.

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
sudo apt install -y build-essential curl ca-certificates python3
```

This is especially important when using npm install on a fresh WSL environment.

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

Configure your AWS profile in WSL:

```bash
aws configure
```

You will be prompted for:

- AWS Access Key ID
- AWS Secret Access Key
- Default region
- Output format

Use the same account/region you intend to use for the Amplify sandbox.

If you prefer to use existing environment variables instead, that also works:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=us-east-1
```

### 7. Amplify CLI tooling

This repo installs the Amplify dependencies at the repo root via npm, so you do not need a global Amplify install for normal local work.

The project expects the root package dependencies to be installed:

```bash
cd /home/brent/work/facefile
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
cd /home/brent/work/facefile/frontend
npm install
```

The repo expects `npm run sync-outputs` to be used when `amplify_outputs.json` changes, so the frontend can read backend config at runtime.

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
cd /home/brent/work/facefile
npm install
```

If the dependencies install cleanly, your WSL environment is ready for the project.

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
cd /home/brent/work/facefile/frontend
npm run sync-outputs
```

---

This is the minimum prerequisite setup needed to work on FaceFile from WSL.
