const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	mode: 'jit',
	content: [
		'./app/**/*.tsx',
		'./app/**/*.jsx',
		'./app/**/*.js',
		'./app/**/*.ts',
	],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Work Sans', ...defaultTheme.fontFamily.sans],
			},
			backgroundImage: {
				'wave-dark': "url('/images/wave-dark.svg')",
				'wave-light': "url('/images/wave-light.svg')",
				'layered-waves-dark': "url('/images/layered-waves-dark.svg')",
				'layered-waves-light': "url('/images/layered-waves-light.svg')",
			},
			margin: {
				neg3: '-3rem',
			},
		},
	},
	variants: {},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/line-clamp'),
		require('@tailwindcss/aspect-ratio'),
		require('daisyui'),
	],
	daisyui: {
		darkTheme: 'dark',
		themes: [
			{
				cupcake: {
					primary: '#004bbc',
					secondary: '#7B92B2',
					accent: '#EEAF3A',
					neutral: '#291334',
					'base-100': '#dbeafe',
					info: '#3ABFF8',
					success: '#36D399',
					warning: '#FBBD23',
					error: '#F87272',
				},
			},
			{
				dark: {
					primary: '#002a67',
					secondary: '#7B92B2',
					accent: '#CA8A04',
					neutral: '#191D24',
					'base-100': '#2A303C',
					info: '#3ABFF8',
					success: '#36D399',
					warning: '#FBBD23',
					error: '#F87272',
				},
			},
		],
	},
};
