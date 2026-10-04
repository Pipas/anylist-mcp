import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditTitle, auditIngredient, auditStep, auditRecipe } from '../src/style-audit.js';
import { parseRules } from '../src/style-guide.js';

const rules = parseRules(fs.readFileSync(new URL('../style-guide.example.md', import.meta.url), 'utf8'));

describe('parseRules', () => {
  it('reads the JSON block from the example guide', () => {
    assert.ok(rules.titleLowercaseWords.includes('with'));
    assert.equal(rules.spellings['cherry tomatos'], 'cherry tomatoes');
  });

  it('returns {} without a block or with invalid JSON', () => {
    assert.deepEqual(parseRules('# Guide'), {});
    assert.deepEqual(parseRules('```json\n{ nope\n```'), {});
  });
});

describe('auditTitle', () => {
  for (const title of ['Pasta with Garlic', 'The Best Chili', 'Chili (see notes)', 'Pad Thai 🍜']) {
    it(`accepts "${title}"`, () => assert.deepEqual(auditTitle(title, rules), []));
  }

  it('flags capitalised small words and lowercase main words', () => {
    assert.deepEqual(auditTitle('Pasta With garlic', rules), ['"With" should be lowercase', '"garlic" should start with a capital']);
  });

  it('flags spaces and spellings', () => {
    const issues = auditTitle(' Cherry Tomatos Salad', rules);
    assert.ok(issues.includes('leading/trailing spaces'));
    assert.ok(issues.some(i => i.includes('"cherry tomatos" → "cherry tomatoes"')));
  });

  it('skips capitalisation checks when no small words are configured', () => {
    assert.deepEqual(auditTitle('pasta With garlic', {}), []);
  });
});

describe('auditIngredient', () => {
  for (const raw of ['200g Cherry tomatoes', '2 Garlic cloves', '½ Lemon', 'Salt']) {
    it(`accepts "${raw}"`, () => assert.deepEqual(auditIngredient(raw, rules), []));
  }

  it('flags a quantity after the name', () => {
    assert.ok(auditIngredient('Flour 143g', rules).includes('quantity should come first'));
  });

  it('flags trailing spaces', () => {
    assert.ok(auditIngredient('Olives ', rules).includes('leading/trailing spaces'));
  });
});

describe('auditStep', () => {
  it('flags blank lines, empty steps and hand numbering', () => {
    assert.ok(auditStep('\n\nChop the onion.', rules).includes('blank lines or spaces at start/end'));
    assert.ok(auditStep('  ', rules).includes('empty step'));
    assert.ok(auditStep('1. Chop the onion.', rules).includes('numbered by hand'));
    assert.deepEqual(auditStep('Chop the onion.', rules), []);
  });
});

describe('auditRecipe', () => {
  it('prefixes issues with where they are and flags duplicates', () => {
    const issues = auditRecipe({
      name: 'Pasta With Garlic',
      ingredients: [{ rawIngredient: '10g Salt' }, { rawIngredient: '10g salt' }],
      preparationSteps: ['1. Boil'],
    }, rules);
    assert.deepEqual(issues, [
      'Title: "With" should be lowercase',
      'Ingredient "10g salt": listed twice',
      'Step 1: numbered by hand',
    ]);
  });

  it('returns no issues for a clean recipe', () => {
    assert.deepEqual(auditRecipe({ name: 'Pasta with Garlic', ingredients: [{ quantity: '2', name: 'Garlic cloves' }], preparationSteps: ['Boil.'] }, rules), []);
  });
});
