#!/bin/sh
cd "${0%/*}" || exit
. ${WM_PROJECT_DIR:?}/bin/tools/RunFunctions
runApplication blockMesh
runApplication decomposePar
runParallel snappyHexMesh -overwrite
runParallel checkMesh -constant -allGeometry -allTopology
