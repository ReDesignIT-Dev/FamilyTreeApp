import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    glass: {
      surface: string;
      border: string;
      hover: string;
    };
  }
  interface PaletteOptions {
    glass?: {
      surface?: string;
      border?: string;
      hover?: string;
    };
  }
}

const GREEN_MAIN = '#4CAF7D';
const GREEN_DARK = '#2E7D52';
const GREEN_LIGHT = '#81C99B';
const AMBER_MAIN = '#F5A623';
const AMBER_DARK = '#D4891A';
const BG_DEFAULT = '#0D1117';
const BG_PAPER = '#161B22';
const BG_ELEVATED = '#1C2128';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: GREEN_MAIN,
      dark: GREEN_DARK,
      light: GREEN_LIGHT,
      contrastText: '#fff',
    },
    secondary: {
      main: AMBER_MAIN,
      dark: AMBER_DARK,
      light: '#F7BE67',
      contrastText: '#0D1117',
    },
    background: {
      default: BG_DEFAULT,
      paper: BG_PAPER,
    },
    text: {
      primary: '#E6EDF3',
      secondary: '#8B949E',
      disabled: '#484F58',
    },
    divider: 'rgba(255,255,255,0.08)',
    error: {
      main: '#F85149',
      light: '#FF7B72',
      dark: '#B91C1C',
    },
    success: {
      main: GREEN_MAIN,
      dark: GREEN_DARK,
    },
    warning: {
      main: AMBER_MAIN,
      dark: AMBER_DARK,
    },
    glass: {
      surface: 'rgba(22, 27, 34, 0.72)',
      border: 'rgba(255, 255, 255, 0.08)',
      hover: 'rgba(76, 175, 125, 0.08)',
    },
    action: {
      hover: 'rgba(76, 175, 125, 0.08)',
      selected: 'rgba(76, 175, 125, 0.16)',
      focus: 'rgba(76, 175, 125, 0.12)',
    },
  },

  typography: {
    fontFamily: '"Inter", "system-ui", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
    h4: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3 },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.005em' },
    subtitle1: { fontWeight: 500, letterSpacing: '-0.005em' },
    subtitle2: { fontWeight: 500, fontSize: '0.8125rem' },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6, fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', letterSpacing: '0.02em' },
    button: { fontWeight: 600, letterSpacing: '0.01em', textTransform: 'none' },
  },

  shape: {
    borderRadius: 10,
  },

  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.4)',
    '0 2px 6px rgba(0,0,0,0.4)',
    '0 4px 12px rgba(0,0,0,0.4)',
    '0 6px 16px rgba(0,0,0,0.5)',
    '0 8px 24px rgba(0,0,0,0.5)',
    '0 12px 32px rgba(0,0,0,0.6)',
    '0 16px 40px rgba(0,0,0,0.6)',
    '0 20px 48px rgba(0,0,0,0.7)',
    '0 24px 56px rgba(0,0,0,0.7)',
    '0 28px 64px rgba(0,0,0,0.7)',
    '0 32px 72px rgba(0,0,0,0.8)',
    '0 36px 80px rgba(0,0,0,0.8)',
    '0 40px 88px rgba(0,0,0,0.8)',
    '0 44px 96px rgba(0,0,0,0.8)',
    '0 48px 104px rgba(0,0,0,0.8)',
    '0 52px 112px rgba(0,0,0,0.8)',
    '0 56px 120px rgba(0,0,0,0.8)',
    '0 60px 128px rgba(0,0,0,0.8)',
    '0 64px 136px rgba(0,0,0,0.8)',
    '0 68px 144px rgba(0,0,0,0.8)',
    '0 72px 152px rgba(0,0,0,0.8)',
    '0 76px 160px rgba(0,0,0,0.8)',
    '0 80px 168px rgba(0,0,0,0.8)',
    '0 84px 176px rgba(0,0,0,0.8)',
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background-color: ${BG_DEFAULT}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(76,175,125,0.35); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(76,175,125,0.6); }
        ::selection { background: rgba(76,175,125,0.3); color: #E6EDF3; }
      `,
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(13, 17, 23, 0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: `0 1px 20px rgba(0,0,0,0.4), 0 0 0 0 transparent`,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.875rem',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        },
        contained: {
          background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, ${GREEN_DARK} 100%)`,
          boxShadow: `0 2px 12px ${alpha(GREEN_MAIN, 0.35)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${GREEN_LIGHT} 0%, ${GREEN_MAIN} 100%)`,
            boxShadow: `0 4px 20px ${alpha(GREEN_MAIN, 0.5)}`,
            transform: 'translateY(-1px)',
          },
          '&:active': { transform: 'translateY(0)' },
          '&.Mui-disabled': {
            background: 'rgba(255,255,255,0.08)',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.15)',
          color: '#E6EDF3',
          '&:hover': {
            borderColor: GREEN_MAIN,
            background: alpha(GREEN_MAIN, 0.08),
            boxShadow: `0 0 12px ${alpha(GREEN_MAIN, 0.2)}`,
          },
        },
        text: {
          '&:hover': {
            background: alpha(GREEN_MAIN, 0.08),
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
          borderRadius: 10,
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8rem',
          borderRadius: 6,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: BG_ELEVATED,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            borderColor: alpha(GREEN_MAIN, 0.3),
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${alpha(GREEN_MAIN, 0.15)}`,
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          background: BG_PAPER,
          border: '1px solid rgba(255,255,255,0.07)',
          backgroundImage: 'none',
        },
        elevation3: {
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, ${GREEN_DARK} 100%)`,
          fontWeight: 700,
          color: '#fff',
        },
        colorDefault: {
          background: `linear-gradient(135deg, ${GREEN_MAIN} 0%, ${GREEN_DARK} 100%)`,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.15)',
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
            '&.Mui-focused fieldset': { borderColor: GREEN_MAIN, borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: GREEN_MAIN },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(255,255,255,0.08)' },
        indicator: {
          background: `linear-gradient(90deg, ${GREEN_MAIN}, ${GREEN_LIGHT})`,
          height: 2,
          borderRadius: 2,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          color: '#8B949E',
          '&.Mui-selected': { color: GREEN_MAIN },
          '&:hover': { color: '#E6EDF3', background: 'rgba(255,255,255,0.04)' },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255,255,255,0.07)' },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid',
        },
        standardError: {
          background: 'rgba(248, 81, 73, 0.1)',
          borderColor: 'rgba(248, 81, 73, 0.3)',
        },
        standardWarning: {
          background: 'rgba(245, 166, 35, 0.1)',
          borderColor: 'rgba(245, 166, 35, 0.3)',
        },
        standardSuccess: {
          background: `${alpha(GREEN_MAIN, 0.1)}`,
          borderColor: alpha(GREEN_MAIN, 0.3),
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'rgba(22, 27, 34, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 6px',
          padding: '8px 10px',
          fontSize: '0.875rem',
          '&:hover': {
            background: alpha(GREEN_MAIN, 0.1),
          },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          background: BG_PAPER,
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: BG_ELEVATED,
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.75rem',
          borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        },
        arrow: {
          color: BG_ELEVATED,
        },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: { color: GREEN_MAIN },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 4,
        },
        bar: {
          background: `linear-gradient(90deg, ${GREEN_MAIN}, ${GREEN_LIGHT})`,
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
