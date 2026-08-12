export const normalizeFecha = (fecha) => {
  if (typeof fecha !== "string") return "";
  const onlyDate = fecha.trim().split(" ")[0].split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(onlyDate)) return onlyDate;
  return "";
};
