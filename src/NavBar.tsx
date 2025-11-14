import { AppBar, Toolbar, Typography, Box, Link } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { frost } from "./theme";

export type NavBarProps = {
  title?: string;
};

export default function NavBar({ title = "Power Balloon" }: NavBarProps) {
  return (
    <AppBar position="fixed" elevation={6} sx={frost.appBar}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.25 }, minWidth: 0, flex: 1 }}>
          <img
            src="/favicon.png"
            alt="App logo"
            width={56}
            height={56}
            style={{ display: "block" }}
          />
          <Typography
            sx={{
              flexGrow: 1,
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.5rem' },
              lineHeight: 1.2,
            }}
          >
          {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 }, minWidth: 0, flexShrink: 1, maxWidth: { xs: '55%', sm: 'unset' } }}>
          <img
            src="/logo-powder_buoy-full-light-cropped.svg"
            alt="Powder Buoy logo"
            height={28}
            style={{ display: 'block' }}
          />
          <Link
            href="https://powderbuoy.com"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="inherit"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Powder Buoy?
            <OpenInNewIcon fontSize="inherit" sx={{ fontSize: { xs: 14, sm: 16 } }} />
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
