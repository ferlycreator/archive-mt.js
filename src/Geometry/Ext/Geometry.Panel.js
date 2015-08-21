Z.Geometry.include({
	/*
    * 添加标签
    * @param {Object} options/Z.Panel
    * @expose
    */
    addPanel: function (options) {
        if(options instanceof Z.Panel) {
            label = options;
            label.options['target'] = this;
            label.addTo(this.getMap());
        } else {
            options['target'] = this;
            var label = new Z.Panel(options);
            label.addTo(this.getMap());
        }
        return this;
    },

    /*
    * 删除标签
    * @param {Object} id or Z.Panel
    * @expose
    */
    removePanel: function (obj) {
        label = this._getPanel(obj);
        label.removeLable();
        return this;
    },

    /*
    * 删除标签
    * @param {Object} id or Z.Panel
    * @expose
    */
    hidePanel: function(obj) {
        label = this._getPanel(obj);
        label.hide();
        return this;
    },

    /*
    * 删除标签
    * @param {Object} id or Z.Panel
    * @expose
    */
    showPanel: function(obj) {
        label = this._getPanel(obj);
        label.show();
        return this;
    },

    /*
    * 获取标签
    * @param {String} id
    * @expose
    */
    getPanel: function(id) {
        return Z.Panel.getPanel(id);
    },

    _getPanel: function(obj) {
        if(!obj) return;
        if(obj instanceof Z.Panel) {
            return obj;
        } else {
            return Z.Panel.getPanel(obj);
        }
    }

});