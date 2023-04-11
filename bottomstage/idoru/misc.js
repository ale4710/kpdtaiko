function _fiScriptInitialize(
	interface,
	selfManager,
	shared,
	niseEvents
) {
	var floor = document.createElement('div');
	floor.classList.add('floor');
	shared.container.appendChild(floor);
	
	niseEvents.finishedLoading.addListener(function() {
		var stageCover = document.createElement('div');
		stageCover.classList.add('cover', 'fill');
		shared.container.appendChild(stageCover);
	});
	
	return Promise.resolve();
}