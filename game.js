// game.js

const firebaseConfig = {
    apiKey: "AIzaSyDe2OtAdDFWOml4v6EuISnPhYI-0xx8kOU",
    authDomain: "chronos-tap.firebaseapp.com",
    databaseURL: "https://chronos-tap-default-rtdb.firebaseio.com",
    projectId: "chronos-tap",
    storageBucket: "chronos-tap.firebasestorage.app",
    messagingSenderId: "755222927108",
    appId: "1:755222927108:web:82744c3626e7a125c92251",
    measurementId: "G-WGZLCFN2GH"
};

firebase.initializeApp(firebaseConfig);
const rdb = firebase.database();

let currentUser = null;
let currentPassword = null;
let heroesList = [];
let activeHeroIndex = -1;
let gameData = null;
let selectedNewClass = 'PromptEngineer';
let currentViewingTower = 1;
let enemyMaxHp = 30;
let enemyHp = 30;
let enemyTimer = 10;
let timerInterval = null;

let bossFightActive = false;
let minigameType = 0;
let minigameState = {};
let activeSkillSubTab = 0;
let activeUpgradeSubTab = 'hardware';
let activeShardSubTab = 'shop';
let activeSelectingSlot = -1;

let activeGlobalDotsList = [];

let treeScale = 0.65;
let treeTranslateX = 0;
let treeTranslateY = 0;
let isPanning = false;
let startX = 0, startY = 0;

let skillCooldowns = {};

function getSectorName(towerNum) {
    if (towerNum === 0) return "Nave Orbital";
    return `Sector ${towerNum}`;
}

window.addEventListener('DOMContentLoaded', () => {
    const rememberedUser = localStorage.getItem('wizz_remember_user');
    const rememberedPass = localStorage.getItem('wizz_remember_pass');
    if (rememberedUser && rememberedPass) {
        document.getElementById('auth-username').value = rememberedUser;
        document.getElementById('auth-password').value = rememberedPass;
        document.getElementById('auth-remember').checked = true;
        
        currentUser = rememberedUser;
        currentPassword = rememberedPass;
        rdb.ref('users/' + currentUser).once('value', snapshot => {
            const data = snapshot.val();
            if (data && data.password === currentPassword) {
                heroesList = data.heroes || [];
                document.getElementById('auth-screen').classList.add('hidden');
                openHeroSelector();
            }
        });
    }
});

