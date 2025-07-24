import * as React from "react";
import dayjs from "dayjs";
import { Box, TextField, useTheme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function FreeCalendarRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  const theme = useTheme();
  const [start, setStart] = React.useState(startDate ? dayjs(startDate) : null);
  const [end, setEnd] = React.useState(endDate ? dayjs(endDate) : null);

  React.useEffect(() => {
    if (start) setStartDate(start.format("YYYY-MM-DD"));
    else setStartDate("");
    if (end) setEndDate(end.format("YYYY-MM-DD"));
    else setEndDate("");
  }, [start, end, setStartDate, setEndDate]);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      height: 32,
      fontSize: "0.8rem",
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      "& fieldset": {
        borderColor: theme.palette.divider,
      },
      "&:hover fieldset": {
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.primary.main,
        borderWidth: 1.5,
      },
    },
    "& input": {
      padding: "6px 8px",
      fontSize: "0.8rem",
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
     <DatePicker
  label="Start date"
  value={start}
  onChange={(newValue) => {
    setStart(newValue);
    if (end && newValue && newValue.isAfter(end)) {
      setEnd(null);
    }
  }}
  disablePast
  maxDate={end || undefined}
  slotProps={{
    textField: {
      size: 'small',
      sx: {
        '& .MuiOutlinedInput-root': {
          height: 24,
          width: 140,  // <--- added width here
          fontSize: '0.75rem',
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          '& fieldset': {
            borderColor: theme.palette.divider,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: 1.5,
          },
        },
        '& input': {
          padding: '4px 8px',
          fontSize: '0.75rem',
        },
      },
    },
  }}
/>

<DatePicker
  label="End date"
  value={end}
  onChange={(newValue) => setEnd(newValue)}
  disablePast
  minDate={start || undefined}
  slotProps={{
    textField: {
      size: 'small',
      sx: {
        '& .MuiOutlinedInput-root': {
          height: 24,
          width: 140,  // <--- added width here
          fontSize: '0.75rem',
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          '& fieldset': {
            borderColor: theme.palette.divider,
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: 1.5,
          },
        },
        '& input': {
          padding: '4px 8px',
          fontSize: '0.75rem',
        },
      },
    },
  }}
/>

        </Box>
      </Box>
    </LocalizationProvider>
  );
}
