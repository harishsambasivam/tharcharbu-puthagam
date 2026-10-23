import { CloudRain, Droplet, Moon, Mountain, Sun, Sunrise, Sunset, Trees, Waves, Wheat, Wind } from 'lucide-react'

// Perum Pozhudhu: the six Tamil seasons. `en` is what the name means; `sub` gives the rough English months,
// as each Tamil month runs mid to mid.
export const SEASONS = [
  { id: 'ilavenil', name: 'Ilavenil', en: 'Early summer', ta: 'இளவேனில்', sub: 'Apr–Jun', subTa: 'சித்திரை–வைகாசி', Icon: Sunrise, tone: 'bg-[#f1edb9]' },
  { id: 'mudhuvenil', name: 'Mudhuvenil', en: 'Late summer', ta: 'முதுவேனில்', sub: 'Jun–Aug', subTa: 'ஆனி–ஆடி', Icon: Sun, tone: 'bg-[#f6d4c2]' },
  { id: 'koothir', name: 'Koothir', en: 'Autumn', ta: 'கூதிர்', sub: 'Aug–Oct', subTa: 'ஆவணி–புரட்டாசி', Icon: Wind, tone: 'bg-[#dde5d3]' },
  { id: 'kaar', name: 'Kaar', en: 'Rainy season', ta: 'கார்', sub: 'Oct–Dec', subTa: 'ஐப்பசி–கார்த்திகை', Icon: CloudRain, tone: 'bg-[#cbd8f1]' },
  { id: 'munpani', name: 'Munpani', en: 'Early winter', ta: 'முன்பனி', sub: 'Dec–Feb', subTa: 'மார்கழி–தை', Icon: Droplet, tone: 'bg-[#e9d7ec]' },
  { id: 'pinpani', name: 'Pinpani', en: 'Late winter', ta: 'பின்பனி', sub: 'Feb–Apr', subTa: 'மாசி–பங்குனி', Icon: Moon, tone: 'bg-[#d4eae2]' },
]

// Ainthinai: the five Tamil landscapes.
export const LANDS = [
  { id: 'kurinji', name: 'Kurinji', ta: 'குறிஞ்சி', sub: 'Hills', subTa: 'மலை', Icon: Mountain, tone: 'bg-[#e3daf1]' },
  { id: 'mullai', name: 'Mullai', ta: 'முல்லை', sub: 'Forest, pasture', subTa: 'காடு', Icon: Trees, tone: 'bg-[#d5e6c7]' },
  { id: 'marutham', name: 'Marutham', ta: 'மருதம்', sub: 'Farmland', subTa: 'வயல்', Icon: Wheat, tone: 'bg-[#f1efbe]' },
  { id: 'neithal', name: 'Neithal', ta: 'நெய்தல்', sub: 'Coast', subTa: 'கடற்கரை', Icon: Waves, tone: 'bg-[#cfe1ee]' },
  { id: 'paalai', name: 'Paalai', ta: 'பாலை', sub: 'Dry land', subTa: 'வறண்ட நிலம்', Icon: Sunset, tone: 'bg-[#f3d9be]' },
]

export const PILL_TONES = {
  Easy: 'bg-[#d5e6c7]',
  Medium: 'bg-[#f5e5b2]',
  Hard: 'bg-rose',
  Pest: 'bg-rose',
  Beneficial: 'bg-lime',
}

// The month (1–12) each season starts, about the 14th, when its first Tamil month begins.
const STARTS = { ilavenil: 4, mudhuvenil: 6, koothir: 8, kaar: 10, munpani: 12, pinpani: 2 }

// The season a day falls in.
export function seasonOn(date = new Date()) {
  const d = new Date(date)
  d.setDate(d.getDate() - 13)
  const month = d.getMonth() + 1
  return SEASONS.find((s) => (month - STARTS[s.id] + 12) % 12 < 2)
}
