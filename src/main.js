import './style.css'
import { observeReveals, variantHeader } from './lib/dom.js'
import classic from './variants/classic.js'
import transparent from './variants/transparent.js'
import financing from './variants/financing.js'
import compact from './variants/compact.js'
import matrix from './variants/matrix.js'

const VARIANTS = [classic, transparent, financing, compact, matrix]

/* Still open with the client. Listed on the page so whoever reviews these
 * variations can see which numbers are ours and which are theirs. */
const OPEN = [
  'Is the short-stay figure gross at full occupancy, or already net of empty nights and Airbnb fees?',
  'Does the Elite Stays management fee come out of that figure, or on top of it?',
  'Confirmed prices, sizes and service charges for Loft, Duplex and Penthouse.',
  'Cash discount, deposit tiers and instalment period for each payment route.',
  'Is the unit sold furnished, or is furnishing the buyer&rsquo;s cost?',
  'Does the service charge escalate, and is there a separate sinking fund?',
  'Where the rents came from — comparable buildings, or a projection?',
]

const shell = `
  <header class="bg-navy text-white">
    <div class="mx-auto w-full max-w-[1440px] px-3 py-14 md:px-10 lg:py-20 xl:px-16">
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-gold">97 Alta &middot; internal review</p>
      <h1 class="mt-4 max-w-[900px] text-[clamp(2rem,3.4vw,3rem)] font-bold leading-tight">
        Yield calculator &mdash; five variations
      </h1>
      <p class="mt-5 max-w-[720px] text-[clamp(1rem,1.3vw,1.125rem)] leading-8 text-white/70">
        The same rental schedule presented five ways, from the section as originally drafted through to a
        full cost breakdown. Each one names the audience it is built for and the open question it settles.
        Every figure not confirmed by the client is marked.
      </p>
    </div>
  </header>

  <nav class="sticky top-0 z-20 border-b border-black/15 bg-white/95 backdrop-blur">
    <div class="mx-auto flex w-full max-w-[1440px] items-center gap-2 overflow-x-auto px-3 py-3 md:px-10 xl:px-16">
      ${VARIANTS.map((v) => `
        <a href="#${v.id}" class="flex h-[38px] shrink-0 items-center gap-2 rounded-full border border-[#a4a4a4] px-4 text-sm font-medium text-body transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white">
          <span class="text-gold">${v.letter}</span> ${v.name}
        </a>`).join('')}
    </div>
  </nav>

  <main>
    ${VARIANTS.map((v, i) => `
      <section id="${v.id}" class="${i ? 'border-t border-black/25' : ''}">
        <div class="mx-auto w-full max-w-[1440px] px-3 py-16 md:px-10 lg:py-[104px] xl:px-16">
          ${variantHeader(v)}
          <div data-mount="${v.id}"></div>
        </div>
      </section>`).join('')}
  </main>

  <footer class="border-t border-black/25 bg-[#faf9f7]">
    <div class="mx-auto w-full max-w-[1440px] px-3 py-16 md:px-10 lg:py-20 xl:px-16">
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-gold">Before any of these ship</p>
      <h2 class="mt-3 text-[clamp(1.5rem,2.2vw,2rem)] font-bold text-black">Still open with the client</h2>
      <ol class="mt-8 grid max-w-[1000px] gap-4 md:grid-cols-2">
        ${OPEN.map((q, i) => `
          <li class="flex gap-4 rounded-xl bg-white px-5 py-4 ring-1 ring-black/10">
            <span class="yc-figure shrink-0 text-sm font-bold text-gold">${String(i + 1).padStart(2, '0')}</span>
            <span class="text-[0.95rem] leading-7 text-body">${q}</span>
          </li>`).join('')}
      </ol>
      <p class="mt-10 max-w-[760px] text-sm leading-7 text-body/60">
        Placeholder assumptions used throughout: 75% short-stay occupancy, 18% platform fee, 20% short-stay
        management, 8% long-let letting fee, one void month a year, 4% stamp duty, 1.5% legal fees, furnishing
        at KES 1,800&ndash;2,400/sqft, and a 14.5% mortgage over 20 years. None of these are client figures.
      </p>
    </div>
  </footer>`

document.querySelector('#app').innerHTML = shell

VARIANTS.forEach((v) => {
  const mount = document.querySelector(`[data-mount="${v.id}"]`)
  mount.innerHTML = v.html
  v.init(mount)
})

observeReveals()
