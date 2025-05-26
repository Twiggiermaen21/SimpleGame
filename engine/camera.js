import { PerspectiveCamera, Vector3, MathUtils, Raycaster } from 'three';

export default class Camera extends PerspectiveCamera {
    constructor() {
        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.1;
        const far = 1000;
        super(fov, aspect, near, far);

        this.target = new Vector3();
        this.yaw = 0;
        this.pitch = 0;

        this.sensitivity = 0.002;
        this.distance = 10;
        this.verticalOffset = 2;
        this.shoulderOffset = new Vector3(1.5, 1.5, 0);

        this.pitchLimit = {
            min: MathUtils.degToRad(-89),
            max: MathUtils.degToRad(89),
        };

        // === Kolizje ===
        this.raycaster = new Raycaster();
        this.collisionOffset = 0.3;
        this.collidableObjects = []; // Uzupełnij z zewnątrz: camera.collidableObjects = [...]

        this._initMouseControls();
    }

    _initMouseControls() {
        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement !== document.body) return;
            this.yaw -= e.movementX * this.sensitivity;
            this.pitch += e.movementY * this.sensitivity;
            this.pitch = MathUtils.clamp(this.pitch, this.pitchLimit.min, this.pitchLimit.max);
        });

        window.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        window.addEventListener('wheel', (e) => {
            const zoomSpeed = 0.5;
            this.distance += e.deltaY * 0.01 * zoomSpeed;
            this.distance = MathUtils.clamp(this.distance, 2, 30);
        });
    }

    update(player) {
        if (!player || !player.position) return;

        // Punkt patrzenia (środek ciała)
        this.target.copy(player.position);
        this.target.y += 1.5;

        // Planowane przesunięcie kamery
        const cameraOffset = new Vector3(
            this.distance * Math.sin(this.yaw) * Math.cos(this.pitch),
            this.distance * Math.sin(this.pitch),
            this.distance * Math.cos(this.yaw) * Math.cos(this.pitch)
        );

        // Przesunięcie boczne (ramię)
        const sideOffset = new Vector3(1, 0, 0);
        sideOffset.applyAxisAngle(new Vector3(0, 1, 0), this.yaw);
        sideOffset.multiplyScalar(this.shoulderOffset.x);

        // Przesunięcie w pionie
        const verticalOffset = new Vector3(0, this.shoulderOffset.y, 0);

        // Pozycja, do której kamera dąży
        const desiredPosition = this.target.clone()
            .add(cameraOffset)
            .add(sideOffset)
            .add(verticalOffset);

        // === RAYCAST (kolizja)
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
