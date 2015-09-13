/**
* 菜单类
*/
Z['Menu'] = Z.Menu = Z.Class.extend({
    /**
    * 异常信息定义
    */
    exceptionDefs:{
        'en-US':{
            'ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU': 'The menu only can add to  map or geometry.'
        },
        'zh-CN':{
            'ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU': '只有Map或Geometry对象才能添加菜单。'
        }
    },

    options: {
        'width' : 160,
        'style' : 'default',//black|white
        'position' : null,
        'beforeOpen': null,
        'items' : []
    },

    /**
    * 初始化Menu
    * @param {Json} options
    * options:{"items":[], width:240, beforeOpen:fn, position:{coordinate/piexl}}
    * @return {Menu} menu
    */
    initialize: function(options) {
        if(options) {
            this.setOptions(options);
        }
        this._menuDom = this._createMenuDom();
        return this;
    },

    /**
    * 将菜单添加到目标对象上
    * @param {Object} map/geometry
    * @expose
    */
    addTo: function(target) {
        if(target instanceof Z.Map) {
            this._map = target;
        } else { //Geometry的情况
            this._map = target.getMap();
        }
        if(!this._map) {
            throw new Error(this.exceptions['ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU']);
        }
        this._target = target;
        var popMenuContainer = this._map._panels.popMenuContainer;
        popMenuContainer.innerHTML = '';
        popMenuContainer.appendChild(this._menuDom);

        this._addEvent();
        return this;
    },

    /**
    * 显示菜单前
    * @param 参数
    */
    beforeOpen: function(param) {
        var beforeOpenFn = this.options.beforeOpen;
        if(beforeOpenFn){
            var argLen = beforeOpenFn.length;
            if(argLen === 2) {
                beforeOpenFn(param, Z.Util.bind(this.show, this));
            } else {
                beforeOpenFn(param);
                this.show();
            }
        }
        return this;
    },

    /**
    * 设置Map的右键菜单
    * @param {Array} options 菜单项
    * @expose
    */
    setOptions: function(options) {
        if (!options) {
            return;
        }
        if (!options.width) {
            options.width = 240;
        }
        if(!options.style||options.style === 'default') {
            options.style = '';
        } else {
            options.style = '-' + options.style;
        }
        if(this.options) {
            this.options.width = options.width;
            this.options.style = options.style;
            this.options.items = options.items;
            if(options.beforeOpen) {
                this.options.beforeOpen = options.beforeOpen;
            }
        } else {
            this.options = options;
        }
    },

    /**
    * 设置菜单项目
    * @param {Array} items 菜单项
    * @return {Menu} 菜单
    * @expose
    */
    setItems: function(items) {
        this.options = this.options || {};
        this.options['items'] = items;
        var isOpen = this.isOpen();
        Z.DomUtil.removeDomNode(this._menuDom);
        this._menuDom = this._createMenuDom();
        var popMenuContainer = this._map._panels.popMenuContainer;
        popMenuContainer.innerHTML = '';
        popMenuContainer.appendChild(this._menuDom);
        this.addTo(this._target);
        if(isOpen) {
            this.show();
        }
        return this;
    },

   /**
    * 返回Map的菜单设置
    * @return {Object} 菜单设置
    * @expose
    */
    getOptions: function() {
        return this.options;
    },

    /**
     * 关闭Map的右键菜单
     * @return {[type]} [description]
     * @expose
     */
    close: function() {
        return this.hide();
    },

    /**
     * 移除Map的右键菜单设置
     * @expose
     */
    remove: function() {
        this.hide();
        delete this.options;
        return this;
    },

    /**
    * 隐藏菜单
    * @expose
    */
    hide: function() {
        if (this.isOpen()) {
            this._menuDom.style.display='none';
            if (this._target.hasListeners && this._target.hasListeners('closemenu')) {
                this._target._executeListeners('closemenu', {'target':this._target});
            }
        }
    },

    /**
    *  判断菜单是否打开
    *  @expose
    *  @returns {Boolean}
    */
    isOpen: function() {
        return (this._menuDom.style.display!='none');
    },

    /**
    * 显示菜单
    * @expose
    * @param {Coordinate} 坐标
    */
    show: function(coordinate) {
        var options = this.options;
        var pxCoord = this._getShowPosition(coordinate);
        if (Z.Util.isNil(pxCoord) || Z.Util.isNil(options)) {
            return this;
        }
        this._menuDom.style.top = pxCoord.top+'px';
        this._menuDom.style.left = pxCoord.left+'px';
        this._menuDom.style.display = 'block';
        return this;
    },

    _createMenuDom: function() {
        var menuContainer = Z.DomUtil.createEl('div');
        menuContainer.style.display = 'none';
        menuContainer.style.width = this.options.width+'px';
        var suffix = this.options.style;
        Z.DomUtil.setClass(menuContainer, 'maptalks-menu'+suffix);
        this._menuItemsDom = this._createMenuItemDom();
        menuContainer.appendChild(this._menuItemsDom);
        return menuContainer;
    },

    _createMenuItemDom: function() {
        var menuItemsDom = Z.DomUtil.createEl('ul');
        var suffix = this.options.style;
        Z.DomUtil.setClass(menuItemsDom, 'maptalks-menu-items'+suffix);
        var items = this.options.items;
        for (var i=0, len=items.length;i<len;i++) {
            var item = items[i];
            var menuItem = this._addMenuItem(item);
            menuItemsDom.appendChild(menuItem);
        }
        return menuItemsDom;
    },

    _addMenuItem: function(item) {
        var suffix = this.options.style;
        var menuItem = Z.DomUtil.createEl('li');
        Z.DomUtil.setClass(menuItem, 'maptalks-menu-item'+suffix);

        Z.DomUtil.on(menuItem,'mouseover',function(e){
            Z.DomUtil.setClass(menuItem, 'maptalks-menu-item-over'+suffix);
        });
        Z.DomUtil.on(menuItem,'mouseout',function(e){
            Z.DomUtil.setClass(menuItem, 'maptalks-menu-item'+suffix);
        });
        menuItem['callback'] = item['callback'];
        Z.DomUtil.on(menuItem,'click',function(e) {
            Z.DomUtil.stopPropagation(e);
            var result = this['callback']({'target':this,'index':this['index']});
            if (!Z.Util.isNil(result) && !result) {
                return;
            }
            this.hide();
        });
        Z.DomUtil.on (menuItem,'mousedown mouseup dblclick',function(e) {
            Z.DomUtil.stopPropagation(e);
            return false;
        });
        menuItem.innerHTML = item['item'];
        return menuItem;
    },

    /**
    * 菜单监听地图的事件
    */
    _addEvent: function() {
        if(!this._menuDom.addEvent) {
            this.close();
            this._removeEvent();
            this._map.on('zoomstart', this.hide, this);
            this._map.on('zoomend', this.hide, this);
            this._map.on('movestart', this.hide, this);
            this._map.on('dblclick', this.hide, this);
            this._menuDom.addEvent = true;
            if (this._target.hasListeners && this._target.hasListeners('openmenu')) {
                this._target.fire('openmenu', {'target':this._target});
            }
        }
    },

    /**
    * 菜单监听地图的事件
    * @param {Map} map
    */
    _removeEvent: function() {
        this._map.off('zoomstart', this.hide);
        this._map.off('zoomend', this.hide);
        this._map.off('movestart', this.hide);
        this._map.off('dblclick', this.hide);
    },

    /**
    * 清理之前的事件，重新绑定新的事件
    */
    _clearDomAndBindEvent: function() {
        Z.DomUtil.removeDomNode(this._menuDom);
        this._addEvent();
    },

    /**
    * 获取菜单显示位置
    * @param {Coordinate} 菜单显示位置
    * @return {Pixel} 菜单显示位置像素坐标
    */
    _getShowPosition: function(coordinate) {
        var position;
        if(!coordinate) {
            coordinate = this.options['position'];
        }
        if(coordinate){
            if(coordinate instanceof Z.Coordinate) {
                position = this._map.coordinateToDomOffset(coordinate);
            } else {
                position = coordinate;
            }
        } else {
            var center = this._target.getCenter();
            position = this._map.coordinateToDomOffset(center);
        }
        return position;
    }

});
