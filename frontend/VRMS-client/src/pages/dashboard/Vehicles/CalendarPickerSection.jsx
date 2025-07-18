import * as React from 'react';
import dayjs from 'dayjs';
import { Box, Typography, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function FreeCalendarRangePicker({ startDate, endDate, setStartDate, setEndDate }) {
  const [start, setStart] = React.useState(startDate ? dayjs(startDate) : null);
  const [end, setEnd] = React.useState(endDate ? dayjs(endDate) : null);

  React.useEffect(() => {
    if (start) setStartDate(start.format('YYYY-MM-DD'));
    if (end) setEndDate(end.format('YYYY-MM-DD'));
  }, [start, end, setStartDate, setEndDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatePicker
            label="Start date"
            value={start}
            onChange={(newValue) => {
              setStart(newValue);
              if (end && newValue && newValue.isAfter(end)) {
                setEnd(null); // reset end date if start is after end
              }
            }}
            format="YYYY-MM-DD"
            disablePast
            maxDate={end || undefined}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <DatePicker
            label="End date"
            value={end}
            onChange={(newValue) => setEnd(newValue)}
            format="YYYY-MM-DD"
            disablePast
            minDate={start || undefined}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
