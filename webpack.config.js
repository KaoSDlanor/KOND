const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode : 'development',
  devtool : 'source-map',
  resolve : {
    alias : {
      'vue$' : 'vue/dist/vue.esm.js',
    },
    extensions : ['.ts','.js','.json'],
  },
  module : {
    rules : [
      {
        test    : /\.js$/,
        enforce : 'pre',
        use     : 'source-map-loader',
      },
      {
        test    : /\.ts$/,
        use     : 'ts-loader',
        exclude : /node_modules|\.d\.ts/,
      },
      {
        test    : /\.d\.ts$/,
        use     : 'ignore-loader',
      },
      {
        test    : /\.html$/,
        use     : 'html-loader',
        exclude : /\.vue\.html$/,
      },
      {
        test    : /\.vue\.html$/,
        loader  : 'vue-template-loader',
        options : {
          transformAssetUrls : {
            'audio'  : 'src',
            'embed'  : 'src',
            'img'    : 'src',
            'img'    : 'srcset',
            'input'  : 'src',
            'link'   : 'href',
            'object' : 'data',
            'script' : 'src',
            'source' : 'src',
            'source' : 'srcset',
            'track'  : 'src',
            'video'  : 'poster',
            'video'  : 'src',
        
          },
          scoped : true,
        },
      },
      {
        test    : /\.css$/,
        enforce : 'post',
        use     : ['style-loader','css-loader?modules']
      },
      {
        test    : /\.(png|jpg|webp)$/,
        use     : 'file-loader',
      }
    ],
  },
  output : {
    filename      : 'index.js',
    libraryTarget : 'umd',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template : './src/index.html',
    }),
  ],
};