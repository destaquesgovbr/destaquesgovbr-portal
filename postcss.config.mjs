import prefixWrap from "postcss-prefixwrap";

const config = {
  plugins: [
    "@tailwindcss/postcss",
    prefixWrap(".govbr", {
      whitelist: ["src/app/govbr.css"],
    }),
  ],
};

export default config;
