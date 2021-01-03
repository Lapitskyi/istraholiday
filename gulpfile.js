const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');

const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const panini = require('panini');
const webp = require('gulp-webp');




// для запуска/перезагрузки браузера
function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false
    });
}


// для удаления папки build
function cleanDist() {
    return del('dist')
}


// HTML
function html() {
    panini.refresh();
    return src('app/html/*.html')
        .pipe(panini({
            root: 'app/html/',
            layouts: 'app/html/layouts/',
            partials: 'app/html/partials/',
            helpers: 'app/html/helpers/',
            data: 'app/html/data/'
        }))
        .pipe(dest('app/'))
        .pipe(browserSync.stream())
}


// конвертация с scss в css, сжатия и переименовывания
function styles() {
    return src([
            'node_modules/swiper/swiper-bundle.css',
            'node_modules/slick-carousel/slick/slick.css',
            'node_modules/animate.css/animate.css',
            'app/scss/style.scss'
        ])
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}


// для сжатия JS
function scripts() {
    return src([
            'node_modules/swiper/swiper-bundle.js',
            'node_modules/jquery/dist/jquery.js',
            'node_modules/slick-carousel/slick/slick.js',
            'node_modules/wow.js/dist/wow.js',
            'app/js/main.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}



// для сжатия картинок
function images() {
    return src('app/images/**/*')
        .pipe(
            webp({
                quality: 85
            })
        )
        .pipe(dest('dist/images'))

        .pipe(src('app/images/**/*'))
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 85,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}




// для сборки проекта 
function build() {
    return src([
            'app/css/style.min.css',
            'app/fonts/**/*',
            'app/js/main.min.js',
            'app/*.html'
        ], {
            base: 'app'
        })
        .pipe(dest('dist'))
}


//  для слежения за  изменением в файлах проекта
function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/html/**/*.html'], html);
    watch(['app/fonts/**/*']);
}




// конвертация щрифтов
function fonts() {
    src('app/fonts/**/*.ttf')
        .pipe(ttf2woff())
        .pipe(dest('app/fonts'));

    return src('app/fonts/**/*.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'));
};



// для работы пакетов с gulp
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;

exports.watching = watching;
exports.browsersync = browsersync;
exports.cleanDist = cleanDist;



exports.build = series(cleanDist, images, build);

// для паралельного запуска пакетов
exports.default = parallel(html, styles, scripts, browsersync, watching);