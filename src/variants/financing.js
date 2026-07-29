import { DEFAULTS, STRATEGIES, monthlyPayment, project } from '../lib/data.js'
import { countUp, kes, pct, pill, pillGroup, strategyPills, unitPills } from '../lib/dom.js'

/* Variation C — return on the money the buyer actually parts with, by route.
 * Yield on the sticker price is the wrong number for anyone using a deposit:
 * put down 20% and the same rent is a far bigger return on your own cash.
 * That is the argument this variation is built to make. */

const ROUTES = {
  cash: { label: 'Cash upfront', blurb: 'Pay in full on signing.' },
  instalment: { label: 'Instalments', blurb: 'Deposit now, balance over the construction period.' },
  mortgage: { label: 'Mortgage', blurb: 'Deposit now, bank finances the balance.' },
}

const range = (key, label, min, max, step, value, suffix) => `
  <label class="block">
    <span class="flex items-baseline justify-between gap-3">
      <span class="text-sm font-medium text-navy">${label}</span>
      <span data-val="${key}" class="yc-figure text-sm font-bold text-navy">${value}${suffix}</span>
    </span>
    <input type="range" data-input="${key}" min="${min}" max="${max}" step="${step}" value="${value}" class="yc-range mt-2 w-full" />
  </label>`

const html = `
  <div class="reveal-stagger mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
    <div class="flex flex-col gap-9">
      <div>
        <p class="text-base font-bold text-navy">Choose your residence</p>
        <div data-group="unit" class="mt-4 flex flex-wrap gap-3" role="group" aria-label="Residence type">
          ${unitPills('one')}
        </div>
      </div>

      <div>
        <p class="text-base font-bold text-navy">Choose a letting strategy</p>
        <div data-group="strategy" class="mt-4 flex flex-wrap gap-3" role="group" aria-label="Letting strategy">
          ${strategyPills('furnished')}
        </div>
      </div>

      <div>
        <p class="text-base font-bold text-navy">How are you paying?</p>
        <div data-group="route" class="mt-4 flex flex-wrap gap-3" role="group" aria-label="Payment route">
          ${Object.entries(ROUTES).map(([k, r], i) => pill('route', k, r.label, i === 2)).join('')}
        </div>
        <p data-out="routeBlurb" class="mt-4 text-base leading-7 text-body/70"></p>
      </div>

      <div class="rounded-2xl border border-black/15 bg-[#faf9f7] px-6 py-7 md:px-8">
        <p class="text-base font-bold text-navy">Terms</p>
        <p class="mt-2 text-sm leading-6 text-body/70">
          All placeholders. The deposit tiers, instalment period and any cash discount need to come from the client.
        </p>

        <div data-panel="cash" class="hidden">
          <div class="mt-6">
            ${range('cashDiscount', 'Cash discount on list price', 0, 15, 0.5, DEFAULTS.cashDiscount, '%')}
          </div>
        </div>

        <div data-panel="instalment" class="hidden">
          <div class="mt-6 grid gap-6 sm:grid-cols-2">
            ${range('depositPct', 'Deposit', 5, 60, 5, DEFAULTS.depositPct, '%')}
            ${range('instalmentMonths', 'Balance paid over', 6, 48, 6, DEFAULTS.instalmentMonths, ' mo')}
          </div>
        </div>

        <div data-panel="mortgage" class="hidden">
          <div class="mt-6 grid gap-6 sm:grid-cols-2">
            ${range('depositPct', 'Deposit', 5, 60, 5, DEFAULTS.depositPct, '%')}
            ${range('mortgageRate', 'Interest rate', 8, 20, 0.25, DEFAULTS.mortgageRate, '%')}
            ${range('mortgageYears', 'Term', 5, 25, 1, DEFAULTS.mortgageYears, ' yrs')}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <div class="rounded-2xl bg-navy px-7 py-9 text-white shadow-xl md:px-10 md:py-11">
        <p data-out="headlineLabel" class="text-base font-medium text-white/70">Return on your cash</p>
        <p class="mt-2 flex items-end gap-2">
          <span data-out="coc" class="yc-figure text-[clamp(3.25rem,6vw,4.75rem)] font-bold leading-none text-gold">0.0%</span>
          <span class="pb-2 text-base font-medium text-white/60">per year</span>
        </p>
        <p data-out="cocNote" class="mt-3 text-sm leading-6 text-white/55"></p>

        <div class="my-8 h-[3px] w-full bg-gold/70" aria-hidden="true"></div>

        <dl class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium uppercase tracking-wide text-white/55">Cash you put in</dt>
            <dd data-out="cashIn" class="yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold">&mdash;</dd>
            <dd data-out="cashInNote" class="mt-1 text-xs leading-5 text-white/45"></dd>
          </div>
          <div>
            <dt class="text-sm font-medium uppercase tracking-wide text-white/55">Net rent, year one</dt>
            <dd data-out="netRent" class="yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold">&mdash;</dd>
            <dd class="mt-1 text-xs leading-5 text-white/45">After service charge, letting fees and running costs</dd>
          </div>
          <div>
            <dt data-out="financeLabel" class="text-sm font-medium uppercase tracking-wide text-white/55">Finance cost</dt>
            <dd data-out="finance" class="yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold text-white/80">&mdash;</dd>
            <dd data-out="financeNote" class="mt-1 text-xs leading-5 text-white/45"></dd>
          </div>
          <div>
            <dt class="text-sm font-medium uppercase tracking-wide text-white/55">Monthly cash flow</dt>
            <dd data-out="cashflow" class="yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold text-gold">&mdash;</dd>
            <dd data-out="cashflowNote" class="mt-1 text-xs leading-5 text-white/45"></dd>
          </div>
        </dl>

        <p data-out="summary" class="mt-8 border-t border-white/15 pt-6 text-base leading-7 text-white/80"></p>
      </div>

      <div class="rounded-2xl border border-black/15 bg-[#faf9f7] px-6 py-5 md:px-8">
        <p class="text-sm font-bold uppercase tracking-wide text-navy">Compare the routes</p>
        <div data-out="compare" class="mt-4 grid gap-3"></div>
      </div>
    </div>
  </div>`

