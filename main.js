import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { PointerLockControls } from './controls.js';

function main() {
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -10, 0)
})

const timeStep = 1/60
const maxInfoDistance = 4

const canvas = document.querySelector('#c');
const infoTitle = document.querySelector('#infotitle')
const infoText = document.querySelector('#infotext')
const infoContain = document.querySelector('#infocontain')

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
let infoShown = false
let selectedPainting 
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

    let closestDist = Infinity
    let closestPainting
    if (!(selectedPainting && selectedPainting[4].position.distanceTo(camera.position) < maxInfoDistance)) {
        for (let i = 0; i < paintings.length; i++) {
            const painting = paintings[i];
            const paintingObj = painting[4]
            let distance = paintingObj.position.distanceTo(camera.position)
            if (distance < closestDist) {
                closestPainting = painting
                closestDist = distance
            }
        }
        if (closestDist < maxInfoDistance) {
            selectedPainting = closestPainting
            infoTitle.innerHTML = closestPainting[2]
            infoText.innerHTML = closestPainting[3]
            if (!infoShown) {
                infoContain.classList.remove("infohide")
                infoShown = true
            }
        } else if (infoShown) {
            selectedPainting = null
            infoContain.classList.add("infohide")
            infoShown = false
        }
    }
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
let white = new THREE.MeshPhongMaterial(color1)

// geometryLists[color1] = []

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

function makePaintingMaterial(picture) {
    return [
        white,  
        white,
        white,
        white,
        new THREE.MeshBasicMaterial({map: textureLoader.load(picture)}),
        white,    
    ]
}

let paintings = [
    [makePaintingMaterial('./resources/PicExample.jpg'), 1, "Schilderij van DALL-E 2", ""],
    [makePaintingMaterial('./resources/cubism.png'), 1, "Schilderij van DALL-E 2", "Dit is een kunstwerk dat werd gemaakt door een AI, genaamd Dall e2. Dit kunstwerk is een kubistisch werk gemaakt door een AI. Ook is de gulden snede hier zeer aanwezig in dit portret.  Hiermee wordt er harmonie gecreëerd. Ook wordt het menselijke, de mens, hier afgebeeld als een opeenstapeling van kubistische figuren."],
    [makePaintingMaterial('./resources/impressionism.png'), 1, "Schilderij van DALL-E 2", "Een kunstwerk gegenereerd door een AI-model. Het impressionisme is duidelijk aanwezig in dit werk. Hiermee doet het de kijker ervan inleven in het moment. De nadruk ligt hier duidelijk op de kleur en het licht dat hiermee gemoeid is. Je ziet wel dat het bloemen zijn, maar ook niet meer dan dat."],
    [makePaintingMaterial('./resources/2 soldaten schilderij.jpg'), 500/389, "De eed van de Horatii door Jacques-Louis David (1784)", "De schilderkunst is neoclassicisme en zit boordevol gulden sneden. Zo zijn de 2 horatii's (soldaten) links op zo'n manier opgesteld dat ze de gulden snede vormen met de rest van het schilderij. Ook hun benen t.o.v. hun romp, hun hand t.o.v. hun arm..."],
    [makePaintingMaterial('./resources/schepping van Adam.jpg'), 260/121,"Schepping van Adam door Michelangelo", "Deze fresco is een illustratie van het scheppingsverhaal 'Genesis'. We zien God Adam creëren. De lengte van Adam en de lengte van God op de fresco voldoen aan de gulden ratio. Dit betekent dat de arm van Adam (links) dezelfde verhouding heeft t.o.v. van Gods arm als de arm van God t.o.v. het geheel. "]
]

