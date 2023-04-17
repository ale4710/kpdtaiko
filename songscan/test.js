function beginScan(detectedFn){
	var sl,
	cur = 0,
	
	changed = 0,
	nsongs = 0;
	
	xmlhttprqsc('/debugsongs/songlist.json', 'json', function(e){
		sl = e.target.response;
		window.dispatchEvent(new CustomEvent('songlistready'));
	});
	
	return (new Promise(function(resolve){
		function doit() {
			if(cur in sl) {
				let f = '/debugsongs/' + sl[cur];
				let parts = parseFilePath(f);
				xmlhttprqsc(
					f,
					'blob',
					function(e){
						outputProgress(`now scanning ${parts.filename}`);
						fileReaderA(e.target.response, 'arraybuffer').then((fileAB)=>{
							detectedFn(
								e.target.response,
								parts,
								md5(fileAB)
							).then((stats)=>{
								changed += stats.changed;
								nsongs += stats.newFile;
								
								cur++;
								doit();
							});
							
							fileAB = null;
						});
					}
				);
			} else {
				outputProgress(`okay.\r\n${changed} changed\r\n${nsongs} new`);
				doit = null;
				sl = null;
				resolve();
			}
		}
		
		if(sl) {
			doit();
		} else {
			window.addEventListener('songlistready', doit);
		}
	}));
}
