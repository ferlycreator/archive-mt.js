Z.Geometry.include({
	/*
    * 添加面板
    * @param {Object} options or {@link maptalks.Panel}
    * @member maptalks.Geometry
    * @expose
    */
    addPanel: function (options) {
        if(this.getMap()) {
            this._addPanel(options);
        } else {
            this.on('addend', function() {
                this._addPanel(options);
            });
        }
        return this;
    },

    _addPanel: function(options) {
        var panel;
        if(options instanceof Z.Panel) {
            panel = options;
            panel.addTo(this.getMap());
        } else {
            panel = new Z.Panel(options);
            panel.addTo(this.getMap());
        }
        var linkerOptions = {
            linkSource:this,
            linkTarget:panel,
            trigger: 'manual',
            symbol:{
                'line-color' : '#474cf8',
                'line-width' : 1,
                'line-dasharray' : null,
                'line-opacity' : 1
            }
        };
        var linker = new Z.Linker(linkerOptions);
        linker.addTo(this.getMap());
        return this;
    },

    /*
    * 删除面板
    * @param {maptalks.Panel} panel
    * @member maptalks.Geometry
    * @expose
    */
    removePanel: function (panel) {
        panel.removePanel();
        return this;
    },

    /*
    * 删除面板
    * @param {maptalks.Panel} panel
    * @member maptalks.Geometry
    * @expose
    */
    hidePanel: function(panel) {
        panel.hide();
        return this;
    },

    /*
    * 删除面板
    * @param {maptalks.Panel} panel
    * @member maptalks.Geometry
    * @expose
    */
    showPanel: function(panel) {
        panel.show();
        return this;
    }

});
