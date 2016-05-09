import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
//import jsdoc from 'jsdoc';

const $ = gulpLoadPlugins();

const COMMON_DIR = '../../common/js/dist';
const BASE_DIR = './app';
const PATHS = {
    DEV: `${BASE_DIR}/src`,
    BUILD: `${BASE_DIR}/build`,
    DIST: `${BASE_DIR}/dist`,
    TEST: [`${BASE_DIR}/src/**/*.js`, `${BASE_DIR}/test/**/*.spec.js`],
    JSDOC: `${BASE_DIR}/jsdoc`
};

gulp.task('clean', () => {
    return gulp.src([PATHS.BUILD, PATHS.DIST, PATHS.JSDOC], { read: false })
        .pipe($.clean({ force: true }));
});

gulp.task('eslint', function() {
    return gulp.src([`${PATHS.DEV}/**/*.js`])
        .pipe($.eslint({
            'extends' : '../../.eslintrc'
        }))
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError());
});

gulp.task('compile', () => {
    return gulp.src([`${PATHS.DEV}/**/*.js`])
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('smg.global.layermanager.js'))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.BUILD))
});

gulp.task('uglify', () => {
    return gulp.src(`${PATHS.BUILD}/**/*.js`)
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.uglify())
        .pipe(gulp.dest(PATHS.DIST))
});

// gulp.task('jsdoc', () => {
//     return gulp.src(`${PATHS.BUILD}/**/*.js`)
//         .pipe(jsdoc(PATHS.JSDOC))
// });

gulp.task('test', () => { 
    return gulp.src(PATHS.TEST)
        .pipe($.watch(PATHS.TEST))
        .pipe($.jasmineBrowser.specRunner())
        .pipe($.jasmineBrowser.server());
});

// 작업용 
gulp.task('watch', () => {
    gulp.watch(`${PATHS.DEV}/**/*.js`, ['eslint', 'compile']);
});

gulp.task('default', () => {
    runSequence('eslint', 'clean', 'compile', 'uglify');
});
