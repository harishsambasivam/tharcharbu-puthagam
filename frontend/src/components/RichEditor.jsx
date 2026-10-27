import { useRef, useState } from 'react'
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import { NodeSelection } from '@tiptap/pm/state'
import { Bold, GripVertical, Heading2, Heading3, ImagePlus, Italic, Link2, Minus, Plus, Quote } from 'lucide-react'
import { errorText } from '../api/client'
import { Figure, proseClass } from './Prose'
import { cx } from './ui'

// An image with its caption typed underneath, as on Medium. The caption is the image's alt text.
function PictureView({ node, updateAttributes, selected }) {
  return (
    <NodeViewWrapper data-drag-handle>
      <div className={cx('rounded-md', selected && 'outline-2 outline-offset-4 outline-moss')}>
        <Figure src={node.attrs.src}>
          <input
            value={node.attrs.alt || ''}
            onChange={(e) => updateAttributes({ alt: e.target.value })}
            placeholder="Add a caption (optional)"
            className="mt-2 w-full bg-transparent text-center font-sans text-[13px] text-ink-2 outline-none placeholder:text-ink-3"
          />
        </Figure>
      </div>
    </NodeViewWrapper>
  )
}

const Picture = Image.extend({ addNodeView: () => ReactNodeViewRenderer(PictureView) })

// The menus send the editor a transaction whenever these props change, and the editor re-renders on every
// transaction, so they live out here: new ones on each render would loop until React gives up.
// Only for selected text: a selected block (an image, or one picked with its handle) gets no formatting bar.
const showBubble = ({ state, from, to }) => from !== to && !(state.selection instanceof NodeSelection)
const floatingOptions = { placement: 'left', offset: 16 }

const menuButton = (active) => cx('grid size-8 place-items-center rounded-[3px] transition', active ? 'text-lime' : 'text-paper/80 hover:text-paper')

