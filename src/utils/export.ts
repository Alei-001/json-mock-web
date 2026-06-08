import Papa from 'papaparse'

export async function copyToClipboard(data: unknown): Promise<void> {
  const text = JSON.stringify(data, null, 2)
  await navigator.clipboard.writeText(text)
}

export function downloadJson(data: unknown, filename = 'mock-data.json'): void {
  const text = JSON.stringify(data, null, 2)
  const blob = new Blob([text], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function downloadCsv(data: unknown, filename = 'mock-data.csv'): void {
  const items = Array.isArray(data) ? data : [data]
  const csv = Papa.unparse(items)
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}