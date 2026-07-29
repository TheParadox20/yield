import { STRATEGIES, UNITS, UNIT_KEYS, STRATEGY_KEYS } from './data.js'

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const nf = new Intl.NumberFormat('en-KE')

export const num = (n) => nf.format(Math.round(n))
export const kes = (n) => `KES ${num(n)}`
export const pct = (n) => `${n.toFixed(1)}%`

/** Compact money for tight cells: 6.9M, 1.62M, 145,000. */
export const kesM = (n) => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`
  return kes(n)
}

/* ---------- readout animation ---------- */

const anims = new WeakMap()

/** Counts an element from its last value to `to`. Format decides the text. */
export const countUp = (el, to, format = num) => {
  const from = Number(el.dataset.value ?? to)
  el.dataset.value = to
  if (reducedMotion || from === to) {
    el.textContent = format(to)
    return
  }
  cancelAnimationFrame(anims.get(el))
  const start = performance.now()
  const ease = (t) => 1 - Math.pow(1 - t, 3)
  const tick = (now) => {
    const p = Math.min((now - start) / 520, 1)
    el.textContent = format(from + (to - from) * ease(p))
    if (p < 1) anims.set(el, requestAnimationFrame(tick))
  }
  anims.set(el, requestAnimationFrame(tick))
}

/* ---------- pill groups ---------- */

/** Wires a group of aria-pressed buttons to a change handler. */
export const pillGroup = (group, key, onChange) => {
  group?.addEventListener('click', (event) => {
    const btn = event.target.closest(`[data-${key}]`)
    if (!btn || btn.getAttribute('aria-pressed') === 'true') return
    group.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false')
    btn.setAttribute('aria-pressed', 'true')
    onChange(btn.dataset[key])
  })
}

const PILL_BASE =
  'yc-pill flex h-[46px] items-center rounded-full border border-[#a4a4a4] px-5 ' +
  'text-[clamp(0.9rem,1vw,1rem)] font-medium text-body transition-colors duration-300 hover:border-navy'

export const pill = (key, value, label, pressed, extra = '') =>
  `<button type="button" data-${key}="${value}" aria-pressed="${pressed}" class="${PILL_BASE} ${extra}">${label}</button>`

/** Residence pills. Provisional typologies get a gold dot. */
export const unitPills = (selected, keys = UNIT_KEYS) =>
  keys
    .map((k) => {
      const dot = UNITS[k].provisional
        ? ' <span class="ml-2 h-[6px] w-[6px] shrink-0 rounded-full bg-gold" title="Indicative pricing — pending client confirmation"></span>'
        : ''
      return pill('unit', k, `${UNITS[k].label}${dot}`, k === selected)
    })
    .join('')

export const strategyPills = (selected, keys = STRATEGY_KEYS) =>
  keys.map((k) => pill('strategy', k, STRATEGIES[k].label, k === selected)).join('')

/* ---------- section chrome ---------- */

/** The label block that introduces each variation. */
export const variantHeader = ({ letter, name, headline, best, answers }) => `
  <p class="reveal text-sm font-medium uppercase tracking-[0.18em] text-gold">Variation ${letter} &middot; ${name}</p>
  <h2 class="reveal mt-3 text-[clamp(1.65rem,2.43vw,2.1875rem)] font-bold text-black">${headline}</h2>
  <div class="reveal mt-4 grid max-w-[900px] gap-2 text-[clamp(0.95rem,1.15vw,1.0625rem)] leading-7 text-body">
    <p><span class="font-medium text-navy">Use it when:</span> ${best}</p>
    <p><span class="font-medium text-navy">Answers:</span> ${answers}</p>
  </div>`

/* ---------- scroll reveals ---------- */

export const observeReveals = (root = document) => {
  const targets = root.querySelectorAll('.reveal, .reveal-stagger')
  if (reducedMotion) {
    targets.forEach((t) => t.classList.add('is-visible'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        io.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  )
  targets.forEach((t) => io.observe(t))
}
