firstLoad((function(){
	return function(path){
		return (new Promise((resolve, reject)=>{
			xmlhttprqsc(
				'/songs/' + path,
				'blob',
				(e)=>{
					if(e.target.response) {
						resolve(e.target.response);
					} else {
						reject();
					}
				},
				(err)=>{
					reject();
				}
			);
		}));
	}
	
})());