const init = (root) => {
  const out = (name) => root.querySelector(`[data-out="${name}"]`)
  const panels = Object.fromEntries(
    Object.keys(ROUTES).map((k) => [k, root.querySelector(`[data-panel="${k}"]`)]),
  )

  let unit = 'one'
  let strategy = 'furnished'
  let route = 'mortgage'
  const opts = { ...DEFAULTS }

  /* Cash actually leaving the buyer's pocket, plus the annual cost of finance. */
  const financeFor = (p, which) => {
    const acquisition = p.acquisition
    if (which === 'cash') {
      const price = p.unit.price * (1 - opts.cashDiscount / 100)
      return {
        cashIn: price + acquisition + p.furnishing,
        annualFinance: 0,
        cashInNote: `${kes(price)} price after a ${opts.cashDiscount}% discount, plus fees and furnishing`,
        financeNote: 'No borrowing',
      }
    }
    const deposit = p.unit.price * (opts.depositPct / 100)
    if (which === 'instalment') {
      /* The balance is still paid in full, just spread — so treat the whole
       * price as invested and flag that the return only starts on handover. */
      const perMonth = (p.unit.price - deposit) / opts.instalmentMonths
      return {
        cashIn: p.unit.price + acquisition + p.furnishing,
        annualFinance: 0,
        cashInNote: `${kes(deposit)} deposit, then ${kes(perMonth)}/mo for ${opts.instalmentMonths} months`,
        financeNote: `No interest, but no rent either until handover`,
      }
    }
    const loan = p.unit.price - deposit
    const payment = monthlyPayment(loan, opts.mortgageRate, opts.mortgageYears)
    return {
      cashIn: deposit + acquisition + p.furnishing,
      annualFinance: payment * 12,
      cashInNote: `${kes(deposit)} deposit (${opts.depositPct}%), plus fees and furnishing`,
      financeNote: `${kes(payment)}/mo on a ${kes(loan)} loan`,
    }
  }

  const render = () => {
    const p = project(unit, strategy, opts)
    const f = financeFor(p, route)
    const surplus = p.netAnnual - f.annualFinance
    const coc = (surplus / f.cashIn) * 100

    out('routeBlurb').textContent = ROUTES[route].blurb
    out('cashIn').textContent = kes(f.cashIn)
    out('cashInNote').textContent = f.cashInNote
    out('netRent').textContent = kes(p.netAnnual)
    out('finance').innerHTML = f.annualFinance ? `&minus; ${kes(f.annualFinance)}` : '—'
    out('financeNote').textContent = f.financeNote
    out('financeLabel').textContent = route === 'mortgage' ? 'Mortgage payments' : 'Finance cost'

    const monthly = surplus / 12
    out('cashflow').innerHTML = monthly < 0 ? `&minus; ${kes(-monthly)}` : `+ ${kes(monthly)}`
    out('cashflow').className = `yc-figure mt-1 text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold ${monthly < 0 ? 'text-[#e2a08c]' : 'text-gold'}`
    out('cashflowNote').textContent = monthly < 0
      ? 'The rent does not cover the mortgage — you top it up each month'
      : 'What lands in your account after everything'

    out('headlineLabel').textContent = route === 'mortgage'
      ? 'Return on your deposit'
      : 'Return on your cash'
    out('cocNote').textContent = route === 'instalment'
      ? 'Simple year-one return once the unit is handed over. A true IRR would be lower, because instalments go in before any rent comes out.'
      : `Net rent${f.annualFinance ? ' less mortgage payments' : ''}, over the ${kes(f.cashIn)} you invested.`

    countUp(out('coc'), coc, (v) => `${v.toFixed(1)}%`)

    out('summary').innerHTML =
      `A <strong class="font-medium text-white">${p.unit.label}</strong> on ${STRATEGIES[strategy].sentence}, bought ` +
      `<strong class="font-medium text-white">${ROUTES[route].label.toLowerCase()}</strong>, returns ` +
      `<strong class="font-medium text-gold">${pct(coc)}</strong> a year on the cash you commit — against ` +
      `${pct(p.netYield)} measured against the full price.`

    /* Side-by-side so the differential between routes is the visible thing. */
    out('compare').innerHTML = Object.keys(ROUTES)
      .map((k) => {
        const rf = financeFor(p, k)
        const rc = ((p.netAnnual - rf.annualFinance) / rf.cashIn) * 100
        const active = k === route
        return `
          <div class="flex items-baseline justify-between gap-4 rounded-xl px-4 py-3 ${active ? 'bg-navy text-white' : 'bg-white'}">
            <span class="text-sm font-medium ${active ? '' : 'text-body'}">${ROUTES[k].label}</span>
            <span class="flex items-baseline gap-4">
              <span class="yc-figure text-xs ${active ? 'text-white/55' : 'text-body/55'}">${kes(rf.cashIn)} in</span>
              <span class="yc-figure w-[70px] text-right text-base font-bold ${active ? 'text-gold' : 'text-navy'}">${pct(rc)}</span>
            </span>
          </div>`
      })
      .join('')
  }

  const showPanels = () => {
    Object.entries(panels).forEach(([k, panel]) => panel.classList.toggle('hidden', k !== route))
  }

  pillGroup(root.querySelector('[data-group="unit"]'), 'unit', (v) => {
    unit = v
    render()
  })
  pillGroup(root.querySelector('[data-group="strategy"]'), 'strategy', (v) => {
    strategy = v
    render()
  })
  pillGroup(root.querySelector('[data-group="route"]'), 'route', (v) => {
    route = v
    showPanels()
    render()
  })

  /* depositPct appears in two panels, so keep every copy of a control in sync. */
  root.querySelectorAll('[data-input]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.input
      opts[key] = Number(input.value) || 0
      const suffix = key === 'instalmentMonths' ? ' mo' : key === 'mortgageYears' ? ' yrs' : '%'
      root.querySelectorAll(`[data-input="${key}"]`).forEach((twin) => {
        twin.value = input.value
      })
      root.querySelectorAll(`[data-val="${key}"]`).forEach((readout) => {
        readout.textContent = `${opts[key]}${suffix}`
      })
      render()
    })
  })

  showPanels()
  render()
}

export default {
  id: 'financing',
  letter: 'C',
  name: 'Cash-on-cash',
  headline: 'Return on the money you put in',
  best: 'the buyer is choosing between paying cash, paying in instalments and borrowing. Note what it shows: at a 14.5% mortgage rate against a ~12% net yield, borrowing <em>reduces</em> the return rather than amplifying it. Worth knowing before the client leans on financing as a selling point.',
  answers: 'questions 1 and 2 — the cash/instalment/mortgage differential is the whole point, and the deposit tiers, discount and term are all inputs.',
  html,
  init,
}
