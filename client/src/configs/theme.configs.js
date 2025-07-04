import { createTheme } from "@mui/material/styles";
import { colors } from "@mui/material";

export const themeModes = {
  dark: "dark",
  light: "light"
};

const themeConfigs = {
  custom: ({ mode }) => {
    const customPalette = mode === themeModes.dark ? {
      primary: {
        main: "#df2626", // Màu đỏ chủ đạo
        contrastText: "#ffffff"
      },
      secondary: {
        main: "#86868b", // Apple secondary gray
        contrastText: "#ffffff"
      },
      background: {
        default: "#000000",
        paper: "#1d1d1f" // Apple dark background
      },
      text: {
        primary: "#f5f5f7", // Apple light text for dark mode
        secondary: "#86868b" // Apple secondary text
      }
    } : {
      primary: {
        main: "#df2626" // Màu đỏ chủ đạo
      },
      secondary: {
        main: "#86868b" // Apple secondary gray
      },
      background: {
        default: "#f5f5f7", // Apple light background
        paper: "#ffffff" 
      },
      text: {
        primary: "#1d1d1f", // Apple dark text for light mode
        secondary: "#86868b" // Apple secondary text
      }
    };

    return createTheme({
      palette: {
        mode,
        ...customPalette
      },
      typography: {
        fontFamily: '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        h1: {
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 600
        },
        h2: {
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 600
        },
        h3: {
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 600
        },
        h4: {
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 600
        },
        h5: {
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 600
        },
        h6: {
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 600
        },
        body1: {
          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        },
        body2: {
          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        },
        button: {
          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 500,
          textTransform: 'none'
        }
      },
      shape: {
        borderRadius: 12 // Bo góc mềm mại hơn
      },
      components: {
        MuiButton: {
          defaultProps: { 
            disableElevation: true 
          },
          styleOverrides: {
            root: {
              borderRadius: 12,
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500
            },
            contained: {
              boxShadow: 'none'
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              // borderRadius: 12
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              overflow: 'hidden'
            }
          }
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 12
              }
            }
          }
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8
            }
          }
        }
      }
    });
  }
};

export default themeConfigs;