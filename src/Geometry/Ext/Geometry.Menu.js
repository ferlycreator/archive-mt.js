Z.Geometry.include({
    /**
    * 设置Geometry的菜单
    * @param {Object} options 菜单项 {"items":[], width:240, beforeopen:fn}
    * @member maptalks.Geometry
    * @expose
    */
    setMenu: function(options) {
        if(this.getMap()) {
            this._bindMenu(options);
        } else {
            this.on('addend', function() {
                this._bindMenu(options);
            });
        }
        this.on('rightclick', this._defaultOpenMenu, this);
        return this;
    },

    _bindMenu: function(options) {
        this.map = this.getMap();
        this._menu = new Z.Menu(options);
        this._menu.addTo(this);
        /*var beforeopenFn = options['beforeopen'];
        if(beforeopenFn) {
            this._beforeOpenMenu();
        }*/
        return this;
    },

     /**
     * 应用没有注册contextmenu事件时, 默认在contextmenu事件时打开右键菜单
     * 如果注册过contextmenu事件, 则不做任何操作
     * @param  {[type]} param [description]
     * @return {[type]}       [description]
     */
    _defaultOpenMenu:function(param) {
        if (this.hasListeners('rightclick')>1) {
            return;
        } else {
            this.openMenu(param);
        }
    },

    /**
    * 菜单打开前
    */
    /*_beforeOpenMenu: function() {
        var coordinate = this.getCenter();
        var position = this.map.coordinateToViewPoint(coordinate);
        var param = {'coordinate':coordinate, 'pixel':position};
        this._menu.showPosition = position;
        this._menu.beforeOpen(param);
        return this;
    },*/

    /**
    * 打开geometry菜单
    * @param {maptalks.Coordinate} 坐标
    * @member maptalks.Geometry
    * @expose
    */
    openMenu: function(coordinate) {
        if (this._menu) {
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
        if (this._menu) {
            this._menu.setItems(items);
        }
        return this;
    },

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
            this._menu.close();
        }
        return this;
    }
});
