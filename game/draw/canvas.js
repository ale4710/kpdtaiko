(function() {
    //initialize
    var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

    canvas.width = notesDisplay.clientWidth;
    canvas.height = notesDisplay.clientHeight;

    notesDisplay.appendChild(canvas);
    canvas.style.zIndex = 1;

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
        function drawNote(/* ctxtu,  */type, size, x, y, oxd, half) {
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

                //drw = Math.floor(drw);
				drw = (drw | 0);
            
                ctx.drawImage(
                    idtu,

                    //source dims
                    //Math.floor(drx), 
					(drx | 0), //floor
                    0,
                    drw,
                    idtu.height,

                    //dest dims
                    Math.floor(x - ((drw / 2) * !oxd)),
                    //Math.floor(y),
					//((x - ((drw / 2) * !oxd)) | 0),
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

                barlineCanvas.width = notesDisplay.clientWidth;
                barlineCanvas.height = notesDisplay.clientHeight;
                notesDisplay.appendChild(barlineCanvas);

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
                            /* let lp = Math.floor(lgnxp(
                                cb.time,
                                cb.lookAhead
                            )); */
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
                    var objectPrintInfo = drawNoteObjectsCache.pop();
                    if(!objectPrintInfo) {objectPrintInfo = {}}

                    objectPrintInfo.id = obj.id;
                    objectPrintInfo.type = noteTypes[obj.type];
                    objectPrintInfo.size = noteSizes[Number(obj.big)];

                    var push = false;
                    orderCheck: if(objectsPrinted.length !== 0) {
                        for(var i = objectsPrinted.length; i > 0; i--) {
                            var ii = i - 1;
                            if(objectsPrinted[ii].id > objectPrintInfo.id) {
                                objectsPrinted.splice(ii,0,objectPrintInfo);
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
                            var ex = Math.floor(lgnxp(curObj.time + curObj.length, curObj.lookAhead));
							//var ex = ((lgnxp(curObj.time + curObj.length, curObj.lookAhead)) | 0); //floor (but it only works when positive)
                            var tns = noteDims[cur.size];
                        
                            //draw the start?
                            if(!cur.startGone) {
                                sx = Math.floor(lgnxp(curObj.time, curObj.lookAhead));
								//sx = ((lgnxp(curObj.time, curObj.lookAhead)) | 0);
                            
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