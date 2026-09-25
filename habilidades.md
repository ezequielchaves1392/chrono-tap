# GDD MAESTRO: SISTEMA DE HABILIDADES Y COMBATE

## 📌 1. Reglas Generales del Sistema
* **Estructura del Árbol:** Una única pestaña de habilidades (TAB única) con un árbol ramificado y **no lineal** (de un nodo pueden salir múltiples caminos para bifurcar *builds*).
* **Progresión y Puntos:** 
  * Nivel máximo del personaje: **100**.
  * Puntos de habilidad totales: **50 puntos** (se otorga 1 punto cada 2 niveles: Nivel 2, 4, 6... hasta 100)[cite: 10]. 
  * Restricción: El árbol completo requiere más de 80 puntos para completarse, por lo que los 50 puntos obligan al jugador a elegir caminos exclusivos[cite: 10].
* **Restricción de Combate (Estricto):** Todo el combate y las habilidades se desarrollan de forma estrictamente individual (enfocadas en el nodo actual del enemigo). **PROHIBIDO el daño en área (AoE)**. Todo concepto de AoE queda eliminado de raíz[cite: 10].
* **Mecánica Estándar de DoTs (Daño Continuo):**
  * Todos los DoTs especifican su duración exacta[cite: 10].
  * **Regla de Acumulación y Refresco:** Los DoTs son acumulables. Si se aplica una nueva carga antes de que expire, **refresca su duración total**, **suma +1 al contador de acumulación** y **suma el daño de las cargas activas** hasta alcanzar el límite máximo de acumulaciones[cite: 10].
* **Mecánica de Velocidad de Drones:** Afecta directamente al **intervalo de los ticks** del DoT. A mayor velocidad de drones, menor es el tiempo de espera entre cada tick, haciendo que el DoT golpee con mayor frecuencia por segundo[cite: 10].

---

## 🧮 2. Fórmulas de Escalado y Atributos (Sistema Variable por Tiers)
* **Daño Base (D_base):** Escala automáticamente con el nivel del personaje: 
  `D_base = 15 + (Nivel del Personaje * 3.5)`. A nivel 100, el daño base plano es 365[cite: 10].
* **Coeficientes de Eficiencia por Tier (Multiplicador de Stat):** Para evitar que el rendimiento de las habilidades sea completamente plano, cada habilidad aplica un porcentaje de escalado según su complejidad y avance en el árbol:
  * **Tier 1 (Habilidades Iniciales / Básicas):** Coeficiente de escalado del stat del **50% al 70%** y eficiencia de daño plano reducida al **40%**.
  * **Tier 2 (Habilidades Intermedias):** Coeficiente de escalado estándar del **100%** y eficiencia de daño plano al **75%**.
  * **Tier 3 / Definitivas (Habilidades Avanzadas):** Coeficiente de escalado superior del **150% al 220%+** y eficiencia de daño plano al **100%+**.
* **Daño Total:** 
  `D_total = (D_base + (Stats_equipo * Coeficiente_Plano_Tier)) * (1 + Suma_Pasivas_porcentaje) * Multiplicador_Variable_Tier`[cite: 10]

---

## 🛠️ 3. Desglose por Clase (Árbol Ramificado con Escalado Diferenciado)

### 1. PROMPT ENGINEER (Ingeniero de Prompts)
* *Rol:* Daño Directo explosivo (Burst) mediante clics y críticos rápidos[cite: 10].
* **Pasiva de Entrada:** *Precisión Cuántica* (Tier 1, 5 Niveles) -> +2% Probabilidad de Crítico por nivel (Máx: +10%)[cite: 10].
* **Slot Activo 1:** *Inyección Rápida* (Daño Directo Tier 1, CD: 8s, 5 Niveles) -> Añade un multiplicador de clic eficiente al **60%-70%** del stat durante 5.0s[cite: 10].
* **Pasiva Intermedia:** *Sobrecarga de Cursor* (Tier 2, 3 Niveles) -> -5% CD en habilidades de Burst por nivel (Máx: -15%)[cite: 10].
* **Slot Activo 3:** *Compilador Masivo* (Daño Directo Instantáneo Tier 2, CD: 12s, 5 Niveles) -> Inflige un daño escalado al **100%-125%** del stat base de forma instantánea[cite: 10].
* **Slot Activo 5 (Definitiva):** *Prompt Cero* (Ejecución Tier 3, CD: 45s, 3 Niveles) -> Ejecuta enemigos bajo 10%-20% de vida o inflige un daño masivo escalado al **180%-220%** del stat base[cite: 10].

