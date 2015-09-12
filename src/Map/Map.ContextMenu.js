Z.Map.include({
   /**
    * 设置Map的右键菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @expose
    */
    setContextMenu: function(menuOption) {
        this._menu = new Z.Menu(menuOption);
        this._menu.addTo(this);
        this.on('contextmenu', this._beforeOpenContextMenu, this);
        return this;
    },

   /**
    * 菜单打开前
    * @param {Event} event 鼠标右击事件
    */
    _beforeOpenContextMenu: function(event) {
        var pixel = Z.DomUtil.getEventDomCoordinate(event, this._containerDOM);
        var coordinate = this.screenPointToCoordinate(pixel);
        var position = this.coordinateToDomOffset(coordinate);
        var param = {'coordinate':coordinate, 'pixel':position};
        var menuOptions = this._menu.getOptions();
        menuOptions.position = position;
        this._menu.setOptions(menuOptions);
        var beforeOpenFn = menuOptions.beforeOpen;
        if(beforeOpenFn) {
            this._menu.beforeOpen(param);
        } else {
            this.openMenu();
        }
        return this;
    },

    /**
    * 打开Map右键菜单
    * @param {Coordinate} 坐标
    * @expose
    */
    openMenu: function(coordinate) {
        if (this._menu)  {
            this._menu.show(coordinate);
        }
        return this;
    },

   /**
    * 添加菜单项目
    * @param {Array} 菜单项数组
    * @expose
    */
    setMenuItem: function(items) {
        if (this._menu) {
            this._menu.setItems(items);
        }
        return this;
    },

    /**
    * 关闭右键菜单
    * @expose
    */
    closeMenu: function() {
        if (this._menu) {
            this._menu.close();
        }
    }
});