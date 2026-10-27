export function asText(item) {
  if (item == null) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    return (
      item.finding ||
      item.solution ||
      item.step ||
      item.insight ||
      item.recommendation ||
      item.text ||
      JSON.stringify(item)
    );
  }
  return String(item);
}

export function relatedHistory(query, history) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return history
    .filter((item) => {
      const itemQuery = String(item.query || "").toLowerCase();
      const concepts = Array.isArray(item.key_concepts) ? item.key_concepts : [];
      return (
        itemQuery.includes(needle) ||
        concepts.some(
          (concept) => typeof concept === "string" && concept.toLowerCase().includes(needle)
        )
      );
    })
    .slice(0, 3);
}

export function formatWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
