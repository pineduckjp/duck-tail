export default {
  extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
  overrides: [
    {
      files: ["**/*.astro", "**/*.html"],
      customSyntax: "postcss-html",
    },
  ],
  rules: {
    // チェックを緩くしたい場合：
    // "order/properties-order": null,
    // "media-feature-range-notation": null,
    // "color-function-notation": null,
    // "shorthand-property-no-redundant-values": null,
    // "length-zero-no-unit": null,
  },
  ignoreFiles: ["dist/**", ".astro/**", "node_modules/**"],
};
