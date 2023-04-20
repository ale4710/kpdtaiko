var createTimeGraph = (function(){
	var cv;
	var ctx;
	
	return function(
		barWidth = 1,
		barSpacing = 0,
		w = 200,
		h = 70,
		color = '#fff',
		timeData = hitDataMs
	) {
		//initialize canvas
		if(!cv) {
			cv = document.createElement('canvas'),
			ctx = cv.getContext('2d');
		}
		
		cv.width = w;
		cv.height = h;
		
		ctx.clearRect(
			0, 0,
			w, h
		);
		
		//collect data
		//get the number of "bins"
		let binCount = Math.floor(w / (barWidth + barSpacing));
		if(binCount === 0) {throw Error('something went wrong when calculating the binCount');}
		//amount of time to be sampled
		let timingSampleSize = (hitWindow.miss * 2) / binCount;
		//fill histogram array with 0
		let histogram = [];
		while(histogram.length !== binCount) {histogram.push(0);}
		//now count
		let max = 0;
		hitDataMs.forEach((ms)=>{
			//determine bin
			let bin = Math.floor((ms + hitWindow.miss) / timingSampleSize);
			//put it in
			if(bin in histogram) {
				histogram[bin]++;
				max = Math.max(max, histogram[bin]);
			}
		});
		
		//draw
		ctx.fillStyle = color;
		histogram.forEach((count, index)=>{
			let barHeight = (count / max) * h;
			ctx.fillRect(
				(barWidth + barSpacing) * index,
				h - barHeight,
				barWidth,
				barHeight
			);
		});
		
		//center the image
		let graphWidth = ((barWidth + barSpacing) * binCount);
		let img = ctx.getImageData(0,0,w,h);
		ctx.clearRect(0,0,w,h);
		ctx.putImageData(
			img,
			Math.floor((w - graphWidth) / 2),
			0
		);
		
		return {
			image: cv.toDataURL(),
			graphWidth: graphWidth
		};
	}
})();

var createMissMap = (function(){
	var cv;
	var ctx;
	
	return function(
		lineWidth = 1,
		color = '#fff',
		borderColor = '#000',
		missColor = '#f00',
		fontSize = 12,
		significantPeak = 25,
		w = 200,
		h = 70,
		data = hitData
	) {
		//initialize canvas
		if(!cv) {
			cv = document.createElement('canvas'),
			ctx = cv.getContext('2d');
		}
		
		cv.width = w;
		cv.height = h;
		
		ctx.clearRect(
			0, 0,
			w, h
		);
		
		//lets go
		let peaks = [];
		let lastPeak = 0;
		while(true) {
			let peakPos = data.indexOf('miss', lastPeak);
			if(peakPos === -1) {
				break;
			} else {
				peaks.push({
					time: peakPos,
					height: peakPos - lastPeak
				});
				lastPeak = peakPos + 1;
			}
		}
		
		if(lastPeak !== data.length) {
			peaks.push({
				time: data.length - 1,
				height: data.length - lastPeak
			});
		}
		finalPeakHeight = undefined;
		
		function getXpos(time) {return (time / (data.length - 1)) * w;};
		
		let graph = new Path2D();
		let missLines = new Path2D();
		
		//for labels
		ctx.textBaseline = 'top';
		ctx.font = `${fontSize}px sans-serif`;
		
		//set ctx composite
		ctx.globalCompositeOperation = 'source-over';
		
		//init
		graph.moveTo(0, h);
		
		peaks.forEach((peak, index)=>{
			let x = getXpos(peak.time);
			let y = h - ((peak.height / (data.length - 1)) * h);
			graph.lineTo(x, y);
			
			if(index + 1 !== peaks.length) {
				//its a miss...
				graph.lineTo(
					((peak.time + 1) / (data.length - 1)) * w,
					h
				);
				missLines.moveTo(x, 0);
				missLines.lineTo(x, h);
			}
			
			if(peak.height >= significantPeak) {
				let textInfo = ctx.measureText(peak.height);
				let textWidth = textInfo.width;
				let textHeight = textInfo.actualBoundingBoxDescent;
				
				let tx = numberClamp(
					0,
					w - textWidth,
					x - (textWidth / 2)
				);
				let ty = numberClamp(
					0,
					h - textHeight,
					y - textHeight - (lineWidth * 1.5)
				);
				
				ctx.strokeStyle = borderColor;
				ctx.strokeText(peak.height, tx, ty);
				
				ctx.fillStyle = color;
				ctx.fillText(peak.height, tx, ty);
			}
		});
		
		//draw the graph
		//	draw it below everything else
		ctx.globalCompositeOperation = 'destination-over';
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = color;
		ctx.stroke(graph);
		//draw the miss lines
		//remember that everything is drawn UNDER everything else
		ctx.strokeStyle = missColor;
		ctx.stroke(missLines);
		
		return cv.toDataURL();
	}
})();