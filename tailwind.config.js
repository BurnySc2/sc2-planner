module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },
    purge: {
        enabled: true,
        content: ["./src/**/*.{tsx,ts}"],
    },
    theme: {
        extend: {},
    },
    variants: {},
    plugins: [],
}
