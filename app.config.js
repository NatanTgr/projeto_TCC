module.exports = ({ config }) => {
  const desenvolvimento = process.env.APP_VARIANT === "development";

  return {
    ...config,
    name: desenvolvimento ? "PAED Dev" : config.name,
    android: {
      ...config.android,
      package: desenvolvimento
        ? `${config.android.package}.dev`
        : config.android.package,
    },
  };
};