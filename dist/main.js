import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
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

renderer.outputColorSpace = THREE.SRGBColorSpace;



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
    const intensity = 0.1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
}

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.65)
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





makeMuseum(scene, world)



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
    alert("Deze browser supporteert de pointerlock API niet, het kan dat de site dan niet volledig werkt.")
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

// Not used class
class Person {
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
    [makePaintingMaterial('./resources/Leyers.jpg'), 732/1261,
    "Leyers", 'Een kunstwerk dat we nodig hebben maar niet hebben verdiend. Het is bewezen dat Leyers een mathematisch perfect persoon is in elk aspect. Meetkundig heeft hij de perfecte figuur en mentaal heeft hij een brein dat veel verder ontwikkeld is dan dat van de gemiddelde WEWI-leerling. Elke foto van hem wordt automatisch als kunst beschouwd.'],
    [makePaintingMaterial('./resources/impressionism.png'), 1, "Schilderij van DALL-E 2", 
        "Een kunstwerk gegenereerd door een AI-model. Het impressionisme is duidelijk aanwezig in dit werk. Hiermee doet het de kijker ervan inleven in het moment. De nadruk ligt hier duidelijk op de kleur en het licht dat hiermee gemoeid is. Je ziet wel dat het bloemen zijn, maar ook niet meer dan dat."],
    [makePaintingMaterial('./resources/2 soldaten schilderij.jpg'), 500/389, "De eed van de Horatii door Jacques-Louis David (1784)", 
        "De schilderkunst is neoclassicisme en zit boordevol gulden sneden. Zo zijn de 3 horatii's (soldaten) links op zo'n manier opgesteld dat ze de gulden snede vormen met de rest van het schilderij. Ook hun benen t.o.v. hun romp, hun hand t.o.v. hun arm..."],
    [makePaintingMaterial('./resources/schepping van Adam.jpg'), 260/121,"Schepping van Adam door Michelangelo", 
        "Deze fresco is een illustratie van het scheppingsverhaal 'Genesis'. We zien God Adam creëren. De lengte van Adam en de lengte van God op de fresco voldoen aan de gulden ratio. Dit betekent dat de arm van Adam (links) dezelfde verhouding heeft t.o.v. van Gods arm als de arm van God t.o.v. het geheel. "],
        [makePaintingMaterial('./resources/GalaxyCat.jpg'), 1/1,
        "Schilderij van DALL-E 2", 'Een schilderij gemaakt door DALL-E 2 met prompt "A galaxy cat sleeping by a fire, digital art".<br><br>Bij het gebruiken van generative AI zijn er bepaalde technieken die mensen gebruiken om betere resultaten te krijgen, zoals hier de toevoeging van "digital art" achter de prompt om een mooi resultaat te krijgen. Het toepassen van dit soort technieken wordt vaak "prompting" genoemd. Er zijn verschillende online communities waarbij men tips deelt om goed te kunnen "prompten".'],
        [makePaintingMaterial('./resources/Fox.jpg'), 1/1,
        "Schilderij van DALL-E 2", 'Een schilderij gemaakt door DALL-E 2 met prompt "A fox on a hill staring over forests in the night. The sky if full of stars, digital art".<br><br>Zelfs met spellingsfouten kan de AI nog een afbeelding maken van de prompt.'],
    [makePaintingMaterial('./resources/WorldExplode.jpg'), 1/1,
        "Schilderij van DALL-E 2", 'Een schilderij gemaakt door DALL-E 2 met prompt "The world exploding as the gods watch, digital art". Het lijkt alsof het een episch verhaal toont over een strijd waar wij niet van weten.'],
    [makePaintingMaterial('./resources/Gondalpo.jpg'), 1/1,
        "Schilderij van DALL-E 2", 'Een schilderij gemaakt door DALL-E 2 met prompt "A gondalpho standing next to a contama, painting". <br><br>Bij niet bestaande woorden maakt de AI nog altijd een afbeelding, de AI kan namelijk voor alle mogelijke teksten en beschrijvingen een afbeelding maken. Het interpreteerd dan gewoon hoe dat het er moet uitzien. In dit geval werd "Gondalpo" waarschijnlijk geïnterpreteerd als een gondel.'],
               [makePaintingMaterial('./resources/cubism.png'), 1, "Schilderij van DALL-E 2", 
        "Dit is een kunstwerk dat werd gemaakt door een AI, genaamd Dall e2. Dit kunstwerk is een kubistisch werk gemaakt door een AI. Ook is de gulden snede hier zeer aanwezig in dit portret.  Hiermee wordt er harmonie gecreëerd. Ook wordt het menselijke, de mens, hier afgebeeld als een opeenstapeling van kubistische figuren."],

