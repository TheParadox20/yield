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

/* ---------- Bulk acquisition return calculator ----------
   Every figure here traces to 97alta_bulk_returnmodel.xlsx, sheet
   "DO NOT CHANGE Bulk Returns Mode". Cell references are noted against each
   input so the two can be reconciled when the client revises the model.
   The workbook covers three typologies only, so this calculator does too.
*/
const returnsSection = document.getElementById('returns')

if (returnsSection) {
  // price = mid-floor list price (row 9); sc = annual service charge (row 32);
  // adr = nightly rate in USD (row 29); longLet = monthly rent unfurnished (row 39);
  // furniture = one-off cost per unit — client revision of Aug 2026 (800K / 1M / 1.2M),
  // superseding row 38. Size is off the sales sheet, not the model.
  const DATA = {
    mini: { label: 'Mini 1 Bed', size: 396, price: 7_000_000, sc: 120_000, adr: 70, longLet: 70_000, furniture: 800_000 },
    one: { label: '1 Bed', size: 576, price: 10_200_000, sc: 120_000, adr: 80, longLet: 90_000, furniture: 1_000_000 },
    two: { label: '2 Bed', size: 1130, price: 15_000_000, sc: 180_000, adr: 100, longLet: 130_000, furniture: 1_200_000 },
  }

  const MODEL = {
    fx: 130, // C30 — KES per USD
    daysPerYear: 365, // C31
    variableCosts: 0.28, // C33 — platform + management + cleaning, share of gross
    longLetMgmt: 0.1, // C40
    escalation: 0.05, // C34 — rental escalation p.a.
    constructionUplift: 0.15, // C43 — gross appreciation to Practical Completion
    postCompletionPa: 0.07, // C44
    holdYears: 3, // C45
    acquisitionRate: 0.05, // C24 — 4% stamp duty + 1% legal/SC
    depositRate: 0.3, // minimum deposit on signing, share of offer price
    deploymentMonth: 3, // weighted capital deployment (30% on signing, 70% over 6 months)
    exitMonth: 72, // 36-month build + 3-year hold
  }

  // C20 keys the discount off total list value, before any discount is applied.
  // Below the first floor there is no bulk discount at all.
  const TIERS = [
    { floor: 30_000_000, discount: 0.1 },
    { floor: 40_000_000, discount: 0.15 },
    { floor: 50_000_000, discount: 0.2 },
    { floor: 100_000_000, discount: 0.25 },
  ]

  const STRATEGY_LABEL = {
    furnished: 'short-stay',
    unfurnished: 'long-term (unfurnished)',
  }

  const nf = new Intl.NumberFormat('en-KE')
  const kes = (n) => `KES ${nf.format(Math.round(n))}`
  // Tier hints read better in millions: "KES 2.4m short of the 25% tier".
  const kesShort = (n) => `KES ${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  // Reads the basket back as "2 × Mini 1 Bed, 3 × 1 Bed and 1 × 2 Bed".
  const listf = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

  const MAX_PER_TYPOLOGY = 20

  const basket = document.getElementById('yc-basket')
  const strategyGroup = document.getElementById('yc-strategy')
  const occupancyGroup = document.getElementById('yc-occupancy')
  const el = {
    totals: document.getElementById('yc-totals'),
    clear: document.getElementById('yc-clear'),
    tierNote: document.getElementById('yc-tier-note'),
    qtyNote: document.getElementById('yc-qty-note'),
    assumptions: document.getElementById('yc-assumptions'),
    return: document.getElementById('yc-return'),
    list: document.getElementById('yc-list'),
    offer: document.getElementById('yc-offer'),
    deposit: document.getElementById('yc-deposit'),
    furnitureCost: document.getElementById('yc-furniture'),
    acq: document.getElementById('yc-acq'),
    deployed: document.getElementById('yc-deployed'),
    rental: document.getElementById('yc-rental'),
    exit: document.getElementById('yc-exit'),
    profit: document.getElementById('yc-profit'),
    multiple: document.getElementById('yc-multiple'),
    summary: document.getElementById('yc-summary'),
  }

  // A buyer can take any mix of typologies, so quantity is held per typology.
  // The opening basket is the workbook's own sample mix.
  const counts = { mini: 2, one: 3, two: 1 }

  let strategy = 'furnished'
  let occupancy = 0.7
  let returnAnim = null

  const rows = new Map(
    [...basket.querySelectorAll('[data-typology]')].map((row) => [row.dataset.typology, row]),
  )
  const tiers = new Map(
    [...document.querySelectorAll('#yc-tiers [data-tier]')].map((li) => [Number(li.dataset.tier), li]),
  )

  const ASSUMPTIONS = {
    furnished:
      'Short-stay assumes nightly rates of USD 70 / 80 / 100 at KES 130 to the dollar, less 28% variable ' +
      'costs (platform, management and cleaning) and the annual service charge, with furniture deducted ' +
      'once. Rents escalate 5% a year across the three-year hold.',
    unfurnished:
      'Long-term assumes monthly rents of KES 70,000 / 90,000 / 130,000 less a 10% management fee and the ' +
      'annual service charge. No furniture is required. Rents escalate 5% a year across the three-year hold.',
  }

  const selected = (group) => group.querySelector('[aria-pressed="true"]')

  const setPressed = (group, button) => {
    selected(group)?.setAttribute('aria-pressed', 'false')
    button.setAttribute('aria-pressed', 'true')
  }

  const discountFor = (list) =>
    TIERS.reduce((applied, tier) => (list >= tier.floor ? tier.discount : applied), 0)

  // Rows 51-53: annual net rent per unit, after variable costs and service charge.
  const netAnnualRent = (unit) =>
    strategy === 'furnished'
      ? unit.adr * MODEL.daysPerYear * occupancy * MODEL.fx * (1 - MODEL.variableCosts) - unit.sc
      : unit.longLet * 12 * occupancy * (1 - MODEL.longLetMgmt) - unit.sc

  // Row 55: three years of rent escalating 5% a year, year one at the base rate.
  const escalatedOverHold = (annual) =>
    (annual * (Math.pow(1 + MODEL.escalation, MODEL.holdYears) - 1)) / MODEL.escalation

  const compute = () => {
    const chosen = Object.keys(DATA).filter((key) => counts[key] > 0)

    const basketTotals = chosen.reduce(
      (acc, key) => {
        const unit = DATA[key]
        const n = counts[key]
        acc.units += n
        acc.sqft += unit.size * n
        acc.list += unit.price * n // row 10
        acc.annualRent += netAnnualRent(unit) * n // row 54
        acc.furniture += unit.furniture * n // row 56
        return acc
      },
      { units: 0, sqft: 0, list: 0, annualRent: 0, furniture: 0 },
    )

    const { list } = basketTotals
    const discount = discountFor(list)
    const offer = list * (1 - discount) // C21
    const deposit = offer * MODEL.depositRate
    const acquisition = offer * MODEL.acquisitionRate // C24
    const deployed = offer + acquisition // C25

    // Furniture is a one-off deduction from rent, not part of cash deployed — as in the model.
    const furniture = strategy === 'furnished' ? basketTotals.furniture : 0
    const netRental = escalatedOverHold(basketTotals.annualRent) - furniture // row 57

    // C66: list carries the full uplift, so the discount is captured in the exit spread.
    const exitValue =
      list * (1 + MODEL.constructionUplift) * Math.pow(1 + MODEL.postCompletionPa, MODEL.holdYears)

    const totalIn = exitValue + netRental // row 75
    const profit = totalIn - deployed // row 76
    const multiple = deployed > 0 ? totalIn / deployed : 0 // row 77
    const holdPeriod = (MODEL.exitMonth - MODEL.deploymentMonth) / 12
    const returnPa = multiple > 0 ? Math.pow(multiple, 1 / holdPeriod) - 1 : 0 // row 78

    return {
      ...basketTotals,
      chosen,
      discount,
      saving: list - offer,
      offer,
      deposit,
      acquisition,
      deployed,
      netRental,
      exitValue,
      profit,
      multiple,
      returnPa,
    }
  }

  // Count the headline return from its current value to the new one for a little polish.
  const animateReturn = (to) => {
    if (reducedMotion) {
      el.return.textContent = `${to.toFixed(1)}%`
      return
    }
    const from = parseFloat(el.return.textContent) || 0
    const duration = 500
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)
    const startTime = performance.now()
    if (returnAnim) cancelAnimationFrame(returnAnim)
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      el.return.textContent = `${(from + (to - from) * easeOut(progress)).toFixed(1)}%`
      if (progress < 1) returnAnim = requestAnimationFrame(tick)
    }
    returnAnim = requestAnimationFrame(tick)
  }

  // How far the basket is from the next discount, so a near-miss is visible.
  const tierNote = (list, discount) => {
    if (list === 0) return 'Add a residence to see your discount.'
    const next = TIERS.find((tier) => list < tier.floor)
    const gap = next ? ` Add ${kesShort(next.floor - list)} of list value to reach ${next.discount * 100}%.` : ''
    return discount === 0
      ? `No bulk discount yet — tiers start at KES 30m of list value.${gap}`
      : `${discount * 100}% off list — a saving of ${kes(list - list * (1 - discount))}.${gap}`
  }

  const render = () => {
    const t = compute()
    const empty = t.units === 0
    const mix = listf.format(t.chosen.map((key) => `${counts[key]} × ${DATA[key].label}`))

    rows.forEach((row, key) => {
      const n = counts[key]
      row.dataset.active = n > 0 ? 'true' : 'false'
      // The count is a live region — only touch it when it actually changed, or every
      // render re-announces all three rows.
      const count = row.querySelector('[data-row-count]')
      if (count.textContent !== String(n)) count.textContent = String(n)
      row.querySelector('[data-row-size]').textContent = `${nf.format(DATA[key].size)} sqft`
      row.querySelector('[data-row-price]').textContent = kes(DATA[key].price)
      row.querySelector('[data-step="-1"]').disabled = n === 0
      row.querySelector('[data-step="1"]').disabled = n >= MAX_PER_TYPOLOGY
    })

    tiers.forEach((li, rate) => {
      li.dataset.active = rate === t.discount ? 'true' : 'false'
    })

    el.totals.textContent = empty
      ? 'Nothing selected yet'
      : `${t.units} ${t.units === 1 ? 'unit' : 'units'} · ${nf.format(t.sqft)} sqft`
    el.clear.hidden = empty
    el.tierNote.textContent = tierNote(t.list, t.discount)
    el.assumptions.textContent = ASSUMPTIONS[strategy]

    el.list.textContent = kes(t.list)
    el.offer.textContent = kes(t.offer)
    el.deposit.textContent = kes(t.deposit)
    el.furnitureCost.textContent = strategy === 'furnished' ? kes(t.furniture) : 'None required'
    el.acq.innerHTML = `+ ${kes(t.acquisition)}`
    el.deployed.textContent = kes(t.deployed)
    el.rental.textContent = kes(t.netRental)
    el.exit.textContent = kes(t.exitValue)
    el.profit.textContent = kes(t.profit)
    el.multiple.innerHTML = empty ? '—' : `${t.multiple.toFixed(2)}&times;`

    el.qtyNote.innerHTML = empty
      ? 'Add a residence to see your totals.'
      : `Totals below are for <span class="yc-figure font-medium text-white/80">${mix}</span>.`

    el.summary.innerHTML = empty
      ? 'Pick at least one residence to see your projected return.'
      : `<strong class="font-medium text-white">${mix}</strong> on ${STRATEGY_LABEL[strategy]} at ` +
        `${occupancy * 100}% occupancy could return about ` +
        `<strong class="font-medium text-gold">${kes(t.profit)}</strong> in profit by Month 72.`

    animateReturn(t.returnPa * 100)
  }

  const setCount = (key, next) => {
    counts[key] = Math.min(Math.max(next, 0), MAX_PER_TYPOLOGY)
    render()
  }

  basket?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-step]')
    if (!btn) return
    const key = btn.closest('[data-typology]').dataset.typology
    setCount(key, counts[key] + Number(btn.dataset.step))
  })

  el.clear?.addEventListener('click', () => {
    Object.keys(counts).forEach((key) => (counts[key] = 0))
    render()
  })

  strategyGroup?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-strategy]')
    if (!btn) return
    strategy = btn.dataset.strategy
    setPressed(strategyGroup, btn)
    render()
  })

  occupancyGroup?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-occupancy]')
    if (!btn) return
    occupancy = Number(btn.dataset.occupancy)
    setPressed(occupancyGroup, btn)
    render()
  })

  render()
}
