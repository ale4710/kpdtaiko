var drawNoteParameters = {
	colors: {
		don: '#ff0000',
		kat: '#4444ff',
		drumroll: '#ffff00',
		balloon: '#000000'
	},
	noteSize: 0.5, //wrt canvas. (note: diameter, not radius)
	bigNoteSize: 0.75, //wrt canvas
	borderSize: 0.125 //wrt noteSize
};

function createNoteTools(canvas, noteImgFormat){
    return (new Promise((resolve, reject)=>{
        var noteTypes = [
            'don',
            'kat',
            'drumroll',
            'balloon'
        ];
        var noteSizes = ['normal','big'];
    
        var targetPos = canvas.height / 2;
    
        var noteDims = {
            normal: Math.floor(canvas.height * drawNoteParameters.noteSize),
            big: Math.floor(canvas.height * drawNoteParameters.bigNoteSize)
        };
        var noteBorderDims = {};
        var drawOffset = {};
    
        Object.keys(noteDims).forEach((size)=>{
            drawOffset[size] = Math.floor((canvas.height / 2) - (noteDims[size] / 2));
    
            var tnbd = {};
            tnbd.borderSize = Math.floor(noteDims[size] * drawNoteParameters.borderSize);
            tnbd.innerHeight = Math.floor(noteDims[size] - (tnbd.borderSize * 2));
            noteBorderDims[size] = tnbd;
        });

        var notes = {};
    
        (()=>{
            var buffer = document.createElement('canvas'),
            bufferCtx = buffer.getContext('2d');
            
            //bgColor = window.getComputedStyle(notesDisplay.parentElement).backgroundColor;
    
            var circleAA = getSettingValue('canvas-anti-alias-circles') === 1;
    
            function removeAliasing(imgdata) {
                for(var i = 3; i < imgdata.data.length; i+=4) {
                    var ca = imgdata.data[i];
            
                    imgdata.data[i] = (ca > (255/2))? 255 : 0;
                }
            }
    
            function contPrerender(s,t) {
                //console.log(s,t);
    
                var sizekw = noteSizes[s],
                tns = noteDims[sizekw],
                tnbd = noteBorderDims[sizekw],
                type = noteTypes[t];

                if(!(sizekw in notes)) {
                    notes[sizekw] = {}
                }
    
                /* console.log(
                    sizekw,
                    tns,
                    tnbd,
                    type
                ) */
                //bufferCtx.fillStyle = bgColor;
                //bufferCtx.globalCompositeOperation = 'source-over';
                //bufferCtx.fillRect(0,0,buffer.width,buffer.height);
                bufferCtx.clearRect(0,0,buffer.width+1,buffer.height+1);
                buffer.width = tns;
                buffer.height = tns;
                bufferCtx.globalCompositeOperation = 'destination-over';
    
                var pos = Math.floor(tns/2),
                r = Math.floor(tnbd.innerHeight / 2);
    
                bufferCtx.fillStyle = drawNoteParameters.colors[type];
                //bufferCtx.globalCompositeOperation = 'source-over';
                bufferCtx.beginPath();
                bufferCtx.arc(
                    pos,pos,
                    r,
                    0, Math.PI * 2
                );
                bufferCtx.fill();
    
                if(!circleAA) {
                    var ti = bufferCtx.getImageData(
                        0, 0,
                        tns, tns
                    );
                    removeAliasing(ti);
                    bufferCtx.putImageData(ti,0,0);
                }
    
                r = Math.floor((tnbd.innerHeight + (tnbd.borderSize * 2)) / 2);
                bufferCtx.fillStyle = '#fff';
                //bufferCtx.globalCompositeOperation = 'source-in';
                bufferCtx.beginPath();
                bufferCtx.arc(
                    pos, pos,
                    r,
                    0, Math.PI * 2
                );
                bufferCtx.fill();
    
                var bufferData = bufferCtx.getImageData(
                    0, 0,
                    tns, tns
                );
    
                if(!circleAA) {removeAliasing(bufferData)}

                function saveImg(img) {
                    notes[sizekw][type] = img;
    
                    proceedPath: {
                        if(++t === noteTypes.length) {
                            t = 0;
                            if(++s === noteSizes.length) {
                                //this is the only async thingy, so we will put it here.
                                finish();
                                break proceedPath;
                            }
                        }
    
                        contPrerender(s,t);
                    }
                }

                switch(noteImgFormat) {
                    default:
                        saveImg(bufferData);
                        break;
                    case 'imgbitmap':
                        createImageBitmap(
                            bufferData
                        ).then(saveImg);
                        break;
                    case 'htmlimg':
                        var img = document.createElement('img');
                        img.src = buffer.toDataURL();
                        saveImg(img);
                        break;

                }
    
                
            };
    
            contPrerender(0,0);
        })();

        function finish() {
            delete this.finish;
            resolve({
                typeKeywords: noteTypes,
                sizeKeywords: noteSizes,
                colors: drawNoteParameters.colors,
                dimentions: noteDims,
                innerDimentions: noteBorderDims,
                dimentionsPercentage: {
                    note: drawNoteParameters.noteSize,
                    big: drawNoteParameters.bigNoteSize,
                    border: drawNoteParameters.borderSize
                },

                notesImgs: notes,
        
                targetPos: targetPos,
                drawOffset: drawOffset
            });
        }
    }));
};