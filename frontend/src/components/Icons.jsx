const Svg = ({ className = 'size-6', strokeWidth = 1.6, children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
)

const leaf = (x, y, dir) => `M${x} ${y}c${2 * dir}-1.6 ${4.6 * dir}-1.6 ${6 * dir} 0c${-1.4 * dir} 1.6 ${-4 * dir} 1.6 ${-6 * dir} 0z`

export const TreeIcon = (p) => (
  <Svg {...p} strokeWidth={p.strokeWidth ?? 2}>
    <ellipse cx="12" cy="9" rx="5" ry="6.5" />
    <path d="M12 15.5V22" />
  </Svg>
)

// Icons for the plant key strip (see the "Plant key" sheet).
const KEY_PATHS = {
  evergreen: (
    <>
      <circle cx="12" cy="9" r="6" fill="currentColor" />
      <path d="M12 15v7" />
    </>
  ),
  deciduous: <path d="M12 22V9M12 13 8 7M12 12l4-6M12 9V3M8 7 6 5.5M8 7l-2.5.3M16 6l1.4-2M16 6l2.5.4" />,
  brevideciduous: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 3a6 6 0 0 0 0 12z" fill="currentColor" />
      <path d="M12 15v7" />
    </>
  ),
  annual: <path d="M12 21v-9M8 21h8M12 12C12 8 9.5 6 5 6c0 4 2.5 6 7 6zM12 10c0-3 2-5 6-5 0 3-2 5-6 5z" />,
  simple: <path d="M12 3c4 4 4.5 11 0 16-4.5-5-4-12 0-16zM12 7v15" />,
  lobed: <path d="m12 3 2 3.5 3.5-1-1 4 3.5 1.5-3.5 2.5 1 3-3.5-1L12 19l-2-3.5-3.5 1 1-3L4 11l3.5-1.5-1-4 3.5 1zM12 9v13" />,
  pinnate: <path d={['M12 3v19', ...[6, 10, 14].flatMap((y) => [leaf(12, y, -1), leaf(12, y, 1)])].join('')} />,
  digitate: (
    <>
      <path d="M12 22v-9" />
      {[-64, -32, 0, 32, 64].map((a) => (
        <ellipse key={a} cx="12" cy="7.5" rx="1.7" ry="4.2" transform={`rotate(${a} 12 12.5)`} />
      ))}
    </>
  ),
  palm: <path d="M12 22V11M12 11 4 8M12 11 7 4.5M12 11V3.5M12 11l5-6.5M12 11l8-3M4 8c2 2 14 2 16 0" />,
  alternate: <path d={['M12 3v19', leaf(12, 8, -1), leaf(12, 13, 1), leaf(12, 18, -1)].join('')} />,
  opposite: <path d={['M12 3v19', leaf(12, 8, -1), leaf(12, 8, 1), leaf(12, 15, -1), leaf(12, 15, 1)].join('')} />,
  decussate: (
    <>
      <path d={['M12 3v19', leaf(12, 7, -1), leaf(12, 7, 1), leaf(12, 17, -1), leaf(12, 17, 1)].join('')} />
      <ellipse cx="12" cy="12" rx="1.6" ry="2.6" fill="currentColor" />
    </>
  ),
  spiral: <path d="M12 3v19M8 7c0-2.5 8-2.5 8 0.5s-8 3.5-8 6.5 8 3.5 8 6.5" />,
  whorled: <path d="M12 3v19M6 6l12 6M18 6 6 12M12 5v8M6 13l12 6M18 13 6 19" />,
}

export const hasKeyIcon = (name) => name in KEY_PATHS

export const KeyIcon = ({ name, className }) => <Svg className={className}>{KEY_PATHS[name]}</Svg>

