Z.Map.include({
   /**
    * 设置Map的右键菜单
    * @param {Object} menuOption 菜单项 {"items":[], width:240, beforeopen:fn}
    * @member maptalks.Map
    * @expose
    */
    setContextMenu: function(menuOption) {
        this._menu = new Z.Menu(menuOption);
        this._menu.addTo(this);
        this.on('contextmenu', this._beforeOpenContextMenu, this);
        return this;
    },

    //菜单打开前
    _beforeOpenContextMenu: function(event) {
        var pixel = Z.DomUtil.getEventContainerPoint(event, this._containerDOM);
        var coordinate = this.containerPointToCoordinate(pixel);
        var position = this.coordinateToViewPoint(coordinate);
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
    * @param {maptalks.Coordinate} 坐标
    * @member maptalks.Map
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
    * @member maptalks.Map
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
    * @member maptalks.Map
    * @expose
    */
    closeMenu: function() {
        if (this._menu) {
            this._menu.close();
        }
    }
});