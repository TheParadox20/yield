import { STRATEGIES, UNITS, project } from '../lib/data.js'
import { countUp, kes, pillGroup, strategyPills, unitPills } from '../lib/dom.js'

/* Variation A — a faithful port of the section on the landing page, extended
 * to all six typologies. Deliberately unchanged in behaviour so the client can
 * compare it against the alternatives on like-for-like terms. */

const html = `
  <div class="reveal-stagger mt-12 grid gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-14">
    <div class="flex flex-col gap-10">
      <div>
        <p class="text-base font-bold text-navy">Choose your residence</p>
        <div data-group="unit" class="mt-4 flex flex-wrap gap-3" role="group" aria-label="Residence type">
          ${unitPills('mini')}
        </div>
        <p class="mt-4 text-base text-body/70">
          Average size <span data-out="size" class="yc-figure font-medium text-navy">396 sqft</span>
        </p>
      </div>

      <div>
        <p class="text-base font-bold text-navy">Choose a letting strategy</p>
        <div data-group="strategy" class="mt-4 flex flex-wrap gap-3" role="group" aria-label="Letting strategy">
          ${strategyPills('airbnb')}
        </div>
      </div>

      <p class="max-w-[520px] text-sm leading-6 text-body/60">
        Figures are taken directly from the developer's rental schedule, before income tax and before
        letting or management fees. The monthly service charge is shown separately. Actual returns vary.
      </p>
    </div>

    <div class="rounded-2xl bg-navy px-7 py-9 text-white shadow-xl md:px-10 md:py-11">
      <p class="text-base font-medium text-white/70">Projected gross yield</p>
      <p class="mt-2 flex items-end gap-2">
        <span data-out="yield" class="yc-figure text-[clamp(3.25rem,6vw,4.75rem)] font-bold leading-none text-gold">25.2%</span>
        <span class="pb-2 text-base font-medium text-white/60">per year</span>
      </p>

      <div class="my-8 h-[3px] w-full bg-gold/70" aria-hidden="true"></div>

      <dl class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div>
          <dt class="text-sm font-medium uppercase tracking-wide text-white/55">Purchase price</dt>
          <dd data-out="price" class="yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold">KES 6,900,000</dd>
        </div>
        <div>
          <dt class="text-sm font-medium uppercase tracking-wide text-white/55">Monthly income</dt>
          <dd data-out="monthly" class="yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold">KES 145,000</dd>
        </div>
        <div>
          <dt class="text-sm font-medium uppercase tracking-wide text-white/55">Service charge</dt>
          <dd data-out="sc" class="yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold text-white/80">&minus; KES 10,000/mo</dd>
        </div>
        <div>
          <dt class="text-sm font-medium uppercase tracking-wide text-white/55">Net annual income</dt>
          <dd data-out="net" class="yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold text-gold">KES 1,620,000</dd>
        </div>
      </dl>

      <p data-out="summary" class="mt-8 border-t border-white/15 pt-6 text-base leading-7 text-white/80"></p>
    </div>
  </div>

  <div class="reveal mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:mt-14">
    <p class="max-w-[560px] text-base leading-7 text-body">
      Ready to make it yours? Our team will walk you through pricing, availability and payment plans.
    </p>
    <button type="button" data-invest class="inline-flex h-[52px] shrink-0 items-center justify-center gap-3 rounded-full bg-navy px-8 text-base font-medium text-white transition-colors duration-300 hover:bg-gold">
      Invest Now
      <svg width="26" height="10" viewBox="0 0 26 10" fill="none" aria-hidden="true">
        <path d="M0 5h24M20.5 1 25 5l-4.5 4" stroke="currentColor" stroke-width="1.2" />
      </svg>
    </button>
  </div>`

const init = (root) => {
  const out = (name) => root.querySelector(`[data-out="${name}"]`)
  const el = {
    size: out('size'),
    yield: out('yield'),
    price: out('price'),
    monthly: out('monthly'),
    sc: out('sc'),
    net: out('net'),
    summary: out('summary'),
  }

  let unit = 'mini'
  let strategy = 'airbnb'

  const render = () => {
    /* The landing page's original arithmetic: sticker rent, service charge, nothing else. */
    const u = UNITS[unit]
    const monthly = u.rent[strategy]
    const p = project(unit, strategy)

    el.size.textContent = `${u.size.toLocaleString('en-KE')} sqft`
    el.price.textContent = kes(u.price)
    el.monthly.textContent = kes(monthly)
    el.sc.innerHTML = `&minus; ${kes(u.sc)}/mo`
    el.net.textContent = kes((monthly - u.sc) * 12)
    el.summary.innerHTML =
      `A <strong class="font-medium text-white">${u.label}</strong> on ${STRATEGIES[strategy].sentence} could earn about ` +
      `<strong class="font-medium text-gold">${kes((monthly - u.sc) * 12)}</strong> a year after service charge.`
    countUp(el.yield, p.headlineYield, (v) => `${v.toFixed(1)}%`)
  }

  pillGroup(root.querySelector('[data-group="unit"]'), 'unit', (v) => {
    unit = v
    render()
  })
  pillGroup(root.querySelector('[data-group="strategy"]'), 'strategy', (v) => {
    strategy = v
    render()
  })

  render()
}

export default {
  id: 'classic',
  letter: 'A',
  name: 'Classic',
  headline: 'Calculate Your Returns',
  best: 'you want the section already signed off on the landing page, just completed to all six residences.',
  answers: 'question 3 (every typology present). Nothing else — it reports the sheet as written.',
  html,
  init,
}
