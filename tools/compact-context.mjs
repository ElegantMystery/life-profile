import { join } from 'node:path';
import { privateInstance, readPrivateFile, stop } from './setup-storage.mjs';

const supportedDomains = new Set(['preferences', 'learning-skills', 'goals-projects']);
const heading = '## Quick context';

function quickExcerpt(markdown) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.indexOf(heading);
  // Read only a dedicated first section. A matching heading in notes or a sample
  // is ambiguous. Returning the path lets the caller inspect the primary note.
  if (start < 1 || !/^# \S/.test(lines[0]) ||
      lines.slice(1, start).some(line => line.trim()) || lines.lastIndexOf(heading) !== start) {
    return null;
  }

  const body = [];
  for (let index = start + 1; index < lines.length; index++) {
    if (/^#{1,2}\s/.test(lines[index])) break;
    body.push(lines[index]);
  }

  const text = body.join('\n').replace(/^\n+|\n+$/g, '');
  if (text.length > 600) return null;
  const entries = text.split('\n').filter(line => line !== '');
  const source = entries.pop() ?? '';
  if (!/^Source: \S/.test(source) || entries.length < 1 || entries.length > 3 ||
      !entries.every(line => /^- \S/.test(line))) return null;
  return text;
}

export function compactContext(dest, selection) {
  const domains = selection?.split(',') ?? [];
  if (!domains.length || new Set(domains).size !== domains.length ||
      domains.some(domain => !supportedDomains.has(domain))) stop('INVALID_DOMAINS');
  const root = privateInstance(dest);
  const notebooks = domains.map(domain => {
    const path = 'domains/' + domain + '.md';
    return {path, excerpt: quickExcerpt(readPrivateFile(join(root, path)))};
  });
  return {derived: true, notebooks};
}
