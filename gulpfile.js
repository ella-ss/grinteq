'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const minCss = require('gulp-minify-css');
const gulpShopify = require('gulp-shopify-upload');
const watch = require('gulp-watch');

/**
 * Shopify access
 */

const API_KEY  = '';
const PASSWORD = '';
const MYSITE = '';
const THEME_ID = '';

/**
 * Asset paths.
 */
const srcSCSS = 'styles/**/*.scss';
const srcJS = 'scripts/**/*.js';
const assetsDir = 'assets/';

/**
 * SCSS task
 */
gulp.task('scss', () => {
    return gulp.src('styles/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(gulp.dest(assetsDir))
        .pipe(minCss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(assetsDir))
});

/**
 * JS task
 *
 */
const jsFiles = [
    // './node_modules/babel-polyfill/dist/polyfill.js',
    srcJS,
];

gulp.task('js', () => {
    return gulp.src('scripts/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(assetsDir))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(assetsDir));
});

gulp.task('shopifywatch', () => {
    gulp.watch(srcSCSS, gulp.series('scss'));
    gulp.watch(srcJS, gulp.series('js'));
    return watch('./+(assets|layout|sections|snippets|templates|locales)/**')
        .pipe(gulpShopify(API_KEY, PASSWORD, MYSITE, THEME_ID))
});



/**
 * Watch task
 */
gulp.task('watch', () => {
    gulp.watch(srcSCSS, gulp.series('scss'));
    gulp.watch(srcJS, gulp.series('js'));
});

/**
 * Default task
 */
gulp.task('default', gulp.series('scss', 'js'));
