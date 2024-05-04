let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('threejs-canvas-container').appendChild(renderer.domElement);

let light = new THREE.PointLight(0xFFFFFF, 1, 500);
light.position.set(10, 10, 50);
scene.add(light);

camera.position.z = 50;

function createGem() {
    // Réduction significative de la taille des gemmes
    let geometry = new THREE.OctahedronGeometry(0.001, 0); // Taille encore plus petite
    let material = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.9,
        specular: 0xAAAAAA,
        shininess: 10
    });
    let gem = new THREE.Mesh(geometry, material);
    scene.add(gem);
    return gem;
}

document.addEventListener('click', function(event) {
    let rect = renderer.domElement.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    let y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    let vector = new THREE.Vector3(x, y, -1).unproject(camera);

    let gemCount = 10;
    let gems = [];
    for (let i = 0; i < gemCount; i++) {
        let gem = createGem();
        gem.position.copy(vector);
        let angle = Math.random() * Math.PI * 2;
        let velocity = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
        // Réduction significative de la vitesse initiale
        let speed = 0.0005; // Vitesse très faible pour observer l'animation
        gems.push({gem, velocity, speed});
    }

    function animate() {
        gems.forEach(obj => {
            obj.gem.position.add(obj.velocity.clone().multiplyScalar(obj.speed));
            obj.gem.rotation.x += 0.01;
            obj.gem.rotation.y += 0.01;
            obj.gem.material.opacity -= 0.01;
            if (obj.gem.material.opacity <= 0) {
                scene.remove(obj.gem);
                gems = gems.filter(o => o !== obj);
            }
        });
        if (gems.length > 0) {
            requestAnimationFrame(animate);
        }
    }
    animate();
});

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
render();
