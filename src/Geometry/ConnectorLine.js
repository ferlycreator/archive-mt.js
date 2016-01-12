/**
 * 连接器类
 * @class maptalks.Linker
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z.ConnectorLine = Z.CurveLine.extend({

    options: {

    },

    /**
     * @constructor
     * @param {Object} options 连接配置及其它设置
        options: {
            linkSource:source,
            linkTarget:target,
            symbol:symbol,
            trigger:'manual'//'moving','click','hover'
        }
     * @returns {maptalks.Linker}
     */
    initialize: function (src, target, options) {
        this._connSource = src;
        this._connTarget = target;
        this._registEvents();
        this._updateCoordinates();
        this._initOptions(opts);
    },

    /**
     * 删除连接线
     * @expose
     */
    remove: function () {
        this._connSource.off('dragging positionchanged', this._changeLinkPath, this)
                        .off('remove', this.remove, this);
        this._connTarget.off('dragging positionchanged', this._changeLinkPath, this)
                        .off('remove', this.remove, this);
    },

    _updateCoordinates:function() {
        var map = this.getMap();
        var srcPoints = this._connSource.getConnectPoints();
        var targetPoints = this._connTarget.getConnectPoints();
        var minDist = 0;
        var c1,c2;
        for(var i=0,len=srcPoints.length;i<len;i++) {
            var p1 = srcPoints[i];
            for(var j=0,length=targetPoints.length;j<length;j++) {
                var p2 = targetPoints[j];
                var dist = map.computeDistance(p1, p2);
                if(i===0&&j===0) {
                    c1 = p1;
                    c2 = p2;
                    minDist = dist;
                } else {
                    if(dist < minDist) {
                        c1 = p1;
                        c2 = p2;
                    }
                }
            }
        }
        this.setCoordinates([c1, c2]);
    },

    _registEvents: function() {
        var me = this;
        this._connSource.on('dragging positionchanged', this._changeLinkPath, this)
                        .on('remove', this.remove, this);
        this._connTarget.on('dragging positionchanged', this._changeLinkPath, this)
                        .on('remove', this.remove, this);
        var trigger = this.options['trigger'];
        me._linker.hide();
        if ('moving' === trigger) {
            this._connSource.on('dragstart', function(){
                me._linker.show();
            }).on('dragend', function(){
                me._linker.hide();
            });
            this._connTarget.on('dragstart', function(){
                me._linker.show();
            }).on('dragend', function(){
                me._linker.hide();
            });
        } else if ('click' === trigger) {
            this._connSource.on('mousedown', function(){
                me._linker.show();
            }).on('mouseup', function(){
                me._linker.hide();
            });
            this._connTarget.on('mousedown', function(){
                me._linker.show();
            }).on('mouseup', function(){
                me._linker.hide();
            });
        } else if ('hover' === trigger) {
            this._connSource.on('mouseover', function(){
                me._linker.show();
            }).on('mouseout', function(){
                me._linker.hide();
            });
            this._connTarget.on('mouseover', function(){
                me._linker.show();
            }).on('mouseout', function(){
                me._linker.hide();
            });
        } else {
            me._linker.show();
        }
    },

    _changeLinkPath: function() {
        var linkPoints = this._computeLinkPoint();
        this._linker.setCoordinates(linkPoints);
    },

    _computeLinkPoint: function() {
        var sourceVertexs = this._connSource.getConnectPoints();
        var targetVertexs = this._connTarget.getConnectPoints();
        var lastDistance = 0;
        var nearestSourcePoint,nearestTargetPoint;
        for(var i=0,len=sourceVertexs.length;i<len;i++) {
            var sourceVertex = sourceVertexs[i];
            for(var j=0,length=targetVertexs.length;j<length;j++) {
                var targetVertex = targetVertexs[j];
                var distance = this._map.computeDistance(sourceVertex, targetVertex);
                if(i===0&&j===0) {
                    nearestSourcePoint = sourceVertex;
                    nearestTargetPoint = targetVertex;
                    lastDistance = distance;
                } else {
                    if(distance < lastDistance) {
                        nearestSourcePoint = sourceVertex;
                        nearestTargetPoint = targetVertex;
                    }
                }
            }
        }
        return [nearestSourcePoint,nearestTargetPoint];
    }
});
