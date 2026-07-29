import { STRATEGIES, STRATEGY_KEYS, UNITS, UNIT_KEYS, project } from '../lib/data.js'
import { kes, kesM, pct, pill, pillGroup } from '../lib/dom.js'

/* Variation E — no toggling at all. Every typology against every strategy in
 * one grid, so a buyer comparing options can scan instead of click. The best
 * cell in each row is marked, which quietly makes the short-stay case. */

const METRICS = {
  netYield: {
    label: 'Net yield',
    note: 'After service charge, letting and running costs, over price plus fees and furnishing.',
    value: (p) => p.netYield,
    format: (v) => pct(v),
  },
  headlineYield: {
    label: 'Gross yield',
    note: "Rent × 12 over the purchase price — the developer's schedule as written.",
    value: (p) => p.headlineYield,
    format: (v) => pct(v),
  },
  monthly: {
    label: 'Monthly income',
    note: 'Gross rent per month, straight from the rental schedule.',
    value: (p) => p.listedMonthly,
    format: (v) => kes(v),
  },
  netAnnual: {
    label: 'Net per year',
    note: 'What the owner keeps in year one, after every running cost.',
    value: (p) => p.netAnnual,
    format: (v) => kesM(v),
  },
}

const html = `
  <div class="reveal mt-10 flex flex-wrap items-center gap-3" data-group="metric" role="group" aria-label="Metric">
    ${Object.entries(METRICS).map(([k, m], i) => pill('metric', k, m.label, i === 0)).join('')}
  </div>
  <p data-out="note" class="reveal mt-4 text-base leading-7 text-body/70"></p>

  <div class="reveal mt-8 -mx-3 overflow-x-auto px-3 md:mx-0 md:px-0">
    <table class="w-full min-w-[720px] border-collapse text-left">
      <thead>
        <tr class="border-b-2 border-navy">
          <th scope="col" class="pb-4 pr-4 text-sm font-bold uppercase tracking-wide text-navy">Residence</th>
          <th scope="col" class="pb-4 pr-4 text-right text-sm font-bold uppercase tracking-wide text-navy">Size</th>
          <th scope="col" class="pb-4 pr-4 text-right text-sm font-bold uppercase tracking-wide text-navy">From</th>
          ${STRATEGY_KEYS.map((k) => `
            <th scope="col" class="pb-4 pl-4 text-right text-sm font-bold uppercase tracking-wide text-navy">${STRATEGIES[k].short}</th>`).join('')}
        </tr>
      </thead>
      <tbody data-out="rows" class="text-base"></tbody>
    </table>
  </div>

  <div class="reveal mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-body/60">
    <span class="flex items-center gap-2">
      <span class="h-[10px] w-[10px] rounded-full bg-gold"></span> Best in row
    </span>
    <span class="flex items-center gap-2">
      <span class="h-[10px] w-[10px] rounded-full border border-gold"></span> Indicative pricing — pending client confirmation
    </span>
  </div>`

const init = (root) => {
  const out = (name) => root.querySelector(`[data-out="${name}"]`)
  let metric = 'netYield'

  const render = () => {
    const m = METRICS[metric]
    out('note').textContent = m.note

    out('rows').innerHTML = UNIT_KEYS.map((uk) => {
      const cells = STRATEGY_KEYS.map((sk) => ({ sk, p: project(uk, sk) }))
      const values = cells.map(({ p }) => m.value(p))
      const best = Math.max(...values)
      const u = UNITS[uk]

      return `
        <tr class="border-b border-black/10 transition-colors duration-200 hover:bg-[#faf9f7]">
          <th scope="row" class="py-5 pr-4 align-middle font-bold text-navy">
            <span class="flex items-center gap-2">
              ${u.label}
              ${u.provisional ? '<span class="h-[10px] w-[10px] shrink-0 rounded-full border border-gold" title="Indicative pricing — pending client confirmation"></span>' : ''}
            </span>
          </th>
          <td class="yc-figure py-5 pr-4 text-right align-middle text-body/70">${u.size.toLocaleString('en-KE')} sqft</td>
          <td class="yc-figure py-5 pr-4 text-right align-middle font-medium text-body">${kesM(u.price)}</td>
          ${cells.map(({ p }, i) => {
            const isBest = values[i] === best
            return `
              <td class="py-5 pl-4 text-right align-middle">
                <span class="yc-figure inline-flex items-center gap-2 ${isBest ? 'font-bold text-navy' : 'text-body/75'}">
                  ${isBest ? '<span class="h-[10px] w-[10px] shrink-0 rounded-full bg-gold"></span>' : ''}
                  ${m.format(values[i])}
                </span>
              </td>`
          }).join('')}
        </tr>`
    }).join('')
  }

  pillGroup(root.querySelector('[data-group="metric"]'), 'metric', (v) => {
    metric = v
    render()
  })

  render()
}

export default {
  id: 'matrix',
  letter: 'E',
  name: 'Matrix',
  headline: 'Every residence, every strategy, at once',
  best: 'the visitor is comparing rather than dreaming — investors, agents, anyone who wants the whole price list on one screen.',
  answers: 'question 3 completely, and sidesteps question 4 — nothing has to be the default when everything is visible.',
  html,
  init,
}
