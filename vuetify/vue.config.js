module.exports = {
  pwa: {
    name: 'PWA Platform'
  },

  // Allow npm run serve on local testing domain
  devServer: {
    compress: true,
    public: process.env.LOCAL_TESTING_DNS,
    port: 80
  },

  chainWebpack: config => {
    // disable hot reload
    // config.plugins.delete("hmr");
    // enable hashed filenames
    // config.plugin('html').tap(args => {
    //   args[0].hash = true
    //   return args
    // })
  },

  lintOnSave: undefined,
  publicPath: undefined,
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    },
  }
}
