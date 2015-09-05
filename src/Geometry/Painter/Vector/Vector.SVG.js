Z.Vector.SVG = Z.Painter.SVG.extend({
    /**
     * 将容器相对坐标数组转化为svg path定义
     */
    domOffsetsToSVGPath:function(offsets,isClosePath,isHole) {
        var seperator=',';

        var coords = [];
        //TODO 这里可以做simplify

        for ( var i = 0, len = offsets.length; i < len; i++) {
            coords.push(offsets[i]['left']+seperator+offsets[i]['top']);
        }
        if (coords.length === 0) {
            return 'M0 0';
        }
        var ret = null;
        if (!isHole) {
            ret = 'M'+coords.join(' L');
            if (isClosePath) {
                ret += Z.SVG.closeChar;
            }
        } else {
            //如果是空洞,则逆时针绘制
            ret = 'M'+coords.reverse().join(' L')+Z.SVG.closeChar;
        }

        return ret;
    },

    /**
     * 绘制
     * @param  {[type]} layerContainer [description]
     * @param  {[type]} zIndex         [description]
     */
    _paint:function(layerContainer, zIndex, symbol) {
        if (!this.geometry) {return;}
        this.setSymbol(symbol);
        //矢量标注绘制
        var vObj = this.createSVGObj();
        this.drawVector(vObj,this.strokeSymbol,this.fillSymbol);
    },

    refreshVectorSymbol:function() {
        if (!this.geometry) {
            return;
        }
        var newSymbol = this.geometry.getSymbol();
        this.setSymbol(newSymbol);
        var vObj = this.createSVGObj();
        Z.SVG.refreshVector(this.vector, vObj);
    }

});
