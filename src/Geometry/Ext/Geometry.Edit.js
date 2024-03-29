Z.Geometry.include({
    /**
     * 开始编辑Geometry
     * @member maptalks.Geometry
     * @expose
     */
    startEdit: function(opts) {
        this.endEdit();
        this.editor = new Z.Editor(this,opts);
        this.editor.start();
    },

    /**
     * 结束编辑
     * @member maptalks.Geometry
     * @expose
     */
    endEdit: function() {
        if (this.editor) {
            this.editor.stop();
        }
    },

    /**
     * Geometry是否处于编辑状态中
     * @member maptalks.Geometry
     * @return {Boolean} 是否处于编辑状态
     * @expose
     */
    isEditing: function() {
        if (this.editor) {
            return this.editor.isEditing();
        }
        return false;
    }

});