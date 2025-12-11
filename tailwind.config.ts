import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        fontFamily: {
            // These will now use CSS variables set by LanguageProvider
            heading: ["var(--font-active-heading)", ...fontFamily.sans],
            body: ["var(--font-active-body)", ...fontFamily.sans],
        },
        colors: {
            background: 'hsl(var(--background))',
            foreground: 'hsl(var(--foreground))',
            card: {
                DEFAULT: 'hsl(var(--card))',
                foreground: 'hsl(var(--card-foreground))'
            },
            popover: {
                DEFAULT: 'hsl(var(--popover))',
                foreground: 'hsl(var(--popover-foreground))'
            },
            primary: {
                DEFAULT: 'hsl(var(--primary))',
                foreground: 'hsl(var(--primary-foreground))'
            },
            secondary: {
                DEFAULT: 'hsl(var(--secondary))', // Success color
                foreground: 'hsl(var(--secondary-foreground))'
            },
            muted: {
                DEFAULT: 'hsl(var(--muted))',
                foreground: 'hsl(var(--muted-foreground))' // Secondary text color
            },
            accent: {
                DEFAULT: 'hsl(var(--accent))', // Teal accent
                foreground: 'hsl(var(--accent-foreground))'
            },
            destructive: {
                DEFAULT: 'hsl(var(--destructive))', // Error color
                foreground: 'hsl(var(--destructive-foreground))'
            },
             warning: {
                DEFAULT: 'hsl(var(--warning))', // Warning color
                foreground: 'hsl(var(--warning-foreground))'
             },
            border: 'hsl(var(--border))',
            input: 'hsl(var(--input))',
            ring: 'hsl(var(--ring))', // Focus ring color
            chart: {
                '1': 'hsl(var(--chart-1))',
                '2': 'hsl(var(--chart-2))',
                '3': 'hsl(var(--chart-3))',
                '4': 'hsl(var(--chart-4))',
                '5': 'hsl(var(--chart-5))'
            },
            sidebar: {
                DEFAULT: 'hsl(var(--sidebar-background))',
                foreground: 'hsl(var(--sidebar-foreground))',
                primary: 'hsl(var(--sidebar-primary))',
                'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                accent: 'hsl(var(--sidebar-accent))',
                'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                border: 'hsl(var(--sidebar-border))',
                ring: 'hsl(var(--sidebar-ring))'
            }
        },
        borderRadius: {
            lg: 'var(--radius)', // Base radius for most elements
            md: 'calc(var(--radius) - 2px)',
            sm: 'calc(var(--radius) - 4px)',
            'xl': 'calc(var(--radius) + 4px)', // For 16px card radius
            '2xl': '1rem', // Explicitly 16px
        },
        boxShadow: {
          'card': '4px 8px 0 rgba(0,0,0,0.10)', // Custom card shadow
        },
        height: {
            '12': '3rem', // 48px for buttons
        },
        keyframes: {
            'accordion-down': {
                from: {
                    height: '0'
                },
                to: {
                    height: 'var(--radix-accordion-content-height)'
                }
            },
            'accordion-up': {
                from: {
                    height: 'var(--radix-accordion-content-height)'
                },
                to: {
                    height: '0'
                }
            }
        },
        animation: {
            'accordion-down': 'accordion-down 0.2s ease-out',
            'accordion-up': 'accordion-up 0.2s ease-out'
        }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
