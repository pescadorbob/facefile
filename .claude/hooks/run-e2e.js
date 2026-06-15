const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
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

if (!changedFeatureFiles()) {
  process.exit(0);
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

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'Stop',
    additionalContext: `E2E results after your changes:\n${output}`,
  },
}));

process.exit(2);
