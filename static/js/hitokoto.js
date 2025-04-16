// Emotional sayings
const Hitokoto = [
  '大雨之后，是漫长的潮湿。',
  '控制，收容，保护。',
  '我爱你。晚安。',
  'CSS。我草。',
  '仿生人会梦见电子羊吗？'
]

export function randomHitokoto() {
  return Hitokoto[Math.floor(Math.random() * Hitokoto.length)]
}
