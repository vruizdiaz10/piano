# Clavis

> Aplicacion de practica de lectura musical. Aparece una nota en el pentagrama -- identificala y presiona la tecla correcta en un teclado MIDI o en el piano en pantalla.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Funcionalidades

### Pantallas y navegacion
- **Inicio** -- Pantalla de bienvenida con inicio de sesion con Google y acceso como invitado
- **Dashboard** -- Centro principal con generador de lecciones rapidas, hoja de ruta progresiva, estadisticas semanales y frases rotativas del Sensei
- **Biblioteca** -- Biblioteca de lecciones con las 18 lecciones, estado de dominio e historial de sesiones
- **Perfil** -- Perfil con configuracion, estadisticas, gestion de cuenta y calibracion del controlador MIDI
- **Practica** -- Pantalla de practica con pentagrama, teclado, barra de progreso y controles
- **Resultados** -- Resultados de la sesion con puntaje, precision, racha y opciones para la siguiente leccion

### Jugabilidad
- **18 lecciones progresivas** -- 9 en clave de sol + 9 en clave de fa, desde notas simples en lineas hasta el rango cromatico completo
- **Generador de lecciones rapidas** -- Sesiones de practica personalizadas: elige clave, lineas/espacios, lineas adicionales, sostenidos, modo cronometrado y cantidad de notas (5/10/20). La configuracion se guarda en Firestore y se restaura al iniciar sesion
- **Sistema de rachas** -- Las respuestas correctas consecutivas acumulan una racha; sonido de hito cada 5
- **Racha diaria** -- Dias de practica consecutivos rastreados via Firestore (invitado) o sincronizacion en la nube
- **Ventana de recuperacion** -- Despues de una respuesta incorrecta, presiona la tecla correcta para obtener credito parcial antes del avance automatico
- **Modo cronometrado** -- Cuenta regresiva por nota (5s o 8s dependiendo de la duracion de la sesion)
- **Notas fantasma** -- Estela de notas recientes mostradas como fantasmas translucidos; la ultima nota correcta aparece atenuada despues de un error
- **Hoja de ruta** -- Hoja de ruta progresiva de lecciones con estados bloqueado/en curso/terminado por clave, segun criterios de dominio
- **Frases del Sensei** -- Frases de sabiduria rotativas de compositores y musicos seleccionados (Beethoven, Mozart, Bach, Chopin, etc.), sincronizadas via Firestore

### Entrada y sonido
- **Entrada MIDI** -- Conecta cualquier teclado USB/MIDI via Web MIDI API; deteccion automatica
- **Modal de calibracion MIDI** -- Maquina de estados de calibracion por mantener presionado (5 estados: esperando-bajo, manteniendo-bajo, esperando-alto, manteniendo-alto, completado). Se activa automaticamente en la primera conexion MIDI cuando no hay rango guardado. El usuario mantiene presionada la nota mas baja 2 segundos, luego la mas alta 2 segundos. El rango se guarda en Firestore
- **Piano en pantalla** -- Teclado interactivo con estilo 3D (teclas de marfil/negro); reducido a C3--C5 en movil
- **Barra de octavas** -- Cambio manual de octava activable para teclados con rango limitado
- **Sintesis Web Audio** -- Cada nota reproducida con osciladores en capas (armonicos triangulares + sinusoidales)
- **Efectos de sonido** -- Arpegio mayor en correcta, menor en incorrecta, fanfarria al completar nivel

### Visuales
- **Sistema de diseno Claymorphism** -- Interfaz con tonos de arcilla calida, tarjetas neumaticas, botones, barras de progreso y burbujas de iconos (`clay-card`, `clay-btn-primary`, `clay-icon-raised`, `clay-progress-bar`, etc.)
- **Material Symbols Outlined** -- Google Material Symbols para todos los iconos
- **Interfaz en espanol** -- Todo el texto de la interfaz en espanol (Lecciones, Practicar, Perfil, Biblioteca, etc.)
- **Pentagrama SVG** -- Claves de sol y fa con fuente Noto Music, notas fantasma, puntos de rango de intervalos, atril con textura de madera
- **Expresiones de nota** -- Punto indicador verde/rojo en las notas despues de responder
- **Grafico de progreso** -- Grafico semanal de precision (lun--dom) en el dashboard
- **Modo oscuro/claro** -- Respeta `prefers-color-scheme`, interruptor en la barra de herramientas
- **Modo silencioso** -- Indicadores de emoji de dormido en el pentagrama, sonido desactivado