window.addEventListener('keydown', (e) => {
    const isInputTarget = (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
    
    if (!isInputTarget && ['1', '2', '3', '4', '5'].includes(e.key)) {
        const slotIndex = parseInt(e.key) - 1;
        useEquippedSkill(slotIndex);
        e.preventDefault();
        return;
    }

    if (!isInputTarget && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape' || e.keyCode === 32 || e.keyCode === 13 || e.keyCode === 27)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true);

function showCyberModal(title, message, icon = "⚠️", callback = null) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerHTML = message;
    document.getElementById('modal-icon').innerText = icon;
    const buttonsContainer = document.getElementById('modal-buttons');
    
    if (callback) {
        buttonsContainer.innerHTML = `
            <button onclick="closeCyberModal();" class="px-5 py-2.5 bg-cyber-bg border border-cyber-border text-slate-300 font-bold text-xs rounded-xl font-orbitron shadow active:scale-95">Cancelar</button>
            <button id="modal-confirm-btn" class="px-6 py-2.5 bg-cyber-neonCyan text-black font-bold text-xs rounded-xl font-orbitron shadow active:scale-95">Aceptar</button>
        `;
        document.getElementById('modal-confirm-btn').onclick = () => {
            closeCyberModal();
            callback();
        };
    } else {
        buttonsContainer.innerHTML = `
            <button onclick="closeCyberModal()" class="px-6 py-2.5 bg-cyber-neonCyan text-black font-bold text-xs rounded-xl font-orbitron shadow active:scale-95">Aceptar</button>
        `;
    }
    document.getElementById('cyber-modal').classList.remove('hidden');
}

function closeCyberModal() {
    document.getElementById('cyber-modal').classList.add('hidden');
}

function showAuthError(msg) {
    const box = document.getElementById('auth-error-box');
    box.innerText = msg;
    box.classList.remove('hidden');
    setTimeout(() => box.classList.add('hidden'), 5000);
}

function checkGlobalHeroNameUnique(nameToCheck, callback) {
    rdb.ref('users/').once('value', snapshot => {
        const users = snapshot.val();
        if (!users) { callback(true); return; }
        let exists = false;
        const lowerTarget = nameToCheck.trim().toLowerCase();
        Object.keys(users).forEach(u => {
            const uHeroes = users[u].heroes || [];
            uHeroes.forEach(h => {
                if (h.name && h.name.trim().toLowerCase() === lowerTarget) exists = true;
            });
        });
        callback(!exists);
    });
}

function handleLogin() {
    const user = document.getElementById('auth-username').value.trim();
    const pass = document.getElementById('auth-password').value.trim();
    const remember = document.getElementById('auth-remember').checked;

    if (!user || !pass) { showAuthError('⚠️ Ingresa usuario y contraseña.'); return; }

    const audio = document.getElementById('game-audio');
    const playBtn = document.getElementById('play-pause-btn');
    if (audio) {
        if (!audio.src) {
            const randomIndex = Math.floor(Math.random() * playlist.length);
            loadTrack(randomIndex);
        }
        audio.play().then(() => {
            isPlayingMusic = true;
            if (playBtn) playBtn.innerText = "⏸️";
        }).catch(e => {
            console.log("El navegador bloqueó el autoplay:", e);
        });
    }

    rdb.ref('users/' + user).once('value', snapshot => {
        const data = snapshot.val();
        if (!data) { showAuthError('❌ El usuario no existe.'); return; }
        if (data.password !== pass) { showAuthError('❌ Contraseña incorrecta.'); return; }
        currentUser = user;
        currentPassword = pass;
        heroesList = data.heroes || [];

        if (remember) {
            localStorage.setItem('wizz_remember_user', user);
            localStorage.setItem('wizz_remember_pass', pass);
        } else {
            localStorage.removeItem('wizz_remember_user');
            localStorage.removeItem('wizz_remember_pass');
        }

        document.getElementById('auth-screen').classList.add('hidden');
        openHeroSelector();
    });
}

function handleRegister() {
    const user = document.getElementById('auth-username').value.trim();
    const pass = document.getElementById('auth-password').value.trim();
    const remember = document.getElementById('auth-remember').checked;

    if (!user || !pass) { showAuthError('⚠️ Ingresa credenciales válidas.'); return; }
    rdb.ref('users/' + user).once('value', snapshot => {
        if (snapshot.exists()) { showAuthError('⚠️ El usuario ya existe.'); return; }
        rdb.ref('users/' + user).set({ password: pass, heroes: [] }).then(() => {
            currentUser = user;
            currentPassword = pass;

            if (remember) {
                localStorage.setItem('wizz_remember_user', user);
                localStorage.setItem('wizz_remember_pass', pass);
            } else {
                localStorage.removeItem('wizz_remember_user');
                localStorage.removeItem('wizz_remember_pass');
            }

            document.getElementById('auth-screen').classList.add('hidden');
            openHeroSelector();
        });
    });
}

function logout() {
    currentUser = null;
    currentPassword = null;
    localStorage.removeItem('wizz_remember_user');
    localStorage.removeItem('wizz_remember_pass');
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('hero-select-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
}

function toggleTutorialPref(isChecked) {
    localStorage.setItem('wizz_tutorial_enabled', isChecked ? 'true' : 'false');
}

function openHeroSelector() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('hero-select-screen').classList.remove('hidden');
    
    const tutorialPref = localStorage.getItem('wizz_tutorial_enabled');
    document.getElementById('logged-tutorial-check').checked = (tutorialPref !== 'false');

    const container = document.getElementById('hero-slots-container');
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const hero = heroesList[i];
        if (hero) {
            const classDef = classDefinitions[hero.class] || classDefinitions['PromptEngineer'];
            container.innerHTML += `
                <div class="bg-cyber-bg border border-cyber-border rounded-xl p-3.5 flex flex-col justify-between shadow-lg relative">
                    <button onclick="confirmDeleteHero(${i})" class="absolute top-3 right-3 text-slate-500 hover:text-red-400 text-xs px-2 py-1 rounded-lg border border-slate-800" title="Borrar Personaje">🗑️</button>
                    <div>
                        <div class="flex items-center space-x-3 mb-2">
                            <span class="text-2xl">${classDef.icon}</span>
                            <div>
                                <h4 class="font-orbitron font-bold text-cyber-neonCyan text-sm">${hero.name}</h4>
                                <span class="text-[10px] uppercase text-slate-400 font-orbitron">${classDef.name} • Nv. ${hero.level}</span>
                            </div>
                        </div>
                        <div class="text-xs text-slate-300">Sector ${hero.currentTower} - Nodo ${hero.currentStage}/10</div>
                        <div class="text-[10px] text-cyber-neonPurple">Shards: ${hero.crystals || 0} | Rebirths: ${hero.rebirths || 0}</div>
                    </div>
                    <button onclick="loadHero(${i})" class="w-full mt-3 py-2 bg-gradient-to-r from-cyber-neonCyan to-cyber-neonPink hover:opacity-90 text-black font-orbitron font-bold rounded-xl text-xs transition active:scale-95">Jugar con ${hero.name}</button>
                </div>
            `;
        } else {
            container.innerHTML += `
                <div class="bg-cyber-bg border border-cyber-border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span class="text-xl text-slate-600 mb-1">➕</span>
                    <span class="text-xs text-slate-500 font-medium">Ranura Libre</span>
                </div>
            `;
        }
    }
    if (heroesList.length >= 3) document.getElementById('create-hero-section').classList.add('hidden');
    else document.getElementById('create-hero-section').classList.remove('hidden');
    
    selectClass('PromptEngineer');
}

function confirmDeleteHero(index) {
    const hero = heroesList[index];
    const confirmName = prompt(`⚠️ ¿Estás seguro de eliminar al personaje "${hero.name}"?\n\nEscribe el NOMBRE exacto del personaje para confirmar:`);
    if (confirmName && confirmName.trim().toLowerCase() === hero.name.trim().toLowerCase()) {
        heroesList.splice(index, 1);
        rdb.ref('users/' + currentUser + '/heroes').set(heroesList).then(() => {
            openHeroSelector();
        });
    }
}

function selectClass(className) {
    selectedNewClass = className;
    ['PromptEngineer', 'AISwarmMaster', 'QuantumArchitect', 'CyberSamurai', 'NeuralHacker', 'VoidWeaver'].forEach(c => {
        const btn = document.getElementById('class-btn-' + c);
        if (btn) {
            btn.className = (c === className) 
                ? "class-btn p-2 rounded-xl border border-cyber-neonCyan bg-cyber-neonCyan/20 text-cyber-neonCyan text-[10px] font-bold font-orbitron transition text-center truncate"
                : "class-btn p-2 rounded-xl border border-cyber-border bg-cyber-bg text-slate-400 text-[10px] font-bold font-orbitron transition text-center truncate";
        }
    });
    document.getElementById('class-description-box').innerHTML = classDescriptions[className] || classDescriptions['PromptEngineer'];
}

function createNewHero() {
    const nameInput = document.getElementById('new-hero-name');
    const errBox = document.getElementById('hero-create-error');
    const name = nameInput.value.trim();
    if (!name) { errBox.innerText = "⚠️ Ingresa un nombre válido."; errBox.classList.remove('hidden'); return; }
    
    checkGlobalHeroNameUnique(name, isUnique => {
        if (!isUnique) {
            errBox.innerText = "❌ El nombre ya está registrado globalmente.";
            errBox.classList.remove('hidden');
            return;
        }
        errBox.classList.add('hidden');
        
        let initialSkillId = 'class_skill_pe';
        if (selectedNewClass === 'AISwarmMaster') initialSkillId = 'class_skill_as';
        else if (selectedNewClass === 'QuantumArchitect') initialSkillId = 'class_skill_qa';
        else if (selectedNewClass === 'CyberSamurai') initialSkillId = 'class_skill_cs';
        else if (selectedNewClass === 'NeuralHacker') initialSkillId = 'class_skill_nh';
        else if (selectedNewClass === 'VoidWeaver') initialSkillId = 'class_skill_vw';

        const newHero = {
            name: name, class: selectedNewClass, level: 1, exp: 0, maxExp: 100, gold: 0, crystals: 0, rebirths: 0,
            currentTower: 0, currentStage: 1, maxUnlockedTower: 1, maxUnlockedStage: 1, anchorShip: false,
            lastActiveTower: 1, lastActiveStage: 1,
            damage: 1, dps: 0, critChance: 2, critDmgMult: 1.5, dotDamage: 0, skillPoints: 0, unlockedSkills: { [initialSkillId]: 1 },
            equippedSkills: [initialSkillId, null, null, null, null], skillResetsCount: 0,
            recoveryUntil: 0, deathsCount: 0, voluntaryRetreatsCount: 0, hasStartedTravel: false,
            lastRecoveryType: 'none', lastLostHype: 0, lastLostExp: 0,
            tutorialSeenFirstTravel: false, tutorialSeenDeath: false, tutorialSeenSectors: false,
            upgrades: JSON.parse(JSON.stringify(defaultUpgrades)),
            shardShop: JSON.parse(JSON.stringify(defaultShardShop)),
            achievements: JSON.parse(JSON.stringify(defaultAchievements))
        };
        heroesList.push(newHero);
        rdb.ref('users/' + currentUser + '/heroes').set(heroesList).then(() => {
            nameInput.value = '';
            loadHero(heroesList.length - 1);
        });
    });
}

function loadHero(index) {
    activeHeroIndex = index;
    gameData = heroesList[index];
    currentViewingTower = Math.max(1, gameData.currentTower > 0 ? gameData.currentTower : gameData.maxUnlockedTower);
    if (!gameData.equippedSkills) gameData.equippedSkills = [null, null, null, null, null];
    if (gameData.anchorShip === undefined) gameData.anchorShip = false;
    if (gameData.lastActiveTower === undefined) gameData.lastActiveTower = gameData.maxUnlockedTower || 1;
    if (gameData.lastActiveStage === undefined) gameData.lastActiveStage = gameData.maxUnlockedStage || 1;
    
    let starterKey = 'class_skill_pe';
    if (gameData.class === 'AISwarmMaster') starterKey = 'class_skill_as';
    else if (gameData.class === 'QuantumArchitect') starterKey = 'class_skill_qa';
    else if (gameData.class === 'CyberSamurai') starterKey = 'class_skill_cs';
    else if (gameData.class === 'NeuralHacker') starterKey = 'class_skill_nh';
    else if (gameData.class === 'VoidWeaver') starterKey = 'class_skill_vw';

    if (!gameData.equippedSkills.includes(starterKey) && gameData.equippedSkills[0] === null) {
        gameData.equippedSkills[0] = starterKey;
    }

    if (!gameData.recoveryUntil) gameData.recoveryUntil = 0;
    if (!gameData.deathsCount) gameData.deathsCount = 0;
    if (!gameData.voluntaryRetreatsCount) gameData.voluntaryRetreatsCount = 0;
    if (!gameData.lastRecoveryType) gameData.lastRecoveryType = 'none';
    if (gameData.lastLostHype === undefined) gameData.lastLostHype = 0;
    if (gameData.lastLostExp === undefined) gameData.lastLostExp = 0;
    if (gameData.hasStartedTravel === undefined) gameData.hasStartedTravel = (gameData.maxUnlockedTower > 1 || gameData.currentTower > 0);
    if (gameData.tutorialSeenFirstTravel === undefined) gameData.tutorialSeenFirstTravel = false;
    if (gameData.tutorialSeenDeath === undefined) gameData.tutorialSeenDeath = false;
    if (gameData.tutorialSeenSectors === undefined) gameData.tutorialSeenSectors = false;
    if (!gameData.shardShop) gameData.shardShop = JSON.parse(JSON.stringify(defaultShardShop));
    if (!gameData.achievements) gameData.achievements = JSON.parse(JSON.stringify(defaultAchievements));
    if (gameData.critDmgMult === undefined) gameData.critDmgMult = 1.5;
    if (gameData.dotDamage === undefined) gameData.dotDamage = 0;

    document.getElementById('hero-select-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('anchor-ship-checkbox').checked = gameData.anchorShip;
    initGameSession();

    checkTutorialOnLoad();
}

function calculateBaseDamage() {
    if (!gameData) return 15;
    const charLevel = gameData.level || 1;
    return 15 + (charLevel * 3.5);
}

function calculateTotalDamage(skillMultiplier = 1.0) {
    if (!gameData) return 15;
    
    const dBase = calculateBaseDamage();
    const statsEquipo = gameData.damage || 0; 
    
    let sumaPasivasPorcentaje = 0;
    if (gameData.shardShop) {
        const ss1 = gameData.shardShop.find(x => x.id === 'ss1');
        if (ss1) sumaPasivasPorcentaje += (ss1.level * 0.25);
    }
    if (gameData.upgrades) {
        const omega = gameData.upgrades.find(u => u.id === 'omega_core');
        if (omega) sumaPasivasPorcentaje += (omega.level * 0.5);
    }

    const dTotal = (dBase + statsEquipo) * (1.0 + sumaPasivasPorcentaje) * skillMultiplier;
    return Math.floor(dTotal);
}

function applyOrRefreshDoT(skillNode, calculatedDamage) {
    if (!activeGlobalDotsList) activeGlobalDotsList = [];

    const duration = skillNode.dotTicks || skillNode.dotDuration || 3;
    const maxStacks = 3;

    let existingDot = activeGlobalDotsList.find(d => d.name === skillNode.name);
    
    if (existingDot) {
        existingDot.ticksLeft = Math.min(duration * maxStacks, existingDot.ticksLeft + duration);
        existingDot.damagePerTick += Math.floor(calculatedDamage / duration);
        existingDot.timerCount = 0;
    } else {
        activeGlobalDotsList.push({
            name: skillNode.name,
            ticksLeft: duration,
            interval: 1,
            timerCount: 0,
            damagePerTick: Math.floor(calculatedDamage / duration)
        });
    }
    renderGlobalDots();
}

function checkTutorialOnLoad() {
    const tutorialSetting = localStorage.getItem('wizz_tutorial_enabled');
    if (tutorialSetting === 'false') return;

    if (!gameData.hasStartedTravel) {
        showCyberModal("🛸 BIENVENIDO A LA NAVE ORBITAL", "Estás en tu base central. Aquí puedes ver tus estadísticas de hardware/software o iniciar tu incursión pulsando <b>'Iniciar viaje'</b>.", "📖");
    }
}

function triggerManualTutorial() {
    showCyberModal("📖 GUÍA Y TUTORIAL NEURAL", "• <b>Hype:</b> Divisa digital que obtienes al vencer enemigos. Sirve para comprar Mejoras (Hardware/Software) y reparar la nave.<br><br>• <b>Tiempo y Muerte:</b> Cada nodo tiene un temporizador (⏱️). Si el tiempo se agota o mueres, la nave te regresará automáticamente un nodo hacia atrás y perderás una parte de Hype y EXP.<br><br>• <b>Sectores Dinámicos:</b> Se desbloquean al avanzar por orden.<br><br>• <b>Skills y Mejoras:</b> Gana EXP subiendo de nivel para obtener Puntos de Algoritmo en tu árbol de habilidades.", "🎓");
}

function toggleAnchorShip(isChecked) {
    if (!gameData) return;
    gameData.anchorShip = isChecked;
    saveGameToCloud();
}

function initGameSession() {
    const classDef = classDefinitions[gameData.class] || classDefinitions['PromptEngineer'];
    document.getElementById('header-username').innerText = gameData.name;
    document.getElementById('header-class').innerText = classDef.name.toUpperCase();
    document.getElementById('header-avatar-bg').innerText = classDef.icon;
    document.getElementById('tap-icon').innerText = classDef.icon;
    updateUI();
    spawnEnemy();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(gameLoopTick, 1000);
}

function updateNavTabVisuals(isNave) {
    const iconEl = document.getElementById('nav-tab-icon');
    const labelEl = document.getElementById('nav-tab-label');
    const naveStatsPanel = document.getElementById('nave-stats-panel');
    const battleClickZone = document.getElementById('battle-click-zone');
    const activeSkillBar = document.getElementById('active-skill-bar-container');
    const navegarCenterContainer = document.getElementById('navegar-center-container');
    const mainTravelBtn = document.getElementById('main-travel-btn');
    const sectorsTabBtn = document.getElementById('nav-btn-Torre');
    const enemyTimerBadge = document.getElementById('enemy-timer-badge');
    const anchorShipWrapper = document.getElementById('anchor-ship-wrapper');
    
    const now = Date.now();
    const isRecovering = gameData.recoveryUntil && gameData.recoveryUntil > now;

    if (isNave) {
        iconEl.innerText = "🛸";
        labelEl.innerText = "Nave";
        naveStatsPanel.classList.remove('hidden');
        renderNaveStats();
        battleClickZone.classList.add('hidden');
        activeSkillBar.classList.add('hidden');
        enemyTimerBadge.classList.add('hidden');
        if (anchorShipWrapper) anchorShipWrapper.classList.add('hidden');
        if (navegarCenterContainer) navegarCenterContainer.classList.remove('hidden');
        
        if (isRecovering) {
            mainTravelBtn.setAttribute('disabled', 'true');
            mainTravelBtn.className = "px-5 py-2 bg-slate-700 text-slate-400 font-extrabold rounded-xl text-xs font-orbitron cursor-not-allowed opacity-60";
            sectorsTabBtn.setAttribute('disabled', 'true');
            sectorsTabBtn.className = "nav-btn tooltip-container flex flex-col items-center justify-center py-1 rounded-xl text-slate-600 cursor-not-allowed transition relative";
        } else {
            mainTravelBtn.removeAttribute('disabled');
            mainTravelBtn.className = "px-5 py-2 bg-gradient-to-r from-cyber-neonCyan to-cyber-neonPink text-black font-extrabold rounded-xl text-xs font-orbitron shadow-neon-cyan animate-pulse";
            if (gameData.hasStartedTravel) {
                const targetTower = Math.max(1, gameData.lastActiveTower || gameData.maxUnlockedTower || 1);
                const targetStage = Math.max(1, gameData.lastActiveStage || gameData.maxUnlockedStage || 1);
                mainTravelBtn.innerText = `🚀 Navegar (Sector ${targetTower}: Nodo ${targetStage})`;
                sectorsTabBtn.removeAttribute('disabled');
                sectorsTabBtn.className = "nav-btn tooltip-container flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-white transition relative";
            } else {
                mainTravelBtn.innerText = "🚀 Iniciar viaje (Sector 1: Nodo 1)";
                sectorsTabBtn.setAttribute('disabled', 'true');
                sectorsTabBtn.className = "nav-btn tooltip-container flex flex-col items-center justify-center py-1 rounded-xl text-slate-600 cursor-not-allowed transition relative";
            }
        }
    } else {
        iconEl.innerText = "⚡";
        labelEl.innerText = "Batalla";
        naveStatsPanel.classList.add('hidden');
        battleClickZone.classList.remove('hidden');
        activeSkillBar.classList.remove('hidden');
        enemyTimerBadge.classList.remove('hidden');
        if (anchorShipWrapper) anchorShipWrapper.classList.remove('hidden');
        if (navegarCenterContainer) navegarCenterContainer.classList.add('hidden');
        
        sectorsTabBtn.removeAttribute('disabled');
        sectorsTabBtn.className = "nav-btn tooltip-container flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-white transition relative";
    }
    renderActionBar();
}

function renderNaveStats() {
    const grid = document.getElementById('nave-stats-grid');
    if (!grid || !gameData) return;

    let globalDmgMulti = 1;
    if (gameData.shardShop) {
        const ss1 = gameData.shardShop.find(x => x.id === 'ss1');
        if (ss1) globalDmgMulti += (ss1.level * 0.25);
    }
    if (gameData.upgrades) {
        const omega = gameData.upgrades.find(u => u.id === 'omega_core');
        if (omega) globalDmgMulti += (omega.level * 0.5);
    }

    let currentCrit = gameData.critChance || 2;
    if (gameData.shardShop) {
        const ss5 = gameData.shardShop.find(x => x.id === 'ss5');
        if (ss5) currentCrit += (ss5.level * 0.5);
    }

    let cdReductionPct = 0;
    if (gameData.shardShop) {
        const ss11 = gameData.shardShop.find(x => x.id === 'ss11');
        if (ss11) cdReductionPct += (ss11.level * 10);
    }

    let hypeBonus = 0;
    if (gameData.upgrades) {
        const goldUp = gameData.upgrades.find(u => u.id === 'gold1');
        if (goldUp) hypeBonus += (goldUp.level * 25);
    }

    let expBonus = 0;
    if (gameData.upgrades) {
        const expUp = gameData.upgrades.find(u => u.id === 'expboost');
        if (expUp) expBonus += (expUp.level * 1);
    }

    grid.innerHTML = `
        <div>⚔️ Daño Base: <strong class="text-cyber-neonCyan">${calculateTotalDamage(1.0)}</strong></div>
        <div>💥 Prob. Daño Crítico: <strong class="text-cyber-neonPink">${currentCrit}%</strong></div>
        <div>⚡ Daño Crit: <strong class="text-cyber-neonPink">${Math.floor((gameData.critDmgMult || 1.5) * 100)}%</strong></div>
        <div>☣️ Daño de DoT: <strong class="text-cyber-neonYellow">${gameData.dotDamage || 0}</strong></div>
        <div>💰 Bonus Hype: <strong class="text-[#f3e600]">+${hypeBonus}%</strong></div>
        <div>📈 Bonus EXP: <strong class="text-cyber-neonCyan">+${expBonus}%</strong></div>
        <div>⏱️ Reducción CD: <strong class="text-cyber-neonCyan">-${cdReductionPct}%</strong></div>
        <div>💀 Muertes: <strong class="text-red-400">${gameData.deathsCount || 0}</strong></div>
    `;
}

let bossAnnouncementTimer = null;

function spawnEnemy() {
    const isNave = (gameData.currentTower === 0);
    const isBoss = (gameData.currentStage === 10 && !isNave);

    updateNavTabVisuals(isNave);
    renderGlobalDots();

    let timeMultiplier = 1;
    if (gameData.shardShop) {
        const ss3 = gameData.shardShop.find(x => x.id === 'ss3');
        if (ss3) timeMultiplier = Math.max(0.4, 1 - (ss3.level * 0.08));
    }
    const multiplier = isNave ? 1 : Math.pow(1.3, gameData.currentTower - 1) * Math.pow(1.15, gameData.currentStage - 1);
    enemyMaxHp = isNave ? 50 : Math.floor((isBoss ? 180 : 45) * multiplier);
    enemyHp = enemyMaxHp;
    
    enemyTimer = isNave ? 999 : Math.max(5, Math.floor((isBoss ? 30 : 10) * timeMultiplier));
    document.getElementById('enemy-timer-display').innerText = enemyTimer;

    bossFightActive = isBoss;
    const minigameBox = document.getElementById('boss-minigame-box');
    const announcementBanner = document.getElementById('boss-announcement-banner');
    const returnNaveBtn = document.getElementById('return-nave-btn');
    const challengeBtn = document.getElementById('boss-challenge-btn');
    const recoveryBanner = document.getElementById('recovery-banner');
    const recoveryTitleText = document.getElementById('recovery-title-text');
    const recoveryLostDetails = document.getElementById('recovery-lost-details');
    const repairButtonWrapper = document.getElementById('repair-button-wrapper');
    const hpWrapper = document.getElementById('enemy-hp-wrapper');
    
    if (bossAnnouncementTimer) clearTimeout(bossAnnouncementTimer);
    announcementBanner.classList.add('hidden');

    const now = Date.now();
    const activeRecovery = gameData.recoveryUntil && gameData.recoveryUntil > now;

    if (isNave) {
        hpWrapper.classList.add('hidden');
        if (activeRecovery) {
            recoveryBanner.classList.remove('hidden');
            
            if (gameData.lastLostHype > 0 || gameData.lastLostExp > 0) {
                recoveryLostDetails.classList.remove('hidden');
                recoveryLostDetails.innerHTML = `⚠️ Pérdida: <span class="text-amber-400">-${gameData.lastLostHype} Hype</span> y <span class="text-cyan-400">-${gameData.lastLostExp} EXP</span>`;
            } else {
                recoveryLostDetails.classList.add('hidden');
            }

            if (gameData.lastRecoveryType === 'retreat') {
                recoveryTitleText.innerHTML = `⛽ NAVE RECARGANDO. Listo en: <span id="recovery-timer-display" class="text-cyber-neonYellow">0</span>s`;
                repairButtonWrapper.classList.add('hidden');
            } else {
                recoveryTitleText.innerHTML = `⛽ NAVE AVERIADA. Listo en: <span id="recovery-timer-display" class="text-cyber-neonYellow">0</span>s`;
                repairButtonWrapper.classList.remove('hidden');
                const repairCost = 20 + ((gameData.deathsCount || 0) * 10);
                document.getElementById('repair-cost-display').innerText = repairCost;
            }
        } else {
            recoveryBanner.classList.add('hidden');
            gameData.lastLostHype = 0;
            gameData.lastLostExp = 0;
        }
        returnNaveBtn.classList.add('hidden');
        challengeBtn.classList.add('hidden');
    } else {
        hpWrapper.classList.remove('hidden');
        recoveryBanner.classList.add('hidden');
        
        if (isBoss) {
            returnNaveBtn.classList.add('hidden');
        } else {
            returnNaveBtn.classList.remove('hidden');
        }

        if (gameData.currentStage === 9 && gameData.currentTower >= gameData.maxUnlockedTower) {
            challengeBtn.classList.remove('hidden');
        } else {
            challengeBtn.classList.add('hidden');
        }
    }

    if (bossFightActive) {
        minigameBox.classList.remove('hidden');
        initBossMinigame();
    } else {
        minigameBox.classList.add('hidden');
    }

    const sectorText = getSectorName(gameData.currentTower);
    document.getElementById('stage-badge').innerText = isNave ? `Nave de ${gameData.name}` : `${sectorText} • ${isBoss ? '🔥 JEFE' : 'Nodo ' + gameData.currentStage + '/10'}`;
    document.getElementById('enemy-name').innerText = isNave ? `Nave Orbital Central` : (isBoss ? `Firewall Central` : `Subrutina Hostil`);
    document.getElementById('enemy-lore').innerText = isNave ? "Centro de control orbital." : "Subrutina hostil bloqueando red.";
    updateEnemyHpUI();
}

function applyDefeatPenalties() {
    let reductionPct = 0;
    if (gameData.shardShop) {
        const ss13 = gameData.shardShop.find(x => x.id === 'ss13');
        if (ss13) reductionPct = Math.min(50, ss13.level * 10);
    }
    const effectiveLossPct = Math.max(0, 20 - (20 * (reductionPct / 100)));

    const lostHype = Math.floor(gameData.gold * (effectiveLossPct / 100));
    const lostExp = Math.floor(gameData.exp * (effectiveLossPct / 100));

    gameData.gold = Math.max(0, gameData.gold - lostHype);
    gameData.exp = Math.max(0, gameData.exp - lostExp);

    gameData.lastLostHype = lostHype;
    gameData.lastLostExp = lostExp;
}

function startExploration() {
    const now = Date.now();
    if (gameData.recoveryUntil && gameData.recoveryUntil > now) {
        if (gameData.lastRecoveryType === 'retreat') {
            showCyberModal("RECARGANDO COMBUSTIBLE", "La nave está repostando combustible.", "⛽");
        } else {
            showCyberModal("NAVE AVERIADA", "Espera a que termine la reparación o paga Hype.", "⚠️");
        }
        return;
    }

    const tutorialSetting = localStorage.getItem('wizz_tutorial_enabled');
    if (!gameData.tutorialSeenFirstTravel && tutorialSetting !== 'false') {
        gameData.tutorialSeenFirstTravel = true;
        showCyberModal("🚀 INICIO DE VIAJE E INCURSIÓN", "Has salido al sector de combate. Aquí verás el <b>Temporizador (⏱️)</b>: debes derrotar al enemigo antes de que llegue a cero. Si se agota o mueres, la nave te regresará automáticamente un nodo hacia atrás y perderás una parte de Hype y EXP.", "📖", () => {
            proceedToBattleStart();
        });
        return;
    }
    proceedToBattleStart();
}

function proceedToBattleStart() {
    gameData.hasStartedTravel = true;
    
    gameData.currentTower = Math.max(1, gameData.lastActiveTower || gameData.maxUnlockedTower || 1);
    gameData.currentStage = Math.max(1, gameData.lastActiveStage || gameData.maxUnlockedStage || 1);

    spawnEnemy();
    switchTab('Batalla');
    saveGameToCloud();
}

function returnToNaveManually() {
    if (gameData.currentTower > 0) {
        gameData.lastActiveTower = gameData.currentTower;
        gameData.lastActiveStage = gameData.currentStage;
    }

    activeGlobalDotsList = [];
    renderGlobalDots();

    gameData.currentTower = 0;
    gameData.currentStage = 1;
    gameData.lastRecoveryType = 'retreat';
    gameData.lastLostHype = 0;
    gameData.lastLostExp = 0;
    
    gameData.voluntaryRetreatsCount = (gameData.voluntaryRetreatsCount || 0) + 1;
    let recoverySeconds = 2 + Math.floor((gameData.voluntaryRetreatsCount - 1) * 0.5);

    if (gameData.class === 'QuantumArchitect' && gameData.unlockedSkills) {
        const qa7Lvl = gameData.unlockedSkills['qa_in'] || 0;
        if (qa7Lvl > 0) recoverySeconds = Math.max(1, recoverySeconds - (qa7Lvl * 1));
    }
    if (gameData.shardShop) {
        const ss10 = gameData.shardShop.find(x => x.id === 'ss10');
        if (ss10 && ss10.level > 0) recoverySeconds = Math.floor(recoverySeconds * (1 - (ss10.level * 0.15)));
    }

    gameData.recoveryUntil = Date.now() + (recoverySeconds * 1000);
    spawnEnemy();
    saveGameToCloud();
    showCyberModal("RETIRADA A LA NAVE", "Has regresado a la nave de forma segura. Todos los efectos DoT activos han finalizado.", "🛸");
}

function handleEnemyTimeOutDeath() {
    if (gameData.currentStage > 1) {
        gameData.currentStage--;
    } else if (gameData.currentTower > 1) {
        gameData.currentTower--;
        gameData.currentStage = 10;
    } else {
        gameData.currentTower = 0;
        gameData.currentStage = 1;
    }

    gameData.lastActiveTower = gameData.currentTower > 0 ? gameData.currentTower : 1;
    gameData.lastActiveStage = gameData.currentTower > 0 ? gameData.currentStage : 1;

    activeGlobalDotsList = [];
    renderGlobalDots();

    gameData.lastRecoveryType = 'death';
    gameData.deathsCount = (gameData.deathsCount || 0) + 1;

    applyDefeatPenalties();

    let deathSeconds = 5 + Math.floor((gameData.deathsCount - 1) * 2);
    if (gameData.class === 'QuantumArchitect' && gameData.unlockedSkills) {
        const qa7Lvl = gameData.unlockedSkills['qa_in'] || 0;
        if (qa7Lvl > 0) deathSeconds = Math.max(3, deathSeconds - (qa7Lvl * 1));
    }

    gameData.recoveryUntil = Date.now() + (deathSeconds * 1000);
    
    gameData.currentTower = 0;
    spawnEnemy();
    switchTab('Batalla');
    saveGameToCloud();

    const tutorialSetting = localStorage.getItem('wizz_tutorial_enabled');
    if (!gameData.tutorialSeenDeath && tutorialSetting !== 'false') {
        gameData.tutorialSeenDeath = true;
        showCyberModal("💀 ¡HAS MUERTO O EXPIRÓ EL TIEMPO!", `El temporizador llegó a 0 o tus PV expiraron.\n\nAl morir, la nave te ha regresado automáticamente un nodo hacia atrás. Perdiste ${gameData.lastLostHype} Hype y ${gameData.lastLostExp} EXP.`, "⚠️");
    } else {
        showCyberModal("¡RED SOBRECARGADA!", `Derrota o tiempo agotado.\n\nPerdiste: ${gameData.lastLostHype} Hype y ${gameData.lastLostExp} EXP.\n\nSe ha retrocedido al nivel anterior.`, "💥");
    }
}

function repairShipWithHype() {
    const cost = 20 + ((gameData.deathsCount || 0) * 10);
    if (gameData.gold < cost) {
        showCyberModal("HYPE INSUFICIENTE", `Necesitas ${cost} Hype.`, "💰");
        return;
    }
    gameData.gold -= cost;
    gameData.recoveryUntil = 0;
    gameData.lastRecoveryType = 'none';
    gameData.lastLostHype = 0;
    gameData.lastLostExp = 0;
    updateUI();
    spawnEnemy();
    saveGameToCloud();
    showCyberModal("SISTEMAS RESTAURADOS", "Nave reparada con Hype.", "🔧");
}

function challengeBossEarly() {
    gameData.currentStage = 10;
    spawnEnemy();
    document.getElementById('boss-challenge-btn').classList.add('hidden');
}

function initBossMinigame() {
    minigameType = Math.floor(Math.random() * 5) + 1;
    const titleEl = document.getElementById('minigame-title');
    const contentEl = document.getElementById('minigame-content');
    contentEl.innerHTML = '';

    if (minigameType === 1) {
        titleEl.innerText = "🛡️ [1/5] PURGA SECUENCIA DE NODOS";
        minigameState = { seq: [1, 2, 3], idx: 0 };
        [1, 2, 3].sort(() => Math.random() - 0.5).forEach(num => {
            contentEl.innerHTML += `<button id="boss-m1-${num}" onclick="handleBossMinigame1(${num})" class="w-7 h-7 bg-cyber-neonPink text-black font-extrabold rounded font-orbitron shadow text-xs transition active:scale-95">${num}</button>`;
        });
    } else if (minigameType === 2) {
        titleEl.innerText = "🛡️ [2/5] SINCRONIZADOR DE NÚCLEO";
        contentEl.innerHTML = `<div id="boss-sync-bar" class="w-44 bg-cyber-bg h-4 rounded-full relative overflow-hidden cursor-pointer border border-cyber-neonCyan shadow-inner" onclick="handleBossMinigame2(event)"><div id="slider-cursor" class="absolute w-4 h-full bg-cyber-neonYellow animate-bounce" style="left: 30%;"></div><span class="absolute inset-0 text-[8px] text-center leading-4 text-white font-bold pointer-events-none">Click zona central</span></div>`;
    } else if (minigameType === 3) {
        titleEl.innerText = "🛡️ [3/5] DESENCRIPTAR CLAVE";
        const a = Math.floor(Math.random() * 8) + 4;
        const b = Math.floor(Math.random() * 5) + 2;
        minigameState = { answer: a * b };
        contentEl.innerHTML = `<span class="text-xs text-cyber-neonYellow font-orbitron">${a}×${b}=?</span> <input type="number" id="math-ans-input" class="w-12 bg-cyber-bg border border-cyber-border rounded px-1 py-0.5 text-xs text-white" /><button onclick="handleBossMinigame3()" class="px-2 py-0.5 bg-cyber-neonCyan text-black text-xs font-bold rounded shadow active:scale-95">OK</button>`;
    } else if (minigameType === 4) {
        titleEl.innerText = "🛡️ [4/5] INTERRUPCIÓN DE FIREWALL";
        contentEl.innerHTML = `<button id="boss-hack-btn" onclick="handleBossMinigame4()" class="px-3 py-1 bg-cyber-neonPink text-black font-extrabold rounded-xl text-[11px] font-orbitron animate-pulse shadow-neon-pink active:scale-95">¡BLOQUEAR HACK!</button>`;
    } else {
        titleEl.innerText = "🛡️ [5/5] PURGAR PUERTO LIMPIO";
        const correctTarget = Math.floor(Math.random() * 3) + 1;
        minigameState = { correct: correctTarget };
        for (let p = 1; p <= 3; p++) {
            const isGood = (p === correctTarget);
            contentEl.innerHTML += `<button id="boss-p-${p}" onclick="handleBossMinigame5(${isGood}, ${p})" class="px-2 py-0.5 bg-cyber-neonCyan text-black font-bold rounded-xl text-[10px] font-orbitron shadow transition active:scale-95">Puerto ${p}</button>`;
        }
    }
}

function handleBossMinigame1(num) {
    const btn = document.getElementById(`boss-m1-${num}`);
    if (minigameState.seq[minigameState.idx] === num) {
        if (btn) {
            btn.classList.remove('bg-cyber-neonPink');
            btn.classList.add('bg-green-400', 'text-slate-950', 'opacity-20', 'scale-75');
            btn.innerText = '✓';
        }
        minigameState.idx++;
        if (minigameState.idx >= minigameState.seq.length) {
            completeBossMinigame();
        }
    } else {
        minigameState.idx = 0;
        enemyTimer += 3;
        if (btn) {
            btn.classList.add('bg-red-600', 'animate-bounce');
            setTimeout(() => btn.classList.remove('bg-red-600', 'animate-bounce'), 400);
        }
        showSkillActionEffect("¡FALLO! +3s", "pink", "+3s");
        [1, 2, 3].forEach(n => {
            const b = document.getElementById(`boss-m1-${n}`);
            if (b) {
                b.className = "w-7 h-7 bg-cyber-neonPink text-black font-extrabold rounded font-orbitron shadow text-xs transition active:scale-95";
                b.innerText = n;
            }
        });
    }
}

function handleBossMinigame2(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    const bar = document.getElementById('boss-sync-bar');
    if (pct >= 0.35 && pct <= 0.65) {
        if (bar) bar.className = "w-44 bg-green-500 h-4 rounded-full relative overflow-hidden transition-all duration-300 shadow-lg";
        setTimeout(() => completeBossMinigame(), 250);
    } else {
        enemyTimer += 4;
        if (bar) {
            bar.className = "w-44 bg-red-600 h-4 rounded-full relative overflow-hidden transition-all duration-300 animate-bounce";
            setTimeout(() => bar.className = "w-44 bg-cyber-bg h-4 rounded-full relative overflow-hidden cursor-pointer border border-cyber-neonCyan shadow-inner", 400);
        }
        showSkillActionEffect("¡FALLO SYNC! +4s", "pink", "+4s");
    }
}

function handleBossMinigame3() {
    const valInput = document.getElementById('math-ans-input');
    const val = parseInt(valInput ? valInput.value : NaN);
    if (val === minigameState.answer) {
        completeBossMinigame();
    } else {
        enemyTimer += 4;
        showSkillActionEffect("¡FALLO CÁLCULO! +4s", "pink", "+4s");
        if (valInput) valInput.value = '';
    }
}

function handleBossMinigame4() {
    const btn = document.getElementById('boss-hack-btn');
    if (btn) {
        btn.className = "px-3 py-1 bg-green-400 text-slate-950 font-extrabold rounded-xl text-[11px] font-orbitron transition-all scale-90 opacity-40 shadow-lg";
        btn.innerText = "¡BLOQUEADO!";
    }
    setTimeout(() => completeBossMinigame(), 250);
}

function handleBossMinigame5(isGood, portNum) {
    const btn = document.getElementById(`boss-p-${portNum}`);
    if (isGood) {
        if (btn) {
            btn.className = "px-2 py-0.5 bg-green-400 text-slate-950 font-bold rounded-xl text-[10px] font-orbitron shadow opacity-30";
            btn.innerText = "✓ SEGURO";
        }
        setTimeout(() => completeBossMinigame(), 250);
    } else {
        enemyTimer += 3;
        if (btn) {
            btn.className = "px-2 py-0.5 bg-red-600 text-white font-bold rounded-xl text-[10px] font-orbitron shadow animate-bounce";
            btn.innerText = "❌ INFECCIÓN";
        }
        showSkillActionEffect("¡PUERTO INSEGURO! +3s", "pink", "+3s");
    }
}

function completeBossMinigame() {
    document.getElementById('boss-minigame-box').classList.add('hidden');
    document.getElementById('boss-announcement-banner').classList.add('hidden');
    bossFightActive = false;
}

function renderGlobalDots() {
    const container = document.getElementById('enemy-debuffs-container');
    const dotCounterBox = document.getElementById('dot-active-counter-box');
    const dotCounterDisplay = document.getElementById('dot-counter-display');
    const dotNameDisplay = document.getElementById('dot-name-display');

    if (!container) return;
    container.innerHTML = '';
    if (activeGlobalDotsList.length > 0) {
        if (dotCounterBox) dotCounterBox.classList.remove('hidden');
        let primaryDot = activeGlobalDotsList[0];
        let totalRemainingSecs = primaryDot.ticksLeft;
        if (dotNameDisplay) dotNameDisplay.innerText = primaryDot.name;
        if (dotCounterDisplay) dotCounterDisplay.innerText = totalRemainingSecs + 's';

        activeGlobalDotsList.forEach((dot) => {
            let remSecs = dot.ticksLeft;
            container.innerHTML += `
                <div class="tooltip-container bg-purple-950/85 border border-cyber-neonPurple px-1.5 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer">
                    <span class="text-[9px] text-cyber-neonYellow">☣️</span>
                    <span class="text-[9px] font-mono text-purple-200 font-bold text-center">${remSecs}s</span>
                    <div class="tooltip-box absolute left-0 bottom-full mb-1 w-44 bg-cyber-panel border border-cyber-neonPurple rounded-xl p-2 text-xs text-slate-200 shadow-xl z-50 text-center pointer-events-none">
                        <strong>DoT Activo:</strong> ${dot.name}<br>
                        Daño/Tick: <span class="text-cyber-neonCyan">${dot.damagePerTick}</span><br>
                        Tiempo Restante: <span class="text-cyber-neonYellow">${remSecs}s</span>
                    </div>
                </div>
            `;
        });
    } else {
        if (dotCounterBox) dotCounterBox.classList.add('hidden');
    }
}

function updateCooldownsUI() {
    let activeNodes = getAllActiveNodesList();
    for (let i = 0; i < 5; i++) {
        const equippedId = gameData.equippedSkills[i];
        const matchedNode = activeNodes.find(n => n.id === equippedId);
        const cdRemaining = matchedNode ? (skillCooldowns[matchedNode.id] || 0) : 0;
        
        const overlay = document.getElementById(`action-cd-overlay-${i}`);
        if (overlay) {
            if (cdRemaining > 0) {
                overlay.innerText = cdRemaining + 's';
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
    }
}

function gameLoopTick() {
    if (!gameData) return;

    Object.keys(skillCooldowns).forEach(skillId => {
        if (skillCooldowns[skillId] > 0) {
            skillCooldowns[skillId]--;
        }
    });
    
    updateCooldownsUI();

    if (gameData.currentTower > 0 && enemyHp > 0 && !bossFightActive) {
        gameData.lastActiveTower = gameData.currentTower;
        gameData.lastActiveStage = gameData.currentStage;

        if (activeGlobalDotsList.length > 0) {
            activeGlobalDotsList.forEach(dot => {
                dot.timerCount += 1;
                if (dot.timerCount >= dot.interval) {
                    dot.timerCount = 0;
                    dot.ticksLeft--;
                    damageEnemy(dot.damagePerTick, false, true);
                    showSkillActionEffect(dot.name, 'violet', dot.damagePerTick);
                }
            });
            activeGlobalDotsList = activeGlobalDotsList.filter(d => d.ticksLeft > 0);
            renderGlobalDots();
        } else {
            renderGlobalDots();
        }
    } else {
        renderGlobalDots();
    }

    if (gameData.currentTower === 0 && gameData.recoveryUntil) {
        const remaining = Math.ceil((gameData.recoveryUntil - Date.now()) / 1000);
        const recoveryBanner = document.getElementById('recovery-banner');
        if (remaining > 0) {
            recoveryBanner.classList.remove('hidden');
            const timerDisp = document.getElementById('recovery-timer-display');
            if (timerDisp) timerDisp.innerText = remaining;
            updateNavTabVisuals(true);
        } else {
            recoveryBanner.classList.add('hidden');
            gameData.recoveryUntil = 0;
            gameData.lastRecoveryType = 'none';
            gameData.lastLostHype = 0;
            gameData.lastLostExp = 0;
            updateNavTabVisuals(true);
        }
    }

    if (gameData.currentTower === 0) return;

    enemyTimer--;
    const timerDisplay = document.getElementById('enemy-timer-display');
    if (timerDisplay) timerDisplay.innerText = Math.max(0, enemyTimer);

    if (enemyTimer <= 0) {
        handleEnemyTimeOutDeath();
    }
}

function handleTap(event) {
    if (gameData.currentTower === 0) return;
    const btn = document.getElementById('tap-target-btn');
    btn.classList.add('click-pulse');
    setTimeout(() => btn.classList.remove('click-pulse'), 80);

    let finalTapDmg = calculateTotalDamage(1.0);
    
    let currentCrit = gameData.critChance || 2;
    if (gameData.shardShop) {
        const ss5 = gameData.shardShop.find(x => x.id === 'ss5');
        if (ss5) currentCrit += (ss5.level * 0.5);
    }

    let isCrit = Math.random() * 100 < currentCrit;
    if (isCrit) finalTapDmg = Math.floor(finalTapDmg * (gameData.critDmgMult || 1.5));

    damageEnemy(finalTapDmg, isCrit, false);
    showFloatingDmg(event, (isCrit ? '💥 CRIT! +' : '+') + finalTapDmg, isCrit);
    checkAchievementProgress('ach1', 1);
}

function damageEnemy(amount, isCrit = false, isDot = false) {
    if (bossFightActive) return;
    enemyHp -= amount;
    if (enemyHp <= 0) {
        enemyHp = 0;
        defeatEnemy();
    }
    updateEnemyHpUI();
}

function showSkillActionEffect(skillName, colorType, damageValue) {
    const container = document.getElementById('floating-text-container');
    const el = document.createElement('div');
    
    let colorHex = '#00f0ff';
    if (colorType === 'yellow') colorHex = '#f3e600';
    else if (colorType === 'violet') colorHex = '#9d00ff';
    else if (colorType === 'pink') colorHex = '#ff007f';
    else if (colorType === 'cyan') colorHex = '#00f0ff';

    el.className = `absolute font-orbitron floating-skill-text text-sm`;
    el.style.color = colorHex;
    el.style.left = '50%';
    el.style.top = '25%';
    el.style.transform = 'translate(-50%, -50%)';
    el.innerHTML = `⚡ ${skillName} <span class="text-white">(-${damageValue})</span>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1400);
}

function showRewardPopups(earnedHype, earnedExp) {
    const container = document.getElementById('floating-text-container');
    
    const expEl = document.createElement('div');
    expEl.className = `absolute font-orbitron font-bold text-slate-300 floating-dmg`;
    expEl.style.left = '35%';
    expEl.style.top = '50%';
    expEl.style.transform = 'translate(-50%, -50%)';
    expEl.innerText = `+${earnedExp} EXP`;
    container.appendChild(expEl);
    setTimeout(() => expEl.remove(), 1400);

    const hypeEl = document.createElement('div');
    hypeEl.className = `absolute font-orbitron font-bold text-[#f3e600] floating-dmg`;
    hypeEl.style.left = '65%';
    hypeEl.style.top = '50%';
    hypeEl.style.transform = 'translate(-50%, -50%)';
    hypeEl.innerText = `+${earnedHype} Hype`;
    container.appendChild(hypeEl);
    setTimeout(() => hypeEl.remove(), 1400);
}

function defeatEnemy() {
    let hypeMulti = 1;
    if (gameData.upgrades) {
        const goldUp = gameData.upgrades.find(u => u.id === 'gold1');
        if (goldUp) hypeMulti += (goldUp.level * 0.25);
    }
    if (gameData.shardShop) {
        const ss2 = gameData.shardShop.find(x => x.id === 'ss2');
        if (ss2) hypeMulti += (ss2.level * 0.4);
    }

    const isBoss = (gameData.currentStage === 10);
    let earnedHype = Math.floor(((isBoss ? 45 : 12) / 2) * Math.pow(1.25, gameData.currentTower - 1) * hypeMulti);
    
    if (gameData.shardShop) {
        const ss9 = gameData.shardShop.find(x => x.id === 'ss9');
        if (ss9 && Math.random() * 100 < (ss9.level * 15)) earnedHype *= 2;
    }

    let expMulti = 1;
    if (gameData.upgrades) {
        const expUp = gameData.upgrades.find(u => u.id === 'expboost');
        if (expUp) expMulti += (expUp.level * 0.01);
    }
    if (gameData.shardShop) {
        const ss4 = gameData.shardShop.find(x => x.id === 'ss4');
        if (ss4) expMulti += (ss4.level * 0.01);
    }
    const earnedExp = Math.max(1, Math.floor(25 * Math.pow(1.12, gameData.currentTower - 1) * expMulti));

    gameData.gold += earnedHype;
    gameData.exp += earnedExp;

    showRewardPopups(earnedHype, earnedExp);

    checkAchievementProgress('ach7', gameData.gold);
    if (isBoss) checkAchievementProgress('ach4', 1);

    if (gameData.exp >= gameData.maxExp) {
        gameData.level++;
        gameData.exp -= gameData.maxExp;
        gameData.maxExp = Math.floor(gameData.maxExp * 1.35);
        
        let extraPoints = 1;
        if (gameData.shardShop) {
            const ss8 = gameData.shardShop.find(x => x.id === 'ss8');
            if (ss8) extraPoints += ss8.level;
        }
        gameData.skillPoints += extraPoints;
        checkAchievementProgress('ach2', gameData.level);
        checkAchievementProgress('ach8', gameData.level);
    }

    if (!gameData.anchorShip) {
        if (gameData.currentStage < 9) {
            gameData.currentStage++;
        } else if (gameData.currentStage === 9) {
            gameData.currentStage = 9;
        } else {
            gameData.currentTower++;
            gameData.currentStage = 1;
        }
    }

    if (gameData.currentTower > (gameData.maxUnlockedTower || 0)) gameData.maxUnlockedTower = gameData.currentTower;
    if (gameData.currentStage > (gameData.maxUnlockedStage || 1)) gameData.maxUnlockedStage = gameData.currentStage;

    gameData.lastActiveTower = gameData.currentTower;
    gameData.lastActiveStage = gameData.currentStage;

    checkAchievementProgress('ach5', gameData.maxUnlockedTower);
    spawnEnemy();
    updateUI();
    saveGameToCloud();
}

function showFloatingDmg(event, text, isCrit) {
    const container = document.getElementById('floating-text-container');
    const el = document.createElement('div');
    
    el.className = `absolute font-orbitron font-extrabold ${isCrit ? 'text-red-500 text-lg sm:text-xl' : 'text-white text-sm sm:text-base'} floating-dmg`;
    
    const battleArea = document.getElementById('battle-click-zone') || event.currentTarget;
    const rect = battleArea.getBoundingClientRect();
    
    const clientX = event.clientX || (event.touches && event.touches[0].clientX) || (rect.left + rect.width / 2);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY) || (rect.top + rect.height / 2);

    el.style.left = (clientX - rect.left) + 'px';
    el.style.top = (clientY - rect.top) + 'px';
    el.style.transform = 'translate(-50%, -50%)';
    el.innerText = text;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1400);
}

function updateEnemyHpUI() {
    const pct = Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100));
    document.getElementById('enemy-hp-bar').style.width = pct + '%';
    document.getElementById('enemy-hp-text').innerText = enemyHp + ' / ' + enemyMaxHp;
}

function changeTowerWorld(dir) {
    currentViewingTower += dir;
    if (currentViewingTower < 1) currentViewingTower = 1;
    if (currentViewingTower > gameData.maxUnlockedTower) currentViewingTower = gameData.maxUnlockedTower;
    renderStagesGrid();
}

function renderStagesGrid() {
    const sectorText = getSectorName(currentViewingTower);
    document.getElementById('world-display-title').innerText = `${sectorText}`;
    const grid = document.getElementById('stages-grid');
    grid.innerHTML = '';

    for (let s = 1; s <= 10; s++) {
        const isUnlocked = (currentViewingTower < gameData.maxUnlockedTower) || (currentViewingTower === gameData.maxUnlockedTower && s <= gameData.maxUnlockedStage);
        const isLastVisited = (gameData.maxUnlockedTower === currentViewingTower && gameData.maxUnlockedStage === s);
        const isCurrent = (gameData.currentTower === currentViewingTower && gameData.currentStage === s);
        
        let btnClass = isUnlocked ? "bg-cyber-bg border-cyber-border text-cyber-neonCyan hover:bg-cyber-neonCyan/20 cursor-pointer font-bold" : "bg-cyber-bg/40 border-cyber-border text-slate-600";
        if (isCurrent) btnClass = "bg-cyber-neonCyan/20 border-cyber-neonCyan text-cyber-neonCyan font-bold ring-2 ring-cyber-neonCyan/50";
        if (isLastVisited && !isCurrent) btnClass += " border-2 border-cyber-neonYellow ring-1 ring-cyber-neonYellow";

        let tooltipMessage = isUnlocked ? "Nodo disponible para incursión." : "🔒 <strong>Sector Bloqueado:</strong> Debes completar los nodos y jefes anteriores.";

        grid.innerHTML += `
            <div class="tooltip-container p-2 rounded-xl border ${btnClass} text-center text-xs transition flex flex-col justify-between" ${isUnlocked ? `onclick="selectStageToFarm(${currentViewingTower},${s})"` : ''}>
                <span class="text-[9px] uppercase text-slate-400 font-orbitron">Nodo</span>
                <span class="text-sm font-orbitron">${s}${s === 10 ? ' 🔥' : ''}</span>
                <span class="text-[8px] font-orbitron">${isCurrent ? 'Actual' : (isLastVisited ? '★ Último' : (isUnlocked ? 'Acceder' : 'Bloq.'))}</span>
                
                <div class="tooltip-box absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-48 bg-cyber-panel border border-cyber-neonCyan rounded-xl p-2.5 text-xs text-slate-200 shadow-xl text-left z-50 pointer-events-none">
                    ${tooltipMessage}
                </div>
            </div>
        `;
    }
}

function selectStageToFarm(tower, stage) {
    const now = Date.now();
    if (gameData.recoveryUntil && gameData.recoveryUntil > now) {
        if (gameData.lastRecoveryType === 'retreat') {
            showCyberModal("RECARGANDO COMBUSTIBLE", "La nave está repostando combustible.", "⛽");
        } else {
            showCyberModal("NAVE AVERIADA", "Espera a que termine la reparación.", "⚠️");
        }
        return;
    }
    gameData.currentTower = tower;
    gameData.currentStage = stage;
    
    gameData.lastActiveTower = tower;
    gameData.lastActiveStage = stage;

    spawnEnemy();
    switchTab('Batalla');
    updateUI();
}

function fastForwardCurrentStage() {
    const now = Date.now();
    if (gameData.recoveryUntil && gameData.recoveryUntil > now) {
        if (gameData.lastRecoveryType === 'retreat') {
            showCyberModal("RECARGANDO COMBUSTIBLE", "La nave está repostando combustible.", "⛽");
        } else {
            showCyberModal("NAVE AVERIADA", "Espera a que termine la reparación.", "⚠️");
        }
        return;
    }
    gameData.currentTower = gameData.maxUnlockedTower;
    gameData.currentStage = gameData.maxUnlockedStage;

    gameData.lastActiveTower = gameData.currentTower;
    gameData.lastActiveStage = gameData.currentStage;

    spawnEnemy();
    switchTab('Batalla');
    updateUI();
}

function switchTab(tabName) {
    if (tabName === 'Torre' && !gameData.hasStartedTravel) return;

    if (tabName === 'Torre') {
        const tutorialSetting = localStorage.getItem('wizz_tutorial_enabled');
        if (!gameData.tutorialSeenSectors && tutorialSetting !== 'false') {
            gameData.tutorialSeenSectors = true;
            showCyberModal("🌐 NAVEGACIÓN DE SECTORES", "Aquí puedes ver los sectores e incursiones.", "📖");
        }
    }

    document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(el => {
        if (el.id !== 'nav-btn-Torre' || gameData.hasStartedTravel) {
            el.className = "nav-btn tooltip-container flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-white transition relative";
        }
    });
    document.getElementById('tab-content-' + tabName).classList.remove('hidden');
    document.getElementById('nav-btn-' + tabName).className = "nav-btn tooltip-container flex flex-col items-center justify-center py-1 rounded-xl text-cyber-neonCyan bg-cyber-border border border-cyber-neonCyan/40 transition relative";
    
    if (tabName === 'Torre') { currentViewingTower = Math.max(1, gameData.currentTower > 0 ? gameData.currentTower : gameData.maxUnlockedTower); renderStagesGrid(); }
    else if (tabName === 'Skills') { renderSkillSubTabs(); renderSkillBranchTree(); renderActionBar(); renderConfigBar(); }
    else if (tabName === 'Mejoras') { renderUpgrades(); }
    else if (tabName === 'ShardShop') { switchShardTab(activeShardSubTab); }
    else if (tabName === 'Rebirth') { renderRebirthScreen(); }
    else if (tabName === 'Logros') { renderAchievements(); }
    else if (tabName === 'Global') { loadGlobalRanking(); }
}

function switchShardTab(subCat) {
    activeShardSubTab = subCat;
    ['shop', 'exchange'].forEach(c => {
        const btn = document.getElementById('shard-subtab-' + c);
        if (btn) btn.className = (c === subCat) ? "px-3 py-1 bg-cyber-neonCyan text-black rounded-xl text-xs font-bold font-orbitron" : "px-3 py-1 bg-cyber-bg text-slate-400 rounded-xl text-xs font-bold font-orbitron";
        const subContent = document.getElementById('shard-subcontent-' + c);
        if (subContent) {
            if (c === subCat) subContent.classList.remove('hidden');
            else subContent.classList.add('hidden');
        }
    });
    if (subCat === 'shop') renderShardShop();
}

function updateUI() {
    document.getElementById('header-level').innerText = gameData.level;
    document.getElementById('header-rebirth-badge').innerText = `(⚛️${gameData.rebirths || 0})`;
    document.getElementById('header-exp').innerText = gameData.exp;
    document.getElementById('header-max-exp').innerText = gameData.maxExp;
    document.getElementById('header-gold').innerText = gameData.gold;
    document.getElementById('header-crystals').innerText = gameData.crystals || 0;
    document.getElementById('stat-damage').innerText = calculateTotalDamage(1.0);
    
    let currentCrit = gameData.critChance || 2;
    if (gameData.shardShop) {
        const ss5 = gameData.shardShop.find(x => x.id === 'ss5');
        if (ss5) currentCrit += (ss5.level * 0.5);
    }
    document.getElementById('stat-crit').innerText = currentCrit + '%';
    document.getElementById('stat-dot').innerText = gameData.dotDamage || 0;
    document.getElementById('skill-points-display').innerText = gameData.skillPoints;

    const badgeSkills = document.getElementById('badge-Skills');
    if (gameData.skillPoints > 0) badgeSkills.classList.remove('hidden'); else badgeSkills.classList.add('hidden');

    let hasClaimable = gameData.achievements.some(a => !a.claimed && a.progress >= a.target);
    const badgeLogros = document.getElementById('badge-Logros');
    if (hasClaimable) badgeLogros.classList.remove('hidden'); else badgeLogros.classList.add('hidden');
}

function renderSkillSubTabs() {
    const classDef = classDefinitions[gameData.class] || classDefinitions['PromptEngineer'];
    const subtabsContainer = document.getElementById('skill-subtabs-container');
    subtabsContainer.innerHTML = '';
    classDef.branches.forEach((branch, idx) => {
        const isActive = (activeSkillSubTab === idx);
        subtabsContainer.innerHTML += `
            <button onclick="switchSkillSubTab(${idx})" class="py-1.5 px-2 rounded-lg text-xs font-bold font-orbitron transition truncate ${isActive ? 'bg-cyber-neonCyan text-black shadow-neon-cyan' : 'bg-cyber-bg text-slate-400 hover:text-white'}">
                ${branch.name}
            </button>
        `;
    });
}

function switchSkillSubTab(idx) {
    activeSkillSubTab = idx;
    renderSkillSubTabs();
    renderSkillBranchTree();
}

function colorizeDescription(text) {
    if (!text) return '';
    return text
        .replace(/DoT/g, '<span style="color:#9d00ff; font-weight:bold;">DoT</span>')
        .replace(/sangrado/g, '<span style="color:#9d00ff; font-weight:bold;">sangrado</span>')
        .replace(/Click/g, '<span style="color:#ffffff; font-weight:bold;">Click</span>')
        .replace(/clic/g, '<span style="color:#ffffff; font-weight:bold;">clic</span>')
        .replace(/Crítico/g, '<span style="color:#ff9900; font-weight:bold;">Crítico</span>')
        .replace(/crítico/g, '<span style="color:#ff9900; font-weight:bold;">crítico</span>')
        .replace(/Hype/g, '<span style="color:#f3e600; font-weight:bold;">Hype</span>')
        .replace(/CD/g, '<span style="color:#00f0ff; font-weight:bold;">CD</span>')
        .replace(/cooldown/g, '<span style="color:#00f0ff; font-weight:bold;">cooldown</span>');
}

function getCalculatedSkillTooltip(node, showNextLevel = false) {
    if (!node.descTemplate && !node.desc) return node.desc || '';
    
    const currentLvl = (gameData.unlockedSkills && gameData.unlockedSkills[node.id]) || (node.id.includes('class_skill') ? 1 : 0);
    const nextLvl = currentLvl + 1;
    
    let baseVal = node.baseVal || node.baseDmg || 10;
    let scalingVal = node.scaling || node.scalingDmg || 10;
    let scalingMultiplier = node.scalingMultiplier !== undefined ? node.scalingMultiplier : 1.0;
    let scalingPct = Math.round(scalingMultiplier * 100);

    let rawVal = Math.round(baseVal + Math.max(0, currentLvl - 1) * (scalingVal * scalingMultiplier));
    let nextRawVal = Math.round(baseVal + (currentLvl * (scalingVal * scalingMultiplier)));

    if (node.type === 'passive') {
        let increment = node.scaling || node.baseVal || 5;
        let currentTotalBonus = currentLvl > 0 ? (currentLvl * increment) : 0;
        let maxTotalBonus = node.max * increment;

        // Descripciones temáticas para explicar el incremento de daño sin duplicar números
        const passiveDescriptions = {
            'pe_p1': 'Optimiza los búferes de entrada para amplificar la potencia base de cada comando ejecutado en la red.',
            'pe_p2': 'Calibra los ciclos de procesamiento frontal para elevar la frecuencia y solidez de impacto por clic.',
            'as_p1': 'Sincroniza múltiples subprocesos en enjambre para potenciar la fuerza colectiva de cada pulso.',
            'qa_p1': 'Reconfigura las matrices cuánticas locales para incrementar la densidad energética por clic.',
            'cs_p1': 'Afila los algoritmos de corte de datos para maximizar el impacto directo en cada ejecución.',
            'nh_p1': 'Inyecta rutinas de sobrecarga en el núcleo para elevar la potencia de cada interacción.',
            'vw_p1': 'Teje hilos de energía del vacío para incrementar el poder destructivo de cada pulso.'
        };

        let descText = node.flavorDesc || passiveDescriptions[node.id] || `Optimiza los parámetros internos del sistema para potenciar de forma pasiva la fuerza de cada pulso y clic.`;
        let coloredDesc = colorizeDescription(descText);

        return `
            <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; color: #00f0ff; font-size: 11px; margin-bottom: 3px;">${node.name} ${node.max ? `(${currentLvl}/${node.max})` : ''}</div>
            <div style="color: #00f0ff; font-weight: bold; margin-bottom: 4px; font-size: 10px;">Habilidad pasiva (Plana - Daño por Click)</div>
            <div style="color: #cbd5e1; margin-bottom: 6px; line-height: 1.4; font-size: 10px;">${coloredDesc}</div>
            <div style="border-top: 1px solid rgba(0, 240, 255, 0.25); padding-top: 5px; margin-top: 3px; font-size: 10px;">
                <div style="color: #94a3b8;">📈 Incremento por nivel: <span style="color: #00f0ff;">+${increment} Daño/Click</span></div>
                <div style="color: #94a3b8;">📊 Bono actual: <span style="color: #ff9900; font-weight: bold;">+${currentTotalBonus} ${node.max ? `(Máx: +${maxTotalBonus})` : ''}</span></div>
                ${showNextLevel && node.max && currentLvl > 0 && nextLvl <= node.max ? `<div style="color: #22c55e; font-weight: bold; margin-top: 2px;">Siguiente nivel: +${(nextLvl * increment)}</div>` : (showNextLevel && node.max && currentLvl === 0 && nextLvl <= node.max ? `<div style="color: #22c55e; font-weight: bold; margin-top: 2px;">Siguiente nivel: +${(nextLvl * increment)}</div>` : '')}
                ${showNextLevel && node.max && currentLvl >= node.max ? '<div style="color: #a855f7; font-weight: bold; margin-top: 2px;">Nivel Máximo Alcanzado</div>' : ''}
            </div>
        `;
    }

    let finalDmg = 0;
    let nextFinalDmg = 0;
    let scalingAttributeText = "";
    let attributeColor = "#ffffff";

    if (node.dotTicks || node.stat === 'dot') {
        let currentDotVal = gameData.dotDamage || 0;
        let scaledDotContrib = Math.round(currentDotVal * scalingMultiplier);
        finalDmg = Math.floor(rawVal + scaledDotContrib);
        nextFinalDmg = Math.floor(nextRawVal + scaledDotContrib);
        scalingAttributeText = `<span style="color:#9d00ff; font-weight:bold;">${scalingPct}% Daño de DoT: ${scaledDotContrib}</span> <span style="color:#94a3b8; font-size:9px;">(Total: ${currentDotVal})</span>`;
        attributeColor = "#9d00ff";
    } else if (node.stat === 'crit') {
        let currentCritVal = gameData.critChance || 2;
        finalDmg = rawVal;
        nextFinalDmg = nextRawVal;
        scalingAttributeText = `<span style="color:#ff9900; font-weight:bold;">${scalingPct}% Prob. Daño Crítico: ${currentCritVal}%</span>`;
        attributeColor = "#ff9900";
    } else if (node.stat === 'hype') {
        scalingAttributeText = `<span style="color:#f3e600; font-weight:bold;">${scalingPct}% Bonus Hype: 0%</span>`;
        attributeColor = "#f3e600";
        finalDmg = rawVal;
        nextFinalDmg = nextRawVal;
    } else {
        let currentBaseVal = calculateTotalDamage(1.0);
        let scaledBaseContrib = Math.round(currentBaseVal * scalingMultiplier);
        finalDmg = Math.floor(rawVal + scaledBaseContrib);
        nextFinalDmg = Math.floor(nextRawVal + scaledBaseContrib);
        scalingAttributeText = `<span style="color:#00f0ff; font-weight:bold;">${scalingPct}% Daño Base: ${scaledBaseContrib}</span> <span style="color:#94a3b8; font-size:9px;">(Total: ${currentBaseVal})</span>`;
        attributeColor = "#00f0ff";
    }

    let typeBadge = (node.dotTicks || node.stat === 'dot')
        ? `<div style="color:#9d00ff; font-weight:bold; margin-bottom: 4px; font-size: 10px;">Habilidad activa (${scalingPct}% DoT Acumulable)</div>` 
        : `<div style="color:#f3e600; font-weight:bold; margin-bottom: 4px; font-size: 10px;">Habilidad activa (${scalingPct}% Daño directo)</div>`;

    let template = node.descTemplate || node.desc || '';
    // Limpiar menciones redundantes de Tier y CD en el texto descriptivo
    template = template.replace(/\s*\([^)]*Tier[^)]*\)/gi, '');
    template = template.replace(/\s*\([^)]*CD:[^)]*\)/gi, '');
    template = template.replace(/,\s*CD:\s*\d+s/gi, '');

    template = template.replace(/\{min\}%-\{max\}%/g, rawVal + '%');
    template = template.replace(/\+?\{min\}\s*-\s*\+?\{max\}/g, rawVal);
    template = template.replace(/\{min\}/g, rawVal);
    template = template.replace(/\{max\}/g, rawVal);
    let coloredDesc = colorizeDescription(template);

    let dotInfo = '';
    if (node.dotTicks || node.stat === 'dot') {
        const duration = node.dotTicks || 3;
        const tickDmg = Math.floor(finalDmg / duration);
        dotInfo = `
            <div style="color: #94a3b8; margin-top: 2px;">⏳ Duración: <span style="color: #9d00ff; font-weight: bold;">${duration}s</span></div>
            <div style="color: #94a3b8; margin-top: 2px;">☣️ Daño por Tick: <span style="color: #9d00ff; font-weight: bold;">${tickDmg}</span></div>
        `;
    }

    let html = `
        <div style="font-family: 'Orbitron', sans-serif; font-weight: bold; color: #00f0ff; font-size: 11px; margin-bottom: 3px;">${node.name} ${node.max ? `(${currentLvl}/${node.max})` : ''}</div>
        ${typeBadge}
        <div style="color: #cbd5e1; margin-bottom: 6px; line-height: 1.4; font-size: 10px;">${coloredDesc}</div>
        <div style="border-top: 1px solid rgba(0, 240, 255, 0.25); padding-top: 5px; margin-top: 3px; font-size: 10px;">
            <div style="color: #94a3b8;">⚔️ Valor Base: <span style="color: #ffffff;">${rawVal}</span></div>
            <div style="color: #94a3b8; margin-bottom: 2px;">📈 Escala con: ${scalingAttributeText}</div>
            ${dotInfo}
            <div style="color: #94a3b8; margin-bottom: 4px;">💥 Poder Final: <span style="color: ${attributeColor}; font-weight: bold;">${finalDmg}</span></div>
            ${showNextLevel && node.max && nextLvl <= node.max 
                ? `<div style="color: #22c55e; font-weight: bold;">Siguiente Nivel: Poder ${nextFinalDmg}</div>` 
                : (showNextLevel && node.max ? '<div style="color: #a855f7; font-weight: bold;">Nivel Máximo Alcanzado</div>' : '')}
            ${node.cd ? `<div style="color: #f3e600; font-weight: bold; margin-top: 2px;">CD: ${node.cd}s</div>` : ''}
        </div>
    `;
    return html;
}

