var getRandomClassName = (function(){
	var takennames = [];
	return function() {
		var name;
		while(
			takennames.indexOf(name) !== -1 ||
			typeof(name) === 'undefined'
		) {
			name = Math.floor(Math.random() * Math.pow(10, 20));
		}
		takennames.push(name);
		return name;
	}
})();

class PreviousFocusHandler {
    constructor(){
        this.clear();
    }

    save(hideCallback) {
        this.lastEl = actEl();
        this.lastPage = curpage;
        if(typeof(hideCallback) === 'function') {
            this.hideCallback = hideCallback;
        }
    }

    refocus() {
        if(this.lastEl) {this.lastEl.focus()}
    }
    loadpage() {
        if(this.lastPage !== null) {curpage = this.lastPage}
    }
    execcallback() {
        if(typeof(this.hideCallback) === 'function') {
            this.hideCallback(...arguments);
        }
    }

    clear() {
        this.lastEl = null;
        this.lastPage = null;
        this.hideCallback = null;
    }
}

class Menu {
    constructor(container) {
        this.container = container;

        this.menu = document.createElement('div');
        this.menu.classList.add('menu');
		
        this.container.appendChild(this.menu);
		
		this.className = `menu-${getRandomClassName()}`;
    }
	
	getChildren() {
		return this.menu.querySelectorAll(`.${this.className}.focusable-item`);
		//return this.menu.getElementsByClassName(this.className);
	}

    clearMenu() {
        /* var mc = this.getChildren();
		for(var i = 0; i < mc.length; i++) {
			mc[i].remove();
		} */
		
        var mc = this.menu.getElementsByClassName(this.className);
		while(mc.length !== 0) {mc[0].remove()}
    }

    navigate(d) {
		var c = this.getChildren();
        if(d === 0) {
            c[0].focus();
        } else {
            navigatelist(
                actEl().tabIndex,
                c, d
            );
        }
    }

    addOption(label, id) {
        var opt = document.createElement('div');
        opt.classList.add('menu-entry', 'focusable-item', this.className);
        opt.tabIndex = this.getChildren().length;
        opt.textContent = label || '';
        if(typeof(id) !== 'undefined'){opt.dataset.id = id;}
        this.menu.appendChild(opt);
        return opt;
    }
	
	addSeperator(label) {
        var opt = document.createElement('div');
        opt.classList.add('menu-entry', 'menu-seperator', this.className);
        opt.textContent = label || '';
        this.menu.appendChild(opt);
        return opt;
	}
}

class OptionsMenu extends Menu {
    constructor(headerLabel) {
        super(document.createElement('div'));
        this.container.classList.add('option-menu-cont');
        this.menu.classList.add('option-menu');

        this.allowBackCV = null;

        this.screen = document.createElement('div');
        this.screen.classList.add('screen','dim','hidden','option-menu-screen');

        this.header = document.createElement('div');
        this.header.classList.add('menuheader');
        this.header.textContent = headerLabel;

        this.screen.appendChild(this.container);
        this.container.insertBefore(
            this.header,
            this.menu
        );
        //this.container.appendChild(this.header);
        screenElement.appendChild(this.screen);
    }

    updateHeader(headerLabel) {
        this.header.textContent = headerLabel;
    }

    menuViewToggle(v,f,fn) {
        //v = visible (bool), f = focus mode (bool) when v=true, fn = focus number when f=true
        if(v) {
            //this 'optionsMenuShowing' thing might be useless. i'll remove it if i never ever use it.
            screenElement.classList.add('optionsMenuShowing');
            this.screen.classList.remove('hidden');
            this.allowBackCV = allowBack;
            allowBack = false;
            if(f) {
                if(isNaN(fn)) {fn = 0;}
				var ch = this.getChildren();
                if(fn in ch) {
                    ch[fn].focus();
                }
            }
        } else {
            screenElement.classList.remove('optionsMenuShowing');
            this.screen.classList.add('hidden');
            if(typeof(this.allowBackCV) === 'boolean') {allowBack = this.allowBackCV;}
            this.allowBackCV = null;
        }
    }
}

