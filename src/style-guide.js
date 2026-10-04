import fs from "fs";

export function loadStyleGuide() {
  const filePath = process.env.STYLE_GUIDE_FILE;
  if (!filePath) return null;
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  if (!text.trim()) return null;
  return { text };
}

export function styleGuideInstructions(guide) {
  return `The owner of this AnyList has a style guide. Follow it whenever you create, import or edit recipes, ingredients, meal plans or shopping items.\n\n${guide.text}`;
}

export const STYLE_GUIDE_HINT =
  "\n\nStyle guide: before creating or changing anything, read it with the `style_guide` tool and follow it.";
