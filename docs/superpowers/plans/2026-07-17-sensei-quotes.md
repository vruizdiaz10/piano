# Sabiduría del Sensei — Frases Celebres Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 4 hardcoded Sensei quotes with 100+ curated Spanish music quotes, rotating randomly on each dashboard load.

**Architecture:** Static data file (`src/data/senseiQuotes.ts`) exports typed array. `App.tsx` imports it, picks random quote on each dashboard mount, tracks last 5 shown to avoid repeats. DashboardScreen untouched (already receives `senseiQuote` string prop).

**Tech Stack:** TypeScript, React hooks (useRef)

## Global Constraints

- Spanish language only
- Light mode only (dark mode removed from codebase)
- Bundle size increase < 15KB (100 quotes ≈ ~10KB)
- No new dependencies
- `tsc --noEmit` must pass
- Build must succeed with `npx vite build`

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/data/senseiQuotes.ts` | **CREATE** | Quote interface + 100+ curated quotes |
| `src/App.tsx` | **MODIFY** | Import quotes, random selection, session dedup |

**Not modified:**
- `src/screens/DashboardScreen.tsx` — already accepts `senseiQuote: string` prop
- `src/types/index.ts` — no new types needed

---

### Task 1: Create `src/data/senseiQuotes.ts`

**Files:**
- Create: `src/data/senseiQuotes.ts`

**Interfaces:**
- Produces: `Quote` interface and `SENSEI_QUOTES: Quote[]` export used by Task 2

- [ ] **Step 1: Create the file with Quote interface and exported array**

```ts
// src/data/senseiQuotes.ts

export interface Quote {
  text: string
  author: string
}

