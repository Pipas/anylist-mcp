import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { registerAllTools } from '../../src/tools/index.js';
import { MockAnyListClient } from './helpers.js';

function registerWithDescriptions() {
  const handlers = {};
  const descriptions = {};
  const server = {
    registerTool: (name, schema, handler) => {
      handlers[name] = handler;
      descriptions[name] = schema.description;
      return { update: () => {} };
    },
    server: { getClientCapabilities: () => null },
  };
  const client = new MockAnyListClient();
  registerAllTools(server, () => Promise.resolve(client));
  return { handlers, descriptions };
}

describe('style_guide tool', () => {
  let dir;
  const saved = process.env.STYLE_GUIDE_FILE;

  beforeEach(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'style-')); });
  afterEach(() => {
    if (saved === undefined) delete process.env.STYLE_GUIDE_FILE;
    else process.env.STYLE_GUIDE_FILE = saved;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('is not registered and no hints are added without a style guide', () => {
    delete process.env.STYLE_GUIDE_FILE;
    const { handlers, descriptions } = registerWithDescriptions();
    assert.equal(handlers.style_guide, undefined);
    for (const name of ['recipes', 'shopping', 'meal_plan']) {
      assert.ok(!descriptions[name].includes('style_guide'), name);
    }
  });

  it('is registered, returns the guide, and hints the writing tools when configured', async () => {
    process.env.STYLE_GUIDE_FILE = path.join(dir, 'guide.md');
    fs.writeFileSync(process.env.STYLE_GUIDE_FILE, '# Our rules');
    const { handlers, descriptions } = registerWithDescriptions();
    const result = await handlers.style_guide({});
    assert.equal(result.content[0].text, '# Our rules');
    for (const name of ['recipes', 'shopping', 'meal_plan']) {
      assert.ok(descriptions[name].includes('style_guide'), name);
    }
  });

  it('returns an error if the guide is removed after startup', async () => {
    process.env.STYLE_GUIDE_FILE = path.join(dir, 'guide.md');
    fs.writeFileSync(process.env.STYLE_GUIDE_FILE, '# Our rules');
    const { handlers } = registerWithDescriptions();
    fs.rmSync(process.env.STYLE_GUIDE_FILE);
    const result = await handlers.style_guide({});
    assert.equal(result.isError, true);
  });
});
