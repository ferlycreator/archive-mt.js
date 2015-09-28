Z.Geometry.include({
	/*
    * 添加label
    * @param {Object} options or {@link maptalks.Label}
    * @member maptalks.Geometry
    * @expose
    */
    addLabel: function (options) {
        if(this.getMap()) {
            this._addLabel(options);
        } else {
            this.on('addend', function() {
                this._addLabel(options);
            });
        }
    },

    _addLabel: function(options) {
        var label;
        if(options instanceof Z.Label) {
            label = options;
            label.addTo(this);
        } else {
            label = new Z.Label(options);
            label.addTo(this);
        }

        var linkerOptions = {
            linkSource:this,
            linkTarget:label,
            trigger: 'click',
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
    * 删除label
    * @param {maptalks.Label} label
    * @member maptalks.Geometry
    * @expose
    */
    removeLabel: function (label) {
        label.removeLabel();
        return this;
    },

    /*
    * 删除label
    * @param {maptalks.Label} label
    * @member maptalks.Geometry
    * @expose
    */
    hideLabel: function(label) {
        label.hide();
        return this;
    },

    /*
    * 删除label
    * @param {maptalks.Label} label
    * @member maptalks.Geometry
    * @expose
    */
    showLabel: function(label) {
        label.show();
        return this;
    }

});
