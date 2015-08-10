Z['Button'] = Z.Button = Z.Class.extend({

    options:{
        'icon' : '',
        'text' : '左',
        'click' : null,
        'mouseover' : null,
        'mouseout' : null,
        'children' : []
    },

    initialize: function(options) {
        if(options) {
            this._dom = this._createDom(options);
        }
        return null;
    },

    _createDom : function(options) {
        if(options['type'] === 'button') {
            return this._createButtonDom(options);
        } else if(options['type'] === 'html') {
            return this._createHtmlDom(options);
        } else if(options['type'] === 'menu') {
            return this._createMenuDom(options);
        }
    },

     _createButtonDom : function(options) {
        var _buttonDom = Z.DomUtil.createEl('button');
        Z.DomUtil.on(_buttonDom, 'click dblclick contextmenu', Z.DomUtil.stopPropagation);
        Z.DomUtil.addClass(_buttonDom, 'control-button');
        _buttonDom.innerHTML = this._createIconDom(options);
        if(options['click']) {
            Z.DomUtil.on(_buttonDom, 'click', options['click'], this);
        }
        if(options['mouseover']) {
            Z.DomUtil.on(_buttonDom, 'mouseover', options['mouseover'], this);
        } else {
            Z.DomUtil.on(_buttonDom, 'mouseover', function() {
                Z.DomUtil.removeClass(_buttonDom, 'control-button');
                Z.DomUtil.addClass(_buttonDom, 'control-button-hover');
            }, this);
        }
        if(options['mouseout']) {
            Z.DomUtil.on(_buttonDom, 'mouseout', options['mouseout'], this);
        } else {
            Z.DomUtil.on(_buttonDom, 'mouseout', function() {
                Z.DomUtil.removeClass(_buttonDom, 'control-button-hover');
                Z.DomUtil.addClass(_buttonDom, 'control-button');
            }, this);
        }
        return _buttonDom;
    },

    _createHtmlDom : function(options) {
        var _htmlDom = Z.DomUtil.createEl('span');
        Z.DomUtil.on(_htmlDom, 'click dblclick contextmenu', Z.DomUtil.stopPropagation);
        _htmlDom.innerHTML = options['content'];
        return _htmlDom;
    },

    _createMenuDom : function(options, tag) {
        var _menuDom = Z.DomUtil.createEl('span');
        if(tag) {
            _menuDom = Z.DomUtil.createEl(tag);
        }
        Z.DomUtil.on(_menuDom, 'click dblclick contextmenu', Z.DomUtil.stopPropagation);
        Z.DomUtil.addClass(_menuDom, 'control-button');
        _menuDom.innerHTML = this._createIconDom(options);
        if(options['click']) {
            Z.DomUtil.on(_menuDom, 'click', options['click'], this);
        }
        if(options['mouseover']) {
            Z.DomUtil.on(_menuDom, 'mouseover', options['mouseover'], this);
        } else {
            Z.DomUtil.on(_menuDom, 'mouseover', function() {
                Z.DomUtil.removeClass(_menuDom, 'control-button');
                Z.DomUtil.addClass(_menuDom, 'control-button-hover');
            }, this);
        }
        if(options['mouseout']) {
            Z.DomUtil.on(_menuDom, 'mouseout', options['mouseout'], this);
        } else {
            Z.DomUtil.on(_menuDom, 'mouseout', function() {
                Z.DomUtil.removeClass(_menuDom, 'control-button-hover');
                Z.DomUtil.addClass(_menuDom, 'control-button');
            }, this);
        }
        ///////处理下拉菜单
        if(options['children'] && options['children'].length>0) {
            var dropdownMenu = Z.DomUtil.createElOn('ul', 'display: none;');

            var menuClass = this._getMenuClass(options, tag);
            Z.DomUtil.addClass(dropdownMenu, menuClass);

            var trigger = options['trigger'];
            addMenuDropEvent(trigger, tag);
            function addMenuDropEvent(trigger, tag) {
                if(trigger === 'click') {
                    Z.DomUtil.on(_menuDom, 'click', function() {
                        Z.DomUtil.setStyle(dropdownMenu, 'display: inline-block');
                    }, this);
                    Z.DomUtil.on(dropdownMenu, 'mouseover', function() {
                        Z.DomUtil.setStyle(dropdownMenu, 'display: inline-block');
                    }, this);
                } else {
                    Z.DomUtil.on(_menuDom, 'mouseover', function() {
                        Z.DomUtil.setStyle(dropdownMenu, 'display: inline-block');
                    }, this);
                }
                Z.DomUtil.on(dropdownMenu, 'mouseout', function() {
                    Z.DomUtil.setStyle(dropdownMenu, 'display: none');
                }, this);
                if(tag) {
                    Z.DomUtil.on(_menuDom, 'mouseout', function() {
                        Z.DomUtil.setStyle(dropdownMenu, 'display: none');
                    }, this);
                }
            }
            //构造下拉菜单
            var items = options['children'];
            if(items&&items.length>0) {
                for(var i=0,len=items.length;i<len;i++) {
                    var item = items[i];
                    item['vertical'] = options['vertical'];
                    item['position'] = options['position'];
                    dropdownMenu.appendChild(this._createMenuDom(item, 'li'));
                }
            }
            _menuDom.appendChild(dropdownMenu);
        }
        //////////////
        return _menuDom;
    },

    _createIconDom : function(options) {
        var icon = options['icon'];
        var content = options['content'];
        var html = options['html'];
        if(icon) {
            var imgDom = '<img src='+icon+' border=0 />';
            if(text) {
                if(html) {
                    imgDom = '<img src='+icon+' border=0 />&nbsp;'+content;
                } else {
                    imgDom = '<img src='+icon+' border=0 alt='+content+' />&nbsp;'+content;
                }
            }
            return  imgDom;
        } else {
           return content;
        }
    },

    _getMenuClass: function(options, tag) {
        var className = '';
        var vertical = options['vertical'];
        var position = options['position'];
        if (vertical) {//菜单垂直
            className = this._getClassName(position);
            if(position['bottom']) {
                if(position['right']) {
                    className = 'control-menu-right-up';
                } else if (position['left']){
                    className = 'control-menu-left-up';
                }
            }
        } else {
            if (position['bottom']) {
                if(tag) {
                    className = this._getClassName(position);
                    if(position['right']) {
                        className = 'control-menu-right-up';
                    } else if(position['left']) {
                        className = 'control-menu-left-up';
                    }
                } else {
                    className = 'control-menu-up';
                }
            } else {
                if(tag) {
                    className = this._getClassName(position);
                } else {
                    className = 'control-menu-down';
                }
            }
        }
        return className;
    },

    _getClassName : function(position) {
        if (position['left']) {
            return 'control-menu-right';
        } else if (position['right']) {
            return 'control-menu-left';
        } else {
            return 'control-menu-right';
        }
    },


    getDom: function() {
        return this._dom;
    }

});