function renderSkillBranchTree() {
    const classDef = classDefinitions[gameData.class] || classDefinitions['PromptEngineer'];
    const branch = classDef.branches[activeSkillSubTab];
    const container = document.getElementById('skill-nodes-container');
    const svg = document.getElementById('skill-svg-lines');
    container.innerHTML = '';
    svg.innerHTML = '';

    if (!gameData.unlockedSkills) gameData.unlockedSkills = {};

    branch.nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
            node.children.forEach(childId => {
                const childNode = branch.nodes.find(n => n.id === childId);
                if (childNode) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', node.x + 55);
                    line.setAttribute('y1', node.y + 35);
                    line.setAttribute('x2', childNode.x + 55);
                    line.setAttribute('y2', childNode.y + 35);
                    line.setAttribute('stroke', '#00f0ff');
                    line.setAttribute('stroke-width', '3');
                    line.setAttribute('stroke-dasharray', '4');
                    svg.appendChild(line);
                }
            });
        }
    });

    branch.nodes.forEach(node => {
        const currentLvl = gameData.unlockedSkills[node.id] || 0;
        const isMax = currentLvl >= node.max;
        
        let meetsReq = true;
        if (node.req.node) {
            const reqLvl = gameData.unlockedSkills[node.req.node] || 0;
            if (reqLvl < node.req.count) meetsReq = false;
        }

        const canUpgrade = !isMax && meetsReq && gameData.skillPoints > 0;
        let cardClass = isMax ? "bg-purple-950 border-cyber-neonPurple text-cyber-neonYellow" : (canUpgrade ? "bg-cyber-panel border-2 " + node.color + " text-cyber-neonCyan cursor-pointer shadow-neon-cyan animate-pulse" : "bg-cyber-panel border border-cyber-border text-slate-500");

        let shapeClass = "rounded-2xl";
        if (node.shape === 'circle') shapeClass = "rounded-full";
        else if (node.shape === 'hexagon') shapeClass = "rounded-xl";
        else if (node.shape === 'star') shapeClass = "rounded-3xl ring-2 ring-cyber-neonPink";

        const descHtml = getCalculatedSkillTooltip(node, true);

        const div = document.createElement('div');
        div.className = `absolute tooltip-container p-2 ${shapeClass} border ${cardClass} transition w-32 text-center flex flex-col items-center justify-between shadow-lg`;
        div.style.left = node.x + 'px';
        div.style.top = node.y + 'px';
        div.style.height = '70px';
        div.onclick = () => upgradeSkillBranch(node.id);

        div.innerHTML = `
            <div class="font-bold text-[9px] truncate w-full font-orbitron px-1 text-center">${node.name}</div>
            <div class="text-[9px] font-mono text-cyan-300">${currentLvl}/${node.max}</div>
            
            <div class="tooltip-box absolute left-0 bottom-full mb-2 w-64 bg-cyber-panel border border-cyber-neonCyan rounded-2xl p-3 text-xs text-slate-200 shadow-2xl text-left z-50 pointer-events-none">
                ${descHtml}
                ${!meetsReq ? `<div class="text-red-400 text-[10px] mt-2">⚠️ Requiere ${node.req.count} pts.</div>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
    renderActionBar();
    renderConfigBar();
}

function getAllActiveNodesList() {
    const classDef = classDefinitions[gameData.class] || classDefinitions['PromptEngineer'];
    let activeNodes = [];
    
    const starter = getClassSpecificStarterSkill(gameData.class);
    activeNodes.push(starter);

    classDef.branches.forEach(b => {
        b.nodes.forEach(n => {
            if (n.type === 'active' && (gameData.unlockedSkills[n.id] || 0) > 0) {
                let lvl = gameData.unlockedSkills[n.id];
                let scalingMultiplier = n.scalingMultiplier !== undefined ? n.scalingMultiplier : 1.0;
                let calculatedDmg = n.baseDmg ? (n.baseDmg + (lvl - 1) * (n.scalingDmg * scalingMultiplier)) : null;
                let clonedNode = { ...n };
                if (calculatedDmg) {
                    clonedNode.dotDmg = calculatedDmg;
                }
                activeNodes.push(clonedNode);
            }
        });
    });
    return activeNodes;
}

function renderActionBar() {
    const bar = document.getElementById('skill-action-bar');
    if (!bar) return;
    bar.innerHTML = '';
    let activeNodes = getAllActiveNodesList();

    for (let i = 0; i < 5; i++) {
        const equippedId = gameData.equippedSkills[i];
        const matchedNode = activeNodes.find(n => n.id === equippedId);
        const cdRemaining = matchedNode ? (skillCooldowns[matchedNode.id] || 0) : 0;
        
        let tooltipHtml = '';
        if (matchedNode) {
            tooltipHtml = getCalculatedSkillTooltip(matchedNode, false);
        }

        if (matchedNode) {
            bar.innerHTML += `
                <div class="tooltip-container h-10 sm:h-11 bg-cyber-bg border border-cyber-border rounded-xl flex flex-col items-center justify-center text-xs relative cursor-pointer hover:border-cyber-neonCyan transition p-1" onclick="useEquippedSkill(${i})">
                    <div id="action-cd-overlay-${i}" class="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-cyber-neonPink font-mono font-bold text-xs z-10 ${cdRemaining > 0 ? '' : 'hidden'}">${cdRemaining}s</div>
                    <span class="text-[7px] font-bold font-orbitron text-cyber-neonYellow z-0 pointer-events-none">[${i+1}]</span>
                    <span class="text-cyber-neonCyan font-orbitron font-bold z-0 text-[9px] truncate w-full text-center pointer-events-none">${matchedNode.name.substring(0, 6)}</span>
                    
                    <div class="tooltip-box absolute left-0 bottom-full mb-2 w-64 bg-cyber-panel border border-cyber-neonCyan rounded-2xl p-3 text-xs text-slate-200 shadow-2xl text-left z-50 pointer-events-none">
                        ${tooltipHtml}
                    </div>
                </div>
            `;
        } else {
            bar.innerHTML += `
                <div class="h-10 sm:h-11 bg-black/60 border border-cyber-border/40 rounded-xl flex flex-col items-center justify-center text-xs relative opacity-50">
                    <span class="text-[7px] font-bold font-orbitron text-slate-600">[${i+1}]</span>
                    <div class="w-3.5 h-3.5 bg-cyber-border/30 rounded-sm mt-0.5"></div>
                </div>
            `;
        }
    }
}

function useEquippedSkill(slotIndex) {
    if (gameData.currentTower === 0 || bossFightActive || enemyHp <= 0) return;
    const equippedId = gameData.equippedSkills[slotIndex];
    if (!equippedId) return;

    let activeNodes = getAllActiveNodesList();
    let matchedNode = activeNodes.find(n => n.id === equippedId);

    if (!matchedNode) return;
    if ((skillCooldowns[matchedNode.id] || 0) > 0) return;

    let cdReduction = 1;
    if (gameData.shardShop) {
        const ss11 = gameData.shardShop.find(x => x.id === 'ss11');
        if (ss11) cdReduction -= (ss11.level * 0.1);
    }
    skillCooldowns[matchedNode.id] = Math.max(2, Math.floor((matchedNode.cd || 10) * cdReduction));
    updateCooldownsUI();

    let currentLvl = gameData.unlockedSkills[matchedNode.id] || 1;
    let baseVal = matchedNode.dotDmg || matchedNode.baseDmg || matchedNode.baseVal || 10;
    let scalingVal = matchedNode.scalingDmg || matchedNode.scaling || 5;
    let scalingMultiplier = matchedNode.scalingMultiplier !== undefined ? matchedNode.scalingMultiplier : 1.0;
    let rawVal = Math.round(baseVal + (currentLvl - 1) * (scalingVal * scalingMultiplier));

    let skillDmg = 0;
    if (matchedNode.dotTicks || matchedNode.stat === 'dot') {
        let currentDotVal = gameData.dotDamage || 0;
        skillDmg = Math.floor(rawVal + Math.round(currentDotVal * scalingMultiplier));
        applyOrRefreshDoT(matchedNode, skillDmg);
        showSkillActionEffect(matchedNode.name + " (DoT Acumulado)", matchedNode.colorType || 'violet', skillDmg);
    } else if (matchedNode.stat === 'crit' || matchedNode.stat === 'hype') {
        skillDmg = rawVal;
        showSkillActionEffect(matchedNode.name, matchedNode.colorType || 'cyan', skillDmg);
        damageEnemy(skillDmg);
    } else {
        let currentBaseVal = calculateTotalDamage(1.0);
        skillDmg = Math.floor(rawVal + Math.round(currentBaseVal * scalingMultiplier));
        if (matchedNode.mult) {
            skillDmg = calculateTotalDamage(matchedNode.mult);
        }
        showSkillActionEffect(matchedNode.name, matchedNode.colorType || 'cyan', skillDmg);
        damageEnemy(skillDmg);
    }
}

function renderConfigBar() {
    const bar = document.getElementById('skill-config-bar');
    if (!bar) return;
    bar.innerHTML = '';
    let activeNodes = getAllActiveNodesList();

    for (let i = 0; i < 5; i++) {
        const equippedId = gameData.equippedSkills[i];
        const matchedNode = activeNodes.find(n => n.id === equippedId);
        
        let tooltipHtml = '';
        if (matchedNode) {
            tooltipHtml = getCalculatedSkillTooltip(matchedNode, false);
        }

        if (matchedNode) {
            bar.innerHTML += `
                <div class="tooltip-container h-10 sm:h-11 bg-cyber-bg border border-cyber-border rounded-xl flex flex-col items-center justify-center text-xs relative cursor-pointer hover:border-cyber-neonCyan transition p-1" onclick="openInlineSelector(${i})">
                    <span class="text-[7px] font-bold font-orbitron text-cyber-neonYellow pointer-events-none">[${i+1}]</span>
                    <span class="text-cyber-neonCyan font-orbitron font-bold text-[9px] truncate w-full text-center pointer-events-none">${matchedNode.name.substring(0, 6)}</span>
                    
                    <div class="tooltip-box absolute left-0 bottom-full mb-2 w-64 bg-cyber-panel border border-cyber-neonCyan rounded-2xl p-3 text-xs text-slate-200 shadow-2xl text-left z-50 pointer-events-none">
                        ${tooltipHtml}
                    </div>
                </div>
            `;
        } else {
            bar.innerHTML += `
                <div class="tooltip-container h-10 sm:h-11 bg-black/60 border border-cyber-border/40 rounded-xl flex flex-col items-center justify-center text-xs relative cursor-pointer hover:border-cyber-neonCyan transition p-1" onclick="openInlineSelector(${i})">
                    <span class="text-[7px] font-bold font-orbitron text-slate-500">[${i+1}]</span>
                    <span class="text-[8px] text-slate-400 font-orbitron">Asignar</span>
                </div>
            `;
        }
    }
}

function openInlineSelector(slotIndex) {
    activeSelectingSlot = slotIndex;
    let activeNodes = getAllActiveNodesList();

    const availableNodes = activeNodes.filter(n => !gameData.equippedSkills.includes(n.id) || gameData.equippedSkills[slotIndex] === n.id);
    const selectorBox = document.getElementById('inline-skill-selector');
    const listContainer = document.getElementById('selector-options-list');
    document.getElementById('selector-title').innerText = `Slot ${slotIndex + 1}: Asignar`;
    listContainer.innerHTML = '';

    if (gameData.equippedSkills[slotIndex] !== null) {
        listContainer.innerHTML += `<button onclick="assignSkillToSlot(null)" class="p-2 bg-red-950/85 border border-red-500 rounded-xl text-xs text-red-300 font-bold hover:bg-red-900 transition col-span-2">Vaciar Slot</button>`;
    }

    if (availableNodes.length === 0 && gameData.equippedSkills[slotIndex] === null) {
        listContainer.innerHTML += `<div class="col-span-2 text-center text-xs text-slate-400 py-3">No hay skills desbloqueadas.</div>`;
    } else {
        availableNodes.forEach(node => {
            const tempStr = node.descTemplate || node.desc || '';
            const baseVal = node.baseVal || node.baseDmg || 10;
            const formattedDesc = tempStr.replace(/\s*\([^)]*Tier[^)]*\)/gi, '').replace(/\s*\([^)]*CD:[^)]*\)/gi, '').replace(/\+?\{min\}\s*-\s*\+?\{max\}/g, baseVal).replace(/\{min\}/g, baseVal).replace(/\{max\}/g, baseVal);
            listContainer.innerHTML += `
                <button onclick="assignSkillToSlot('${node.id}')" class="p-2 bg-cyber-panel border border-cyber-border hover:border-cyber-neonCyan rounded-xl text-left transition">
                    <div class="font-bold text-cyber-neonCyan text-xs font-orbitron truncate">${node.name}</div>
                    <div class="text-[10px] text-slate-300 mt-1">${colorizeDescription(formattedDesc)}</div>
                </button>
            `;
        });
    }
    selectorBox.classList.remove('hidden');
}