function makeSchool(scene, world) {
    // let teacher = new Teacher(scene, world, new THREE.Vector3(1,1,1), 0x000000, 0x333333, 0xffe4e1)
    
    let gebouwA = [

    ]
    let museum = 
[[0xa3a2a5, -2.25, 2, 2.25, 2.75, 3.5, 0.25, 0, 0, 0, true, true],
[0x00ffff, 0.125, 1.625, 2.25, 2, 2.75, 0.15000000596046448, 0, 0, 0, true, true],
[0xa3a2a5, 0.125, 3.375, 2.25, 2, 0.75, 0.25, 0, 0, 0, true, true],
[0xa3a2a5, 0.12499809265136719, 3.875, -16.625, 38, 0.25, 38, 0, 0, 0, true, true],
[0xa3a2a5, 2.5, 2, 2.25, 2.75, 3.5, 0.25, 0, 0, 0, true, true],
[0xa3a2a5, 0.125, 0.125, -16.625, 38, 0.25, 38, 0, 0, 0, true, true],
[0xa3a2a5, 4, 2, -5.25, 0.25, 3.5, 15.25, 0, 0, 0, true, true],
[0xa3a2a5, 11.625, 2, -12.75, 15, 3.5, 0.25, 0, 0, 0, true, true],
[0xa3a2a5, 19, 2, -16.75, 0.25, 3.5, 7.75, 0, 0, 0, true, true],
[0xa3a2a5, 11.375, 2, -20.5, 15, 3.5, 0.25, 0, 0, 0, true, true],
[0xa3a2a5, 4, 2, -28.125, 0.25, 3.5, 15, 0, 0, 0, true, true],
[0xa3a2a5, 0, 2, -35.5, 7.75, 3.5, 0.25, 0, 0, 0, true, true],
[0xa3a2a5, -3.750000476837158, 2, -27.875, 0.25, 3.5, 15, 0, 0, 0, true, true],
[0xa3a2a5, -11.375, 2, -20.5, 15, 3.5, 0.25, 0, 0, 0, true, true],
[0xa3a2a5, -18.75, 2, -16.5, 0.25, 3.5, 7.75, 0, 0, 0, true, true],
[0xa3a2a5, -11.125, 2, -12.75, 15, 3.5, 0.25, 0, 0, 0, true, true],
[0xa3a2a5, -3.75, 2, -5.125, 0.25, 3.5, 15, 0, 0, 0, true, true],
]
    let paintingObjects = 
    
    
[[0xf8f8f8, 0.125, 2, -35.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
[0xf8f8f8, 3.8500003814697266, 2, -2.375, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
[0xf8f8f8, -3.599998950958252, 2, -8.375, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
[0xf8f8f8, -3.599998950958252, 2, -2.375, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
[0xf8f8f8, -8.125, 2, -20.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
[0xf8f8f8, -14.249999046325684, 2, -12.775007247924805, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
[0xf8f8f8, -7.749999046325684, 2, -12.775004386901855, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
[0xf8f8f8, 14.499999046325684, 2, -12.77499771118164, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
[0xf8f8f8, 8, 2, -12.77500057220459, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
[0xf8f8f8, 3.8500003814697266, 2, -8.375, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
[0xf8f8f8, -3.599998950958252, 2, -24.875, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
[0xf8f8f8, -3.599998950958252, 2, -30.875, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
[0xf8f8f8, 3.8500003814697266, 2, -24.875, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
[0xf8f8f8, 3.8500003814697266, 2, -30.875, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
[0xf8f8f8, 18.849998474121094, 2, -16.625, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
[0xf8f8f8, 14.375, 2, -20.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
[0xf8f8f8, 8.375, 2, -20.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
[0xf8f8f8, 8.375, 2, -12.899999618530273, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
[0xf8f8f8, 14.375, 2, -12.899999618530273, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
[0xf8f8f8, -18.599998474121094, 2, -16.624998092651367, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
[0xf8f8f8, -14.125, 2, -12.899999618530273, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
[0xf8f8f8, -8.125, 2, -12.899999618530273, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
[0xf8f8f8, -14.125, 2, -20.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
]

    

    for (let i = 0; i < paintings.length; i++) {
        const painting = paintings[i]
        let paintingObj = paintingObjects[i]
        paintingObj[0] = painting[0]
        paintingObj[4] = paintingObj[5] * painting[1] //Setting aspect ratio, width = height * width/height
        painting[4] = makeStaticBlock(scene, world, paintingObj, false)[0]
    }

    fillStaticBlockList(scene, world, museum, true)

    mergeListedGeometries(scene, geometryLists)
    
}

function fillStaticBlockList(parent, world, blocks, merge) {
    let blockList = []
    for (let i = 0; i < blocks.length; i++) {
        const boxInfo = blocks[i];
        blockList.push(makeStaticBlock(parent, world, boxInfo, merge))
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

function makeThreeOnlyBlock(scene, position, size, orientation, color, merge) {
    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    
    if (merge) {
        boxGeometry.rotateX(orientation.x)
        boxGeometry.rotateY(orientation.y)
        boxGeometry.rotateZ(orientation.z)
        boxGeometry.translate(position.x, position.y, position.z)
    }
    let material = color
    
    if (typeof(color) === "number") {
        if (!colors[color]) {
            colors[color] = new THREE.MeshPhongMaterial({color: color})
            if (merge) {
                geometryLists[color] = []
            }
        }
        if (merge) {
            geometryLists[color].push(boxGeometry)
            return
        }
        
        material = colors[color].material
    }
    
    const boxObject = new THREE.Mesh(boxGeometry, material)
    if (!merge) {
        boxObject.rotateX(orientation.x)
        boxObject.rotateY(orientation.y)
        boxObject.rotateZ(orientation.z)
        boxObject.position.copy(position)
    }
    scene.add(boxObject)
    return boxObject
}

function makeCannonOnlyBlock(world, position, size, orientation) {
    const boxBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2)),
        position: new CANNON.Vec3(position.x, position.y, position.z),
    })
    let orientationQat = new CANNON.Quaternion()
    orientationQat.setFromEuler(orientation.x, orientation.y, orientation.z)
    boxBody.quaternion.copy(orientationQat)
    world.addBody(boxBody)
    return boxBody
}

function makeStaticBlock(parent, world, box, merge) {
    let position = new THREE.Vector3(box[1],box[2],box[3])
    let size = new THREE.Vector3(box[4],box[5],box[6])
    let orientation = new THREE.Vector3(box[7], box[8], box[9])
    let color = box[0]
    let canCollide = box[10]
    let canSee = box[11]
   
    let orientationRad = new THREE.Vector3(
        THREE.MathUtils.degToRad(orientation.x),
        THREE.MathUtils.degToRad(orientation.y),
        THREE.MathUtils.degToRad(orientation.z)
    );
    //orientationRad = new THREE.Vector3(0, 0, 0)
    let boxObject, boxBody
    if (canSee) {
        boxObject = makeThreeOnlyBlock(parent, position, size, orientationRad, color, merge)
    }
    if (canCollide) {
        if (!parent.isScene) {
            position.addVectors(parent.position, position)
        }  
        boxBody = makeCannonOnlyBlock(world, position, size, orientationRad)
    }
    return [boxObject, boxBody]
}

main()
