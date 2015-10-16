var gulp = require("gulp"),
    less = require("gulp-less"),
    rename = require("gulp-rename"),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require("gulp-concat"),
    htmlreplace = require("gulp-html-replace"),
    order = require("gulp-order"),
    autoprefixer = require("gulp-autoprefixer"),
    merge = require("merge-stream"),
    path = require("path");

var paths = {
    baseOutputDir: "dist",
    js: {
        vendors: ["src/js/vendors/jquery*.js", "src/js/vendors/knockout*.js"],
        app: ["src/js/main.js"],
        outputDir: "js",
        outputFileName: "app"
    },
    css: {
        vendors: ["src/css/vendors/normalize.css", "src/css/vendors/font-awesome.css"],
        app: ["src/css/main.less"],
        outputDir: "css",
        outputFileName: "styles"
    },
    html: {
        app: ["src/index.html"]
    },
    fonts: {
        sourceDir: "src/css/vendors/fonts/*",
        outputDir: "css/fonts"
    },
    img: {
        sourceDir: "src/img/*",
        outputDir: "img"
    }
};

gulp.task("css", function() {
    var vendors = gulp.src(paths.css.vendors)
        .pipe(concat("vendors.css"));

    var app = gulp.src(paths.css.app)
        .pipe(less())
        .pipe(autoprefixer("last 2 versions"))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }))
        .pipe(concat("app.css"));

    return merge(vendors, app)
        .pipe(order(["vendors.css", "app.css"]))
        .pipe(concat(paths.css.outputFileName))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(path.join(paths.baseOutputDir, paths.css.outputDir)));
});

gulp.task("js:lint", function() {
    return gulp.src(paths.js.app)
        .pipe(jshint())
        .pipe(jshint.reporter("default"))
        .pipe(jshint.reporter("fail"));
});

gulp.task("js", ["js:lint"], function() {
    var vendors = gulp.src(paths.js.vendors)
        .pipe(concat("vendors.js"));

    var app = gulp.src(paths.js.app)
        .pipe(concat("app.js"))
        .pipe(uglify());

    return merge(vendors, app)
        .pipe(order(["vendors.js", "app.js"]))
        .pipe(concat(paths.js.outputFileName))
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(gulp.dest(path.join(paths.baseOutputDir, paths.js.outputDir)));
});

gulp.task("html", function() {
    return gulp.src(paths.html.app)
        .pipe(htmlreplace({
            "css": paths.css.outputDir + "/" + paths.css.outputFileName + ".min.css",
            "js": paths.js.outputDir + "/" + paths.js.outputFileName + ".min.js"
        }))
        .pipe(gulp.dest(paths.baseOutputDir));
});

gulp.task("copy-fonts", function() {
    return gulp.src(paths.img.sourceDir)
        .pipe(gulp.dest(path.join(paths.baseOutputDir, paths.img.outputDir)));
});

gulp.task("copy-images", function() {
    return gulp.src(paths.fonts.sourceDir)
        .pipe(gulp.dest(path.join(paths.baseOutputDir, paths.fonts.outputDir)));
});

// development: only compile less and linting
gulp.task("default", ["css", "js:lint"]);

gulp.task("build", ["css", "js", "html", "copy-fonts", "copy-images"]);