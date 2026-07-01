const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentMonth = () => {
  const mes = new Date().toLocaleString("es-CO", { month: "long" });
  return mes.charAt(0).toUpperCase() + mes.slice(1);
};

const getMonthYearFiltered = (filterMonth, filterYear) => {
  const month = filterMonth.slice(0, 3).toUpperCase();

  return `${month} ${filterYear}`;
};

const mesesMap = {
  Enero: 1,
  Febrero: 2,
  Marzo: 3,
  Abril: 4,
  Mayo: 5,
  Junio: 6,
  Julio: 7,
  Agosto: 8,
  Septiembre: 9,
  Octubre: 10,
  Noviembre: 11,
  Diciembre: 12,
};

const currentYear = new Date().getFullYear();
const yearsArray = Array.from({ length: 10 }, (_, i) => currentYear - i);

export {
  getTodayDate,
  getCurrentMonth,
  mesesMap,
  getMonthYearFiltered,
  yearsArray,
};