### Notacion
- **Alternancia americano/latino** -- C D E F G A B <-> Do Re Mi Fa Sol La Si
- **Nombres de notas en el pentagrama** -- Visualizacion configurable en las cabezas de nota

### PWA y sincronizacion
- **Instalable** -- manifest.json + service worker para soporte offline (nombre de la PWA: "Clavis")
- **Firebase Auth** -- Inicio de sesion con Google para sincronizacion en la nube
- **Sincronizacion en la nube** -- Historial de sesiones y configuracion se sincronizan a Firestore al iniciar sesion
- **Historial de frases** -- Indices diarios de frases sincronizados a Firestore para evitar repeticiones entre dispositivos
- **Respaldo en localStorage** -- Todas las funciones principales funcionan sin Firebase

---

## Stack tecnologico

| Tecnologia | Proposito |
|---|---|
| [React 18](https://react.dev) | Framework de interfaz |
| [TypeScript](https://www.typescriptlang.org) | Seguridad de tipos |
| [Vite](https://vitejs.dev) | Herramienta de construccion y servidor de desarrollo |
| [Tailwind CSS](https://tailwindcss.com) | Estilos utility-first |
| [Radix UI](https://www.radix-ui.com) | Primitivas accesibles (Select, Checkbox, Dialog, Dropdown) |
| [shadcn/ui](https://ui.shadcn.com) | Patrones de componentes |
| [Firebase](https://firebase.google.com) | Auth + sincronizacion en la nube con Firestore |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Sintesis de sonido |
| [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) | Entrada de teclado MIDI |
| [Noto Music](https://fonts.google.com/noto/specimen/Noto+Music) | Simbolos musicales |
| [Material Symbols](https://fonts.google.com/icons) | Iconos de interfaz |
| [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) | Fuente de cuerpo de texto |
| [EB Garamond](https://fonts.google.com/specimen/EB+Garamond) | Fuente de titulos |
| [Ponytail](https://www.npmjs.com/package/@dietrichgebert/ponytail) | Fuente adicional |

---

## Primeros pasos

### Requisitos previos

- Node.js 18+
- npm 9+ (o yarn/pnpm)

### Instalacion

```bash
git clone https://github.com/vruizdiaz10/piano.git
cd piano
npm install
```

### Variables de entorno

Crea un archivo `.env` con tu configuracion de Firebase:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> La aplicacion funciona sin Firebase -- la sincronizacion en la nube y la autenticacion son opcionales. Todas las funciones principales usan localStorage.

### Desarrollo

```bash
npm run dev
```

Se abre en `http://localhost:5173`. Reemplazo de modulos en caliente habilitado.

### Construccion

```bash
npm run build
npm run preview
```

La salida se genera en `dist/`. Sirvela con cualquier servidor de archivos estaticos.

---

## Estructura del proyecto

```
src/
├── main.tsx                  # Punto de entrada de React
├── App.tsx                   # Componente raiz: enrutamiento de pantallas, orquestacion del juego, estado
├── index.css                 # Directivas de Tailwind, CSS claymorphism, keyframes, textura de madera
├── firebase/
│   ├── config.ts             # Inicializacion de Firebase (lee variables de entorno VITE_FIREBASE_*)
│   ├── auth.ts               # Ayudante de inicio de sesion con Google
│   └── firestore.ts          # Ayudantes de lectura/escritura en Firestore, tipo UserDoc, historial de frases
├── hooks/
│   ├── useGameState.ts       # Reductor de estado del juego (fase, puntaje, racha, notacion, cronometro, rango del controlador)
│   ├── useMidi.ts            # Conexion y manejo de eventos Web MIDI API (doble callback: onNoteOn + onNoteOff opcional)
│   ├── useSound.ts           # Sintesis de osciladores Web Audio y efectos
│   ├── useDailyStreak.ts     # Racha diaria persistente (localStorage)
│   ├── useAuthProvider.tsx   # Proveedor de Firebase Auth
│   ├── useAuth.ts            # Hook de contexto de autenticacion
│   ├── useSessionSync.ts     # Sincronizacion de sesiones en la nube con reintentos + fusion
│   ├── useConfigSync.ts      # Sincronizacion de configuracion en la nube (escritura con debounce, notacion/cronometrado/quickLessonConfig/rango del controlador)
│   └── useQuoteHistory.ts    # Rotacion diaria de frases con sincronizacion a Firestore
├── types/
│   └── index.ts              # Tipos Note, GameState, QuickLessonConfig, ErrorType, MasteryCriteria
├── data/
│   ├── lessons.ts            # 18 definiciones de lecciones (9 clave de sol + 9 clave de fa) con conjuntos de notas MIDI
│   └── senseiQuotes.ts       # Frases de sabiduria seleccionadas de compositores y musicos
├── screens/
│   ├── InicioScreen.tsx      # Pantalla de bienvenida/inicio de sesion
│   ├── DashboardScreen.tsx   # Centro principal: generador de lecciones rapidas, hoja de ruta, estadisticas, frase del sensei
│   ├── BibliotecaScreen.tsx  # Biblioteca de lecciones con estado de dominio e historial de sesiones
│   ├── PerfilScreen.tsx      # Perfil: configuracion, estadisticas, calibracion, gestion de cuenta
│   └── ResultadosScreen.tsx  # Resultados de la sesion: puntaje, precision, racha, siguiente leccion
├── utils/
│   ├── midiToNote.ts         # Numero MIDI -> objeto Note
│   ├── noteToPosition.ts     # Nota -> posicion Y en pentagrama SVG (mapas de clave de sol + fa)
│   ├── notation.ts           # Mapeo de nombres de notas americano <-> latino
│   ├── errorAnalysis.ts      # Clasificacion de errores (linea-espacio, paso, salto, octava, accidental, linea adicional, aleatorio) + consejos
│   ├── sessionHistory.ts     # Historial de sesiones (localStorage)
│   ├── notePool.ts           # Constructor de conjuntos personalizado para lecciones rapidas (filtros de lineas/espacios/adicionales/sostenidos)
│   ├── dashboardStats.ts     # Agregacion de sesiones, constructor de hoja de ruta, estadisticas semanales, sistema de rangos
│   └── weakPool.ts           # Conjunto de notas debiles para practica enfocada
├── lib/
│   └── utils.ts              # Utilidad cn() (clsx + tailwind-merge)
└── components/
    ├── Staff.tsx             # Pentagrama SVG con claves, notas, fantasmas, estela, expresiones de nota
    ├── PianoKeyboard.tsx     # Teclado de piano interactivo 3D
    ├── Feedback.tsx          # Banner de correcto/incorrecto + consejos de error
    ├── CalibrationModal.tsx  # Calibracion del controlador MIDI (maquina de estados de 5 estados, calibracion por mantener presionado)
    ├── OctaveBar.tsx         # Control de cambio manual de octava activable
    ├── TopNavBar.tsx         # Barra de navegacion superior Dashboard/Biblioteca
    ├── PracticeNavBar.tsx    # Barra superior de la pantalla de Practica (volver, perfil, racha, precision)
    ├── NavUserMenu.tsx       # Menu desplegable del avatar de usuario
    ├── Toolbar.tsx           # Selector de leccion, interruptor de nombre de notas, interruptor de cronometro
    ├── ProgressBar.tsx       # Barra de progreso con indicador actual/total
    ├── StreakBadge.tsx       # Contador de racha con fuego
    ├── ScoreDisplay.tsx      # Indicador de precision + cronometro
    ├── ProgressChart.tsx     # Grafico semanal de precision en SVG miniatura
    ├── LevelComplete.tsx     # Modal de puntaje heredado (reemplazado por ResultadosScreen)
    ├── Toast.tsx             # Componente de notificacion toast
    └── ui/                   # Primitivas basadas en Radix (select, checkbox, dialog, dropdown)
```

---

## Atajos de teclado

| Tecla | Accion |
|-------|--------|
| `R` | Reiniciar el juego actual |
| `P` | Pausar / reanudar |
| `Space` | Saltar a la siguiente nota (durante la retroalimentacion) |
| `Escape` | Cerrar la superposicion de pausa / modal de calibracion |

Los atajos se desactivan cuando el foco esta en un elemento de entrada o seleccion.

---

## Como jugar

1. Abre la aplicacion e inicia sesion con Google, o toca **Entrar como invitado** (modo invitado).
2. Desde el **Dashboard**, elige una leccion secuencial de la **Hoja de ruta**, o toca **Leccion rapida** para configurar una sesion de practica personalizada (clave, lineas/espacios, lineas adicionales, sostenidos, modo cronometrado, cantidad de notas).
3. Aparece una nota en el pentagrama y suena de forma audible.
4. Presiona la tecla correspondiente en tu teclado MIDI o haz clic en el piano en pantalla.
5. **Correcta**: El pentagrama parpadea en verde, suena un arpegio mayor.
6. **Incorrecta**: El pentagrama parpadea en rojo, muestra la respuesta correcta + consejo contextual de error, inicia ventana de recuperacion de 2.5 segundos.
7. Al completar el objetivo de la sesion, la pantalla de **Resultados** muestra tu puntaje, precision, mejor racha y calificacion por estrellas.
8. Elige **Reintentar** (misma leccion), **Siguiente** (avanzar si se cumplen los criterios de dominio) o **Dashboard** para volver.

### Calibracion MIDI

En la primera conexion MIDI (cuando no hay rango del controlador guardado), el **Modal de calibracion** se abre automaticamente:
1. Manten presionada tu nota mas baja durante 2 segundos.
2. Manten presionada tu nota mas alta durante 2 segundos.
3. El rango se guarda en Firestore. Las notas fuera del rango calibrado se aceptan por clase de tono.

También puedes recalibrar desde **Perfil > Calibrar controlador**.

---

## Lecciones

### Clave de Sol

| # | Nombre | Notas | Descripcion |
|---|--------|-------|-------------|
| 1 | Lineas (Sol) | E4, G4, B4, D5, F5 | Notas en las lineas del pentagrama |
| 2 | Espacios (Sol) | F4, A4, C5, E5 | Notas en los espacios del pentagrama |
| 3 | Lineas+Espacios (Sol) | E4--A5 | Lineas y espacios combinados |
| 4 | Rango pentagrama (Sol) | C4--E5 | Rango completo del pentagrama |
| 5 | Debajo pentagrama (Sol) | C4, D4 | Lineas adicionales debajo |
| 6 | Encima pentagrama (Sol) | G5, A5, B5, C6 | Lineas adicionales encima |
| 7 | Naturales (Sol) | C4--C6 (naturales) | Todas las notas naturales en el rango completo |
| 8 | Sostenidos (Sol) | C4--C6 (todas) | Introduce sostenidos |
| 9 | Todas las notas (Sol) | C4--C6 (todas) | Rango cromatico completo, clave de sol |

### Clave de Fa

| # | Nombre | Notas | Descripcion |
|---|--------|-------|-------------|
| 10 | Lineas (Fa) | G2, B2, D3, F3, A3 | Notas en las lineas del bajo |
| 11 | Espacios (Fa) | A2, C3, E3, G3 | Notas en los espacios del bajo |
| 12 | Lineas+Espacios (Fa) | G2--B3 | Lineas y espacios combinados |
| 13 | Rango pentagrama (Fa) | G2--D4 | Rango completo del pentagrama de bajo |
| 14 | Debajo pentagrama (Fa) | C2--F2 | Lineas adicionales debajo |
| 15 | Encima pentagrama (Fa) | C4--E4 | Lineas adicionales encima |
| 16 | Naturales (Fa) | C2--D4 (naturales) | Todas las notas naturales en el rango completo |
| 17 | Sostenidos (Fa) | C2--E4 (todas) | Introduce sostenidos |
| 18 | Todas las notas (Fa) | C2--E4 (todas) | Rango cromatico completo, clave de fa |

---

## Contribuir

1. Abre un issue para discutir los cambios propuestos antes de enviar un PR.
2. Manten el estilo existente (TypeScript estricto, componentes funcionales, hooks).
3. Si agregas una funcionalidad, actualiza o agrega el componente correspondiente. Asegurate de que las transiciones de estado en `useGameState` se mantengan consistentes.
4. Prueba la entrada MIDI si modificas `useMidi` o el flujo de envio de respuestas.
5. Ejecuta `npm run build` para verificar TypeScript y la construccion de produccion.

---

## Licencia

MIT (c) 2026
