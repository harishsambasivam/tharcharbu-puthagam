// The Tamil calendar, worked out from where the sun and moon are, for India (IST).
//
// - Tamil month: the sidereal sign the sun is in (Lahiri ayanamsa). A day belongs to the month the sun is in at
//   sunset, so a month whose sun enters its sign before sunset starts that day.
// - Lunar day (thithi): the moon's lead over the sun in 12° steps, as it stands at sunrise. 1–15 waxing
//   (valarpirai), 16–30 waning (theipirai); 15 is the full moon (pournami), 30 the new moon (amavasai).
// - Star (nakshatram): the moon's sidereal place in 27 parts, at sunrise.
// - Monthly observances (Ekadasi, Pradosham, ...) fall on the day their thithi holds at the hour it is kept: sunrise,
//   noon, sunset or moonrise. A thithi that starts and ends between two of those hours goes to the day it ends.
// Positions use the short series from Meeus, Astronomical Algorithms (good to a few hundredths of a degree);
// sunrise and sunset are taken as 6:00 and 18:00 IST, so a thithi or star that changes right at dawn may show a day off.

export const T_MONTHS = [
  ['Chithirai', 'சித்திரை'], ['Vaikasi', 'வைகாசி'], ['Aani', 'ஆனி'], ['Aadi', 'ஆடி'], ['Aavani', 'ஆவணி'], ['Purattasi', 'புரட்டாசி'],
  ['Aippasi', 'ஐப்பசி'], ['Karthigai', 'கார்த்திகை'], ['Margazhi', 'மார்கழி'], ['Thai', 'தை'], ['Maasi', 'மாசி'], ['Panguni', 'பங்குனி'],
]
export const WEEKDAYS = [
  ['Sunday', 'ஞாயிறு'], ['Monday', 'திங்கள்'], ['Tuesday', 'செவ்வாய்'], ['Wednesday', 'புதன்'], ['Thursday', 'வியாழன்'], ['Friday', 'வெள்ளி'], ['Saturday', 'சனி'],
]
const THITHIS = [
  ['Prathamai', 'பிரதமை'], ['Dwithiyai', 'துவிதியை'], ['Thrithiyai', 'திருதியை'], ['Chathurthi', 'சதுர்த்தி'], ['Panchami', 'பஞ்சமி'],
  ['Sashti', 'சஷ்டி'], ['Sapthami', 'சப்தமி'], ['Ashtami', 'அஷ்டமி'], ['Navami', 'நவமி'], ['Dasami', 'தசமி'], ['Ekadasi', 'ஏகாதசி'],
  ['Dwadasi', 'துவாதசி'], ['Thrayodasi', 'திரயோதசி'], ['Chathurdasi', 'சதுர்த்தசி'],
]
const PAURNAMI = ['Pournami', 'பௌர்ணமி']
const AMAVASAI = ['Amavasai', 'அமாவாசை']
export const STARS = [
  ['Ashwini', 'அசுவினி'], ['Bharani', 'பரணி'], ['Karthigai', 'கார்த்திகை'], ['Rohini', 'ரோகிணி'], ['Mirugasirisham', 'மிருகசீரிடம்'],
  ['Thiruvathirai', 'திருவாதிரை'], ['Punarpoosam', 'புனர்பூசம்'], ['Poosam', 'பூசம்'], ['Ayilyam', 'ஆயில்யம்'], ['Magam', 'மகம்'],
  ['Pooram', 'பூரம்'], ['Uthiram', 'உத்திரம்'], ['Hastham', 'அஸ்தம்'], ['Chithirai', 'சித்திரை'], ['Swathi', 'சுவாதி'], ['Visakam', 'விசாகம்'],
  ['Anusham', 'அனுஷம்'], ['Kettai', 'கேட்டை'], ['Moolam', 'மூலம்'], ['Pooradam', 'பூராடம்'], ['Uthiradam', 'உத்திராடம்'],
  ['Thiruvonam', 'திருவோணம்'], ['Avittam', 'அவிட்டம்'], ['Sadhayam', 'சதயம்'], ['Poorattathi', 'பூரட்டாதி'], ['Uthirattathi', 'உத்திரட்டாதி'], ['Revathi', 'ரேவதி'],
]
// The sixty-year cycle; Prabhava began in April 1987.
const YEARS = [
  ['Prabhava', 'பிரபவ'], ['Vibhava', 'விபவ'], ['Sukla', 'சுக்ல'], ['Pramodhoota', 'பிரமோதூத'], ['Prajorpathi', 'பிரசோற்பத்தி'], ['Aangirasa', 'ஆங்கீரச'],
  ['Srimukha', 'ஸ்ரீமுக'], ['Bhava', 'பவ'], ['Yuva', 'யுவ'], ['Dhaathu', 'தாது'], ['Eswara', 'ஈஸ்வர'], ['Vehudhanya', 'வெகுதானிய'],
  ['Pramathi', 'பிரமாதி'], ['Vikrama', 'விக்கிரம'], ['Vishu', 'விஷு'], ['Chithirabhanu', 'சித்திரபானு'], ['Subhanu', 'சுபானு'], ['Thaarana', 'தாரண'],
  ['Paarthiba', 'பார்த்திப'], ['Viya', 'விய'], ['Sarvajith', 'சர்வசித்து'], ['Sarvadhari', 'சர்வதாரி'], ['Virodhi', 'விரோதி'], ['Vikruthi', 'விக்ருதி'],
  ['Kara', 'கர'], ['Nandhana', 'நந்தன'], ['Vijaya', 'விஜய'], ['Jaya', 'ஜய'], ['Manmatha', 'மன்மத'], ['Dhunmukhi', 'துன்முகி'],
  ['Hevilambi', 'ஹேவிளம்பி'], ['Vilambi', 'விளம்பி'], ['Vikari', 'விகாரி'], ['Sarvari', 'சார்வரி'], ['Plava', 'பிலவ'], ['Subakruthu', 'சுபகிருது'],
  ['Sobakruthu', 'சோபகிருது'], ['Krodhi', 'குரோதி'], ['Visuvaavasu', 'விசுவாவசு'], ['Parabhava', 'பராபவ'], ['Plavanga', 'பிலவங்க'], ['Keelaka', 'கீலக'],
  ['Saumya', 'சௌமிய'], ['Sadharana', 'சாதாரண'], ['Virodhikruthu', 'விரோதகிருது'], ['Paridhaabi', 'பரிதாபி'], ['Pramaadhisa', 'பிரமாதீச'], ['Aanandha', 'ஆனந்த'],
  ['Rakshasa', 'ராட்சச'], ['Nala', 'நள'], ['Pingala', 'பிங்கள'], ['Kalayukthi', 'காளயுக்தி'], ['Siddharthi', 'சித்தார்த்தி'], ['Raudhri', 'ரௌத்திரி'],
  ['Dhunmathi', 'துன்மதி'], ['Dhundhubhi', 'துந்துபி'], ['Rudhrodhgaari', 'ருத்ரோத்காரி'], ['Rakthakshi', 'ரக்தாட்சி'], ['Krodhana', 'குரோதன'], ['Akshaya', 'அட்சய'],
]

