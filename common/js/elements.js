var navbar;

(()=>{
    //navbar
    var nv = document.createElement('div');
    nv.id = 'navbar';
    ['left','center','right'].forEach((idn)=>{
        var e = document.createElement('div');
        e.id = 'navbar-' + idn;
        e.classList.add(
            'vertical-center'
        );
        nv.appendChild(e)
    });
    screenElement.appendChild(nv);
    navbar = {
        "myself": eid('navbar'),
        "left": eid('navbar-left'),
        "right": eid('navbar-right'),
        "center": eid('navbar-center')
    };

    //alertmessage
    var am = document.createElement('div');
    am.id = 'alertMessage';
    screenElement.appendChild(am);
})();