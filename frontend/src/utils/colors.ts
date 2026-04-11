const parseColorToRGB = (color: string): [number, number, number] | null => {
  const el = document.createElement("div");
  el.style.color = color;
  document.body.appendChild(el);

  const computed = getComputedStyle(el).color;
  document.body.removeChild(el);

  const match = computed.match(/\d+/g);
  if (!match) return null;

  return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
};

export const getColorStyle = (color: string) => {
  if (!color) {
    return { backgroundColor: "#D1FAE5", color: "#111827" };
  }

  const lower = color.toLowerCase();

  if (lower === "transparent") {
    return { backgroundColor: "transparent", color: "#111827" };
  }

  if (lower.includes("transparent")) {
    const baseColor = lower.replace("transparent", "").trim();

    const rgb = parseColorToRGB(baseColor);
    if (rgb) {
      return {
        backgroundColor: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.35)`,
        color: "#111827",
      };
    }
  }

  if (color.includes(",")) {
    const colors = color.split(",").map((c) => c.trim());
    return {
      background: `linear-gradient(90deg, ${colors.join(", ")})`,
      color: "#111827",
    };
  }

  const rgb = parseColorToRGB(color);
  if (!rgb) {
    return { backgroundColor: "#D1FAE5", color: "#111827" };
  }

  const yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  const textColor = yiq >= 128 ? "#111827" : "#FFFFFF";

  return {
    backgroundColor: color,
    color: textColor,
  };
};
