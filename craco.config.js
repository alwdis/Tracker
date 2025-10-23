const path = require('path');

module.exports = {
  // Настройки для Electron
  webpack: {
    configure: (webpackConfig) => {
      // В dev режиме используем 'web' target для совместимости с HMR
      // В production используем 'electron-renderer'
      webpackConfig.target = process.env.NODE_ENV === 'production' ? 'electron-renderer' : 'web';
      
      // Настройки для статических файлов
      // В dev режиме используем '/', в production - './'
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.output.publicPath = './';
      }
      
      // Настройки для Node.js модулей
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        events: false,
        buffer: false,
        stream: false,
        util: false,
        process: false
      };
      
      return webpackConfig;
    }
  },
  
  // Настройки для статических файлов
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          // Добавляем поддержку статических файлов
          webpackConfig.module.rules.push({
            test: /\.(png|jpe?g|gif|svg|ico)$/i,
            use: [
              {
                loader: 'file-loader',
                options: {
                  outputPath: 'static/media/',
                  publicPath: './static/media/',
                },
              },
            ],
          });
          
          return webpackConfig;
        },
      },
    },
  ],
};
