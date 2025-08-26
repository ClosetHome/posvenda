export interface TriggerDates {
  oneDayBefore: string;
  twoDaysAfter: string;
  tenDaysAfter: string;
  thirtyDaysAfter: string;
  sixtyDaysAfter: string;
  eightyEightDaysAfter:string;
  ninetyTwoDaysAfter: string;
  oneHundredAndtwentyDaysAfter:string;
}

export function calculateTriggerDates(inputDate: string): TriggerDates {
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

  const oneDayBefore = new Date(date);
  oneDayBefore.setDate(date.getDate() - 1);

  const twoDaysAfter = new Date(date);
  twoDaysAfter.setDate(date.getDate() + 2);

  const tenDaysAfter = new Date(date);
  tenDaysAfter.setDate(date.getDate() + 10);

  const thirtyDaysAfter = new Date(date);
  thirtyDaysAfter.setDate(date.getDate() + 30);

  const sixtyDaysAfter = new Date(date);
  sixtyDaysAfter.setDate(date.getDate() + 60);

  const eightyEightDaysAfter = new Date(date);
  eightyEightDaysAfter.setDate(date.getDate() + 88);
  
  const ninetyTwoDaysAfter = new Date(date);
  ninetyTwoDaysAfter.setDate(date.getDate() + 92);

  const oneHundredAndtwentyDaysAfter = new Date(date);
  oneHundredAndtwentyDaysAfter.setDate(date.getDate() + 120);

  return {
    oneDayBefore: formatDate(oneDayBefore),
    twoDaysAfter: formatDate(twoDaysAfter),
    tenDaysAfter: formatDate(tenDaysAfter),
    thirtyDaysAfter: formatDate(thirtyDaysAfter),
    sixtyDaysAfter: formatDate(sixtyDaysAfter),
    eightyEightDaysAfter: formatDate(eightyEightDaysAfter),
    ninetyTwoDaysAfter: formatDate(ninetyTwoDaysAfter),
    oneHundredAndtwentyDaysAfter: formatDate(oneHundredAndtwentyDaysAfter)
  };
}

// Exemplo de uso:
// const result = calculateTriggerDates('2025-07-31');
// console.log(result);
