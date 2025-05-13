var mediaLoader = (function(){
	var lastPathsLoaded = [],
	loadedMedia = {},
	
	loading = [],
	failed = [];
	
	function rmFromLoading(path) {
		arraySearchAndRemove(
			loading,
			path
		);
	}
	
	var maxAllowedLoaded = 10;
	function loadMediaSuccess(path, blob) {
		loadedMedia[path] = blob;
		rmFromLoading(path);
		
		lastPathsLoaded.push(path);
		while(lastPathsLoaded.length > maxAllowedLoaded) {
			var removed = lastPathsLoaded.shift();
			delete loadedMedia[removed];
			
			console.log('unload', removed);
		}
		
		window.dispatchEvent(new CustomEvent('songmedialoaded'));
	}
	
	function loadMediaError(path) {
		failed.push(path);
		rmFromLoading(path);
	}
	
	function returnIfLoaded(path, source) {
		if(path in loadedMedia) {
			arraySearchAndRemove(
				lastPathsLoaded,
				path
			);
			lastPathsLoaded.push(path);
			return loadedMedia[path];
		}
	}
	
	function getResource(path, source) {
		//console.log(path,source,loading,failed);
		if(failed.indexOf(path) === -1) {
			let existingResource = returnIfLoaded(path, source);
			if(existingResource) {
				return existingResource;
			} else {
				if(loading.indexOf(path) === -1) {
					loading.push(path);
					console.log('loading',path);
					
					switch(source) {
						case 'internal':
							xmlhttprqsc(
								path,
								'blob',
								function(e){
									loadMediaSuccess(
										path,
										e.target.response
									);
								},
								function(e){
									loadMediaError(path);
									console.error(e);
								}
							);
							break;
						case 'user':
							getSongDirFile(path)
							.then(function(file){
								loadMediaSuccess(path, file)
							})
							.catch(function(){
								loadMediaError(path);
							});
							break;
					}
				}
				
				return true;
			}
		} else {
			return false;
		}
	}
	
	return {
		getOnly: returnIfLoaded,
		getAndLoad: getResource
	}
})();