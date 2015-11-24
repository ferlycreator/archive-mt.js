if (!Z.runningInNode) {
    /**
     * @ignore
     */
    window['maptalks']=Z;
} else {
    exports = module.exports = Z;
    global.Image = require(global.maptalks_node_canvas_path).Image;
}

