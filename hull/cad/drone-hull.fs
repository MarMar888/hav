FeatureScript 3083;
import(path : "onshape/std/geometry.fs", version : "3083.0");

/*
 * Experimental 60-inch drone hull; not a validated self-righting design.
 * X: transom to bow. Y: transverse. Z: up. Aft keel: Z = 0.
 * Defaults: 60 x 14.5 x 11.5 inches, 24-degree aft deadrise.
 * Rounded sealed deck, sharp chines, straight aft 40%, no steps.
 * Low CG requires actual equipment/ballast low inside the hull.
 * Test with representative mass; check the full righting-arm curve.
 * 45+ mph is a target, not a prediction. Wall thickness is geometric,
 * not a structural laminate specification. No hatch or ballast included.
 * API checked against Onshape documentation; not compiled in Onshape.
 */

export const DH_LENGTH = { (inch) : [48, 60, 72] } as LengthBoundSpec;
export const DH_BEAM = { (inch) : [13, 14.5, 17] } as LengthBoundSpec;
export const DH_HEIGHT = { (inch) : [10, 11.5, 14] } as LengthBoundSpec;
export const DH_ANGLE = { (degree) : [20, 24, 28] } as AngleBoundSpec;
export const DH_WALL = { (millimeter) : [1.5, 3, 4] } as LengthBoundSpec;

function hullSection(context is Context, sectionId is Id,
                     x is ValueWithUnits, halfBeam is ValueWithUnits,
                     keel is ValueWithUnits, sheer is ValueWithUnits,
                     crown is ValueWithUnits, beta is ValueWithUnits)
{
    const chineY = 0.90 * halfBeam;
    const chineZ = keel + chineY * tan(beta);
    if (chineZ >= sheer)
        throw regenError("Increase height or reduce beam/deadrise.");

    var sketch = newSketchOnPlane(context, sectionId, {
        "sketchPlane" : plane(vector(x, 0 * inch, 0 * inch),
                              vector(1, 0, 0), vector(0, 1, 0))
    });

    // Sketch coordinates are global Y and Z.
    const points = [
        vector(-halfBeam, sheer),
        vector(-chineY, chineZ),
        vector(0 * inch, keel),
        vector(chineY, chineZ),
        vector(halfBeam, sheer)
    ];
    for (var j = 0; j < size(points) - 1; j += 1)
        skLineSegment(sketch, "edge" ~ j, {
            "start" : points[j], "end" : points[j + 1]
        });

    skArc(sketch, "deck", {
        "start" : points[4],
        "mid" : vector(0 * inch, crown),
        "end" : points[0]
    });
    skSolve(sketch);
}

annotation { "Feature Type Name" : "Experimental drone hull" }
export const droneHull = defineFeature(function(context is Context,
                                                id is Id, definition is map)
    precondition
    {
        annotation { "Name" : "Overall length" }
        isLength(definition.length, DH_LENGTH);
        annotation { "Name" : "Maximum section beam" }
        isLength(definition.beam, DH_BEAM);
        annotation { "Name" : "Aft keel to deck crown" }
        isLength(definition.height, DH_HEIGHT);
        annotation { "Name" : "Aft deadrise" }
        isAngle(definition.deadrise, DH_ANGLE);
        annotation { "Name" : "Hollow sealed hull", "Default" : true }
        definition.hollow is boolean;
        if (definition.hollow)
        {
            annotation { "Name" : "Geometric wall thickness" }
            isLength(definition.wall, DH_WALL);
        }
    }
    {
        // x/L, half-beam multiplier, keel/H, sheer/H, extra deadrise.
        // A small blunt stem avoids a zero-size loft/shell singularity.
        const stations = [
            [0.40, 1.00, 0.00, 0.61, 0],
            [0.60, 0.90, 0.03, 0.62, 4],
            [0.78, 0.63, 0.16, 0.64, 10],
            [0.92, 0.30, 0.36, 0.66, 16],
            [1.00, 0.08, 0.55, 0.68, 18]
        ];
        var profiles = [];
        var sketchBodies = [];
        for (var i = 0; i < size(stations); i += 1)
        {
            const s = stations[i];
            const sid = id + ("section" ~ i);
            const sheer = s[3] * definition.height;
            const crown = sheer + 0.39 * definition.height * s[1];
            hullSection(context, sid, s[0] * definition.length,
                        s[1] * definition.beam / 2,
                        s[2] * definition.height, sheer, crown,
                        definition.deadrise + s[4] * degree);
            profiles = append(profiles, qSketchRegion(sid));
            sketchBodies = append(sketchBodies, qCreatedBy(sid, EntityType.BODY));
        }

        // Extrusion guarantees straight aft running surfaces.
        opExtrude(context, id + "aft", {
            "entities" : profiles[0],
            "direction" : vector(-1, 0, 0),
            "endBound" : BoundingType.BLIND,
            "endDepth" : 0.40 * definition.length
        });
        opLoft(context, id + "fore", {
            "profileSubqueries" : profiles,
            "bodyType" : ToolBodyType.SOLID,
            "derivativeInfo" : [{
                "profileIndex" : 0,
                "vector" : vector(1, 0, 0),
                "magnitude" : 1,
                "tangentToPlane" : false
            }]
        });
        const hullBodies = qUnion([
            qCreatedBy(id + "aft", EntityType.BODY),
            qCreatedBy(id + "fore", EntityType.BODY)
        ]);
        opBoolean(context, id + "join", {
            "tools" : hullBodies,
            "operationType" : BooleanOperationType.UNION
        });
        if (definition.hollow)
            opShell(context, id + "shell", {
                "entities" : hullBodies,
                "thickness" : -definition.wall
            });

        opDeleteBodies(context, id + "removeSections", {
            "entities" : qUnion(sketchBodies)
        });
        setProperty(context, {
            "entities" : hullBodies,
            "propertyType" : PropertyType.NAME,
            "value" : "Experimental deep-V drone hull"
        });
    });