        [makePaintingMaterial('./resources/ThePersistenceOfMemory.jpg'), 750/570,
        "The Persistence of Memory  (De Volharding der Herinnering) door Salvador Dalí", "Dit surrealistische schilderij toont vervormde horloges die lijken te smelten en hangen over objecten. Hoewel het schilderij niet strikt geometrisch is, bevat het elementen van meetkunde, zoals de gestructureerde compositie en de nauwkeurige weergave van objecten."],
    [makePaintingMaterial('./resources/Kanagawa.jpg'), 500/348,
        "The Great Wave off Kanagawa (De Grote Golf van Kanagawa) door Katsushika Hokusai", "Dit iconische Japanse houtblokafdruk toont een gigantische golf die de kust overspoelt, met op de achtergrond de berg Fuji. Hoewel het schilderij niet direct wiskundige vormen bevat, maakt het gebruik van de principes van lineaire perspectief en diagonale lijnen om diepte en beweging te creëren. Deze wiskundige concepten spelen een belangrijke rol in de compositie en visuele impact van het werk."],
    [makePaintingMaterial('./resources/Fractal.jpg'), 640/400,
        "Fractal", "Dit is een voorbeeld van een fractal, een meetkundige figuur die zelfgelijkend is met een oneindige hoeveelheid details."],
    [makePaintingMaterial('./resources/MandelBrot.jpg'), 512/384,
        "Mandelbrotfractal", "Dit is een van de meest bekende fractalen, het is zelfgelijkend wat betekent dat het is opgebouwd uit delen die grotendeels gelijkvormig zijn met de figuur zelf. Als je de mathematische versie van deze figuur hebt dan kan je er oneindig lang op inzoomen met een verscheidenheid aan patronen dat verschijnt, vaak patronen die zich herhalen op verschillende niveaus van grootte."],
                [makePaintingMaterial('./resources/SiteFoto.png'), 500/246,
        "Deze site zelf", 'Een voorbeeld van hoe dat wiskunde en kunst samen kunnen komen is deze site. Een digitaal museum. Het kunstaspect is duidelijk zichtbaar aan de schilderijen die hier hangen  en de wiskunde ligt overal onder de werking van de site. Om dit beeld dat je nu ziet te creëren is er een gigantische hoeveelheid wiskunde nodig. Ook om toe te laten dat je kan bewegen en rondkijken is er wiskunde nodig. Dit is gemengd met de nood om "mooi" te programmeren. Er zijn mensen die zelfs denken dat programmeren een soort kunst op zich is. Daardoor zou deze site zelf ook geïnterpreteerd kunnen worden als een kunstwerk.'],
    
           [makePaintingMaterial('./resources/SchoolAthene.jpg'), 266/206,
        '"De School van Athene" (Scuola di Atene) door Rafaël', 'Dit beroemde fresco uit 1510 is te vinden in de Apostolische Paleizen van het Vaticaan. Het schilderij beeldt een groep klassieke filosofen uit, waaronder Plato en Aristoteles. Rafaël heeft verschillende wiskundige concepten in het schilderij verwerkt, zoals meetkunde en perspectief. De centrale figuur, Plato, houdt bijvoorbeeld een boek vast waarop een diagram van een regelmatig dodecaëder (een veelvlak met twaalf regelmatige vijfhoekige vlakken) te zien is.'],
    [makePaintingMaterial('./resources/PenroseTrappen.jpg'), 270/345,
    '"De Penrose-trappen" (Waterfall) door M.C. Escher', 'Dit beroemde lithografische werk uit 1961 toont een ogenschijnlijk onmogelijke constructie van een trap die oneindig lijkt te stijgen. Escher was gefascineerd door wiskundige concepten en maakte gebruik van principes zoals optische illusie en meetkunde om zijn kunstwerken te creëren. De Penrose-trappen zijn een voorbeeld van een paradoxale structuur die gebaseerd is op het werk van de Britse wiskundige Sir Roger Penrose.'],
    [makePaintingMaterial('./resources/Melancholie.jpg'), 266/388,
    '"De Melancholie I" door Albrecht Dürer', 'Deze gravure uit 1514 is een complex allegorisch werk waarin verschillende elementen samenkomen, waaronder wiskundige symbolen en meetinstrumenten. Het schilderij toont een engelachtige figuur omringd door wiskundige objecten, zoals een passer, een dobbelsteen en een meetlat. Het werk heeft verschillende interpretaties, maar wordt vaak geassocieerd met het concept van creatieve en intellectuele melancholie.'],
    [makePaintingMaterial('./resources/VitruvianMan.jpg'), 452/614,
        "The Vitruvian Man (De Vitruviaanse Man) door Leonardo da Vinci", 
        "Deze beroemde tekening toont een naakte man in twee overlappende posities, met zijn ledematen en romp geplaatst binnen een cirkel en een vierkant. Het werk illustreert de principes van de gulden snede en de verhoudingen van het menselijk lichaam, wat belangrijke wiskundige concepten zijn."],
        [makePaintingMaterial('./resources/Yannita.jpg'), 1/1,
        "Schilderij van DALL-E 2", 'Een schilderij gemaakt door DALL-E 2 met prompt "A painting of a landscape in the style of Josh Yannita". <br><br>Ook bij niet bestaande artiesten of stijlen moet de AI een interpretatie proberen maken van de beschrijving. Hierbij kunnen er verscheidende resultaten zijn zoals dit schilderij.'],

