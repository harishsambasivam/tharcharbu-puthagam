import { Columns3 } from 'lucide-react'
import { Kicker, Popover, Toggle } from '../../components/ui'
import { useT } from '../../config/i18n'

export default function ColumnsMenu({ columns, visible, onChange }) {
  const t = useT()
  const groups = [...new Set(columns.map((c) => c.group))]
  const toggle = (id, on) => onChange(on ? [...visible, id] : visible.filter((v) => v !== id))
  return (
    <Popover
      align="right"
      className="max-h-[65vh] w-[300px] overflow-y-auto"
      trigger={({ toggle: open }) => (
        <button type="button" onClick={open} className="flex h-10 items-center gap-2 px-3 text-[15px]">
          <Columns3 className="size-4" strokeWidth={1.6} /> {t('Columns')} <span className="font-mono text-[13px]">{visible.length}</span>
        </button>
      )}
    >
      {() => (
        <div className="px-3 pb-3">
          <p className="border-b border-line px-2 py-3 text-[13px] text-ink-2">{t('Name is always shown.')}</p>
          {groups.map((g) => (
            <div key={g} className="border-b border-line px-2 py-3 last:border-0">
              <Kicker className="mb-2">{t(g)}</Kicker>
              {columns
                .filter((c) => c.group === g)
                .map((c) => (
                  <label key={c.id} className="flex items-center justify-between py-1.5 text-[15px]">
                    {t(c.label)}
                    <Toggle checked={visible.includes(c.id)} onChange={(on) => toggle(c.id, on)} />
                  </label>
                ))}
            </div>
          ))}
        </div>
      )}
    </Popover>
  )
}
