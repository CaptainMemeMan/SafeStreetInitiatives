import daisyui from "daisyui";
import daisyUIThemes from "daisyui/src/theming/themes";
/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [daisyui],

	daisyui: {
		themes: [
			"light",
			{
				black: {
					...daisyUIThemes["black"],
					primary: "rgb(255, 215, 0)",
					secondary: "rgb(128, 0, 128)",
				}
			}
		]
	}
};

/*purple {
	...daisyUIThemes["purple"],
	primary: "rgb(255, 215, 0)",
	secondary: "rbg (128, 0, 128)",
}, */
