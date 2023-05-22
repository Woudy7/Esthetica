import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { PointerLockControls } from './controls.js';

function main() {
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -10, 0)
})

const timeStep = 1/60

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.2;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

const scene = new THREE.Scene();




let sphereShape = new CANNON.Sphere(0.5)
let sphereBody = new CANNON.Body({ mass: 5 });
sphereBody.addShape(sphereShape);
sphereBody.position.set(0,2,0);
sphereBody.linearDamping = 0.5
sphereBody.angularDamping = 0
world.addBody(sphereBody);

const Controls = new PointerLockControls(camera, sphereBody, canvas)

scene.background = new THREE.Color(0xA0E2FF)
{
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
}

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2)
scene.add(ambientLight)

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
}


const groundBody = new CANNON.Body({
    shape: new CANNON.Plane(),
    type: CANNON.Body.STATIC
})
world.addBody(groundBody)
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)




const color = 0x00FF00
const floorMaterial = new THREE.MeshPhongMaterial({color})
const floorGeometry = new THREE.PlaneGeometry(100, 100)
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
scene.add(floor)

floor.position.copy(groundBody.position)
floor.quaternion.copy(groundBody.quaternion)





makeSchool(scene, world)



let hasPointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;

if (hasPointerLock) {
canvas.addEventListener("click", async () => {
    await canvas.requestPointerLock({
        unadjustedMovement: true
    })
    Controls.connect()

})
} else {
    alert("Damn you don't have pointerlock, this might not work unless you got chrome or firefox bitch")
}



function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
    renderer.setSize(width, height, false);
    }
    return needResize;
}
let lastTime = 0
function render(time) {
    let timeSeconds = time * 0.001;  // convert time to seconds
    let deltaTime = time-lastTime
    
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

    }

    Controls.update(deltaTime)
    
    world.step(timeStep)


    renderer.render(scene, camera);
    lastTime = time
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

}
const textureLoader = new THREE.TextureLoader()
let colors = []
let geometryLists = []


let color1 = 0xf8f8f8
let white = new THREE.MeshBasicMaterial(color1)
colors[color1] = 
    new THREE.MeshBasicMaterial({map: textureLoader.load('./resources/PicExample.jpg')})
geometryLists[color1] = []

class Teacher {
    constructor(scene, world, position, shirtColor, pantsColor, skinColor, hairColor, hairPositions) {
        const body = new THREE.Object3D()
        body.position.set(position.x, position.y, position.z)
        scene.add(body)
        let bodyBlocks = [
            [shirtColor, 0, 0.125, 0, 0.5, 0.75, 0.25],
            [shirtColor, -0.40625, 0.125, 0, 0.1875, 0.75, 0.25],
            [shirtColor, 0.40625, 0.125, 0, 0.1875, 0.75, 0.25],
            [pantsColor, 0.15625, -0.625, 0, 0.1875, 0.75, 0.25],
            [pantsColor, -0.15625, -0.625, 0, 0.1875, 0.75, 0.25],
            [skinColor, 0, 0.6875, 0, 0.25, 0.25, 0.25],
        ]
    
        let bodyParts = fillStaticBlockList(body, world, bodyBlocks)
        console.log(bodyParts)
    }
}

