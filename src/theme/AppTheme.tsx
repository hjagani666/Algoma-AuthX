import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { IconButton, Button, Box } from '@mui/material';
import { inputsCustomizations } from '../customizations/inputs';
import { dataDisplayCustomizations } from '../customizations/dataDisplay';
import { feedbackCustomizations } from '../customizations/feedback';
import { navigationCustomizations } from '../customizations/navigation';
import { surfacesCustomizations } from '../customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from '../customizations/themePrimitives';
import Brightness4Icon from '@mui/icons-material/Brightness4';  // Moon (Dark mode)
import Brightness7Icon from '@mui/icons-material/Brightness7';  // Sun (Light mode)

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions['components'];
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;

  // State for light/dark mode toggle
  const [dark, setDark] = React.useState(false);

  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
          cssVariables: {
            colorSchemeSelector: 'data-mui-color-scheme',
            cssVarPrefix: 'template',
          },
          // colorSchemes: {
          //   light: colorSchemes.light, // Define light scheme
          //   dark: colorSchemes.dark,   // Define dark scheme
          // },
          typography,
          shadows,
          shape,
          components: {
            ...inputsCustomizations,
            ...dataDisplayCustomizations,
            ...feedbackCustomizations,
            ...navigationCustomizations,
            ...surfacesCustomizations,
            ...themeComponents,
          },
          colorSchemes: {
            dark: dark,
          },
        });
  }, [disableCustomTheme, themeComponents, dark]);

  // Toggle theme between light and dark
  const handleThemeToggle = () => {
    setDark((prevDark) => !prevDark);
  };

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 2 }}>
        {/* Button to toggle between Light and Dark theme */}
        <Button
          variant="contained"
          color={dark ? 'secondary' : 'primary'}
          onClick={handleThemeToggle}
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50px',
            padding: '8px 16px',
            boxShadow: 3,
            transition: 'background-color 0.3s',
          }}
        >
          {dark ? <Brightness7Icon /> : <Brightness4Icon />}
        </Button>
      </Box>
      {children}
    </ThemeProvider>
  );
}
