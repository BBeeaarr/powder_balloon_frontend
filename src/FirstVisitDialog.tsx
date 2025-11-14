import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { frost } from "./theme";

const STORAGE_KEY = "pb_first_visit_seen_v1";

export default function FirstVisitDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      // If storage unavailable, show once
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch { /* ignore */ }
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { ...frost.paper, p: 0 } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        How it Works
        <IconButton aria-label="close" onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography component="p" gutterBottom>
          What does a NOAA weather buoy 3000 miles away in the middle of the North Pacific Ocean have to do with snow in Utah, Colorado & Wyoming? Good question!
        </Typography>
        <Typography component="p" gutterBottom>
          Since the dawn of time, humans have been trying to plan their powder days, a futile feat… until now. Is it magic? Is it science? Is it dumb luck? The answer may be yes to all of the above, but more than anything, the Powderbuoy is all about a positive vibration and energy that connects soul riders around the world.
        </Typography>
        <Typography component="p" gutterBottom fontStyle="italic" textAlign="center">
          “Yeahbuuuuooooyyyyyy”
        </Typography>
        <Typography textAlign="center" variant="subtitle2">— William Jonathan Drayton Jr.</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button variant="contained" onClick={handleClose}>Got it</Button>
      </DialogActions>
    </Dialog>
  );
}
