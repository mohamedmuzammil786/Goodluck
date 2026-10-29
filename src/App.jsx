import { useEffect, useMemo, useState } from 'react'
import { products, inr, off } from './data.js'
import Shoe from './Shoe.jsx'

const cats = ['All', ...new Set(products.map((p) => p.cat))]
const brands = [...new Set(products.map((p) => p.brand))]
const SIZES = [6, 7, 8, 9, 10, 11]

export default function App() {
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [bs, setBs] = useState([])
  const [maxPrice, setMaxPrice] = useState(0)
  const [wishOnly, setWishOnly] = useState(false)
  const [sort, setSort] = useState('rel')
  const [cart, setCart] = useState({})
  const [wish, setWish] = useState(new Set())
  const [selId, setSelId] = useState(null)
  const [size, setSize] = useState(null)
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeAll()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const list = useMemo(() => {
    const s = q.toLowerCase()
    const L = products.filter(
      (p) =>
        (cat === 'All' || p.cat === cat) &&
        (!s || (p.name + p.brand + p.cat).toLowerCase().includes(s)) &&
        (!bs.length || bs.includes(p.brand)) &&
        (!maxPrice || p.price <= maxPrice) &&
        (!wishOnly || wish.has(p.id))
    )
    if (sort === 'lo') L.sort((a, b) => a.price - b.price)
    else if (sort === 'hi') L.sort((a, b) => b.price - a.price)
    else if (sort === 'rt') L.sort((a, b) => b.rating - a.rating)
    else L.sort((a, b) => b.reviews - a.reviews)
    return L
  }, [cat, q, bs, maxPrice, wishOnly, sort, wish])

  const cartRows = Object.entries(cart)
  const count = cartRows.reduce((s, [, c]) => s + c.q, 0)
  const total = cartRows.reduce((s, [, c]) => s + c.q * products[c.id].price, 0)

  const closeAll = () => { setSelId(null); setDrawer(false) }
  const toggleWish = (id) => {
    const n = new Set(wish)
    if (n.has(id)) { n.delete(id); setToast('Removed from wishlist') }
    else { n.add(id); setToast('Added to wishlist') }
    setWish(n)
  }
  const addToCart = (id, s) =>
    setCart((c) => {
      const k = `${id}-${s}`
      const cur = c[k] || { id, s, q: 0 }
      return { ...c, [k]: { ...cur, q: cur.q + 1 } }
    })
  const changeQty = (k, d) =>
    setCart((c) => {
      const n = c[k].q + d
      if (n < 1) { const { [k]: _gone, ...rest } = c; return rest }
      return { ...c, [k]: { ...c[k], q: n } }
    })
  const toggleTheme = () => {
    const r = document.documentElement
    r.dataset.theme = getComputedStyle(r).colorScheme === 'dark' ? 'light' : 'dark'
  }
  const gotoShop = () => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })
  const showWishlist = () => { setWishOnly((v) => !v); gotoShop() }
  const pickBrand = (b) => setBs((x) => (x.includes(b) ? x.filter((y) => y !== b) : [...x, b]))
  const modalOpen = selId !== null
  const sel = modalOpen ? products[selId] : null

  const buy = (goCart) => {
    if (!size) return setToast('Select a size first')
    addToCart(selId, size)
    setSelId(null)
    if (goCart) setDrawer(true)
    else setToast('Added to cart')
  }
  const openProduct = (id) => { setSize(null); setSelId(id) }
  const checkout = () => {
    if (!count) return setToast('Your cart is empty')
    setCart({}); closeAll(); setToast('Order placed. Thank you!')
  }

  return (
    <>
      <header>
        <div className="bar">
          <div className="logo">Stride<i>house</i></div>
          <div className="search">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search for sneakers, brands and more" aria-label="Search shoes" />
            <span>⌕</span>
          </div>
          <button className="hbtn hide-m" onClick={toggleTheme}>◐ Theme</button>
          <button className="hbtn hide-m" onClick={showWishlist}>♡ Wishlist</button>
          <button className="hbtn" onClick={() => setDrawer(true)} aria-label="Cart">
            🛒<span className="hide-m"> Cart</span><i className="badge">{count}</i>
          </button>
        </div>
      </header>

      <div className="cats">
        <div id="cats">
          {cats.map((c) => (
            <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <main>
        <section className="hero">
          <div>
            <h1>Step up to the Autumn Edit</h1>
            <p>Handpicked premium sneakers, boots and loafers. Up to 40% off, free delivery over ₹2,999.</p>
            <button className="cta" onClick={gotoShop}>Shop now</button>
          </div>
          <Shoe c1="#f5f5f2" c2="#f2b230" />
        </section>

        <div className="perks">
          <div><b>Free delivery</b>On orders above ₹2,999</div>
          <div><b>30-day returns</b>No questions asked</div>
          <div><b>100% authentic</b>Brand-verified stock</div>
          <div><b>Easy EMI</b>From ₹499 a month</div>
        </div>

        <div className="layout" id="shop">
          <aside>
            <h4>Brand</h4>
            {brands.map((b) => (
              <label key={b}><input type="checkbox" checked={bs.includes(b)} onChange={() => pickBrand(b)} /> {b}</label>
            ))}
            <hr />
            <h4>Price</h4>
            {[[0, 'All prices'], [3000, 'Under ₹3,000'], [6000, 'Under ₹6,000'], [9000, 'Under ₹9,000']].map(([v, t]) => (
              <label key={v}><input type="radio" name="p" checked={maxPrice === v} onChange={() => setMaxPrice(v)} /> {t}</label>
            ))}
            <hr />
            <label><input type="checkbox" checked={wishOnly} onChange={(e) => setWishOnly(e.target.checked)} /> Wishlisted only</label>
          </aside>

          <section>
            <div className="top">
              <b>{list.length} shoes</b>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                <option value="rel">Sort: Popularity</option>
                <option value="lo">Price: Low to High</option>
                <option value="hi">Price: High to Low</option>
                <option value="rt">Top rated</option>
              </select>
            </div>
            <div className="grid">
              {list.length === 0 && (
                <div className="empty">No shoes match these filters. Clear a filter or try another search.</div>
              )}
              {list.map((p) => (
                <article className="card" key={p.id} onClick={() => openProduct(p.id)}>
                  <button className={'heart' + (wish.has(p.id) ? ' on' : '')} aria-label="Wishlist"
                    onClick={(e) => { e.stopPropagation(); toggleWish(p.id) }}>
                    {wish.has(p.id) ? '♥' : '♡'}
                  </button>
                  <div className="img"><Shoe c1={p.c1} c2={p.c2} /></div>
                  <div className="info">
                    <div className="brand">{p.brand}</div>
                    <div className="nm">{p.name}</div>
                    <span className="rt">{p.rating} ★</span>
                    <span className="rv">({p.reviews.toLocaleString('en-IN')})</span>
                    <div className="pr"><b>{inr(p.price)}</b><s>{inr(p.mrp)}</s><em>{off(p)}% off</em></div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <div className={'ov' + (modalOpen || drawer ? ' show' : '')} onClick={closeAll} />

      <div className={'drawer' + (drawer ? ' show' : '')}>
        <h3>My Cart <button onClick={closeAll} aria-label="Close cart">✕</button></h3>
        <div className="items">
          {cartRows.length === 0 && <div className="empty">Your cart is empty. Add a pair to get started.</div>}
          {cartRows.map(([k, c]) => {
            const p = products[c.id]
            return (
              <div className="row" key={k}>
                <div className="t"><Shoe c1={p.c1} c2={p.c2} /></div>
                <div>
                  <b>{p.name}</b>
                  <div className="brand">Size UK {c.s} · {inr(p.price)}</div>
                  <div className="qty">
                    <button onClick={() => changeQty(k, -1)} aria-label="Less">−</button>
                    <span>{c.q}</span>
                    <button onClick={() => changeQty(k, 1)} aria-label="More">+</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="foot">
          <div className="sum"><span>Total</span><span>{inr(total)}</span></div>
          <button className="cta" onClick={checkout}>Place order</button>
        </div>
      </div>

      {sel && (
        <div className="modal show">
          <button className="x" aria-label="Close" onClick={closeAll}>×</button>
          <div className="big"><Shoe c1={sel.c1} c2={sel.c2} /></div>
          <div className="det">
            <div className="brand">{sel.brand} · {sel.cat}</div>
            <h2>{sel.name}</h2>
            <span className="rt">{sel.rating} ★</span>
            <span className="rv">{sel.reviews.toLocaleString('en-IN')} ratings</span>
            <div className="pr" style={{ margin: '12px 0' }}>
              <b style={{ fontSize: 26 }}>{inr(sel.price)}</b><s>{inr(sel.mrp)}</s><em>{off(sel)}% off</em>
            </div>
            <p className="brand" style={{ marginBottom: 6 }}>Select size (UK)</p>
            <div className="sizes">
              {SIZES.map((s) => (
                <button key={s} className={'sz' + (size === s ? ' on' : '')} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
            <div className="two">
              <button className="cta" onClick={() => buy(false)}>Add to cart</button>
              <button className="cta alt" onClick={() => buy(true)}>Buy now</button>
            </div>
            <p className="brand" style={{ marginTop: 16 }}>
              Cushioned insole, breathable upper, durable grip outsole. Free delivery and 30-day returns.
            </p>
          </div>
        </div>
      )}

      <div className={'toast' + (toast ? ' show' : '')}>{toast}</div>

      <nav className="bn">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span>⌂</span>Home</button>
        <button onClick={() => document.getElementById('cats').scrollIntoView()}><span>▦</span>Categories</button>
        <button onClick={showWishlist}><span>♡</span>Wishlist</button>
        <button onClick={() => setDrawer(true)}><span>🛒</span>Cart<i className="badge" style={{ right: '22%' }}>{count}</i></button>
        <button onClick={toggleTheme}><span>◐</span>Theme</button>
      </nav>
    </>
  )
}
