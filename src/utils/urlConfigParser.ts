import { CanvasLayer, ERPExternalConfig, CanvasBackground } from "@/types/editor";

export function parseERPConfig(searchParams: URLSearchParams | string): ERPExternalConfig | null {
  try {
    const params = typeof searchParams === "string" ? new URLSearchParams(searchParams) : searchParams;

    // 1. Check for `config` parameter (Base64 JSON or URL-encoded JSON)
    const rawConfig = params.get("config");
    if (rawConfig) {
      let jsonString = "";
      try {
        // Try Base64 decode first
        // Support browser atob and utf-8 decode
        if (typeof window !== "undefined") {
          jsonString = decodeURIComponent(escape(window.atob(rawConfig)));
        } else {
          jsonString = Buffer.from(rawConfig, "base64").toString("utf-8");
        }
      } catch {
        // Fallback: try direct URI decode
        jsonString = decodeURIComponent(rawConfig);
      }

      const parsed = JSON.parse(jsonString) as ERPExternalConfig;
      if (parsed && Array.isArray(parsed.layers)) {
        return sanitizeERPConfig(parsed);
      }
    }

    // 2. Check for `layers` parameter (either JSON or Base64) with individual canvas params
    const rawLayers = params.get("layers");
    if (rawLayers) {
      let layersJson = "";
      try {
        if (typeof window !== "undefined") {
          layersJson = decodeURIComponent(escape(window.atob(rawLayers)));
        } else {
          layersJson = Buffer.from(rawLayers, "base64").toString("utf-8");
        }
      } catch {
        layersJson = decodeURIComponent(rawLayers);
      }

      const layers = JSON.parse(layersJson);
      const width = parseInt(params.get("width") || "1080", 10);
      const height = parseInt(params.get("height") || "1350", 10);
      const background = params.get("background") || "#ffffff";
      const title = params.get("title") || "ERP Custom Poster";

      return sanitizeERPConfig({
        version: 1,
        canvas: {
          width,
          height,
          background,
          name: title,
        },
        layers,
        meta: {
          tenantId: params.get("tenantId") || undefined,
          tenantName: params.get("tenantName") || undefined,
          callbackUrl: params.get("callbackUrl") || undefined,
        },
      });
    }

    // 3. Check for simplified quick params (tenant logo + name + event title)
    const tenantLogo = params.get("logo") || params.get("institutionLogo");
    const institutionName = params.get("institution") || params.get("institutionName");
    const eventTitle = params.get("event") || params.get("eventTitle");
    const eventDate = params.get("date") || params.get("eventDate");
    const primaryColor = params.get("primaryColor") || "#39216C";

    if (tenantLogo || institutionName || eventTitle) {
      const width = parseInt(params.get("width") || "1080", 10);
      const height = parseInt(params.get("height") || "1350", 10);
      const syntheticLayers: CanvasLayer[] = [];

      if (tenantLogo) {
        syntheticLayers.push({
          id: "tenant-logo",
          name: "Institution Logo",
          type: "image",
          src: tenantLogo,
          x: 60,
          y: 60,
          width: 140,
          height: 140,
          locked: true,
          deletable: false,
          editable: false,
        });
      }

      if (institutionName) {
        syntheticLayers.push({
          id: "institution-name",
          name: "Institution Name",
          type: "text",
          text: institutionName,
          x: tenantLogo ? 220 : 60,
          y: 90,
          width: width - (tenantLogo ? 280 : 120),
          fontSize: 32,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "700",
          color: primaryColor,
          textAlign: tenantLogo ? "left" : "center",
          locked: true,
          deletable: false,
        });
      }

      if (eventTitle) {
        syntheticLayers.push({
          id: "event-title",
          name: "Event Title",
          type: "text",
          text: eventTitle,
          x: 60,
          y: 420,
          width: width - 120,
          fontSize: 68,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: "800",
          color: primaryColor,
          textAlign: "center",
        });
      }

      if (eventDate) {
        syntheticLayers.push({
          id: "event-date",
          name: "Event Date",
          type: "text",
          text: eventDate,
          x: 60,
          y: 540,
          width: width - 120,
          fontSize: 28,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "600",
          color: "#64748B",
          textAlign: "center",
        });
      }

      return {
        version: 1,
        canvas: {
          width,
          height,
          background: "#FFFFFF",
          name: institutionName ? `${institutionName} Poster` : "ERP Custom Poster",
        },
        layers: syntheticLayers,
        meta: {
          tenantName: institutionName || "Partner ERP",
        },
      };
    }
  } catch (err) {
    console.error("Failed to parse ERP external config from URL:", err);
  }

  return null;
}

export function encodeERPConfig(config: ERPExternalConfig): string {
  const json = JSON.stringify(config);
  if (typeof window !== "undefined") {
    return window.btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json, "utf-8").toString("base64");
}

