import { useEffect, useState } from 'react';

export function useSafeDateTime(initialDate?: Date) {
  const [date, setDate] = useState<Date | null>(null);
  
  useEffect(() => {
    setDate(initialDate || new Date());
  }, [initialDate]);
  
  return date;
}
