import './style.css'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Scroll reveals ---------- */
const revealTargets = document.querySelectorAll('.reveal, .reveal-stagger')

if (reducedMotion) {
  revealTargets.forEach((t) => t.classList.add('is-visible'))
} else {
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
  revealTargets.forEach((t) => io.observe(t))
}

/* ---------- Yield calculator ---------- */
const yieldSection = document.getElementById('returns')

if (yieldSection) {
  // Source figures from the "Expected Rental Returns" schedule.
  // rent = gross monthly rent per strategy; sc = monthly service charge.
  // Loft, Duplex and Penthouse are our placeholders — replace once the client
  // confirms pricing, and drop the gold dot from their pills when they do.
  const DATA = {
    mini: { label: 'Mini 1 Bed', size: 396, price: 6_900_000, sc: 10_000, rent: { unfurnished: 70_000, furnished: 120_000, airbnb: 145_000 } },
    one: { label: '1 Bed', size: 576, price: 9_800_000, sc: 10_000, rent: { unfurnished: 90_000, furnished: 150_000, airbnb: 180_000 } },
    two: { label: '2 Bed', size: 1130, price: 15_000_000, sc: 15_000, rent: { unfurnished: 130_000, furnished: 190_000, airbnb: 290_000 } },
    loft: { label: 'Loft', size: 780, price: 12_500_000, sc: 12_000, rent: { unfurnished: 110_000, furnished: 165_000, airbnb: 230_000 } },
    duplex: { label: 'Duplex', size: 1650, price: 22_000_000, sc: 20_000, rent: { unfurnished: 180_000, furnished: 250_000, airbnb: 360_000 } },
    penthouse: { label: 'Penthouse', size: 2400, price: 38_000_000, sc: 30_000, rent: { unfurnished: 300_000, furnished: 420_000, airbnb: 600_000 } },
  }
  const STRATEGY_LABEL = {
    unfurnished: 'long-term (unfurnished)',
    furnished: 'long-term (furnished)',
    airbnb: 'short-stay',
  }

  const nf = new Intl.NumberFormat('en-KE')
  const kes = (n) => `KES ${nf.format(Math.round(n))}`

  const typologyGroup = document.getElementById('yc-typology')
  const strategyGroup = document.getElementById('yc-strategy')
  const el = {
    size: document.getElementById('yc-size'),
    yield: document.getElementById('yc-yield'),
    price: document.getElementById('yc-price'),
    monthly: document.getElementById('yc-monthly'),
    sc: document.getElementById('yc-sc'),
    net: document.getElementById('yc-net'),
    summary: document.getElementById('yc-summary'),
  }

  let typology = 'mini'
  let strategy = 'airbnb'
  let yieldAnim = null

  const selected = (group) => group.querySelector('[aria-pressed="true"]')

  const setPressed = (group, button) => {
    selected(group)?.setAttribute('aria-pressed', 'false')
    button.setAttribute('aria-pressed', 'true')
  }

  // Count the headline yield from its current value to the new one for a little polish.
  const animateYield = (to) => {
    if (reducedMotion) {
      el.yield.textContent = `${to.toFixed(1)}%`
      return
    }
    const from = parseFloat(el.yield.textContent) || 0
    const duration = 500
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)
    const startTime = performance.now()
    if (yieldAnim) cancelAnimationFrame(yieldAnim)
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      el.yield.textContent = `${(from + (to - from) * easeOut(progress)).toFixed(1)}%`
      if (progress < 1) yieldAnim = requestAnimationFrame(tick)
    }
    yieldAnim = requestAnimationFrame(tick)
  }

  const render = () => {
    const unit = DATA[typology]
    const monthly = unit.rent[strategy]
    const annualGross = monthly * 12
    const netAnnual = (monthly - unit.sc) * 12
    const grossYield = (annualGross / unit.price) * 100

    el.size.textContent = `${nf.format(unit.size)} sqft`
    el.price.textContent = kes(unit.price)
    el.monthly.textContent = kes(monthly)
    el.sc.innerHTML = `&minus; ${kes(unit.sc)}/mo`
    el.net.textContent = kes(netAnnual)
    el.summary.innerHTML =
      `A <strong class="font-medium text-white">${unit.label}</strong> on ${STRATEGY_LABEL[strategy]} could earn about ` +
      `<strong class="font-medium text-gold">${kes(netAnnual)}</strong> a year after service charge.`
    animateYield(grossYield)
  }

  typologyGroup?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-typology]')
    if (!btn) return
    typology = btn.dataset.typology
    setPressed(typologyGroup, btn)
    render()
  })

  strategyGroup?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-strategy]')
    if (!btn) return
    strategy = btn.dataset.strategy
    setPressed(strategyGroup, btn)
    render()
  })

  render()
}
