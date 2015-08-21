Z.Geometry.include({
	/*
    * 添加label
    * @param {Object} options/Z.Label
    * @expose
    */
    addLabel: function (options) {
        if(this.getMap()) {
            this._addLabel(options);
        } else {
            this.on('afterAdd', function() {
                this._addLabel(options);
            });
        }
    },

    _addLabel: function(options) {
        if(options instanceof Z.Label) {
            label = options;
            label.addTo(this);
        } else {
            var label = new Z.Label(options);
            label.addTo(this);
        }
        return this;
    },

    /*
    * 删除label
    * @param {Object} id or Z.Label
    * @expose
    */
    removeLabel: function (obj) {
        label = this._getLabel(obj);
        label.removeLabel();
        return this;
    },

    /*
    * 删除label
    * @param {Object} id or Z.Label
    * @expose
    */
    hideLabel: function(obj) {
        label = this._getLabel(obj);
        label.hide();
        return this;
    },

    /*
    * 删除label
    * @param {Object} id or Z.Label
    * @expose
    */
    showLabel: function(obj) {
        label = this._getLabel(obj);
        label.show();
        return this;
    },

    /*
    * 获取label
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