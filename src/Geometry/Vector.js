Z.Vector = Z.Geometry.extend({
    options:{
        'symbol':{
            'line-color' : '#474cf8',
            'line-width' : 3,
            'line-opacity' : 1,

            'polygon-fill' : '#ffffff',
            'polygon-opacity' : 0
        }
    },

    _hitTestTolerance: function() {
        var symbol = this.getSymbol();
        var w = symbol['line-width'];
        return w ? w / 2 : 0;
    }
});
