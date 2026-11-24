import { CanvasDimensions } from "@/types/editor";

export const CANVAS_PRESETS: CanvasDimensions[] = [
  {
    name: "Instagram Portrait",
    width: 1080,
    height: 1350,
    category: "instagram",
    description: "4:5 ratio • Standard feed portrait",
  },
  {
    name: "Instagram Square",
    width: 1080,
    height: 1080,
    category: "instagram",
    description: "1:1 ratio • Square feed post",
  },
  {
    name: "Instagram Story",
    width: 1080,
    height: 1920,
    category: "instagram",
    description: "9:16 ratio • Fullscreen story / Reel",
  },
  {
    name: "A4 Portrait",
    width: 2480,
    height: 3508,
    category: "print",
    description: "210 × 297 mm • 300 DPI high-res print",
  },
  {
    name: "A4 Landscape",
    width: 3508,
    height: 2480,
    category: "print",
    description: "297 × 210 mm • 300 DPI high-res certificate / flyer",
  },
  {
    name: "Poster / Banner (Full HD)",
    width: 1920,
    height: 1080,
    category: "social",
    description: "16:9 ratio • Screen presentation / Banner",
  },
  {
    name: "Facebook / Twitter Post",
    width: 1200,
    height: 630,
    category: "social",
    description: "1.91:1 ratio • Social share banner",
  },
];
