var _bottomStageAudioVisualizerDrawingFunction = (function(){
	const waveformHeight = 0.8;
	return function(ctx, color){
		let by = ctx.canvas.height / 2;
		let waveform = audioAnalyzer.getWaveform();
		ctx.beginPath();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.strokeStyle = color;
		//ctx.lineWidth = 2;
		for(let i = 0; i < waveform.length; i++) {
			let waveformPart = waveform[i];
			let y = (by + (((waveformPart / 128) - 1) * (waveformHeight * 0.5) * ctx.canvas.height)) | 0;
			if(i === 0) {
				ctx.moveTo(0, y);
			} else {
				ctx.lineTo(
					(i / (waveform.length - 1)) * ctx.canvas.width,
					y
				);
			}
		}
		ctx.stroke();
	};
})();
