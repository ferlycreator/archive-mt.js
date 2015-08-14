Z.Geometry.include({
	/*
    * 添加标签
    * @param {Object} options/Z.Label
    * @expose
    */
    addLabel: function (options) {
        if(options instanceof Z.Label) {
            label = options;
            label.options['target'] = this;
            label.addTo(this.getMap());
        } else {
            options['target'] = this;
            var label = new Z.Label(options);
            label.addTo(this.getMap());
        }
        return this;
    },

    /*
    * 删除标签
    * @param {Object} id or Z.Label
    * @expose
    */
    removeLabel: function (obj) {
        label = this._getLabel(obj);
        label.removeLable();
        return this;
    },

    /*
    * 删除标签
    * @param {Object} id or Z.Label
    * @expose
    */
    hideLabel: function(obj) {
        label = this._getLabel(obj);
        label.hide();
        return this;
    },

    /*
    * 删除标签
    * @param {Object} id or Z.Label
    * @expose
    */
    showLabel: function(obj) {
        label = this._getLabel(obj);
        label.show();
        return this;
    },

    /*
    * 获取标签
    * @param {String} id
    * @expose
    */
    getLabel: function(id) {
        return Z.Label['getLabel'](id);
    },

    _getLabel: function(obj) {
        if(!obj) return;
        if(obj instanceof Z.Label) {
            return obj;
        } else {
            return Z.Label['getLabel'](obj);
        }
    }

});