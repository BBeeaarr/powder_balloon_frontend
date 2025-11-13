import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { frost } from "./theme";

export type NavBarProps = {
  title?: string;
};

export default function NavBar({ title = "Power Balloon" }: NavBarProps) {
  return (
    <AppBar position="fixed" elevation={6} sx={frost.appBar}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <img
            src="/favicon.png"
            alt="App logo"
            width={56}
            height={56}
            style={{ display: "block" }}
          />
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {title}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
