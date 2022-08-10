var loadMedia = (function(){
	var lastPathsLoaded = [],
	loadedMedia = {},
	
	loading = [],
	failed = [];
	
	var mediaLoaded = (new CustomEvent('songmedialoaded'));
	
	function rmFromLoading(path) {
		arraySearchAndRemove(
			loading,
			path
		);
	}
	
	var maxAllowedLoaded = 16;
	function loadMediaSuccess(path, blob) {
		loadedMedia[path] = blob;
		rmFromLoading(path);
		
		lastPathsLoaded.push(path);
		while(lastPathsLoaded.length > maxAllowedLoaded) {
			var removed = lastPathsLoaded.shift();
			delete loadedMedia[removed];
			
			console.log('unload', removed);
		}
		
		window.dispatchEvent(mediaLoaded);
	}
	
	function loadMediaError(path) {
		failed.push(path);
		rmFromLoading(path);
	}
	
	return function(path, source) {
		//console.log(path,source,loading,failed);
		if(failed.indexOf(path) === -1) {
			if(path in loadedMedia) {
				arraySearchAndRemove(
					lastPathsLoaded,
					path
				);
				lastPathsLoaded.push(path);
				return loadedMedia[path];
			} else {
				if(loading.indexOf(path) === -1) {
					loading.push(path);
					console.log('loading',path);
					
					switch(source) {
						case 'internal':
							xmlhttprqsc(
								'/songs/' + path,
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
							break;
					}
				}
				
				return true;
			}
		} else {
			return false;
		}
	}
})();