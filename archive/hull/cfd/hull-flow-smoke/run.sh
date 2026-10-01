#!/bin/bash
set -euo pipefail
cd /work/mesh-001
mkdir -p constant/triSurface system 0
cp /hull-source/hull-meters.stl constant/triSurface/hull.stl
cp "$FOAM_TUTORIALS/multiphase/interFoam/laminar/damBreak/damBreak/system/fvSchemes" system/
cp "$FOAM_TUTORIALS/multiphase/interFoam/laminar/damBreak/damBreak/system/fvSolution" system/
cat > system/controlDict <<'EOF'
FoamFile { version 2.0; format ascii; class dictionary; object controlDict; }
application blockMesh;
startFrom startTime;
startTime 0;
stopAt endTime;
endTime 1;
deltaT 1;
writeControl timeStep;
writeInterval 1;
EOF
cat > system/blockMeshDict <<'EOF'
FoamFile { version 2.0; format ascii; class dictionary; object blockMeshDict; }
convertToMeters 1;
vertices
(
 (-0.75 -0.70 -0.35) (2.25 -0.70 -0.35) (2.25 0.70 -0.35) (-0.75 0.70 -0.35)
 (-0.75 -0.70 0.65) (2.25 -0.70 0.65) (2.25 0.70 0.65) (-0.75 0.70 0.65)
);
blocks ( hex (0 1 2 3 4 5 6 7) (30 14 10) simpleGrading (1 1 1) );
edges ();
boundary
(
 outlet { type patch; faces ((0 4 7 3)); }
 inlet { type patch; faces ((1 2 6 5)); }
 sideNeg { type symmetryPlane; faces ((0 1 5 4)); }
 sidePos { type symmetryPlane; faces ((3 7 6 2)); }
 bottom { type wall; faces ((0 3 2 1)); }
 top { type patch; faces ((4 5 6 7)); }
);
mergePatchPairs ();
EOF
cat > system/snappyHexMeshDict <<'EOF'
FoamFile { version 2.0; format ascii; class dictionary; object snappyHexMeshDict; }
castellatedMesh true;
snap true;
addLayers false;
geometry
{
 hull.stl { type triSurfaceMesh; name hull; }
 nearHull { type searchableBox; min (-0.15 -0.32 -0.12); max (1.68 0.32 0.48); }
}
castellatedMeshControls
{
 maxLocalCells 1000000; maxGlobalCells 2500000; minRefinementCells 0;
 nCellsBetweenLevels 3; resolveFeatureAngle 30;
 features ();
 refinementSurfaces { hull { level (1 2); patchInfo { type wall; } } }
 refinementRegions { nearHull { mode inside; levels ((1e15 2)); } }
 locationInMesh (-0.5 0 0.5);
 allowFreeStandingZoneFaces true;
}
snapControls
{
 nSmoothPatch 3; tolerance 2.0; nSolveIter 30; nRelaxIter 5;
 nFeatureSnapIter 10; implicitFeatureSnap false; explicitFeatureSnap false;
 multiRegionFeatureSnap false;
}
addLayersControls
{
 relativeSizes true; layers {} expansionRatio 1.0; finalLayerThickness 0.3;
 minThickness 0.1; nGrow 0; featureAngle 60; nRelaxIter 3;
 nSmoothSurfaceNormals 1; nSmoothNormals 3; nSmoothThickness 10;
 maxFaceThicknessRatio 0.5; maxThicknessToMedialRatio 0.3;
 minMedianAxisAngle 90; nBufferCellsNoExtrude 0; nLayerIter 0;
}
meshQualityControls
{
 maxNonOrtho 65;
 maxBoundarySkewness 20;
 maxInternalSkewness 4;
 maxConcave 80;
 minVol 1e-13;
 minTetQuality 1e-15;
 minArea -1;
 minTwist 0.02;
 minDeterminant 0.001;
 minFaceWeight 0.02;
 minVolRatio 0.01;
 minTriangleTwist -1;
 nSmoothScale 4;
 errorReduction 0.75;
}
debug 0;
mergeTolerance 1e-6;
EOF
if [ ! -d constant/polyMesh ]; then
    blockMesh > log.blockMesh 2>&1
    snappyHexMesh -overwrite > log.snappyHexMesh 2>&1
    checkMesh -allGeometry -allTopology > log.checkMesh 2>&1 || true
