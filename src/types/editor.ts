export type LayerType = 
  | 'text' 
  | 'image' 
  | 'rect' 
  | 'circle' 
  | 'line' 
  | 'star' 
  | 'polygon' 
  | 'icon' 
  | 'badge'
  | 'group';

export type AnchorPoint = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'middle-left' 
  | 'center' 
  | 'middle-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number; // degrees
  scaleX?: number;
  scaleY?: number;
  anchor?: AnchorPoint;
  groupId?: string; // If grouped inside a parent group
  opacity?: number; // 0 to 1
  visible?: boolean;
  locked?: boolean; // UX restriction: cannot drag or resize
  deletable?: boolean; // Cannot delete if false (ERP protection)
  editable?: boolean; // Cannot edit text/properties if false
  selectable?: boolean; // Cannot be selected if false
  zIndex?: number;
  // Template variable metadata for bulk generation & recurring usage
  isTemplate?: boolean;
  templateId?: string;
  templateType?: 'text' | 'image' | 'icon';
  placeholderValue?: string;
}

export interface TemplateLayerVariable {
  id: string;
  type: 'text' | 'image' | 'icon';
  value: string;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  lineHeight?: number;
  color: string; // text fill
  backgroundColor?: string;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  autoWidth?: boolean; // if true, text stays on single line until manual newline
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  naturalWidth?: number;
  naturalHeight?: number;
  fit?: 'cover' | 'contain' | 'fill';
  cornerRadius?: number;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  isExternal?: boolean;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ShapeLayer extends BaseLayer {
  type: 'rect' | 'circle' | 'line' | 'star' | 'polygon' | 'badge';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number; // for rect
  dash?: number[]; // dashed lines/borders
  points?: number[]; // for line / polygon
  numPoints?: number; // for star
  innerRadius?: number; // for star
  outerRadius?: number; // for star
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  badgeStyle?: 'ribbon' | 'circle-star' | 'tag' | 'pill' | 'banner';
}

export interface IconLayer extends BaseLayer {
  type: 'icon';
  iconName: string; // Lucide icon name
  svgString?: string;
  fill?: string;
  stroke: string;
  strokeWidth?: number;
}

export interface BadgeLayer extends BaseLayer {
  type: 'badge';
  badgeStyle: 'ribbon' | 'circle-star' | 'tag' | 'pill' | 'banner';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
}

export interface GroupLayer extends BaseLayer {
  type: 'group';
  layerIds: string[]; // IDs of member layers in the group
}

export type CanvasLayer = TextLayer | ImageLayer | ShapeLayer | IconLayer | BadgeLayer | GroupLayer;

export type NewLayerInput = (
  | Omit<TextLayer, 'id'>
  | Omit<ImageLayer, 'id'>
  | Omit<ShapeLayer, 'id'>
  | Omit<IconLayer, 'id'>
  | Omit<BadgeLayer, 'id'>
  | Omit<GroupLayer, 'id'>
) & { id?: string; height?: number };

export interface CustomFontItem {
  name: string;
  family: string;
  dataUrl?: string;
  format?: string;
}

export interface ProjectWorkFile {
  version: number;
  title: string;
  width: number;
  height: number;
  presetName: string;
  background: CanvasBackground;
  layers: CanvasLayer[];
  customFonts?: CustomFontItem[];
  savedAt: string;
}

export interface DesignComponentFile {
  version: number;
  type: 'dezigner-component';
  name: string;
  layers: CanvasLayer[];
  customFonts?: CustomFontItem[];
  createdAt: string;
}

export interface CanvasDimensions {
  width: number;
  height: number;
  name: string;
  category: 'instagram' | 'print' | 'social' | 'custom';
  description?: string;
}

export interface CanvasBackground {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle: number;
    stops: Array<{ offset: number; color: string }>;
  };
  imageSrc?: string;
}

export interface PosterTemplate {
  id: string;
  title: string;
  category: 
    | 'Educational Events'
    | 'Arts Festivals'
    | 'Sports Events'
    | 'Competitions'
    | 'Islamic Events'
    | 'Announcements'
    | 'Birthday Posters'
    | 'Social Media'
    | 'Certificates';
  thumbnail?: string;
  canvas: {
    width: number;
    height: number;
    background: CanvasBackground;
  };
  layers: CanvasLayer[];
}

export interface ERPExternalConfig {
  version?: number;
  canvas?: {
    width?: number;
    height?: number;
    background?: string | CanvasBackground;
    name?: string;
  };
  layers: Array<Partial<CanvasLayer> & { id: string; type: LayerType }>;
  meta?: {
    tenantId?: string;
    tenantName?: string;
    callbackUrl?: string;
    readOnlyTenantLayers?: boolean;
    hideExportOptions?: boolean;
    exportFormat?: 'png' | 'jpg' | 'pdf';
  };
}

export interface GuideLine {
  orientation: 'vertical' | 'horizontal';
  position: number;
}
