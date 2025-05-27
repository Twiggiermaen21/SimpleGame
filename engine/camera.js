import { PerspectiveCamera, Vector3, MathUtils, Raycaster } from 'three';

export default class Camera extends PerspectiveCamera {
    constructor() {
        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 1000;
        super(fov, aspect, near, far);

        // Parametry kamery OTS (over the shoulder)
        this.target = new Vector3();
        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.002;

        // Kamera blisko gracza (3-4 jednostki to typowy efekt ramienia)
        this.distance = 3.5;

        // Boczny offset – np. 0.8 na X to „za prawym ramieniem” (ujemny X dla lewego)
        this.shoulderOffset = new Vector3(0.8, 1, 0);
        //                  ^--- X (prawe ramię), Y (lekko w górę), Z nie ruszamy

        this.pitchLimit = {
            min: MathUtils.degToRad(-60),
            max: MathUtils.degToRad(45),
        };

        this.raycaster = new Raycaster();
        this.collisionOffset = 0.3;
        this.collidableObjects = [];

        this._isRotating = false;

        this._initMouseControls();
    }

    _initMouseControls() {
        window.addEventListener('contextmenu', (e) => {
            if (this._isRotating) e.preventDefault();
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                this._isRotating = true;
                document.body.requestPointerLock();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this._isRotating = false;
                document.exitPointerLock();
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this._isRotating && document.pointerLockElement === document.body) {
                this.yaw -= e.movementX * this.sensitivity;
                this.pitch += e.movementY * this.sensitivity;
                this.pitch = MathUtils.clamp(this.pitch, this.pitchLimit.min, this.pitchLimit.max);
            }
        });

        window.addEventListener('wheel', (e) => {
            const zoomSpeed = 0.5;
            this.distance += e.deltaY * 0.01 * zoomSpeed;
            this.distance = MathUtils.clamp(this.distance, 1.5, 8);
        });
    }

    update(player) {
        if (!player || !player.position) return;

        this.target.copy(player.position);
        this.target.y += 1.5;

        if (!this._isRotating) {
            // Kamera zawsze za plecami gracza, plus 180° żeby patrzyła na przód modelu
            this.yaw = player.rotation.y + Math.PI;
        }

        // Kamera blisko i po prawej stronie (over the shoulder)
        const cameraOffset = new Vector3(
            this.distance * Math.sin(this.yaw) * Math.cos(this.pitch),
            this.distance * Math.sin(this.pitch),
            this.distance * Math.cos(this.yaw) * Math.cos(this.pitch)
        );

        // Tu: używamy bocznego offsetu, żeby być za ramieniem (prawe ramię = dodatni X)
        const sideOffset = new Vector3(1, 0, 0)
            .applyAxisAngle(new Vector3(0, 1, 0), this.yaw)
            .multiplyScalar(this.shoulderOffset.x);

        // Wysokość kamery (Y)
        const verticalOffset = new Vector3(0, this.shoulderOffset.y, 0);

        const desiredPosition = this.target.clone()
            .add(cameraOffset)
            .add(sideOffset)
            .add(verticalOffset);

        // Raycast: kolizja z otoczeniem
        const direction = desiredPosition.clone().sub(this.target).normalize();
        this.raycaster.set(this.target, direction);
        const hits = this.raycaster.intersectObjects(this.collidableObjects, true);

        let finalPosition = desiredPosition;
        if (hits.length > 0 && hits[0].distance < this.distance) {
            const safeDistance = hits[0].distance - this.collisionOffset;
            finalPosition = this.target.clone().add(direction.multiplyScalar(Math.max(safeDistance, 0.1)));
        }

        this.position.copy(finalPosition);
        this.lookAt(this.target);
    }
}
