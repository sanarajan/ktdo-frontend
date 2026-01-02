/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#ffd333',
                    50: '#fffae6',
                    100: '#fff5cc',
                    200: '#ffeb99',
                    300: '#ffe066',
                    400: '#ffd333',
                    500: '#e6bd00',
                    600: '#b39300',
                    700: '#806900',
                    800: '#4d3f00',
                    900: '#1a1500',
                },
                indigo: {
                    50: '#FFFFE0',
                    100: '#FEF9C3',
                    200: '#FEF08A',
                    300: '#FDE047',
                    400: '#FACC15',
                    500: '#EAB308',
                    600: '#FFD700',
                    700: '#E6C200',
                    800: '#CA8A04',
                    900: '#A16207',
                    950: '#422006',
                },
                gray: {
                    50: '#FAFAFA',
                    100: '#F4F4F5',
                    200: '#E4E4E7',
                    300: '#D4D4D8',
                    400: '#A1A1AA',
                    500: '#71717A',
                    600: '#52525B',
                    700: '#27272A',
                    800: '#1C1C1C',
                    900: '#000000',
                    950: '#000000',
                }
            }
        },
    },
    plugins: [],
}