### 2. AISWARM MASTER (Maestro de Enjambres IA)
* *Rol:* Daño sostenido por DoTs de nanodrones y control de colmena[cite: 10].
* **Pasiva de Entrada:** *Protocolo Enjambre* (Tier 1, 5 Niveles) -> Aumenta la velocidad de ticks del DoT de los drones por nivel (Máx: +50% frecuencia)[cite: 10].
* **Slot Activo 1:** *Nanodron de Refuerzo* (Buff DoT Tier 1, CD: 15s, 5 Niveles) -> Despliega drones con un escalado inicial del **60%** del stat DoT (duración 15s, acumulable hasta 3 veces)[cite: 10].
* **Pasiva Intermedia:** *Red Colmena* (Tier 2, 4 Niveles) -> +1s de duración a todos los DoTs por nivel (Máx: +4s)[cite: 10].
* **Slot Activo 3:** *Sobrecarga de Red* (Buff de DoT Directo Tier 2, CD: 14s, 5 Niveles) -> Otorga un factor de escalado del **100%** a los ticks activos durante 8s[cite: 10].
* **Slot Activo 5 (Definitiva):** *Supercolmena Omega* (Daño Continuo Tier 3, CD: 50s, 3 Niveles) -> Haz láser continuo con un multiplicador masivo del **190%-240%** del stat de DoT acumulado total durante 8s[cite: 10].

### 3. QUANTUM ARCHITECT (Arquitecto Cuántico)
* *Rol:* Manipulación temporal, congelación de relojes y reducción de enfriamientos[cite: 10].
* **Pasiva de Entrada:** *Estabilizador de Flujo* (Tier 1, 5 Niveles) -> +5% resistencia a penalizaciones temporales por nivel (Máx: +25%)[cite: 10].
* **Slot Activo 1:** *Pulso Estabilizador* (Control Temporal Tier 1, CD: 25s, 5 Niveles) -> Congela el temporizador del nodo de 3s a 5s con menor afectación de recursos[cite: 10].
* **Pasiva Intermedia:** *Compresión Cuántica* (Tier 2, 3 Niveles) -> -10% de reducción pasiva de CD global por nivel (Máx: -30%)[cite: 10].
* **Slot Activo 3:** *Acelerador Cuántico* (Reducción CD Actual Tier 2, CD: 20s, 5 Niveles) -> Reduce de 20% a 40% el CD restante actual de las demás habilidades[cite: 10].
* **Slot Activo 5 (Definitiva):** *Colapso del Horizonte* (Multiplicador de CD Tier 3, CD: 60s, 3 Niveles) -> Multiplica el daño directo y DoT con un factor avanzado del **170%-210%** escalando según la reducción de CD durante 10s-15s[cite: 10].

