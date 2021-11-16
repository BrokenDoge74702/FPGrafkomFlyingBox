//variables
var container, scene, camera, renderer, controls, player;
var cons = 0;
const start = document.querySelector("#start");
var audio = new Audio('./assets/music/mainmenu.mp3');

//variables field
var plane;
var fieldWidth = 2000;
var fieldHeight = 500;
var fieldDepth = 100;

function mainloop() {
    init();
    animate();
    audio.play();
}

//button start
start.addEventListener('click', (e) => {
    cons++
    mainloop()
})

function init() {
    // Scene
    scene = new THREE.Scene();
    // Camera
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 1, 20000);
    camera.position.set(200, 200, 500);

    renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true
    });
    renderer.setSize(screenWidth * 0.85, screenHeight * 0.85);
    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);

    THREEx.WindowResize(renderer, camera);

    //light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;

    scene.add(ambientLight, pointLight);
    // main playergeometry
    var boxGeometry = new THREE.BoxGeometry(50, 50, 50);
    var wireMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
    });
    player = new THREE.Mesh(boxGeometry, wireMaterial);
    player.position.set(0, 25, -20);
    scene.add(player);
    //lantai
    var QualityPlane = 10;
    var planeMaterial = new THREE.MeshLambertMaterial(
        {color: "#000000"}
    );
    plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(fieldWidth, fieldHeight, QualityPlane, QualityPlane),planeMaterial);
    scene.add(plane);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}
