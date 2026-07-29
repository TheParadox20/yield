import { DEFAULTS, STRATEGIES, isShortStay, project } from '../lib/data.js'
import { countUp, kes, pct, pillGroup, strategyPills, unitPills } from '../lib/dom.js'

/* Variation B — every deduction on screen and adjustable.
 * The point of this one is that the buyer can see where the headline number
 * goes, and that the sales team can defend it line by line. */

const range = (key, label, min, max, step, value, suffix) => `
  <label class="block">
    <span class="flex items-baseline justify-between gap-3">
      <span class="text-sm font-medium text-navy">${label}</span>
      <span data-val="${key}" class="yc-figure text-sm font-bold text-navy">${value}${suffix}</span>
    </span>
    <input type="range" data-input="${key}" min="${min}" max="${max}" step="${step}" value="${value}"
           class="yc-range mt-2 w-full" />
  </label>`

const money = (key, label, value) => `
  <label class="block">
    <span class="text-sm font-medium text-navy">${label}</span>
    <span class="mt-2 flex h-[46px] items-center gap-2 rounded-lg border border-[#a4a4a4] px-4 focus-within:border-navy">
      <span class="text-sm text-body/60">KES</span>
      <input type="number" data-input="${key}" value="${value}" min="0" step="1000"
             class="yc-figure w-full bg-transparent text-base font-medium text-navy outline-none" />
      <span class="text-sm text-body/60">/mo</span>
    </span>
  </label>`

const check = (key, label, checked, note = '') => `
  <label class="flex cursor-pointer items-start gap-3">
    <input type="checkbox" data-input="${key}" ${checked ? 'checked' : ''} class="yc-check mt-[3px] h-[18px] w-[18px] shrink-0" />
    <span>
      <span class="text-sm font-medium text-navy">${label}</span>
      ${note ? `<span class="mt-1 block text-xs leading-5 text-body/60">${note}</span>` : ''}
    </span>
  </label>`

