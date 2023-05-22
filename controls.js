import { Vec3 } from 'cannon-es';
import {
	Euler,
	EventDispatcher,
	Vector3
} from 'three';

const _euler = new Euler( 0, 0, 0, 'YXZ' );
const _vector = new Vector3();

const _changeEvent = { type: 'change' };
const _lockEvent = { type: 'lock' };
const _unlockEvent = { type: 'unlock' };

const _PI_2 = Math.PI / 2;

class PointerLockControls extends EventDispatcher {

	constructor( camera, cannonBody, domElement ) {

		super();

		this.camera = camera;
        this.cannonBody = cannonBody
		this.domElement = domElement;

		this.isLocked = false;
        

		// Set to constrain the pitch of the camera
		// Range is 0 to Math.PI radians
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		this.pointerSpeed = 1.0;
		this.walkSpeed = 3

		this._onCollide = onCollide.bind( this )
		this._onKeyDown = onKeyDown.bind( this )
		this._onKeyUp = onKeyUp.bind( this )
		this._onMouseMove = onMouseMove.bind( this );
		this._onPointerlockChange = onPointerlockChange.bind( this );
		this._onPointerlockError = onPointerlockError.bind( this );
		

		this.forward = false
		this.backwards = false
		this.right = false
		this.left = false

		this.canJump = false

		this.connect();

		this.lastPos = new Vec3()

	}

	connect() {
		this.cannonBody.addEventListener('collide', this._onCollide)
		document.addEventListener('keydown', this._onKeyDown)
		document.addEventListener('keyup', this._onKeyUp)
		this.domElement.ownerDocument.addEventListener( 'mousemove', this._onMouseMove );
		this.domElement.ownerDocument.addEventListener( 'pointerlockchange', this._onPointerlockChange );
		this.domElement.ownerDocument.addEventListener( 'pointerlockerror', this._onPointerlockError );

	}

	disconnect() {
		this.cannonBody.removeEventListener('collide', this._onCollide)
		document.removeEventListener('keydown', this._onKeyDown)
		document.removeEventListener('keyup', this._onKeyUp)
		this.domElement.ownerDocument.removeEventListener( 'mousemove', this._onMouseMove );
		this.domElement.ownerDocument.removeEventListener( 'pointerlockchange', this._onPointerlockChange );
		this.domElement.ownerDocument.removeEventListener( 'pointerlockerror', this._onPointerlockError );

	}

	dispose() {

		this.disconnect();

	}

	getObject() { // retaining this method for backward compatibility

		return this.camera;

	}

	getDirection( v ) {

		return v.set( 0, 0, - 1 ).applyQuaternion( this.camera.quaternion );

	}

	moveForward( distance ) {

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		const camera = this.camera;

		_vector.setFromMatrixColumn( camera.matrix, 0 );

		_vector.crossVectors( camera.up, _vector );

		camera.position.addScaledVector( _vector, distance );

	}

	moveRight( distance ) {

		const camera = this.camera;

		_vector.setFromMatrixColumn( camera.matrix, 0 );

		camera.position.addScaledVector( _vector, distance );

	}

	setDirections(code, bool) {
		switch (code) {
			case 'ArrowUp': 
			case 'KeyZ':
			case 'KeyW': this.forward = bool;break;
			case 'KeyS':
			case 'ArrowDown': this.backwards = bool;break;
			case 'KeyQ':
			case 'KeyA':
			case 'ArrowLeft': this.left = bool;break;
			case 'KeyD':
			case 'ArrowRight': this.right = bool;break;
            case 'Space': if (this.canJump && bool) {this.cannonBody.velocity.y += 3; this.canJump = this.canJump = false}; break;
			default:
				break;
		}
	}

	update(dt) {
		let forwardAm = 0
		let rightAm = 0
		if (this.forward) {
			forwardAm += 1
		}
		if (this.backwards) {
			forwardAm -= 1
		}
		if (this.right) {
			rightAm += 1
		}
		if (this.left) {
			rightAm -= 1
		}
		let total = Math.abs(forwardAm) + Math.abs(rightAm)
		if (total > 1) {
            let divAm = Math.sqrt(forwardAm * forwardAm + rightAm * rightAm)
			forwardAm /= divAm
			rightAm /= divAm
		} 
        if (total > 0.5 ) {
            let mult = dt * this.walkSpeed * 0.1
            // https://matthew-brett.github.io/teaching/rotation_2d.html 
            let lookAtVector = new Vector3(0,0,-1)
			lookAtVector.applyQuaternion(this.camera.quaternion)
			let divAm = Math.sqrt(lookAtVector.x * lookAtVector.x + lookAtVector.z * lookAtVector.z)
			lookAtVector.x /= divAm
			lookAtVector.z /= divAm
			lookAtVector.y = 0
			let lookAt2 = new Vector3()
			lookAt2.crossVectors(new Vector3(0,-1,0), lookAtVector)
			lookAt2.multiplyScalar(mult * rightAm)
			lookAtVector.multiplyScalar(mult * forwardAm)
			lookAtVector.addVectors(lookAtVector, lookAt2)
			this.cannonBody.velocity.x = lookAtVector.x
			this.cannonBody.velocity.z = lookAtVector.z
        } else {
			this.cannonBody.velocity.x *= 0.8
			this.cannonBody.velocity.z *= 0.8
		}
		if (isNaN(this.cannonBody.position.x)) {
			this.cannonBody.position.copy(this.lastPos)
			console.log("Nan'D")
		}
		this.lastPos.copy(this.cannonBody.position)
        this.camera.position.copy(this.cannonBody.position)
		this.camera.position.y += 1
	}

	lock() {

		this.domElement.requestPointerLock();

	}

	unlock() {

		this.domElement.ownerDocument.exitPointerLock();

	}

}

// event listeners
function onCollide( event ) {
	let contact = event.contact
	let contactNormal = new Vec3()
	if (contact.bi.id == this.cannonBody.id) {
		contact.ni.negate(contactNormal)
	} else {
		contactNormal.copy(contact.ni)
	}
	if (contactNormal.dot(new Vec3(0,1,0)) > 0.5) {
		this.canJump = true
	}
}

function onKeyDown( event ) {
	this.setDirections(event.code, true)
}

function onKeyUp( event ) {
	this.setDirections(event.code, false)
}

function onMouseMove( event ) {

	//if ( this.isLocked === false ) return;
	const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

	const camera = this.camera;
	_euler.setFromQuaternion( camera.quaternion );

	_euler.y -= movementX * 0.002 * this.pointerSpeed;
	_euler.x -= movementY * 0.002 * this.pointerSpeed;

	_euler.x = Math.max( _PI_2 - this.maxPolarAngle, Math.min( _PI_2 - this.minPolarAngle, _euler.x ) );

	camera.quaternion.setFromEuler( _euler );

	this.dispatchEvent( _changeEvent );

}

function onPointerlockChange() {

	if ( this.domElement.ownerDocument.pointerLockElement === this.domElement ) {

		this.dispatchEvent( _lockEvent );

		this.isLocked = true;

	} else {

		this.dispatchEvent( _unlockEvent );

		this.isLocked = false;

	}

}

function onPointerlockError() {

	console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

}

export { PointerLockControls };
