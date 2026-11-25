/**
 * Parse RFC-4180 CSV text supporting quoted fields, commas inside quotes, and CRLF/LF.
 */
export function parseCSVText(csvText: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentVal += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
        currentRow = [];
        currentVal = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
  }
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim()).filter(Boolean);
  const result: Array<Record<string, string>> = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && row[0] === '') continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ?? '';
    });
    result.push(obj);
  }
  return result;
}

/**
 * Resolve a URL parameter value that may be:
 * - An HTTP/HTTPS URL (direct fetch with /api/image-proxy CORS fallback)
 * - A data: URI (base64 or UTF-8)
 * - A Base64-encoded string
 * - Raw text (JSON or CSV)
 */
export async function resolveTextParam(rawParam: string): Promise<string | null> {
  if (!rawParam || typeof rawParam !== 'string') return null;
  const trimmed = rawParam.trim();

  // 1. data: URI
  if (trimmed.startsWith('data:')) {
    const commaIdx = trimmed.indexOf(',');
    if (commaIdx === -1) return null;
    const meta = trimmed.slice(0, commaIdx);
    const payload = trimmed.slice(commaIdx + 1);
    if (meta.includes(';base64')) {
      try {
        return decodeURIComponent(escape(atob(payload)));
      } catch {
        return atob(payload);
      }
    }
    return decodeURIComponent(payload);
  }

  // 2. HTTP(S) URL
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const res = await fetch(trimmed);
      if (res.ok) return await res.text();
    } catch {
      // Fallback through proxy for CORS-restricted URLs
    }
    try {
      const proxied = await fetch(`/api/image-proxy?url=${encodeURIComponent(trimmed)}`);
      if (proxied.ok) return await proxied.text();
    } catch (e) {
      console.error('Failed to fetch URL parameter:', e);
    }
    return null;
  }

  // 3. Raw JSON or CSV
  if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.includes(',')) {
    return trimmed;
  }

  // 4. Local file:// path cannot be read directly by browser fetch due to sandbox
  if (trimmed.startsWith('file://') || /^[a-zA-Z]:\\/.test(trimmed) || trimmed.startsWith('/storage/') || trimmed.startsWith('/data/')) {
    console.warn('Browser security blocks direct fetch of local file paths:', trimmed, 'Use Base64/data: URI or window.DezignerBridge.loadProjectAndCsv() from Flutter WebView.');
    return null;
  }

  // 5. Try Base64 decode
  try {
    const normalized = trimmed.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4;
    const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
    return decodeURIComponent(escape(atob(padded)));
  } catch {
    return trimmed;
  }
}
