var modsList = (function(){
    
    function numberMultFormat(n) {
        return n.toFixed(1);
    }
	
	function lsgi(k){return localStorage.getItem(k)}

    var mods = {

        /* 
        {
            img: string with filename. path is formed like `/img/modico/${img}.png`
            check: function which returns the value of the mod. what it returns depends on the mod.
            mode: number indicating what the value should be.
                0 = boolean.
                1 = number.
            formatLabel: function which accepts check, to return a formatted string to display in a modsView.
                it only should be present when it needs a label.
            defaultValue: a default value, depending on the mode.
                mode=0 = n/a
                mode=1 = a number. if it the same as this number, it will be hidden.
        }
        */

        auto: {
            img: 'auto',
            check: ()=>{return lsgi('autoplay-enabled') === 'true';},
            mode: 0
        },
        metronome: {
            img: 'metronome',
            check: ()=>{return (getSettingValue('metronome') === 1)},
            mode: 0
        },
        notesHidden: {
            img: 'notes-hidden',
            check: ()=>{return (getSettingValue('show-notes') === 0)},
            mode: 0
        },
        timingWindow: {
            img: 'timing-window-adjust',
            check: ()=>{return getSettingValue('hit-windows')},
            mode: 1,
			defaultValue: 2,
			formatLabel: (function(){
				return [
					'C',
					'W',
					null,
					'T'
				][getSettingValue('hit-windows')];
			})
        },
        scrollSpeed: {
            img: 'scroll-speed-modify',
            check: ()=>{return parseFloat(lsgi('scroll-speed'))},
            mode: 1,
            formatLabel: numberMultFormat,
            defaultValue: 1
        },
        audioSpeed: {
            img: 'audio-speed-modify',
            check: ()=>{return parseFloat(lsgi('audio-speed'))},
            mode: 1,
            formatLabel: numberMultFormat,
            defaultValue: 1
        },
		risky: {
			img: 'risky',
			check: ()=>{return Math.floor(getSettingValue('game-risky'))},
			mode: 1,
			//formatLabel: Math.floor,
			defaultValue: 0
		}
    },

    //modsKeys = Object.keys(mods)
    
    order = [//ordering
        'auto',
        'metronome',
        'notesHidden',
		'risky',
        'timingWindow',
        'scrollSpeed',
        'audioSpeed'
    ];

    return {
        mods: mods,
        keys: order
    };
})();

class ModsView {
    constructor(size, container) {
        this.view = document.createElement('div');
        this.view.classList.add('mods-view');

        if(container instanceof HTMLElement) {
            container.appendChild(this.view);
        }

        this.modDisplays = {};
		
		var imgSize,
		imgSizeArray = [
			'small', //12x12
			'medium' //16x16
		];
		if(typeof(size) === 'number') {
			if(size in imgSizeArray) {
				imgSize = imgSizeArray[size];
			}
		}
		
		if(typeof(imgSize) === 'undefined') {
			imgSize = imgSizeArray[0];
		}
		
		this.view.classList.add(imgSize);

        modsList.keys.forEach((mk)=>{
            var tmo = modsList.mods[mk],
            img = document.createElement('img');
            img.src = `../img/modico/${imgSize}/${tmo.img}.png`;

            var disp;
            switch(tmo.mode) {
                case 0: //bool
                    disp = img;
                    this.view.appendChild(disp);
                    img.classList.add('hidden');
                    break;
                case 1:
                    var lb = document.createElement('span'),
                    ct = document.createElement('span'),
                    disp = {
                        img: img,
                        label: lb,
                        container: ct
                    };

                    lb.classList.add('mods-view-label');

                    ct.appendChild(img);
                    ct.appendChild(lb);
                    this.view.appendChild(ct);
                    disp.container.classList.add('hidden');
                    break;
            }

            this.modDisplays[mk] = disp;
        });

        this.updateDisplay();
    }

    updateDisplay(specificMod, valueOverride) {
        var mtu = modsList.keys;
        if(specificMod in modsList.mods) {
            mtu = [specificMod];
        }

        mtu.forEach((mk)=>{
            var tmo = modsList.mods[mk],
            tmd = this.modDisplays[mk],
            val;

            if(
                typeof(specificMod) !== 'undefined' &&
                typeof(valueOverride) !== 'undefined'
            ) {
                val = valueOverride;
            } else {
                val = tmo.check();
            }

            switch(tmo.mode) {
                case 0:
                    tmd.classList.toggle('hidden', !val);
                    break;
                case 1:
                    var isdef = (val === tmo.defaultValue);
                    tmd.container.classList.toggle('hidden', isdef);
                    if(!isdef) {
                        var label = val;
                        if('formatLabel' in tmo) {
                            label = tmo.formatLabel(val);
                        }
                        tmd.label.textContent = label;
                    }
                    break;
            }
        });
    }
}