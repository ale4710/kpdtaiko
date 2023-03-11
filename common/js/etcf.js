var testing = false;

function eid(id, src) {
	src = src || document;
	return src.getElementById(id);
}
function ecls(cn, src) {
	src = src || document;
	return src.getElementsByClassName(cn);
}
function actEl(){return document.activeElement}
function emptyfn(){}

var screenElement = eid('screen');

var keyisnav = (function(){
	var nks = ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'];
	return function(k) {
		return nks.indexOf(k.key) > -1;
	}
})();


function waitDocumentLoaded() {
	return new Promise(function(resolve){
		if(document.readyState === 'complete') {
			resolve();
		} else {
			window.addEventListener('load', resolve);
		}
	});
}

function removeWhiteSpace(s) {return s.replace(/\s/g,'');}

function checkBit(num,bit) {
    return (num >> bit) & 1;
}

function randomInt(max) {
	return (Math.floor(Math.random() * max));
}

function numberInBetween(min, max, n, allowEqual) {
	return ((
		(min > n) &&
		(min < n)
	) || (
		(min < n) &&
		(min > n)
	) || (
		allowEqual && (
			(min === n) ||
			(max === n)
		)
	));
}

function randomHexString(len) {
    if(
        isNaN(len) ||
        !isFinite(len)
    ) {
        len = 32;
    }
    var s = '';
    for(var i = 0; i < len; i++) {
        s += '0123456789abcdef'.charAt(Math.floor(Math.random() * 16));
    }
    return s;
}

function numberClamp(min, max, n) {
	return Math.max(min, Math.min(max, n));
}

var createRandomKey = (function(){
	var tk = [];
	
	return function(takenList){
		if(!Array.isArray(takenList)) {
			takenList = tk;
		}
		var key = randomHexString();
		while(takenList.indexOf(key) !== -1) {
			key = randomHexString();
		}
		takenList.push(key);
		return key;
	}
})();

function arraySearchAndRemove(array, search) {
	var si = array.indexOf(search);
	if(si !== -1) {
		array.splice(si, 1);
		return true;
	}
	return false;
}

function setCssVariable(varname, value, elementOverride) {
	if(!(elementOverride instanceof HTMLElement)) {
		elementOverride = document.documentElement;
	}
	
	varname = '--' + varname;
	
	if(value === null) {
		elementOverride.style.removeProperty(varname);
	} else {
		elementOverride.style.setProperty(
			varname,
			value
		);
	}
}

function showNavbar(show) {document.body.classList.toggle('hide-navbar', !show);}
function transparentNavbar(tr) {document.body.classList.toggle('transparent-navbar', !!tr);}

function playAnim(el,cn,timeOverride) {
	if(!timeOverride) {timeOverride = null}
	el.style.animationDuration = timeOverride;
	el.classList.remove(cn);
	void el.offsetHeight;
	el.classList.add(cn);
}

var toggleAnimState = (function(){
	var playKeywords = [
		'running',
		'paused'
	];
	
	function toggle(el,paused) {
		var ps;
		if(paused === null) {
			ps = null;
		} else {
			ps = Number(!!paused);
		}
		el.style.animationPlayState = playKeywords[ps];
	}
})();

function fileReaderA(blob,to) {
    return (new Promise((resolve, reject)=>{
        if(blob instanceof Blob) {
            var fr = new FileReader();
            fr.addEventListener('load',(e)=>{
                resolve(e.target.result);
            });
            fr.addEventListener('error',reject);
            switch(to) {
                case 'arraybuffer': fr.readAsArrayBuffer(blob); break;
                case 'binarystring': fr.readAsBinaryString(blob); break;
                case 'dataurl': fr.readAsDataURL(blob); break;
                case 'text': fr.readAsText(blob); break;
            }
        } else {
            reject('blob is not a blob');
        }
    }));
}

