const GULP = require('gulp');
const FS = require('fs');
const WEBPACK = require('webpack-stream');

const SOURCE_DIR = 'al_fisher';


GULP.task('cleanup', async () => {
    if (!FS.existsSync('dist')) {
        return;
    }
    const {deleteAsync} = await import('del');
    return deleteAsync(['dist/**/*'], {force: true});
});

GULP.task('js', () => {
    const file = `${SOURCE_DIR}/js/main.js`;
    const webpack = WEBPACK(require('./wp.config.js'));
    return GULP.src(file).pipe(webpack).pipe(GULP.dest('dist/js'));
});

GULP.task('assets', () => {
    const files = [`${SOURCE_DIR}/manifest.json`, `${SOURCE_DIR}/icons/**/*.png`, './LICENSE'];
    const options = {base: SOURCE_DIR, encoding: false, allowEmpty: true};
    return GULP.src(files, options).pipe(GULP.dest('dist/'));
});

GULP.task('build', GULP.series('cleanup', GULP.parallel('js', 'assets')));