describe('PanTool', function() {
    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);

    beforeEach(function() {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        var option = {
            zoomLevel: 17,
            center: center
        };
        map = new Z.Map(container, option);
        tile = new Z.TileLayer('tile', {
            tileInfo: 'web-mercator',
            urlTemplate: 'http://emap{s}.mapabc.com/mapabc/maptile?&x={x}&y={y}&z={z}',
            subdomains: [0, 1, 2, 3]
        });
    });

    afterEach(function() {
        document.body.removeChild(container);
    });

    describe('when enabled', function() {
        it('trigger click on map', function() {
            var spy = sinon.spy();
            map.setBaseTileLayer(tile);
            map.on('click', spy);
            var pantool = new Z.mousetool.Pantool(map);
            pantool.enable();

            happen.mouseup(pantool.dom);

            expect(spy.called).to.be.ok();
        });

        it('trigger rightclick on map', function() {
            var spy = sinon.spy();
            map.setBaseTileLayer(tile);
            map.on('rightclick', spy);
            var pantool = new Z.mousetool.Pantool(map);
            pantool.enable();

            happen.mouseup(pantool.dom, {
                button: 2
            });

            expect(spy.called).to.be.ok();
        });

        it('trigger dblclick on map', function() {
            var spy = sinon.spy();
            map.setBaseTileLayer(tile);
            map.on('dblclick', spy);
            var pantool = new Z.mousetool.Pantool(map);
            pantool.enable();

            happen.dblclick(pantool.dom);

            expect(spy.called).to.be.ok();
        });

        describe('if drag', function() {
            var clock;

            beforeEach(function() {
                clock = sinon.useFakeTimers();
            });

            afterEach(function() {
                clock.restore();
            });

            it('trigger move event on map(no animate?)', function() {
                var movestart = sinon.spy();
                var moving = sinon.spy();
                var moveend = sinon.spy();
                map.setBaseTileLayer(tile);
                map.on('movestart', movestart);
                map.on('moving', moving);
                map.on('moveend', moveend);
                var pantool = new Z.mousetool.Pantool(map);
                pantool.enable();

                happen.mousedown(pantool.dom, {
                    clientX: 10,
                    clientY: 10
                });

                happen.mousemove(pantool.dom, {
                    clientX: 20,
                    clientY: 20
                });

                clock.tick(300);
                happen.mouseup(pantool.dom, {
                    clientX: 20,
                    clientY: 20
                });

                expect(movestart.calledOnce).to.be.ok();
                expect(moving.called).to.be.ok();
                expect(moveend.calledOnce).to.be.ok();
            });

            it('trigger move event on map(with animate?)', function(/*done*/) {
                // this.timeout(5000);
                var movestart = sinon.spy();
                var moving = sinon.spy();
                var moveend = sinon.spy();
                map.setBaseTileLayer(tile);
                map.on('movestart', movestart);
                map.on('moving', moving);
                map.on('moveend', moveend);
                var pantool = new Z.mousetool.Pantool(map);
                pantool.enable();

                happen.mousedown(pantool.dom, {
                    clientX: 10,
                    clientY: 10
                });

                happen.mousemove(pantool.dom, {
                    clientX: 20,
                    clientY: 20
                });

                clock.tick(200);
                happen.mouseup(pantool.dom, {
                    clientX: 20,
                    clientY: 20
                });

                // TODO: with 'setTimeout()' in been testing source
                expect(movestart.calledOnce).to.be.ok();
                expect(moving.called).to.be.ok();
                expect(moveend.called).to.be.ok();
            });
        });
    });

    describe('when disabled', function() {
        it('do not trigger dblclick on map', function() {
            var spy = sinon.spy();
            map.setBaseTileLayer(tile);
            map.on('dblclick', spy);
            var pantool = new Z.mousetool.Pantool(map);
            pantool.enable();
            pantool.disable();

            happen.dblclick(pantool.dom);

            expect(spy.called).to.not.be.ok();
        });
    });

});