const DEG = Math.PI / 180
const norm = (x) => ((x % 360) + 360) % 360
const sin = (x) => Math.sin(x * DEG)
const IST = 5.5 * 3600_000
const DAY = 86400_000

// Julian centuries since J2000 for a moment (ms since 1970, UTC).
const centuries = (ms) => (ms / DAY + 2440587.5 - 2451545) / 36525

function sunLongitude(T) {
  const M = 357.52911 + 35999.05029 * T
  const C = (1.914602 - 0.004817 * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M)
  return norm(280.46646 + 36000.76983 * T + C - 0.00569 - 0.00478 * sin(125.04 - 1934.136 * T))
}

function moonLongitude(T) {
  const L = 218.3164477 + 481267.88123421 * T
  const D = 297.8501921 + 445267.1114034 * T
  const M = 357.5291092 + 35999.0502909 * T
  const Mm = 134.9633964 + 477198.8675055 * T
  const F = 93.272095 + 483202.0175233 * T
  const E = 1 - 0.002516 * T
  const terms =
    6.288774 * sin(Mm) + 1.274027 * sin(2 * D - Mm) + 0.658314 * sin(2 * D) + 0.213618 * sin(2 * Mm) - 0.185116 * E * sin(M) - 0.114332 * sin(2 * F) +
    0.058793 * sin(2 * D - 2 * Mm) + 0.057066 * E * sin(2 * D - M - Mm) + 0.053322 * sin(2 * D + Mm) + 0.045758 * E * sin(2 * D - M) -
    0.040923 * E * sin(M - Mm) - 0.03472 * sin(D) - 0.030383 * E * sin(M + Mm) + 0.015327 * sin(2 * D - 2 * F) - 0.012528 * sin(Mm + 2 * F) +
    0.01098 * sin(Mm - 2 * F) + 0.010675 * sin(4 * D - Mm) + 0.010034 * sin(3 * Mm) + 0.008548 * sin(4 * D - 2 * Mm) - 0.007888 * E * sin(2 * D + M - Mm) -
    0.006766 * E * sin(2 * D + M) - 0.005163 * sin(D - Mm) + 0.004987 * E * sin(D + M) + 0.004036 * E * sin(2 * D - M + Mm)
  return norm(L + terms - 0.00478 * sin(125.04 - 1934.136 * T))
}

