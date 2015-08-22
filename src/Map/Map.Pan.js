Z.Map.include({

    /**
     * 将地图移动到指定的坐标
     * @param  {Coordinate} coordinate 指定的坐标
     * @expose
     */
    panTo:function(coordinate) {
        if (!Z.Util.isCoordinate(coordinate)) {
            return;
        }
        var projection = this._getProjection();
        var p = projection.project(coordinate);
        var span = this._getPixelDistance(p);
        this.panBy(span);
        return this;
    },

    /**
     * 按指定的像素距离移动地图
     * @param  {Point} point [description]
     * @expose
     */
    panBy:function(offset) {
        this._offsetPlatform({'left':offset['left'],'top':offset['top']});
        this._offsetCenterByPixel({'left':-offset['left'],'top':-offset['top']});
        this._fireEvent('moving');
        this._onMoveEnd({'target':this});
        return this;
    },

    _animatePan:function(moveOffset) {
        if (!moveOffset) {moveOffset = {'left':0, 'top':0};}
        if (!moveOffset['left']) {
            moveOffset['left'] = 0;
        }
        if (!moveOffset['top']) {
            moveOffset['top'] = 0;
        }
        var xfactor = moveOffset["left"] >= 0 ? 1 : -1;
        var yfactor = moveOffset["top"] >= 0 ? 1 : -1;
        // 求每次移动距离的等差数列
        var xSum = Math.abs(moveOffset["left"]);
        var ySum = Math.abs(moveOffset["top"]);
        var lastx = Math.ceil(xSum / 10 - 1);
        var lasty = Math.ceil(ySum / 10 - 1);
        var xd = (lastx - 1) / 19;
        if (xd <= 0) {
            xd = 1;
        }
        var yd = (lasty - 1) / 19;
        if (yd <= 0) {
            yd = 1;
        }

        // 移动距离在这个数组里记录下来
        var spanArr = [];
        var currX = 1, currY = 1;
        var spanCounter = 0;
        var spanX=0,spanY=0;
        while (true) {
            // 等差计算移动距离
            currX = lastx - spanCounter * xd;
            currY = lasty - spanCounter * yd;
            if (currX < 0 || spanX>xSum) {
                currX = 0;
            }
            if (currY < 0 || spanY>ySum) {
                currY = 0;
            }
            if (currX <= 0 && currY <= 0) {
                break;
            }
            spanArr.push( {
                x : Math.round(currX) * xfactor,
                y : Math.round(currY) * yfactor
            });
            spanCounter++;
            spanX+=currX;
            spanY+=currY;
        }
        var counterLimit = spanArr.length;
    //  console.log(spanArr);
        var _map = this;
        // var pxTop = 0;
        // var pxLeft = 0;
        var counter = 0;
        //var isAnimeSupported = !seegoo.maps.config.browser.mobile && !(seegoo.maps.config.browser.ie && document.documentMode < 9);
        if (_map.dynLayerSlideTimeout) {
            clearTimeout(_map.dynLayerSlideTimeout);
        }
        _map.isBusy = true;
        var _this=this;
        slideMap();

        function slideMap() {
            if (!Z.Util.isArrayHasData(spanArr)) {
                return;
            }
            if (!_map._allowSlideMap) {
                _map._allowSlideMap = true;
                _map._onMoveEnd({'target':_map});
                return;
            }
            var ySpan = spanArr[counter].y;
            var xSpan = spanArr[counter].x;
            _map._offsetPlatform({'left':xSpan,'top':ySpan});
            _map._offsetCenterByPixel({'left':-xSpan,'top':-ySpan});
            counter++;
            // 每移动3次draw一次
            if (counter <= counterLimit - 1) {
                if (counter % 3 === 0) {
                    if (!Z.Browser.ie6) {
                       // _map.fire('moving',{'target':_map});
                       _map._onMoving({'target':_map});
                    }
                }
                setTimeout(slideMap, 8 + counter);
            } else {
                // 用setTimeout方式调用解决了地图滑动结束时，如果添加有动态图层，或者canvasLayer上有大量数据时，地图会发生顿卡现象的问题
                _map.dynLayerSlideTimeout = setTimeout(function() {
                    //_map._drawTileLayers();
                     _map._onMoveEnd({'target':_map});
                    _map.isBusy = false;
                },50);

            }

        }
    }

});
