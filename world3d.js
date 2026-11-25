/**
 * ============================================================================
 * MÓDULO DO MUNDO 3D E CICLO DIA/NOITE (world3d.js)
 * Gerencia a floresta, o PC na mesa, lagoa, fogueira, sol, lua e vaga-lumes.
 * ============================================================================
 */

export class World3D {
    constructor(container) {
        this.container = container;
        this.timeMode = 'real'; // 'real' ou 'fast'
        this.fastTimeHours = 10.0;

        this.POIS = {
            center: new THREE.Vector3(0, 0, 0.5),
            bush: new THREE.Vector3(-3.4, 0, -1.8),
            pond: new THREE.Vector3(3.1, 0, 2.2),
            pcDesk: new THREE.Vector3(3.2, 0, -1.6),
            campfire: new THREE.Vector3(0, 0, -2.5),
            bedLog: new THREE.Vector3(-2.6, 0, 2.4)
        };

        this.camAngle = 0.4;
        this.camHeight = 4.2;
        this.camDistance = 8.5;
        this.isDragging = false;
        this.prevPointer = { x: 0, y: 0 };

        this.fireParticles = [];
        this.fireflies = [];

        this.initScene();
        this.buildForest();
        this.buildCelestialBodies();
        this.setupCameraControls();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x38bdf8);
        this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.034);

        this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 120);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight(0x94a3b8, 0.75);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
        this.sunLight.position.set(10, 15, 8);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.scene.add(this.sunLight);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    buildForest() {
        const ground = new THREE.Mesh(
            new THREE.CylinderGeometry(15, 15, 0.6, 32),
            new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.9 })
        );
        ground.position.y = -0.3;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const dirt = new THREE.Mesh(
            new THREE.CylinderGeometry(4.8, 5.2, 0.05, 24),
            new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 1 })
        );
        dirt.position.y = 0.01;
        dirt.receiveShadow = true;
        this.scene.add(dirt);

        const treeCoords = [
            [-6, -5], [-8, 1], [-5, 6], [0, -8], [6, -6], [8, 0], [5, 6], [-2, 8], [7, 4], [-7, -2]
        ];
        treeCoords.forEach(([x, z]) => {
            const tree = this.createTree();
            tree.position.set(x, 0, z);
            const s = 0.85 + Math.random() * 0.5;
            tree.scale.set(s, s, s);
            this.scene.add(tree);
        });

        const bushGroup = new THREE.Group();
        bushGroup.position.copy(this.POIS.bush);
        const bushMesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.95, 1),
            new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
        );
        bushMesh.position.y = 0.7;
        bushMesh.castShadow = true;
        bushGroup.add(bushMesh);

        const berryGeo = new THREE.SphereGeometry(0.11, 8, 8);
        const berryMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: 0.3 });
        [[0.5, 1.1, 0.5], [-0.4, 1.2, 0.6], [0.2, 0.8, 0.85], [-0.6, 0.9, -0.4], [0.6, 1.0, -0.4]].forEach(([bx, by, bz]) => {
            const b = new THREE.Mesh(berryGeo, berryMat);
            b.position.set(bx, by, bz);
            bushGroup.add(b);
        });
        this.scene.add(bushGroup);

        this.buildPCDesk();
        this.buildPond();
        this.buildCampfire();

        const benchLog = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.28, 1.6, 8),
            new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
        );
        benchLog.position.set(this.POIS.bedLog.x, 0.25, this.POIS.bedLog.z);
        benchLog.rotation.z = Math.PI / 2;
        benchLog.rotation.y = 0.5;
        benchLog.castShadow = true;
        this.scene.add(benchLog);
    }

    createTree() {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.4, 2.2, 7),
            new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 })
        );
        trunk.position.y = 1.1;
        trunk.castShadow = true;
        group.add(trunk);

        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
        const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.4, 7), leavesMat);
        c1.position.y = 2.8;
        c1.castShadow = true;
        group.add(c1);

        const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.0, 7), leavesMat);
        c2.position.y = 4.0;
        c2.castShadow = true;
        group.add(c2);

        return group;
    }

    buildPCDesk() {
        const deskGroup = new THREE.Group();
        deskGroup.position.copy(this.POIS.pcDesk);
        deskGroup.rotation.y = -0.6;

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
        const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.9), woodMat);
        tableTop.position.y = 0.85;
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        deskGroup.add(tableTop);

        const legGeo = new THREE.BoxGeometry(0.12, 0.85, 0.12);
        [[-0.68, -0.34], [0.68, -0.34], [-0.68, 0.34], [0.68, 0.34]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(legGeo, woodMat);
            leg.position.set(lx, 0.425, lz);
            leg.castShadow = true;
            deskGroup.add(leg);
        });

        const pcCase = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.55, 0.55),
            new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
        );
        pcCase.position.set(0.52, 1.18, 0);
        pcCase.castShadow = true;
        deskGroup.add(pcCase);

        const stand = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.2, 0.14),
            new THREE.MeshStandardMaterial({ color: 0x1e293b })
        );
        stand.position.set(-0.15, 1.0, -0.1);
        deskGroup.add(stand);

        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(0.85, 0.55, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x1e293b })
        );
        frame.position.set(-0.15, 1.32, -0.1);
        frame.castShadow = true;
        deskGroup.add(frame);

        this.pcScreenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.76, 0.46),
            new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
        );
        this.pcScreenMesh.position.set(-0.15, 1.32, -0.058);
        deskGroup.add(this.pcScreenMesh);

        this.pcGlowLight = new THREE.PointLight(0x38bdf8, 0.6, 3.5);
        this.pcGlowLight.position.set(-0.15, 1.35, 0.2);
        deskGroup.add(this.pcGlowLight);

        const keyboard = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.04, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x475569 })
        );
        keyboard.position.set(-0.15, 0.93, 0.2);
        deskGroup.add(keyboard);

        this.scene.add(deskGroup);
    }

    buildPond() {
        const pondGroup = new THREE.Group();
        pondGroup.position.copy(this.POIS.pond);

        const water = new THREE.Mesh(
            new THREE.CylinderGeometry(1.15, 1.15, 0.06, 24),
            new THREE.MeshStandardMaterial({
                color: 0x0ea5e9,
                roughness: 0.15,
                metalness: 0.2,
                emissive: 0x0369a1,
                emissiveIntensity: 0.25
            })
        );
        water.position.y = 0.02;
        pondGroup.add(water);

        const rimGeo = new THREE.DodecahedronGeometry(0.2, 0);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const rock = new THREE.Mesh(rimGeo, rimMat);
            rock.position.set(Math.cos(angle) * 1.2, 0.08, Math.sin(angle) * 1.2);
            pondGroup.add(rock);
        }

        this.scene.add(pondGroup);
    }

    buildCampfire() {
        const fireGroup = new THREE.Group();
        fireGroup.position.copy(this.POIS.campfire);
        const stoneGeo = new THREE.DodecahedronGeometry(0.22, 0);
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const stone = new THREE.Mesh(stoneGeo, stoneMat);
            stone.position.set(Math.cos(a) * 0.65, 0.12, Math.sin(a) * 0.65);
            fireGroup.add(stone);
        }

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
        const logGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6);
        const log1 = new THREE.Mesh(logGeo, woodMat);
        log1.position.y = 0.15;
        log1.rotation.z = Math.PI / 2.4;
        fireGroup.add(log1);

        const log2 = new THREE.Mesh(logGeo, woodMat);
        log2.position.y = 0.15;
        log2.rotation.x = Math.PI / 2.4;
        fireGroup.add(log2);

        this.fireLight = new THREE.PointLight(0xf97316, 1.8, 10);
        this.fireLight.position.set(0, 0.7, 0);
        fireGroup.add(this.fireLight);

        const flameMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });
        for (let i = 0; i < 5; i++) {
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 5), flameMat);
            flame.position.set((Math.random() - 0.5) * 0.25, 0.35 + i * 0.06, (Math.random() - 0.5) * 0.25);
            fireGroup.add(flame);
            this.fireParticles.push(flame);
        }

        this.scene.add(fireGroup);
    }

    buildCelestialBodies() {
        this.sunMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.1, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        this.scene.add(this.sunMesh);

        this.moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.85, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
        );
        this.scene.add(this.moonMesh);

        const starGeo = new THREE.BufferGeometry();
        const starCount = 160;
        const positions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 70;
            positions[i + 1] = 10 + Math.random() * 25;
            positions[i + 2] = (Math.random() - 0.5) * 70;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0 });
        this.stars = new THREE.Points(starGeo, this.starMat);
        this.scene.add(this.stars);

        const ffGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const ffMat = new THREE.MeshBasicMaterial({ color: 0xa3e635, transparent: true, opacity: 0 });
        this.fireflyMat = ffMat;
        for (let i = 0; i < 14; i++) {
            const ff = new THREE.Mesh(ffGeo, ffMat);
            ff.userData = {
                baseX: (Math.random() - 0.5) * 10,
                baseY: 0.6 + Math.random() * 1.8,
                baseZ: (Math.random() - 0.5) * 10,
                speed: 0.8 + Math.random() * 1.2,
                phase: Math.random() * Math.PI * 2
            };
            this.scene.add(ff);
            this.fireflies.push(ff);
        }
    }

    toggleTimeMode() {
        this.timeMode = this.timeMode === 'real' ? 'fast' : 'real';
        return this.timeMode;
    }

    getCurrentHourFloat() {
        if (this.timeMode === 'fast') {
            return this.fastTimeHours;
        }
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60;
    }

    isNightTime() {
        const h = this.getCurrentHourFloat();
        return h >= 19 || h < 6;
    }

    getSkyLabel() {
        const h = this.getCurrentHourFloat();
        const hh = String(Math.floor(h)).padStart(2, '0');
        const mm = String(Math.floor((h % 1) * 60)).padStart(2, '0');
        const timeStr = `${hh}:${mm}`;

        if (h >= 6 && h < 12) return `🌅 Manhã (${timeStr})`;
        if (h >= 12 && h < 17) return `☀️ Tarde (${timeStr})`;
        if (h >= 17 && h < 19.5) return `🌇 Entardecer (${timeStr})`;
        return `🌙 Noite (${timeStr})`;
    }

    updateDayNightCycle(dt, elapsed) {
        if (this.timeMode === 'fast') {
            this.fastTimeHours = (this.fastTimeHours + dt * 0.2) % 24;
        }

        const hour = this.getCurrentHourFloat();
        const sunAngle = ((hour - 6) / 24) * Math.PI * 2;
        const radius = 26;

        const sunX = Math.cos(sunAngle) * radius;
        const sunY = Math.sin(sunAngle) * radius;
        this.sunMesh.position.set(sunX, sunY, -12);
        this.moonMesh.position.set(-sunX, -sunY, -12);

        const dayFactor = Math.sin(sunAngle);
        const clampedDay = Math.max(0, Math.min(1, (dayFactor + 0.25) / 1.25));

        const nightSky = new THREE.Color(0x070b14);
        const sunsetSky = new THREE.Color(0x7c2d12);
        const daySky = new THREE.Color(0x38bdf8);

        let targetSky = new THREE.Color();
        if (dayFactor > 0.15) {
            targetSky.lerpColors(sunsetSky, daySky, Math.min(1, (dayFactor - 0.15) / 0.45));
        } else if (dayFactor > -0.25) {
            targetSky.lerpColors(nightSky, sunsetSky, (dayFactor + 0.25) / 0.4);
        } else {
            targetSky.copy(nightSky);
        }

        this.scene.background.copy(targetSky);
        this.scene.fog.color.copy(targetSky);

        if (dayFactor > -0.1) {
            this.sunLight.position.copy(this.sunMesh.position);
            this.sunLight.intensity = 0.3 + clampedDay * 1.05;
            this.sunLight.color.setHex(dayFactor < 0.25 ? 0xfb923c : 0xfffbeb);
        } else {
            this.sunLight.position.copy(this.moonMesh.position);
            this.sunLight.intensity = 0.28;
            this.sunLight.color.setHex(0x818cf8);
        }

        this.ambientLight.intensity = 0.32 + clampedDay * 0.48;

        const nightAlpha = Math.max(0, Math.min(1, (-dayFactor - 0.05) * 2.5));
        this.starMat.opacity = nightAlpha * 0.9;
        this.fireflyMat.opacity = nightAlpha * (0.6 + Math.sin(elapsed * 4) * 0.4);

        this.fireLight.intensity = (1.1 + (1 - clampedDay) * 1.8) + Math.sin(elapsed * 12) * 0.2;
    }

    setupCameraControls() {
        const dom = this.renderer.domElement;

        dom.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.prevPointer = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.prevPointer.x;
            const dy = e.clientY - this.prevPointer.y;
            this.camAngle -= dx * 0.008;
            this.camHeight = Math.max(1.5, Math.min(9.5, this.camHeight + dy * 0.03));
            this.prevPointer = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', () => {
            this.isDragging = false;
        });

        dom.addEventListener('wheel', (e) => {
            this.camDistance = Math.max(4.5, Math.min(15, this.camDistance + e.deltaY * 0.005));
        }, { passive: true });
    }

    update(dt, elapsed, focusPos) {
        this.updateDayNightCycle(dt, elapsed);

        this.fireParticles.forEach((f, idx) => {
            f.scale.y = 0.8 + Math.sin(elapsed * 10 + idx) * 0.35;
            f.position.y = 0.35 + Math.abs(Math.sin(elapsed * 7 + idx)) * 0.15;
        });

        this.fireflies.forEach((ff) => {
            const d = ff.userData;
            ff.position.x = d.baseX + Math.sin(elapsed * d.speed + d.phase) * 0.8;
            ff.position.y = d.baseY + Math.cos(elapsed * d.speed * 1.3 + d.phase) * 0.35;
            ff.position.z = d.baseZ + Math.cos(elapsed * d.speed + d.phase) * 0.8;
        });

        const targetCamX = focusPos.x + Math.sin(this.camAngle) * this.camDistance;
        const targetCamZ = focusPos.z + Math.cos(this.camAngle) * this.camDistance;
        this.camera.position.lerp(new THREE.Vector3(targetCamX, this.camHeight, targetCamZ), 0.1);
        this.camera.lookAt(focusPos.x, 1.1, focusPos.z);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}