const html = `
  <div class="reveal-stagger mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
    <div class="flex flex-col gap-9">
      <div>
        <p class="text-base font-bold text-navy">Choose your residence</p>
        <div data-group="unit" class="mt-4 flex flex-wrap gap-3" role="group" aria-label="Residence type">
          ${unitPills('mini')}
        </div>
      </div>

      <div>
        <p class="text-base font-bold text-navy">Choose a letting strategy</p>
        <div data-group="strategy" class="mt-4 flex flex-wrap gap-3" role="group" aria-label="Letting strategy">
          ${strategyPills('furnished')}
        </div>
      </div>

      <div class="rounded-2xl border border-black/15 bg-[#faf9f7] px-6 py-7 md:px-8">
        <p class="text-base font-bold text-navy">Assumptions</p>
        <p class="mt-2 text-sm leading-6 text-body/70">
          Drag any of these to see how sensitive the return is. Defaults are our placeholders, not the client's numbers.
        </p>

        <div data-panel="airbnb">
          <div class="mt-6 grid gap-6 sm:grid-cols-2">
          ${range('occupancy', 'Occupancy', 40, 95, 1, DEFAULTS.occupancy, '%')}
          ${range('platformFee', 'Airbnb platform fee', 0, 25, 0.5, DEFAULTS.platformFee, '%')}
          ${range('stayMgmtFee', 'Short-stay management fee', 0, 35, 1, DEFAULTS.stayMgmtFee, '%')}
          <div class="hidden sm:block"></div>
          ${money('utilities', 'Utilities, wifi, DSTV', DEFAULTS.utilities)}
          ${money('consumables', 'Cleaning &amp; consumables', DEFAULTS.consumables)}
          <div class="sm:col-span-2">
            ${check('rentIsNet', 'The sheet figure is already net of empty nights and platform fees', DEFAULTS.rentIsNet, 'Unresolved with the client. Leave unticked and the figure is treated as the gross total at full occupancy — which is the more conservative reading.')}
          </div>
          </div>
        </div>

        <div data-panel="longlet" class="hidden">
          <div class="mt-6 grid gap-6 sm:grid-cols-2">
          ${range('voidMonths', 'Empty months per year', 0, 3, 0.5, DEFAULTS.voidMonths, ' mo')}
          ${range('lettingFee', 'Letting &amp; management fee', 0, 15, 0.5, DEFAULTS.lettingFee, '%')}
          ${money('repairs', 'Repairs &amp; maintenance', DEFAULTS.repairs)}
          </div>
        </div>

        <div class="mt-7 grid gap-5 border-t border-black/10 pt-6">
          ${check('includeFurnishing', 'Count furnishing as money invested', DEFAULTS.includeFurnishing, 'Priced at KES 1,800/sqft furnished and KES 2,400/sqft for short-stay. Confirm whether the unit is sold furnished.')}
          ${check('deductTax', 'Deduct rental income tax at 7.5% of gross', DEFAULTS.deductTax, 'Kenyan Monthly Rental Income tax is a final tax on gross residential rent in the 288k&ndash;15M/year band. Short-stay is often taxed as business income instead — confirm with a tax adviser.')}
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <div class="rounded-2xl bg-navy px-7 py-9 text-white shadow-xl md:px-10 md:py-11">
        <p class="text-base font-medium text-white/70">Net yield on total cash invested</p>
        <p class="mt-2 flex items-end gap-2">
          <span data-out="netYield" class="yc-figure text-[clamp(3.25rem,6vw,4.75rem)] font-bold leading-none text-gold">0.0%</span>
          <span class="pb-2 text-base font-medium text-white/60">per year</span>
        </p>

        <div class="mt-7 grid grid-cols-2 gap-4">
          <div class="rounded-xl bg-white/5 px-4 py-3">
            <p class="text-xs font-medium uppercase tracking-wide text-white/50">Sheet headline</p>
            <p data-out="headlineYield" class="yc-figure mt-1 text-lg font-bold text-white/85">0.0%</p>
          </div>
          <div class="rounded-xl bg-white/5 px-4 py-3">
            <p class="text-xs font-medium uppercase tracking-wide text-white/50">Expected gross</p>
            <p data-out="grossYield" class="yc-figure mt-1 text-lg font-bold text-white/85">0.0%</p>
          </div>
        </div>

        <div class="my-8 h-[3px] w-full bg-gold/70" aria-hidden="true"></div>

        <p class="text-sm font-medium uppercase tracking-wide text-white/55">Year one, line by line</p>
        <dl data-out="waterfall" class="mt-4 grid gap-[10px] text-[0.95rem]"></dl>

        <div class="mt-7 grid gap-2 border-t border-white/15 pt-6 text-sm">
          <div class="flex items-baseline justify-between gap-4">
            <span class="text-white/60">Purchase price</span>
            <span data-out="price" class="yc-figure font-medium">&mdash;</span>
          </div>
          <div class="flex items-baseline justify-between gap-4">
            <span class="text-white/60">Stamp duty &amp; legal (5.5%)</span>
            <span data-out="acq" class="yc-figure font-medium">&mdash;</span>
          </div>
          <div class="flex items-baseline justify-between gap-4">
            <span class="text-white/60">Furnishing</span>
            <span data-out="furnish" class="yc-figure font-medium">&mdash;</span>
          </div>
          <div class="mt-2 flex items-baseline justify-between gap-4 border-t border-white/10 pt-3">
            <span class="font-medium text-white">Total invested</span>
            <span data-out="invested" class="yc-figure font-bold text-gold">&mdash;</span>
          </div>
        </div>
      </div>

      <p data-out="summary" class="rounded-2xl border border-black/15 bg-[#faf9f7] px-6 py-5 text-base leading-7 text-body md:px-8"></p>
    </div>
  </div>`