function outputNavbar(l,c,r) {
    var na = [
        'left',
        'center',
        'right',
    ], 
    oa;

    if(Array.isArray(l)) {
        oa = l;
    } else {
        oa = [l,c,r];
    }

    for(var i = 0; i < 3; i++) {
        var cn = navbar[na[i]];
        if(oa[i] instanceof HTMLElement) {
            cn.innerHTML = '';
            oa[i].classList.add('icon', 'center');
            cn.appendChild(oa[i]);
        } else {
            cn.textContent = oa[i];
        }
    }
}

function clearChildrenInElement(el) {
	while(el.length !== 0) {
		el.children[0].remove();
	}
}

function navigatelist(index,list,move) { //RETURNS the current index of the thing.
    index += move;
    if(index >= list.length) {
        index = 0;
    } else if(index <= -1) {
        index = list.length - 1;
    }

    if(list[index] instanceof HTMLElement) {
        list[index].focus();
    }
    return index;
}

function elBounds(cn, el) {
    return {
        'ct': cn.scrollTop,
        'cb': cn.scrollTop + cn.clientHeight,
        'et': el.offsetTop,
        'eb': el.offsetTop + el.clientHeight
    }
}

function canseesc(cn,el) { //cn container, el,,, element
    var b = elBounds(cn, el);
    //IMPORTANT NOTE: IF USING THIS FUNCTION PLEASE MAKE SURE THAT THE PARENT IS POSITIONED
    //more info https://developer.mozilla.org/en-US/docs/Web/API/HTMLelement/offsetParent

    return ((b.eb <= b.cb) && (b.et >= b.ct)); //adapted from https://stackoverflow.com/a/488073
}

function canSeeElBounds(tp, cn, el) {
    var b = elBounds(cn, el);
    if(tp) {
        return b.et >= b.ct;
    } else {
        return b.eb <= b.cb;
    }
}

function focusInput(ip) {
    ip.focus();
    var ln = ip.value.length;
    setTimeout(()=>{
        ip.setSelectionRange(ln,ln); 
    });
}

function scrolliv(el,dn,elpr) {
    if(elpr === undefined) {
        elpr = el.parentElement;
    }
    if(!canseesc(elpr,el)) {
        if(dn) { //going down
            el.scrollIntoView(false); //align to bottom
        } else { //going up
            el.scrollIntoView(true); //align to top
        }
    }
}

function timeformat(input) {
    if(input) {
        var m = Math.floor(input / 60), s = Math.floor(input % 60), h = '';


        if(m > 59) {
            h = Math.floor(m / 60) + ':';
            m = Math.floor(m % 60);
        } 
        if(m < 10) {
            m = '0' + m;
        }
        if(s < 10) {
            s = '0' + s;
        }
        return h + m + ':' + s;
    } else {
        return '';
    }
}

function xmlhttprqsc(url,responsetype,cbs, cbf) {
    console.log('request',url);
    var rq = new XMLHttpRequest();
    rq.open(
        'GET',
        url
    );
    rq.addEventListener('load',cbs);
    rq.addEventListener('error',(e)=>{
        console.error(e);
        cb(cbf);
    });
    rq.responseType = responsetype || '';
    rq.send();
}

var alertMessage = (function(){
	let timeout;
	let fgcolors = [
		'fff',
		'000',
		'000',
		'fff'
	];
	let bgcolors = [
		'2a2a2a',
		'fff',
		'ff0',
		'f00'
	];
	
	function feaddhash(e,i,a){a[i]='#'+e;}
	fgcolors.forEach(feaddhash);
	bgcolors.forEach(feaddhash);
	feaddhash = undefined;
	
	function hidealmsg() {
		eid('alertMessage').style.transform = null;
	}
	
	return (function(msg, disptime, msgtype) {
		clearTimeout(timeout);
		let almel = eid('alertMessage');
		almel.textContent = msg;
		almel.style.color = fgcolors[msgtype] || null;
		almel.style.background = bgcolors[msgtype] || null;
		almel.style.transform = 'translatey(0)';
		setTimeout(hidealmsg, disptime);
	});
})();