// Lahiri: 23°51′11″ at J2000, moving about 50.28″ a year.
const ayanamsa = (T) => 23.8531 + 1.39663 * T

// A day in India as UTC milliseconds at its midnight IST; `at(day, hours)` is that day's moment at a time of day.
export const indiaDay = (date = new Date()) => {
  const d = new Date(+date + IST)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - IST
}
const at = (day, hours) => day + hours * 3600_000
const sunSign = (ms) => {
  const T = centuries(ms)
  return Math.floor(norm(sunLongitude(T) - ayanamsa(T)) / 30)
}

function sky(ms) {
  const T = centuries(ms)
  const sun = sunLongitude(T)
  const moon = moonLongitude(T)
  return { elongation: norm(moon - sun), star: Math.floor(norm(moon - ayanamsa(T)) / (360 / 27)) }
}

// The thithi at each hour an observance is kept: sunrise, noon, sunset and moonrise (taken as 21:00).
const HOURS = [6, 12, 18, 21]
const thithisOn = (day) => Object.fromEntries(HOURS.map((h) => [h, Math.floor(sky(at(day, h)).elongation / 12) + 1]))

// Everything the calendar shows for one day.
function dayInfo(day, month, tDay) {
  const g = new Date(day + IST)
  const dawn = sky(at(day, 6))
  const thithis = thithisOn(day)
  const thithi = thithis[6]
  return {
    day,
    year: g.getUTCFullYear(),
    month: g.getUTCMonth(),
    date: g.getUTCDate(),
    weekday: g.getUTCDay(),
    tMonth: month,
    tDay,
    thithi,
    waxing: thithi <= 15,
    elongation: dawn.elongation,
    star: dawn.star,
    eveningStar: sky(at(day, 18)).star,
    thithis,
  }
}

// Consecutive days from `from` (an indiaDay) for `count` days, each with its Tamil date.
export function days(from, count) {
  let start = from
  while (sunSign(at(start - DAY, 18)) === sunSign(at(from, 18))) start -= DAY
  const out = []
  let month = sunSign(at(start, 18))
  let tDay = 0
  for (let d = start; d < from + count * DAY; d += DAY) {
    const sign = sunSign(at(d, 18))
    tDay = sign === month ? tDay + 1 : 1
    month = sign
    if (d >= from) out.push(dayInfo(d, month, tDay))
  }
  return markFestivals(out)
}

export const today = () => days(indiaDay(), 1)[0]

// Days fixed by the Tamil date, and ones set by the star in a given month (the first such day in it).
const ON_DATE = [
  [0, 1, 'Tamil New Year', 'தமிழ்ப் புத்தாண்டு'],
  [3, 18, 'Aadi Perukku', 'ஆடிப் பெருக்கு'],
  [9, 1, 'Thai Pongal', 'தைப் பொங்கல்'],
  [9, 2, 'Maattu Pongal', 'மாட்டுப் பொங்கல்'],
  [9, 3, 'Kaanum Pongal', 'காணும் பொங்கல்'],
]
const BY_STAR = [
  [1, 15, 'Vaikasi Visakam', 'வைகாசி விசாகம்'],
  [7, 2, 'Karthigai Deepam', 'கார்த்திகை தீபம்', 'evening'],
  [9, 7, 'Thai Poosam', 'தைப்பூசம்'],
  [11, 11, 'Panguni Uthiram', 'பங்குனி உத்திரம்'],
]

// Thithi, the hour it is kept at, and its icon (see ObservanceIcon). Some take a festival's name in one Tamil month.
const OBSERVANCES = [
  [11, 6, 'ekadasi', 'Ekadasi', 'ஏகாதசி'],
  [26, 6, 'ekadasi', 'Ekadasi', 'ஏகாதசி'],
  [13, 18, 'valarpradosham', 'Valarpirai Pradosham', 'வளர்பிறை பிரதோஷம்'],
  [28, 18, 'pradosham', 'Pradosham', 'பிரதோஷம்'],
  [4, 12, 'chathurthi', 'Chathurthi', 'சதுர்த்தி', [4, 'Vinayagar Chathurthi', 'விநாயகர் சதுர்த்தி']],
  [19, 21, 'sankatahara', 'Sankatahara Chathurthi', 'சங்கடஹர சதுர்த்தி'],
  [6, 12, 'sashti', 'Sashti Viratham', 'சஷ்டி விரதம்'],
  [29, 18, 'sivaratri', 'Masa Sivaratri', 'மாத சிவராத்திரி', [10, 'Maha Sivaratri', 'மகா சிவராத்திரி']],
]

