var _bottomStageAudioVisualizerDrawingFunction = (function(){
	const barHeight = 0.85;
	
	let highestWithData = 0;
	
	const volumeMaxSampleCount = 250;
	let volumeSampleCount = 0;
	let volumeSampleToSubtract = [];
	let volumeSampleSum = 0;
	
	return function(ctx, color){
		if(audio.paused()) {return}
		
		let frequencies = audioAnalyzer.getFrequencies();
		let visibleFrequencySum = 0; //autogain
		ctx.beginPath();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.7;
		//draw the top of the shape
		for(let i = 0; i < frequencies.length; i++) {
			let frequency = frequencies[i] / 255;
			if(frequency > 0.15) {
				highestWithData = Math.max(highestWithData, i);
			}
			if(i <= highestWithData) {
				visibleFrequencySum += frequency; //for autogain
				let volumeAverage = (volumeSampleSum / Math.min(volumeSampleCount, volumeMaxSampleCount));
				volumeAverage *= 0.7;
				let thisBarHeight = ctx.canvas.height * barHeight * (Math.max(0, (frequency - (volumeAverage))) / (1 - volumeAverage));
				if(isNaN(thisBarHeight)) {thisBarHeight = 0}
				let y = ctx.canvas.height - thisBarHeight;
				if(i === 0) {
					ctx.moveTo(0, y);
				} else {
					ctx.lineTo(
						(i / highestWithData) * ctx.canvas.width,
						y
					);
				}
			}
		}
		
		 //autogain stuff
		volumeSampleCount++;
		let visibleFrequencyAverage = visibleFrequencySum / (highestWithData + 1);
		volumeSampleToSubtract.push(visibleFrequencyAverage);
		if(volumeSampleCount > volumeMaxSampleCount) {volumeSampleSum -= volumeSampleToSubtract.shift()}
		volumeSampleSum += visibleFrequencyAverage;

		if(highestWithData !== 0) {
			//from here draw the bottom
			ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
			ctx.lineTo(0, ctx.canvas.height);
			ctx.closePath();
			//draw
			ctx.fill();
		}
	};
})();
