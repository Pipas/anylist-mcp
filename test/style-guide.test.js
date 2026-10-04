import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadStyleGuide, styleGuideInstructions } from '../src/style-guide.js';

describe('loadStyleGuide', () => {
  let dir;
  const saved = process.env.STYLE_GUIDE_FILE;

  beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'style-')); });
  afterEach(() => {
    if (saved === undefined) delete process.env.STYLE_GUIDE_FILE;
    else process.env.STYLE_GUIDE_FILE = saved;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns null when STYLE_GUIDE_FILE is not set', () => {
    delete process.env.STYLE_GUIDE_FILE;
    assert.equal(loadStyleGuide(), null);
  });

  it('returns null when the file does not exist', () => {
    process.env.STYLE_GUIDE_FILE = path.join(dir, 'missing.md');
    assert.equal(loadStyleGuide(), null);
  });

  it('returns null for an empty file', () => {
    process.env.STYLE_GUIDE_FILE = path.join(dir, 'empty.md');
    fs.writeFileSync(process.env.STYLE_GUIDE_FILE, '  \n');
    assert.equal(loadStyleGuide(), null);
  });

  it('returns the text and re-reads it on every call', () => {
    process.env.STYLE_GUIDE_FILE = path.join(dir, 'guide.md');
    fs.writeFileSync(process.env.STYLE_GUIDE_FILE, '# v1');
    assert.equal(loadStyleGuide().text, '# v1');
    fs.writeFileSync(process.env.STYLE_GUIDE_FILE, '# v2');
    assert.equal(loadStyleGuide().text, '# v2');
  });

  it('builds instructions that include the guide', () => {
    assert.ok(styleGuideInstructions({ text: '# Our rules' }).includes('# Our rules'));
  });

  it('the example guide loads', () => {
    process.env.STYLE_GUIDE_FILE = new URL('../style-guide.example.md', import.meta.url).pathname;
    assert.ok(loadStyleGuide().text.includes('# AnyList style guide'));
  });
});
