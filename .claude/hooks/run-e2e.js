const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const projectRoot = 'C:\\Users\\bcfis\\work\\facefile';
const e2eDir = path.join(projectRoot, 'e2e');
const outFile = 'C:\\Temp\\e2e-hook-out.txt';

function changedFeatureFiles() {
  const run = (cmd) => {
    try {
      return execSync(cmd, { cwd: projectRoot, encoding: 'utf8' });
    } catch {
      return '';
    }
  };

  const lines = [
    ...run('git diff --name-only --cached').split('\n'),
    ...run('git diff --name-only').split('\n'),
    ...run('git ls-files --others --exclude-standard').split('\n'),
  ];

  return lines.some(f => f && /^(frontend|backend)\//.test(f));
}

function isPortUp(port) {
  return new Promise((resolve) => {
    const req = http.get({ hostname: 'localhost', port, path: '/', timeout: 2000 }, () => resolve(true));
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

function rewake(additionalContext) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'Stop', additionalContext },
  }));
  process.exit(2);
}

async function main() {
  if (!changedFeatureFiles()) return;

  const [backendUp, frontendUp] = await Promise.all([isPortUp(3001), isPortUp(4200)]);

  if (!backendUp || !frontendUp) {
    const missing = [
      !backendUp && 'backend :3001',
      !frontendUp && 'frontend :4200',
    ].filter(Boolean).join(' and ');
    rewake(`E2E tests skipped — ${missing} not running. Start the server(s) if you want test coverage.`);
    return;
  }

  if (!fs.existsSync('C:\\Temp')) fs.mkdirSync('C:\\Temp', { recursive: true });

  spawnSync(
    'cmd',
    ['/c', `node_modules\\.bin\\playwright.cmd test --config=playwright.config.ts --reporter=list > "${outFile}" 2>&1`],
    { cwd: e2eDir },
  );

  const output = fs.existsSync(outFile)
    ? fs.readFileSync(outFile, 'utf8').trim()
    : '(no output)';

  rewake(`E2E results after your changes:\n${output}`);
}

main();
