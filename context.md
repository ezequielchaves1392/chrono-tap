# Context.md - Wizzcat Clicker: Cyber Edition (v19.0)

## 📋 Descripción General de la Aplicación
**Wizzcat Clicker - Cyber Edition** es un videojuego web incremental (*idle/clicker*) de temática cyberpunk/espacial. El jugador asume el rol de un ingeniero/arquitecto cibernético que debe atravesar sectores orbitales infectados, derrotar subrutinas hostiles y jefes de red mediante la ejecución de prompts (clicks), la gestión de habilidades activas/pasivas, y el avance a través de un completo árbol de tecnologías.

---

## 🛠️ Tecnologías y Stack Utilizado
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla Modular).
* **Framework CSS:** Tailwind CSS (configurado con paleta de colores personalizada de temática cyberpunk y clases en modo oscuro por defecto `dark`)[cite: 1].
* **Librerías Externas:**
  * **FontAwesome (v6.4.0):** Iconografía general[cite: 1].
  * **Google Fonts:** Fuentes *Inter* y *Orbitron*[cite: 1].
  * **Firebase SDK (Compat v11.6.1):** Integración de Firebase App y Realtime Database para autenticación, guardado en la nube y rankings globales[cite: 1].
* **Estructura de Archivos:**
  * `index.html`: Estructura principal, modales, pantallas de autenticación, selección de héroes y la interfaz del juego dividida en pestañas[cite: 1].
  * `styles.css`: Estilos globales, animaciones de pulso, textos flotantes de daño, barras de desplazamiento personalizadas y manejo de tooltips[cite: 2].
  * `classes-config.js`: Definición de clases de personajes, descripciones y árboles de habilidades completos con nodos pasivos y activos[cite: 3].
  * `music.js`: Lógica del reproductor de audio estelar y gestión de pistas (asumido por la modularización).
  * `game.js`: Motor principal del juego, lógica de bucles de combate, economía y persistencia (asumido por la arquitectura).

---

## 🚀 Funcionalidades Principales

### 1. Sistema de Autenticación y Cuentas
* Pantalla de inicio de sesión y registro general[cite: 1].
* Opción de recordar sesión y credenciales de usuario.

### 2. Selección y Creación de Personajes (Héroes)
* Permite desplegar nuevos personajes con nombres únicos globales[cite: 1].
* **Clases Disponibles y Habilidades Iniciales:**
  * *Prompt Engineer*: Daño crítico masivo y ráfagas de comandos (*Inyección Rápida*)[cite: 1, 3].
  * *AISwarm Master*: Daño sostenido (*DOT*) y enjambres autónomos (*Protocolo Enjambre*)[cite: 1, 3].
  * *Quantum Architect*: Reducción de latencia y pulsos estabilizadores (*Pulso Estabilizador*)[cite: 1, 3].
  * *CyberSamurai*: Filos de plasma con daño físico crítico y sangrado (*Corte de Plasma*)[cite: 1, 3].
  * *NeuralHacker*: Infiltración de redes e infecciones letales (*Backdoor Neural*)[cite: 1, 3].
  * *VoidWeaver*: Manipulación del vacío con anomalías espaciales (*Singularidad Oscura*)[cite: 1, 3].
* Opción de activar/desactivar un tutorial guía inteligente[cite: 1].

### 3. Sistema de Combate y Exploración (Nave / Batalla)
* **Combate por Nodos/Etapas:** Interfaz de combate contra naves y subrutinas hostiles con barra de vida interactiva y temporizador de nodo[cite: 1].
* **Mecánica de Anclaje (Aterrizar):** Permite evitar el paso automático al siguiente nivel para farmear recursos[cite: 1].
* **Sistema de Derrotas y Recuperación:** Si el jugador muere o se agota el tiempo, la nave entra en estado de recarga (*Cooldown*), permitiendo reparar la nave gastando *Hype*[cite: 1].
* **Jefes y Minijuegos:** Alertas de jefes de red con mecánicas especiales en minijuegos interactivos[cite: 1].
* **Reproductor Estelar:** Control de música ambiental integrado (Play/Pause, siguiente pista, aleatorio y control de volumen)[cite: 1].

### 4. Árbol de Habilidades (Skills)
* Árboles ramificados complejos basados en la clase seleccionada (ej. *Overclock Click*, *Monetización*, *Criti-Core* para Prompt Engineer)[cite: 3].
* Visualización interactiva con nodos pasivos y activos, con soporte para zoom y desplazamiento del canvas[cite: 1].
* Barra de acciones rápidas para equipar y utilizar habilidades activas en combate[cite: 1].
* Opción de reinicio de árbol de habilidades a cambio de *Hype*[cite: 1].

### 5. Economía y Progresión
* **Hype:** Divisa digital principal obtenida al vencer enemigos y mediante pasivas. Se utiliza para mejoras de Hardware/Software, reparaciones y canjes[cite: 1].
* **Shards (Microchips):** Divisa de prestigio obtenida mediante Singularidades (*Prestige*) o canjeada directamente por *Hype* en la tienda dedicada[cite: 1].
* **Centro de Mejoras:** Apartado dividido en *Hardware* y *Software* para potenciar estadísticas base[cite: 1].

### 6. Características Sociales y de Sistema
* **Singularidad Neuronal (Prestige):** Reinicio de red al alcanzar el nivel 100 a cambio de *Shards* permanentes[cite: 1].
* **Logros (Hazañas de Red):** Sistema de logros desbloqueables[cite: 1].
* **Rankings Globales:** Visualización de los mejores jugadores conectados a través de Firebase[cite: 1].
* **Guía Integrada ("How To Play"):** Manual interactivo dentro de las pestañas del juego[cite: 1].

---

## 🔮 Nuevos Features Propuestos (Próximas Fases de Desarrollo)
1. **Modo Expedición Cooperativa (Co-Op Raids):**
   * Permitir que varios jugadores unan fuerzas en tiempo real contra Jefes de Red masivos sincronizados mediante Firebase.
2. **Sistema de Mascotas / Drones IA:**
   * Incorporar drones flotantes acompañantes que otorguen bonificaciones pasivas de recolección de Hype o daño automático adicional, customizables con piezas encontradas en los sectores.
3. **Eventos Ciber-Dinámicos (Glitch Events):**
   * Aparición aleatoria de eventos tipo "Glitch de Red" durante la exploración que otorguen multiplicadores masivos de daño o Shards por tiempo limitado si se completan minijuegos de hacking rápido.
4. **Logros con Recompensas Activas:**
   * Hacer que los logros no solo sean estéticos o de repertorio, sino que otorguen bonificaciones pasivas permanentes al ser reclamados (ej. +5% de probabilidad crítica global).
5. **Sistema de Crafteo de Módulos:**
   * Un nuevo taller donde se puedan fundir materiales obtenidos de los jefes para crear artefactos únicos equipables en la nave orbital.


## Fixes
