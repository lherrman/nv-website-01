import * as THREE from 'three';


let camera, scene, renderer, stats, material_lines, material_particles;
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

    window.scrollTo(0, 0); // Dirtyfix for scrollpos issue

    // Create Camera Object
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 2, 2000);
    camera.position.z = 1000;

    // Create Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000010, 0.002);
    //scene.background = new THREE.TextureLoader().load('space.jpg');


    // Add Particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const sprite = new THREE.TextureLoader().load('img/disc.png');
    const line_vertices = [];

    /*
    let numVerts = 10000;
    
    for (let i = 0; i<numVerts; i++) {
        const x = 2000 * Math.random() - 1000;
        const y = 2000 * Math.random() - 1000;
        const z = 2000 * Math.random() - 1100;
        vertices.push(x, y, z);
    }
*/
    let numLayers = 8;
    let numWeights = 8;
    let numDepth = 10
    let spacingL = 80;
    let spacingW = 70;
    let spacingD = 40;
    let vec_matrix = Array.from(Array(spacingL), () => new Array(spacingW))
    for (let i = 0; i < vec_matrix.length; i++) {
        for (let j = 0; j < vec_matrix[0].length; j++) {
            vec_matrix[i][j] = new Array(numDepth);
        }
    }

    for (let l = 0; l < numLayers; l++) {
        for (let w = 0; w < numWeights; w++) {
            for (let d = 0; d < numDepth; d++) {

                let startX = -((numLayers * spacingL) / 2) + spacingL / 2;
                let startY = -((numWeights * spacingW) / 2) - spacingW / 2;
                const x = startX + (l * spacingL) + ((Math.random()-0.5) * 40);
                const y = startY + (w * spacingW) + ((Math.random()-0.5) * 40);
                const z = 800 + (Math.random() * 0) - (d * spacingD);
                vertices.push(x, y, z);

                vec_matrix[l][w][d] = new THREE.Vector3(x, y, z)

                if (l > 0) {
                    for (let i = 0; i < numWeights; i++) {
                        if (Math.random() > 0.5 && Math.abs(i - w) < 2 ) {
                            line_vertices.push(new THREE.Vector3(x+0.5, y+0.5, z - 1))
                            line_vertices.push(vec_matrix[l - 1][i][d])
                        }
                    }
                }
            }
        }
    }


    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    material_particles = new THREE.PointsMaterial({ size: 4, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true });
    material_particles.color.setRGB(0.8, 0.8, 1);

    const particles = new THREE.Points(geometry, material_particles);
    scene.add(particles);


    // Add Lines between Particles
    const material_lines = new THREE.LineBasicMaterial({
        color: 0x1c1b22,
        linewidth: 4
    });
    const geometry_lines = new THREE.BufferGeometry().setFromPoints(line_vertices);
    const line = new THREE.Line(geometry_lines, material_lines)
    scene.add(line);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( 0x03030a, 1 );
    
    document.body.appendChild(renderer.domElement);


    document.body.style.touchAction = 'none';
    document.body.addEventListener('pointermove', onPointerMove);

    window.addEventListener('resize', onWindowResize);

    if (screen.orientation) { // Property doesn't exist on screen in IE11   
        screen.orientation.addEventListener("change", onOrientationchange);
    }

    const navlogo = document.querySelector('.nav-logo')
    const navbar = document.querySelector('.navbar')
    window.onscroll = function () {
        // pageYOffset or scrollY
        if (window.pageYOffset > 400) {
            navbar.classList.add('scrolled')
        } else {
            navbar.classList.remove('scrolled')
        }
    }




};



function onWindowResize() {
    let isMobile = window.matchMedia("(pointer:coarse)").matches;
    if (!isMobile) {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function onOrientationchange() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}




function onPointerMove(event) {

    if (event.isPrimary === false) return;

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

}


function animate() {

    requestAnimationFrame(animate);

    render();


}

function render() {

    const time = Date.now() * 0.00005;

    let mouseCameraMul = 0.05;
    let mouseCameraSpeed = 0.05;
    camera.position.x += (mouseX * mouseCameraMul - camera.position.x) * mouseCameraSpeed;
    camera.position.y += (- mouseY * mouseCameraMul - camera.position.y) * mouseCameraSpeed;
    scene.position.y = (window.scrollY * 0.2) + 65

    //camera.position.y = (-window.scrollY * 0.2) + 80 + (- mouseY - camera.position.y) * mouseCameraMul;

    //camera.position.x = (mouseX - camera.position.x) * mouseCameraMul;

    camera.lookAt(scene.position);

    //const h = (360 * (1.0 + time) % 360) / 360;
    //material.color.setHSL(h, 0.5, 0.5);

    renderer.render(scene, camera);



}