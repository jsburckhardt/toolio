import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const helper = fileURLToPath(new URL('../skills/factory-deliver/scripts/worktrees.mjs', import.meta.url));

function fixture(t, tasks) {
  const root = mkdtempSync(join(tmpdir(), 'factory-v2-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git('init', '--quiet', '-b', 'main');
  git('config', 'user.name', 'Factory fixture');
  git('config', 'user.email', 'fixture@agents.invalid');
  git('config', 'commit.gpgsign', 'false');
  writeFileSync(join(root, 'work.md'), '# Agreed fixture\n' + [...new Set(tasks.flatMap(t => t.acs))].join(' ') + '\n');
  writeFileSync(join(root, 'justfile'), 'verify-focused:\n    @true\n\nverify:\n    @true\n');
  git('add', '.');
  git('commit', '--quiet', '-m', 'fixture: initial');
  git('switch', '--quiet', '-c', 'feat/fixture');
  const plan = join(root, 'plan.json');
  writeFileSync(plan, JSON.stringify({ tasks, combinedCheck: ['node', '-e',
    'process.exit(require("node:fs").existsSync(".trees/fail-check") ? 1 : 0)'] }));
  git('add', 'plan.json');
  git('commit', '--quiet', '-m', 'fixture: plan');
  const worker = join(root, '.fixture-copilot');
  writeFileSync(worker, `#!/usr/bin/env node
const fs = require('node:fs');
const cp = require('node:child_process');
const c = JSON.parse(fs.readFileSync(process.env.FACTORY_CONTEXT, 'utf8'));
const git = (...args) => cp.execFileSync('git', args, { encoding: 'utf8' }).trim();
(async () => {
  if (c.mode === 'implement') {
    const instructions = JSON.parse(c.task.instructions);
    if (instructions.descendant) {
      const descendant = cp.spawn(process.execPath, ['-e', 'process.on("SIGTERM", () => {}); require("node:fs").writeFileSync(process.argv[1], "ready"); setInterval(() => {}, 1000)', c.root + '/.trees/descendant.ready'], { stdio: 'ignore' });
      fs.writeFileSync(c.root + '/.trees/descendant.pid', String(descendant.pid));
    }
    if (instructions.wait) {
      while (!fs.existsSync(c.root + '/.trees/release')) await new Promise(r => setTimeout(r, 20));
    }
    fs.writeFileSync(instructions.file, instructions.text);
    if (instructions.extra) fs.writeFileSync('outside.txt', 'outside scope');
    git('add', '.');
    git('commit', '--quiet', '-m', 'feat: fixture task');
    fs.writeFileSync(c.output, JSON.stringify({
      sha: git('rev-parse', 'HEAD'), checks: [{ command: 'fixture', exitCode: 0, summary: 'controlled fixture only' }],
      acEvidence: c.task.acs.map(id => ({ id, status: 'met', evidence: 'fixture output' })), decisions: []
    }));
  } else {
    const verdict = process.env.FACTORY_FIXTURE_REVIEW === 'fail' ? 'fail' : 'pass';
    fs.writeFileSync(c.output, JSON.stringify({
      sha: process.env.FACTORY_FIXTURE_REVIEW === 'stale' ? '0'.repeat(40) : c.expectedSha,
      verdict, checks: [{ command: 'fixture', exitCode: 0, summary: 'controlled review fixture' }],
      acEvidence: c.acs.map(id => ({ id, status: verdict === 'pass' ? 'met' : 'unmet', evidence: 'fixture review' })),
      findings: verdict === 'pass' ? [] : [{ id: 'F-1', severity: 'major', location: 'fixture', finding: 'fixture rejection', suggestion: 'fix', owner: 'implementation' }]
    }));
  }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
`, { mode: 0o755 });
  // Fixture resources are not application changes or delivery evidence.
  git('config', 'core.excludesFile', join(root, '.fixture-ignore'));
  writeFileSync(join(root, '.fixture-ignore'), '.fixture-*\n');
  const env = { ...process.env, FACTORY_LEAD_ID: 'lead-fixture', FACTORY_COPILOT: worker };
  const call = (args, extra = {}) => spawnSync(process.execPath, [helper, ...args], {
    cwd: root, env: { ...env, ...extra }, encoding: 'utf8', timeout: 20000,
  });
  const ok = (...args) => {
    const result = call(args);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  const fail = (args, pattern, extra = {}) => {
    const result = call(args, extra);
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, pattern);
  };
  const state = () => JSON.parse(readFileSync(join(root, '.trees/state.json'), 'utf8'));
  const start = id => {
    const child = spawn(process.execPath, [helper, 'run', id], { cwd: root, env, stdio: 'pipe' });
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk; });
    const done = new Promise((res, rej) => child.on('exit', code => code === 0 ? res() : rej(new Error(stderr))));
    t.after(() => { if (child.exitCode === null) child.kill('SIGTERM'); });
    return { child, done };
  };
  ok('init', '13', 'work.md', plan);
  return { root, git, call, ok, fail, state, start };
}