const init = (root) => {
  const out = (name) => root.querySelector(`[data-out="${name}"]`)
  const panels = {
    airbnb: root.querySelector('[data-panel="airbnb"]'),
    longlet: root.querySelector('[data-panel="longlet"]'),
  }

  let unit = 'mini'
  let strategy = 'furnished'
  const opts = { ...DEFAULTS }

  /* One row of the waterfall. Negative amounts render in a warmer white. */
  const row = (label, amount, { strong = false, sub = '' } = {}) => `
    <div class="flex items-baseline justify-between gap-4 ${strong ? 'border-t border-white/15 pt-3 mt-1' : ''}">
      <span class="${strong ? 'font-medium text-white' : 'text-white/65'}">
        ${label}${sub ? `<span class="ml-1 text-white/40">${sub}</span>` : ''}
      </span>
      <span class="yc-figure shrink-0 ${strong ? 'font-bold text-gold' : amount < 0 ? 'text-white/70' : 'font-medium'}">
        ${amount < 0 ? `&minus; ${kes(-amount)}` : kes(amount)}
      </span>
    </div>`

  const render = () => {
    const p = project(unit, strategy, opts)
    const shortStay = isShortStay(strategy)

    const lines = shortStay
      ? [
          row('Gross potential', p.annualPotential, { sub: `(${kes(p.listedMonthly)}/mo &times; 12)` }),
          ...(opts.rentIsNet ? [] : [row('Empty nights', p.achievedGross - p.annualPotential, { sub: `(${opts.occupancy}% occupancy)` })]),
          ...(p.platformCost ? [row('Airbnb platform fee', -p.platformCost, { sub: `(${opts.platformFee}%)` })] : []),
          row('Short-stay management', -p.mgmtCost, { sub: `(${opts.stayMgmtFee}%)` }),
          row('Service charge', -p.scCost),
          row('Utilities &amp; consumables', -p.otherOpex),
          ...(p.taxCost ? [row('Rental income tax', -p.taxCost, { sub: `(${opts.taxRate}%)` })] : []),
          row('Net annual income', p.netAnnual, { strong: true }),
        ]
      : [
          row('Gross potential', p.annualPotential, { sub: `(${kes(p.listedMonthly)}/mo &times; 12)` }),
          ...(p.voidCost ? [row('Void allowance', -p.voidCost, { sub: `(${opts.voidMonths} mo)` })] : []),
          ...(p.lettingCost ? [row('Letting &amp; management', -p.lettingCost, { sub: `(${opts.lettingFee}%)` })] : []),
          row('Service charge', -p.scCost),
          row('Repairs &amp; maintenance', -p.otherOpex),
          ...(p.taxCost ? [row('Rental income tax', -p.taxCost, { sub: `(${opts.taxRate}%)` })] : []),
          row('Net annual income', p.netAnnual, { strong: true }),
        ]

    out('waterfall').innerHTML = lines.join('')
    out('price').textContent = kes(p.unit.price)
    out('acq').textContent = kes(p.acquisition)
    out('furnish').textContent = p.furnishing ? kes(p.furnishing) : '—'
    out('invested').textContent = kes(p.totalInvested)

    countUp(out('netYield'), p.netYield, (v) => `${v.toFixed(1)}%`)
    out('headlineYield').textContent = pct(p.headlineYield)
    out('grossYield').textContent = pct(p.grossYield)

    const gap = p.headlineYield - p.netYield
    out('summary').innerHTML =
      `A <strong class="font-medium text-navy">${p.unit.label}</strong> on ${STRATEGIES[strategy].sentence} clears about ` +
      `<strong class="font-medium text-navy">${kes(p.netMonthly)} a month</strong> after every running cost — ` +
      `<strong class="font-medium text-navy">${pct(p.netYield)}</strong> on the ${kes(p.totalInvested)} actually invested. ` +
      `That is <strong class="font-medium text-navy">${gap.toFixed(1)} points</strong> below the ${pct(p.headlineYield)} the rental schedule implies.`
  }

  const showPanels = () => {
    const shortStay = isShortStay(strategy)
    panels.airbnb.classList.toggle('hidden', !shortStay)
    panels.longlet.classList.toggle('hidden', shortStay)
  }

  pillGroup(root.querySelector('[data-group="unit"]'), 'unit', (v) => {
    unit = v
    render()
  })
  pillGroup(root.querySelector('[data-group="strategy"]'), 'strategy', (v) => {
    strategy = v
    showPanels()
    render()
  })

  root.querySelectorAll('[data-input]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.input
      if (input.type === 'checkbox') {
        opts[key] = input.checked
      } else {
        opts[key] = Number(input.value) || 0
        const readout = root.querySelector(`[data-val="${key}"]`)
        if (readout) {
          /* keep the slider's own label in step with the thumb */
          const suffix = key === 'voidMonths' ? ' mo' : '%'
          readout.textContent = `${opts[key]}${suffix}`
        }
      }
      render()
    })
  })

  showPanels()
  render()
}

export default {
  id: 'transparent',
  letter: 'B',
  name: 'Transparent',
  headline: 'What you actually keep',
  best: 'the audience is an investor who will do this arithmetic themselves anyway. Defaults to long-let furnished, so short-stay becomes the upside they discover.',
  answers: 'questions 5, 6 and 8 — every recurring cost is a visible, adjustable line, and the occupancy question is a switch instead of a guess.',
  html,
  init,
}