fi
cp "$FOAM_TUTORIALS/multiphase/interFoam/laminar/damBreak/damBreak/constant/transportProperties" constant/
cp "$FOAM_TUTORIALS/multiphase/interFoam/laminar/damBreak/damBreak/constant/turbulenceProperties" constant/
sed 's/(0 -9.81 0)/(0 0 -9.81)/' "$FOAM_TUTORIALS/multiphase/interFoam/laminar/damBreak/damBreak/constant/g" > constant/g
cp "$FOAM_TUTORIALS/multiphase/interFoam/laminar/damBreak/damBreak/system/fvSchemes" system/
cp "$FOAM_TUTORIALS/multiphase/interFoam/laminar/damBreak/damBreak/system/fvSolution" system/
cat > system/controlDict <<'EOF'
FoamFile { version 2.0; format ascii; class dictionary; object controlDict; }
application interFoam;
startFrom startTime;
startTime 0;
stopAt endTime;
endTime 0.25;
deltaT 0.0002;
writeControl adjustable;
writeInterval 0.025;
writeFormat ascii;
writePrecision 7;
adjustTimeStep yes;
maxCo 0.3;
maxAlphaCo 0.3;
maxDeltaT 0.001;
runTimeModifiable yes;
EOF
cat > 0/alpha.water <<'EOF'
FoamFile { version 2.0; format ascii; class volScalarField; object alpha.water; }
dimensions [0 0 0 0 0 0 0];
internalField uniform 0;
boundaryField
{
 inlet { type zeroGradient; }
 outlet { type zeroGradient; }
 sideNeg { type symmetryPlane; }
 sidePos { type symmetryPlane; }
 bottom { type zeroGradient; }
 top { type inletOutlet; inletValue uniform 0; value uniform 0; }
 hull { type zeroGradient; }
}
EOF
cat > 0/U <<'EOF'
FoamFile { version 2.0; format ascii; class volVectorField; object U; }
dimensions [0 1 -1 0 0 0 0];
internalField uniform (-1 0 0);
boundaryField
{
 inlet { type fixedValue; value uniform (-1 0 0); }
 outlet { type pressureInletOutletVelocity; value uniform (-1 0 0); }
 sideNeg { type symmetryPlane; }
 sidePos { type symmetryPlane; }
 bottom { type noSlip; }
 top { type pressureInletOutletVelocity; value uniform (-1 0 0); }
 hull { type noSlip; }
}
EOF
cat > 0/p_rgh <<'EOF'
FoamFile { version 2.0; format ascii; class volScalarField; object p_rgh; }
dimensions [1 -1 -2 0 0 0 0];
internalField uniform 0;
boundaryField
{
 inlet { type fixedFluxPressure; value uniform 0; }
 outlet { type fixedValue; value uniform 0; }
 sideNeg { type symmetryPlane; }
 sidePos { type symmetryPlane; }
 bottom { type fixedFluxPressure; value uniform 0; }
 top { type totalPressure; p0 uniform 0; value uniform 0; }
 hull { type fixedFluxPressure; value uniform 0; }
}
EOF
cat > system/setFieldsDict <<'EOF'
FoamFile { version 2.0; format ascii; class dictionary; object setFieldsDict; }
defaultFieldValues ( volScalarFieldValue alpha.water 0 );
regions
(
 boxToCell
 {
  box (-1 -1 -0.35) (3 1 0.12);
  fieldValues ( volScalarFieldValue alpha.water 1 );
 }
);
EOF
setFields > log.setFields 2>&1
interFoam > log.interFoam 2>&1
grep -q 'End' log.interFoam
foamToVTK -ascii -no-boundary -no-point-data -fields '(alpha.water U p_rgh)' > log.foamToVTK 2>&1
touch hull-flow.foam
printf 'Hull flow test completed to 0.25 seconds at imposed 1 m/s and 0.12 m waterline.\n'
