Z.Label.include({
    /**
     * 开始编辑Label
     * @member maptalks.Label
     * @expose
     */
    startEditText: function(opts) {
        //隐藏label标签
        this.hide();
        this._prepareEditor();
        this.editing = true;
    },

    _prepareEditor:function() {
        this._symbol = this.getSymbol();
        this._map = this.getMap();
        var viewPoint = this._computeViewPoint();
        this._container = Z.DomUtil.createEl('div');
        this._container.style.cssText='position:absolute;top:'+viewPoint['top']
                                    +'px;left:'+viewPoint['left']+'px;z-index:5000;';
        this._map._panels.mapPlatform.appendChild(this._container);
        this._textEditor = this._createInputDom();
        this._container.appendChild(this._textEditor);
    },

    _computeViewPoint: function() {
        var width = Z.Util.getValueOrDefault(this._symbol['markerWidth'],0);
        var height = Z.Util.getValueOrDefault(this._symbol['markerHeight'],0);
        var left = Z.Util.getValueOrDefault(this._symbol['textDx'],0),
            top = Z.Util.getValueOrDefault(this._symbol['textDy'],0);
        var hAlign = this._symbol['textHorizontalAlignment'];
        if (hAlign === 'left') {
            left -= width;
        } else if (hAlign === 'middle') {
            left -= width/2;
        }

        var rowHeight = this._symbol['textLineSpacing'];
        var vAlign = this._symbol['textVerticalAlignment'];
        if (vAlign === 'top') {
            top = -height - rowHeight;
        } else if (vAlign === 'middle') {
            top = -height/2 - rowHeight;
        } else {
            top = -rowHeight;
        }
        var viewPoint = this._map.coordinateToViewPoint(this.getCenter()).add({left:left,top:top});
        return viewPoint;
    },

    _createInputDom: function() {
        var width = this._symbol['markerWidth'];
        var height = this._symbol['markerHeight'];
        var textColor = this._symbol['textFill'];
        var textSize = this._symbol['textSize'];
        var fill = this._symbol['markerFill'];
        var lineColor = this._symbol['markerLineColor'];
        var inputDom = Z.DomUtil.createEl('textarea');
        inputDom.style.cssText ='background:'+fill+';'+
            'border:1px solid '+lineColor+';'+
            'color:'+textColor+';'+
            'font-size:'+textSize+'px;'+
            'width:'+width+'px;'+
            'height:'+height+'px;';
        var content = this.getContent();
        inputDom.value = content;
        var me = this;
        Z.DomUtil.on(inputDom, 'blur', function(param){
             me.endEditText();
        });
        return inputDom;

    },

    /**
     * 结束编辑
     * @member maptalks.Label
     * @expose
     */
    endEditText: function() {
        var content = this._textEditor.value;
        this.setContent(content);
        this.show();
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