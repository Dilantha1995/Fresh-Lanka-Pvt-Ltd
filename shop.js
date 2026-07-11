/* =========================================================
   Fresh Lanka Global — Shop
   Products & stores are loaded from products.json
   Edit them in the ADMIN PANEL (admin.html) — no coding needed.
   ========================================================= */

let PRODUCTS = [];
let STORES = {};
let CATS = [];

const CUR = { MV:{ code:'MVR', key:'mv' }, LK:{ code:'LKR', key:'lk' } };

let country = localStorage.getItem('fl_country') || 'MV';
let cart = {};
let filter = 'all';

const $ = (id) => document.getElementById(id);
const money = (n) => CUR[country].code + ' ' + n.toLocaleString();
const priceOf = (p) => p[CUR[country].key];

function starRow(r, n) {
  const full = Math.round(r);
  return `<div class="stars">${'★'.repeat(full)}${'☆'.repeat(5-full)}<span>${r.toFixed(1)} (${n})</span></div>`;
}

function renderStore() {
  const s = STORES[country];
  $('store-note').innerHTML =
    `📍 Your nearest store: <b>${s.name}</b> — ${s.area}. ${s.note} <b>${s.phone}</b>`;
}

function renderProducts() {
  const list = PRODUCTS.filter(p => filter === 'all' || p.cat === filter);
  $('grid').innerHTML = list.map(p => `
    <article class="pcard reveal">
      <div class="pimg">
        ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">`
                : `<div class="ph">🌿</div>`}
        ${p.organic ? '<span class="badge-org">Fresh</span>' : ''}
      </div>
      <div class="pbody">
        <span class="pcat">${p.cat}</span>
        <h3>${p.name}</h3>
        ${starRow(p.rating, p.reviews)}
        <div class="price">${money(priceOf(p))}</div>
        <button class="add-btn" data-add="${p.id}">＋ Add to basket</button>
      </div>
    </article>`).join('');
}

function cartArray() {
  return Object.keys(cart).map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    return { ...p, qty: cart[id], line: priceOf(p) * cart[id] };
  });
}
function cartTotal() { return cartArray().reduce((s, i) => s + i.line, 0); }

function renderCart() {
  const items = cartArray();
  const n = items.reduce((s, i) => s + i.qty, 0);
  $('cart-count').textContent = n;

  if (!items.length) {
    $('cart-items').innerHTML = `<div class="cart-empty">Your basket is empty.<br>Add some fresh produce 🌿</div>`;
    $('cart-foot').style.display = 'none';
  } else {
    $('cart-items').innerHTML = items.map(i => `
      <div class="citem">
        ${i.img ? `<img src="${i.img}" alt="">` : `<div class="ph">🌿</div>`}
        <div class="ci-info"><b>${i.name}</b><span>${money(priceOf(i))} each</span></div>
        <div class="qty">
          <button data-dec="${i.id}">−</button><b>${i.qty}</b><button data-inc="${i.id}">＋</button>
        </div>
      </div>`).join('');
    $('cart-foot').style.display = 'block';
    $('cart-total').textContent = money(cartTotal());
  }
}

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) {
    const id = add.dataset.add;
    cart[id] = (cart[id] || 0) + 1;
    add.textContent = '✓ Added';
    add.classList.add('added');
    setTimeout(() => { add.textContent = '＋ Add to basket'; add.classList.remove('added'); }, 1100);
    renderCart();
  }
  const inc = e.target.closest('[data-inc]');
  if (inc) { cart[inc.dataset.inc]++; renderCart(); }
  const dec = e.target.closest('[data-dec]');
  if (dec) {
    const id = dec.dataset.dec;
    cart[id]--; if (cart[id] < 1) delete cart[id];
    renderCart();
  }
  const chip = e.target.closest('.chip-btn');
  if (chip) {
    document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filter = chip.dataset.cat;
    renderProducts();
  }
});

const openCart  = () => { $('cart').classList.add('open'); $('cart-overlay').classList.add('open'); };
const closeCart = () => { $('cart').classList.remove('open'); $('cart-overlay').classList.remove('open'); };
$('cart-fab').addEventListener('click', openCart);
$('cart-close').addEventListener('click', closeCart);
$('cart-overlay').addEventListener('click', closeCart);

$('country').addEventListener('change', (e) => {
  country = e.target.value;
  localStorage.setItem('fl_country', country);
  renderStore(); renderProducts(); renderCart();
});

$('to-checkout').addEventListener('click', () => {
  if (!cartArray().length) return;
  $('cart-items').style.display = 'none';
  $('cart-foot').style.display = 'none';
  $('checkout').style.display = 'block';
  $('cart-title').textContent = 'Checkout';
});
$('back-cart').addEventListener('click', () => {
  $('checkout').style.display = 'none';
  $('cart-items').style.display = 'block';
  $('cart-foot').style.display = 'block';
  $('cart-title').textContent = 'Your Basket';
});

/* ---------- place order ---------- */
$('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('place-order');
  btn.disabled = true; btn.textContent = 'Placing order…';

  const ref = 'FLG-' + Date.now().toString(36).toUpperCase().slice(-6);
  const items = cartArray();
  $('f-ref').value     = ref;
  $('f-items').value   = items.map(i => `${i.qty} × ${i.name} — ${money(i.line)}`).join('\n');
  $('f-total').value   = money(cartTotal());
  $('f-country').value = country === 'MV' ? 'Maldives' : 'Sri Lanka';
  $('f-store').value   = STORES[country].name;

  try {
    const res = await fetch(e.target.action, {
      method: 'POST', body: new FormData(e.target), headers: { Accept: 'application/json' }
    });
    const out = await res.json().catch(() => ({}));
    if (res.ok && out.success) {
      $('checkout').style.display = 'none';
      $('order-ok').style.display = 'block';
      $('ok-ref').textContent = ref;
      $('cart-title').textContent = 'Order Confirmed';
      cart = {};
    } else { throw new Error('failed'); }
  } catch (err) {
    alert('Sorry, the order could not be sent. Please call us on ' + STORES[country].phone + ' and we will take your order.');
    btn.disabled = false; btn.textContent = 'Place order';
  }
});

/* ---------- init: load catalogue from products.json ---------- */
(async function init(){
  try {
    const res = await fetch('products.json?v=' + Date.now());
    const data = await res.json();
    PRODUCTS = data.products || [];
    STORES   = data.stores   || {};
    CATS     = data.categories || [];
    if (CATS.length) {
      $('filters').innerHTML =
        '<button class="chip-btn active" data-cat="all">All products</button>' +
        CATS.map(c => `<button class="chip-btn" data-cat="${c}">${c}</button>`).join('');
    }
  } catch (e) {
    $('grid').innerHTML = '<p style="color:var(--muted)">Could not load products. Please refresh.</p>';
    return;
  }
  $('country').value = country;
  renderStore();
  renderProducts();
  renderCart();
})();
