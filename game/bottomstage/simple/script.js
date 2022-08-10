bottomStageInit(
	(function(){
		var img = document.createElement('img'),
		cover = document.createElement('div');
		
		img.classList.add('fill', 'hidden', 'image');
		
		cover.classList.add('fill', 'cover');
		
		bottomStageElement.appendChild(img);
		bottomStageElement.appendChild(cover);
		
		var bsd = bottomStageData;
		
		function du() {
			img.classList.toggle('hidden', !bsd.img);
			if(bsd.img) {img.src = bsd.img;}
		}
		du();
		
		return {
			reset: du,
			dataUpdated: du,
			init: emptyfn,
			finish: emptyfn,
			draw: emptyfn,
			check: emptyfn
		};
	})
);