const task = (id, file, ac, dependsOn = [], extra = {}) => ({
  id, paths: [file], acs: [ac], dependsOn,
  instructions: JSON.stringify({ file, text: id, ...extra }),
});

async function waitFor(check) {
  for (let i = 0; i < 200; i++) {
    if (check()) return;
    await new Promise(r => setTimeout(r, 20));
  }
  assert.fail('Timed out waiting for controlled worker state');
}

test('parallel workers integrate serially, unlock dependants and accept the exact combined head', async t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1', [], { wait: true }),
    task('T2', 'b.txt', 'AC-2', [], { wait: true }), task('T3', 'c.txt', 'AC-3', ['T1', 'T2'])]);
  f.fail(['run', 'T3'], /prerequisite/);
  const a = f.start('T1');
  const b = f.start('T2');
  await waitFor(() => f.state().tasks.filter(x => x.status === 'running').length === 2);
  f.fail(['run', 'T1'], /already|running/);
  writeFileSync(join(f.root, '.trees/release'), 'release');
  await Promise.all([a.done, b.done]);
  f.fail(['integrate', 'T1'], /review/);
  f.ok('review', 'T1');
  f.ok('review', 'T2');
  f.ok('integrate', 'T1');
  f.fail(['run', 'T3'], /prerequisite/);
  f.ok('integrate', 'T2');
  f.ok('run', 'T3');
  f.ok('review', 'T3');
  f.ok('integrate', 'T3');
  f.ok('accept');
  assert.equal(f.state().acceptedSha, f.git('rev-parse', 'HEAD'));
  assert.equal(readFileSync(join(f.root, 'c.txt'), 'utf8'), 'T3');
  f.ok('cleanup', 'T1');
  assert.equal(existsSync(join(f.root, '.trees/T1')), false);
  f.ok('cleanup', 'T2');
  f.ok('cleanup', 'T3');
  const accepted = f.state().acceptedSha;
  f.ok('archive');
  assert.equal(existsSync(join(f.root, '.trees/history', `13-${accepted.slice(0, 12)}`, 'results/final-review.json')), true);
  f.ok('init', '14', 'work.md', join(f.root, 'plan.json'));
  assert.equal(f.state().issue, '14');
});

test('capacity, overlapping scope and lead ownership prevent conflicting dispatch', async t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1', [], { wait: true }),
    task('T2', 'b.txt', 'AC-2', [], { wait: true }), task('T3', 'c.txt', 'AC-3'),
    task('T4', 'a.txt', 'AC-3')]);
  const a = f.start('T1');
  await waitFor(() => f.state().tasks[0].status === 'running');
  f.fail(['run', 'T4'], /overlap/);
  f.fail(['run', 'T3'], /lead/, { FACTORY_LEAD_ID: 'other-lead' });
  const b = f.start('T2');
  await waitFor(() => f.state().tasks[1].status === 'running');
  f.fail(['run', 'T3'], /two|capacity/);
  writeFileSync(join(f.root, '.trees/release'), 'release');
  await Promise.all([a.done, b.done]);
});

test('scope violations and failed or stale review evidence cannot integrate', t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1'), task('T2', 'b.txt', 'AC-2', [], { extra: true })]);
  f.ok('run', 'T1');
  f.fail(['review', 'T1'], /review.*fail|rejected/, { FACTORY_FIXTURE_REVIEW: 'fail' });
  f.fail(['integrate', 'T1'], /review/);
  f.fail(['review', 'T1'], /SHA|sha|commit/, { FACTORY_FIXTURE_REVIEW: 'stale' });
  f.ok('review', 'T1');
  f.fail(['run', 'T2'], /scope/);
  assert.equal(existsSync(join(f.root, '.trees/T2/outside.txt')), true);
  f.fail(['integrate', 'T2'], /review/);
});

test('integration failure gates dispatch until independently reviewed repair passes', t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1'), task('T2', 'b.txt', 'AC-2')]);
  f.ok('run', 'T1');
  f.ok('review', 'T1');
  writeFileSync(join(f.root, '.trees/fail-check'), 'fail');
  f.fail(['integrate', 'T1'], /check/);
  f.fail(['run', 'T2'], /integration/i);
  f.fail(['repair'], /check/);
  rmSync(join(f.root, '.trees/fail-check'));
  f.ok('repair');
  assert.equal(f.state().tasks[0].status, 'integrated');
  f.ok('run', 'T2');
});

