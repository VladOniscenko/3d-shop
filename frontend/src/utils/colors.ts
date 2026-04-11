export const getColorStyle = (color: string) => {
  if (!color || color.toLowerCase() === "transparent") {
    return { backgroundColor: "transparent", color: "#111827" };
  }

  if (color.includes(",")) {
    const colors = color.split(",").map((c) => c.trim());

    return {
      background: `linear-gradient(90deg, ${colors.join(", ")})`,
      color: "#111827", // fixed text color for readability
    };
  }

  const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
  if (!isValidHex) {
    return { backgroundColor: "#D1FAE5", color: "#111827" }; // fallback
  }

  let r: number, g: number, b: number;

  if (color.length === 4) {
    r = parseInt(color[1] + color[1], 16);
    g = parseInt(color[2] + color[2], 16);
    b = parseInt(color[3] + color[3], 16);
  } else {
    r = parseInt(color.substring(1, 3), 16);
    g = parseInt(color.substring(3, 5), 16);
    b = parseInt(color.substring(5, 7), 16);
  }

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = yiq >= 128 ? "#111827" : "#FFFFFF";

  return {
    backgroundColor: color,
    color: textColor,
  };
};
