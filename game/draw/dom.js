(function() {
    var noteDiv = document.createElement('div');
    noteDiv.classList.add('note');

    var groupDiv = document.createElement('div');
    groupDiv.classList.add('group');

    var drawingGroups, noteDivCache, massRemovedObjects;
    drawFnReset = function(){
        if(objectsPrinted) {
            objectsPrinted.forEach((opo)=>{
                opo.element.remove();
            });
        }

        if(drawingGroups) {
            drawingGroups.forEach((grpel)=>{
                grpel.element.remove();
            });
        }
        drawingGroups = [];

        noteDivCache = [];
        massRemovedObjects = [];
    }
    calculateDrawingOrder = function(file) {
        drawingOrder = [];
        var balloons = [], drumrolls = [];
        file.objects.forEach((obj)=>{
            var arrayToPush = drawingOrder;
            switch(obj.type) {
                case 3: arrayToPush = balloons; break;
                case 2: arrayToPush = drumrolls; break;
            }
    
            arrayToPush.push({
                startDraw: obj.time - obj.lookAhead,
                id: obj.id
            });
        });
    
        var lookAheadGroup = {};
        drawingOrder.forEach((obj)=>{
            var lookAhead = file.objects[obj.id].lookAhead;
            if(!(lookAhead in lookAheadGroup)) {
                lookAheadGroup[lookAhead] = [];
            }
            lookAheadGroup[lookAhead].push(obj);
        });
        //console.log(lookAheadGroup);
    
        var groups = [], 
        groupTimeLength = 2000,
        groupSize = 5;
        Object.keys(lookAheadGroup).forEach((la)=>{
            var curLAgroup = lookAheadGroup[la],
            group;
    
            function makeGroup(initObj) {
                group = [initObj];
                group.startDraw = initObj.startDraw;
                //group.startDraw = file.objects[initObj.id].time;
            };
    
            curLAgroup.forEach((obj)=>{
                var gameObj = file.objects[obj.id];
                if(!group) {
                    makeGroup(obj);
                } else {
                    var foig = file.objects[group[0].id];
                    if(
                        (gameObj.time - foig.time > groupTimeLength) ||
                        (group.length >= groupSize)
                    ) {
                        groups.push(group);
                        makeGroup(obj);
                    } else {
                        group.push(obj);
                    }
                }
            });
            //push the final group
            groups.push(group);
        });
    
        //console.log(groups,balloons);
    
        drawingOrder = [].concat(groups, balloons, drumrolls);
        drawingOrder.sort((a,b)=>{
            return a.startDraw - b.startDraw;
        });
    };

    barlineManager = barlineInitialize(
        (function(){
            var barlinesOnScreen = [], 
            barlinesToReuse = [],
            barlineEl = noteDiv.cloneNode();
        
            barlineEl.classList.add('barline');
        
            function lreset() {
                while(barlinesOnScreen.length !== 0) {
                    var cb = barlinesOnScreen.pop();
                    barlinesToReuse.push(cb.element);
                    cb.element.classList.add('hidden');
                }
            }
        
            function drawBarlines(curBarline, barlinesDrawingOrder){
                //draw a new barline if needed
                if(curBarline in barlinesDrawingOrder) {
                    var cb = gameFile.barlines[barlinesDrawingOrder[curBarline]];
                    if(cb.startDraw <= curTime()) {
                        var ble;
                        if(barlinesToReuse.length === 0) {
                            ble = barlineEl.cloneNode();
                            notesDisplay.appendChild(ble);
                        } else {
                            ble = barlinesToReuse.pop();
                        }
                        ble.classList.remove('hidden');
                        ble.textContent = '';
                        //for debugging
                        if('note' in cb) {
                            ble.textContent = cb.note;
                        }
                        
                        barlinesOnScreen.push({
                            time: cb.time,
                            lookAhead: cb.lookAhead,
                            element: ble
                        });
            
                        curBarline++;
                    }
                }
            
                //drawing the barlines
                for(var i = 0; i < barlinesOnScreen.length;) {
                    var cb = barlinesOnScreen[i],
                    lp = getNoteXpos(
                        cb.time,
                        cb.lookAhead
                    );
            
                    if(lp < -0.25) {
                        barlinesToReuse.push(cb.element);
                        cb.element.classList.add('hidden');
                        barlinesOnScreen.splice(i,1);
                    } else {
                        cb.element.style.left = (lp * 100) + '%';
                        i++;
                    }
                }
        
                return curBarline;
            }
        
            return {
                draw: drawBarlines,
                reset: lreset
            };
        })()
    );

    drawFn = function(gf) {
        //barlines
        barlineManager.draw();
    
        //notes
        if(latestObjectDrawn in drawingOrder) {
            if(drawingOrder[latestObjectDrawn])
            while(drawingOrder[latestObjectDrawn].startDraw <= curTime()) {
    
                var cur = drawingOrder[latestObjectDrawn],
                //gf[drawingOrder[latestObjectDrawn].id]
                isGroup = Array.isArray(cur),
                groupMdataObj,
                objectsToPrint,
                pushTo;
    
                if(isGroup) {
                    objectsToPrint = cur;
                    pushTo = groupDiv.cloneNode();
                } else {
                    objectsToPrint = [cur];
                    pushTo = notesDisplay;
                }
    
                objectsToPrint.forEach((obj, currentlyPrinting)=>{
                    obj = gf[obj.id];
                    var element,
                    endTime = obj.time;
    
                    if(noteDivCache.length === 0) {
                        element = noteDiv.cloneNode();
                    } else {
                        //console.log('pull from cache');
                        element = noteDivCache.pop();
                    }
    
                    element.classList.remove('don','kat','balloon','drumroll','big','missed');
                    element.style.width = null;
                    element.textContent = '';
    
                    //debugging stuff
                    if(obj.note) {
                        element.textContent = obj.note;
                    }
    
                    switch(obj.type) {
                        case 2: //drumroll
                            element.style.width = (getNoteXpos(
                                obj.time + obj.length,
                                obj.lookAhead,
                                obj.time
                            ) * 100) + '%';
                            endTime = obj.time + obj.length;
                            element.classList.add('drumroll');
                            break;
                        case 3: //balloon
                            element.classList.add('balloon');
                            break;
                        case 0: //don
                            element.classList.add('don');
                            break;
                        case 1: //kat
                            element.classList.add('kat');
                            break;
                    }
    
                    if(isGroup) {
                        if(currentlyPrinting === 0) {
                            notesDisplay.appendChild(pushTo);
                            groupMdataObj = {
                                start: obj.time,
                                end: null,
                                lookAhead: obj.lookAhead,
                                children: cur,
                                element: pushTo
                            };
                            drawingGroups.push(groupMdataObj);
                        }
    
                        if(currentlyPrinting === objectsToPrint.length - 1) {
                            groupMdataObj.end = endTime;
                        }
                    }
        
                    if(obj.big) {
                        element.classList.add('big');
                    }
        
                    //element.style.zIndex = Math.floor(obj.id) * -1;
					element.style.zIndex = Math.floor(gameFile.objects.length - obj.id);
    
                    var xp = 0;
                    if(currentlyPrinting !== 0) {
                        xp = getNoteXpos(
                            obj.time,
                            obj.lookAhead,
                            gf[cur[0].id].time
                        );
                    }
                    element.style.left = (xp * 100) + '%';
                    pushTo.appendChild(element);
        
                    objectsPrinted.push({
                        id: obj.id,
                        element: element,
                        inGroup: isGroup
                    });
                });
    
                latestObjectDrawn++;
                if(latestObjectDrawn === drawingOrder.length) {break;}
            }
        }
    
        var disappearThreshold = -0.2;
        //groups
        for(var i = 0; i < drawingGroups.length;) {
            var tg = drawingGroups[i];
            if(getNoteXpos(tg.end, tg.lookAhead) < disappearThreshold) {
                tg.element.remove();
                tg.children.forEach((child)=>{
                    /* child.remove = true;
                    child.massRemove = true; */
                    //no idea why, the above doesnt seem to work on kaios.
                    noDrawObjects.push(child.id);
                    massRemovedObjects.push(child.id);
                });
                drawingGroups.splice(i,1);
                //console.log('remove a group');
            } else {
                tg.element.style.left = (getNoteXpos(
                    tg.start,
                    tg.lookAhead
                ) * 100) + '%';
                i++;
            }
    
        }
    
        //items and balloons
        for(var i = 0; i < objectsPrinted.length;) {
            var cur = objectsPrinted[i],
            curObj = gf[cur.id],
            x,
            move = false,
            remove = !!cur.remove;
    
            switch(curObj.type) {
                case 0: //don
                case 1: //kat
                    if(notesMissed.indexOf(cur.id) !== -1) {
                        cur.element.classList.add('missed');
                    }
                    break;
                case 2: //drumroll
                    var now = curTime();

                    x = getNoteXpos(
                        curObj.time,
                        curObj.lookAhead
                    );

                    if(now > curObj.time + curObj.length) { //past the end of the drumroll
                        if(
                            getNoteXpos(
                                curObj.time + curObj.length,
                                curObj.lookAhead
                            ) < disappearThreshold
                        ) {
                            remove = true;
                        }
                    }
    
                    move = true;
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
                        x = getNoteXpos(
                            t,
                            curObj.lookAhead
                        );
                        if(x < disappearThreshold) {
                            remove = true;
                        }
                    } else {
                        x = 0;
                    }
    
                    move = true;
                    break;
            }
    
            if(
                remove ||
                noDrawObjects.indexOf(cur.id) !== -1
            ) {
                //if(!cur.massRemove) {
                if(massRemovedObjects.indexOf(cur.id) === -1) {
                    cur.element.remove();
                }
                noteDivCache.push(cur.element);
                objectsPrinted.splice(i,1);
            } else {
                if(move) {
                    cur.element.style.left = (x * 100) + '%';
                }
    
                i++;
            }
        }
    }

    //everything is synchronous, so we will just call it at the end.
    broadcastDrawReady();
})();

//drawDOMinit();