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
    * @param {Z.Panel} panel
    * @expose
    */
    removePanel: function (panel) {
        panel.removePanel();
        return this;
    },

    /*
    * 删除面板
    * @param {Z.Panel} panel
    * @expose
    */
    hidePanel: function(panel) {
        panel.hide();
        return this;
    },

    /*
    * 删除面板
    * @param {Z.Panel} panel
    * @expose
    */
    showPanel: function(panel) {
        panel.show();
        return this;
    }

});