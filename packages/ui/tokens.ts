export type ColorScale = {
  50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string; DEFAULT: string;
};

export type DesignTokens = {
  colors: {
    primary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    danger: ColorScale;
  };
  radii: {
    md: string;
    lg: string;
    xl: string;
  };
  spacing: string[];
  zIndex: Record<string, number>;
  shadows: Record<string, string>;
  typography: {
    fontFamilySans: string[];
  };
};

export const tokens: DesignTokens = {
  colors: {
    primary: {
      50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', DEFAULT: '#4f46e5'
    },
    success: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', DEFAULT: '#10b981'
    },
    warning: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', DEFAULT: '#f59e0b'
    },
    danger: {
      50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', DEFAULT: '#ef4444'
    },
  },
  radii: { md: '0.75rem', lg: '1rem', xl: '1.25rem' },
  spacing: [
    '0px','2px','4px','6px','8px','10px','12px','14px','16px','20px','24px','28px','32px','40px','48px','56px','64px'
  ],
  zIndex: { modal: 50, popover: 30, dropdown: 20 },
  shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 10px rgba(0,0,0,0.08)' },
  typography: { fontFamilySans: ['Inter','ui-sans-serif','system-ui','Segoe UI','Roboto','Helvetica Neue','Arial','Noto Sans','sans-serif'] },
};


