const GULP = require('gulp');
const FS = require('fs');
const WEBPACK = require('webpack-stream');

const SOURCE_DIR = 'al_fisher';


GULP.task('clean', async () => {
    if (!FS.existsSync('dist')) {
        return;
    }
    const {deleteAsync} = await import('del');
    return deleteAsync(['dist/**/*'], {force: true});
});

GULP.task('js', () => {
    return GULP.src(`${SOURCE_DIR}/js/main.js`)
        .pipe(WEBPACK(require('./wp.config.js')))
        .pipe(GULP.dest('dist/js'));
});

GULP.task('manifest', () => {
    return GULP.src(`${SOURCE_DIR}/manifest.json`)
        .pipe(GULP.dest('dist'));
});

GULP.task('icons', () => {
    return GULP.src(`${SOURCE_DIR}/icons/**/*.png`, {encoding: false})
        .pipe(GULP.dest('dist/icons'));
});

GULP.task('license', () => {
    return GULP.src('./LICENSE')
        .pipe(GULP.dest('dist'));
});


GULP.task('build', GULP.series('clean', GULP.parallel('js', 'manifest', 'icons', 'license')));