Z.Painter.Canvas = Z.Painter.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    _paint:function(context, resources, symbol) {
        var geometry = this.geometry;
        if (!geometry || !context || !geometry.getMap() || this.deleting) {
            return;
        }
        this.setSymbol(symbol);

        this.prepareCanvas(context,this.strokeSymbol,this.fillSymbol);
        var platformOffset = this.geometry.getMap().offsetPlatform();
        this.doPaint(context,resources,platformOffset);
    },

    remove:function() {
        var geometry = this.geometry;
        if (!geometry) {
            return;
        }
        var map = geometry.getMap();
        if (!map) {
            return;
        }
        this.deleting = true;
        this.refresh();
    },

    show:function() {
        this.refresh();
    },

    hide:function() {
        this.refresh();
    },

    refresh:function() {
        var geometry = this.geometry;
        if (!geometry) {
            return;
        }
        var map = geometry.getMap();
        if (!map) {
            return;
        }
        var isRealTime = geometry.isEditing();
        var render = geometry.getLayer().getRender();
        render.repaint(isRealTime);
        this._registerEvents();
    },

    refreshSymbol:function() {
        this.refresh();
    },

    getRgba:function(color, op) {
        if (Z.Util.isNil(op)) {
            op = 1;
        }
        var rgb = {
            r: parseInt(color.slice(1, 3), 16),
            g: parseInt(color.slice(3, 5), 16),
            b: parseInt(color.slice(5, 7), 16)
        };
        return "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+op+")";
    },

    setDefaultCanvasSetting:function(context) {
        context.lineWidth = 1;
        context.strokeStyle = this.getRgba("#474cf8",1);
        context.fillStyle = this.getRgba("#474cf8",0);
        context.textAlign="start";
        context.textBaseline="hanging";
        context.font="11px SIMHEI";
        if (context.setLineDash) {
            context.setLineDash([]);
        }
        context.save();
    },

    /**
     * 根据strokeSymbol和fillSymbol准备canvas的绘制参数
     * @param  {[type]} context      [description]
     * @param  {[type]} strokeSymbol [description]
     * @param  {[type]} fillSymbol   [description]
     * @return {[type]}              [description]
     */
    prepareCanvas:function(context, strokeSymbol, fillSymbol){
        this.setDefaultCanvasSetting(context);
        context.restore();
        if (strokeSymbol) {
            var strokeWidth = strokeSymbol['strokeWidth'];
            if (!Z.Util.isNil(strokeWidth)) {context.lineWidth = strokeWidth;}
            var strokeOpacity = strokeSymbol['strokeOpacity'];
            if (strokeWidth === 0) {
                strokeOpacity = 0;
            }
            var strokeColor = strokeSymbol['stroke'];
             if (strokeColor)  {
                 if (Z.Util.isNil(strokeOpacity)) {
                     strokeOpacity = 1;
                 }
                 context.strokeStyle = this.getRgba(strokeColor,strokeOpacity);
             }
             //低版本ie不支持该属性
             if (context.setLineDash) {
                 var strokeDash=(strokeSymbol['strokeDasharray'] || strokeSymbol['strokeDashArray']);
                 if (strokeDash && strokeDash.length>0) {
                     context.setLineDash(strokeDash);
                 }
             }
         }
         if (fillSymbol) {
             var fill=fillSymbol['fill'];
             if (!fill) {return;}
             if (Z.Util.isNil(fillSymbol['fillOpacity'])) {
                 fillSymbol['fillOpacity'] = 1;
             }
             if (fill.length>7 && 'url' ===fill.substring(0,3)) {
                 var imgUrl = fill.substring(5,fill.length-2);
                 var imageTexture = document.createElement('img');
                 imageTexture.src = imgUrl;
                 var woodfill = context.createPattern(imageTexture, 'repeat');
                 context.fillStyle = woodfill;
             }else {
                 context.fillStyle =this.getRgba(fill);
             }
         }
    },

    fillGeo:function(context, fillSymbol){
        if (fillSymbol) {
             if (!Z.Util.isNil(fillSymbol['fillOpacity'])) {
                 context.globalAlpha = fillSymbol['fillOpacity'];
             }
             context.fill('evenodd');
             context.globalAlpha = 1;
        }
    },

    _registerEvents:function(){

    }

});
