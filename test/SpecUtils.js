function genAllTypeGeometries() {
    var center = new Z.Coordinate(118.846825, 32.046534);
    var w = 1, h = 1, r = 1;
    var geometries = [
        new Z.Marker(center),
        new Z.Circle(center, r),
        new Z.Ellipse(center, w, h),
        new Z.Rectangle(center, w, h),
        new Z.Sector(center, r, 90, 180),
        new Z.Polyline([
            {x: 121.111, y: 30.111},
            {x: 121.222, y: 30.222}
        ]),
        new Z.Polygon([
            [
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222},
                {x: 121.333, y: 30.333}
            ]
        ]),
        new Z.MultiPolyline([
            [
                {x: 121.111, y: 30.111},
                {x: 121.222, y: 30.222}
            ],
            [
                {x: 121.333, y: 30.333},
                {x: 121.444, y: 30.444}
            ]
        ]),
        new Z.MultiPolygon([
            [
                [
                    {x: 121.111, y: 30.111},
                    {x: 121.222, y: 30.222},
                    {x: 121.333, y: 30.333}
                ]
            ],
            [
                [
                    {x: 121.444, y: 30.444},
                    {x: 121.555, y: 30.555},
                    {x: 121.666, y: 30.666}
                ]
            ]
        ])
    ];
    return geometries;
}

expect.Assertion.prototype.nearCoord = function(expected, delta) {
    delta = delta || 1e-6;
    expect(this.obj.x).to.be.within(expected.x - delta, expected.x + delta);
    expect(this.obj.y).to.be.within(expected.y - delta, expected.y + delta);
};
