// classes-config.js

const classDescriptions = {
    PromptEngineer: "Arquitecto especialista en <span style='color: #ff007f; font-weight: bold;'>daño crítico masivo</span> y ráfagas de comandos.<br><br><b>Habilidad Inicial:</b> <span style='color: #00f0ff;'>Inyección Rápida</span>.",
    AISwarmMaster: "Comandante cibernético enfocado en <span style='color: #ff007f;'>daño sostenido (DOT)</span> y enjambres autónomos.<br><br><b>Habilidad Inicial:</b> <span style='color: #00f0ff;'>Nanodron de Refuerzo</span>.",
    QuantumArchitect: "Maestro cuántico con <span style='color: #ff007f;'>reducción de latencia</span> y pulsos estabilizadores.<br><br><b>Habilidad Inicial:</b> <span style='color: #00f0ff;'>Pulso Estabilizador</span>.",
    CyberSamurai: "Especialista en filos de plasma con altísimo <span style='color: #ff007f;'>daño físico crítico y sangrado</span>.<br><br><b>Habilidad Inicial:</b> <span style='color: #00f0ff;'>Corte de Plasma</span>.",
    NeuralHacker: "Infiltrador de redes que corrompe nodos con <span style='color: #ff007f;'>infecciones letales</span>.<br><br><b>Habilidad Inicial:</b> <span style='color: #00f0ff;'>Infección Cero</span>.",
    VoidWeaver: "Manipulador del vacío estelar con devastadoras <span style='color: #ff007f;'>anomalías espaciales</span>.<br><br><b>Habilidade Inicial:</b> <span style='color: #00f0ff;'>Singularidad Oscura</span>."
};

