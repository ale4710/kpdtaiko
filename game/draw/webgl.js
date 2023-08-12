(function() {
    var width = notesDisplay.clientWidth;
    var height = notesDisplay.clientHeight;
    var yOffset = Math.floor(height * 1.2);
    var realHeight = height + yOffset;
    var halfHeight = height / 2;

    Promise.all([
		addGlobalReference(0, '../common/lib/pixi.min'),
		addGlobalReference(0, '../common/lib/pixi.unsafe-eval.min')
	]).then(function(){
        pixiReady = null;
		pxapp = (new PIXI.Application({
			width: width,
			height: realHeight,
			transparent: true
		}));

		{
			let pxappViewContainer = document.createElement('div');
			pxappViewContainer.style.top = -yOffset + 'px';
			pxappViewContainer.style.left = 0;
			pxappViewContainer.style.position = 'absolute';
			
			pxappViewContainer.appendChild(pxapp.view);
			notesDisplayCanvasContainer.appendChild(pxappViewContainer);
		}

        pxapp.stage.sortableChildren = true;
        pxapp.stage.sortDirty = false;
    
        createNoteTools({
            width: width,
            height: height
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
                return ((getNoteXpos(time, la, to) * width) + noteTools.targetPos);
            }

			//note sprites
			var noteSpriteCache = [];
            function makeNoteSprite(tex) {
                var s = PIXI.Sprite.from(tex);
                s.anchor.set(0.5);
                s.y = yOffset + halfHeight;
                pxapp.stage.addChild(s);
                return s;
            }
            function getNoteSprite(tex) {
				if(!tex) {throw 'pass a texture'}
				let s = noteSpriteCache.pop();
				if(s) {
					s.texture =tex;
					return s;
				} else {
					return makeNoteSprite(tex);
				}
			};
			
			//hit effect
			if(noteHitEffect) {
				let activeTime = 500;
				
				let activeEffects = [];
				let inactiveEffects = [];
				
				function startEffect(type, size) {
					let efInstance = inactiveEffects.pop() || {};
					
					//efInstance.type = type; //no need to save this info
					efInstance.size = size;
					efInstance.startTime = curTime();
					
					efInstance.sprite = getNoteSprite(
						pxTextures
							[drawNoteConstants.noteSizes[size]]
							[drawNoteConstants.noteTypes[type]]
					);
					efInstance.sprite.visible = true;
					
					activeEffects.push(efInstance);
				};
				
				function makeEffectInstanceInactive(efInstance) {
					//it is your responsibility to remove it from activeEffects
					inactiveEffects.push(efInstance);
					
					let s = efInstance.sprite;
					noteSpriteCache.push(s);
					delete efInstance.sprite;
					
					s.visible = false;
				};
				
				window.addEventListener('gamehit', (ev)=>{
					startEffect(ev.detail.type, Number(ev.detail.big));
				});
				window.addEventListener('gamedrumrollhit', ()=>{
					startEffect(
						2, //drumroll
						Number(gameFile.objects[latestObject].big)
					);
				});
				
				noteHitEffect.reset = function(){
					while(activeEffects.length !== 0) {
						let ef = activeEffects.pop();
						makeEffectInstanceInactive(ef);
					}
				};
				
				noteHitEffect.update = function(){
					if(activeEffects.length !== 0) {
						console.log('nhe upd');
						let now = curTime();
						
						for(let i = 0; i < activeEffects.length;) {
							let efInstance = activeEffects[i];
							let percent = Math.max(0, (
								(now - efInstance.startTime) / activeTime
							));
							
							if(percent > 1) {
								activeEffects.shift();
								makeEffectInstanceInactive(efInstance);
							} else {
								efInstance.sprite.x = height * (0.5 - percent);

								let jumpMultiply = Math.pow(((percent * 4) - 2), 2) / 4;
								efInstance.sprite.y = (height / 2) + (yOffset * jumpMultiply);
								i++;
							}
						}
					}
				};
			}

			//barlines
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
                                    sprite.y = yOffset;
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
                                var cb = barlinesOnScreen[i];
                                var lp = (lgnxp(
                                    cb.time,
                                    cb.lookAhead
                                ));
                        
                                if(lp < 0) {
                                    barlinesOnScreen.splice(i,1)
                                    barlinesWaitingRoom.push(cb);
                                    cb.sprite.visible = false;
								} else {
                                    //lp = Math.floor(lp);
									lp = (lp | 0); //floors it
									
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
    
			//drawing
            var drawNoteObjectsCache = [];

			//everything else
            drawFnReset = function(){
                if(objectsPrinted) {
                    objectsPrinted.forEach((op)=>{
                        drawNoteObjectsCache.push(op);
                        
                        let s = op.sprite;
                        delete op.sprite;
                        noteSpriteCache.push(s);
                        
                        s.visible = false;

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
					let newObjectAdded = false;
                    while(drawingOrder[latestObjectDrawn].startDraw <= curTime()) {
                        newObjectAdded = true;
        
                        var cur = drawingOrder[latestObjectDrawn];
                        var obj = gf[cur.id];
        
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
                        objectPrintInfo.sprite = getNoteSprite(texToUse);
                        objectPrintInfo.sprite.y = yOffset + halfHeight;

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
                            drumrollBody.body.y = yOffset + halfHeight;
                            drumrollBody.body.pivot.set(
                                0,
                                //Math.floor(drumrollBody.body.height / 2)
								((drumrollBody.body.height / 2) | 0) //floor
                            );
                            pxapp.stage.addChild(drumrollBody.body);

                            objectPrintInfo.drumrollBody = drumrollBody;
                        }

                        objectPrintInfo.sprite.visible = false;
                        objectPrintInfo.sprite.zIndex = zi;

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
					if(newObjectAdded){ //sort at end, and only when new object
						pxapp.stage.sortChildren();
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
                                sx = (lgnxp(curObj.time, curObj.lookAhead)), 
                                ex = (lgnxp(curObj.time + curObj.length, curObj.lookAhead)),
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
                            
                            let s = cur.sprite;
                            delete cur.sprite;
                            s.visible = false;
                            noteSpriteCache.push(s);
                            
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
    });
})();