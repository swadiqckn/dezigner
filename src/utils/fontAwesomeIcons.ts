import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

export type FaCategory = 'solid' | 'regular' | 'brands';

export interface FaCatalogItem {
  /** Canonical JSON name, e.g. "fa-solid fa-phone" or "fa-brands fa-instagram" */
  id: string;
  /** Short icon name, e.g. "phone" */
  name: string;
  category: FaCategory;
  definition: IconDefinition;
}

const solidByName = new Map<string, IconDefinition>();
const regularByName = new Map<string, IconDefinition>();
const brandsByName = new Map<string, IconDefinition>();

function indexPack(
  pack: Record<string, IconDefinition>,
  map: Map<string, IconDefinition>,
  category: FaCategory,
  prefixClass: string,
  out: FaCatalogItem[]
) {
  const seen = new Set<string>();
  for (const val of Object.values(pack)) {
    if (!val || !val.iconName || !Array.isArray(val.icon)) continue;
    if (seen.has(val.iconName)) continue;
    seen.add(val.iconName);
    map.set(val.iconName, val);
    out.push({
      id: `${prefixClass} fa-${val.iconName}`,
      name: val.iconName,
      category,
      definition: val,
    });
  }
}

const catalog: FaCatalogItem[] = [];
indexPack(fas as unknown as Record<string, IconDefinition>, solidByName, 'solid', 'fa-solid', catalog);
indexPack(far as unknown as Record<string, IconDefinition>, regularByName, 'regular', 'fa-regular', catalog);
indexPack(fab as unknown as Record<string, IconDefinition>, brandsByName, 'brands', 'fa-brands', catalog);

export const FA_ICON_CATALOG: FaCatalogItem[] = catalog;

/**
 * Resolves standard FontAwesome icon names into an IconDefinition.
 * Supports:
 * - "fa-solid fa-phone" / "fas fa-phone"
 * - "fa-regular fa-heart" / "far fa-heart"
 * - "fa-brands fa-instagram" / "fab fa-instagram"
 * - "fa-phone" or "phone" (searches solid -> regular -> brands)
 * - camelCase like "faPhone"
 */
export function resolveFontAwesomeIcon(rawName?: string): IconDefinition | null {
  if (!rawName) return null;
  const trimmed = rawName.trim();
  if (!trimmed) return null;

  const tokens = trimmed.split(/\s+/);
  let requestedPack: FaCategory | null = null;
  let iconToken = tokens[tokens.length - 1];

  for (const tok of tokens) {
    const low = tok.toLowerCase();
    if (low === 'fa-solid' || low === 'fas') requestedPack = 'solid';
    else if (low === 'fa-regular' || low === 'far') requestedPack = 'regular';
    else if (low === 'fa-brands' || low === 'fab') requestedPack = 'brands';
  }

  // Convert camelCase "faPhone" -> "phone", or strip leading "fa-"
  let normalized = iconToken;
  if (/^fa[A-Z]/.test(normalized)) {
    normalized = normalized
      .slice(2)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  } else {
    normalized = normalized.toLowerCase().replace(/^fa-/, '');
  }

  if (requestedPack === 'solid') return solidByName.get(normalized) || null;
  if (requestedPack === 'regular') return regularByName.get(normalized) || null;
  if (requestedPack === 'brands') return brandsByName.get(normalized) || null;

  return (
    solidByName.get(normalized) ||
    regularByName.get(normalized) ||
    brandsByName.get(normalized) ||
    null
  );
}

/**
 * Converts a FontAwesome IconDefinition to standalone SVG markup for Konva / Canvas rendering.
 */
export function fontAwesomeIconToSvgMarkup(
  def: IconDefinition,
  fillColor: string,
  strokeColor?: string,
  strokeWidth?: number
): string {
  const [w, h, , , svgPathData] = def.icon;
  const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];
  const strokeAttr =
    strokeColor && strokeColor !== 'transparent' && (strokeWidth ?? 0) > 0
      ? ` stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"`
      : '';

  const pathElements = paths
    .map((d) => `<path d="${d}" fill="${fillColor}"${strokeAttr}/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 ${w} ${h}">${pathElements}</svg>`;
}
