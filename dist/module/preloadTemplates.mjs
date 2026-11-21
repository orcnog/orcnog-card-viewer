import { MODULE_ID } from "./consts.mjs";

export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to all templates...
        `modules/${MODULE_ID}/templates/card-viewer.html`
	];

	// Foundry 13 moved loadTemplates into a namespace and warns on the global; older versions only have the global
	const load = foundry.applications?.handlebars?.loadTemplates ?? loadTemplates;
	return load(templatePaths);
}