class OptionsMenuWithSideLabel extends OptionsMenu {
	//construstor is the same.
	
	addOption(label, id) {
		var el = super.addOption(label, id),
		lb = document.createElement('div');
		
		lb.className = 'menu-entry-right-text';
	}
	
	updateSideLabel(which, label) {
		var which = this.getChildren()[which];
		if(which) {
			which.getElementsByClassName('menu-entry-right-text')[0].textContent = label;
		}
	}
}

class OptionsMenuMultiSliders extends OptionsMenu {
    constructor(headerLabel) {
        super(headerLabel);
        this.groupName = getRandomClassName();
    }

    addOption(label, id, min, max, step, defVal) {
        var el = super.addOption(label, id),
        ra = document.createElement('input'),
        lb = document.createElement('div');

        ra.className = 'options-menu-range';
        ra.type = 'range';
        ra.min = min;
        ra.max = max;
        ra.step = step || 1;
        if(typeof(defVal) === 'number') {ra.value = defVal}

        lb.className = 'menu-entry-right-text';
        lb.textContent = ra.value;

        el.appendChild(lb);
        el.appendChild(ra);

        return el;
    }

    getInnerElements(which) {
        var te;
        switch(typeof(which)) {
            case 'number':
                te = this.getChildren()[which];
                break;
            case 'string':
                var l = this.getChildren();
                for(var i = 0; i < l.length; i++) {
                    if(l[i].dataset.id === which) {
                        te = l[i];
                        break;
                    }
                }
                break;
            default:
                throw 'please pass number or string to getValue.';
        }

        if(te) {
            return {
                range: te.getElementsByClassName('options-menu-range')[0],
                label: te.getElementsByClassName('menu-entry-right-text')[0]
            };
        } else {
            return null;
        }
    }

    updateValue(incr, which, abs) {
        if(typeof(which) !== 'number') {
            which = actEl().tabIndex;
        }

        var els = this.getInnerElements(which);
        if(els) {
            var r = els.range;
            if(!!abs) {
                r.value = incr;
            } else {
                if(!!incr) {
                    r.stepUp();
                } else {
                    r.stepDown();
                }
            }
            els.label.textContent = r.value;
            return parseFloat(r.value);
        }
        return null;
    }

    getValue(which) {
        var e = this.getInnerElements(which);
        if(e) {e = parseFloat(e.range.value);}
        return e;
    }
}

class OptionsMenuSelectable extends OptionsMenu {
    constructor(headerLabel, type, groupName) {
        super(headerLabel);

        this.validTypes = [
            'radio',
            'checkbox',
            'text',
            'tel'
        ];
    
        this.textTypes = [
            'text',
            'tel'
        ];

        if(!this.changeType(type)) {
            throw TypeError(`Type "${type}" is not valid.`);
        }
        this.inputType = type;
        if(!groupName) {
            groupName = getRandomClassName();
        }
        this.groupName = 'optionsMenuSelectable' + groupName;
    }

    selectItem(n) {
        //n = actEl() tabindex?
        if(this.textTypes.indexOf(this.inputType) === -1) { //not a text-type
            var tc = this.getChildren();
            if(n in tc) {
                var ie = tc[n].children[0];
                switch(this.inputType) {
                    case 'radio':
                        ie.checked = true;
                        break;
                    case 'checkbox':
                        ie.checked = !ie.checked;
                        break;
                }
            }
        }
    }

    getValue() {
		var children = this.getChildren();
		
        if(children.length === 0) {return false;}

        var e,s,
        cb = ()=>{return this.menu.querySelectorAll('input:checked')};

        switch(this.inputType) {
            case 'radio':
                e = cb()[0];
                if(e) {
                    s = e.parentElement.tabIndex;
                } else {
                    e = null;
                    s = null;
                }
                break;
            case 'checkbox':
                e = cb();
                s = [];
                for(var i = 0; i < e.length; i++) {
                    s.push(e[i].parentElement.tabIndex);
                }
                break;
            case 'text':
            case 'tel':
                e = children[0];
                s = e.value;
                break;
        }

        return {
            value: s,
            element: e
        }
    }

