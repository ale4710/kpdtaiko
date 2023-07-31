(function() {
    //initialize
    var canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = notesDisplayCanvasContainer.clientWidth;
    canvas.height = notesDisplayCanvasContainer.clientHeight;

    notesDisplayCanvasContainer.appendChild(canvas);

    //numbers and keywords and stuff
    createNoteTools(canvas, 'imgbitmap').then((noteDimH)=>{
        var noteTypes = noteDimH.typeKeywords,
        noteSizes = noteDimH.sizeKeywords,
        colors = noteDimH.colors,
        targetPos = noteDimH.targetPos,
        noteDims = noteDimH.dimentions,
        noteBorderDims = noteDimH.innerDimentions,
        drawOffset = noteDimH.drawOffset,
        notes = noteDimH.notesImgs;

        delete this.noteDimH;

        function lgnxp(time, la, to, abs) {
            var a = abs? 0 : targetPos;
            return ((getNoteXpos(time, la, to) * canvas.width) + a);
        }

        //prerendering notes!!!!

        //utility fns
        function drawNote(type, size, x, y, oxd, half, ctxtu = ctx) {
			//oxd: boolean: for the x axis, do NOT draw at the center of the circle? in other words, use the "origin x directly?"
			//half: number: 0: do not // 1: left half // 2: right half
			//ctxtu: Canvas Context: context to use
			
            var idtu = notes[size][type];

            if(idtu) {
                var drx = 0, drw = noteDims[size];
            
                if(typeof(y) !== 'number') {y = drawOffset[size]}
            
                if(typeof(half) === 'number') {
                    if(half > 0) {
                        drw /= 2;
                        if(half === 2) {
                            drx = drw;
                        }
                    }
                }
				
				drw = (drw | 0);
            
                ctxtu.drawImage(
                    idtu,

                    //source dims
					(drx | 0), //floor
                    0,
                    drw,
                    idtu.height,

                    //dest dims
                    (x - ((drw / 2) * !oxd)) | 0,
					(y | 0),
                    drw,
                    idtu.height
                );
            }
        }

        barlineManager = barlineInitialize(
            (function(){
                var barlineCanvas = (document.createElement('canvas')),
                bcctx = barlineCanvas.getContext('2d'),
                barlinesOnScreen = [];

                barlineCanvas.width = notesDisplayCanvasContainer.clientWidth;
                barlineCanvas.height = notesDisplayCanvasContainer.clientHeight;
                notesDisplayCanvasContainer.insertBefore(barlineCanvas, canvas);

                //for easy erasing
                bcctx.globalCompositeOperation = 'copy';

                function lreset() {
                    barlinesOnScreen = [];
                    bcctx.clearRect(0,0,barlineCanvas.width,barlineCanvas.height);
                }
            
                var barlineObjCache = [];
                function drawBarlines(curBarline, barlinesDrawingOrder){
                    if(curBarline in barlinesDrawingOrder) {
                        var cb = gameFile.barlines[barlinesDrawingOrder[curBarline]];
                        if(cb.startDraw <= curTime()) {
                            var bloo = barlineObjCache.pop();
                            if(!bloo) {bloo = {}}
                            bloo.time = cb.time;
                            bloo.lookAhead = cb.lookAhead;
                            barlinesOnScreen.push(bloo);

                            curBarline++;
                        }
                    }
                
                    //drawing the barlines
                    if(barlinesOnScreen.length !== 0) {
                        bcctx.strokeStyle = '#fff';
                        bcctx.lineWidth = 1;
                        bcctx.beginPath();
                        for(let i = 0; i < barlinesOnScreen.length;) {
                            barlineExistedBefore = true;
                        
                            let cb = barlinesOnScreen[i];
							let lp = lgnxp(
                                cb.time,
                                cb.lookAhead
                            );
                            
                            if(lp < 0) {
                                barlinesOnScreen.splice(i,1);
                            } else {
                                //lp = Math.floor(lp);
								lp = (lp | 0);
                                if(lp <= canvas.width) {
                                    bcctx.moveTo(lp, 0);
                                    bcctx.lineTo(lp, canvas.height);
                                }
                                i++;
                            }
                        }
                    
                        if(barlinesOnScreen.length === 0) {
                            bcctx.clearRect(0,0,barlineCanvas.width,barlineCanvas.height);
                        }
                    
                        bcctx.stroke();
                    }

                
                    return curBarline;
                }
            
                return {
                    draw: drawBarlines,
                    reset: lreset
                };
            })()
        );

        drawFnReset = function(){
            ctx.clearRect(0,0,canvas.width,canvas.height);
        }
		
		//effects
		{
			let efCanvas = document.createElement('canvas');
			efCanvas.width = canvas.height; //yes
			let yOffset = Math.floor(canvas.height * 1.2); //the (* 1) is a height multiplier
			efCanvas.height = canvas.height + yOffset;
			eid('notes-display-target-effects-container').appendChild(efCanvas);
			let efCtx = efCanvas.getContext('2d');
			
			let activeTime = 500;
			
			class HitEffect {
				constructor(type, size) {
					this.type = type;
					this.size = size;
					this.jumpOffset = Math.random() * 0.3;
					this.moveOffset = Math.random() * 0.2;
					this.startTime = curTime();
				}
				
				getPercentage(currentTime) {
					let percent = (currentTime - this.startTime) / activeTime;
					return Math.max(0, percent);
				}
				
				draw(currentTime) {
					let percent = this.getPercentage(currentTime);
					
					let jumpMultiply = Math.pow(((percent * 4) - 2), 2) / 4;
					jumpMultiply = this.jumpOffset + (jumpMultiply * (1 - this.jumpOffset));
					
					let originOffset = drawOffset[this.size];
					
					let x = (efCanvas.width * (0.5 - (percent * (0.9 + this.moveOffset))));
					let y = (yOffset * jumpMultiply) + originOffset;
					
					drawNote(
						this.type,
						this.size,
						x | 0,
						y | 0,
						false,
						undefined,
						efCtx
					);
					return true;
				}
			}
			
			let activeEffects = [];
			window.addEventListener('gamehit', (ev)=>{
				activeEffects.push(new HitEffect(
					drawNoteConstants.noteTypes[ev.detail.type],
					drawNoteConstants.noteSizes[Number(ev.detail.big)]
				));
			});
			window.addEventListener('gamedrumrollhit', ()=>{
				activeEffects.push(new HitEffect(
					'drumroll',
					drawNoteConstants.noteSizes[Number(gameFile.objects[latestObject].big)]
				));
			});
			noteHitEffect.draw = function(){
				let now = curTime();
				
				while(activeEffects.length !== 0) {
					if(activeEffects[0].getPercentage(now) > 1) {
						activeEffects.shift();
					} else {
						break;
					}
				}
				
				efCtx.clearRect(0, 0, efCanvas.width, efCanvas.height);
				activeEffects.forEach((ef)=>{
					ef.draw(now);
				});
			};
			noteHitEffect.reset = function(){
				activeEffects.length = 0;
			};
		}


        var drawNoteObjectsCache = [];
        drawFn = function(gf) {
            //barlines
            barlineManager.draw();

            //notes
            if(latestObjectDrawn in drawingOrder) {
                while(drawingOrder[latestObjectDrawn].startDraw <= curTime()) {
                    //console.log('checking');

                    var cur = drawingOrder[latestObjectDrawn],
                    obj = gf[cur.id];

                    //garbage collection avoidance?
                    var objectPrintInfo = drawNoteObjectsCache.pop() || {};

                    objectPrintInfo.id = obj.id;
                    objectPrintInfo.type = noteTypes[obj.type];
                    objectPrintInfo.size = noteSizes[Number(obj.big)];

                    var push = false;
                    orderCheck: if(objectsPrinted.length !== 0) {
                        for(var i = objectsPrinted.length - 1; i >= 0; i--) {
                            if(objectsPrinted[i].id < objectPrintInfo.id) {
                                objectsPrinted.splice(i + 1, 0, objectPrintInfo);
                                break orderCheck;
                            }
                        }

                        push = true;
                    } else {
                        push = true;
                    }

                    if(push) {
                        objectsPrinted.push(objectPrintInfo);
                    }
                
                    latestObjectDrawn++;
                    if(latestObjectDrawn === drawingOrder.length) {break;}
                }
            }
        
            //actually drawing
            if(objectsPrinted.length !== 0) {

                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.globalCompositeOperation = 'destination-over';

                for(var i = 0; i < objectsPrinted.length;) {
                    var cur = objectsPrinted[i],
                    curObj = gf[cur.id],
                    remove = false;
                
                    //ctx.globalCompositeOperation = (i === 0)? 'copy' : 'destination-over';
                
                    switch(curObj.type) {
                        case 0: //don
                        case 1: //kat
                            var x = lgnxp(curObj.time, curObj.lookAhead);
                            if(x < -noteDims.big) {
                                remove = true;
                            } else {
                                drawNote(
                                    cur.type,
                                    cur.size,
                                    x
                                );
                            }
                            if(notesMissed.indexOf(cur.id) !== -1) {remove = true;}
                            break;
                        case 2: //drumroll
                            var now = curTime();
                            var sx = 0;
							var ex = ((lgnxp(curObj.time + curObj.length, curObj.lookAhead)) | 0); //floor
                            var tns = noteDims[cur.size];
                        
                            //draw the start?
                            if(!cur.startGone) {
								sx = ((lgnxp(curObj.time, curObj.lookAhead)) | 0); //floor
                            
                                drawNote(
                                    cur.type,
                                    cur.size,
                                    sx - (tns / 2),
                                    null,
                                    true,
                                    1
                                );
                                
                                if(sx < ((tns / 2) * -1)) {
                                    cur.startGone = true;
                                }
                            }
                            //ctx.globalCompositeOperation = 'destination-over';
                        
                            //rectangle.
                            //borders first
                            var rds = noteBorderDims[cur.size];
                            var ry = drawOffset[cur.size];
                            var rw = ex - sx;
                            var rih = rds.innerHeight;
                            var rbt = rds.borderSize;
							
                            ctx.fillStyle = '#fff';
                            ctx.beginPath();
                            ctx.rect(
                                sx, ry,
                                rw, rbt
                            );
                            ctx.rect(
                                sx, ry + rih + rbt,
                                rw, rbt
                            );
                            ctx.fill();
                            
                            ctx.fillStyle = colors.drumroll;
                            ctx.fillRect(
                                sx, ry + rbt,
                                rw, rih
                            );
                            
                            //draw the end?
                            if(ex < canvas.width) {
                                drawNote(
                                    cur.type,
                                    cur.size,
                                    ex,
                                    null,
                                    true,
                                    2
                                );
                            } else if(ex < (tns / 2) * -1) {
                                remove = true;
                            } 
                            break;
                        case 3: //balloon
                            var t;
                            var now = curTime();
                            if(now > curObj.length) { //past the end of the balloon
                                t = curObj.length;
                            } else if(now < curObj.time) { //before the beginning of the balloon
                                t = curObj.time;
                            } else {
                                t = null;
                            }
                        
                            if(typeof(t) === 'number') {
                                x = lgnxp(
                                    t,
                                    curObj.lookAhead
                                );
                                if(x < noteDims.normal) {
                                    remove = true;
                                }
                            } else {
                                x = targetPos;
                            }
                        
                            if(!remove) {
                                drawNote(
                                    cur.type,
                                    'normal',
                                    x
                                );
                            }
                        
                            break;
                    }
                
                    if(
                        remove ||
                        noDrawObjects.indexOf(cur.id) !== -1
                    ) {
                        drawNoteObjectsCache.push(cur);
                        objectsPrinted.splice(i,1);
                    } else {
                        i++;
                    }
                }
            }

            if(objectsPrinted.length === 0) {
                ctx.clearRect(0,0,canvas.width,canvas.height);
            }
        }

        calculateDrawingOrder = function(file) {
            drawingOrder = [];
            file.objects.forEach((obj)=>{
                drawingOrder.push({
                    startDraw: obj.time - obj.lookAhead,
                    id: obj.id
                });
            });
            drawingOrder.sort((a,b)=>{
                return a.startDraw - b.startDraw;
            });
        }

        broadcastDrawReady();
    });
})();