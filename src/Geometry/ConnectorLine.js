/**
 * 连接线
 * @class maptalks.Linker
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z.ConnectorLine = Z.CurveLine.extend({

    options: {
        trigger : 'moving',
        curveType : 0
    },

    /**
     * @constructor
     * @returns {maptalks.Linker}
     */
    initialize: function (src, target, options) {
        this._connSource = src;
        this._connTarget = target;
        this._registEvents();
        this._updateCoordinates();
        this._initOptions(options);
    },

    setConnectSource:function(src) {
        this._onRemove();
        this._connSource = src;
        this._updateCoordinates();
        this._registEvents();
        return this;
    },

    setConnectTarget:function(target) {
        this._onRemove();
        this._connTarget = target;
        this._updateCoordinates();
        this._registEvents();
        return this;
    },

    _updateCoordinates:function() {
        var map = this.getMap();
        if (!map) {
            map = this._connSource.getMap();
        }
        if (!map) {
            map = this._connTarget.getMap();
        }
        if (!map) {
            return;
        }
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

    _onRemove: function () {
        this._connSource.off('dragging positionchanged', this._updateCoordinates, this)
                        .off('remove', this._onRemove, this);
        this._connTarget.off('dragging positionchanged', this._updateCoordinates, this)
                        .off('remove', this._onRemove, this);
        this._connSource.off('dragstart mousedown mouseover', this.show, this);
        this._connSource.off('dragend mouseup mouseout', this.hide, this);
    },

    _registEvents: function() {
        var me = this;
        this._connSource.on('dragging positionchanged', this._updateCoordinates, this)
                        .on('remove', this.remove, this);
        this._connTarget.on('dragging positionchanged', this._updateCoordinates, this)
                        .on('remove', this.remove, this);
        var trigger = this.options['trigger'];
        this.hide();
        if ('moving' === trigger) {
            this._connSource.on('dragstart', this.show, this).on('dragend', this.hide, this);
            this._connTarget.on('dragstart', this.show, this).on('dragend', this.hide, this);
        } else if ('click' === trigger) {
            this._connSource.on('mousedown', this.show, this).on('mouseup', this.hide, this);
            this._connTarget.on('mousedown', this.show, this).on('mouseup', this.hide, this);
        } else if ('hover' === trigger) {
            this._connSource.on('mouseover', this.show, this).on('mouseout', this.hide, this);
            this._connTarget.on('mouseover', this.show, this).on('mouseout', this.hide, this);
        } else {
            this.show();
        }
    }
});