// Whether thithi `n` began between the previous day's reading and this one's, so each is marked once a lunar month.
const reached = (before, now, n) => {
  const k = (n - before + 30) % 30
  return k > 0 && k <= (now - before + 30) % 30
}

function markFestivals(list) {
  const seen = new Set()
  return list.map((d, i) => {
    const next = list[i + 1]
    const before = i ? list[i - 1].thithis : thithisOn(d.day - DAY)
    const festivals = []
    const observances = []
    for (const [n, hour, icon, en, ta, yearly] of OBSERVANCES) {
      if (!reached(before[hour], d.thithis[hour], n)) continue
      const key = yearly && `${d.year}-${yearly[1]}`
      if (yearly && d.tMonth === yearly[0] && !seen.has(key)) {
        seen.add(key)
        festivals.push([yearly[1], yearly[2]])
      } else observances.push([en, ta, icon])
    }
    for (const [m, n, en, ta] of ON_DATE) if (d.tMonth === m && d.tDay === n) festivals.push([en, ta])
    if (next && next.tMonth === 9 && next.tDay === 1) festivals.push(['Bhogi', 'போகி'])
    for (const [m, star, en, ta, evening] of BY_STAR) {
      const key = `${d.year}-${en}`
      if (d.tMonth === m && (evening ? d.eveningStar : d.star) === star && !seen.has(key)) {
        seen.add(key)
        festivals.push([en, ta])
      }
    }
    if (d.tMonth === 0 && d.thithi === 15) festivals.push(['Chithirai Pournami', 'சித்திரை பௌர்ணமி'])
    return { ...d, festivals, observances }
  })
}

// Names in the reader's language: `lang` picks English (0) or Tamil (1) from each pair.
const pick = (pair, ta) => pair[ta ? 1 : 0]
export const tMonthName = (i, ta) => pick(T_MONTHS[i], ta)
export const thithiName = (n, ta) => pick(n === 15 ? PAURNAMI : n === 30 ? AMAVASAI : THITHIS[(n - 1) % 15], ta)
export const starName = (i, ta) => pick(STARS[i], ta)
export const weekdayName = (i, ta) => pick(WEEKDAYS[i], ta)
export const pakshaName = (waxing, ta) => (ta ? (waxing ? 'வளர்பிறை' : 'தேய்பிறை') : waxing ? 'Valarpirai' : 'Theipirai')

// The Tamil year a day falls in, which starts on Chithirai 1 (mid-April).
export function yearName(d, ta) {
  const start = d.year - (d.month <= 3 && d.tMonth >= 8 ? 1 : 0)
  return pick(YEARS[(((start - 1987) % 60) + 60) % 60], ta)
}

// The next full and new moon on or after a day, as days from it.
export function nextMoons(from = indiaDay()) {
  const list = days(from, 31)
  const find = (n) => list.findIndex((d) => d.thithi === n)
  return { full: find(15), new: find(30) }
}

// The next few festivals within about a year, each with how many days off it is.
export function nextFestivals(count = 3, from = indiaDay()) {
  return days(from, 370)
    .flatMap((day, i) => day.festivals.map((name) => ({ in: i, day, name })))
    .slice(0, count)
}

// The Tamil months a phrase names, like "ஆனி–ஆடி, ஐப்பசி–கார்த்திகை, தை". A dash between two months means the
// months from one to the other, wrapping past Panguni.
export function monthsIn(text = '') {
  const out = new Set()
  for (const part of text.split(/[,;]|மற்றும்|\bor\b|அல்லது/)) {
    const found = []
    for (const [i, [, ta]] of T_MONTHS.entries()) {
      const at = part.search(new RegExp(`(?<![\\u0B80-\\u0BFF])${ta}`))
      if (at >= 0) found.push([at, i])
    }
    const months = found.sort((a, b) => a[0] - b[0]).map(([, i]) => i)
    if (months.length >= 2 && /[–-]/.test(part)) {
      for (let m = months[0]; ; m = (m + 1) % 12) {
        out.add(m)
        if (m === months[months.length - 1]) break
      }
    } else months.forEach((m) => out.add(m))
  }
  return out
}
