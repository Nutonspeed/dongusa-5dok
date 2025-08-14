export function buildCSV(headers: string[], rows: Array<Array<string | number>>): string {
  const bom = '\uFEFF';
  const lines = [headers, ...rows].map((r) => r.join(',')).join('\n');
  return bom + lines + '\n';
}
