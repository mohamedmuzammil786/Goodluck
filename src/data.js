// name, brand, category, price, mrp, rating, reviews, color1, color2
const rows = [
  ['Aero Runner', 'Stridehouse', 'Running', 3499, 4999, 4.4, 2310, '#2f5bea', '#f2b230'],
  ['Cloud Knit 2', 'Nimbus', 'Running', 5999, 8499, 4.6, 1890, '#1d2a5c', '#7ee0c3'],
  ['Court Classic', 'Lunar', 'Sneakers', 2799, 3999, 4.3, 5120, '#f5f5f2', '#12172b'],
  ['Midnight Low', 'Nimbus', 'Sneakers', 4299, 5999, 4.5, 980, '#12172b', '#f2b230'],
  ['Terra Trek Boot', 'Ridgeline', 'Boots', 7499, 10999, 4.7, 740, '#7a4a2b', '#d9b27c'],
  ['Chelsea Noir', 'Kensington', 'Boots', 8999, 12999, 4.8, 410, '#1a1a1d', '#8a8a92'],
  ['Oxford Heritage', 'Kensington', 'Formal', 6499, 9499, 4.5, 620, '#5b2a1c', '#c98a5a'],
  ['Penny Loafer', 'Kensington', 'Formal', 4999, 6999, 4.2, 830, '#8b5a2b', '#e8c99a'],
  ['Sprint Pro X', 'Lunar', 'Running', 6999, 9999, 4.6, 1340, '#d83a52', '#12172b'],
  ['Retro 86', 'Stridehouse', 'Sneakers', 3999, 5499, 4.4, 2750, '#e9d8a6', '#2f5bea'],
  ['Summit GTX', 'Ridgeline', 'Boots', 9499, 13499, 4.7, 520, '#2f4a3a', '#f2b230'],
  ['Slip-on Breeze', 'Nimbus', 'Sneakers', 1999, 2999, 4.1, 6400, '#9fb4ff', '#ffffff'],
]

export const products = rows.map((a, id) => ({
  id, name: a[0], brand: a[1], cat: a[2], price: a[3], mrp: a[4],
  rating: a[5], reviews: a[6], c1: a[7], c2: a[8],
}))

export const inr = (n) => '₹' + n.toLocaleString('en-IN')
export const off = (p) => Math.round(100 - (p.price / p.mrp) * 100)
