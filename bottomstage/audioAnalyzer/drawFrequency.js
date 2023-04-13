var _bottomStageAudioVisualizerDrawingFunction = (function(){
	const barHeight = 0.85;
	return function(ctx, color){
		let frequencies = audioAnalyzer.getFrequencies();
		ctx.beginPath();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.7;
		//draw the top of the shape
		for(let i = 0; i < frequencies.length; i++) {
			let frequency = (frequencies[i] / 255);
			let thisBarHeight = ctx.canvas.height * barHeight * frequency;
			let y = ctx.canvas.height - thisBarHeight;
			
			if(i === 0) {
				ctx.moveTo(0, y);
			} else {
				ctx.lineTo(
					(i / (frequencies.length - 1)) * ctx.canvas.width,
					y
				);
			}
		}
		//from here draw the bottom
		ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
		ctx.lineTo(0, ctx.canvas.height);
		ctx.closePath();
		//draw
		ctx.fill();
	};
})();
