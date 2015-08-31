describe('ExtentSpec', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;

    beforeEach(function() {
        var setups = CommonSpec.mapSetup(center);
       container = setups.container;
       map = setups.map;
    });

    afterEach(function() {
        map.removeLayer(layer);
        document.body.removeChild(container);
    });

    describe('extent constructor', function() {
        //verify extent instance
        function verify(extent) {
            expect(extent['xmin']).to.be(1);
            expect(extent['ymin']).to.be(2);
            expect(extent['xmax']).to.be(3);
            expect(extent['ymax']).to.be(4);
        }

        it('has 2 constructors', function() {
            //constructor 1
            var extent = new Z.Extent(1,2,3,4);
            verify(extent);

            var extent = new Z.Extent(3,4,1,2);
            verify(extent);

            //constructor 2
            extent = new Z.Extent(new Z.Coordinate(1,2), new Z.Coordinate(3,4));
            verify(extent);

            extent = new Z.Extent(new Z.Coordinate(3,4), new Z.Coordinate(1,2));
            verify(extent);
        });
    });

    describe("how to validate a extent", function() {

        it('is valid',function() {
            var extent = new Z.Extent(1,2,3,4);
            expect(extent.isValid()).to.be.ok();

            var extent2 = new Z.Extent(NaN, 2, 3, 4);
            expect(extent2.isValid()).to.not.be.ok();


        });

        it('is invalid',function() {
            var extent3 = new Z.Extent();
            expect(extent3.isValid()).to.not.be.ok();

            var extent3 = new Z.Extent(null, 2, 3, 4);
            expect(extent3.isValid()).to.not.be.ok();

            var extent4 = new Z.Extent(undefined, 2, 3, 4);
            expect(extent4.isValid()).to.not.be.ok();
        });
    });

    describe("Extent static methods",function() {
        it('can ')
    });
});
