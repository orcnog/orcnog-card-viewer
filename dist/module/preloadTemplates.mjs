import { MODULE_ID } from "./consts.mjs";

export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to all templates...
        `modules/${MODULE_ID}/templates/card-viewer.html`
	];

	return loadTemplates(templatePaths);
}
