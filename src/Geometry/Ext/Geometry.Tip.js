Z.Geometry.include({
	/*
    * 添加tip
    * @param {Object} options/Z.Label
    * @expose
    */
    addTip: function (options) {
        if(options instanceof Z.Label) {
            tip = options;
            tip.options['target'] = this;
            tip.addTo(this.getMap());
        } else {
            options['target'] = this;
            var tip = new Z.Label(options);
            tip.addTo(this.getMap());
        }
        return this;
    },

    /*
    * 删除tip
    * @param {Object} id or Z.Label
    * @expose
    */
    removeTip: function (obj) {
        tip = this._getLabel(obj);
        tip.removeTip();
        return this;
    },

    /*
    * 删除tip
    * @param {Object} id or Z.Label
    * @expose
    */
    hideTip: function(obj) {
        tip = this._getTip(obj);
        tip.hide();
        return this;
    },

    /*
    * 删除tip
    * @param {Object} id or Z.Label
    * @expose
    */
    showTip: function(obj) {
        tip = this._getTip(obj);
        tip.show();
        return this;
    },

    /*
    * 获取tip
    * @param {String} id
    * @expose
    */
    getTip: function(id) {
        return Z.Label['getTip'](id);
    },

    _getTip: function(obj) {
        if(!obj) return;
        if(obj instanceof Z.Label) {
            return obj;
        } else {
            return Z.Label['getTip'](obj);
        }
    }

});