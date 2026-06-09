const Hitokoto = [
  '大雨之后，是漫长的潮湿。',
  '控制，收容，保护。',
  '晚安。',
  'CSS。我草。',
  'いっそ何もかも捨てちまえば。',
  'Nonsense.',
  'Ad astra per aspera.',
  '世界の広さを、自分で知りたかった。',
  '花さそふ 嵐の庭の 雪ならで ふりゆくものは わが身なりけり'
]

export function randomHitokoto() {
  return Hitokoto[Math.floor(Math.random() * Hitokoto.length)]
}
