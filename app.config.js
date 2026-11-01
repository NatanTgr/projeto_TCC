module.exports = ({ config }) => {
  const desenvolvimento = process.env.APP_VARIANT === "development";

  const android = config.android ?? {};
  const packageName = android.package ?? "com.natanrodrigues.paed";

  return {
    ...config,
    name: desenvolvimento ? "PAED Dev" : config.name,
    android: {
      ...android,
      package: desenvolvimento
        ? `${packageName}.dev`
        : packageName,
      googleServicesFile: desenvolvimento
        ? "./google-services-dev.json"
        : "./google-services.json",
    },
  };
};