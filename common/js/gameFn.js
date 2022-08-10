var getDifficultySortNumber = (function(){
    var diffSearchNames = [
        //most difficult
        ['inner', 'ura', 'edit', 'hell'],
        //insanae
        ['insane', 'oni'],
        //hard
        ['muzukashii', 'hard'],
        //normal
        ['futsuu', 'medium', 'normal'],
        //easy
        ['kantan', 'easy']
    ];

    return function(difficulty) {
        if(typeof(difficulty) === 'string') {
            for(var dif = 0; dif < diffSearchNames.length; dif++) {
                var cdif = diffSearchNames[dif],
                cdifrv = diffSearchNames.length - 1 - dif;
                for(var i = 0; i < cdif.length; i++) {
                    var curSearch = cdif[i];
                    if(curSearch instanceof RegExp) {
                        if(difficulty.match(curSearch)) {
                            return cdifrv;
                        }
                    } else if(typeof(curSearch) === 'string') {
                        if(difficulty.toLowerCase().indexOf(curSearch) !== -1) {
                            return cdifrv;
                        }
                    }
                }
            }
            return diffSearchNames.length;
        } else {
            throw TypeError('Difficulty needs to be a string.');
        }
    };
})();