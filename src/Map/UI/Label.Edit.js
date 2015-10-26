Z.Label.include({
    /**
     * 开始编辑Label
     * @member maptalks.Label
     * @expose
     */
    startEdit: function(opts) {
        //隐藏label标签
        this.remove();
        this._prepare();
        this.editing = true;
    },

    _prepare:function() {
        var width = this.strokeAndFill['markerWidth'];
        var height = this.strokeAndFill['markerHeight'];
        var viewPoint = this._map.coordinateToViewPoint(this._center).substract({left:width/2,top:height/2});
        this._container = Z.DomUtil.createEl('div');
        this._container.style.cssText='position:absolute;top:'+viewPoint['top']+'px;left:'+viewPoint['left']+'px;z-index:5000;';
        this._map._panels.mapPlatform.appendChild(this._container);
        this._textEditor = this._createInputDom();
        this._container.appendChild(this._textEditor);
    },

    _createInputDom: function() {
        var width = this.strokeAndFill['markerWidth'];
        var height = this.strokeAndFill['markerHeight'];
        var textColor = this.textStyle['textFill'];
        var textSize = this.textStyle['textSize'];
        var fill = this.strokeAndFill['markerFill'];
        var lineColor = this.strokeAndFill['markerLineColor'];
        var inputDom = Z.DomUtil.createEl('textarea');
        inputDom.style.cssText ='background:'+fill+';'+
                                'border:1px solid '+lineColor+';'+
                                'color:'+textColor+';'+
                                'font-size:'+textSize+'px;'+
                                'width:'+width+'px;'+
                                'height:'+height+'px;';
        var content = this.getContent();
        inputDom.value = content;
        return inputDom;

    },

    /**
     * 结束编辑
     * @member maptalks.Label
     * @expose
     */
    endEdit: function() {
        var content = this._textEditor.value;
        this.setContent(content);
        Z.DomUtil.removeDomNode(this._container);
        this.editing = true;
    },

    /**
     * Label是否处于编辑状态中
     * @member maptalks.Label
     * @return {Boolean} 是否处于编辑状态
     * @expose
     */
    isEditing: function() {
        return this.editing;
    }

});