### 4. CYBERSAMURAI (Ciber-Samurái)
* *Rol:* Combate físico directo, tajos de plasma y aplicación de sangrados tácticos[cite: 10].
* **Pasiva de Entrada:** *Filo de Plasma* (Tier 1, 5 Niveles) -> +2% daño plano en ataques de corte por nivel (Máx: +10%)[cite: 10].
* **Slot Activo 1:** *Corte de Plasma* (Daño Directo + Debuff Tier 1, CD: 9s, 5 Niveles) -> Tajo con un coeficiente inicial del **65%** de daño directo y +15%-+35% de Amplificación por 5s[cite: 10].
* **Pasiva Intermedia:** *Danza del Acero* (Tier 2, 4 Niveles) -> Otorga 15%-60% de probabilidad por clic de aplicar un **sangrado (DoT físico)** de 6s de duración (acumulable hasta 3 veces)[cite: 10].
* **Slot Activo 3:** *Estocada de Nanofibra* (Amplificación Pura Tier 2, CD: 12s, 5 Niveles) -> Aplica +20%-+40% de Amplificación de Daño puro con un factor de escalado del **100%** durante 4s-8s[cite: 10].
* **Slot Activo 5 (Definitiva):** *Ejecución del Shogun* (Daño Directo Masivo Tier 3, CD: 45s, 3 Niveles) -> Combo rápido de impacto crítico con un multiplicador de **200%-250%** de daño directo base instantáneo[cite: 10].

### 5. NEURALHACKER (Hacker Neural)
* *Rol:* Debuffs de economía (Hype) e infecciones de virus DoT lógicos en cadena[cite: 10].
* **Pasiva de Entrada:** *Backdoor Activo* (Tier 1, 5 Niveles) -> +10% ganancia de Hype por nivel al piratear (Máx: +50%)[cite: 10].
* **Slot Activo 1:** *Infección Cero* (Troyano DoT Tier 1, CD: 10s, 5 Niveles) -> DoT inicial con coeficiente del **60%** (8s, acumulable hasta 3 veces) que otorga +30%-+70% de ganancia temporal de Hype[cite: 10].
* **Pasiva Intermedia:** *Gusano de Red* (Tier 2, 4 Niveles) -> Al morir un nodo infectado, el DoT viral salta al siguiente nodo conservando 50%-95% de su potencia[cite: 10].
* **Slot Activo 3:** *Rootkit de Sistema* (Conversión de Daño Tier 2, CD: 14s, 5 Niveles) -> Convierte 10%-30% del daño directo infligido en Hype directo con un rendimiento equilibrado al **100%** durante 8s-12s[cite: 10].
* **Slot Activo 5 (Definitiva):** *Apocalipsis Matrix* (Daño y Economía Tier 3, CD: 50s, 3 Niveles) -> Daño puro con un multiplicador superior del **180%-230%** y multiplicador de x3.0-x5.0 Hype global por 15s[cite: 10].

### 6. VOIDWEAVER (Tejedor del Vacío)
* *Rol:* Control del vacío y conversión de la entropía acumulada en combate[cite: 10].
* **Pasiva de Entrada:** *Atracción de Singularidad* (Tier 1, 5 Niveles) -> +5% de eficiencia en la conversión de entropía por nivel (Máx: +25%)[cite: 10].
* **Slot Activo 1:** *Singularidad Oscura* (Daño por Entropía Tier 1, CD: 11s, 5 Niveles) -> Convierte la entropía acumulada con un factor inicial del **50%-70%** del daño total en una explosión de daño directo instantáneo[cite: 10].
* **Pasiva Intermedia:** *Horizonte de Sucesos* (Tier 2, 4 Niveles) -> +5%-+20% de daño crítico adicional escalado por vida faltante del objetivo[cite: 10].
* **Slot Activo 3:** *Distorsión del Vacío* (Buff de Daño Directo Tier 2, CD: 13s, 5 Niveles) -> Incrementa el daño directo de los clics de forma exponencial con escalado del **100%** durante 6s (+15%-+35%)[cite: 10].
* **Slot Activo 5 (Definitiva):** *Desgarro Dimensional* (Farmeo Idle Tier 3, CD: 60s, 3 Niveles) -> Colapsa instantáneamente el nodo actual, otorgando botín equivalente a 3-6 minutos de farmeo idle automático y salta de fase con una eficiencia máxima del **220%+**[cite: 10].