function closeInlineSelector() {
    document.getElementById('inline-skill-selector').classList.add('hidden');
    activeSelectingSlot = -1;
}

function assignSkillToSlot(skillId) {
    if (activeSelectingSlot < 0) return;
    gameData.equippedSkills[activeSelectingSlot] = skillId;
    closeInlineSelector();
    renderConfigBar();
    renderActionBar();
    saveGameToCloud();
}

const viewport = document.getElementById('skill-tree-viewport');
if (viewport) {
    viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.tooltip-container')) return;
        isPanning = true;
        startX = e.clientX - treeTranslateX;
        startY = e.clientY - treeTranslateY;
    });
}

window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    treeTranslateX = e.clientX - startX;
    treeTranslateY = e.clientY - startY;
    updateTreeTransform();
});

window.addEventListener('mouseup', () => { isPanning = false; });

function zoomSkillTree(delta) {
    treeScale = Math.max(0.4, Math.min(1.6, treeScale + delta));
    updateTreeTransform();
}

function updateTreeTransform() {
    const canvas = document.getElementById('skill-tree-canvas');
    if (canvas) canvas.style.transform = `translate(${treeTranslateX}px, ${treeTranslateY}px) scale(${treeScale})`;
}

function upgradeSkillBranch(skillId) {
    const classDef = classDefinitions[gameData.class];
    let targetNode = null;
    classDef.branches.forEach(b => {
        b.nodes.forEach(n => { if (n.id === skillId) targetNode = n; });
    });

    if (!targetNode) return;
    if (!gameData.unlockedSkills) gameData.unlockedSkills = {};
    const currentLvl = gameData.unlockedSkills[skillId] || 0;
    if (currentLvl >= targetNode.max) return;

    if (targetNode.req.node) {
        const reqLvl = gameData.unlockedSkills[targetNode.req.node] || 0;
        if (reqLvl < targetNode.req.count) return;
    }

    if (gameData.skillPoints <= 0) return;

    gameData.skillPoints--;
    gameData.unlockedSkills[skillId] = currentLvl + 1;

    let flatIncrement = (targetNode.type === 'passive') 
        ? (targetNode.scaling || targetNode.baseVal || 5) 
        : Math.round((targetNode.baseVal || targetNode.scaling || 10) * (targetNode.scalingMultiplier !== undefined ? targetNode.scalingMultiplier : 1.0));

    if (targetNode.stat === 'dot') {
        gameData.dotDamage = (gameData.dotDamage || 0) + flatIncrement;
    } else if (targetNode.stat === 'crit') {
        gameData.critChance = Math.min(75, (gameData.critChance || 2) + flatIncrement);
    } else {
        gameData.damage = (gameData.damage || 0) + flatIncrement;
    }

    updateUI();
    renderNaveStats();
    renderSkillBranchTree();
    saveGameToCloud();
}

