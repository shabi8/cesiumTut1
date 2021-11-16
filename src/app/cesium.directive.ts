import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appCesium]'
})
export class CesiumDirective implements OnInit {

  constructor(private el: ElementRef) { }

  ngOnInit() {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYWI0YjczNC00ODkwLTRhNTQtYWE2Ny0zNTdlMjYxMzhmOWYiLCJpZCI6NzMzOTAsImlhdCI6MTYzNjg4MTcwMn0.jGOmtmGz1FDfPP7DHqqkyZnvpJWTiBSfXm39YJ_W6-8'
    const viewer = new Cesium.Viewer(this.el.nativeElement, {
      terrainProvider: Cesium.createWorldTerrain()
    });

    const buildingsTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());
    // Fly the camera to San Francisco at the given longitude, latitude, and height.
    viewer.camera.flyTo({
      destination : Cesium.Cartesian3.fromDegrees(-104.9965, 39.74248, 4000),
      orientation : {
        heading : Cesium.Math.toRadians(0.0),
        pitch : Cesium.Math.toRadians(-15.0),
      }
    });

    async function addBuildingGeoJSON() {
      // Load the GeoJSON file from Cesium ion.
      const geoJSONURL = await Cesium.IonResource.fromAssetId(676323);
      // Create the geometry from the GeoJSON, and clamp it to the ground.
      const geoJSON = await Cesium.GeoJsonDataSource.load(geoJSONURL, { clampToGround: true });
      // Add it to the scene.
      const dataSource = await viewer.dataSources.add(geoJSON);
      // By default, polygons in CesiumJS will be draped over all 3D content in the scene.
      // Modify the polygons so that this draping only applies to the terrain, not 3D buildings.
      for (const entity of dataSource.entities.values) {
        entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
      }
      // Move the camera so that the polygon is in view.
      viewer.flyTo(dataSource);
    }
    addBuildingGeoJSON();

    // Hide individual buildings in this area using 3D Tiles Styling language.
    buildingsTileset.style = new Cesium.Cesium3DTileStyle({
    // Create a style rule to control each building's "show" property.
    show: {
      conditions : [
        // Any building that has this elementId will have `show = false`.
        ['${elementId} === 332469316', false],
        ['${elementId} === 332469317', false],
        ['${elementId} === 235368665', false],
        ['${elementId} === 530288180', false],
        ['${elementId} === 530288179', false],
        // If a building does not have one of these elementIds, set `show = true`.
        [true, true]
      ]
    },
    // Set the default color style for this particular 3D Tileset.
    // For any building that has a `cesium#color` property, use that color, otherwise make it white.
    color: "Boolean(${feature['cesium#color']}) ? color(${feature['cesium#color']}) : color('#ffffff')"
  });

    const newBuildingTileset = viewer.scene.primitives.add(
      new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(676352)
      })
    );
    // Move the camera to the new building.
    viewer.flyTo(newBuildingTileset);


  }

}
