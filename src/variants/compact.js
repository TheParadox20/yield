import { STRATEGIES, STRATEGY_KEYS, UNITS, UNIT_KEYS, project } from '../lib/data.js'
import { countUp, kes, pillGroup, pct } from '../lib/dom.js'

/* Variation D — a card small enough to sit in the hero, a sidebar or a sticky
 * mobile footer. One number, one sentence, one button. Rendered twice below so
 * the light and on-navy treatments can be judged together. */

const card = (theme) => {
  const dark = theme === 'dark'
  const shell = dark
    ? 'bg-navy text-white'
    : 'bg-white text-body shadow-[0_18px_45px_-24px_rgba(25,40,59,0.45)] ring-1 ring-black/10'
  const label = dark ? 'text-white/60' : 'text-body/60'
  const strong = dark ? 'text-white' : 'text-navy'
  const rule = dark ? 'bg-gold/70' : 'bg-navy/15'
  const field = dark
    ? 'border-white/25 bg-white/5 text-white'
    : 'border-[#a4a4a4] bg-white text-navy'

  return `
  <div data-card="${theme}" class="w-full max-w-[420px] rounded-2xl px-6 py-7 ${shell}">
    <p class="text-sm font-medium uppercase tracking-[0.16em] ${dark ? 'text-gold' : 'text-gold'}">Projected returns</p>

    <label class="mt-5 block">
      <span class="text-sm font-medium ${label}">Residence</span>
      <select data-input="unit" class="yc-select mt-2 h-[46px] w-full rounded-lg border px-4 text-base font-medium outline-none ${field}">
        ${UNIT_KEYS.map((k) => `<option value="${k}">${UNITS[k].label} &middot; ${UNITS[k].size.toLocaleString('en-KE')} sqft</option>`).join('')}
      </select>
    </label>

    <div class="mt-5">
      <span class="text-sm font-medium ${label}">Let as</span>
      <div data-group="strategy" role="group" aria-label="Letting strategy"
           class="mt-2 grid grid-cols-3 gap-1 rounded-full p-1 ${dark ? 'bg-white/10' : 'bg-black/[0.06]'}">
        ${STRATEGY_KEYS.map((k, i) => `
          <button type="button" data-strategy="${k}" aria-pressed="${i === 1}"
                  class="yc-seg h-[38px] rounded-full text-[0.8rem] font-medium transition-colors duration-300 ${dark ? 'text-white/70' : 'text-body/70'}">
            ${STRATEGIES[k].short}
          </button>`).join('')}
      </div>
    </div>

    <div class="my-6 h-[2px] w-full ${rule}" aria-hidden="true"></div>

    <p class="text-sm font-medium ${label}">Net income, year one</p>
    <p class="mt-1 flex items-end gap-2">
      <span data-out="net" class="yc-figure text-[2.6rem] font-bold leading-none text-gold">&mdash;</span>
      <span class="pb-1 text-sm font-medium ${label}">/ year</span>
    </p>

    <dl class="mt-5 grid grid-cols-2 gap-4 text-sm">
      <div>
        <dt class="${label}">From</dt>
        <dd data-out="price" class="yc-figure mt-[2px] font-bold ${strong}">&mdash;</dd>
      </div>
      <div>
        <dt class="${label}">Net yield</dt>
        <dd data-out="yield" class="yc-figure mt-[2px] font-bold ${strong}">&mdash;</dd>
      </div>
    </dl>

    <button type="button" data-invest
            class="mt-6 inline-flex h-[48px] w-full items-center justify-center gap-3 rounded-full text-base font-medium transition-colors duration-300 ${dark ? 'bg-gold text-white hover:bg-white hover:text-navy' : 'bg-navy text-white hover:bg-gold'}">
      Talk to us
      <svg width="26" height="10" viewBox="0 0 26 10" fill="none" aria-hidden="true">
        <path d="M0 5h24M20.5 1 25 5l-4.5 4" stroke="currentColor" stroke-width="1.2" />
      </svg>
    </button>

    <p class="mt-4 text-xs leading-5 ${dark ? 'text-white/45' : 'text-body/50'}">
      Estimate after service charge and letting costs, before income tax. Full assumptions on request.
    </p>
  </div>`
}

const html = `
  <div class="reveal mt-12 grid gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-12">
    <div class="flex flex-col items-center gap-5 rounded-2xl bg-[#faf9f7] px-5 py-10 ring-1 ring-black/10">
      ${card('light')}
      <p class="max-w-[420px] text-center text-sm leading-6 text-body/60">On a light section — beside the hero copy or in a residence page sidebar.</p>
    </div>
    <div class="flex flex-col items-center gap-5 rounded-2xl bg-navy px-5 py-10">
      ${card('dark')}
      <p class="max-w-[420px] text-center text-sm leading-6 text-white/55">On navy — over a render, or as a sticky panel on mobile.</p>
    </div>
  </div>`

const initCard = (scope) => {
  const out = (name) => scope.querySelector(`[data-out="${name}"]`)
  const select = scope.querySelector('[data-input="unit"]')

  let unit = UNIT_KEYS[0]
  let strategy = 'furnished'

  const render = () => {
    const p = project(unit, strategy)
    out('price').textContent = kes(p.unit.price)
    out('yield').textContent = pct(p.netYield)
    countUp(out('net'), p.netAnnual, (v) => `KES ${(v / 1_000_000).toFixed(2)}M`)
  }

  select.addEventListener('change', () => {
    unit = select.value
    render()
  })
  pillGroup(scope.querySelector('[data-group="strategy"]'), 'strategy', (v) => {
    strategy = v
    render()
  })

  render()
}

export default {
  id: 'compact',
  letter: 'D',
  name: 'Compact',
  headline: 'The whole thing in one card',
  best: 'the calculator should not own a whole section — put it next to the hero, in a sidebar, or sticky on mobile.',
  answers: 'question 4, in the strongest way: the toggle is the interface, and it defaults to the credible long-let figure.',
  html,
  init: (root) => root.querySelectorAll('[data-card]').forEach(initCard),
}