function confirmResetSkillTree() {
    gameData.skillResetsCount = (gameData.skillResetsCount || 0) + 1;
    const resetCost = 50 * gameData.skillResetsCount;
    if (gameData.gold < resetCost) return;

    gameData.gold -= resetCost;
    let totalRefund = 0;
    Object.keys(gameData.unlockedSkills).forEach(k => {
        if (!k.includes('class_skill')) {
            totalRefund += gameData.unlockedSkills[k];
            delete gameData.unlockedSkills[k];
        }
    });
    gameData.skillPoints += totalRefund;

    document.getElementById('reset-cost-display').innerText = 50 * (gameData.skillResetsCount + 1);
    updateUI();
    renderNaveStats();
    renderSkillBranchTree();
    saveGameToCloud();
}

function switchUpgradeTab(cat) {
    activeUpgradeSubTab = cat;
    ['hardware', 'software'].forEach(c => {
        const btn = document.getElementById('up-subtab-' + c);
        if (btn) btn.className = (c === cat) ? "px-3 py-1 bg-cyber-neonCyan text-black rounded-xl text-xs font-bold font-orbitron" : "px-3 py-1 bg-cyber-bg text-slate-400 rounded-xl text-xs font-bold font-orbitron";
    });
    renderUpgrades();
}

