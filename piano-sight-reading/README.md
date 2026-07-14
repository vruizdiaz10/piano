# NoteDojo

> A tu ritmo, nota a nota.

Un juego de entrenamiento de lectura musical a primera vista para piano. Aparece una nota en el pentagrama en clave de sol y el jugador debe presionar la tecla correcta, ya sea en un teclado MIDI conectado o en el piano en pantalla. Atraves de un escenario de concierto inmersivo con cortinas, focos y un marco ornamental dorado.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Screenshot](screenshot.png)
<!-- Reemplazar screenshot.png con una captura del juego en accion. Incluir el pentagrama, el teclado en pantalla y la barra de herramientas para una vista previa rapida. -->

---

## Caracteristicas

### Juego
- **Pentagrama SVG** -- La clave de sol, cabeza de nota, plica, lineas adicionales y alteraciones se dibujan en SVG. La posicion de la nota sigue las convenciones de notacion musical estandar.
- **Notacion Americano / Latino** -- Selector desplegable para alternar entre notacion americana (C, D, E...) y latina (Do, Re, Mi...). La preferencia persiste en localStorage.
- **9 lecciones progresivas** -- Desde lineas simples hasta el rango cromatico completo (C4-C6). Cada leccion apunta a una region o concepto especifico. Ver [tabla de lecciones](#lecciones).
- **Sistema de racha** -- Las respuestas correctas consecutivas construyen una racha. Una insignia de "buho" aparece al alcanzar 3+ racha, intensificandose visualmente en 5, 8 y 10. Los hitos de racha reproducen una escala ascendente celebratoria.
- **Modo temporizador** -- Checkbox en la barra de herramientas para activar un cronometro que registra el tiempo total y el tiempo de respuesta por nota.
- **Maestria de leccion** -- Cada leccion define requisitos de precision, racha minima y numero de notas para desbloquear la siguiente leccion.
- **Estadisticas detalladas** -- Al completar un nivel se muestra precision, mejor racha, total de notas, tiempo total, tiempo de respuesta promedio, mejor tiempo de respuesta y una constelacion SVG de las notas respondidas.

### Entrada
- **Entrada MIDI** -- Conecta cualquier teclado USB/MIDI via la Web MIDI API. El juego detecta dispositivos conectados automaticamente y muestra el estado de conexion.
- **Piano en pantalla** -- Un piano interactivo de 37 teclas (rango MIDI 48-84) se renderiza en pantalla para entrada tactil, con raton o teclado. No requiere dispositivo MIDI.
- **Adaptacion movil** -- En orientacion horizontal movil se muestran 24 teclas. En vertical, 14 teclas con navegacion por octava (flechas izquierda/derecha). Teclas con relieve 3D y estilo ivory/ebony.

### Retroalimentacion
- **Sintesis de sonido** -- Construida con la Web Audio API. Cada nota se reproduce con armonicos superpuestos (onda triangular + sinusoidal). Las respuestas correctas activan un arpegio de acorde mayor, las incorrectas un acorde menor, y la finalizacion del nivel una fanfarria.
- **Ventana de recuperacion** -- Despues de una respuesta incorrecta, el juego entra en una ventana de recuperacion de 2.5 segundos con una barra de cuenta atras visual. Responder correctamente dentro de la ventana otorga credito parcial.
- **Score fly-up** -- Texto flotante "+puntos" o "X" que se anima hacia arriba en cada respuesta. Puntos = 10 + racha * 2.
- **Hit ripple** -- Circulo radial expandiendose en la nota golpeada (verde = correcto, rosa = incorrecto).
- **Notas fantasma** -- Las ultimas tres notas respondidas flotan hacia arriba en el pentagrama como cabezas de nota fantasma traslucidas.
- **Barra de progreso con patito nadador** -- Un emoji de patito se desliza a lo largo de una barra de progreso gradientada que muestra el conteo actual hacia el objetivo de 10 notas por sesion.
- **Confeti** -- Efecto de particulas de confeti en respuestas correctas, con intensidad creciente segun la racha.
- **Particulas de luz** -- Canvas de particulas con cuadrados de colores que explotan en oleadas durante las respuestas correctas, con gravedad y rotacion.

### Visual
- **Escenario de concierto** -- La interfaz ambienta un escenario teatral con cortinas SVG (telon, laterales, flecos dorados), foco radial, marco ornamental dorado con esquinas SVG y orbes bokeh flotantes.
- **Modo oscuro / Claro** -- Alternador de tema con icono de sol/luna. La transicion activa una animacion de "teatro crepuscular" -- un gran sol o luna brillante aparece y desaparece. Respeta `prefers-color-scheme` en la carga inicial.
- **Silencio / Teatro de sueno** -- Silenciar el audio oscurece la interfaz, muestra indicadores "Zzz" flotantes y activa una animacion de balanceo sutil en la clave de sol. El pentagrama se oscurece al 70% de opacidad.
- **Buho de racha** -- SVG animado del buho que cambia de color, tamano y animacion segun la racha: dormido (0-1), bobbing (2+), pulsando (5+), furioso con bounce (10+).
- **Grafico de progreso** -- Linea SVG de las ultimas 10 sesiones con puntos codificados por color (verde >=80%, ambar >=50%, rosa <50%). Solo visible con 2+ sesiones guardadas.

### Persistencia y PWA
- **Historial de sesiones** -- Cada sesion se guarda en localStorage (accuracy, notas, leccion, fecha). Se mantienen las ultimas 20 sesiones.
- **Progresion persistente** -- El nivel de leccion y configuraciones se guardan en localStorage y se restauran al recargar.
- **PWA** -- Manifest.json con nombre "NoteDojo", color de tema #6B1A1A, fondo #0D0704. Instalable en escritorio y movil.
- **Modo paisaje movil** -- Optimizado para orientacion horizontal en dispositivos moviles con interfaz compacta.

### Accesibilidad
- Las regiones ARIA live anuncian aciertos/fallos e hitos de racha.
- Piano en pantalla navegable por teclado.
- El SVG del pentagrama tiene un `aria-label` descriptivo.
- Respeta `prefers-reduced-motion`.

---

## Tecnologias

| Tecnologia | Proposito |
|---|---|
| [React 18](https://react.dev) | Framework de interfaz de usuario |
| [TypeScript](https://www.typescriptlang.org) | Seguridad de tipos |
| [Vite](https://vitejs.dev) | Herramienta de compilacion y servidor de desarrollo |
| [Tailwind CSS](https://tailwindcss.com) | Estilos utilitarios |
| [shadcn/ui](https://ui.shadcn.com) | Primitivas Select y Checkbox basadas en Radix |
| [lucide-react](https://lucide.dev) | Iconos (Volume2, VolumeX, ChevronLeft, ChevronRight) |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Sintesis y reproduccion de sonido |
| [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) | Entrada de teclado MIDI |
| SVG | Renderizado de pentagrama, notacion, cortinas, foco, marco ornamental, grafico de progreso, buho |

---

## Estructura del Proyecto

```
piano-sight-reading/
├── index.html                  # HTML de entrada
├── vite.config.ts              # Configuracion de Vite con alias @/
├── tailwind.config.js          # Tema de Tailwind (fuentes, colores, animaciones)
├── postcss.config.js           # Pipeline PostCSS + Tailwind
├── tsconfig.json               # Configuracion de TypeScript
├── package.json                # Dependencias y scripts
├── public/
│   ├── manifest.json           # Manifest PWA (NoteDojo)
│   └── pwa-icon.svg            # Icono de la PWA
├── src/
│   ├── main.tsx                # Punto de entrada de React
│   ├── App.tsx                 # Componente raiz: orquestacion del juego, estado, efectos
│   ├── index.css               # Directivas de Tailwind, variables CSS (claro/oscuro/teatro), keyframes
│   ├── types.ts                # Definiciones de tipos Note, GameState, GamePhase, Notation
│   ├── data/
│   │   └── lessons.ts          # Definiciones de lecciones (9 lecciones, pools de notas MIDI, requisitos de maestria)
│   ├── hooks/
│   │   ├── useGameState.ts     # Reducer de estado del juego (fase, puntuacion, recuperacion, racha)
│   │   ├── useSound.ts         # Sintesis de osciladores Web Audio (notas, efectos, fanfarria)
│   │   └── useMidi.ts          # Conexion Web MIDI API y manejo de eventos
│   ├── utils/
│   │   ├── midiToNote.ts       # Conversion de numero MIDI a objeto Note
│   │   ├── noteToPosition.ts   # Mapeo de nota a posicion Y en SVG (clave de sol)
│   │   ├── notation.ts         # Conversion entre notacion americana y latina (displayNoteName)
│   │   ├── sessionHistory.ts   # Persistencia de sesiones en localStorage (saveSession, getSessions)
│   │   ├── errorAnalysis.ts    # Analisis de errores para retroalimentacion adaptativa
│   │   └── weakPool.ts         # Pool de notas debiles para practica dirigida
│   ├── lib/
│   │   └── utils.ts            # Utilidad cn() (clsx + tailwind-merge)
│   └── components/
│       ├── Staff.tsx               # Pentagrama SVG, cabeza de nota, lineas adicionales, alteraciones, fantasmas
│       ├── PianoKeyboard.tsx       # Piano interactivo de 37 teclas en pantalla (responsive movil)
│       ├── Feedback.tsx            # Banner de correcto/incorrecto con temporizador de recuperacion
│       ├── LevelComplete.tsx       # Modal de puntuacion con constelacion SVG, maestria y estadisticas
│       ├── Toolbar.tsx             # Selector de lecciones, checkbox mostrar nota, checkbox temporizador
│       ├── ProgressBar.tsx         # Barra de progreso de sesion con indicador de patito
│       ├── ScoreDisplay.tsx        # Porcentaje de precision con barra codificada por color + boton mute
│       ├── StreakBadge.tsx         # Insignia de conteo de racha (emoji de fuego + multiplicador)
│       ├── StreakOwl.tsx           # SVG animado de buho (dormido/bobbing/pulsando/furioso)
│       ├── ThemeToggle.tsx         # Alternador de modo oscuro sol/luna
│       ├── Confetti.tsx            # Explosion de particulas CSS en respuestas correctas
│       ├── ParticleCanvas.tsx      # Canvas de particulas de luz con gravedad y rotacion
│       ├── ScoreFlyUp.tsx          # Texto flotante "+puntos" o "X" animado hacia arriba
│       ├── HitRipple.tsx           # Circulo radial expandiendose en nota golpeada
│       ├── ProgressChart.tsx       # Grafico de linea SVG de precision de ultimas 10 sesiones
│       ├── ConcertCurtains.tsx     # Cortinas SVG del escenario (telon, laterales, flecos dorados)
│       ├── Spotlight.tsx           # Foco radial de luz sobre el pentagrama
│       ├── OrnateFrame.tsx         # Marco ornamental dorado con esquinas SVG y barra decorativa
│       └── ui/
│           ├── select.tsx          # Primitiva Select de shadcn/ui (Radix)
│           └── checkbox.tsx        # Primitiva Checkbox de shadcn/ui (Radix)
```

---

## Primeros Pasos

### Prerrequisitos

- Node.js 18+
- npm 9+ (o yarn, o pnpm)

### Instalacion

```bash
git clone https://github.com/vruizdiaz10/piano-sight-reading.git
cd piano-sight-reading
npm install
```

### Desarrollo

```bash
npm run dev
```

Se abre en `http://localhost:5173`. La sustitucion de modulos en caliente esta habilitada.

### Compilacion para Produccion

```bash
npm run build
npm run preview
```

La salida de compilacion va a `dist/`. Servir con cualquier servidor de archivos estatico.

---

## Uso

### Conexion de un Teclado MIDI

1. Conecta tu teclado MIDI por USB.
2. Abre la aplicacion en un navegador que soporte la Web MIDI API (Chrome, Edge, Opera).
3. La insignia en la esquina superior derecha muestra **MIDI: Conectado** (verde) o **MIDI: Sin conexion** (rojo).
4. Presiona cualquier tecla del teclado MIDI durante una ronda. El juego registra la nota automaticamente.

Sin dispositivo MIDI? Usa el piano en pantalla haciendo clic o tocando las teclas.

### Como Jugar

1. Haz clic en **Iniciar Juego** para comenzar una sesion.
2. Aparece una nota en el pentagrama en clave de sol.
3. Identifica la nota y presiona la tecla correspondiente en tu teclado MIDI o en el piano en pantalla.
4. **Correcto**: El pentagrama parpadea en verde, aparece "Correcto!" y suena un arpegio de acorde mayor. Aparece un score fly-up con los puntos ganados (+10 + racha * 2). Se activa un efecto de ripple y particulas de luz. Una breve explosion de confeti se activa.
5. **Incorrecto**: El pentagrama parpadea en rojo y tiembla. Aparece "Incorrecto" junto con la respuesta correcta. Comienza una ventana de recuperacion de 2.5 segundos -- responde correctamente dentro de la ventana para obtener credito parcial.
6. Despues de la retroalimentacion, el juego avanza automaticamente a la siguiente nota (con una variacion aleatoria de +/-200ms).
7. Despues de 10 respuestas correctas, aparece el modal de **Nivel Completado** con tu puntuacion, estadisticas detalladas y una constelacion de las notas respondidas.
8. Elige **Reintentar** para repetir la misma leccion o **Siguiente Leccion` para avanzar (bloqueada hasta alcanzar la maestria).

### Configuracion

- **Selector de notacion**: Cambia entre americano (C, D, E) y latino (Do, Re, Mi) desde el selector en la barra de herramientas.
- **Mostrar nota**: Activa/desactiva el nombre de la nota debajo de la cabeza en el pentagrama.
- **Temporizador**: Activa un cronometro que registra tiempo total y tiempo de respuesta por nota.
- **Silenciar**: Boton de volumen en ScoreDisplay para silenciar el audio y activar el modo "teatro de sueno".

### Lecciones

Usa el menu desplegable en la barra de herramientas para cambiar de leccion en cualquier momento. Los puntos indicadores de rango en el extremo izquierdo del pentagrama muestran las notas mas baja y mas alta del pool de la leccion actual.

---

## Lecciones

| # | ID | Nombre | Notas | Descripcion |
|---|----|--------|-------|-------------|
| 1 | `lines` | Lineas | E4, G4, B4, D5, F5 | Notas en las lineas del pentagrama |
| 2 | `spaces` | Espacios | F4, A4, C5, E5 | Notas en los espacios del pentagrama |
| 3 | `lines-spaces` | Lineas+Espacios | E4-A5 | Lineas y espacios combinados |
| 4 | `staff-range` | Rango del pentagrama | C4-E5 | Rango completo del pentagrama (C4 a E5) |
| 5 | `below-staff` | Debajo del pentagrama | C4, D4 | Lineas adicionales debajo del pentagrama (region del Do central) |
| 6 | `above-staff` | Encima del pentagrama | G5, A5, B5, C6 | Lineas adicionales encima del pentagrama |
| 7 | `full-naturals` | Naturales completas | C4-C6 (solo naturales) | Todas las notas naturales en el rango completo |
| 8 | `accidentals` | Sostenidos | C4-C6 (todas) | Introduce sostenidos |
| 9 | `all-notes` | Todas las notas | C4-C6 (todas) | Rango cromatico completo, clave de sol |

---

## Reglas del Juego

- **Objetivo de sesion**: 10 respuestas correctas completan un nivel.
- **Puntuacion**: La precision se calcula como `correctAttempts / totalAttempts * 100`. Cada acierto otorga 10 + (racha * 2) puntos.
- **Calificacion de estrellas**: 3 estrellas para 90%+ de precision, 2 estrellas para 70%+, 1 estrella para 50%+, 0 estrellas por debajo del 50%.
- **Maestria**: Cada leccion tiene requisitos de precision, racha minima y numero de notas para desbloquear la siguiente leccion.
- **Rachas**: Las respuestas correctas consecutivas incrementan el contador de racha. Una respuesta incorrecta lo reinicia a 0. La mejor racha de la sesion se registra.
- **Recuperacion**: Despues de una respuesta incorrecta, el juego permanece en modo de retroalimentacion durante 2.5 segundos. Una barra de temporizador cuenta visualmente hacia atras. Presionar la tecla correcta durante esta ventana marca la respuesta como correcta (recuperacion exitosa) y otorga credito.
- **Saltar**: El boton "Siguiente Nota" permite avanzar mas alla de la pantalla de retroalimentacion en cualquier momento.
- **Avance automatico**: El juego pasa automaticamente a la siguiente nota despues de la ventana de retroalimentacion. El tiempo incluye una variacion aleatoria de +/-200ms para evitar la dependencia ritmica.
- **Seleccion de notas**: Aleatoria dentro del pool de la leccion. Se evitan repeticiones consecutivas cuando el pool tiene mas de una nota.

---

## Arquitectura

### Maquina de Estados del Juego

El juego utiliza un patron reducer a traves del hook `useGameState`. La maquina de estados tiene cuatro fases:

```
idle -> waiting -> feedback -> levelComplete
                -> waiting (auto-advance)
```

- **idle**: Estado inicial. Solo se muestra el boton "Iniciar Juego".
- **waiting**: Se muestra una nota en el pentagrama. El jugador debe presionar la tecla correcta. Se acepta entrada MIDI y del teclado en pantalla.
- **feedback**: Muestra el resultado (correcto/incorrecto). Si es incorrecto, `recovering` se establece en `true` durante 2.5 segundos, durante los cuales se puede presionar la tecla correcta para credito de recuperacion. Avanza automaticamente despues de un tiempo de espera con variacion.
- **levelComplete**: Despues de 10 respuestas correctas. Muestra puntuacion, estrellas, estadisticas, maestria y la superposicion de constelacion.

El estado se gestiona mediante `useState` con un objeto `GameState` inmutable. Todas las transiciones de estado ocurren a traves de funciones nombradas (`startGame`, `submitAnswer`, `nextNote`, `restartGame`).

### Jerarquia de Componentes

```
<App>
  <ConcertCurtains />        # Cortinas SVG del escenario
  <Spotlight />              # Foco radial de luz
  <OrnateFrame>              # Marco ornamental dorado
    <Toolbar />              # Selector de leccion, mostrar nota, temporizador
    <Staff />                # Pentagrama SVG, nota, notas fantasma, puntos de rango
    <ProgressBar />          # Patito nadador, progreso de sesion
    <StreakBadge />          # Contador de racha de fuego
    <StreakOwl />            # SVG de buho animado
    <ScoreDisplay />         # Porcentaje de precision + boton mute
    <HitRipple />            # Efecto de onda expandiendose
    <ScoreFlyUp />           # Texto flotante de puntos
    <PianoKeyboard />        # Teclado interactivo de 37 teclas
    <Feedback />             # Banner de correcto/incorrecto + temporizador de recuperacion
  </OrnateFrame>
  <LevelComplete />          # Superposicion de nivel completado
  <Confetti />               # Particulas de confeti CSS
  <ParticleCanvas />         # Canvas de particulas de luz
  <ProgressChart />          # Grafico de precision de sesiones anteriores
  <ThemeToggle />            # Alternador de modo oscuro sol/luna
</App>
```

### Escenario de Concierto

La interfaz se ambienta como un escenario teatral:

- **ConcertCurtains**: Telon SVG en la parte superior con ondulaciones y flecos dorados. Cortinas laterales que se abren/cierran con animaciones CSS. Colores controlados por variables CSS `--curtain-primary`, `--curtain-fold`, `--gold`.
- **Spotlight**: Overlay de gradiente radial que intensifica la iluminacion durante las fases de retroalimentacion y nivel completado.
- **OrnateFrame**: Envolvente del area del pentagrama con esquinas SVG decorativas doradas y una barra superior ornamental.
- **Orbes bokeh**: Circulos de gradiente flotantes con animaciones CSS que simulan efectos de iluminaria teatral.

### Sistema de Sonido

El hook `useSound` crea un unico `AudioContext` (inicializado perezosamente en la primera interaccion del usuario para cumplir con las politicas de reproduccion automatica del navegador). Cada nota se sintetiza con cinco osciladores:

- **Fundamental** (onda triangular, ganancia 1.0)
- **Armonicos 2-5** (ondas sinusoidales, ganancia decreciente)

Esto produce un timbre similar al piano. Los efectos de sonido utilizan arpegios de acordes:

| Efecto | Notas | Descripcion |
|--------|-------|-------------|
| Reproduccion de nota | La nota en si | Se reproduce cuando aparece una nota en el pentagrama |
| Correcto | C5-E5-G5 | Acorde mayor, arpegio escalonado |
| Incorrecto | C5-Eb5-G5 | Acorde menor, arpegio escalonado |
| Hito de racha | C5-D5-E5-G5-C6 | Fragmento de escala ascendente en multiplos de 5 de racha |
| Nivel completado | C5-E5-G5-C6 | Fanfarria con fundamental + armonico de octava |

### Entrada MIDI

El hook `useMidi` solicita `MIDIAccess` a traves de la Web MIDI API. Itera sobre todas las entradas conectadas, adjunta manejadores `onmidimessage` y filtra eventos de nota activada (`0x90` byte de estado con velocity > 0). El evento `onstatechange` reconecta las entradas cuando los dispositivos se conectan o desconectan. El hook devuelve un booleano `midiConnected` para el indicador de estado.

### Persistencia

- **Sesiones**: `sessionHistory.ts` guarda las ultimas 20 sesiones en localStorage con accuracy, numero de notas, leccion y fecha.
- **Progresion**: El nivel de leccion seleccionado se persiste en localStorage.
- **Tema**: La preferencia de tema (claro/oscuro) se guarda en `GameState.theme` y se restaura desde `prefers-color-scheme` en la carga inicial.

---

## Temas (Theming)

La aplicacion soporta temas claro y oscuro mediante un enfoque basado en clases CSS:

- Una clase `.dark` en `<html>` alterna el tema.
- Las propiedades personalizadas CSS (valores HSL) definen todos los colores en `:root` (claro) y `.dark` (oscuro).
- La variante `dark:` de Tailwind aplica estilos especificos del tema.
- El componente `Staff` usa una variable CSS `--staff-line` para el color de la tinta (marron en claro, pizarra en oscuro).
- La preferencia de tema persiste en el campo `GameState.theme` y se inicializa desde `prefers-color-scheme`.
- La transicion entre temas activa una animacion de "teatro crepuscular" de 1.5 segundos con un gran sol brillante (claro) o luna (oscuro) que aparece y desaparece. El fondo se funde suavemente mediante `transition-colors duration-300`.

### Variables CSS del Tema

| Variable | Claro | Oscuro |
|----------|-------|--------|
| `--background` | Amber-50 calido (#FFF7ED) | Gray-900 (#111827) |
| `--primary` | Red-600 (#DC2626) | Red-600 (#DC2626) |
| `--staff-line` | Marron (#4B3F2B) | Slate-300 (#CBD5E1) |
| `--card` | Blanco (#FFFFFF) | Gray-800 (#1F2937) |
| `--curtain-primary` | Rojo teatro (#8B0000) | Rojo oscuro (#4A0000) |
| `--curtain-fold` | Rojo claro (#B22222) | Rojo medio (#6B1A1A) |
| `--gold` | Dorado (#D4AF37) | Dorado oscuro (#B8960C) |
| `--ivory` | Marfil (#FFFFF0) | -- |
| `--ebony` | Ebano (#2C1A0E) | -- |

---

## Contribuir

Las contribuciones son bienvenidas. Por favor, sigue estas pautas:

1. Abre un issue para discutir los cambios propuestos antes de enviar un PR.
2. Manten el estilo de codigo existente (TypeScript modo estricto, componentes funcionales, hooks).
3. Si anades una funcionalidad, actualiza o anade el componente relevante. Asegurate de que las transiciones de estado en `useGameState` sean coherentes.
4. Prueba la entrada MIDI si modificas el hook `useMidi` o el flujo de envio de respuestas.
5. Ejecuta `npm run build` para verificar la compilacion de TypeScript y la compilacion de produccion.

---

## Licencia

MIT

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