const classDefinitions = {
    PromptEngineer: {
        icon: '⚡',
        name: 'Prompt Engineer',
        desc: classDescriptions.PromptEngineer,
        branches: [
            {
                name: 'Matriz Principal',
                nodes: [
                    { id: 'pe_in', name: 'Precisión Cuántica', max: 5, cost: 1, tier: 1, scalingMultiplier: 1.0, req: { points: 0 }, baseVal: 5, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 1).', x: 50, y: 300, children: ['pe_act1'], type: 'passive', shape: 'circle', color: 'border-cyber-neonCyan' },
                    { id: 'pe_act1', name: 'Inyección Rápida', max: 5, cost: 1, tier: 1, scalingMultiplier: 0.6, req: { node: 'pe_in', count: 3 }, baseVal: 150, scaling: 30, stat: 'damage', descTemplate: 'Multiplicador de <span style="color:#ffffff; font-weight:bold;">clic</span> eficiente al {min}%-{max}% (Tier 1, CD: 8s).', x: 250, y: 300, children: ['pe_pas2a', 'pe_pas2b'], type: 'active', cd: 8, baseDmg: 20, scalingDmg: 8, colorType: 'cyan', shape: 'hexagon', color: 'border-cyber-neonPink' },
                    { id: 'pe_pas2a', name: 'Sobrecarga de Cursor', max: 3, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'pe_act1', count: 2 }, baseVal: 10, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 180, children: ['pe_act3'], type: 'passive', shape: 'square', color: 'border-cyber-neonYellow' },
                    { id: 'pe_pas2b', name: 'Optimización de Precisión', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'pe_act1', count: 2 }, baseVal: 15, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 420, children: ['pe_act3'], type: 'passive', shape: 'hexagon', color: 'border-cyber-neonYellow' },
                    { id: 'pe_act3', name: 'Compilador Masivo', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.25, req: { node: 'pe_pas2a', count: 2 }, baseVal: 400, scaling: 60, stat: 'damage', descTemplate: 'Daño escalado al {min}%-{max}% instantáneo (Tier 2, CD: 12s).', x: 700, y: 300, children: ['pe_def'], type: 'active', cd: 12, baseDmg: 60, scalingDmg: 20, colorType: 'yellow', shape: 'hexagon', color: 'border-cyber-neonCyan' },
                    { id: 'pe_def', name: 'Prompt Cero', max: 3, cost: 1, tier: 3, scalingMultiplier: 2.0, req: { node: 'pe_act3', count: 3 }, baseVal: 900, scaling: 150, stat: 'damage', descTemplate: 'Ejecución y daño masivo al {min}%-{max}% (Tier 3 Definitiva, CD: 45s).', x: 950, y: 300, children: [], type: 'active', cd: 45, baseDmg: 120, scalingDmg: 40, colorType: 'pink', shape: 'star', color: 'border-cyber-neonPink' }
                ]
            }
        ]
    },
    AISwarmMaster: {
        icon: '🤖',
        name: 'AISwarm Master',
        desc: classDescriptions.AISwarmMaster,
        branches: [
            {
                name: 'Matriz Principal',
                nodes: [
                    { id: 'as_in', name: 'Protocolo Enjambre', max: 5, cost: 1, tier: 1, scalingMultiplier: 1.0, req: { points: 0 }, baseVal: 5, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 1).', x: 50, y: 300, children: ['as_act1'], type: 'passive', shape: 'circle', color: 'border-cyber-neonCyan' },
                    { id: 'as_act1', name: 'Nanodron de Refuerzo', max: 5, cost: 1, tier: 1, scalingMultiplier: 0.6, req: { node: 'as_in', count: 3 }, baseVal: 20, scaling: 10, stat: 'dot', descTemplate: 'Despliega drones <span style="color:#9d00ff; font-weight:bold;">DoT</span> al {min}%-{max}% inicial (Tier 1, CD: 15s).', x: 250, y: 300, children: ['as_pas2a', 'as_pas2b'], type: 'active', cd: 15, dotTicks: 3, dotInterval: 2, baseDmg: 25, scalingDmg: 10, colorType: 'violet', effect: 'dot_buff', shape: 'hexagon', color: 'border-cyber-neonPink' },
                    { id: 'as_pas2a', name: 'Red Colmena', max: 4, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'as_act1', count: 2 }, baseVal: 10, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 180, children: ['as_act3'], type: 'passive', shape: 'square', color: 'border-cyber-neonYellow' },
                    { id: 'as_pas2b', name: 'Sintonizador Nanobot', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'as_act1', count: 2 }, baseVal: 15, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 420, children: ['as_act3'], type: 'passive', shape: 'hexagon', color: 'border-cyber-neonYellow' },
                    { id: 'as_act3', name: 'Sobrecarga de Red', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'as_pas2a', count: 2 }, baseVal: 30, scaling: 8, stat: 'dot', descTemplate: 'Factor de escalado del {min}%-{max}% en ticks activos (Tier 2, CD: 14s).', x: 700, y: 300, children: ['as_def'], type: 'active', cd: 14, dotTicks: 3, dotInterval: 2, baseDmg: 45, scalingDmg: 15, colorType: 'cyan', effect: 'dot_buff', shape: 'hexagon', color: 'border-cyber-neonCyan' },
                    { id: 'as_def', name: 'Supercolmena Omega', max: 3, cost: 1, tier: 3, scalingMultiplier: 2.1, req: { node: 'as_act3', count: 3 }, baseVal: 1500, scaling: 500, stat: 'dot', descTemplate: 'Haz láser continuo al {min}%-{max}% de DoT acumulado (Tier 3 Definitiva, CD: 50s).', x: 950, y: 300, children: [], type: 'active', cd: 50, dotTicks: 4, dotInterval: 2, baseDmg: 150, scalingDmg: 50, colorType: 'violet', effect: 'dot_buff', shape: 'star', color: 'border-cyber-neonPink' }
                ]
            }
        ]
    },
    QuantumArchitect: {
        icon: '⚛️',
        name: 'Quantum Architect',
        desc: classDescriptions.QuantumArchitect,
        branches: [
            {
                name: 'Matriz Principal',
                nodes: [
                    { id: 'qa_in', name: 'Estabilizador de Flujo', max: 5, cost: 1, tier: 1, scalingMultiplier: 1.0, req: { points: 0 }, baseVal: 5, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 1).', x: 50, y: 300, children: ['qa_act1'], type: 'passive', shape: 'circle', color: 'border-cyber-neonCyan' },
                    { id: 'qa_act1', name: 'Pulso Estabilizador', max: 5, cost: 1, tier: 1, scalingMultiplier: 0.6, req: { node: 'qa_in', count: 3 }, baseVal: 3, scaling: 1, stat: 'damage', descTemplate: 'Congela el temporizador del nodo de {min}s a {max}s (Tier 1, CD: 25s).', x: 250, y: 300, children: ['qa_pas2a', 'qa_pas2b'], type: 'active', cd: 25, baseDmg: 20, scalingDmg: 8, colorType: 'cyan', shape: 'hexagon', color: 'border-cyber-neonPink' },
                    { id: 'qa_pas2a', name: 'Compresión Cuántica', max: 3, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'qa_act1', count: 2 }, baseVal: 10, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 180, children: ['qa_act3'], type: 'passive', shape: 'square', color: 'border-cyber-neonYellow' },
                    { id: 'qa_pas2b', name: 'Resonancia Temporal', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'qa_act1', count: 2 }, baseVal: 15, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 420, children: ['qa_act3'], type: 'passive', shape: 'hexagon', color: 'border-cyber-neonYellow' },
                    { id: 'qa_act3', name: 'Acelerador Cuántico', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'qa_pas2a', count: 2 }, baseVal: 20, scaling: 5, stat: 'damage', descTemplate: 'Reduce de {min}% a {max}% el <span style="color:#00f0ff; font-weight:bold;">CD</span> actual (Tier 2, CD: 20s).', x: 700, y: 300, children: ['qa_def'], type: 'active', cd: 20, baseDmg: 50, scalingDmg: 18, colorType: 'yellow', shape: 'hexagon', color: 'border-cyber-neonCyan' },
                    { id: 'qa_def', name: 'Colapso del Horizonte', max: 3, cost: 1, tier: 3, scalingMultiplier: 1.9, req: { node: 'qa_act3', count: 3 }, baseVal: 250, scaling: 50, stat: 'damage', descTemplate: 'Multiplica el <span style="color:#ffffff; font-weight:bold;">daño</span> al {min}%-{max}% según reducción de <span style="color:#00f0ff; font-weight:bold;">CD</span> (Tier 3, CD: 60s).', x: 950, y: 300, children: [], type: 'active', cd: 60, baseDmg: 130, scalingDmg: 45, colorType: 'pink', shape: 'star', color: 'border-cyber-neonPink' }
                ]
            }
        ]
    },
    CyberSamurai: {
        icon: '🗡️',
        name: 'Cyber Samurai',
        desc: classDescriptions.CyberSamurai,
        branches: [
            {
                name: 'Matriz Principal',
                nodes: [
                    { id: 'cs_in', name: 'Filo de Plasma', max: 5, cost: 1, tier: 1, scalingMultiplier: 1.0, req: { points: 0 }, baseVal: 5, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 1).', x: 50, y: 300, children: ['cs_act1'], type: 'passive', shape: 'circle', color: 'border-cyber-neonCyan' },
                    { id: 'cs_act1', name: 'Corte de Plasma', max: 5, cost: 1, tier: 1, scalingMultiplier: 0.65, req: { node: 'cs_in', count: 3 }, baseVal: 400, scaling: 60, stat: 'damage', descTemplate: 'Tajo con coeficiente del {min}%-{max}% (Tier 1, CD: 9s).', x: 250, y: 300, children: ['cs_pas2a', 'cs_pas2b'], type: 'active', cd: 9, baseDmg: 45, scalingDmg: 15, colorType: 'pink', shape: 'hexagon', color: 'border-cyber-neonPink' },
                    { id: 'cs_pas2a', name: 'Danza del Acero', max: 4, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'cs_act1', count: 2 }, baseVal: 10, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 180, children: ['cs_act3'], type: 'passive', shape: 'square', color: 'border-cyber-neonYellow' },
                    { id: 'cs_pas2b', name: 'Reflejos de Acero', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'cs_act1', count: 2 }, baseVal: 15, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 420, children: ['cs_act3'], type: 'passive', shape: 'hexagon', color: 'border-cyber-neonYellow' },
                    { id: 'cs_act3', name: 'Estocada de Nanofibra', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'cs_pas2a', count: 2 }, baseVal: 20, scaling: 5, stat: 'damage', descTemplate: 'Aplica +{min}%-+{max}% de Amplificación de <span style="color:#ffffff; font-weight:bold;">daño</span> puro (Tier 2, CD: 12s).', x: 700, y: 300, children: ['cs_def'], type: 'active', cd: 12, baseDmg: 70, scalingDmg: 22, colorType: 'cyan', shape: 'hexagon', color: 'border-cyber-neonCyan' },
                    { id: 'cs_def', name: 'Ejecución del Shogun', max: 3, cost: 1, tier: 3, scalingMultiplier: 2.25, req: { node: 'cs_act3', count: 3 }, baseVal: 1500, scaling: 500, stat: 'damage', descTemplate: 'Combo rápido al {min}%-{max}% de daño directo instantáneo (Tier 3 Definitiva, CD: 45s).', x: 950, y: 300, children: [], type: 'active', cd: 45, baseDmg: 180, scalingDmg: 60, colorType: 'pink', shape: 'star', color: 'border-cyber-neonPink' }
                ]
            }
        ]
    },
    NeuralHacker: {
        icon: '💻',
        name: 'Neural Hacker',
        desc: classDescriptions.NeuralHacker,
        branches: [
            {
                name: 'Matriz Principal',
                nodes: [
                    { id: 'nh_in', name: 'Backdoor Activo', max: 5, cost: 1, tier: 1, scalingMultiplier: 1.0, req: { points: 0 }, baseVal: 5, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 1).', x: 50, y: 300, children: ['nh_act1'], type: 'passive', shape: 'circle', color: 'border-cyber-neonCyan' },
                    { id: 'nh_act1', name: 'Infección Cero', max: 5, cost: 1, tier: 1, scalingMultiplier: 0.6, req: { node: 'nh_in', count: 3 }, baseVal: 30, scaling: 10, stat: 'dot', descTemplate: '<span style="color:#9d00ff; font-weight:bold;">DoT</span> inicial al {min}%-{max}% que otorga ganancia de <span style="color:#f3e600; font-weight:bold;">Hype</span> (Tier 1, CD: 10s).', x: 250, y: 300, children: ['nh_pas2a', 'nh_pas2b'], type: 'active', cd: 10, dotTicks: 3, dotInterval: 2, baseDmg: 30, scalingDmg: 10, colorType: 'yellow', effect: 'dot_buff', shape: 'hexagon', color: 'border-cyber-neonPink' },
                    { id: 'nh_pas2a', name: 'Gusano de Red', max: 4, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'nh_act1', count: 2 }, baseVal: 10, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 180, children: ['nh_act3'], type: 'passive', shape: 'square', color: 'border-cyber-neonYellow' },
                    { id: 'nh_pas2b', name: 'Troyano Lógico', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'nh_act1', count: 2 }, baseVal: 15, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 420, children: ['nh_act3'], type: 'passive', shape: 'hexagon', color: 'border-cyber-neonYellow' },
                    { id: 'nh_act3', name: 'Rootkit de Sistema', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'nh_pas2a', count: 2 }, baseVal: 10, scaling: 5, stat: 'damage', descTemplate: 'Convierte {min}%-{max}% del <span style="color:#ffffff; font-weight:bold;">daño</span> directo en <span style="color:#f3e600; font-weight:bold;">Hype</span> (Tier 2, CD: 14s).', x: 700, y: 300, children: ['nh_def'], type: 'active', cd: 14, baseDmg: 55, scalingDmg: 18, colorType: 'cyan', shape: 'hexagon', color: 'border-cyber-neonCyan' },
                    { id: 'nh_def', name: 'Apocalipsis Matrix', max: 3, cost: 1, tier: 3, scalingMultiplier: 2.0, req: { node: 'nh_act3', count: 3 }, baseVal: 1200, scaling: 400, stat: 'damage', descTemplate: 'Daño puro al {min}%-{max}% y ganancia masiva de <span style="color:#f3e600; font-weight:bold;">Hype</span> global (Tier 3 Definitiva, CD: 50s).', x: 950, y: 300, children: [], type: 'active', cd: 50, baseDmg: 140, scalingDmg: 50, colorType: 'pink', shape: 'star', color: 'border-cyber-neonPink' }
                ]
            }
        ]
    },
    VoidWeaver: {
        icon: '🌌',
        name: 'Void Weaver',
        desc: classDescriptions.VoidWeaver,
        branches: [
            {
                name: 'Matriz Principal',
                nodes: [
                    { id: 'vw_in', name: 'Atracción de Singularidad', max: 5, cost: 1, tier: 1, scalingMultiplier: 1.0, req: { points: 0 }, baseVal: 5, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 1).', x: 50, y: 300, children: ['vw_act1'], type: 'passive', shape: 'circle', color: 'border-cyber-neonPurple' },
                    { id: 'vw_act1', name: 'Singularidad Oscura', max: 5, cost: 1, tier: 1, scalingMultiplier: 0.6, req: { node: 'vw_in', count: 3 }, baseVal: 50, scaling: 25, stat: 'damage', descTemplate: 'Convierte {min}%-{max}% del <span style="color:#ffffff; font-weight:bold;">daño</span> acumulado en explosión directa (Tier 1, CD: 11s).', x: 250, y: 300, children: ['vw_pas2a', 'vw_pas2b'], type: 'active', cd: 11, baseDmg: 40, scalingDmg: 15, colorType: 'violet', shape: 'hexagon', color: 'border-cyber-neonCyan' },
                    { id: 'vw_pas2a', name: 'Horizonte de Sucesos', max: 4, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'vw_act1', count: 2 }, baseVal: 10, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 180, children: ['vw_act3'], type: 'passive', shape: 'square', color: 'border-cyber-neonYellow' },
                    { id: 'vw_pas2b', name: 'Entropía Estelar', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'vw_act1', count: 2 }, baseVal: 15, scaling: 5, stat: 'damage', descTemplate: '+{min} - +{max} <span style="color:#ffffff; font-weight:bold;">Daño por Click</span> (Tier 2).', x: 450, y: 420, children: ['vw_act3'], type: 'passive', shape: 'hexagon', color: 'border-cyber-neonYellow' },
                    { id: 'vw_act3', name: 'Distorsión del Vacío', max: 5, cost: 1, tier: 2, scalingMultiplier: 1.0, req: { node: 'vw_pas2a', count: 2 }, baseVal: 15, scaling: 5, stat: 'damage', descTemplate: 'Incrementa el <span style="color:#ffffff; font-weight:bold;">daño</span> de clics en un {min}%-{max}% según vida restante (Tier 2, CD: 13s).', x: 700, y: 300, children: ['vw_def'], type: 'active', cd: 13, baseDmg: 60, scalingDmg: 20, colorType: 'cyan', shape: 'hexagon', color: 'border-cyber-neonCyan' },
                    { id: 'vw_def', name: 'Desgarro Dimensional', max: 3, cost: 1, tier: 3, scalingMultiplier: 2.2, req: { node: 'vw_act3', count: 3 }, baseVal: 1, scaling: 1, stat: 'damage', descTemplate: 'Colapsa instantáneamente el nodo con eficiencia del {min}-{max} (Tier 3 Definitiva, CD: 60s).', x: 950, y: 300, children: [], type: 'active', cd: 60, baseDmg: 100, scalingDmg: 30, colorType: 'pink', shape: 'star', color: 'border-cyber-neonPink' }
                ]
            }
        ]
    }
};