function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    container.innerHTML = '';
    let discountMulti = 1;
    if (gameData.shardShop) {
        const ss7 = gameData.shardShop.find(x => x.id === 'ss7');
        if (ss7) discountMulti -= (ss7.level * 0.12);
    }

    const filteredUpgrades = gameData.upgrades.filter(u => u.cat === activeUpgradeSubTab);

    filteredUpgrades.forEach((up) => {
        const originalIndex = gameData.upgrades.findIndex(item => item.id === up.id);
        const currentCost = Math.max(1, Math.floor(up.cost * Math.pow(up.mult, up.level) * discountMulti));
        const canAfford = gameData.gold >= currentCost;
        const maxLevelText = up.maxLevel ? `/ ${up.maxLevel}` : '/ ∞';
        const isMaxed = up.maxLevel && up.level >= up.maxLevel;
        const isUnlockedForSector = gameData.maxUnlockedTower >= up.sector;

        let nameClass = (!canAfford && !isMaxed) ? 'text-slate-500' : 'text-cyber-neonCyan';

        container.innerHTML += `
            <div class="bg-cyber-panel border ${isUnlockedForSector ? 'border-cyber-border' : 'border-red-900/50 opacity-60'} rounded-2xl p-3.5 flex justify-between items-center text-xs">
                <div>
                    <div class="font-bold ${nameClass} font-orbitron text-xs">${up.name} (Nv. ${up.level} ${maxLevelText})</div>
                    <div class="text-xs text-slate-400 mt-0.5">${colorizeDescription(up.desc)}</div>
                    ${!isUnlockedForSector ? `<div class="text-[10px] text-red-400 mt-0.5">🔒 Requiere Sector ${up.sector}</div>` : ''}
                </div>
                <button onclick="buyUpgrade(${originalIndex})" ${isMaxed || !isUnlockedForSector ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl font-bold text-xs font-orbitron transition ${isMaxed || !isUnlockedForSector ? 'bg-cyber-bg text-slate-500' : (canAfford ? 'bg-cyber-neonCyan text-black shadow-neon-cyan' : 'bg-cyber-bg/50 text-slate-600 border border-cyber-border cursor-not-allowed opacity-50')}">
                    ${isMaxed ? 'Máximo' : currentCost + ' Hype'}
                </button>
            </div>
        `;
    });
}