function sanitizeERPConfig(config: ERPExternalConfig): ERPExternalConfig {
  const sanitizedLayers = (config.layers || []).map((layer, index) => {
    const id = layer.id || `layer-${Date.now()}-${index}`;
    const name = layer.name || `${layer.type || "Element"} ${index + 1}`;
    const x = typeof layer.x === "number" ? layer.x : 100;
    const y = typeof layer.y === "number" ? layer.y : 100;
    const width = typeof layer.width === "number" ? layer.width : 200;
    const height = typeof layer.height === "number" ? layer.height : 100;

    return {
      ...layer,
      id,
      name,
      x,
      y,
      width,
      height,
      visible: layer.visible !== false,
      locked: !!layer.locked,
      deletable: layer.deletable !== false,
      editable: layer.editable !== false,
      selectable: layer.selectable !== false,
    } as CanvasLayer;
  });

  let bg: CanvasBackground = { type: "solid", color: "#FFFFFF" };
  if (typeof config.canvas?.background === "string") {
    bg = { type: "solid", color: config.canvas.background };
  } else if (config.canvas?.background && typeof config.canvas.background === "object") {
    bg = config.canvas.background;
  }

  return {
    version: config.version || 1,
    canvas: {
      width: config.canvas?.width || 1080,
      height: config.canvas?.height || 1350,
      background: bg,
      name: config.canvas?.name || "ERP Poster Project",
    },
    layers: sanitizedLayers,
    meta: config.meta || {},
  };
}

export const SAMPLE_ERP_PAYLOADS: { title: string; subtitle: string; config: ERPExternalConfig }[] = [
  {
    title: "Eduzee Educational Institution",
    subtitle: "School annual day branding with locked tenant logo & name",
    config: {
      version: 1,
      canvas: {
        width: 1080,
        height: 1350,
        background: "#F8FAFC",
        name: "Eduzee Annual Day 2026",
      },
      layers: [
        {
          id: "tenant-logo",
          type: "image",
          src: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80",
          x: 70,
          y: 60,
          width: 140,
          height: 140,
          locked: true,
          deletable: false,
          editable: false,
          name: "Institution Logo (Locked)",
        },
        {
          id: "institution-name",
          type: "text",
          text: "EDUZEE INSTITUTION",
          x: 240,
          y: 90,
          width: 760,
          fontSize: 38,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "800",
          color: "#39216C",
          locked: true,
          deletable: false,
          name: "Institution Name (Locked)",
        },
        {
          id: "institution-tagline",
          type: "text",
          text: "Empowering Minds • Inspiring Excellence",
          x: 240,
          y: 145,
          width: 760,
          fontSize: 18,
          fontFamily: "'Inter', sans-serif",
          fontWeight: "500",
          color: "#64748B",
          locked: true,
          deletable: false,
          name: "Institution Subtitle (Locked)",
        },
        {
          id: "event-badge",
          type: "rect",
          x: 390,
          y: 350,
          width: 300,
          height: 48,
          fill: "#EDE9FE",
          stroke: "#7C3AED",
          strokeWidth: 2,
          cornerRadius: 24,
          name: "Event Category Badge",
        },
        {
          id: "event-badge-text",
          type: "text",
          text: "ANNUAL ARTS & CULTURAL FEST",
          x: 390,
          y: 364,
          width: 300,
          fontSize: 14,
          fontFamily: "'Inter', sans-serif",
          fontWeight: "700",
          color: "#7C3AED",
          textAlign: "center",
          letterSpacing: 2,
          name: "Category Label",
        },
        {
          id: "event-title",
          type: "text",
          text: "KALOTSAV 2026",
          x: 80,
          y: 430,
          width: 920,
          fontSize: 84,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: "800",
          color: "#39216C",
          textAlign: "center",
          name: "Event Title (Editable)",
        },
        {
          id: "event-date",
          type: "text",
          text: "DECEMBER 18 - 20, 2026\nMAIN AUDITORIUM & CAMPUS GROUNDS",
          x: 80,
          y: 550,
          width: 920,
          fontSize: 26,
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "600",
          color: "#F59E0B",
          textAlign: "center",
          lineHeight: 1.5,
          name: "Date & Location",
        },
      ],
      meta: {
        tenantId: "TENANT_EDUZEE_9921",
        tenantName: "Eduzee Global Academy",
        callbackUrl: "https://erp.eduzee.example/api/posters/callback",
      },
    },
  },
  {
    title: "Apex Sports League ERP",
    subtitle: "Tournament fixture poster injection",
    config: {
      version: 1,
      canvas: {
        width: 1080,
        height: 1350,
        background: "#0F172A",
        name: "Apex Varsity League Finals",
      },
      layers: [
        {
          id: "apex-logo",
          type: "image",
          src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&auto=format&fit=crop&q=80",
          x: 80,
          y: 60,
          width: 120,
          height: 120,
          locked: true,
          deletable: false,
          name: "Apex League Shield (Locked)",
        },
        {
          id: "league-title",
          type: "text",
          text: "APEX VARSITY ATHLETIC LEAGUE",
          x: 230,
          y: 85,
          width: 770,
          fontSize: 34,
          fontFamily: "'Oswald', sans-serif",
          fontWeight: "700",
          color: "#38BDF8",
          locked: true,
          deletable: false,
          name: "League Title (Locked)",
        },
        {
          id: "match-h1",
          type: "text",
          text: "GRAND FINALS 2026",
          x: 60,
          y: 380,
          width: 960,
          fontSize: 90,
          fontFamily: "'Bebas Neue', sans-serif",
          fontWeight: "bold",
          color: "#F43F5E",
          textAlign: "center",
          name: "Match Heading",
        },
      ],
      meta: {
        tenantId: "TENANT_APEX_SPORTS",
        tenantName: "Apex Varsity Association",
      },
    },
  },
];