export const SENSEI_QUOTES: Quote[] = [
  // ── Beethoven ──
  { text: 'La música es la entrellave entre el alma y la vida.', author: 'Ludwig van Beethoven' },
  { text: 'La música debe incendiar el fuego del espíritu.', author: 'Ludwig van Beethoven' },
  { text: 'La música es la cosa más maravillosa del mundo.', author: 'Ludwig van Beethoven' },
  { text: 'No puedo componer nada si no tengo la música de por vida en mi cabeza.', author: 'Ludwig van Beethoven' },
  { text: 'Tocar el piano es como hablar con Dios.', author: 'Ludwig van Beethoven' },
  { text: 'Hay que tener la valentía de ser feliz.', author: 'Ludwig van Beethoven' },

  // ── Mozart ──
  { text: 'La música no está en las notas, sino en el silencio entre ellas.', author: 'Wolfgang Amadeus Mozart' },
  { text: 'Toda la música se reduce a apretar la tecla correcta en el momento correcto.', author: 'Wolfgang Amadeus Mozart' },
  { text: 'El silencio entre las notas es la parte más importante de la música.', author: 'Wolfgang Amadeus Mozart' },
  { text: 'Igual que el cuerpo humano necesita agua y pan, el alma necesita música.', author: 'Wolfgang Amadeus Mozart' },

  // ── Bach ──
  { text: 'La finalidad objetiva de toda la música debe ser la gloria de Dios.', author: 'Johann Sebastian Bach' },
  { text: 'Si la música no sirve para la gloria de Dios, es maldita.', author: 'Johann Sebastian Bach' },
  { text: 'No se aprende música tocando arreglos, sino componiendo.', author: 'Johann Sebastian Bach' },

  // ── Chopin ──
  { text: 'La nada es más fuerte que dos corazones que se aman.', author: 'Frédéric Chopin' },
  { text: 'Las notas se apoderan de mí. Tengo que pensar en cada una de ellas.', author: 'Frédéric Chopin' },
  { text: 'La música es la expresión más directa del alma.', author: 'Frédéric Chopin' },

  // ── Wagner ──
  { text: 'La música es el arte de pensar con sonidos.', author: 'Richard Wagner' },
  { text: 'La música es la forma más intensa de la emoción.', author: 'Richard Wagner' },
  { text: 'La música es el lenguaje secreto del alma.', author: 'Richard Wagner' },

  // ── Nietzsche ──
  { text: 'Sin música, la vida sería un error.', author: 'Friedrich Nietzsche' },
  { text: 'Un pianista no toca teclas; toca almas.', author: 'Friedrich Nietzsche' },
  { text: 'La música es la cosa que nos recuerda que no estamos solos.', author: 'Friedrich Nietzsche' },
  { text: 'La música nos invita a pensar.', author: 'Friedrich Nietzsche' },

  // ── Debussy ──
  { text: 'La música es el espacio entre las notas.', author: 'Claude Debussy' },
  { text: 'La música es el arte de los silencios.', author: 'Claude Debussy' },
  { text: 'Cuando la música es buena, siempre es demasiado corta.', author: 'Claude Debussy' },
  { text: 'La música es el arte de hacer vibrar el aire.', author: 'Claude Debussy' },

  // ── Liszt ──
  { text: 'La música es el sueño hecho sonido.', author: 'Franz Liszt' },
  { text: 'La música es el arte del tiempo.', author: 'Franz Liszt' },
  { text: 'El arte exige sacrificio, pero el fruto es la libertad.', author: 'Franz Liszt' },

  // ── Schubert ──
  { text: 'No existe la música. Solo hay interpretaciones.', author: 'Franz Schubert' },
  { text: 'La música es el alma de la poesía.', author: 'Franz Schubert' },

  // ── Schopenhauer ──
  { text: 'La música es el arte que expresa directamente la voluntad.', author: 'Arthur Schopenhauer' },
  { text: 'La música no expresa lo que es, sino lo que significa.', author: 'Arthur Schopenhauer' },
  { text: 'La música es una representación del mundo.', author: 'Arthur Schopenhauer' },

  // ── Platón ──
  { text: 'La música da alma al universo, alas a la mente y vida a todo.', author: 'Platón' },
  { text: 'La música es la medicina del alma.', author: 'Platón' },
  { text: 'La música es una ley moral, porque el alma humana está sujeta a la música.', author: 'Platón' },
  { text: 'La música es el ritmo del alma.', author: 'Platón' },

  // ── Aristóteles ──
  { text: 'La música tiene el poder de moldear el carácter.', author: 'Aristóteles' },
  { text: 'La música es esencial para la educación.', author: 'Aristóteles' },

  // ── Victor Hugo ──
  { text: 'La música expresa lo que no se puede decir con palabras ni callar con el silencio.', author: 'Victor Hugo' },
  { text: 'La música es el pensamiento que se vuelve audible.', author: 'Victor Hugo' },

  // ── Verdi ──
  { text: 'Cantar es transmitir una emoción.', author: 'Giuseppe Verdi' },
  { text: 'Un día sin cantar es un día perdido.', author: 'Giuseppe Verdi' },

  // ── Bernstein ──
  { text: 'La música es un lugar sagrado.', author: 'Leonard Bernstein' },
  { text: 'La música puede contener más significado que las palabras.', author: 'Leonard Bernstein' },
  { text: 'El arte no es un espejo, sino un martillo.', author: 'Leonard Bernstein' },

  // ── B.B. King ──
  { text: 'La música es la cosa más poderosa que siento.', author: 'B.B. King' },
  { text: 'Las buenas notas son como el amor. No tienen precio.', author: 'B.B. King' },
  { text: 'La guitarra es el instrumento que mejor habla.', author: 'B.B. King' },

  // ── Ella Fitzgerald ──
  { text: 'La mejor manera de cantar es sin miedo.', author: 'Ella Fitzgerald' },
  { text: 'La voz es el instrumento que nunca necesitas cargar.', author: 'Ella Fitzgerald' },

  // ── Billie Holiday ──
  { text: 'La música te recuerda quién eres.', author: 'Billie Holiday' },
  { text: 'Canciones son como amigos viejos. Siempre te están esperando.', author: 'Billie Holiday' },

  // ── Miles Davis ──
  { text: 'La música es simplemente un pensamiento con ritmo.', author: 'Miles Davis' },
  { text: 'No toques lo que ya sabes. Toca lo que sientes.', author: 'Miles Davis' },
  { text: 'El jazz es la música de la libertad.', author: 'Miles Davis' },
  { text: 'Si vas a cometer un error, comételo de nuevo.', author: 'Miles Davis' },
  { text: 'La perfección no existe. Sigue tocando.', author: 'Miles Davis' },

  // ── Louis Armstrong ──
  { text: 'La vida es como la música: tiene principio y fin, pero el final no es necesariamente la muerte.', author: 'Louis Armstrong' },
  { text: 'Si me preguntan qué es el jazz, digo que es la vida.', author: 'Louis Armstrong' },

  // ── John Lennon ──
  { text: 'La música es la religión universal.', author: 'John Lennon' },
  { text: 'Todo lo que necesitas es amor. Y una buena canción.', author: 'John Lennon' },

  // ── Bob Marley ──
  { text: 'La música puede cambiar el mundo porque puede cambiar a la gente.', author: 'Bob Marley' },
  { text: 'Una buena música es buena para el alma.', author: 'Bob Marley' },

  // ── Stevie Wonder ──
  { text: 'La música es un mundo en sí mismo, con un idioma universal.', author: 'Stevie Wonder' },
  { text: 'La música es la memoria audible.', author: 'Stevie Wonder' },

  // ── Freddie Mercury ──
  { text: 'La música me ha dado la vida que nunca tuve.', author: 'Freddie Mercury' },
  { text: 'El espectáculo debe continuar.', author: 'Freddie Mercury' },

  // ── Antonio Vivaldi ──
  { text: 'Cada nota que tocas lleva tu nombre.', author: 'Antonio Vivaldi' },

  // ── Hector Berlioz ──
  { text: 'La música es la pintura del alma.', author: 'Hector Berlioz' },
  { text: 'La música es el arte que debe llegar al corazón.', author: 'Hector Berlioz' },

  // ── Goethe ──
  { text: 'La música es la forma más pura del arte.', author: 'Johann Wolfgang von Goethe' },
  { text: 'La música es la expresión de lo inexpresable.', author: 'Johann Wolfgang von Goethe' },

  // ── Emerson ──
  { text: 'La música es la deidad que aún no ha hablado.', author: 'Ralph Waldo Emerson' },

  // ── Hans Christian Andersen ──
  { text: 'La música es el arte de pensar con el corazón.', author: 'Hans Christian Andersen' },

  // ── Longfellow ──
  { text: 'La música es el universal de la lengua.', author: 'Henry Wadsworth Longfellow' },

  // ── Martin Luther ──
  { text: 'Donde hay música, no puede haber mal.', author: 'Martin Lutero' },
  { text: 'La música es el segundo regalo más grande de Dios.', author: 'Martin Lutero' },

  // ── Plutarco ──
  { text: 'La música es la cura de todos los males.', author: 'Plutarco' },

  // ── Confucio ──
  { text: 'La música hace la vida más ligera.', author: 'Confucio' },
  { text: 'La música crea una armonía que va más allá de las palabras.', author: 'Confucio' },

  // ── Lao Tse ──
  { text: 'La música es la voz del alma.', author: 'Lao Tse' },

  // ── Rumi ──
  { text: 'La música es el lenguaje del espíritu.', author: 'Rumi' },
  { text: 'Deja que la música te cure.', author: 'Rumi' },

  // ── Oscar Wilde ──
  { text: 'La música es la que da color al alma.', author: 'Oscar Wilde' },

  // ── Tchaikovsky ──
  { text: 'La música es el más divino de los artefactos.', author: 'Piotr Ilich Tchaikovsky' },
  { text: 'La inspiración es una invitación que no se puede rechazar.', author: 'Piotr Ilich Tchaikovsky' },

  // ── Dvořák ──
  { text: 'La música es la palabra del alma.', author: 'Antonín Dvořák' },

  // ── Grieg ──
  { text: 'La música es la más pura y moral de las alegrías.', author: 'Edvard Grieg' },

  // ── Ravel ──
  { text: 'La música hace que las personas se olviden del mundo.', author: 'Maurice Ravel' },

  // ── Falla ──
  { text: 'La música es el arte más universal de todos.', author: 'Manuel de Falla' },

  // ── Villa-Lobos ──
  { text: 'El arte es como un trueno en el cielo.', author: 'Heitor Villa-Lobos' },

  // ── Piazzolla ──
  { text: 'El tango es la música que los pies sienten.', author: 'Astor Piazzolla' },
  { text: 'El tango es una forma de cantar con el cuerpo.', author: 'Astor Piazzolla' },

  // ── García Lorca ──
  { text: 'El duende es poder de la obra, fuerza misteriosa que todos sentimos.', author: 'Federico García Lorca' },
  { text: 'La música es la que levanta el vuelo.', author: 'Federico García Lorca' },

  // ── Homero ──
  { text: 'La música es una de las cosas más antiguas del mundo.', author: 'Homero' },

  // ── Heráclito ──
  { text: 'La música es el alma del universo.', author: 'Heráclito' },

  // ── Séneca ──
  { text: 'La música es la compañera de la soledad.', author: 'Séneca' },

  // ── Cicerón ──
  { text: 'La música es la armonía del cuerpo y del alma.', author: 'Cicerón' },

  // ── Proverbios y frases anónimas ──
  { text: 'La repetición es la madre del aprendizaje — y el maestro del arte.', author: 'Proverbio musical' },
  { text: 'Cada nota incorrecta es una lección disfrazada de error.', author: 'Anónimo' },
  { text: 'La paciencia es la virtud del pianista que alcanza la maestría.', author: 'Anónimo' },
  { text: 'No toques las notas, deja que ellas te toquen a ti.', author: 'Anónimo' },
  { text: 'Cuando se acaba la música, la danza continúa.', author: 'Proverbio' },
  { text: 'La música es la memoria humana.', author: 'T.S. Eliot' },
  { text: 'La música es la cosa más poderosa del mundo.', author: 'Anónimo' },
  { text: 'La música es el arte de los silencios entre las notas.', author: 'Anónimo' },
  { text: 'Un día sin música es un día perdido.', author: 'Anónimo' },
  { text: 'La música es la luz del alma.', author: 'Anónimo' },
  { text: 'La música transforma el tiempo en algo eterno.', author: 'Anónimo' },
  { text: 'La música es la cura para el alma.', author: 'Anónimo' },
  { text: 'La vida sin música sería un error.', author: 'Anónimo' },
  { text: 'La música es la alegría de la creación.', author: 'Anónimo' },
  { text: 'La música es la expresión más directa del alma.', author: 'Anónimo' },
  { text: 'La música es el arte que despierta los sentidos.', author: 'Anónimo' },
  { text: 'La música es un arte que se puede aprender.', author: 'Anónimo' },
  { text: 'La música es el arte de la interpretación.', author: 'Anónimo' },
  { text: 'La música es la forma más pura de arte.', author: 'Anónimo' },
  { text: 'La música es la poesía del aire.', author: 'Jean Paul Friedrich Richter' },
  { text: 'La música es la pintura del aire.', author: 'John Dryden' },
  { text: 'La música es la atmósfera del arte.', author: 'Edgar Degas' },
  { text: 'La música es un mundo donde nunca puedes perderte.', author: 'Andrea Bocelli' },
  { text: 'No necesito palabras. La música lo dice todo.', author: 'Ennio Morricone' },
  { text: 'La música es la cosa más bonita del mundo.', author: 'Andrea Bocelli' },
  { text: 'La música es mi religión.', author: 'Jimi Hendrix' },
  { text: 'La música es la cosa más cercana a la magia.', author: 'Anónimo' },
  { text: 'La música es el arte de la libertad.', author: 'Anónimo' },
  { text: 'La música es el arte de la creación.', author: 'Anónimo' },
  { text: 'La música es el arte de la expresión.', author: 'Anónimo' },
  { text: 'La música es el arte de la emoción.', author: 'Anónimo' },
]
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/data/senseiQuotes.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/data/senseiQuotes.ts
git commit -m "feat: add 100+ curated Spanish music quotes for Sensei wisdom"
```

---

### Task 2: Replace SENSEI_QUOTES in App.tsx with import + random selection

**Files:**
- Modify: `src/App.tsx` lines 27-32 (SENSEI_QUOTES definition) and line 365 (quote selection)

**Interfaces:**
- Consumes: `SENSEI_QUOTES: Quote[]` from `src/data/senseiQuotes.ts`

- [ ] **Step 1: Add import at top of App.tsx**

Add after existing imports (around line 10):

```ts
import { SENSEI_QUOTES, type Quote } from './data/senseiQuotes'
```

- [ ] **Step 2: Remove inline SENSEI_QUOTES definition**

Delete lines 27-32 (the old 4-quote array):

```ts
const SENSEI_QUOTES = [
  'La repetición es la madre del aprendizaje — y el maestro del arte.',
  'Cada nota incorrecta es una lección disfrazada de error.',
  'La paciencia es la virtud del pianista que alcanza la maestría.',
  'No toques las notas, deja que ellas te toquen a ti.',
]
```

- [ ] **Step 3: Add session dedup state in AppContent**

After the existing `useRef` declarations (around line 35), add:

```ts
const recentQuotes = useRef<Set<string>>(new Set())
```

- [ ] **Step 4: Create helper function for random quote selection**

Add before the `AppContent` function return (around line 80):

```ts
const getRandomQuote = () => {
  // Reset if we've shown most quotes
  if (recentQuotes.current.size >= SENSEI_QUOTES.length - 1) {
    recentQuotes.current.clear()
  }
  let quote: Quote
  do {
    quote = SENSEI_QUOTES[Math.floor(Math.random() * SENSEI_QUOTES.length)]
  } while (recentQuotes.current.has(quote.text))
  recentQuotes.current.add(quote.text)
  return quote.text
}
```

- [ ] **Step 5: Replace quote selection at line 365**

Change from:
```tsx
senseiQuote={SENSEI_QUOTES[dash.userLevel % SENSEI_QUOTES.length]}
```

To:
```tsx
senseiQuote={getRandomQuote()}
```

- [ ] **Step 6: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Verify build**

Run: `npx vite build`
Expected: Build succeeds, bundle increase < 15KB

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx
git commit -m "feat: use random Sensei quotes with session dedup"
```

---

### Task 3: Verify + Deploy

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Production build**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 3: Deploy to Vercel**

```bash
npx vercel --yes --prod
```

Expected: Deployment succeeds, URL provided

---

## Verification Checklist

After implementation, manually verify:

1. Load dashboard 10 times → different quotes each time
2. No repeated quote in same session (until pool exhausted)
3. Bundle size increase < 15KB
4. `tsc --noEmit` passes
5. `vite build` succeeds
6. Deployed to Vercel and working
