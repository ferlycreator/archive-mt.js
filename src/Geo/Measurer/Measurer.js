Z.measurer = {};

Z.Measurer = {
    getMeasurer:function(name) {
        if (!name) {
            return Z.Measurer.DEFAULT;
        }
        for (var p in Z.measurer) {
            if (Z.measurer.hasOwnProperty(p)) {
                var mName = Z.measurer[p].name;
                if (!mName) {
                    continue;
                }
                if (name.toLowerCase() === mName.toLowerCase()) {
                    return Z.measurer[p];
                }
            }
        }
        return null;
    },

    DEFAULT: Z.measurer.WGS84Sphere
}