function buyUpgrade(idx) {
    const up = gameData.upgrades[idx];
    if (gameData.maxUnlockedTower < up.sector) return;
    let discountMulti = 1;
    if (gameData.shardShop) {
        const ss7 = gameData.shardShop.find(x => x.id === 'ss7');
        if (ss7) discountMulti -= (ss7.level * 0.12);
    }
    const currentCost = Math.max(1, Math.floor(up.cost * Math.pow(up.mult, up.level) * discountMulti));
    if (up.maxLevel && up.level >= up.maxLevel) return;
    if (gameData.gold < currentCost) return;

    gameData.gold -= currentCost;
    up.level++;
    
    if (up.id === 'dmg1') gameData.damage += 2;
    else if (up.id === 'critdmg') gameData.critDmgMult += 0.05;
    else if (up.id === 'critprob') {
        gameData.critChance = Math.min(75, (gameData.critChance || 2) + 0.025);
    }
    else if (up.id === 'dotamp') gameData.dotDamage += 5;

    updateUI();
    renderNaveStats();
    renderUpgrades();
    saveGameToCloud();
}

function renderShardShop() {
    const container = document.getElementById('shard-shop-list');
    if (!container) return;
    container.innerHTML = '';
    gameData.shardShop.forEach((ss, idx) => {
        const currentCost = Math.floor(ss.cost * Math.pow(ss.mult, ss.level));
        const canAfford = (gameData.crystals || 0) >= currentCost;
        const isMax = ss.level >= ss.max;

        const nameClass = (!canAfford && !isMax) ? 'text-slate-500' : 'text-cyber-neonCyan';

        container.innerHTML += `
            <div class="bg-cyber-bg border border-cyber-border rounded-2xl p-3 flex justify-between items-center text-xs">
                <div>
                    <div class="font-bold ${nameClass} font-orbitron text-xs">${ss.name} (Nv. ${ss.level}/${ss.max})</div>
                    <div class="text-xs text-slate-400 mt-0.5">${colorizeDescription(ss.desc)}</div>
                </div>
                <button onclick="buyShardItem(${idx})" ${isMax || !canAfford ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl font-bold text-xs font-orbitron transition ${isMax ? 'bg-cyber-bg text-slate-500' : (canAfford ? 'bg-cyber-neonCyan text-black shadow-neon-cyan' : 'bg-cyber-bg/50 text-slate-600 border border-cyber-border cursor-not-allowed opacity-50')}">
                    ${isMax ? 'Máximo' : currentCost + ' <i class="fa-solid fa-microchip"></i>'}
                </button>
            </div>
        `;
    });
}

