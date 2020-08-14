const del  = require('del');
const gulp = require('gulp');

const clean = () => del('www/**/*')

const transpile = () => {
  const webpack = require('webpack-stream');
  const config  = require('./webpack.config')

  return gulp.src('src/index.ts')
    .pipe(webpack(config))
    .pipe(gulp.dest('www/'));
};

const build = gulp.series(clean,transpile);

module.exports = {clean,transpile,build};