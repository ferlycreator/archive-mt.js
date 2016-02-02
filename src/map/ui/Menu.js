/**
 * 菜单控件
 * @class maptalks.Menu
 * @extends maptalks.UIComponent
 * @author Maptalks Team
 */
Z.Menu = Z.UIComponent.extend({

    /**
     * @cfg {Object} options menu属性
     */
    options: {
        'autoPan': false,
        'custom' : false,
        'width'  : 160,
        'style'  : 'default',//black|white
        'position' : null,
        'items'  : []
    },

    /**
     * 初始化Menu
     * @constructor
     * @param {Object} options options:{"items":[], width:240, beforeOpen:fn, position:{coordinate/piexl}}
     * @return {maptalks.Menu}
     * @expose
     */
    initialize: function(options) {
        Z.Util.setOptions(this, options);
    },

    /**
     * 设置菜单项目
     * @param {Array} items 菜单项
     * @return {maptalks.Menu} 菜单
     * @expose
     */
    setItems: function(items) {
        this.options['items'] = items;
        return this;
    },

    /**
     * 获取设置的菜单项
     * @return {[type]} [description]
     */
    getItems:function() {
        return this.options['items'];
    },

    /**
     * get pixel size of menu
     * @return {Size} size
     */
    getSize:function() {
        if (this._size) {
            return this._size.copy();
        } else {
            return null;
        }
    },

    _prepareDOM:function() {
        var container = this._map._panels.tipContainer;
        container.innerHTML = '';
        var dom = this._dom = this._createDOM();
        Z.DomUtil.on(dom, 'mousedown dblclick', Z.DomUtil.stopPropagation);
        dom.style.position = 'absolute';
        dom.style.left = -99999+'px';
        dom.style.top = -99999+'px';
        container.appendChild(dom);
        this._size = new Z.Size(dom.clientWidth+6, dom.clientHeight);
        dom.style.display = "none";
        this._map._contextmenu =  {
            'target' : this
        };
        return dom
    },

    _createDOM:function() {
        if (this.options['custom']) {
            if (Z.Util.isString(this.options['items'])) {
                var container = Z.DomUtil.createEl('div');
                container.innerHTML = this.options['items'];
                return container;
            } else {
                return this.options['items'];
            }
        } else {
            var dom = Z.DomUtil.createEl('div');
            Z.DomUtil.addClass(dom, 'maptalks-menu');
            dom.style.width = this._getWidth()+'px';
            var arrow = Z.DomUtil.createEl('em');
            Z.DomUtil.addClass(arrow, 'maptalks-ico');
            var menuItems = this._createMenuItemDom();
            dom.appendChild(arrow);
            dom.appendChild(menuItems);
            return dom;
        }
    },

    _createMenuItemDom: function() {
        var me = this;
        var ul = Z.DomUtil.createEl('ul');
        Z.DomUtil.addClass(ul,'maptalks-menu-items');
        var items = this.getItems();
        function onMenuClick(index) {
            return function(e) {
                    var result = this._callback({'target':me, 'index':index});
                    if (result === false) {
                        return;
                    }
                    me.hide();
                }
        }
        for (var i=0, len=items.length;i<len;i++) {
            var item = items[i];
            var itemDOM;
            if ('-' === item || '_' === item) {
                itemDOM = Z.DomUtil.createEl('li');
                Z.DomUtil.addClass(itemDOM, 'maptalks-menu-splitter');
            } else {
                itemDOM = Z.DomUtil.createEl('li');
                itemDOM.innerHTML = item['item'];
                itemDOM._callback = item['click'];
                Z.DomUtil.on(itemDOM,'click',(onMenuClick)(i));
            }
            ul.appendChild(itemDOM);
        }
        return ul;
    },

    _getDOM:function() {
        return this._dom;
    },

    _getWidth:function() {
        var defaultWidth = 160;
        var width = this.options['width'];
        if (!width) {
            width = defaultWidth;
        }
        return width;
    },

    //菜单监听地图的事件
    _registerEvents: function() {
        this._map.on('_zoomstart _zoomend _movestart _dblclick _click', this.hide, this);

    },

    //菜单监听地图的事件
    _removeEvents: function() {
        this._map.off('_zoomstart _zoomend _movestart _dblclick _click', this.hide, this);
    },

    //获取菜单显示位置
    _getAnchor: function(coordinate) {
        if (!coordinate) {
            coordinate = this._target.getCenter();
        }
        var anchor = this._map.coordinateToViewPoint(coordinate);
        //offset menu on the top of the arrow
        return anchor.add(new Z.Point(-17, 10));
    }

});


Z.Menu.Handler={
    /**
    * 设置Geometry的菜单
    * @param {Object} options 菜单项 {"items":[], width:240, beforeopen:fn}
    * @member maptalks.Geometry
    * @expose
    */
    setMenu: function(options) {
        this._menuOptions = options;
        if (this._menu) {
            Z.Util.setOptions(this._menu, options);
        } else {
            this.on('contextmenu', this._defaultOpenMenu, this);
        }
        return this;
    },

    _bindMenu: function(options) {
        this._menu = new Z.Menu(options);
        this._menu.addTo(this);

        return this;
    },

    _unbindMenu:function() {
        if (this._menu) {
            this.closeMenu();
            this._menu.remove();
            delete this._menu;
        }
        return this;
    },

     /**
     * 应用没有注册contextmenu事件时, 默认在contextmenu事件时打开右键菜单
     * 如果注册过contextmenu事件, 则不做任何操作
     * @param  {[type]} param [description]
     * @return {[type]}       [description]
     */
    _defaultOpenMenu:function(param) {
        if (this.hasListeners('contextmenu')>1) {
            return;
        } else {
            this.openMenu(param['coordinate']);
        }
    },

    /**
    * 打开geometry菜单
    * @param {maptalks.Coordinate} 坐标
    * @member maptalks.Geometry
    * @expose
    */
    openMenu: function(coordinate) {
        var map = (this instanceof Z.Map)?this:this.getMap();
        if (!this._menu) {
            if (this._menuOptions && map) {
                this._bindMenu(this._menuOptions);
                this._menu.show(coordinate);
            }
        } else {
            this._menu.show(coordinate);
        }
        return this;
    },

    /**
    * 添加菜单项目
    * @param {Array} 菜单项数组
    * @member maptalks.Geometry
    * @expose
    */
    setMenuItems: function(items) {
        if (this._menuOptions) {
            this._menuOptions['items'] = items;
        }
        if (this._menu) {
            this._menu.setItems(items);
        }
        return this;
    },

    /**
     * 获得菜单项
     * @return {[type]} [description]
     */
    getMenuItems:function() {
        if (this._menu) {
            return this._menu.getItems();
        } else {
            return null;
        }
    },

    /**
    * 关闭geometry菜单
    * @member maptalks.Geometry
    * @expose
    */
    closeMenu: function() {
        if(this._menu) {
            this._menu.hide();
        }
        return this;
    },

    /**
     * 移除menu
     */
    removeMenu:function() {
        this.off('contextmenu', this._defaultOpenMenu, this);
        this._unbindMenu();
        delete this._menuOptions;
        return this;
    }

};
