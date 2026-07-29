/* ---------------------------------------------------------------------------
 * Shared model for every calculator variation.
 *
 * UNITS: the three confirmed rows come from the client's "Expected Rental
 * Returns" schedule (same figures as the 97 Alta landing page). Duplex, Loft
 * and Penthouse are marked `provisional` — those prices and rents are our own
 * placeholders and must be replaced once the client confirms them.
 * ------------------------------------------------------------------------- */

export const UNITS = {
  mini: {
    label: 'Mini 1 Bed', size: 396, price: 6_900_000, sc: 10_000,
    rent: { unfurnished: 70_000, furnished: 120_000, airbnb: 145_000 },
  },
  one: {
    label: '1 Bed', size: 576, price: 9_800_000, sc: 10_000,
    rent: { unfurnished: 90_000, furnished: 150_000, airbnb: 180_000 },
  },
  two: {
    label: '2 Bed', size: 1130, price: 15_000_000, sc: 15_000,
    rent: { unfurnished: 130_000, furnished: 190_000, airbnb: 290_000 },
  },
  loft: {
    label: 'Loft', size: 780, price: 12_500_000, sc: 12_000, provisional: true,
    rent: { unfurnished: 110_000, furnished: 165_000, airbnb: 230_000 },
  },
  duplex: {
    label: 'Duplex', size: 1650, price: 22_000_000, sc: 20_000, provisional: true,
    rent: { unfurnished: 180_000, furnished: 250_000, airbnb: 360_000 },
  },
  penthouse: {
    label: 'Penthouse', size: 2400, price: 38_000_000, sc: 30_000, provisional: true,
    rent: { unfurnished: 300_000, furnished: 420_000, airbnb: 600_000 },
  },
}

export const UNIT_KEYS = Object.keys(UNITS)

export const STRATEGIES = {
  unfurnished: { label: 'Long-term &middot; Unfurnished', short: 'Long-let', sentence: 'long-term (unfurnished)' },
  furnished: { label: 'Long-term &middot; Furnished', short: 'Furnished', sentence: 'long-term (furnished)' },
  airbnb: { label: 'Short-stay &middot; Airbnb', short: 'Short-stay', sentence: 'short-stay' },
}

export const STRATEGY_KEYS = Object.keys(STRATEGIES)

/* Every assumption the projections lean on, in one place so a variation can
 * override any of it. Anything here is a placeholder pending client sign-off. */
export const DEFAULTS = {
  /* short-stay */
  occupancy: 75,
  platformFee: 18,
  stayMgmtFee: 20,
  utilities: 12_000,
  consumables: 4_000,
  /* Is the sheet's short-stay rent the gross total at full occupancy, or is it
   * already net of empty nights and Airbnb's cut? The client has not told us,
   * so it is a switch rather than a hard-coded answer. */
  rentIsNet: false,

  /* long-let */
  voidMonths: 1,
  lettingFee: 8,
  repairs: 5_000,

  /* capital */
  stampDuty: 4,
  legalFees: 1.5,
  furnishPerSqft: { furnished: 1_800, airbnb: 2_400 },
  includeFurnishing: true,

  /* tax — Kenyan Monthly Rental Income tax is a final tax on gross rent for
   * residential long-lets in the 288k–15M/year band. Short-stay is usually
   * business income instead, so this is off by default and clearly labelled. */
  deductTax: false,
  taxRate: 7.5,

  /* purchase routes */
  cashDiscount: 5,
  depositPct: 20,
  instalmentMonths: 24,
  mortgageRate: 14.5,
  mortgageYears: 20,
}

export const isShortStay = (strategy) => strategy === 'airbnb'

/**
 * Year-one projection for one unit on one letting strategy.
 * Returns every intermediate line so a variation can show as much or as
 * little of the arithmetic as it wants.
 */
export const project = (unitKey, strategy, opts = {}) => {
  const a = { ...DEFAULTS, ...opts }
  const unit = UNITS[unitKey]
  const listedMonthly = unit.rent[strategy]
  const annualPotential = listedMonthly * 12

  let achievedGross
  let platformCost = 0
  let mgmtCost = 0
  let voidCost = 0
  let lettingCost = 0
  let otherOpex = 0
  const scCost = unit.sc * 12

  if (isShortStay(strategy)) {
    achievedGross = a.rentIsNet ? annualPotential : annualPotential * (a.occupancy / 100)
    platformCost = a.rentIsNet ? 0 : achievedGross * (a.platformFee / 100)
    mgmtCost = (achievedGross - platformCost) * (a.stayMgmtFee / 100)
    otherOpex = (a.utilities + a.consumables) * 12
  } else {
    voidCost = listedMonthly * a.voidMonths
    achievedGross = annualPotential - voidCost
    lettingCost = achievedGross * (a.lettingFee / 100)
    otherOpex = a.repairs * 12
  }

  const taxCost = a.deductTax ? achievedGross * (a.taxRate / 100) : 0
  const netAnnual = achievedGross - platformCost - mgmtCost - lettingCost - scCost - otherOpex - taxCost

  const furnishing = a.includeFurnishing ? unit.size * (a.furnishPerSqft[strategy] || 0) : 0
  const acquisition = unit.price * ((a.stampDuty + a.legalFees) / 100)
  const totalInvested = unit.price + acquisition + furnishing

  return {
    unit,
    strategy,
    listedMonthly,
    annualPotential,
    achievedGross,
    platformCost,
    mgmtCost,
    voidCost,
    lettingCost,
    scCost,
    otherOpex,
    taxCost,
    netAnnual,
    netMonthly: netAnnual / 12,
    furnishing,
    acquisition,
    totalInvested,
    /* what the client's sheet implies: rent x 12 over the sticker price */
    headlineYield: (annualPotential / unit.price) * 100,
    /* the same sum on income we actually expect to collect */
    grossYield: (achievedGross / unit.price) * 100,
    /* after every running cost, over everything the buyer had to put in */
    netYield: (netAnnual / totalInvested) * 100,
  }
}

/** Level repayment on an amortising loan. */
export const monthlyPayment = (principal, annualRate, years) => {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (r === 0) return principal / n
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}
