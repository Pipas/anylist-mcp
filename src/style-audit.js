const METRIC_UNIT = "(?:g|kg|ml|L)";
const LEADING_QUANTITY = new RegExp(`^(?:\\d+(?:[.,/]\\d+)?|\\d*[½¼¾⅓⅔])(?:\\s*${METRIC_UNIT}(?![\\p{L}]))?\\s+`, "iu");

function startsUpper(word) {
  const first = word.match(/\p{L}/u);
  return !first || first[0] === first[0].toUpperCase();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findSpellings(text, spellings) {
  return Object.entries(spellings || {})
    .filter(([wrong]) => new RegExp(`(?<![\\p{L}])${escapeRegExp(wrong)}(?![\\p{L}])`, "iu").test(text))
    .map(([wrong, right]) => `spelling "${wrong}" → "${right}"`);
}

export function auditTitle(title, rules = {}) {
  const issues = [];
  if (title !== title.trim()) issues.push("leading/trailing spaces");
  if (/\s{2,}/.test(title)) issues.push("double spaces");

  const lowercaseWords = new Set((rules.titleLowercaseWords || []).map(w => w.toLowerCase()));
  if (lowercaseWords.size > 0) {
    const words = title.replace(/\([^)]*\)/g, " ").trim().split(/\s+/).filter(w => /\p{L}/u.test(w));
    words.forEach((word, idx) => {
      const isSmallWord = lowercaseWords.has(word.toLowerCase());
      if (idx > 0 && isSmallWord && startsUpper(word)) issues.push(`"${word}" should be lowercase`);
      else if ((idx === 0 || !isSmallWord) && !startsUpper(word)) issues.push(`"${word}" should start with a capital`);
    });
  }

  issues.push(...findSpellings(title, rules.spellings));
  return issues;
}

export function auditIngredient(raw, rules = {}) {
  const issues = [];
  if (raw !== raw.trim()) issues.push("leading/trailing spaces");
  const text = raw.trim();
  if (!LEADING_QUANTITY.test(text) && new RegExp(`\\s\\d+(?:[.,]\\d+)?\\s*${METRIC_UNIT}?$`, "iu").test(text)) {
    issues.push("quantity should come first");
  }
  issues.push(...findSpellings(text, rules.spellings));
  return issues;
}

export function auditStep(step, rules = {}) {
  const issues = [];
  if (!step.trim()) issues.push("empty step");
  else if (step !== step.trim()) issues.push("blank lines or spaces at start/end");
  if (/^\s*\d+\.\s/.test(step)) issues.push("numbered by hand");
  issues.push(...findSpellings(step, rules.spellings));
  return issues;
}

export function auditRecipe(recipe, rules = {}) {
  const issues = auditTitle(recipe.name || "", rules).map(i => `Title: ${i}`);
  const seen = new Set();
  for (const ing of recipe.ingredients || []) {
    const raw = ing.rawIngredient || [ing.quantity, ing.name].filter(Boolean).join(" ");
    for (const i of auditIngredient(raw, rules)) issues.push(`Ingredient "${raw.trim()}": ${i}`);
    const key = raw.trim().toLowerCase();
    if (seen.has(key)) issues.push(`Ingredient "${raw.trim()}": listed twice`);
    seen.add(key);
  }
  (recipe.preparationSteps || []).forEach((step, idx) => {
    for (const i of auditStep(step, rules)) issues.push(`Step ${idx + 1}: ${i}`);
  });
  return issues;
}
