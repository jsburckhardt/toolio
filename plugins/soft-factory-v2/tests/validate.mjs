import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const text = path => readFileSync(path, 'utf8');
const json = path => JSON.parse(text(path));
const marketplace = json(join(root, '.github/plugin/marketplace.json'));
const names = new Set();
for (const entry of marketplace.plugins) {
  assert.ok(!names.has(entry.name), `Duplicate plugin: ${entry.name}`);
  names.add(entry.name);
  const base = join(root, entry.source);
  const manifest = json(join(base, 'plugin.json'));
  assert.equal(manifest.name, entry.name);
  assert.equal(manifest.version, entry.version);
  assert.ok(manifest.description && manifest.author?.name);
  assert.ok(text(join(root, 'README.md')).includes(`| \`${entry.name}\` |`), `Missing README plugin: ${entry.name}`);
  for (const kind of ['skills', 'agents', 'commands', 'rules']) {
    for (const path of manifest[kind] || []) assert.ok(existsSync(resolve(base, path)), `Missing ${kind}: ${path}`);
  }
  if (typeof manifest.mcpServers === 'string') json(resolve(base, manifest.mcpServers));
}

const plugin = join(root, 'plugins/soft-factory-v2');
const manifest = json(join(plugin, 'plugin.json'));
const skillNames = new Set();
for (const path of manifest.skills) {
  const base = resolve(plugin, path);
  const entry = text(join(base, 'SKILL.md'));
  const name = entry.match(/^name: ([a-z0-9-]+)$/m)?.[1];
  assert.equal(name, base.split('/').at(-1));
  assert.ok(!skillNames.has(name), `Duplicate skill: ${name}`);
  skillNames.add(name);
  assert.match(entry, /^---\n[\s\S]*?\n---\n/);
  assert.match(entry, /^description: ".+"$/m);
  assert.match(entry, /^# .+\n[\s\S]+## References\n[\s\S]+## Skill layout\n/m);
}

function checkLinks(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) checkLinks(path);
    else if (item.name.endsWith('.md')) {
      const content = text(path);
      assert.ok(!content.includes('\t'), `Tabs in ${path}`);
      assert.ok(!/[\u2018\u2019\u201c\u201d]/.test(content), `Smart quotes in ${path}`);
      for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
        const target = match[1].split('#')[0];
        if (target && !/^[a-z]+:/.test(target)) assert.ok(existsSync(resolve(dirname(path), target)), `Broken link in ${path}: ${target}`);
      }
      for (const match of content.matchAll(/soft-factory-v2:(factory-[a-z-]+)/g)) {
        assert.ok(skillNames.has(match[1]), `Unknown qualified skill: ${match[1]}`);
      }
    }
  }
}
checkLinks(plugin);
console.log('Marketplace, v2 skill contracts and local links are valid.');
