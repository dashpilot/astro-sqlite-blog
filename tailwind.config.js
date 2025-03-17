// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        a: {
                            color: '#4f46e5',
                            '&:hover': {
                                color: '#4338ca',
                            },
                        },
                    },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
};
