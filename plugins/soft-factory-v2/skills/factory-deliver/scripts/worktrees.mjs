import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync,
  rmdirSync, openSync, closeSync, lstatSync, readdirSync } from 'node:fs';
import { resolve, join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const plugin = fileURLToPath(new URL('../../../', import.meta.url));
const [command, ...args] = process.argv.slice(2);
const ensure = (condition, message) => { if (!condition) throw new Error(message); };
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const run = (program, argv, cwd) => {
  const result = spawnSync(program, argv, { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  ensure(result.status === 0, `${program} check failed: ${result.error?.message || result.stderr || result.stdout}`);
  return result.stdout.trim();
};
const root = run('git', ['rev-parse', '--show-toplevel'], process.cwd());
const trees = join(root, '.trees');
const stateFile = join(trees, 'state.json');
const lock = join(trees, 'ledger.lock');
const archived = Symbol('archived');
const git = (argv, cwd = root) => run('git', argv, cwd);
const head = (cwd = root) => git(['rev-parse', 'HEAD'], cwd);
const clean = cwd => ensure(!git(['status', '--porcelain'], cwd), `Checkout must be clean: ${cwd}`);
const alive = pid => {
  if (!Number.isInteger(pid) || pid < 1) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
};
const groupAlive = pid => {
  if (!Number.isInteger(pid) || pid < 1) return false;
  try { process.kill(-pid, 0); } catch (e) { return e.code === 'EPERM'; }
  // Reparented zombies cannot execute work and must not permanently block recovery.
  for (const entry of readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    try {
      const stat = readFileSync(`/proc/${entry}/stat`, 'utf8');
      const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
      if (Number(fields[2]) === pid && fields[0] !== 'Z') return true;
    } catch (e) { if (!['ENOENT', 'ESRCH', 'EACCES'].includes(e.code)) throw e; }
  }
  return false;
};
const signalGroup = (pid, signal) => {
  if (!pid) return;
  try { process.kill(-pid, signal); } catch (e) { if (e.code !== 'ESRCH') throw e; }
};
const waitGroup = async (pid, milliseconds) => {
  const until = Date.now() + milliseconds;
  while (groupAlive(pid) && Date.now() < until) await new Promise(r => setTimeout(r, 25));
};
const live = job => alive(job?.runnerPid) || alive(job?.childPid) || groupAlive(job?.groupPid);
const active = task => ['running', 'reviewing', 'stopping'].includes(task.status);
const safePath = path => typeof path === 'string' && path && !isAbsolute(path)
  && !path.split('/').some(part => ['.', '..', '.git', '.trees', ''].includes(part)) && !path.includes('\\');
const scopePath = path => typeof path === 'string' && safePath(path.endsWith('/') ? path.slice(0, -1) : path);
const within = (file, path) => path.endsWith('/') ? file.startsWith(path) : file === path;
const overlap = (a, b) => a === b || (a.endsWith('/') && b.startsWith(a)) || (b.endsWith('/') && a.startsWith(b));
const taskById = (state, id) => {
  const task = state.tasks.find(t => t.id === id);
  ensure(task, `Unknown task: ${id}`);
  return task;
};
const atomic = (path, value) => {
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  renameSync(temporary, path);
};

function locked(action) {
  let obtained = false;
  for (let i = 0; i < 500; i++) {
    try { mkdirSync(lock); obtained = true; break; } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
    }
  }
  ensure(obtained, 'Ledger is locked; inspect status and use recover-lock only after its owner is dead');
  writeFileSync(join(lock, 'owner.json'), JSON.stringify({ pid: process.pid }));
  try {
    const state = existsSync(stateFile) ? json(stateFile) : null;
    if (state) {
      ensure(state.owner === process.env.FACTORY_LEAD_ID, 'Another lead owns this delivery; inspect and explicitly handoff');
      ensure(state.root === root, 'Delivery root changed');
    }
    const result = action(state);
    if (state && result !== archived) atomic(stateFile, state);
    return result;
  } finally {
    unlinkSync(join(lock, 'owner.json'));
    rmdirSync(lock);
  }
}

function validateReport(report, sha, acs, review) {
  ensure(report.sha === sha, 'Report SHA does not match the actual implementation commit');
  ensure(Array.isArray(report.checks) && report.checks.length, 'Report must include observed checks');
  ensure(report.checks.every(c => typeof c.command === 'string' && c.command && Number.isInteger(c.exitCode)
    && typeof c.summary === 'string' && c.summary), 'Invalid check evidence');
  ensure(Array.isArray(report.acEvidence), 'Missing AC evidence');
  const evidence = new Map(report.acEvidence.map(e => [e.id, e]));
  ensure(evidence.size === report.acEvidence.length, 'Duplicate AC evidence');
  ensure(acs.every(id => evidence.has(id)), 'Missing task AC evidence');
  ensure(report.acEvidence.every(e => ['met', 'unmet', 'blocked'].includes(e.status)
    && typeof e.evidence === 'string' && e.evidence), 'Invalid AC evidence');
  if (review) {
    ensure(['pass', 'fail'].includes(report.verdict) && Array.isArray(report.findings), 'Invalid review verdict/findings');
    ensure(report.findings.every(f => typeof f.id === 'string' && f.id
      && ['blocker', 'major', 'minor'].includes(f.severity) && typeof f.location === 'string'
      && typeof f.finding === 'string' && typeof f.suggestion === 'string'
      && ['design', 'implementation'].includes(f.owner)), 'Invalid review finding');
    ensure(report.verdict === 'pass', 'Independent review failed/rejected');
    ensure(!report.findings.some(f => ['blocker', 'major'].includes(f.severity)), 'Review has unresolved major findings');
  } else {
    ensure(Array.isArray(report.decisions) && !report.decisions.length, 'Unresolved decisions require lead alignment');
  }
  ensure(report.checks.every(c => c.exitCode === 0), 'Reported checks did not pass');
  ensure(acs.every(id => evidence.get(id).status === 'met'), 'AC is unmet or blocked');
}

function taskHead(task) {
  ensure(existsSync(task.worktree) && !lstatSync(task.worktree).isSymbolicLink(), 'Task worktree missing or replaced');
  clean(task.worktree);
  const sha = head(task.worktree);
  ensure(git(['branch', '--show-current'], task.worktree) === task.branch
    && git(['rev-parse', task.branch]) === sha, 'Task branch/head changed');
  git(['merge-base', '--is-ancestor', task.baseSha, sha], task.worktree);
  const files = git(['diff', '--name-only', '--no-renames', task.baseSha, sha], task.worktree).split('\n').filter(Boolean);
  ensure(files.length, 'Task must commit an implementation change');
  ensure(files.every(file => task.paths.some(path => within(file, path))), 'Committed changes exceed task write scope');
  return sha;
}

function integrationReady(state) {
  ensure(git(['branch', '--show-current']) === state.branch, 'Integration branch changed');
  clean(root);
  ensure(!state.integrationBlocked && !state.integrationJob && !state.finalJob, 'Integration is blocked or busy');
  ensure(head() === state.integrationSha, 'Integration head changed; independently review a repair before proceeding');
}

async function copilot(context, updatePid) {
  ensure(process.platform === 'linux', 'Worktree workers require the existing Linux devcontainer');
  const contextPath = join(trees, 'results', `${context.label}-context.json`);
  const logPath = join(trees, 'results', `${context.label}.log`);
  atomic(contextPath, context);
  if (existsSync(context.output)) unlinkSync(context.output);
  const skill = context.mode === 'implement' ? 'factory-deliver' : 'factory-accept';
  const prompt = `Use the skill soft-factory-v2:${skill}. Read ${contextPath} for your assigned context. `
    + (context.mode === 'implement'
      ? 'You are an implementer, not the lead. Use observed TDD for suitable behaviour, obey scope, update affected docs, run checks and commit. Do not launch workers, merge, push or release. Escalate consequential decisions in your report. '
      : 'You are an independent reviewer. Inspect the exact diff, design and standards; reproduce decisive evidence. Do not repair application code, commit, dispatch, merge, push or release. Write only the assigned report. ')
    + `Read the canonical brief ${context.brief}. Write the required JSON report to ${context.output}. `
    + 'Do not modify the execution ledger or other worktrees. Do not daemonise/detach subprocesses or leave services running when you finish. '
    + 'These paths are local; do not send their content to external services.';
  const fd = openSync(logPath, 'w');
  const child = spawn(process.env.FACTORY_COPILOT || 'copilot', ['--plugin-dir', plugin, '--yolo', '-p', prompt], {
    cwd: context.cwd, env: { ...process.env, FACTORY_CONTEXT: contextPath }, stdio: ['ignore', fd, fd],
    // A private process group is still awaited by this foreground helper; it is not a daemon.
    detached: true,
  });
  closeSync(fd);
  let interrupted = false;
  let forceStop;
  const stop = () => {
    if (interrupted) return;
    interrupted = true;
    signalGroup(child.pid, 'SIGTERM');
    forceStop = setTimeout(() => signalGroup(child.pid, 'SIGKILL'), 1000);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  try {
    await new Promise((res, rej) => {
      child.once('error', rej);
      child.once('close', (code, signal) => code === 0 && !interrupted ? res()
        : rej(new Error(`Worker exited ${code ?? signal}; preserve work and inspect ${logPath}`)));
      if (child.pid) updatePid(child.pid);
    });
  } finally {
    if (interrupted) {
      await waitGroup(child.pid, 2000);
      if (groupAlive(child.pid)) {
        signalGroup(child.pid, 'SIGKILL');
        await waitGroup(child.pid, 1000);
      }
    }
    clearTimeout(forceStop);
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
  }
  ensure(!groupAlive(child.pid), 'Worker descendants remain live; preserve the dispatch gate until they stop');
  ensure(existsSync(context.output), 'Worker exited without an evidence report');
  return json(context.output);
}

async function worker(id, review) {
  let context;
  locked(state => {
    integrationReady(state);
    const task = taskById(state, id);
    ensure(!active(task) && !live(task) && task.status !== 'integrated', 'Task already running or integrated');
    ensure(task.dependsOn.every(dep => taskById(state, dep).status === 'integrated'), 'Task prerequisite is not integrated');
    if (!review) {
      ensure(state.tasks.filter(t => t.status === 'running').length < 2, 'Capacity is two implementers');
      ensure(!state.tasks.some(t => active(t) && t.paths.some(a => task.paths.some(b => overlap(a, b)))), 'Task scope overlaps an active worker');
      if (!task.worktree) {
        task.baseSha = state.integrationSha;
        task.worktree = join(trees, task.id);
        task.branch = `factory/${state.issue}/${task.id}`;
        ensure(!existsSync(task.worktree), 'Worktree path already exists; inspect instead of replacing it');
        git(['worktree', 'add', '-b', task.branch, task.worktree, task.baseSha]);
      }
      clean(task.worktree);
    } else {
      ensure(['implemented', 'reviewed'].includes(task.status), 'Task requires a committed implementation before review');
      task.sha = taskHead(task);
    }
    task.status = review ? 'reviewing' : 'running';
    task.runnerPid = process.pid;
    task.childPid = null;
    task.groupPid = null;
    task.reviewSha = null;
    state.acceptedSha = null;
    context = { mode: review ? 'task' : 'implement', label: `${id}-${review ? 'review' : 'implementation'}`,
      root, cwd: task.worktree, brief: state.brief, task: { ...task }, acs: task.acs,
      baseSha: task.baseSha, expectedSha: review ? task.sha : null,
      output: join(trees, 'results', `${id}-${review ? 'review' : 'implementation'}.json`) };
  });
  try {
    const report = await copilot(context, pid => locked(s => {
      taskById(s, id).childPid = pid;
      taskById(s, id).groupPid = pid;
    }));
    locked(state => {
      const task = taskById(state, id);
      const sha = taskHead(task);
      if (review) ensure(sha === context.expectedSha, 'Reviewed task head changed during review');
      validateReport(report, sha, task.acs, review);
      task.sha = sha;
      task.status = review ? 'reviewed' : 'implemented';
      task.reviewSha = review ? sha : null;
      task.runnerPid = null;
      task.childPid = null;
      task.groupPid = null;
      task.lastError = null;
    });
  } catch (error) {
    locked(state => {
      const task = taskById(state, id);
      const outstanding = groupAlive(task.groupPid);
      task.status = outstanding ? 'stopping' : (review ? 'implemented' : 'blocked');
      task.reviewSha = null;
      task.runnerPid = null;
      if (!outstanding) {
        task.childPid = null;
        task.groupPid = null;
      }
      task.lastError = error.message;
    });
    throw error;
  }
}

async function reviewIntegration(repair) {
  let context;
  locked(state => {
    ensure(git(['branch', '--show-current']) === state.branch, 'Integration branch changed');
    clean(root);
    ensure(!state.integrationJob && !state.finalJob, 'Integration review already running');
    if (!repair) {
      integrationReady(state);
      ensure(state.tasks.every(t => t.status === 'integrated'), 'All tasks must be integrated before final acceptance');
    }
    state.finalJob = { runnerPid: process.pid, childPid: null, groupPid: null };
    state.acceptedSha = null;
    context = { mode: repair ? 'repair' : 'final', label: repair ? 'repair' : 'final', root, cwd: root,
      brief: state.brief, acs: repair ? [...new Set(state.tasks.filter(t => t.status === 'integrated'
        || t.id === state.failedTask).flatMap(t => t.acs))] : state.acs,
      baseSha: repair ? state.integrationSha : state.baseSha,
      combinedCheck: state.combinedCheck,
      expectedSha: head(), output: join(trees, 'results', `${repair ? 'repair' : 'final'}-review.json`) };
  });
  try {
    const report = await copilot(context, pid => locked(s => {
      s.finalJob.childPid = pid;
      s.finalJob.groupPid = pid;
    }));
    const state = json(stateFile);
    run(state.combinedCheck[0], state.combinedCheck.slice(1), root);
    if (!repair && JSON.stringify(state.combinedCheck) !== JSON.stringify(['just', 'verify'])) {
      run('just', ['verify'], root);
    }
    locked(s => {
      clean(root);
      ensure(head() === context.expectedSha, 'Integration SHA changed during acceptance');
      validateReport(report, context.expectedSha, context.acs, true);
      if (repair) {
        if (s.failedTask) {
          const task = taskById(s, s.failedTask);
          ensure(task.reviewSha && git(['merge-base', '--is-ancestor', task.reviewSha, context.expectedSha]) === '',
            'Repair must retain the reviewed task commit');
          task.status = 'integrated';
          task.integratedSha = context.expectedSha;
        }
        s.integrationSha = context.expectedSha;
        s.integrationBlocked = false;
        s.failedTask = null;
      } else s.acceptedSha = context.expectedSha;
      s.finalJob = null;
    });
  } catch (error) {
    locked(s => {
      if (groupAlive(s.finalJob?.groupPid)) s.finalJob.runnerPid = null;
      else s.finalJob = null;
      s.acceptedSha = null;
    });
    throw error;
  }
}

function validatePlan(plan, brief) {
  ensure(Array.isArray(plan.tasks) && plan.tasks.length, 'Plan requires tasks');
  ensure(Array.isArray(plan.combinedCheck) && plan.combinedCheck.length
    && plan.combinedCheck.every(a => typeof a === 'string' && a), 'Plan requires a validation command argv');
  const ids = new Set(plan.tasks.map(t => t.id));
  ensure(ids.size === plan.tasks.length, 'Duplicate task IDs');
  for (const task of plan.tasks) {
    ensure(/^T[1-9]\d*$/.test(task.id), 'Task IDs must be T1, T2, etc.');
    ensure(Array.isArray(task.paths) && task.paths.length && task.paths.every(scopePath), 'Invalid task write scope');
    ensure(Array.isArray(task.acs) && task.acs.length && task.acs.every(id => /^AC-[1-9]\d*$/.test(id)), 'Invalid task ACs');
    ensure(Array.isArray(task.dependsOn) && task.dependsOn.every(dep => ids.has(dep)), 'Unknown prerequisite');
    ensure(typeof task.instructions === 'string' && task.instructions, 'Task instructions required');
  }
  const visited = new Set();
  const visit = (id, stack = new Set()) => {
    ensure(!stack.has(id), 'Cyclic task prerequisites');
    if (visited.has(id)) return;
    const next = new Set(stack).add(id);
    plan.tasks.find(t => t.id === id).dependsOn.forEach(dep => visit(dep, next));
    visited.add(id);
  };
  ids.forEach(id => visit(id));
  const acs = [...new Set(plan.tasks.flatMap(t => t.acs))];
  const briefAcs = new Set(readFileSync(brief, 'utf8').match(/\bAC-[1-9]\d*\b/g) || []);
  ensure(acs.length === briefAcs.size && acs.every(id => briefAcs.has(id)), 'Task AC coverage does not match the agreed brief');
  return acs;
}

function init() {
  const [issue, briefPath, planPath] = args;
  ensure(/^\d+$/.test(issue || ''), 'Supply a numeric issue');
  ensure(process.env.FACTORY_LEAD_ID, 'Set a unique FACTORY_LEAD_ID for this delivery');
  ensure(safePath(briefPath || ''), 'Brief must be a repository-relative file');
  const brief = resolve(root, briefPath);
  const plan = json(resolve(planPath));
  const acs = validatePlan(plan, brief);
  const branch = git(['branch', '--show-current']);
  ensure(branch && !['main', 'master'].includes(branch), 'Initialise on an explicit feature integration branch');
  ensure(!existsSync(trees) || !lstatSync(trees).isSymbolicLink(), '.trees must not be a symlink');
  mkdirSync(trees, { recursive: true });
  const exclude = git(['rev-parse', '--git-path', 'info/exclude']);
  const excludePath = resolve(root, exclude);
  mkdirSync(dirname(excludePath), { recursive: true });
  const original = existsSync(excludePath) ? readFileSync(excludePath, 'utf8') : '';
  if (!original.split('\n').includes('/.trees/')) writeFileSync(excludePath, original + '\n/.trees/\n');
  clean(root);
  locked(state => {
    ensure(!state, 'Delivery already initialised; resume instead of replacing state');
    mkdirSync(join(trees, 'results'), { recursive: true });
    const sha = head();
    atomic(stateFile, { version: 1, root, issue, branch, owner: process.env.FACTORY_LEAD_ID,
      brief, baseSha: sha, integrationSha: sha, integrationBlocked: false,
      acceptedSha: null, combinedCheck: plan.combinedCheck, acs,
      pluginVersion: json(join(plugin, 'plugin.json')).version,
      helperDigest: createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex'),
      tasks: plan.tasks.map(t => ({ id: t.id, paths: t.paths, acs: t.acs,
        dependsOn: t.dependsOn, instructions: t.instructions, status: 'pending' })) });
  });
}

function integrate(id) {
  let task;
  locked(state => {
    integrationReady(state);
    task = taskById(state, id);
    ensure(task.status === 'reviewed' && task.reviewSha, 'Task needs passing independent review');
    ensure(taskHead(task) === task.reviewSha, 'Task head SHA changed after review');
    state.integrationJob = { runnerPid: process.pid, id };
    state.integrationBlocked = true;
    state.acceptedSha = null;
    state.failedTask = id;
  });
  try {
    git(['merge', '--no-ff', '--no-edit', task.reviewSha, '-m', `chore: integrate ${id}`]);
    const mergedSha = head();
    const state = json(stateFile);
    run(state.combinedCheck[0], state.combinedCheck.slice(1), root);
    clean(root);
    locked(s => {
      ensure(head() === mergedSha && git(['branch', '--show-current']) === s.branch,
        'Integration head changed while checks ran');
      const current = taskById(s, id);
      current.status = 'integrated';
      current.integratedSha = head();
      s.integrationSha = head();
      s.integrationBlocked = false;
      s.integrationJob = null;
      s.failedTask = null;
    });
  } catch (error) {
    locked(s => { s.integrationJob = null; });
    throw error;
  }
}

async function main() {
  if (command === 'init') return init();
  ensure(existsSync(stateFile), 'No delivery state; initialise an agreed plan first');
  ensure(!lstatSync(trees).isSymbolicLink(), '.trees was replaced');
  if (command === 'status') {
    const state = json(stateFile);
    console.log(JSON.stringify({ ...state, currentSha: head(),
      accepted: state.acceptedSha === head() && !state.integrationBlocked && !git(['status', '--porcelain']),
      liveTasks: state.tasks.filter(t => active(t) && live(t)).map(t => t.id) }, null, 2));
    return;
  }
  if (command === 'recover-lock') {
    const ownerFile = join(lock, 'owner.json');
    ensure(existsSync(ownerFile) && !alive(json(ownerFile).pid), 'Ledger lock owner is live or unknown');
    ensure(json(stateFile).owner === process.env.FACTORY_LEAD_ID, 'Another lead owns this delivery');
    unlinkSync(ownerFile);
    rmdirSync(lock);
    return;
  }
  if (command === 'run') return worker(args[0], false);
  if (command === 'review') return worker(args[0], true);
  if (command === 'integrate') return integrate(args[0]);
  if (command === 'repair') return reviewIntegration(true);
  if (command === 'accept') return reviewIntegration(false);
  if (command === 'update-plan') return locked(state => {
    integrationReady(state);
    ensure(!state.tasks.some(active), 'Pause or recover running workers before revising the plan');
    const plan = json(resolve(args[0]));
    const acs = validatePlan(plan, state.brief);
    ensure(state.tasks.every(old => plan.tasks.some(t => t.id === old.id)), 'Do not silently drop existing task history');
    const definition = task => ({ id: task.id, paths: task.paths, acs: task.acs,
      dependsOn: task.dependsOn, instructions: task.instructions });
    state.tasks = plan.tasks.map(next => {
      const old = state.tasks.find(t => t.id === next.id);
      if (!old) return { ...definition(next), status: 'pending' };
      if (JSON.stringify(definition(old)) === JSON.stringify(definition(next))) return old;
      ensure(old.status !== 'integrated', 'Cannot revise an integrated task; add an explicit correction task');
      return { ...old, ...definition(next), status: old.worktree ? 'blocked' : 'pending', reviewSha: null };
    });
    state.acs = acs;
    state.combinedCheck = plan.combinedCheck;
    state.acceptedSha = null;
  });
  if (command === 'handoff') return locked(state => {
    ensure(args[0], 'Supply the explicitly agreed new lead ID');
    ensure(!state.tasks.some(t => active(t) && live(t)) && !live(state.finalJob) && !live(state.integrationJob), 'A worker/integration process is still live/running');
    state.owner = args[0];
  });
  if (command === 'recover') return locked(state => {
    const task = taskById(state, args[0]);
    ensure(active(task), 'Task is not interrupted/running');
    ensure(!live(task), 'Worker process is still live/running; do not duplicate it');
    task.status = 'blocked';
    task.reviewSha = null;
    task.runnerPid = null;
    task.childPid = null;
    task.groupPid = null;
    task.lastError = 'Interrupted; inspect preserved work before retry';
  });
  if (command === 'recover-integration') return locked(state => {
    ensure(!live(state.integrationJob) && !live(state.finalJob), 'Integration/review process still live');
    state.integrationJob = null;
    state.finalJob = null;
    state.integrationBlocked = true;
    state.acceptedSha = null;
  });
  if (command === 'cleanup') return locked(state => {
    const task = taskById(state, args[0]);
    ensure(task.status === 'integrated', 'Only integrated worktrees can be cleaned up');
    ensure(task.worktree === join(trees, task.id), 'Unexpected worktree path');
    clean(task.worktree);
    ensure(head(task.worktree) === task.reviewSha, 'Worktree has later unintegrated commits; preserve it');
    git(['worktree', 'remove', task.worktree]);
    task.cleaned = true;
  });
  if (command === 'archive') return locked(state => {
    ensure(state.acceptedSha && state.tasks.every(t => t.status === 'integrated' && t.cleaned),
      'Archive requires accepted delivery and cleaned integrated worktrees');
    ensure(git(['branch', '--show-current']) === state.branch, 'Archive from the original integration checkout');
    ensure(!live(state.finalJob) && !live(state.integrationJob), 'Delivery has live processes');
    clean(root);
    git(['merge-base', '--is-ancestor', state.acceptedSha, head()]);
    const laterFiles = git(['diff', '--name-only', state.acceptedSha, 'HEAD']).split('\n').filter(Boolean);
    ensure(laterFiles.every(file => resolve(root, file) === state.brief),
      'Application changes after acceptance require renewed review');
    const destination = join(trees, 'history', `${state.issue}-${state.acceptedSha.slice(0, 12)}`);
    ensure(!existsSync(destination), 'Archive already exists; preserve it');
    mkdirSync(destination, { recursive: true });
    renameSync(join(trees, 'results'), join(destination, 'results'));
    renameSync(stateFile, join(destination, 'state.json'));
    return archived;
  });
  throw new Error('Commands: init, status, run, review, integrate, repair, accept, update-plan, recover, recover-integration, recover-lock, handoff, cleanup, archive');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
