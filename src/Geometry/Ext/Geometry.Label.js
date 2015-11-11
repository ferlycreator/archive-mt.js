Z.Geometry.include({
	/*
    * 添加label
    * @param {Object} options
    * @member maptalks.Geometry
    * @expose
    */
    addLabel: function (label) {
        if(this.getMap()) {
            this._addLabel(label);
        } else {
            this.on('addend', function() {
                this._addLabel(label);
            },this);
        }
    },

    _addLabel: function(label) {
        label.addTo(this);
        if(!this._labels) {
            this._labels = [];
        }
        this._labels.push(label);
        return this;
    },

    /**
     * 获取label
     * @member maptalks.Geometry
     * @expose
     */
    getAllLabel: function () {
        return this._labels;
    },

    /**
     * 删除label
     * @param {maptalks.Label} label
     * @member maptalks.Geometry
     * @expose
     */
    removeLabel: function (label) {
        var labels = this.getAllLabel();
        var index = 0;
        for(var i=0,len=labels.length;i<len;i++) {
            if(!label) {
                labels[0].remove();
                labels.splice(0,1);
            } else {
                if(label === labels[i]) {
                    label.remove();
                    labels.splice(i,1);
                }
                index++;
            }
        }
        return this;
    },

    /**
     * 删除label
     * @param {maptalks.Label} label
     * @member maptalks.Geometry
     * @expose
     */
    hideLabel: function(label) {
        if(!label) {
            var labels = this.getAllLabel();
            for(var i=0,len=labels.length;i<len;i++) {
                labels[i].hide();
            }
        } else {
            label.hide();
        }
        return this;
    },

    /**
     * 删除label
     * @param {maptalks.Label} label
     * @member maptalks.Geometry
     * @expose
     */
    showLabel: function(label) {
        if(!label) {
            var labels = this.getAllLabel();
            for(var i=0,len=labels.length;i<len;i++) {
                labels[i].show();
            }
        } else {
            label.show();
        }
        return this;
    }

});