    setValue(indiciesOrValue, value) {
        switch(this.inputType) {
            case 'radio':
                this.getChildren()[indiciesOrValue].checked = !!value;
                break;
            case 'checkbox':
                if(
                    Array.isArray(indiciesOrValue) &&
                    Array.isArray(value)
                ) {
                    indiciesOrValue.forEach((menuIndex, arrayIndex)=>{
                        this.menu.children[menuIndex].checked = !!value[arrayIndex];
                    });
                } else {
                    throw TypeError(`both parameters passed to setValue on a checkbox ${OptionsMenuSelectable.name} needs to be an array of indicies.`);
                }
                break;
            case 'text':
            case 'tel':
                this.getChildren()[0].value = indiciesOrValue;
                break;
        }
    }

    checkValidType(t) {
        return this.validTypes.indexOf(t) !== -1;
    }
    checkTextType(t) {
        return this.textTypes.indexOf(t) !== -1;
    }
	
	getChildren() {
		return this.menu.children;
	}

    changeType(ntype) {
        if(this.checkValidType(ntype)) {
            this.clearMenu();
            this.inputType = ntype;
            if(this.checkTextType(ntype)) {
                this.addOption('');
            }
            return true;
        } else {
            return false;
        }
        
    }

    menuViewToggle(v,ft,n) {
        //v = visible? (true/false)
        //ft = focus type. 0 = nah, 1 = manual focus, 2 = focus on selected (depending on type)
        //n = which one to focus to (only works when ft = 1)
        if(v) {
            if(ft === 2) {
                switch(this.inputType) {
                    case 'radio':
                        var selel = this.menu.querySelector('input:checked');
                        if(selel) {
                            n = selel.parentElement.tabIndex;
                        }
                        break;
                    case 'text':
                    case 'tel':
                        focusInput(this.getChildren()[0]);
                        ft = true;
                        break;
                }
            }
        }

        super.menuViewToggle(v,ft,n);
    }

    navigate(d) {
        if(!this.checkTextType(this.inputType)) {
            //is not text type
            super.navigate(d);
        }
    }

    addOption(label, selected) {
        var input = document.createElement('input');
        input.type = this.inputType;

        if(this.checkTextType(this.inputType)) {
            if(this.getChildren().length === 0) {
                input.tabIndex = 0;
				input.classList.add(this.className);
                this.menu.appendChild(input);
                return input;
            } else {
                return null;
            }
        }

        var opt = super.addOption(label);
        
        input.name = this.groupName;
        input.checked = !!selected;

        opt.appendChild(input);

        var inputDisp = document.createElement('span');
        inputDisp.classList.add('vertical-center');
        opt.appendChild(inputDisp);
        return opt;
    }
}

class Tabs {
    constructor(appendToBody, existingContainer) {
        if(existingContainer) {
            this.container = existingContainer;
        } else {
            this.container = document.createElement('div');
        }
        this.container.classList.add('tabstrip-cont');

        this.tabStrip = document.createElement('div');
        this.tabStrip.classList.add('tabstrip');

        this.container.appendChild(this.tabStrip);

        this.tabs = {
            byNumber: [],
            byId: {}
        }

        if(appendToBody) {
            screenElement.appendChild(this.container);
        }

        this.errors = {
            unsupportedType: TypeError('you passed an unsupported type to removeTab(). Expected string or number.')
        }
    }

    addTab(label,id) {
        var ct = document.createElement('div');
        ct.classList.add('tabstrip-tab');
        ct.textContent = label;
        if(!id) {
            var l = true;
            while(id in this.tabs.byId || l) {
                id = Math.random().toString();
                l = false;
            }
        }
        this.tabs.byId[id] = {
            element: ct,
            index: id
        };
        this.tabs.byNumber.push({
            element: ct,
            id: id
        });

        this.tabStrip.appendChild(ct);
    }

