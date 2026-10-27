import Markdown from 'react-markdown'
import { mediaUrl } from '../api/client'
import { cx } from './ui'

// Long-form text is stored as Markdown. Images point at their S3 key (`media/…`), and their alt text is the caption.
export const imageSrc = (src = '') => (src.startsWith('media/') ? mediaUrl(src) : src)

// Shared by the reading page and the editor, so what's typed looks the way it reads.
export const proseClass = cx(
  'font-serif text-ink [&>*+*]:mt-5',
  '[&_h2]:pt-4 [&_h2]:font-serif [&_h2]:text-[1.6em] [&_h2]:leading-tight [&_h2]:tracking-tight',
  '[&_h3]:pt-2 [&_h3]:font-serif [&_h3]:text-[1.25em] [&_h3]:leading-snug',
  '[&_blockquote]:border-l-[3px] [&_blockquote]:border-ink [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-ink-2',
  '[&_a]:text-moss [&_a]:underline [&_a]:underline-offset-2',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li+li]:mt-1.5',
  '[&_hr]:mx-auto [&_hr]:my-10 [&_hr]:w-24 [&_hr]:border-line',
  '[&_strong]:font-semibold',
)

export function Figure({ src, caption, children }) {
  return (
    <figure className="my-8">
      <img src={imageSrc(src)} alt={caption} className="mx-auto max-h-[80vh] max-w-full rounded-md border border-line" />
      {children ?? (caption && <figcaption className="mt-2 text-center font-sans text-[13px] text-ink-2">{caption}</figcaption>)}
    </figure>
  )
}

// Images sit in their own paragraph in Markdown; lifting them out keeps the figure out of a <p>.
const components = {
  p: ({ node, children }) => {
    const only = node.children.length === 1 && node.children[0].tagName === 'img' && node.children[0]
    return only ? <Figure src={only.properties.src} caption={only.properties.alt} /> : <p>{children}</p>
  },
  img: ({ src, alt }) => <img src={imageSrc(src)} alt={alt} className="inline max-h-[1.5em]" />,
  a: ({ href, children }) => (
    <a href={href} target={href?.startsWith('/') ? undefined : '_blank'} rel="noreferrer">
      {children}
    </a>
  ),
}

export default function Prose({ text, className }) {
  return (
    <div className={cx(proseClass, className)}>
      <Markdown components={components}>{text}</Markdown>
    </div>
  )
}
