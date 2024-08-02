export default function formatText(text, maxSize = 40) {
  if (text && maxSize >= 3 && text.length > maxSize) return text.substring(0, maxSize - 3) + "...";
  else return text;
}
