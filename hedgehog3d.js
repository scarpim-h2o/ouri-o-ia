/**
 * ============================================================================
 * MÓDULO DE MODELAGEM 3D E ANIMAÇÃO DO OURIÇO (hedgehog3d.js)
 * Constrói o personagem humanoide articulado e gerencia suas ações na clareira.
 * ============================================================================
 */

export class Hedgehog3D {
    constructor(scene, POIS) {
        this.scene = scene;
        this.POIS = POIS;

        this.pos = new THREE.Vector3(0, 0, 0);
        this.targetPos = new THREE.Vector3(0, 0, 0);
        this.rotationY = 0;

        this.currentAction = 'idle'; // 'idle', 'walking', 'eating', 'drinking', 'exercising', 'pc', 'sleeping'
        this.actionTimer = 10;
        this.walkCycle = 0;
        this.exerciseAngle = 0;

        this.buildMesh();
    }

    buildMesh() {
        this.group = new THREE.Group();

        const blueFur = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.55 });
        const darkBlueQuill = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 });
        const skinTone = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.7 });
        const shoeRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 });
        const shoeStripe = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
        const gloveWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

        // Tronco humanoide
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.68, 14), blueFur);
        torso.position.y = 0.85;
        torso.castShadow = true;
        this.group.add(torso);

        // Barriga clara
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 12), skinTone);
        belly.position.set(0, 0.84, 0.14);
        belly.scale.set(0.9, 1.2, 0.6);
        this.group.add(belly);

        // Pequena cauda atrás
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 6), darkBlueQuill);
        tail.position.set(0, 0.65, -0.32);
        tail.rotation.x = -1.2;
        this.group.add(tail);

        // Cabeça articulada
        this.headGroup = new THREE.Group();
        this.headGroup.position.set(0, 1.48, 0);

        const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 18), blueFur);
        headSphere.castShadow = true;
        this.headGroup.add(headSphere);

        // Focinho
        const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 12), skinTone);
        muzzle.position.set(0, -0.06, 0.26);
        muzzle.scale.set(1.12, 0.8, 0.9);
        this.headGroup.add(muzzle);

        // Nariz
        const nose = new THREE.Mesh(
            new THREE.SphereGeometry(0.055, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        nose.position.set(0, -0.01, 0.44);
        this.headGroup.add(nose);

        // Olhos expressivos
        const eyeWhiteGeo = new THREE.SphereGeometry(0.085, 10, 10);
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x059669 });

        [-0.11, 0.11].forEach(ex => {
            const ew = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
            ew.position.set(ex, 0.08, 0.3);
            ew.scale.set(0.8, 1.2, 0.6);
            this.headGroup.add(ew);

            const ep = new THREE.Mesh(pupilGeo, pupilMat);
            ep.position.set(ex, 0.08, 0.34);
            this.headGroup.add(ep);
        });

        // Pálpebras para dormir
        this.eyelids = new THREE.Group();
        [-0.11, 0.11].forEach(ex => {
            const lid = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), blueFur);
            lid.position.set(ex, 0.08, 0.305);
            lid.scale.set(0.85, 1.25, 0.65);
            this.eyelids.add(lid);
        });
        this.eyelids.visible = false;
        this.headGroup.add(this.eyelids);

        // Orelhas pontudas
        const earGeo = new THREE.ConeGeometry(0.11, 0.23, 6);
        [-0.22, 0.22].forEach((earX, idx) => {
            const ear = new THREE.Mesh(earGeo, blueFur);
            ear.position.set(earX, 0.34, 0.02);
            ear.rotation.z = idx === 0 ? 0.3 : -0.3;
            this.headGroup.add(ear);
        });

        // Espinhos estilizados na cabeça e costas
        const quillGeo = new THREE.ConeGeometry(0.14, 0.68, 7);
        const quills = [
            [0, 0.16, -0.35, -1.1, 0],
            [-0.19, 0.06, -0.32, -1.2, 0.32],
            [0.19, 0.06, -0.32, -1.2, -0.32],
            [0, -0.14, -0.34, -1.4, 0]
        ];
        quills.forEach(([qx, qy, qz, rx, rz]) => {
            const q = new THREE.Mesh(quillGeo, darkBlueQuill);
            q.position.set(qx, qy, qz);
            q.rotation.set(rx, 0, rz);
            q.castShadow = true;
            this.headGroup.add(q);
        });

        this.group.add(this.headGroup);

        // Braços articulados
        this.leftArm = this.createArm(skinTone, gloveWhite, -0.36, 1.12);
        this.rightArm = this.createArm(skinTone, gloveWhite, 0.36, 1.12);
        this.group.add(this.leftArm);
        this.group.add(this.rightArm);

        // Pernas e tênis articulados
        this.leftLeg = this.createLeg(blueFur, shoeRed, shoeStripe, -0.15, 0.52);
        this.rightLeg = this.createLeg(blueFur, shoeRed, shoeStripe, 0.15, 0.52);
        this.group.add(this.leftLeg);
        this.group.add(this.rightLeg);

        this.scene.add(this.group);
    }

    createArm(armMat, handMat, x, y) {
        const pivot = new THREE.Group();
        pivot.position.set(x, y, 0);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8), armMat);
        arm.position.y = -0.22;
        pivot.add(arm);
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), handMat);
        hand.position.y = -0.45;
        pivot.add(hand);
        return pivot;
    }

    createLeg(legMat, shoeMat, stripeMat, x, y) {
        const pivot = new THREE.Group();
        pivot.position.set(x, y, 0);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 8), legMat);
        leg.position.y = -0.2;
        pivot.add(leg);

        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.32), shoeMat);
        shoe.position.set(0, -0.44, 0.06);
        shoe.castShadow = true;
        pivot.add(shoe);

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.1), stripeMat);
        stripe.position.set(0, -0.42, 0.06);
        pivot.add(stripe);

        return pivot;
    }

    setAction(action, target = null) {
        this.currentAction = action;
        this.actionTimer = 12;
        if (target) this.targetPos.copy(target);
    }

    goEat() {
        this.setAction('eating', this.POIS.bush.clone().add(new THREE.Vector3(0.8, 0, 0.5)));
    }

    goDrink() {
        this.setAction('drinking', this.POIS.pond.clone().add(new THREE.Vector3(-1.25, 0, -0.3)));
    }

    goExercise() {
        this.exerciseAngle = Math.atan2(
            this.pos.z - this.POIS.campfire.z,
            this.pos.x - this.POIS.campfire.x
        );
        this.setAction('exercising', this.POIS.campfire.clone().add(new THREE.Vector3(1.65, 0, 0)));
        this.actionTimer = 16;
    }

    goToPC() {
        this.setAction('pc', this.POIS.pcDesk.clone().add(new THREE.Vector3(0, 0, 0.9)));
    }

    goSleep() {
        this.setAction('sleeping', this.POIS.bedLog.clone());
    }

    chooseAutonomousBehavior(memoryState, onSpeak = null) {
        if ((memoryState.thirst ?? 85) < 42) {
            this.goDrink();
            if (onSpeak) onSpeak("Deu uma sede agora... vou beber uma aguinha fresca no lago!");
        } else if (memoryState.hunger < 42) {
            this.goEat();
            if (onSpeak) onSpeak("Tô com fome... vou pegar umas frutinhas vermelhas ali!");
        } else if (memoryState.energy < 30) {
            this.goSleep();
            if (onSpeak) onSpeak("Bateu um sono pesado... vou encostar ali.");
        } else {
            const roll = Math.random();
            if (roll < 0.25) {
                this.goExercise();
                if (onSpeak) onSpeak("Bora gastar energia! Vou dar umas voltas correndo na fogueira!");
            } else if (roll < 0.55) {
                this.goToPC();
            } else if (roll < 0.8) {
                const rx = (Math.random() - 0.5) * 6;
                const rz = (Math.random() - 0.5) * 5;
                this.setAction('walking', new THREE.Vector3(rx, 0, rz));
            } else {
                this.setAction('idle', this.POIS.campfire.clone().add(new THREE.Vector3(0, 0, 1.3)));
            }
        }
    }

    update(dt, elapsed, memoryState, pcScreenMesh, onSpeak) {
        // Modo corrida ao redor da fogueira (exercício físico)
        if (this.currentAction === 'exercising') {
            this.exerciseAngle += dt * 2.5;
            const radius = 1.65;
            const nextX = this.POIS.campfire.x + Math.cos(this.exerciseAngle) * radius;
            const nextZ = this.POIS.campfire.z + Math.sin(this.exerciseAngle) * radius;

            const moveDir = new THREE.Vector3(nextX - this.pos.x, 0, nextZ - this.pos.z);
            if (moveDir.lengthSq() > 0.0001) {
                this.rotationY = Math.atan2(moveDir.x, moveDir.z);
            }
            this.pos.set(nextX, 0, nextZ);

            this.walkCycle += dt * 20;
            this.leftLeg.rotation.x = Math.sin(this.walkCycle) * 0.95;
            this.rightLeg.rotation.x = -Math.sin(this.walkCycle) * 0.95;
            this.leftArm.rotation.x = -Math.sin(this.walkCycle) * 0.85;
            this.rightArm.rotation.x = Math.sin(this.walkCycle) * 0.85;
            this.group.position.y = Math.abs(Math.sin(this.walkCycle)) * 0.14;
            this.group.rotation.x = 0.18;
            this.eyelids.visible = false;

            this.actionTimer -= dt;
            if (this.actionTimer <= 0) {
                this.group.rotation.x = 0;
                this.chooseAutonomousBehavior(memoryState, onSpeak);
            }

            this.group.position.x = this.pos.x;
            this.group.position.z = this.pos.z;
            this.group.rotation.y = this.rotationY;
            return;
        }

        this.group.rotation.x = 0;
        const dist = this.pos.distanceTo(this.targetPos);
        const isMoving = dist > 0.18;

        if (isMoving) {
            const dir = this.targetPos.clone().sub(this.pos).normalize();
            this.pos.add(dir.multiplyScalar(2.1 * dt));

            const targetRot = Math.atan2(dir.x, dir.z);
            let diff = targetRot - this.rotationY;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.rotationY += diff * 8 * dt;

            this.walkCycle += dt * 11;
            this.leftLeg.rotation.x = Math.sin(this.walkCycle) * 0.65;
            this.rightLeg.rotation.x = -Math.sin(this.walkCycle) * 0.65;
            this.leftArm.rotation.x = -Math.sin(this.walkCycle) * 0.5;
            this.rightArm.rotation.x = Math.sin(this.walkCycle) * 0.5;
            this.group.position.y = Math.abs(Math.sin(this.walkCycle)) * 0.08;
            this.eyelids.visible = false;
        } else {
            this.leftLeg.rotation.x *= 0.85;
            this.rightLeg.rotation.x *= 0.85;
            this.group.position.y = 0;

            if (this.currentAction === 'eating') {
                this.eyelids.visible = false;
                this.rightArm.rotation.x = -1.4 + Math.sin(elapsed * 8) * 0.35;
                this.headGroup.rotation.x = Math.sin(elapsed * 8) * 0.15;
                memoryState.hunger = Math.min(100, memoryState.hunger + dt * 4.5);
            } else if (this.currentAction === 'drinking') {
                this.eyelids.visible = false;
                this.headGroup.rotation.x = 0.42 + Math.sin(elapsed * 7) * 0.12;
                this.leftArm.rotation.x = -0.6;
                this.rightArm.rotation.x = -0.6;
                memoryState.thirst = Math.min(100, (memoryState.thirst ?? 85) + dt * 5.5);
            } else if (this.currentAction === 'pc') {
                this.eyelids.visible = false;
                this.rotationY = Math.PI - 0.6;
                this.leftArm.rotation.x = -0.9 + Math.sin(elapsed * 14) * 0.12;
                this.rightArm.rotation.x = -0.9 - Math.sin(elapsed * 14) * 0.12;
                if (pcScreenMesh) {
                    pcScreenMesh.material.color.setHex(Math.sin(elapsed * 4) > 0 ? 0x0ea5e9 : 0x38bdf8);
                }
            } else if (this.currentAction === 'sleeping') {
                this.eyelids.visible = true;
                this.headGroup.rotation.x = 0.25 + Math.sin(elapsed * 2) * 0.05;
                memoryState.energy = Math.min(100, memoryState.energy + dt * 4);
            } else {
                this.eyelids.visible = false;
                this.headGroup.rotation.x = Math.sin(elapsed * 1.5) * 0.05;
                this.headGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.22;
                this.leftArm.rotation.x = Math.sin(elapsed * 2) * 0.06;
                this.rightArm.rotation.x = -Math.sin(elapsed * 2) * 0.06;
            }

            this.actionTimer -= dt;
            if (this.actionTimer <= 0) {
                this.chooseAutonomousBehavior(memoryState, onSpeak);
            }
        }

        this.group.position.x = this.pos.x;
        this.group.position.z = this.pos.z;
        this.group.rotation.y = this.rotationY;
    }

    getHeadScreenPosition(camera) {
        const headPos = new THREE.Vector3(this.pos.x, 2.15, this.pos.z);
        headPos.project(camera);

        const x = (headPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(headPos.y * 0.5) + 0.5) * window.innerHeight;

        return {
            x: Math.max(130, Math.min(window.innerWidth - 130, x)),
            y: Math.max(115, y - 20)
        };
    }
}