// A Medium-style writing surface: select text for formatting, start an empty line for images and dividers.
// Every paragraph, heading, image and divider is a block with a grip beside it: drag to move, click to select.
// Markdown shortcuts work as you type (`## `, `> `, `- `, `---`). The value goes in and out as Markdown;
// `onUpload(file)` stores an image and resolves to its key.
export default function RichEditor({ value, onChange, onUpload, placeholder, className }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [linking, setLinking] = useState(null)
  const [adding, setAdding] = useState(false)
  const [block, setBlock] = useState(null) // the block under the pointer: { pos, top }
  const fileInput = useRef()
  const addImages = useRef()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, link: { openOnClick: false } }),
      Picture,
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value || '',
    contentType: 'markdown',
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
    editorProps: {
      attributes: {
        class: cx(
          proseClass,
          'min-h-[12rem] outline-none',
          // Images draw their own outline when selected.
          '[&>.ProseMirror-selectednode:not(.react-renderer)]:rounded-sm [&>.ProseMirror-selectednode:not(.react-renderer)]:outline-2 [&>.ProseMirror-selectednode:not(.react-renderer)]:outline-offset-4 [&>.ProseMirror-selectednode:not(.react-renderer)]:outline-moss',
          className,
        ),
      },
      handlePaste: (view, event) => addImages.current(event.clipboardData?.files),
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })
        return addImages.current(event.dataTransfer?.files, at?.pos)
      },
    },
  })

  // Returns whether there were images, so paste and drop know to stop there.
  addImages.current = (files, at) => {
    const images = [...(files || [])].filter((f) => f.type.startsWith('image/'))
    if (!images.length) return false
    ;(async () => {
      setBusy(true)
      setError('')
      try {
        for (const file of images) {
          const key = await onUpload(file)
          const node = { type: 'image', attrs: { src: key, alt: '' } }
          const chain = editor.chain().focus()
          ;(at === undefined ? chain.insertContent(node) : chain.insertContentAt(at, node)).run()
          at = undefined
        }
      } catch (err) {
        setError(errorText(err))
      } finally {
        setBusy(false)
        setAdding(false)
      }
    })()
    return true
  }

  if (!editor) return null

  const setLink = () => {
    const chain = editor.chain().focus().extendMarkRange('link')
    ;(linking.trim() ? chain.setLink({ href: linking.trim() }) : chain.unsetLink()).run()
    setLinking(null)
  }

  // Finds the top-level block level with the pointer (the grip's gutter counts) and lines the grip up with its first line.
  const track = (e) => {
    const { view } = editor
    if (view.dragging) return
    const box = view.dom.getBoundingClientRect()
    const hit = view.posAtCoords({ left: Math.min(Math.max(e.clientX, box.left + 1), box.right - 1), top: e.clientY })
    const { doc } = view.state
    const $at = hit && doc.resolve(hit.inside >= 0 ? hit.inside : hit.pos)
    const pos = $at && ($at.depth ? $at.before(1) : $at.pos)
    const node = $at && doc.nodeAt(pos)
    const dom = node && view.nodeDOM(pos)
    // Empty lines have the "+" there instead.
    if (!dom || (node.isTextblock && !node.content.size)) return setBlock(null)
    const rect = (dom.querySelector?.('img') || dom).getBoundingClientRect()
    const line = node.isTextblock ? parseFloat(getComputedStyle(dom).lineHeight) : NaN
    const top = rect.top - e.currentTarget.getBoundingClientRect().top + (line ? (line - 24) / 2 : 4)
    setBlock((b) => (b?.pos === pos && b.top === top ? b : { pos, top }))
  }

  // Hands the block to ProseMirror's own drag and drop, which moves it to wherever it's dropped.
  const startDrag = (e) => {
    const { view } = editor
    const selection = NodeSelection.create(view.state.doc, block.pos)
    view.dispatch(view.state.tr.setSelection(selection))
    view.dragging = { slice: selection.content(), move: true, node: selection }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', selection.node.textContent)
    e.dataTransfer.setDragImage(view.nodeDOM(block.pos), 0, 0)
  }

  return (
    <div className="relative -ml-10 pl-10" onMouseMove={track} onMouseLeave={() => setBlock(null)} onKeyDown={() => setBlock(null)}>
      {block && (
        <button
          type="button"
          draggable
          onDragStart={startDrag}
          onDragEnd={() => {
            editor.view.dragging = null
            setBlock(null)
          }}
          onClick={() => editor.chain().focus().setNodeSelection(block.pos).run()}
          style={{ top: block.top }}
          aria-label="Move or select this block"
          title="Drag to move · click to select"
          className="absolute left-2 grid size-6 cursor-grab place-items-center rounded-[3px] text-ink-3 transition hover:bg-line/60 hover:text-ink active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <BubbleMenu
        editor={editor}
        shouldShow={showBubble}
        className="flex items-center rounded-md bg-bar px-1 py-1 shadow-lg"
      >
        {linking === null ? (
          <>
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={menuButton(editor.isActive('bold'))} aria-label="Bold">
              <Bold className="size-4" strokeWidth={2.4} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={menuButton(editor.isActive('italic'))} aria-label="Italic">
              <Italic className="size-4" strokeWidth={2.4} />
            </button>
            <button type="button" onClick={() => setLinking(editor.getAttributes('link').href || '')} className={menuButton(editor.isActive('link'))} aria-label="Link">
              <Link2 className="size-4" strokeWidth={2.4} />
            </button>
            <span className="mx-1 h-5 w-px bg-paper/25" />
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={menuButton(editor.isActive('heading', { level: 2 }))} aria-label="Heading">
              <Heading2 className="size-4.5" strokeWidth={2.2} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={menuButton(editor.isActive('heading', { level: 3 }))} aria-label="Subheading">
              <Heading3 className="size-4.5" strokeWidth={2.2} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={menuButton(editor.isActive('blockquote'))} aria-label="Quote">
              <Quote className="size-4" strokeWidth={2.4} />
            </button>
          </>
        ) : (
          <input
            autoFocus
            value={linking}
            onChange={(e) => setLinking(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                setLink()
              }
              if (e.key === 'Escape') setLinking(null)
            }}
            onBlur={setLink}
            placeholder="Paste a link, Enter to save"
            className="w-64 bg-transparent px-2 py-1 text-[13px] text-paper outline-none placeholder:text-paper/50"
          />
        )}
      </BubbleMenu>

      {/* On an empty line, a "+" in the margin opens the inserts. */}
      <FloatingMenu editor={editor} options={floatingOptions} className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setAdding(!adding)}
          aria-label="Insert"
          className={cx('grid size-8 place-items-center rounded-full border border-ink-3 text-ink-2 transition hover:border-ink hover:text-ink', adding && 'rotate-45')}
        >
          <Plus className="size-4" />
        </button>
        {adding && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current.click()}
              aria-label="Add an image"
              title="Add an image"
              className="grid size-8 place-items-center rounded-full border border-moss text-moss hover:bg-moss/10 disabled:opacity-50"
            >
              <ImagePlus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setHorizontalRule().run()
                setAdding(false)
              }}
              aria-label="Add a divider"
              title="Add a divider"
              className="grid size-8 place-items-center rounded-full border border-moss text-moss hover:bg-moss/10"
            >
              <Minus className="size-4" />
            </button>
          </>
        )}
      </FloatingMenu>
      <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => addImages.current(e.target.files) && (e.target.value = '')} />

      <EditorContent editor={editor} />
      {(busy || error) && <p className={cx('mt-3 text-[12px]', error ? 'text-[#b4472e]' : 'text-ink-2')}>{error || 'Uploading image…'}</p>}
    </div>
  )
}
