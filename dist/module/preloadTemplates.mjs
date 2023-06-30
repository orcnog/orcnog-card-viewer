export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/orcnog-card-viewer/templates"
        'modules/orcnog-card-viewer/templates/orcnog-card-viewer.html'
	];

	return loadTemplates(templatePaths);
}
