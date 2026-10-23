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
