/**
 * 菜单控件
 * @class maptalks.Menu
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z['Menu'] = Z.Menu = Z.Class.extend({

    /**
     * @cfg {Object} exceptionDefs 异常信息定义
     */
    exceptionDefs:{
        'en-US':{
            'ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU': 'The menu only can add to  map or geometry.'
        },
        'zh-CN':{
            'ONLY_MAP_OR_GEOMETRY_CAN_ADD_MENU': '只有Map或Geometry对象才能添加菜单。'
        }
    },

    /**
     * @cfg {Object} options menu属性
     */
    options: {
        'width' : 160,
        'style' : 'default',//black|white
        'position' : null,
        'beforeOpen': null,
        'items' : []
    },

    /**
     * 初始化Menu
     * @constructor
     * @param {Object} options options:{"items":[], width:240, beforeOpen:fn, position:{coordinate/piexl}}
     * @return {maptalks.Menu}
     * @expose
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
     * @param {Object} target maptalks.Map|maptalks.Geometry
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
     * @param {Object} param 参数
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
            options.width = 160;
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
    * 返回Map的菜单设置
    * @return {Object} 菜单设置
    * @expose
    */
    getOptions: function() {
        return this.options;
    },

    /**
     * 设置菜单项目
     * @param {Array} items 菜单项
     * @return {maptalks.Menu} 菜单
     * @expose
     */
    setItems: function(items) {
        var options = this.getOptions() || this.options;
        options.items = items;
        this._menuDom = this._createMenuDom();
        if(this._map) {
            var popMenuContainer = this._map._panels.popMenuContainer;
            popMenuContainer.innerHTML = '';
            popMenuContainer.appendChild(this._menuDom);
        }
        return this;
    },

    /**
     * 关闭Map的右键菜单
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
                this._target.fire('closemenu');
            }
        }
    },

    /**
     *  判断菜单是否打开
     *  @returns {Boolean}
     *  @expose
     */
    isOpen: function() {
        return (this._menuDom.style.display!='none');
    },

    /**
     * 显示菜单
     * @param {maptalks.Coordinate} 坐标
     * @expose
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
        Z.DomUtil.setClass(menuContainer, 'maptalks-menu');
        Z.DomUtil.addClass(menuContainer, 'maptalks-menu-color'+suffix);
        this._menuItemsDom = this._createMenuItemDom();
        menuContainer.appendChild(this._menuItemsDom);
        return menuContainer;
    },

    _createMenuItemDom: function() {
        var menuItemsDom = Z.DomUtil.createElOn('ul', 'list-style: none;padding: 0px;margin: 0px;');
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
        Z.DomUtil.setClass(menuItem, 'maptalks-menu-item');
        Z.DomUtil.addClass(menuItem, 'maptalks-menu-item-color'+suffix);

        Z.DomUtil.on(menuItem,'mouseover',function(e){
            Z.DomUtil.removeClass(menuItem, 'maptalks-menu-item-color'+suffix);
            Z.DomUtil.addClass(menuItem, 'maptalks-menu-item-over-color'+suffix);
        });
        Z.DomUtil.on(menuItem,'mouseout',function(e){
            Z.DomUtil.removeClass(menuItem, 'maptalks-menu-item-over-color'+suffix);
            Z.DomUtil.addClass(menuItem, 'maptalks-menu-item-color'+suffix);
        });
        menuItem.callback = item.callback;
        var me = this;
        Z.DomUtil.on(menuItem,'click',function(e) {
            Z.DomUtil.stopPropagation(e);
            var result = this.callback({'target':me});
            if (!Z.Util.isNil(result) && !result) {
                return;
            }
            me.hide();
        });
        Z.DomUtil.on (menuItem,'mousedown mouseup dblclick',function(e) {
            Z.DomUtil.stopPropagation(e);
            return false;
        });
        menuItem.innerHTML = item.item;
        return menuItem;
    },

    //菜单监听地图的事件
    _addEvent: function() {
        if(!this._menuDom.addEvent) {
            this.hide();
            this._removeEvent();
            this._map.on('zoomstart', this.hide, this);
            this._map.on('zoomend', this.hide, this);
            this._map.on('movestart', this.hide, this);
            this._map.on('dblclick', this.hide, this);
            this._menuDom.addEvent = true;
            if (this._target.hasListeners && this._target.hasListeners('openmenu')) {
                /**
                 * 触发Menu的openmenu事件
                 * @event openmenu
                 * @return {Object} params: {'target':this}
                 */
                this._target.fire('openmenu');
            }
        }
    },

    //菜单监听地图的事件
    _removeEvent: function() {
        this._map.off('zoomstart', this.hide);
        this._map.off('zoomend', this.hide);
        this._map.off('movestart', this.hide);
        this._map.off('dblclick', this.hide);
    },

    //清理之前的事件，重新绑定新的事件
    _clearDomAndBindEvent: function() {
        Z.DomUtil.removeDomNode(this._menuDom);
        this._addEvent();
    },

    //获取菜单显示位置
    _getShowPosition: function(coordinate) {
        var position;
        if(!coordinate) {
            coordinate = this.options['position'];
        }
        if(coordinate){
            if(coordinate instanceof Z.Coordinate) {
                position = this._map.coordinateToViewPoint(coordinate);
            } else {
                position = coordinate;
            }
        } else {
            var center = this._target.getCenter();
            position = this._map.coordinateToViewPoint(center);
        }
        return position;
    }

});
