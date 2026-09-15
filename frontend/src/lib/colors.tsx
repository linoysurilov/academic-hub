export type PastelId =
  | 'rose'
  | 'peach'
  | 'amber'
  | 'lime'
  | 'mint'
  | 'sky'
  | 'indigo'
  | 'lavender'
  | 'lilac'
  | 'sand'

export const PASTELS: {
  id: PastelId
  label: string
  swatch: string
  bg: string
  text: string
  ring: string
}[] = [
  { id: 'rose', label: 'ורוד', swatch: 'bg-rose-200', bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-300' },
  { id: 'peach', label: 'אפרסק', swatch: 'bg-orange-200', bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-300' },
  { id: 'amber', label: 'חרדל', swatch: 'bg-amber-200', bg: 'bg-amber-100', text: 'text-amber-900', ring: 'ring-amber-300' },
  { id: 'lime', label: 'לימון', swatch: 'bg-lime-200', bg: 'bg-lime-100', text: 'text-lime-900', ring: 'ring-lime-300' },
  { id: 'mint', label: 'מנטה', swatch: 'bg-emerald-200', bg: 'bg-emerald-100', text: 'text-emerald-900', ring: 'ring-emerald-300' },
  { id: 'sky', label: 'תכלת', swatch: 'bg-sky-200', bg: 'bg-sky-100', text: 'text-sky-900', ring: 'ring-sky-300' },
  { id: 'indigo', label: 'אינדיגו', swatch: 'bg-indigo-200', bg: 'bg-indigo-100', text: 'text-indigo-900', ring: 'ring-indigo-300' },
  { id: 'lavender', label: 'לבנדר', swatch: 'bg-violet-200', bg: 'bg-violet-100', text: 'text-violet-900', ring: 'ring-violet-300' },
  { id: 'lilac', label: 'לילך', swatch: 'bg-fuchsia-200', bg: 'bg-fuchsia-100', text: 'text-fuchsia-900', ring: 'ring-fuchsia-300' },
  { id: 'sand', label: 'חול', swatch: 'bg-stone-300', bg: 'bg-stone-100', text: 'text-stone-800', ring: 'ring-stone-400' },
]

export function pastelOf(id?: string) {
  return PASTELS.find((item) => item.id === id) ?? PASTELS[6]
}

export function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (id: PastelId) => void
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-stone-500">צבע</p>
      <div className="flex flex-wrap gap-2">
        {PASTELS.map((color) => (
          <button
            key={color.id}
            type="button"
            title={color.label}
            aria-label={color.label}
            onClick={() => onChange(color.id)}
            className={`h-7 w-7 rounded-full ${color.swatch} ring-offset-2 transition ${
              value === color.id ? `ring-2 ${color.ring}` : 'hover:scale-105'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