function makeSchool(scene, world) {
    // let teacher = new Teacher(scene, world, new THREE.Vector3(1,1,1), 0x000000, 0x333333, 0xffe4e1)
    
    let gebouwA = [

    ]
    let museum = 
    [[0xa3a2a5, 8.75, 2, 2.25, 15.25, 3.5, 0.25, true, true],
[0xa3a2a5, 0.125, 3.375, 2.25, 2, 0.75, 0.25, true, true],
[0xa3a2a5, -8.5, 2, 2.25, 15.25, 3.5, 0.25, true, true],
[0xa3a2a5, 0.125, 0.125, -18.625, 32.5, 0.25, 42, true, true],
[0xa3a2a5, 16.25, 2, -18.625, 0.25, 3.5, 41.5, true, true],
[0xa3a2a5, 0.125, 2, -39.5, 32.5, 3.5, 0.25, true, true],
[0xa3a2a5, -16, 2, -18.625, 0.25, 3.5, 41.5, true, true],
[0xa3a2a5, 0.125, 3.875, -18.625, 32.5, 0.25, 42, true, true],
[0xa3a2a5, 6.125, 2, -6.875, 6, 3.5, 6, true, true],
[0xa3a2a5, -5.875, 2, -6.875, 6, 3.5, 6, true, true],
[0xa3a2a5, 0.125, 2, -18.875, 18, 3.5, 6, true, true],
[0xa3a2a5, -5.875, 2, -30.875, 6, 3.5, 6, true, true],
[0xa3a2a5, 6.125, 2, -30.875, 6, 3.5, 6, true, true],
[0xf8f8f8, -5.875, 2, -3.8499999046325684, 3.5, 2, 0.04999999701976776, true, true],
[0xf8f8f8, -5.875, 2, -9.90000057220459, 3.5, 2, 0.04999999701976776, true, true],
[0xf8f8f8, -2.8499984741210938, 2, -6.875, 0.04999999701976776, 2, 3.5, true, true],
[0xf8f8f8, -8.899999618530273, 2, -6.875, 0.04999999701976776, 2, 3.5, true, true],
[0xf8f8f8, 9.150001525878906, 2, -6.875, 0.04999999701976776, 2, 3.5, true, true],
[0xf8f8f8, 3.1000003814697266, 2, -6.875, 0.04999999701976776, 2, 3.5, true, true],
[0xf8f8f8, 6.125, 2, -3.8499999046325684, 3.5, 2, 0.04999999701976776, true, true],
[0xf8f8f8, 6.125, 2, -9.90000057220459, 3.5, 2, 0.04999999701976776, true, true],
[0x00ffff, 0.125, 1.625, 2.25, 2, 2.75, 0.15000000596046448, true, true],
]
    
    fillStaticBlockList(scene, world, museum, true)

    mergeListedGeometries(scene, geometryLists)
    
}

function fillStaticBlockList(parent, world, blocks, merge) {
    let blockList = []
    for (let i = 0; i < blocks.length; i++) {
        const box = blocks[i];
        blockList.push(makeStaticBlock(parent, world, new THREE.Vector3(box[1],box[2],box[3]), new THREE.Vector3(box[4],box[5],box[6]), box[0], box[7], box[8], merge))
    }
    return blockList
}

function mergeListedGeometries(parent, list) {
    for (const [color, geometryList] of Object.entries(list)) {
        mergeGeometries(parent, colors[color], geometryList)
    }
}

function mergeGeometries(parent, material, geometries) {
    let mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)
    let mergedMesh = new THREE.Mesh(mergedGeometry, material)
    parent.add(mergedMesh)
}

function makeThreeOnlyBlock(scene, position, size, color, merge) {
    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    boxGeometry.translate(position.x, position.y, position.z)
    if (!colors[color]) {
        colors[color] = new THREE.MeshPhongMaterial({color: color})
        geometryLists[color] = []
    }
    if (merge) {
        geometryLists[color].push(boxGeometry)
        return
    }
    let material = colors[color].material

    const boxObject = new THREE.Mesh(boxGeometry, material)
    
    scene.add(boxObject)
    return boxObject
}

function makeCannonOnlyBlock(world, position, size) {
    const boxBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2)),
        position: new CANNON.Vec3(position.x, position.y, position.z)
    })
    world.addBody(boxBody)
    return boxBody
}

function makeStaticBlock(parent, world, position, size, color, canCollide, canSee, merge) {
    let boxObject, boxBody
    if (canSee) {
        boxObject = makeThreeOnlyBlock(parent, position, size, color, merge)
    }
    if (canCollide) {
        if (!parent.isScene) {
            position.addVectors(parent.position, position)
        }  
        boxBody = makeCannonOnlyBlock(world, position, size)
    }
    return [boxObject, boxBody]
}

main()
