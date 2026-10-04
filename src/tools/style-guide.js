import { textResponse, errorResponse } from "./helpers.js";
import { loadStyleGuide } from "../style-guide.js";

export function register(server) {
  server.registerTool("style_guide", {
    title: "Style Guide",
    description: "Read the style guide: how recipe titles, ingredients, steps and shopping items should be written in this AnyList. Read it before creating, importing or editing anything.",
    inputSchema: {},
  }, async () => {
    try {
      const guide = loadStyleGuide();
      if (!guide) return errorResponse("No style guide is configured on this server.");
      return textResponse(guide.text);
    } catch (error) {
      return errorResponse(`Failed to read style guide: ${error.message}`);
    }
  });
}
