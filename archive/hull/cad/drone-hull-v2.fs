FeatureScript 3083;
import(path : "onshape/std/geometry.fs", version : "3083.0");

/*
 * Experimental 60-inch drone hull; not a validated self-righting design.
 * X: transom to bow. Y: transverse. Z: up. Aft keel: Z = 0.
 * V2: independent shape controls for simulation campaigns.
 * Defaults approximately reproduce V1: 60 x 14.5 x 11.5 inches.
 * Rounded sealed deck, sharp chines, straight aft 40%, no steps.
 * Low CG requires actual equipment/ballast low inside the hull.
 * Test with representative mass; check the full righting-arm curve.
 * 45+ mph is a target, not a prediction. Wall thickness is geometric,
 * not a structural laminate specification. No hatch or ballast included.
 * Use hollow=false for CFD external geometry; it is NOT a solid mass model.
 * Equipment mass, CG and inertia belong in cfd/tools/design-space.json.
 * API checked against Onshape documentation; not compiled in Onshape.
 */

export const DH_LENGTH = { (inch) : [48, 60, 72] } as LengthBoundSpec;
export const DH_BEAM = { (inch) : [13, 14.5, 17] } as LengthBoundSpec;
export const DH_SHEER = { (inch) : [5.5, 7.015, 8.5] } as LengthBoundSpec;
export const DH_DECK = { (inch) : [3, 4.485, 5.5] } as LengthBoundSpec;
export const DH_RISE = { (inch) : [4.5, 6.325, 7] } as LengthBoundSpec;
export const DH_ANGLE = { (degree) : [16, 24, 28] } as AngleBoundSpec;
export const DH_BOW_ANGLE = { (degree) : [10, 18, 20] } as AngleBoundSpec;
export const DH_AFT = { (unitless) : [0.30, 0.40, 0.50] } as RealBoundSpec;
export const DH_CHINE = { (unitless) : [0.82, 0.90, 0.96] } as RealBoundSpec;
export const DH_FULLNESS = { (unitless) : [0.85, 1, 1.10] } as RealBoundSpec;
export const DH_WALL = { (millimeter) : [1.5, 3, 4] } as LengthBoundSpec;

function hullSection(context is Context, sectionId is Id,
                     x is ValueWithUnits, halfBeam is ValueWithUnits,
                     keel is ValueWithUnits, sheer is ValueWithUnits,
                     crown is ValueWithUnits, beta is ValueWithUnits,
                     chineRatio is number)
{
    const chineY = chineRatio * halfBeam;
    const chineZ = keel + chineY * tan(beta);
    if (chineZ >= sheer)
        throw regenError("Increase height or reduce beam/deadrise.");
    if (crown - sheer > halfBeam)
        throw regenError("Deck rise exceeds half beam; reduce deck rise.");

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

annotation { "Feature Type Name" : "Parametric drone hull V2" }
export const droneHull = defineFeature(function(context is Context,
                                                id is Id, definition is map)
    precondition
    {
        annotation { "Name" : "Overall length" }
        isLength(definition.length, DH_LENGTH);
        annotation { "Name" : "Maximum section beam" }
        isLength(definition.beam, DH_BEAM);
        annotation { "Name" : "Aft keel to sheer" }
        isLength(definition.sheerHeight, DH_SHEER);
        annotation { "Name" : "Deck crown above aft sheer" }
        isLength(definition.deckRise, DH_DECK);
        annotation { "Name" : "Bow keel rise" }
        isLength(definition.bowRise, DH_RISE);
        annotation { "Name" : "Aft deadrise" }
        isAngle(definition.deadrise, DH_ANGLE);
        annotation { "Name" : "Additional bow deadrise" }
        isAngle(definition.bowExtra, DH_BOW_ANGLE);
        annotation { "Name" : "Straight aft length / overall length" }
        isReal(definition.aftFraction, DH_AFT);
        annotation { "Name" : "Chine beam / sheer beam" }
        isReal(definition.chineRatio, DH_CHINE);
        annotation { "Name" : "Bow fullness (1 = baseline)" }
        isReal(definition.bowFullness, DH_FULLNESS);
        annotation { "Name" : "Hollow for fabrication study", "Default" : false }
        definition.hollow is boolean;
        if (definition.hollow)
        {
            annotation { "Name" : "Geometric wall thickness" }
            isLength(definition.wall, DH_WALL);
        }
    }
    {
        // Forebody fraction, beam factor, normalized keel rise,
        // sheer rise / baseline overall height, fraction of extra deadrise.
        // A small blunt stem avoids a zero-size loft/shell singularity.
        const stations = [
            [0,     1.00, 0,         0,    0],
            [1 / 3, 0.90, 0.03/0.55, 0.01, 4/18],
            [19/30, 0.63, 0.16/0.55, 0.03, 10/18],
            [13/15, 0.30, 0.36/0.55, 0.05, 16/18],
            [1,     0.08, 1,         0.07, 1]
        ];
        var profiles = [];
        var sketchBodies = [];
        for (var i = 0; i < size(stations); i += 1)
        {
            const s = stations[i];
            const sid = id + ("section" ~ i);
            const w = 0.08 + 0.92 * (((s[1] - 0.08) / 0.92) ^
                                      (1 / definition.bowFullness));
            const x = definition.aftFraction + (1 - definition.aftFraction) * s[0];
            const sheer = definition.sheerHeight + s[3] *
                          (definition.sheerHeight + definition.deckRise);
            const crown = sheer + definition.deckRise * w;
            hullSection(context, sid, x * definition.length,
                        w * definition.beam / 2,
                        s[2] * definition.bowRise, sheer, crown,
                        definition.deadrise + s[4] * definition.bowExtra,
                        definition.chineRatio);
            profiles = append(profiles, qSketchRegion(sid));
            sketchBodies = append(sketchBodies, qCreatedBy(sid, EntityType.BODY));
        }

        // Extrusion guarantees straight aft running surfaces.
        opExtrude(context, id + "aft", {
            "entities" : profiles[0],
            "direction" : vector(-1, 0, 0),
            "endBound" : BoundingType.BLIND,
            "endDepth" : definition.aftFraction * definition.length
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
            "value" : "Parametric drone hull V2 - geometry only"
        });
    });
