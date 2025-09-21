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
    throw new Error('Data invalida');
  }

  const formatDate = (input: Date): string => {
    const day = input.getDate().toString().padStart(2, '0');
    const month = (input.getMonth() + 1).toString().padStart(2, '0');
    const year = input.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const month = date.getMonth();
  const day = date.getDate();

  let targetYear = today.getFullYear();
  let anniversaryDay = new Date(targetYear, month, day);

  if (todayAtMidnight > anniversaryDay) {
    targetYear += 1;
    anniversaryDay = new Date(targetYear, month, day);
  }

  const firstDayOfMonth = new Date(targetYear, month, 1);
  const lastDayOfMonth = new Date(targetYear, month + 1, 0);
  
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
