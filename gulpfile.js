const gulp = require('gulp');
const rename = require('gulp-rename');
const ejs = require('gulp-ejs');
const fs = require('fs');
const replace = require('gulp-replace'); 
const sass = require('gulp-sass');
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");
const browserSync = require('browser-sync'); 
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');

// EJSコンパイル
gulp.task('ejs',  (done) => {
    const data = JSON.parse(fs.readFileSync('./src/json/data.json'));
    gulp.src(["./src/ejs/**/*.ejs", "!./src/ejs/**/_*.ejs"])
      .pipe(plumber())
      .pipe(ejs(data))
      .pipe(ejs({}, {}, { ext: ".html" }))
      .pipe(rename({ extname: ".html" }))
      .pipe(replace(/^[ \t]*\n/gmi, ""))
      .pipe(gulp.dest("./dest/"));
    done();
});

// sassコンパイル
gulp.task('sass', (done) => {
    gulp.src('./src/scss/**/*.scss')
        .pipe(sass({
                    outputStyle: 'expanded'
				})
            )
		.on("error", sass.logError)
		.pipe(gulp.dest('./dest/css'));
	done();
});

// webpackのバンドル実行
gulp.task("webpack", (done) => {
    webpackStream(webpackConfig, webpack)
      .pipe(gulp.dest("./dest/js"));
    done();
});

// リロードするhtml
gulp.task('browser-sync', (done) => {
    browserSync.init({
        server : {
            baseDir : './dest/',
            index : 'index.html',
		},
	});
	done();
});

// リロード設定
gulp.task('browser-reload', (done) => {
	browserSync.reload();
	done();
});


// 画像圧縮
gulp.task('imagemin', (done) => {
    gulp.src('./src/img/**/*.{jpg,jpeg,png,gif,svg}')
    .pipe(imagemin(
      [
        pngquant({ quality: '65-80', speed: 1 }),
        mozjpeg({ quality: 80 }),
        imagemin.svgo(),
        imagemin.gifsicle()
      ]
    ))
    .pipe(gulp.dest('./dest/img'));
    done();
});


// 監視ファイル
gulp.task('watch-files', (done) =>  {
    gulp.watch(["./src/ejs/**/*.ejs", "./src/json/**/*.json"], gulp.task('ejs'));
    gulp.watch("./dest/*.html", gulp.task('browser-reload'));
    gulp.watch("./src/scss/**/*.scss", gulp.task('sass'));
    gulp.watch("./dest/css/*.css", gulp.task('browser-reload'));
    gulp.watch(["./src/ts/**/*.ts", "./src/json/**/*.json"], gulp.task('webpack'));
    gulp.watch("./dest/js/*.js", gulp.task('browser-reload'));
    gulp.watch("./src/img/**/*", gulp.task('imagemin'));
    gulp.watch("./dest/img/*", gulp.task('browser-reload'));
    done();
});

// タスク実行
gulp.task('default', 
    gulp.series(gulp.parallel(
        'watch-files', 'browser-sync', 'ejs', 'sass', 'webpack', 'imagemin'
    ), (done) => {
    done();
}));