# Lectura Musical al Piano

> Un juego de entrenamiento de lectura musical a primera vista para piano. Aparece una nota en el pentagrama y el jugador debe presionar la tecla correcta, ya sea en un teclado MIDI conectado o en el piano en pantalla.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Screenshot](screenshot.png)
<!-- Reemplazar screenshot.png con una captura del juego en accion. Incluir el pentagrama, el teclado en pantalla, las cortinas y el marco ornamentado para una vista previa rapida. -->

---

## Caracteristicas

### Juego y Progresion
- **9 lecciones progresivas** -- Desde lineas simples hasta el rango cromatico completo (C4-C6). Cada leccion apunta a una region o concepto especifico. Ver [tabla de lecciones](#lecciones).
- **Sistema de racha** -- Las respuestas correctas consecutivas construyen una racha. Una insignia de buho aparece al alcanzar 3+ racha, intensificandose visualmente en 5, 8 y 10. Los hitos de racha reproducen una escala ascendente celebratoria.
- **Racha diaria** -- Seguimiento de racha por dia via localStorage. Se mantiene si practicas dias consecutivos.
- **Ventana de recuperacion** -- Despues de una respuesta incorrecta, el juego entra en una ventana de recuperacion de 2.5 segundos con barra de cuenta atras visual. Responder correctamente dentro de la ventana otorga credito parcial.
- **Modo temporizado** -- Activa un contador regresivo por nota en la barra de herramientas. Muestra cuenta atras en el panel de puntuacion. El indicador se vuelve rojo y pulsa cuando quedan 2 segundos.
- **Notas fantasma** -- La ultima nota correcta se muestra como cabeza de nota fantasma traslucida en el pentagrama despues de un error, ayudando al jugador a visualizar la diferencia.
- **Barra de progreso con patito nadador** -- Un patito se desliza a lo largo de una barra de progreso gradientada que muestra el conteo actual hacia el objetivo de 10 notas por sesion.
- **Animacion oro-pulso** -- Animacion especial al alcanzar 50% y 75% de progreso.
- **Pantalla de nivel completado** -- Despues de 10 respuestas correctas, un modal muestra: porcentaje de precision, mejor racha, total de notas, tiempo transcurrido, tiempo de respuesta promedio, mejor tiempo, calificacion de estrellas (1-3) y una constelacion SVG que dibuja lineas entre los valores MIDI de las notas respondidas.
- **Confeti** -- Efecto de particulas de confeti en respuestas correctas.

### Entrada y Sonido
- **Entrada MIDI** -- Conecta cualquier teclado USB/MIDI via la Web MIDI API. El juego detecta dispositivos conectados automaticamente y muestra el estado de conexion.
- **Piano en pantalla** -- Piano interactivo con efecto 3D (box-shadow, teclas marfil/ebano, detalles dorados). Teclas con cursor pointer y efecto sparkle en aciertos. En movil se reducen a rango C3-C5.
- **Sintesis de sonido** -- Construida con la Web Audio API. Cada nota se reproduce con armonicos superpuestos (onda triangular + sinusoidal). Respuestas correctas activan arpegio de acorde mayor, incorrectas acorde menor, finalizacion de nivel fanfarria.
- **Tiempo de respuesta** -- Seguimiento del tiempo que tarda el jugador en responder cada nota. Se muestra en el modal de nivel completado.

### Visuales y Tema Sala de Conciertos
- **Cortinas de concierto** -- Cortinas de teatro con SVG valance, borlas y animacion de apertura/cierre al iniciar sesion. Altura 40px en movil.
- **Marco ornamentado** -- Marco decorativo con esquinas doradas que envuelve el pentagrama.
- **Foco de escenario** -- Superposicion de foco radial con gradiente que se activa durante feedback y nivel completado.
- **Fondo sala de conciertos** -- Tema oscuro con maderas oscuras, paleta ambar/dorada. Particulas de luz (stage-motes) flotando en la escena.
- **Pentagrama SVG** -- Clave de sol (𝄞) y clave de fa (𝄢) con fuente Noto Music (reemplaza SVG paths). Cabeza de nota, plica, lineas adicionales y alteraciones. Intervalos etiquetados en el pentagrama. viewBox responsivo.
- **Buho animado** -- SVG de buho con animacion de balanceo (owl-bob keyframe) y estados de animo: somnoliento, neutral, feliz, emocionado. Siempre visible.
- **Progreso historico** -- ProgressChart: mini grafico SVG que muestra las ultimas 20 sesiones desde localStorage. Persistencia de historial de sesiones.
- **Modo oscuro / Claro** -- Alternador de tema con icono de sol/luna. Transicion con animacion de "teatro crepuscular" (sol o luna brillante). Respeta `prefers-color-scheme`.
- **Silencio / Teatro de sueno** -- Silenciar el audio oscurece la interfaz, muestra indicadores "Zzz" flotantes y animacion de balanceo en la clave. Pentagrama se oscurece al 70%.

### Sistema de Notacion
- **Selector de notacion** -- Menu desplegable junto al boton de silencio. Alterna entre notacion americana (C D E F G A B) y latina (Do Re Mi Fa Sol La Si).
- **Nombres de nota en pentagrama** -- Se muestra el nombre de la nota en la cabeza de nota (configurable). Por defecto desactivado (`showNoteName: false`).
- **Consejos de error con notacion** -- Los mensajes de error usan la notacion activa.

### Accesibilidad y Movil
- **Accesibilidad** -- Regiones ARIA live anuncian aciertos/fallos e hitos de racha. Piano navegable por teclado. SVG del pentagrama con `aria-label` descriptivo. Respeta `prefers-reduced-motion`.
- **Adaptacion movil** -- Barra de stats compacta. Correccion touch-action. Teclas reducidas a C3-C5 en movil. Cortinas con altura reducida.
- **Toast feedback** -- Componente Feedback con banner visual correcto/incorrecto + toast + temporizador.

### PWA
- **Aplicacion Web Progresiva** -- `manifest.json` con icono SVG. Service worker para soporte offline. Instalable como aplicacion.

---

## Tecnologias

| Tecnologia | Proposito |
|---|---|
| [React 18](https://react.dev) | Framework de interfaz de usuario |
| [TypeScript](https://www.typescriptlang.org) | Seguridad de tipos |
| [Vite](https://vitejs.dev) | Herramienta de compilacion y servidor de desarrollo |
| [Tailwind CSS](https://tailwindcss.com) | Estilos utilitarios |
| [shadcn/ui](https://ui.shadcn.com) | Primitivas Select y Checkbox basadas en Radix |
| [Noto Music](https://fonts.google.com/noto/specimen/Noto+Music) | Fuente para simbolos musicales Unicode (𝄞 𝄢) |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Sintesis y reproduccion de sonido |
| [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API) | Entrada de teclado MIDI |
| SVG | Renderizado de pentagrama, cortinas, grafico de progreso, confeti |
| PWA | Manifest + Service Worker para instalacion y offline |

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
│   ├── manifest.json           # Manifest PWA
│   ├── pwa-icon.svg            # Icono PWA
│   └── sw.js                   # Service worker offline
├── src/
│   ├── main.tsx                # Punto de entrada de React
│   ├── App.tsx                 # Componente raiz: orquestacion del juego, estado, efectos
│   ├── index.css               # Directivas de Tailwind, variables CSS (claro/oscuro), keyframes, stage-motes
│   ├── types/
│   │   └── index.ts            # Definiciones de tipos Note, GameState, GamePhase, Notation
│   ├── data/
│   │   └── lessons.ts          # Definiciones de lecciones (9 lecciones, pools de notas MIDI)
│   ├── hooks/
│   │   ├── useDailyStreak.ts   # Racha diaria persistente en localStorage
│   │   ├── useGameState.ts     # Reducer de estado del juego (fase, puntuacion, recuperacion, racha, notacion, temporizador)
│   │   ├── useMidi.ts          # Conexion Web MIDI API y manejo de eventos
│   │   └── useSound.ts         # Sintesis de osciladores Web Audio (notas, efectos, fanfarria)
│   ├── utils/
│   │   ├── errorAnalysis.ts    # Analisis de errores y consejos
│   │   ├── midiToNote.ts       # Conversion de numero MIDI a objeto Note
│   │   ├── notation.ts         # Mapeo americano (C D E) ↔ latino (Do Re Mi)
│   │   ├── noteToPosition.ts   # Mapeo de nota a posicion Y en SVG (clave de sol/fa)
│   │   ├── sessionHistory.ts   # Historial de sesiones en localStorage
│   │   └── weakPool.ts         # Pool de notas debiles
│   ├── lib/
│   │   └── utils.ts            # Utilidad cn() (clsx + tailwind-merge)
│   └── components/
│       ├── ConcertCurtains.tsx # Cortinas de teatro con SVG valance, borlas, animacion
│       ├── Confetti.tsx        # Particulas de confeti
│       ├── Feedback.tsx        # Banner correcto/incorrecto + toast + temporizador
│       ├── LevelComplete.tsx   # Modal de puntuacion + constelacion + stats de sesion
│       ├── OrnateFrame.tsx     # Marco decorativo con esquinas doradas
│       ├── PianoKeyboard.tsx   # Piano interactivo 3D con teclas marfil/ebano
│       ├── ProgressBar.tsx     # Barra de progreso con patito y animacion oro-pulso
│       ├── ProgressChart.tsx   # Mini grafico SVG de progreso historico
│       ├── ScoreDisplay.tsx    # Precision con barra de color + temporizador
│       ├── Spotlight.tsx       # Foco radial de escenario
│       ├── Staff.tsx           # Pentagrama SVG con clave Unicode, notas, fantasmas, intervalos
│       ├── StreakBadge.tsx     # Insignia de racha
│       ├── StreakOwl.tsx       # Buho SVG animado con estados de animo
│       ├── ThemeToggle.tsx     # Alternador claro/oscuro
│       ├── Toolbar.tsx         # Selector de lecciones + mostrar nota + temporizador
│       └── ui/
│           ├── select.tsx      # Select Radix
│           └── checkbox.tsx    # Checkbox Radix
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

1. Haz clic en **Iniciar Juego** para comenzar una sesion. Las cortinas de concierto se abren.
2. Aparece una nota en el pentagrama. La nota se reproduce auditivamente.
3. Identifica la nota y presiona la tecla correspondiente en tu teclado MIDI o en el piano en pantalla.
4. **Correcto**: El pentagrama parpadea en verde, aparece "¡Correcto!" y suena un arpegio de acorde mayor. Confeti se activa. La tecla del piano muestra un efecto sparkle.
5. **Incorrecto**: El pentagrama parpadea en rojo y tiembla. Aparece "Incorrecto" junto con la respuesta correcta y un consejo. Comienza una ventana de recuperacion de 2.5 segundos. La ultima nota correcta aparece como fantasma en el pentagrama.
6. Despues de la retroalimentacion, el juego avanza automaticamente a la siguiente nota (con variacion aleatoria de +/-200ms).
7. Despues de 10 respuestas correctas, aparece el modal de **Nivel Completado** con puntuacion, estrellas, tiempo de respuesta promedio y constelacion de notas respondidas.
8. Elige **Reintentar** para repetir la misma leccion o **Siguiente Leccion** para avanzar.

### Modo Temporizado

Activa el checkbox "Temporizador" en la barra de herramientas para activar el modo con cuenta atras. Cada nota tiene un limite de tiempo para responder. El temporizador se muestra en el panel de puntuacion.

### Selector de Notacion

Usa el menu desplegable de notacion (junto al boton de silencio) para alternar entre:
- **Americana**: C, D, E, F, G, A, B
- **Latina**: Do, Re, Mi, Fa, Sol, La, Si

La notacion seleccionada afecta los nombres de nota en el pentagrama y los consejos de error. Se persiste en localStorage.

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
- **Puntuacion**: La precision se calcula como `correctAttempts / totalAttempts * 100`.
- **Calificacion de estrellas**: 3 estrellas para 90%+ de precision, 2 estrellas para 70%+, 1 estrella para 50%+, 0 estrellas por debajo del 50%.
- **Rachas**: Las respuestas correctas consecutivas incrementan el contador de racha. Una respuesta incorrecta lo reinicia a 0. La mejor racha de la sesion se registra.
- **Modo temporizado**: Activa un contador regresivo por nota. Si el tiempo se agota, se cuenta como incorrecto.
- **Recuperacion**: Despues de una respuesta incorrecta, el juego permanece en modo de retroalimentacion durante 2.5 segundos. Una barra de temporizador cuenta visualmente hacia atras. Presionar la tecla correcta durante esta ventana marca la respuesta como correcta (recuperacion exitosa) y otorga credito.
- **Saltar**: El boton "Siguiente Nota" permite avanzar mas alla de la pantalla de retroalimentacion en cualquier momento.
- **Avance automatico**: El juego pasa automaticamente a la siguiente nota despues de la ventana de retroalimentacion. El tiempo incluye una variacion aleatoria de +/-200ms para evitar la dependencia ritmica.
- **Seleccion de notas**: Aleatoria dentro del pool de la leccion. Se evitan repeticiones consecutivas cuando el pool tiene mas de una nota.

---

## Temas Sala de Conciertos

El juego presenta una estetica de teatro/sala de conciertos que envuelve toda la experiencia:

### Cortinas de Concierto (ConcertCurtains)
- Cortinas laterales SVG con valance (dosel) decorativo en la parte superior.
- Borlas colgantes con cuerda de retorno.
- Animacion de apertura al iniciar sesion y cierre al volver al idle.
- Adaptacion movil: altura de valance reducida a 40px.

### Marco Ornamentado (OrnateFrame)
- Marco decorativo alrededor del pentagrama con esquinas doradas ornamentales.
- Envuelve el area del pentagrama dandole presencia escenica.

### Foco de Escenario (Spotlight)
- Superposicion con gradiente radial que simula un foco de teatro.
- Se activa durante el feedback y la pantalla de nivel completado.

### Particulas de Luz (Stage-motes)
- Elementos flotantes CSS que simulan particulas de luz en el ambiente.
- Definidos en `index.css` con animaciones de flotacion.

### Paleta de Colores
- Fondos oscuros con tonos maderados y paleta ambar/dorado.
- Teclas de piano en marfil y ebano con acentos dorados.
- Coherente con los temas claro y oscuro.

---

## Arquitectura

### Maquina de Estados del Juego

El juego utiliza un patron reducer a traves del hook `useGameState`. La maquina de estados tiene cuatro fases:

```
idle -> waiting -> feedback -> levelComplete
                -> waiting (auto-advance)
```

- **idle**: Estado inicial. Solo se muestra el boton "Iniciar Juego". Cortinas cerradas.
- **waiting**: Se muestra una nota en el pentagrama. El jugador debe presionar la tecla correcta. Se acepta entrada MIDI y del teclado en pantalla.
- **feedback**: Muestra el resultado (correcto/incorrecto). Si es incorrecto, `recovering` se establece en `true` durante 2.5 segundos, durante los cuales se puede presionar la tecla correcta para credito de recuperacion. Avanza automaticamente despues de un tiempo de espera con variacion.
- **levelComplete**: Despues de 10 respuestas correctas. Muestra puntuacion, estrellas, estadisticas (incluyendo tiempo de respuesta) y la superposicion de constelacion.

El estado se gestiona mediante `useState` con un objeto `GameState` inmutable. Todas las transiciones de estado ocurren a traves de funciones nombradas (`startGame`, `submitAnswer`, `nextNote`, `restartGame`).

### Jerarquia de Componentes

```
<App>
  <ConcertCurtains />          (apertura/cierre al iniciar)
  <Spotlight />                (foco radial en feedback/levelComplete)
  <Confetti />                 (particulas en aciertos)
  <LevelComplete />            (modal, phase === 'levelComplete')
  <Toolbar />                  (selector leccion + mostrar nota + temporizador)
  <ThemeToggle />              (alternador claro/oscuro)
  <NotationSelector />         (alternador americana/latina, en barra)
  <OrnateFrame>                (marco decorativo)
    <Staff />                  (pentagrama SVG, nota, fantasma, intervalos)
  </OrnateFrame>
  <ProgressBar />              (patito nadador, progreso sesion)
  <ProgressChart />            (mini grafico historico)
  <StreakBadge />              (contador racha fuego)
  <StreakOwl />                (SVG buho con estados de animo)
  <ScoreDisplay />             (precision + temporizador)
  <PianoKeyboard />            (teclado 3D interactivo)
  <Feedback />                 (banner correcto/incorrecto + toast)
```

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

---

## Temas (Theming)

La aplicacion soporta temas claro y oscuro mediante un enfoque basado en clases CSS:

- Una clase `.dark` en `<html>` alterna el tema.
- Las propiedades personalizadas CSS (valores HSL) definen todos los colores en `:root` (claro) y `.dark` (oscuro).
- La variante `dark:` de Tailwind aplica estilos especificos del tema.
- El componente `Staff` usa una variable CSS `--staff-line` para el color de la tinta (marron en claro, pizarra en oscuro).
- La preferencia de tema persiste en el campo `GameState.theme` y se inicializa desde `prefers-color-scheme`.
- La transicion entre temas activa una animacion de "teatro crepuscular" de 1.5 segundos con un gran sol brillante (claro) o luna (oscuro) que aparece y desaparece. El fondo se funde suavemente mediante `transition-colors duration-300`.

### Variables CSS

| Variable | Claro | Oscuro |
|----------|-------|--------|
| `--background` | Amber-50 calido (#FFF7ED) | Gray-900 (#111827) |
| `--primary` | Red-600 (#DC2626) | Red-600 (#DC2626) |
| `--staff-line` | Marron (#4B3F2B) | Slate-300 (#CBD5E1) |
| `--card` | Blanco (#FFFFFF) | Gray-800 (#1F2937) |

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
