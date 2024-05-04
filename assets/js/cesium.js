// Utiliser l'accessToken en fonction du mode de développement
let accessToken;

if (window.isDevelopment) {
    accessToken = window.env.ACCESS_TOKEN; // Accès à l'accessToken en mode développement
} else {
    accessToken = '${{ secrets.ACCESS_TOKEN }}'; // Accès à l'accessToken en mode production
}

Cesium.Ion.defaultAccessToken = accessToken;

// Create a Cesium Viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: Cesium.createWorldTerrain(),
  animation: false,
  baseLayerPicker: false,
  fullscreenButton: false,
  vrButton: false,
  sceneModePicker: false,
  homeButton: false,
  navigationHelpButton: false,
  timeline: false,
  geocoder: false,
  sceneMode: Cesium.SceneMode.SCENE3D,
});

// Enable lighting for the globe
viewer.scene.globe.enableLighting = true;

// Function to rotate the globe
function rotateGlobe() {
  const factor = 0.001; // Adjust rotation speed as needed
  viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -factor);
}

// Rotate the globe every 50 milliseconds
setInterval(rotateGlobe, 50);

// Votre fichier JSON
const skyboxData = {
  "show": true,
  "sourcesType": "default",
  "sourcesList": [
    {
      "name": "default",
      "sources": {
        "positiveX": "https://cesium-sky-box.vercel.app/Assets/Textures/SkyBox/tycho2t3_80_px.jpg",
        "negativeX": "https://cesium-sky-box.vercel.app/Assets/Textures/SkyBox/tycho2t3_80_mx.jpg",
        "positiveY": "https://cesium-sky-box.vercel.app/Assets/Textures/SkyBox/tycho2t3_80_py.jpg",
        "negativeY": "https://cesium-sky-box.vercel.app/Assets/Textures/SkyBox/tycho2t3_80_my.jpg",
        "positiveZ": "https://cesium-sky-box.vercel.app/Assets/Textures/SkyBox/tycho2t3_80_pz.jpg",
        "negativeZ": "https://cesium-sky-box.vercel.app/Assets/Textures/SkyBox/tycho2t3_80_mz.jpg"
      }
    }
  ]
};

// Utilisation de la partie "default"
const defaultSkybox = skyboxData.sourcesList.find(skybox => skybox.name === "default").sources;

// Création du SkyBox avec les images de la partie "default"
const customSkybox = new Cesium.SkyBox({
  sources: defaultSkybox
});

// Assignation du SkyBox personnalisé à la scène
viewer.scene.skyBox = customSkybox;
