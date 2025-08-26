export interface MonthDates {
  firstDayOfMonth: string;
  anniversaryDay: string;
  twoDaysBeforeEndOfMonth: string;
}

export function calculateMonthDates(inputDate: string): MonthDates {
  let date: Date;
  
  // Suporte para formatos DD/MM/YYYY e DD-MM-YYYY
  if (inputDate.includes('/') || inputDate.includes('-')) {
    const separator = inputDate.includes('/') ? '/' : '-';
    const [day, month, year] = inputDate.split(separator);
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    date = new Date(inputDate);
  }
  
  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const currentYear = new Date().getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Primeiro dia do mês no ano atual
  const firstDayOfMonth = new Date(currentYear, month, 1);

  // Dia do aniversário no ano atual
  const anniversaryDay = new Date(currentYear, month, day);

  // Último dia do mês no ano atual
  const lastDayOfMonth = new Date(currentYear, month + 1, 0);
  
  // Dois dias antes do final do mês
  const twoDaysBeforeEnd = new Date(lastDayOfMonth);
  twoDaysBeforeEnd.setDate(lastDayOfMonth.getDate() - 2);

  return {
    firstDayOfMonth: formatDate(firstDayOfMonth),
    anniversaryDay: formatDate(anniversaryDay),
    twoDaysBeforeEndOfMonth: formatDate(twoDaysBeforeEnd)
  };
}

// Exemplo de uso:
// const result = calculateMonthDates('03/11/1995');
// console.log(result);
// {
//   firstDayOfMonth: "01/11/2025",
//   anniversaryDay: "03/11/2025", 
//   twoDaysBeforeEndOfMonth: "28/11/2025"
// }