    removeTab(id) {
        switch(typeof(id)) {
            case 'string': 
                if(id in this.tabs.byId) {
                    var ct = this.tabs.byId[id], 
                    ix = this.tabs.byId[id].index;
                    ct.element.remove();
                    delete this.tabs.byId[id];
                    this.removeTab(ix);
                }
                break;
            case 'number': 
                if(id in this.tabs.byNumber) {
                    var ri = this.tabs.byNumber.splice(id,1)[0];
                    ri.remove();
                    this.removeTab(ri.id);
                }
                break;
            default: throw this.errors.unsupportedType;
        }
    }

    focusTab(id) {
        this.tabs.byNumber.forEach((t)=>{
            t.element.classList.remove('active');
        });

        var activeTab;

        switch(typeof(id)) {
            case 'string': activeTab = this.tabs.byId; break;
            case 'number': activeTab = this.tabs.byNumber; break;
            default: throw this.errors.unsupportedType;
        }

        activeTab = activeTab[id].element;
        activeTab.classList.add('active');

        this.tabStrip.scrollTo(
            activeTab.offsetLeft + (activeTab.offsetWidth / 2) - 
            (this.tabStrip.offsetWidth / 2)
        ,0);
    }
}

var ScrollHandler = (function(){
	var lt = 0,
	running = false,
	
	scrollers = [],
	
	rm = [],
	
	pxRegex = /^([0-9]+(?:\.[0-9]+))px$/i;
	
	function shf() {
		var now = window.performance.now();
		var dt = (now - lt) / 1000;
		lt = now;
		
		rm.length = 0;
		scrollers.forEach((s,i)=>{
			if(s.kill) {
				rm.push(i);
			} else {
				s.frame(dt);
			}
		});
		if(rm.length !== 0) {
			rm.forEach((rmi,i)=>{
				scrollers.splice(rmi - i, 1);
			});
		}
		requestAnimationFrame(shf);
	}
	
	return class {
		constructor(el, options) {
			if(!running) {
				running = true;
				lt = window.performance.now();
				shf();
			}
			
			if(typeof(options) !== 'object') {
				options = {};
			}
			
			scrollers.push(this);
			
			if(!(el instanceof HTMLElement)) {
				throw 'need to pass an element';
			}
			
			this.element = el;
			
			this.scrollSpeed = options.scrollSpeed || 45;
			this.scrollAmount = 0;
			
			this.frozen = true;
			this.frozenTime = 0;
			this.frozenTimeTarget = (options.freezeTime || 1);
			this.awaitingFreeze = false;
			
			this.computeMargins = !!options.computeMargins;
		}
		
		remove() {this.kill = true;}
		
		reset() {
			this.scrollAmount = 0;
			this.frozen = true;
			this.frozenTime = 0;
			this.moveElement(0);
		}
		
		moveElement(px) {
			this.element.style.transform = `translateX(${px}px)`;
		}
		
		frame(dt) {
			if(this.frozen) {
				var ft = this.frozenTime;

				ft += dt;
				if(ft >= this.frozenTimeTarget) {
					ft = 0;
					this.frozen = false;
					this.awaitingFreeze = false;
				}
				
				this.frozenTime = ft;
			} else {
				var teWidth = this.element.clientWidth,
				tep = this.element.parentElement,
				tepWidth = tep.offsetWidth,
				margin = [0,0];
				if(this.computeMargins) {
					var tepCompStyle = getComputedStyle(tep);
					
					[
						'paddingLeft',
						'paddingRight'
					].forEach((s,i)=>{
						s = tepCompStyle[s].match(pxRegex);
						if(s) {
							margin[i] = parseFloat(s[1]);
						}
					});
				}

				if(teWidth > tepWidth - margin[0] - margin[1]) {
					var sa = this.scrollAmount;
					sa += this.scrollSpeed * dt;

					if(sa > teWidth + margin[0]) {
						sa = -(tepWidth);
						if(this.frozenTimeTarget > 0) {
							this.awaitingFreeze = true;
						}
					}
					
					if(this.awaitingFreeze) {
						if(sa >= 0) {
							sa = 0;
							this.frozen = true;
						}
					}

					this.moveElement(-sa);
					this.scrollAmount = sa;
				}
			}
		}
	}
})();