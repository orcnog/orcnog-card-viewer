export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/card-viewer/templates"
        'modules/card-viewer/templates/card-viewer.html'
	];

	return loadTemplates(templatePaths);
}