// Icons for the monthly observances in the calendar. Ones without an icon show as a dot.
const VILVA = 'M12 13.6c-2.9-1.9-3.8-7.4 0-11.2 3.8 3.8 2.9 9.3 0 11.2z'
const SIDE_LEAVES = ['rotate(-70 12 14) translate(0 1)', 'rotate(70 12 14) translate(0 1)']
const OBSERVANCE_PATHS = {
  // Murugan's peacock, its tail fanned behind it.
  sashti: (
    <>
      <path d="M2.8 17A2.5 2.5 0 0 1 4 12.4a2.5 2.5 0 0 1 3.4-3.4 2.5 2.5 0 0 1 4.6-1.2 2.5 2.5 0 0 1 4.6 1.2 2.5 2.5 0 0 1 3.4 3.4 2.5 2.5 0 0 1 1.2 4.6M2.8 17h6.4m5.6 0h6.4" />
      {[[6.2, 14.9], [8.3, 11.8], [15.7, 11.8], [17.8, 14.9]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="1" fill="currentColor" stroke="none" />
      ))}
      <path d="M12 10.1c.9 0 1.5.8 1.2 1.7l-.5 2.3c1.6.6 2.6 2 2.6 3.6 0 1.3-.7 2.3-1.8 2.8h-3c-1.1-.5-1.8-1.5-1.8-2.8 0-1.6 1-3 2.6-3.6l-.5-2.3c-.3-.9.3-1.7 1.2-1.7z" />
      <path d="m10.9 11.2-1 .5 1 .3M12 10.1 11.1 8.4M12 10V8.1m0 2 .9-1.7m-1.7 12.3v2m1.6-2v2" />
    </>
  ),
  // Pillaiyar's elephant.
  chathurthi: (
    <>
      <path d="M20.5 9.2C19.6 6.6 17.2 5 14.3 5H11c-1.4 0-2.6.4-3.6 1.1-2 .2-3.6 1.8-3.6 4v4.5c0 1-.5 1.4-1.2 1.2 0 1.5 1 2.2 1.9 2 1-.2 1.5-1 1.5-2.2V13c.5.4 1.1.6 1.8.6V19h2.8v-2.7H15V19h2.8v-3.4c1-.6 1.7-1.3 2.1-2.2.6-1.4.6-2.9.1-4.2" />
      <path d="M9.4 7.2c-1.7.5-2.2 2.8-1.3 4.5.8 1.4 2.6 1.4 3.3.2M6.4 12.4c.9.9 2 1.1 3 .7" />
      <circle cx="5.8" cy="9.3" r=".5" fill="currentColor" stroke="none" />
    </>
  ),
  // Vishnu's conch.
  ekadasi: (
    <>
      <path d="m12 1.6 1.4 2.3 2.1.6.9 2c2.3 1.7 3.3 4.5 2.7 7.5-.6 3-2.8 5.4-5.4 6.6l-1 2h-1.4l-1-2C7.7 19.4 5.5 17 4.9 14c-.6-3 .4-5.8 2.7-7.5l.9-2 2.1-.6zM8.4 6.6h7.2m.2 2.2c-2.7 2.6-3.3 7.8-1.5 11.4" />
      <path d="M7 11c1.7.8 3.6 1.1 5.3 1m-5.7 2.6c1.9.9 3.9 1.2 5.6 1" strokeWidth="1.1" />
    </>
  ),
  // Siva's three-leafed vilvam.
  pradosham: (
    <>
      {['', ...SIDE_LEAVES].map((t) => (
        <g key={t} transform={t || undefined}>
          <path d={VILVA} />
          <path d="M12 12.4V6" strokeWidth="1" />
        </g>
      ))}
      <path d="M12 13.6V22" />
    </>
  ),
  // The lingam on its pedestal, with the three lines of holy ash.
  sivaratri: (
    <>
      <path d="M8.8 12.6V7.8a3.2 3.2 0 0 1 6.4 0v4.8M4 12.6h14.2l3 1.5c.7.4.5 1.4-.3 1.4H18M5.2 12.6v2.6c0 .9.7 1.5 1.5 1.5h10c.8 0 1.5-.6 1.5-1.5v-2.6M7.2 16.7v2.5h9.6v-2.5M5.4 21.6h13.2l-1.8-2.4H7.2z" />
      <path d="M10.4 7.4h3.2M10.4 9h3.2m-3.2 1.6h3.2" strokeWidth="1" />
      <circle cx="12" cy="5.8" r=".45" fill="currentColor" stroke="none" />
    </>
  ),
}
// Sankatahara Chathurthi and the waxing-moon Pradosham are the same marks in gold.
OBSERVANCE_PATHS.sankatahara = OBSERVANCE_PATHS.chathurthi
OBSERVANCE_PATHS.valarpradosham = OBSERVANCE_PATHS.pradosham
const GOLD = ['sankatahara', 'valarpradosham']

export const hasObservanceIcon = (name) => name in OBSERVANCE_PATHS

export const ObservanceIcon = ({ name, className = 'size-5' }) => (
  <Svg className={GOLD.includes(name) ? `${className} text-[#c9952b]` : className} strokeWidth={1.5}>
    {OBSERVANCE_PATHS[name]}
  </Svg>
)

// Five notched petals around a stamened centre. Pass several colours and the petals take turns.
const PETAL = 'M12 11.6C9.2 9.8 8.1 6.1 9.4 3.9c.7-1.2 1.9-1.1 2.6 0 .7-1.1 1.9-1.2 2.6 0 1.3 2.2.2 5.9-2.6 7.7Z'
export const FlowerIcon = ({ colour = '#ffffff', className }) => {
  const colours = [colour].flat()
  return (
    <svg viewBox="0 0 24 24" className={className}>
      {[0, 72, 144, 216, 288].map((a, i) => (
        <g key={a} transform={`rotate(${a} 12 12.4)`}>
          <path d={PETAL} fill={colours[i % colours.length]} stroke="#1d211b" strokeOpacity=".6" strokeWidth="1" strokeLinejoin="round" />
          <path d="M12 10.4V6.2" stroke="#1d211b" strokeOpacity=".22" strokeWidth=".8" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="12" cy="12.4" r="2.5" fill="#f2c14e" stroke="#1d211b" strokeOpacity=".6" strokeWidth=".9" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx="12" cy="11.2" r=".45" fill="#9a5a12" transform={`rotate(${a + 36} 12 12.4)`} />
      ))}
    </svg>
  )
}

// The site's mark: a rooted sprout inside a closing loop, for growing your own in a cycle that feeds itself.
export const Logo = ({ className = 'size-7' }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M27.3 9.5A13 13 0 1 1 22.5 4.7M18.9 5l3.6-.3-1.6-3.2" />
    <path d="M16 22.5V14M16 17.5c0-3.5-2.4-5.5-6-5.5 0 3.5 2.4 5.5 6 5.5ZM16 14.5c0-3 2-4.8 5-4.8 0 3-2 4.8-5 4.8Z" />
    <path d="M10.5 22.5h11M16 22.5l-2 2.5M16 22.5l2 2.5" />
  </svg>
)
