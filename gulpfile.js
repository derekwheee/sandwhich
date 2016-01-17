var gulp         = require('gulp');
var jshint       = require('gulp-jshint');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var rename       = require('gulp-rename');
var livereload   = require('gulp-livereload');
var htmlreplace  = require('gulp-html-replace');
var uglify       = require('gulp-uglifyjs');
var beep         = require('beepbeep');
var del          = require('del');
var chalk        = require('chalk');
var handlebars   = require('gulp-handlebars');
var wrap         = require('gulp-wrap');
var declare      = require('gulp-declare');
var concat       = require('gulp-concat');
var merge        = require('merge-stream');
var replace      = require('gulp-replace-task');

require('dotenv').load();

gulp.task('replace-stuff', ['copy:views'], function () {

    console.log(chalk.magenta.bold('[replace-stuff]') + ' Replacing stuff in views');

    return gulp.src('./dist/views/**/*.hbs', {base: './dist/views'})
        .pipe(replace({
            patterns: [
                {
                    match: 'googleApiKey',
                    replacement: process.env.GOOGLE_API_KEY
                }
            ]
        }))
        .pipe(gulp.dest('./dist/views'));
});

gulp.task('copy:views', function () {

    console.log(chalk.magenta.bold('[copy:views]') + ' Copying views to ./dist');

    return gulp.src('./views/**/*.hbs', {base: './views'})
        .pipe(gulp.dest('./dist/views/'));

});

gulp.task('html-replace', ['uglify', 'replace-stuff'], function() {

    console.log(chalk.magenta.bold('[html-replace]') + ' Replacing some HTML');

    return gulp.src('dist/views/shared/_layout.hbs')
        .pipe(htmlreplace({
            'js': 'js/scripts.min.js'
        }))
        .pipe(gulp.dest('dist/views/shared/'));
});

gulp.task('lint', function() {

    console.log(chalk.magenta.bold('[lint]') + ' Linting JavaScript files');

    return gulp.src(['./**/*.js', '!./static/js/templates/*.js', '!./**/*.min.js', '!./static/components/**/*.js', '!./static/js/vendor/**/*.js', '!./node_modules/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));

});

gulp.task('sass:dev', function () {

    console.log(chalk.magenta.bold('[sass]') + ' Compiling development CSS');

    return gulp.src('static/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            sourceMap: true
        }))
        .on('error', function (error) {
            beep();
            console.log(chalk.magenta.bold('[sass]') + chalk.red.bold(' There was an issue compiling Sass'));
            console.error(error.message);
            this.emit('end');
        })
        // Should be writing sourcemaps AFTER autoprefixer runs,
        // but that breaks everything right now.
        .pipe(sourcemaps.write())
        .pipe(autoprefixer({
            browsers: ['last 3 versions', 'ie 9']
        }))
        .pipe(gulp.dest('./static/css'))
        .pipe(livereload());
});

gulp.task('sass:prod', function () {

    console.log(chalk.magenta.bold('[sass]') + ' Compiling production CSS');

    return gulp.src('static/scss/*.scss')

        .pipe(sass({
            outputStyle: 'compressed',
            sourcemap: false
        }))

        .on('error', function (error) {
            beep();
            console.error(error);
            this.emit('end');
        })

        .pipe(autoprefixer({
            browsers: ['last 3 versions', 'ie 9']
        }))

        .pipe(gulp.dest('./static/css'));
});

gulp.task('uglify', function() {

    console.log(chalk.magenta.bold('[uglify]') + ' Concatenating JavaScript files');

    return gulp.src([
            './static/components/jquery/dist/jquery.min.js',
            './static/components/handlebars/handlebars.js',
            './static/components/lodash/lodash.js',
            './static/js/templates/templates.js',
            './static/js/which.js'
        ])
        .pipe(uglify('scripts.min.js'))
        .pipe(gulp.dest('./static/js/'));
});

// Compile handlebars templates for schemas
gulp.task('handlebars', function () {

    console.log('[handlebars]'.bold.magenta + ' Compiling handlebars templates');

    var partials = gulp.src(['static/js/templates/**/_*.hbs'])
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
            imports: {
                processPartialName: function (fileName) {
                    return JSON.stringify(path.basename(fileName, '.js').substr(1));
                }
            }
        }));

    var templates = gulp.src('static/js/templates/**/[^_]*.hbs')
        .pipe(handlebars({
            handlebars : require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace : 'templates',
            noRedeclare : true,
            processName : function (filePath) {
                return declare.processNameByPath(filePath.replace('static/js/templates/', ''));
            }
        }));

    return merge(partials, templates)
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('static/js/templates/'));

});

// Watch files for changes
gulp.task('watch', function () {

    console.log(chalk.magenta.bold('[watch]') + ' Watching Sass files for changes');

    livereload.listen();
    gulp.watch(['static/scss/**/*.scss'], ['sass:dev']);
    gulp.watch(['./**/*.js', '!./static/components/**/*.js', '!./static/js/vendor/**/*.js', '!./node_modules/**/*.js'], ['lint']);
    gulp.watch(['./views/**/*.hbs'], ['replace-stuff']);
    gulp.watch(['static/js/templates/**/*.hbs'], ['handlebars']);

});

// Compile Sass and watch for file changes
gulp.task('dev', ['lint', 'sass:dev', 'replace-stuff', 'handlebars', 'watch'], function () {
    return console.log(chalk.magenta.bold('\n[dev]') + chalk.bold.green(' Ready for you to start doing things\n'));
});

// Compile production Sass
gulp.task('build', ['sass:prod', 'html-replace', 'lint']);