      //[0xffffff, 1/1, "Engelenbeeld door Vicente Betoret Ferrero", "Een low poly 3D model dat een engel voorstelt. Dit soort modellen wordt met software zoals blender gemaakt."]
]   

function makeMuseum(scene, world) {
    let museum = 
    [[0xf8f8f8, -2.25, 2, 2.25, 2.75, 3.5, 0.25, 0, 0, 0, true, true],
    [0x9ff3e9, 0.125, 1.625, 2.25, 2, 2.75, 0.15000000596046448, 0, 0, 0, true, true],
    [0xf8f8f8, 0.125, 3.375, 2.25, 2, 0.75, 0.25, 0, 0, 0, true, true],
    [0xf8f8f8, 0.12499809265136719, 3.875, -16.625, 38, 0.25, 38, 0, 0, 0, true, true],
    [0xf8f8f8, 2.5, 2, 2.25, 2.75, 3.5, 0.25, 0, 0, 0, true, true],
    [0xffc0ab, 0.125, 0.125, -16.625, 38, 0.25, 38, 0, 0, 0, true, true],
    [0xf8f8f8, 4, 2, -5.25, 0.25, 3.5, 15.25, 0, 0, 0, true, true],
    [0xf8f8f8, 11.625, 2, -12.75, 15, 3.5, 0.25, 0, 0, 0, true, true],
    [0xf8f8f8, 19, 2, -16.75, 0.25, 3.5, 7.75, 0, 0, 0, true, true],
    [0xf8f8f8, 11.375, 2, -20.5, 15, 3.5, 0.25, 0, 0, 0, true, true],
    [0xf8f8f8, 4, 2, -28.125, 0.25, 3.5, 15, 0, 0, 0, true, true],
    [0xf8f8f8, 0, 2, -35.5, 7.75, 3.5, 0.25, 0, 0, 0, true, true],
    [0xf8f8f8, -3.750000476837158, 2, -27.875, 0.25, 3.5, 15, 0, 0, 0, true, true],
    [0xf8f8f8, -11.375, 2, -20.5, 15, 3.5, 0.25, 0, 0, 0, true, true],
    [0xf8f8f8, -18.75, 2, -16.5, 0.25, 3.5, 7.75, 0, 0, 0, true, true],
    [0xf8f8f8, -11.125, 2, -12.75, 15, 3.5, 0.25, 0, 0, 0, true, true],
    [0xf8f8f8, -3.75, 2, -5.125, 0.25, 3.5, 15, 0, 0, 0, true, true],
    
    ]



    let paintingObjects =    


    [[0xe2cfb7, 0.125, 2, -35.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
    [0xe2cfb7, 3.8500003814697266, 2, -2.375, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
    [0xe2cfb7, -3.599998950958252, 2, -8.375, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
    [0xe2cfb7, -3.599998950958252, 2, -2.375, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
    [0xe2cfb7, -8.125, 2, -20.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
    [0xe2cfb7, -8.125, 2, -12.89999771118164, 3.5, 2, 0.050000011920928955, 0, 180, 0, true, true],
    [0xe2cfb7, -14.125, 2, -20.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
    [0xe2cfb7, -14.125, 2, -12.89999771118164, 3.5, 2, 0.050000011920928955, 0, 180, 0, true, true],
    [0xe2cfb7, 3.8500003814697266, 2, -8.375, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
    [0xe2cfb7, -3.599998950958252, 2, -24.875, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
    [0xe2cfb7, -3.599998950958252, 2, -30.875, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true],
    [0xe2cfb7, 3.8500003814697266, 2, -24.875, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
    [0xe2cfb7, 3.8500003814697266, 2, -30.875, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
    [0xe2cfb7, 18.849998474121094, 2, -16.625, 3.5, 2, 0.04999999701976776, 0, -90, 0, true, true],
    [0xe2cfb7, 14.375, 2, -20.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
    [0xe2cfb7, 8.375, 2, -20.349998474121094, 3.5, 2, 0.04999999701976776, 0, 0, 0, true, true],
    [0xe2cfb7, 8.375, 2, -12.899999618530273, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
    [0xe2cfb7, 14.375, 2, -12.899999618530273, 3.5, 2, 0.04999999701976776, 0, 180, 0, true, true],
    [0xe2cfb7, -18.599998474121094, 2, -16.624998092651367, 3.5, 2, 0.04999999701976776, 0, 90, 0, true, true], 
    
    ]

    let lights = [[0xf8f8f8, 0.12499809265136719, 3.625, -16.625, 3, 0.25, 3, 0, 0, 0, false, true],
    [0xf8f8f8, 0.12499809265136719, 3.625, -27.875, 1.5, 0.25, 3, 0, 0, 0, false, true],
    [0xf8f8f8, 0.12499809265136719, 3.625, -5.375, 1.5, 0.25, 3, 0, 0, 0, false, true],
    [0xf8f8f8, -11.125001907348633, 3.625, -16.625, 3, 0.25, 1.5, 0, 0, 0, false, true],
    [0xf8f8f8, 11.374998092651367, 3.625, -16.625, 3, 0.25, 1.5, 0, 0, 0, false, true],
    ]

    for (let i = 0; i < paintings.length; i++) {
        const painting = paintings[i]
        let paintingObj = paintingObjects[i]
        paintingObj[0] = painting[0]
        //paintingObj[6] = 3
        paintingObj[4] = paintingObj[5] * painting[1] //Setting aspect ratio, width = height * width/height
        painting[4] = makeStaticBlock(scene, world, paintingObj, false)[0]
        // console.log(painting[4])
    }
    let lampColor = 0xFFFFFF
    let lampMaterial = new THREE.MeshBasicMaterial(lampColor)

    for (let i = 0; i < lights.length; i++) {
        const lamp = lights[i]
        lamp[0] = lampMaterial
        const lampObj = makeStaticBlock(scene, world, lamp, false)[0]
        const light = new THREE.SpotLight(lampColor, 0.3)
        light.penumbra = 1
        light.angle = Math.PI/2
        light.position.set(lamp[1], lamp[2]-lamp[5]/2, lamp[3])
        light.target.position.set(lamp[1], lamp[2]-lamp[5]-10, lamp[3])
        scene.add(light)
        scene.add(light.target)
        //console.log(lamp)
        
    }
    //fillStaticBlockList(scene, world, lights, true)
    museum.push([0xf8f8f8, -0.3, 2, -16.25, 2, 4, 1, 0, 0, 0, true, false])
    fillStaticBlockList(scene, world, museum, true)
    
    mergeListedGeometries(scene, geometryLists)

    
    let newThing  = makeStaticBlock(scene, world, [0xf8f8f8, 0, 2, -16.25, 0.1, 0.1, 0.1, 0, 0, 0, false, true],  false)[0]
    
    // console.log(newThing)
    paintings.push([0x111111, 1, "Engelenbeeld door Vicente Betoret Ferrero", 'Dit is een low poly 3D model van een engelenbeeld. Dit soort digitale 3D modellen wordt vaak met behulp software zoals Blender gemaakt. Het maken van dit soort models, of "modelleren" is een belangrijk aspect bij het maken van games, 3D animatiefilms en CGI.', newThing])
    // console.log(paintings)
    const loader = new GLTFLoader()
    //let modelTexture = textureLoader.load('./resources/angel_yard_sculpture_low_poly/scene.gltf')
    loader.load('./resources/angel_yard_sculpture_low_poly/scene.gltf', function ( gltf ) {
        const model = gltf.scene
        gltf.scene.scale.set(0.8, 0.8, 0.8)
        gltf.scene.position.set(0, 0, -16.25)
        scene.add( gltf.scene );

        //applyTextureToModel(model, modelTexture)
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );
    
    
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
