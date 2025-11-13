import { createTheme } from "@mui/material/styles";

// Shared layout tokens
export const NAVBAR_HEIGHT = 64; // default AppBar height on desktop

// Frosted glass snow theme tokens
export const frost = {
  colors: {
    textPrimary: "#0d6ea8",
    textSecondary: "#2a86c8",
    background: "#f6fbff",
    border: "rgba(11,46,77,0.16)",
  },
  gradients: {
    icy: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(190,225,255,0.95) 50%, rgba(150,205,255,0.95) 100%)",
  },
  blur: {
    backdrop: "blur(8px)",
  },
  // Reusable component sx snippets
  appBar: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(190,225,255,0.95) 50%, rgba(150,205,255,0.95) 100%)",
    color: "text.primary",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(11,46,77,0.16)",
  } as const,
  paper: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(190,225,255,0.95) 50%, rgba(150,205,255,0.95) 100%)",
    color: "text.primary",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(11,46,77,0.16)",
    borderRadius: 8,
  } as const,
};

// Global MUI theme configured once
export const theme = createTheme({
  palette: {
    primary: { main: "#58b4ff" },
    background: { default: frost.colors.background },
    text: {
      primary: frost.colors.textPrimary,
      secondary: frost.colors.textSecondary,
    },
  },
  typography: {
    fontFamily: "'Quicksand','Segoe UI','Roboto','Arial',sans-serif",
    fontWeightRegular: 500,
    h6: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: frost.colors.textPrimary,
          backgroundColor: frost.colors.background,
        },
      },
    },
  },
});
