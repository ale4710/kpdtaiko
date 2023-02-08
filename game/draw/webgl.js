(function() {
    //initialize
	var loaded = 0, needed = 2;
	function loadCheck() {
		if(++loaded === needed) {
			loadCheck = null;
			
			loaded = null;
			needed = null;
			
			pixiReady();
		}
	}
    addGlobalReference(0, '../common/lib/pixi.min').then(loadCheck);
    addGlobalReference(0, '../common/lib/pixi.unsafe-eval.min').then(loadCheck);

    var width = notesDisplay.clientWidth,
    height = notesDisplay.clientHeight,
    halfHeight = height / 2;

    function pixiReady() {
        pixiReady = null;
		pxapp = (new PIXI.Application({
			width: width,
			height: height,
			transparent: true
		}));

        notesDisplay.appendChild(pxapp.view);

        pxapp.stage.sortableChildren = true;
        pxapp.stage.sortDirty = false;
    
        createNoteTools({
            width: pxapp.renderer.view.width,
            height: pxapp.renderer.view.height
        }/* images are raw imagedata */).then((noteTools)=>{
            
            //create textures.
            var pxTextures = {};
            noteTools.sizeKeywords.forEach((size)=>{
                pxTextures[size] = {};
                noteTools.typeKeywords.forEach((type)=>{
                    var tid = noteTools.notesImgs[size][type];
                    pxTextures[size][type] = PIXI.Texture.fromBuffer(
                        tid.data,
                        tid.width,
                        tid.height
                    );
                });
            });
            //additionally, body of drumrolls
            (()=>{
                var drcolor = parseInt(noteTools.colors.drumroll.substr(1), 16);

                noteTools.sizeKeywords.forEach((size)=>{
                    var drb = (new PIXI.Graphics()),
                    idims = noteTools.innerDimentions[size];

                    drb.cacheAsBitmap = true;
    
                    pxTextures[size].drumrollBody = drb;

                    drb.fill.visible = true;
                    drb.fill.color = 0xffffff;
                    drb
                    .drawRect(0,0,1,idims.borderSize)
                    .drawRect(0,idims.borderSize + idims.innerHeight,1,idims.borderSize);
    
                    drb.fill.color = drcolor;
                    drb.drawRect(0,idims.borderSize,1,idims.innerHeight);

                    //console.log(drb);
                });
            })();

            //util fns
            function lgnxp(time, la, to) {
                return /* Math.floor */((getNoteXpos(time, la, to) * width) + noteTools.targetPos);
            }

            function makeNoteSprite(tex) {
                var s = PIXI.Sprite.from(tex);
                s.anchor.set(0.5);
                s.y = halfHeight;
                pxapp.stage.addChild(s);
                return s;
            }

            barlineManager = barlineInitialize(
                (function(){
                    var barlinesOnScreen = [],
                    barlinesWaitingRoom = [],
                    barlineGeometery = (new PIXI.Graphics());
                    barlineGeometery.cacheAsBitmap = true;
                    barlineGeometery.lineStyle(
                        1,
                        0xffffff,
                        1
                    );
                    barlineGeometery.zIndex = -1;
                    barlineGeometery.moveTo(0,0).lineTo(0,height);
        
        
                    function lreset() {
                        for(var i = 0; i < barlinesOnScreen.length;) {
                            var ebs = barlinesOnScreen.pop();
                            ebs.sprite.visible = false;
                            barlinesWaitingRoom.push(ebs);
                        }
                    }
                
                    function drawBarlines(curBarline, barlinesDrawingOrder){
                        if(curBarline in barlinesDrawingOrder) {
                            while(gameFile.barlines[barlinesDrawingOrder[curBarline]].startDraw <= curTime()) {
                                var cb = gameFile.barlines[barlinesDrawingOrder[curBarline]];
                                
                                var btu = barlinesWaitingRoom.pop();
                                if(!btu) {
                                    var sprite = barlineGeometery.clone();
                                    sprite.y = 0;
                                    //console.log(sprite);
    
                                    pxapp.stage.addChild(sprite);
                                    btu = {sprite: sprite}
                                }
                                btu.time = cb.time;
                                btu.lookAhead = cb.lookAhead;
                                btu.sprite.visible = false;
                                barlinesOnScreen.push(btu);

                                if(curBarline + 1 in barlinesDrawingOrder) {
                                    if(gameFile.barlines[barlinesDrawingOrder[curBarline + 1]].startDraw > curTime()) {
                                        break;
                                    } else {
                                        curBarline++;
                                    }
                                } else {
                                    break;
                                }
                                
                            }
                        }
                    
                        //drawing the barlines
                        if(barlinesOnScreen.length !== 0) {
                            for(var i = 0; i < barlinesOnScreen.length;) {        
                                var cb = barlinesOnScreen[i],
                                lp = /* Math.floor */(lgnxp(
                                    cb.time,
                                    cb.lookAhead
                                ));
                        
                                if(lp < 0) {
                                    barlinesOnScreen.splice(i,1)
                                    barlinesWaitingRoom.push(cb);
                                    cb.sprite.visible = false;
                                    } else {
                                    lp = Math.floor(lp);
                                    //sprite.visible is false default.
                                    //it will be enabled when in view.
                                    if(lp <= width) {
                                        var s = cb.sprite;
                                        s.visible = true;
                                        s.x = lp;
                                    }
                                    i++;
                                }
                            }
            
                            /* if(barlinesOnScreen.length === 0) {
                                bcctx.clearRect(0,0,barlineCanvas.width,barlineCanvas.height);
                            } */
                        }
                        
                
                        return curBarline;
                    }
                
                    return {
                        draw: drawBarlines,
                        reset: lreset
                    };
                })()
            );
    
            var drawNoteObjectsCache = [];

            drawFnReset = function(){
                if(objectsPrinted) {
                    objectsPrinted.forEach((op)=>{
                        drawNoteObjectsCache.push(op);
                        op.sprite.visible = false;

                        if('drumrollParts' in op) {
                            var bp = op.drumrollParts;
                            
                            bp.body.destroy();
                            bp.end.destroy();

                            delete op.drumrollParts;
                        }
                    });
                }
            }
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
                        if(!objectPrintInfo) {
                            objectPrintInfo = {};
                        }
        
                        objectPrintInfo.id = obj.id;
                        objectPrintInfo.type = noteTools.typeKeywords[obj.type];
                        objectPrintInfo.size = (obj.type === 3? 'normal' : noteTools.sizeKeywords[Number(obj.big)]);
                        //assign a texture

                        var texToUse = pxTextures[objectPrintInfo.size][objectPrintInfo.type];
                        if('sprite' in objectPrintInfo) {
                            objectPrintInfo.sprite.texture = texToUse;
                        } else {
                            objectPrintInfo.sprite = makeNoteSprite(texToUse);
                        }

                        var zi = gf.length - objectPrintInfo.id;

                        //drumroll?
                        if(obj.type === 2) {
                            var drumrollBody;
                            if('drumrollBody' in objectPrintInfo) {
                                drumrollBody = objectPrintInfo.drumrollBody;
                            } else {
                                drumrollBody = {};
                            }
                            drumrollBody.end = makeNoteSprite(texToUse);
                            drumrollBody.end.zIndex = zi;

                            drumrollBody.body = pxTextures[objectPrintInfo.size].drumrollBody.clone();
                            drumrollBody.body.zIndex = zi + 0.1;
                            drumrollBody.body.y = halfHeight;
                            drumrollBody.body.pivot.set(
                                0,
                                Math.floor(drumrollBody.body.height / 2)
                            );
                            pxapp.stage.addChild(drumrollBody.body);

                            objectPrintInfo.drumrollBody = drumrollBody;
                        }

                        objectPrintInfo.sprite.visible = false;
                        objectPrintInfo.sprite.zIndex = zi;
                        pxapp.stage.sortChildren();

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
                    for(var i = 0; i < objectsPrinted.length;) {
                        var cur = objectsPrinted[i],
                        curObj = gf[cur.id],
                        remove = false;
                
                        switch(curObj.type) {
                            case 0: //don
                            case 1: //kat
                                var x = lgnxp(curObj.time, curObj.lookAhead);
                                if(x < -noteTools.dimentions.big) {
                                    remove = true;
                                } else {
                                    cur.sprite.x = x;
                                }
                                if(notesMissed.indexOf(cur.id) !== -1) {remove = true;}
                                break;
                            case 2: //drumroll
                                var now = curTime(),
                                sx = /* Math.floor */(lgnxp(curObj.time, curObj.lookAhead)), 
                                ex = /* Math.floor */(lgnxp(curObj.time + curObj.length, curObj.lookAhead)),
                                tns = noteTools.dimentions[cur.size];

                                if(ex < (tns / 2) * -1) {
                                    remove = true;

                                    cur.drumrollBody.body.destroy();
                                    cur.drumrollBody.end.destroy();
                                } else {
                                    cur.sprite.x = sx;
                                    cur.drumrollBody.body.x = sx;
                                    cur.drumrollBody.body.scale.set(ex - sx, 1);
                                    cur.drumrollBody.end.x = ex;
                                }
                                break;
                            case 3: //balloon
                                var t,
                                now = curTime();
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
                                    if(x < noteTools.dimentions.normal) {
                                        remove = true;
                                    }
                                } else {
                                    x = noteTools.targetPos;
                                }
            
                                if(!remove) {
                                    cur.sprite.x = x;
                                }
                
                                break;
                        }
                
                        if(
                            remove ||
                            noDrawObjects.indexOf(cur.id) !== -1
                        ) {
                            drawNoteObjectsCache.push(cur);
                            cur.sprite.visible = false;
                            objectsPrinted.splice(i,1);
                        } else {
                            cur.sprite.visible = true;
                            i++;
                        }
                    }
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
    }
})();