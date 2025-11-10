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

export interface MessageToSchedule {
  title: string;
  message_text: string;
  sent?: boolean;
  leadId: number | string;
}

export type ScheduledMessage<T extends MessageToSchedule> = Omit<T, 'schadule'> & {
  schadule: Date;
};

/**
 * Agenda as mensagens para dois dias depois da data atual, aplicando intervalo de 1 min entre elas.
 */
export function scheduleMessages<T extends MessageToSchedule>(
  messages: T[],
  baseDate: Date = new Date()
): ScheduledMessage<T>[] {
  const timeZone = 'America/Sao_Paulo';
  const baseParts = getDatePartsInTimeZone(baseDate, timeZone);
  let targetYear = baseParts.year;
  if (baseParts.month > 11 || (baseParts.month === 11 && baseParts.day > 13)) {
    targetYear += 1;
  }

  const intervalMs = 4 * 60_000; // 4 minutes
  const scheduleDays = [
    { day: 24, month: 11 },
    { day: 25, month: 11 }
  ];

  const windows = scheduleDays.map(({ day, month }) => {
    const dateParts = { year: targetYear, month, day };
    const offset = getTimeZoneOffsetMinutes(dateParts, timeZone);
    return {
      start: buildDateInTimeZone({ ...dateParts, hour: 8, minute: 0, second: 0 }, offset),
      end: buildDateInTimeZone({ ...dateParts, hour: 18, minute: 0, second: 0 }, offset)
    };
  });

  const scheduled: ScheduledMessage<T>[] = [];
  let messageIndex = 0;

  for (const window of windows) {
    let current = new Date(window.start);
    while (current <= window.end && messageIndex < messages.length) {
      scheduled.push({
        ...messages[messageIndex],
        schadule: new Date(current)
      });
      messageIndex += 1;
      current = new Date(current.getTime() + intervalMs);
    }
    if (messageIndex >= messages.length) break;
  }

  return scheduled;
}

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
};

function getDatePartsInTimeZone(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find(part => part.type === 'year')?.value ?? '0');
  const month = Number(parts.find(part => part.type === 'month')?.value ?? '1');
  const day = Number(parts.find(part => part.type === 'day')?.value ?? '1');
  return { year, month, day };
}

function getTimeZoneOffsetMinutes(dateParts: DateParts, timeZone: string): number {
  const referenceUtc = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, 12, 0, 0, 0);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
  const formattedParts = formatter.formatToParts(new Date(referenceUtc));
  const timeZoneName = formattedParts.find(part => part.type === 'timeZoneName')?.value ?? 'GMT';
  const match = timeZoneName.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);

  if (!match) return 0;

  const sign = match[1].startsWith('-') ? -1 : 1;
  const hours = Math.abs(parseInt(match[1], 10));
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  return sign * (hours * 60 + minutes);
}

function buildDateInTimeZone(dateParts: Required<DateParts>, offsetMinutes: number): Date {
  const utcMillis = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    dateParts.hour,
    dateParts.minute,
    dateParts.second ?? 0,
    0
  );
  return new Date(utcMillis - offsetMinutes * 60_000);
}

// Exemplo de uso:
// const result = calculateTriggerDates('2025-07-31');
// console.log(result);
