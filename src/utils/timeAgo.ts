export function formatTimeAgo(dateInput: string | number | Date): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 10) {
    return 'Hace un momento';
  }
  if (secondsAgo < 60) {
    return `Hace ${secondsAgo} seg`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return minutesAgo === 1 ? 'Hace 1 min' : `Hace ${minutesAgo} mins`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return hoursAgo === 1 ? 'Hace 1 hora' : `Hace ${hoursAgo} horas`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return daysAgo === 1 ? 'Hace 1 día' : `Hace ${daysAgo} días`;
  }

  const weeksAgo = Math.floor(daysAgo / 7);
  if (weeksAgo < 4) {
    return weeksAgo === 1 ? 'Hace 1 semana' : `Hace ${weeksAgo} semanas`;
  }

  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return monthsAgo === 1 ? 'Hace 1 mes' : `Hace ${monthsAgo} meses`;
  }

  const yearsAgo = Math.floor(daysAgo / 365);
  return yearsAgo === 1 ? 'Hace 1 año' : `Hace ${yearsAgo} años`;
}
