import { useQuery } from '@tanstack/react-query';
import { getDailyReport } from '../api/report.api';

export const useDailyReport = (date) => {
  return useQuery({
    queryKey: ['daily-report', date],
    queryFn: () => getDailyReport(date),
    enabled: !!date,
  });
};