function buyShardItem(idx) {
    const ss = gameData.shardShop[idx];
    const currentCost = Math.floor(ss.cost * Math.pow(ss.mult, ss.level));
    if ((gameData.crystals || 0) < currentCost || ss.level >= ss.max) return;
    
    gameData.crystals -= currentCost;
    ss.level++;
    updateUI();
    renderNaveStats();
    renderShardShop();
    saveGameToCloud();
}

function renderRebirthScreen() {
    document.getElementById('rebirth-count-display').innerText = gameData.rebirths || 0;
    let shardBonus = 0;
    if (gameData.shardShop) {
        const ss12 = gameData.shardShop.find(x => x.id === 'ss12');
        if (ss12) shardBonus += ss12.level;
    }
    const gainPreview = Math.max(1, Math.floor(gameData.maxUnlockedTower / 2)) + shardBonus;
    document.getElementById('rebirth-gain-preview').innerText = `+${gainPreview}`;
}

function triggerRebirth() {
    if (gameData.level < 100) {
        showCyberModal("REQUISITO NO CUMPLIDO", "Necesitas alcanzar el Nivel 100.", "⚠️");
        return;
    }
    let shardBonus = 0;
    if (gameData.shardShop) {
        const ss12 = gameData.shardShop.find(x => x.id === 'ss12');
        if (ss12) shardBonus += ss12.level;
    }
    const gain = Math.max(1, Math.floor(gameData.maxUnlockedTower / 2)) + shardBonus;
    
    gameData.rebirths = (gameData.rebirths || 0) + 1;
    gameData.crystals = (gameData.crystals || 0) + gain;
    gameData.level = 1; gameData.exp = 0; gameData.maxExp = 100; gameData.gold = 0;
    gameData.currentTower = 0; gameData.currentStage = 1;
    gameData.lastActiveTower = 1; gameData.lastActiveStage = 1;
    gameData.damage = 1 + (gameData.rebirths * 3); gameData.dps = 0; gameData.skillPoints = 0; gameData.dotDamage = 0;
    
    let starterKey = 'class_skill_pe';
    if (gameData.class === 'AISwarmMaster') starterKey = 'class_skill_as';
    else if (gameData.class === 'QuantumArchitect') starterKey = 'class_skill_qa';
    else if (gameData.class === 'CyberSamurai') starterKey = 'class_skill_cs';
    else if (gameData.class === 'NeuralHacker') starterKey = 'class_skill_nh';
    else if (gameData.class === 'VoidWeaver') starterKey = 'class_skill_vw';

    gameData.unlockedSkills = { [starterKey]: 1 };
    gameData.equippedSkills = [starterKey, null, null, null, null];
    gameData.upgrades = JSON.parse(JSON.stringify(defaultUpgrades));

    checkAchievementProgress('ach3', 1);
    checkAchievementProgress('ach9', gameData.crystals);
    updateUI();
    renderNaveStats();
    switchTab('Batalla');
    spawnEnemy();
    saveGameToCloud();
}

function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    container.innerHTML = '';
    gameData.achievements.forEach((ach, idx) => {
        const canClaim = !ach.claimed && ach.progress >= ach.target;
        container.innerHTML += `
            <div class="bg-cyber-panel border border-cyber-border rounded-2xl p-3 flex items-center justify-between">
                <div>
                    <div class="font-bold text-xs text-cyber-neonYellow font-orbitron">${ach.name} (+${ach.rewardCrystals} <i class="fa-solid fa-microchip"></i>)</div>
                    <div class="text-xs text-slate-400 mt-0.5">${ach.desc} (${Math.min(ach.progress, ach.target)}/${ach.target})</div>
                </div>
                <button onclick="claimAchievement(${idx})" ${ach.claimed || !canClaim ? 'disabled' : ''} class="px-3 py-1 rounded-xl font-bold text-xs font-orbitron transition ${ach.claimed ? 'bg-cyber-bg text-slate-500' : (canClaim ? 'bg-cyber-neonCyan text-black shadow-neon-cyan animate-pulse' : 'bg-cyber-bg text-slate-500')}">
                    ${ach.claimed ? 'Listos' : 'Reclamar'}
                </button>
            </div>
        `;
    });
}

function checkAchievementProgress(achId, value) {
    if (!gameData || !gameData.achievements) return;
    const ach = gameData.achievements.find(a => a.id === achId);
    if (ach && !ach.claimed) {
        ach.progress = Math.max(ach.progress, value);
    }
}

function claimAchievement(idx) {
    const ach = gameData.achievements[idx];
    if (ach.claimed || ach.progress < ach.target) return;
    ach.claimed = true;
    gameData.crystals = (gameData.crystals || 0) + ach.rewardCrystals;
    checkAchievementProgress('ach9', gameData.crystals);
    updateUI();
    renderNaveStats();
    renderAchievements();
    saveGameToCloud();
}

function loadGlobalRanking() {
    const listEl = document.getElementById('global-ranking-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="text-center text-slate-500 py-3 font-orbitron text-xs">Cargando ranking...</div>';
    rdb.ref('users/').once('value', snapshot => {
        const users = snapshot.val();
        if (!users) { listEl.innerHTML = '<div class="text-center text-slate-500 py-3 font-orbitron text-xs">Sin registros.</div>'; return; }
        let rankings = [];
        Object.keys(users).forEach(username => {
            const uData = users[username];
            if (uData.heroes && Array.isArray(uData.heroes)) {
                uData.heroes.forEach(h => {
                    const classDef = classDefinitions[h.class] || classDefinitions['PromptEngineer'];
                    const towerNum = h.maxUnlockedTower || 1;
                    const sectorTitle = getSectorName(towerNum);
                    rankings.push({
                        heroName: h.name, heroClass: classDef.name, sectorTitle: sectorTitle,
                        rebirths: h.rebirths || 0, maxTower: towerNum, maxStage: h.maxUnlockedStage || 1, level: h.level || 1
                    });
                });
            }
        });
        rankings.sort((a, b) => {
            if (b.maxTower !== a.maxTower) return b.maxTower - a.maxTower;
            if (b.maxStage !== a.maxStage) return b.maxStage - a.maxStage;
            if (b.rebirths !== a.rebirths) return b.rebirths - a.rebirths;
            return b.level - a.level;
        });
        listEl.innerHTML = '';
        rankings.slice(0, 10).forEach((r, idx) => {
            listEl.innerHTML += `
                <div class="flex items-center justify-between p-2.5 bg-cyber-bg rounded-xl border border-cyber-border">
                    <div class="flex items-center space-x-2.5">
                        <span class="font-bold text-cyber-neonYellow font-orbitron text-sm">#${idx + 1}</span>
                        <div>
                            <div class="font-semibold text-slate-200 font-orbitron text-xs">${r.heroName}</div>
                            <div class="text-[10px] text-slate-400 font-orbitron">${r.heroClass} • Nv.${r.level} • ⚛️${r.rebirths}</div>
                            </div>
                    </div>
                    <div class="text-right font-orbitron">
                        <div class="text-cyber-neonCyan font-bold text-xs">${r.sectorTitle}</div>
                        <div class="text-[10px] text-slate-400">Nodo: ${r.maxStage}/10</div>
                    </div>
                </div>
            `;
        });
    });
}

function saveGameToCloud() {
    if (!currentUser || activeHeroIndex < 0 || !gameData) return;
    heroesList[activeHeroIndex] = gameData;
    rdb.ref('users/' + currentUser + '/heroes').set(heroesList);
}