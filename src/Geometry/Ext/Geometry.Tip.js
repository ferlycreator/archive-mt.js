Z.Geometry.include({
	/*
    * 添加tip
    * @param {Object} options/Z.Tip
    * @export
    */
    'addTip': function (options) {
        if(options instanceof Z.Tip) {
            tip = options;
            tip.options['target'] = this;
            tip.addTo(this.getMap());
        } else {
            options['target'] = this;
            var tip = new Z.Tip(options);
            tip.addTo(this.getMap());
        }
        return this;
    },

    /*
    * 删除tip
    * @param {Object} id or Z.Tip
    * @export
    */
    'removeTip': function (obj) {
        tip = this._getLabel(obj);
        tip.removeTip();
        return this;
    },

    /*
    * 删除tip
    * @param {Object} id or Z.Tip
    * @export
    */
    'hideTip': function(obj) {
        tip = this._getTip(obj);
        tip.hide();
        return this;
    },

    /*
    * 删除tip
    * @param {Object} id or Z.Tip
    * @export
    */
    'showTip': function(obj) {
        tip = this._getTip(obj);
        tip.show();
        return this;
    },

    /*
    * 获取tip
    * @param {String} id
    * @export
    */
    'getTip': function(id) {
        return Z.Tip['getTip'](id);
    },

    _getTip: function(obj) {
        if(!obj) return;
        if(obj instanceof Z.Tip) {
            return obj;
        } else {
            return Z.Tip['getTip'](obj);
        }
    }

});