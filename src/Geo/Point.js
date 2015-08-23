Z['Point']=Z.Point=Z.Class.extend({
    initialize:function(left,top){
        this['left']=left;
        this['top']=top;
    },

    distanceTo: function(point) {
        var x = point.left - this.left,
            y = point.top - this.top;

        return Math.sqrt(x * x + y * y);
    }
});