test('changed reviewed head, dirty work and new final commits invalidate acceptance', t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1')]);
  f.ok('run', 'T1');
  f.ok('review', 'T1');
  const tree = join(f.root, '.trees/T1');
  writeFileSync(join(tree, 'a.txt'), 'changed after review');
  spawnSync('git', ['-C', tree, 'add', '.']);
  spawnSync('git', ['-C', tree, 'commit', '--quiet', '-m', 'feat: later change']);
  f.fail(['integrate', 'T1'], /SHA|sha|commit|head/);
  f.ok('review', 'T1');
  f.ok('integrate', 'T1');
  f.ok('accept');
  f.git('commit', '--allow-empty', '--quiet', '-m', 'chore: later commit');
  const status = JSON.parse(f.ok('status'));
  assert.equal(status.accepted, false);
  writeFileSync(join(f.root, 'a.txt'), 'uncommitted');
  f.fail(['accept'], /clean|dirty/);
});

test('interrupted worker is preserved and cannot be recovered while its process is live', async t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1', [], { wait: true, descendant: true })]);
  const descendantFile = join(f.root, '.trees/descendant.pid');
  const executing = pid => {
    try { return readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ')[1].split(' ')[0] !== 'Z'; }
    catch { return false; }
  };
  const running = f.start('T1');
  running.done.catch(() => {});
  await waitFor(() => existsSync(join(f.root, '.trees/descendant.ready')));
  const descendantPid = Number(readFileSync(descendantFile, 'utf8'));
  t.after(() => { if (executing(descendantPid)) process.kill(descendantPid, 'SIGKILL'); });
  f.fail(['recover', 'T1'], /live|running/);
  f.fail(['handoff', 'next-lead'], /live|running/);
  running.child.kill('SIGTERM');
  await waitFor(() => f.state().tasks[0].status !== 'running');
  assert.equal(executing(descendantPid), false, 'Cancellation must stop the worker descendant before allowing redispatch');
  assert.equal(existsSync(join(f.root, '.trees/T1')), true);
  f.fail(['cleanup', 'T1'], /integrated/);
  f.ok('handoff', 'next-lead');
  f.fail(['run', 'T1'], /lead/);
});

test('real merge conflicts preserve work and require clean independently reviewed repair', t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1'), task('T2', 'a.txt', 'AC-2')]);
  f.ok('run', 'T1');
  f.ok('run', 'T2');
  f.ok('review', 'T1');
  f.ok('review', 'T2');
  f.ok('integrate', 'T1');
  f.fail(['integrate', 'T2'], /check failed/);
  f.fail(['repair'], /clean/);
  assert.equal(existsSync(join(f.root, '.trees/T2/a.txt')), true);
  writeFileSync(join(f.root, 'a.txt'), 'resolved fixture change');
  f.git('add', 'a.txt');
  f.git('commit', '--quiet', '-m', 'fix: resolve fixture integration');
  f.ok('repair');
  assert.equal(f.state().tasks[1].status, 'integrated');
});

test('approved plan revisions preserve unfinished work, invalidate review and reject dependency cycles', async t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1', [], { wait: true })]);
  const snapshot = join(f.root, '.fixture-plan.json');
  const original = JSON.parse(readFileSync(join(f.root, 'plan.json'), 'utf8'));
  const revised = { ...original, tasks: [task('T1', 'a.txt', 'AC-1', [], { text: 'revised' }), task('T2', 'b.txt', 'AC-1', ['T1'])] };
  writeFileSync(snapshot, JSON.stringify(revised));
  const running = f.start('T1');
  await waitFor(() => f.state().tasks[0].status === 'running');
  f.fail(['update-plan', snapshot], /running/);
  writeFileSync(join(f.root, '.trees/release'), 'release');
  await running.done;
  f.ok('review', 'T1');
  f.ok('update-plan', snapshot);
  assert.equal(f.state().tasks[0].reviewSha, null);
  assert.equal(existsSync(join(f.root, '.trees/T1/a.txt')), true);
  f.fail(['integrate', 'T1'], /review/);
  f.ok('run', 'T1');
  f.ok('review', 'T1');
  f.ok('integrate', 'T1');
  revised.tasks[0].dependsOn = ['T2'];
  writeFileSync(snapshot, JSON.stringify(revised));
  f.fail(['update-plan', snapshot], /Cyclic/);
});

test('acceptance executes a revised combined check after tasks are already integrated', t => {
  const f = fixture(t, [task('T1', 'a.txt', 'AC-1')]);
  f.ok('run', 'T1');
  f.ok('review', 'T1');
  f.ok('integrate', 'T1');
  const revised = JSON.parse(readFileSync(join(f.root, 'plan.json'), 'utf8'));
  revised.combinedCheck = ['node', '-e', 'process.exit(7)'];
  const snapshot = join(f.root, '.fixture-plan.json');
  writeFileSync(snapshot, JSON.stringify(revised));
  f.ok('update-plan', snapshot);
  f.fail(['accept'], /check failed/);
  assert.equal(f.state().acceptedSha, null);
});
