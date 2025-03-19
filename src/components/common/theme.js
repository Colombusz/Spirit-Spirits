// theme.js

export const colors = {
    // Primary and accent colors set to Bronze shades
    primary: '#cd7f32',        // Main Bronze
    secondary: '#b9722d',      // Secondary Bronze shade
  
    // Background and surface colors using Ivory
    background: '#fffff0',     // Ivory (main background)
    surface: '#f8f2dd',        // A softer Ivory tone for panels
  
    // Text and other UI elements (using darker Bronze for contrast)
    text: '#3e260f',           // Dark Bronze for text
    error: '#B00020',
    disabled: '#f1f1f1',
    placeholder: '#a1a1a1',
  
    // Additional Bronze shades (from lighter to darker)
    bronzeShade1: '#cd7f32',   // Primary Bronze
    bronzeShade2: '#b9722d',
    bronzeShade3: '#a46628',
    bronzeShade4: '#905923',
    bronzeShade5: '#7b4c1e',
    bronzeShade6: '#674019',
    bronzeShade7: '#523314',
    bronzeShade8: '#3e260f',
    bronzeShade9: '#29190a',
    bronzeShade10: '#140d05',
  
    // Ivory variations (from warm cream to pure ivory)
    ivory1: '#f5eccf',
    ivory2: '#f6eed4',
    ivory3: '#f7f0d9',
    ivory4: '#f8f2dd',
    ivory5: '#f9f4e2',
    ivory6: '#fffff0',
  };
  
  export const spacing = {
    small: 8,
    medium: 16,
    large: 24,
  };
  
  export const fonts = {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
  };
  
  export const globalStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background, // Ivory background
      padding: spacing.medium,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary, // Bronze primary for titles
      marginBottom: spacing.medium,
    },
    // A sample panel style using Bronze shades for layout panels
    panel: {
      backgroundColor: colors.bronzeShade1,
      padding: spacing.medium,
      borderRadius: 8,
    },
    panelText: {
      color: colors.ivory6, // Ivory text on a Bronze background for contrast
    },
  };
  