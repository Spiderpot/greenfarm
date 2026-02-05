import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  /* =========================
     Next.js defaults
  ========================= */
  ...nextVitals,
  ...nextTs,

  /* =========================
     Custom project rules
     (GreenFarm overrides)
  ========================= */
  {
    rules: {
      // ✅ We intentionally use <img> for Supabase/public images
      // next/image causes crashes + restrictions for marketplace uploads
      "@next/next/no-img-element": "off",
    },
  },

  /* =========================
     Ignore build folders
  ========================= */
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
