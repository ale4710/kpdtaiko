var _bottomStageAudioVisualizerDrawingFunction = (function(){
	const barHeight = 0.85;
	
	class MeanManager {
		constructor() {
			this.reset();
		}
		
		add(n) {
			this.sum += n;
			this.total++;
		}
		
		getMean() {
			return this.sum / this.total;
		}
		
		reset() {
			this.sum = 0;
			this.total = 0;
		}
	}
	
	class MovingMeanManager extends MeanManager {
		constructor(samplesToUse = 250) {
			super();
			this.subtracts = new Float32Array(samplesToUse);
			this.pointer = 0;
		}
		
		add(n) {
			//normal
			super.add(n);
			
			//for the "moving mean"
			this.sum -= this.subtracts[this.pointer];
			this.subtracts[this.pointer] = n;
			
			//set pointer
			this.pointer++;
			if(this.pointer === this.subtracts.length) {this.pointer = 0;}
			
			//misc
			this.total = Math.min(this.total, this.subtracts.length);
		}
		
		reset() {
			super.reset();
			this.pointer = 0;
			for(let i = 0; i < this.subtracts.length; i++) {
				this.subtracts[i] = 0;
			}
		}
	}
	
	let highestWithData = 0;
	let volumeMeanManager = new MovingMeanManager(250);
	
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
				let volumeAverage = volumeMeanManager.getMean();
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
		let visibleFrequencyAverage = visibleFrequencySum / (highestWithData + 1);
		volumeMeanManager.add(visibleFrequencyAverage);

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
