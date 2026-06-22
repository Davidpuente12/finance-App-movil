const getTodayDate = () => new Date().toISOString().split("T")[0];

const getMonthTransactions = (items, selectedDate) => {
  const [year, month] = selectedDate.split("-");

  return items.filter((item) => {
    const normalizedFecha = item.fecha.includes("-")
      ? item.fecha
      : new Date(item.fecha).toISOString().split("T")[0];
    const [itemYear, itemMonth] = normalizedFecha.split("-");

    return (
      Number(itemYear) === Number(year) && Number(itemMonth) === Number(month)
    );
  });
};

export { getMonthTransactions, getTodayDate };