function getClassSpecificStarterSkill(className) {
    if (className === 'AISwarmMaster') {
        return { id: 'class_skill_as', name: 'Nanodron de Refuerzo', cd: 15, tier: 1, scalingMultiplier: 0.6, dotTicks: 3, dotInterval: 2, baseVal: 20, scaling: 10, baseDmg: 25, scalingDmg: 10, stat: 'dot', colorType: 'violet', effect: 'dot_buff', type: 'active', descTemplate: 'Despliega drones <span style="color:#9d00ff; font-weight:bold;">DoT</span> al {min}%-{max}% inicial (Tier 1, CD: 15s).' };
    } else if (className === 'QuantumArchitect') {
        return { id: 'class_skill_qa', name: 'Pulso Estabilizador', cd: 25, tier: 1, scalingMultiplier: 0.6, dotTicks: 3, dotInterval: 2, baseVal: 3, scaling: 1, baseDmg: 20, scalingDmg: 8, stat: 'damage', colorType: 'cyan', effect: 'dot_buff', type: 'active', descTemplate: 'Congela el temporizador del nodo de {min}s a {max}s (Tier 1, CD: 25s).' };
    } else if (className === 'CyberSamurai') {
        return { id: 'class_skill_cs', name: 'Corte de Plasma', cd: 9, tier: 1, scalingMultiplier: 0.65, dotTicks: 3, dotInterval: 2, baseVal: 400, scaling: 60, baseDmg: 45, scalingDmg: 15, stat: 'damage', colorType: 'pink', effect: 'dot_buff', type: 'active', descTemplate: 'Tajo con coeficiente del {min}%-{max}% (Tier 1, CD: 9s).' };
    } else if (className === 'NeuralHacker') {
        return { id: 'class_skill_nh', name: 'Infección Cero', cd: 10, tier: 1, scalingMultiplier: 0.6, dotTicks: 3, dotInterval: 2, baseVal: 30, scaling: 10, baseDmg: 30, scalingDmg: 10, stat: 'dot', colorType: 'yellow', effect: 'dot_buff', type: 'active', descTemplate: '<span style="color:#9d00ff; font-weight:bold;">DoT</span> inicial al {min}%-{max}% que otorga ganancia de <span style="color:#f3e600; font-weight:bold;">Hype</span> (Tier 1, CD: 10s).' };
    } else if (className === 'VoidWeaver') {
        return { id: 'class_skill_vw', name: 'Singularidad Oscura', cd: 11, tier: 1, scalingMultiplier: 0.6, dotTicks: 3, dotInterval: 2, baseVal: 50, scaling: 25, baseDmg: 40, scalingDmg: 15, stat: 'dot', colorType: 'violet', effect: 'dot_buff', type: 'active', descTemplate: 'Convierte {min}%-{max}% del <span style="color:#ffffff; font-weight:bold;">daño</span> acumulado en explosión directa (Tier 1, CD: 11s).' };
    } else {
        return { id: 'class_skill_pe', name: 'Inyección Rápida', cd: 8, tier: 1, scalingMultiplier: 0.6, dotTicks: 3, dotInterval: 2, baseVal: 150, scaling: 30, baseDmg: 20, scalingDmg: 8, stat: 'damage', colorType: 'cyan', effect: 'dot_buff', type: 'active', descTemplate: 'Multiplicador de <span style="color:#ffffff; font-weight:bold;">clic</span> eficiente al {min}%-{max}% (Tier 1, CD: 8s).' };
    }
}

