Z.Geometry.include({
    animate:function(styles, options, callback) {
        var isFocusing;
        if (options) {isFocusing = options['focus'];delete options['focus'];}
        this._isRenderImmediate(true);
        var aniStyles = {};
        var symbol = this.getSymbol();
        //prepare styles for animation
        for (var p in styles) {
            if (styles.hasOwnProperty(p)) {
                var v = styles[p];
                if (p !== 'translate' && p !== 'symbol') {
                    //this.getRadius() / this.getWidth(), etc.
                    var fnName = 'get'+p[0].toUpperCase() + p.substring(1);
                    var current = this[fnName]();
                    aniStyles[p] = [current, v];
                } else if (p === 'symbol') {
                    var aniSymbol = {};
                    for (sp in v) {
                        aniSymbol[sp] = [symbol[sp], v['symbol'][sp]];
                    }
                    aniStyles['symbol'] = aniSymbol;
                } else if (p === 'translate'){
                    aniStyles['translate'] = new Z.Coordinate(v);
                }
            }
        }
        Z.Animation.animate(aniStyles, options, Z.Util.bind(function(frame) {
            var styles = frame.styles;
            for (var p in styles) {
                if (p !== 'symbol' && p !== 'translate' && styles.hasOwnProperty(p)) {
                    var v = styles[p];
                    var fnName = 'set'+p[0].toUpperCase() + p.substring(1);
                    this[fnName](v);
                }
            }
            var translate = styles['translate'];
            if (translate) {
                this.translate(translate);
            }
            var symbol = styles['symbol'];
            if (symbol) {
                this.setSymbol(symbol);
            }
            if (isFocusing) {
                this.getMap().setCenter(this.getCenter());
            }
            if (callback) {
                callback();
            }
        },this));
    }
});
