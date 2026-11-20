'use strict';

const financingProducts = [
  {
    title: 'Home loans',
    description: 'Finance the purchase or construction of a home.',
    image: 'residences.png',
    lenderUrl: ''
  },
  {
    title: 'Lease rental discounting',
    description: 'Borrow against future rent from a leased property.',
    abbreviation: 'LRD',
    image: 'office.png',
    lenderUrl: ''
  },
  {
    title: 'Loan against property',
    description: 'Use a property you own as security to raise funds.',
    abbreviation: 'LAP',
    image: 'district.png',
    lenderUrl: ''
  }
];

function financingPage() {
  const cards = financingProducts.map(product => {
    const lenderLink = product.lenderUrl
      ? `<a href="${esc(product.lenderUrl)}" target="_blank" rel="noopener noreferrer">Visit lender website</a>`
      : '<a role="link" aria-disabled="true">Lender link coming soon</a>';
    return `<article class="finance-card">
      <img src="assets/${product.image}" alt="" width="580" height="270">
      <div class="finance-copy">
        <h2>${product.title}${product.abbreviation ? ` <small>(${product.abbreviation})</small>` : ''}</h2>
        <p>${product.description}</p>
        <div class="finance-referral">${lenderLink}</div>
      </div>
    </article>`;
  }).join('');
  return `<section class="finance-page" aria-labelledby="finance-title">
    <header class="finance-intro"><h1 id="finance-title">Financing</h1>
      <p>Explore financing options for your real estate. External lenders handle applications directly.</p>
    </header>
    <div class="finance-products">${cards}</div>
  </section>`;
}
