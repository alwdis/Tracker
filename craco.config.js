const path = require('path');

module.exports = {
  // Настройки для Electron
  webpack: {
    configure: (webpackConfig) => {
      // Указываем, что это Electron renderer
      webpackConfig.target = 'electron-renderer';
      
      // Настройки для статических файлов
      webpackConfig.output.publicPath = './';
      
      // Настройки для Node.js модулей
      webpackConfig.node = {
        __dirname: false,
        __filename: false
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
