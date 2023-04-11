function _bottomStageInitialize(interface, selfManager) {
	//load stuff
	return addGlobalReference(1, selfManager.basePath + 'style')
	.then(function(){
		//ok style is loaded
		//put in stuff
		let container = document.createElement('div');
		let img = document.createElement('img');
		let cover = document.createElement('div');
		
		container.classList.add('fill', 'center');
		img.classList.add('fill', 'hidden', 'image');
		cover.classList.add('fill', 'cover');
		
		container.appendChild(img);
		container.appendChild(cover);
		eid('bottom-stage').appendChild(container);
		
		let bsd = interface.data;
		function du() {
			img.classList.toggle('hidden', !bsd.img);
			if(bsd.img) {img.src = bsd.img;}
		}
		du();
		interface.reset = du;
		interface.dataUpdated = du;
		
		interface.unload = function(){
			container.remove();
			selfManager.finalizeUnload();
		};
		
		//automatically resolved
	});
};