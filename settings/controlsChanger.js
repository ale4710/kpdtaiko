var gotoControlsChanger = (function(){
	let mainPageN;
	let fh = new PreviousFocusHandler();
	let lallowBack;
	
	addGlobalReference(1, 'controlsChanger');
	
	//controls
	let controlsLSkey = 'user-controls';
	//	okay actually controls
	let controls = {};
	function loadControls() {
		controls = {};
		let lc = JSON.parse(localStorage.getItem(controlsLSkey));
		Object.keys(lc).forEach((action)=>{
			lc[action].forEach((key)=>{
				controls[key] = action;
			});
		});
	}
	function saveControls() {
		let data = {};
		Object.keys(controls).forEach((key)=>{
			let action = controls[key];
			let kl = data[action] || [];
			kl.push(key);
			data[action] = kl;
		});
		localStorage.setItem(controlsLSkey, JSON.stringify(data));
	}
	//	init
	if(localStorage.getItem(controlsLSkey)) {
		loadControls();
	} else {
		localStorage.setItem(controlsLSkey, JSON.stringify({
			don: [4, 6],
			kat: [1, 3]
		}));
	}
	
	//assign button to... dialog
	let gotoAssignBtnToDialog = (function(){
		let dialogElement = eid('controls-changer-assign-button-container');
		let menu = new Menu(dialogElement);
		let buttonPressed;
		[
			{l: 'Don', id: 'don'},
			{l: 'Kat', id: 'kat'},
			{l: '(Unassign)', id: 'none'}
		].forEach((opt)=>{menu.addOption(opt.l,opt.id);});
		
		let thisPage = addPage(
			(function gabtdK(k){
				switch(k.key) {
					case 'ArrowUp':
						var u = -1;
					case 'ArrowDown': 
						menu.navigate(u || 1); 
						k.preventDefault();
						break;
					case 'Enter':
						let action = actEl().dataset.id;
						if(action === 'none') {
							delete controls[buttonPressed];
						} else {
							controls[buttonPressed] = action;
						}
						saveControls();
						updateButtonsDisplay();
						//dont break
					case 'SoftLeft':
					case 'Backspace':
						//exit
						dialogElement.classList.add('hidden');
						curpage = mainPageN;
						break;
				}
			}),
			(function gabtdN(){
				return ['Cancel', 'Assign'];
			})
		);
		
		return function show(btn) {
			buttonPressed = parseInt(btn);
			eid('controls-changer-assign-button-button').textContent = buttonPressed;
			dialogElement.classList.remove('hidden');
			curpage = thisPage;
			menu.navigate(0, true);
		}
	})();
	
	//main dialog
	//	init
	let buttonsTableElement = document.createElement('table');
	buttonsTableElement.id = 'controls-changer-buttons-table';
	eid('controls-changer-buttons-table-container').appendChild(buttonsTableElement);
	//	populate display
	let buttonsElementsList = {};
	for(let row = 0; row < 3; row++) {
		let rowElement = document.createElement('tr');
		buttonsTableElement.appendChild(rowElement);
		for(let col = 0; col < 3; col++) {
			let buttonElement = document.createElement('div');
			let button = (row * 3) + col + 1;
			
			buttonsElementsList[button] = buttonElement;
			
			buttonElement.textContent = button;
			buttonElement.classList.add('keypad-button');
			
			let cell = document.createElement('td');
			cell.appendChild(buttonElement);
			rowElement.appendChild(cell);
		}
	}
	
	function updateButtonsDisplay() {
		for(let button = 1; button < 10; button++) {
			let buttonElement = buttonsElementsList[button];
			buttonElement.classList.remove('don', 'kat');
			
			let action = controls[button];
			if(action) {
				buttonElement.classList.add(action);
			}
		}
	}
	
	function show() {
		fh.save();
		lallowBack = allowBack;
		eid('controls-changer-page-container').classList.remove('hidden');
		eid('main').classList.add('hidden');
		
		curpage = mainPageN;
		
		updateButtonsDisplay();
	}
	
	function hide() {
		eid('controls-changer-page-container').classList.add('hidden');
		eid('main').classList.remove('hidden');
		
		allowBack = lallowBack;
		fh.loadpage();
		fh.refocus();
		fh.clear();
	}
	
	mainPageN = addPage(
		(function controlsChangerK(k) {
			if(k.key.match(/^[1-9]$/)) {
				gotoAssignBtnToDialog(k.key);
			} else {
				switch(k.key) {
					case 'Backspace':
					case 'SoftLeft':
						hide();
						break;
				}
			}
		}),
		(function controlsChangerN() {
			return ['Back'];
		})
	);
	
	return show;
})();