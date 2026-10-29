export default function Shoe({ c1, c2 }) {
  return (
    <svg viewBox="0 0 200 120" role="img" aria-label="Shoe">
      <ellipse cx="100" cy="106" rx="88" ry="6" fill="#0002" />
      <path d="M12 88Q10 98 22 98H176Q192 98 190 88Z" fill={c2} />
      <path d="M14 88V58Q36 56 56 50L80 28Q96 20 110 34Q128 58 168 64Q192 70 190 88Z" fill={c1} />
      <path d="M80 28Q96 20 110 34L100 44Z" fill={c2} opacity=".5" />
      <path d="M84 42l16 10M96 48l16 10M108 54l16 10" stroke={c2} strokeWidth="4" strokeLinecap="round" />
      <path d="M14 74Q60 80 120 70" stroke={c2} strokeWidth="3" fill="none" opacity=".7" />
    </svg>
  )
}
