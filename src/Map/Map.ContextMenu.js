Z.Map.include({
   /**
    * 设置Map的右键菜单
    * @param {Array} menuOption 菜单项
    * {"items":[], width:240, beforeopen:fn}
    * @expose
    */
    setContextMenu: function(menuOption) {
        this.on('contextmenu', this._beforeOpenContextMenu, this);
        this.menu = new Z.Menu(menuOption);
        this.menu.addTo(this);
        return this;
    },

   /**
    * 菜单打开前
    * @param {Event} event 鼠标右击事件
    */
    _beforeOpenContextMenu: function(event) {
        var pixel = Z.DomUtil.getEventDomCoordinate(event, this._containerDOM);
        var coordinate = this.screenPointToCoordinate(pixel);
        var position = this.coordinateToScreenPoint(coordinate);
        var param = {'coordinate':coordinate, 'pixel':position};
        this.menu.showPosition = position;
        var beforeopenFn = this.menu.menuOption['beforeopen'];
        if(beforeopenFn) {
            this.menu.beforeOpen(param);
        }
        return this;
    },

    /**
    * 打开Map右键菜单
    * @param {Coordinate} 坐标
    * @expose
    */
    openMenu: function(coordinate) {
        if(!coordinate) {
            coordinate = this.showPostion;
        }
        if (this.menu)  {
            this.menu.showMenu(coordinate);
        }
        return this;
    },

   /**
    * 添加菜单项目
    * @param {Array} 菜单项数组
    * @expose
    */
    setMenuItem: function(items) {
        if (this.menu) {
            this.menu.setItems(items);
        }
        return this;
    },

    /**
    * 关闭右键菜单
    * @expose
    */
    closeMenu: function() {
        if (this.menu) {
            this.menu.close();
        }
    }
});