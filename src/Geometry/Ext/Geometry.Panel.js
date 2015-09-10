Z.Geometry.include({
	/*
    * 添加面板
    * @param {Object} options/Z.Panel
    * @expose
    */
    addPanel: function (options) {
        if(this.getMap()) {
            this._addPanel(options);
        } else {
            this.on('afterAdd', function() {
                this._addPanel(options);
            });
        }
        return this;
    },

    _addPanel: function(options) {
        if(options instanceof Z.Panel) {
            var panel = options;
            panel.options['target'] = this;
            panel.addTo(this.getMap());
        } else {
            options['target'] = this;
            var panel = new Z.Panel(options);
            panel.addTo(this.getMap());
        }
        return this;
    },

    /*
    * 删除面板
    * @param {Object} id or Z.Panel
    * @expose
    */
    removePanel: function (obj) {
        panel = this.getPanel(obj);
        panel.removeLable();
        return this;
    },

    /*
    * 删除面板
    * @param {Object} id or Z.Panel
    * @expose
    */
    hidePanel: function(obj) {
        panel = this.getPanel(obj);
        panel.hide();
        return this;
    },

    /*
    * 删除面板
    * @param {Object} id or Z.Panel
    * @expose
    */
    showPanel: function(obj) {
        panel = this.getPanel(obj);
        panel.show();
        return this;
    },

    /*
    * 获取panel
    * @param {Object} id or Z.Panel
    * @expose
    */
    getPanel: function(obj) {
        if(!obj) return;
        if(obj instanceof Z.Panel) {
            return obj;
        } else {
            return Z.Panel.getPanel(this.getMap(), obj);
        }
    }

});