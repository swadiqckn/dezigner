import jsPDF from "jspdf";
import Konva from "konva";

export interface ExportOptions {
  format: "png" | "jpg" | "pdf";
  quality?: number; // 0.1 to 1 (for jpg)
  scale?: number; // 1x, 2x, 3x, 4x
  transparentBg?: boolean;
  filename?: string;
}

export async function exportCanvas(
  stage: Konva.Stage,
  options: ExportOptions
): Promise<string> {
  const {
    format = "png",
    quality = 0.95,
    scale = 1,
    transparentBg = false,
    filename = "poster-design",
  } = options;

  // Make sure all fonts and images are settled
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Find background rect node or layer if transparent background is requested
  const bgNode = stage.findOne(".canvas-background-node");
  const origVisible = bgNode ? bgNode.visible() : true;

  if (transparentBg && format === "png" && bgNode) {
    bgNode.visible(false);
  }

  // Hide transformer handles during export
  const transformers = stage.find("Transformer");
  const origTransformersVisibility = transformers.map((t) => t.visible());
  transformers.forEach((t) => t.visible(false));

  try {
    // Generate high resolution data URL using pixelRatio
    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    const dataUrl = stage.toDataURL({
      pixelRatio: scale,
      mimeType,
      quality: format === "jpg" ? quality : undefined,
    });

    if (format === "pdf") {
      const width = stage.width();
      const height = stage.height();
      const orientation = width >= height ? "landscape" : "portrait";

      const pdf = new jsPDF({
        orientation,
        unit: "px",
        format: [width, height],
        hotfixes: ["px_scaling"],
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, width, height, undefined, "FAST");
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return dataUrl;
    }

    // For PNG or JPG: trigger browser file download
    const link = document.createElement("a");
    link.download = `${filename}.${format === "jpg" ? "jpg" : "png"}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return dataUrl;
  } finally {
    // Restore stage visibility
    if (bgNode) {
      bgNode.visible(origVisible);
    }
    transformers.forEach((t, i) => t.visible(origTransformersVisibility[i]));
  }
}
