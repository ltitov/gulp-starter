let path = {
	build:
	{
		html: "dist/",
		css: "dist/css/",
		js: "dist/js/",
		img: "dist/img/",
		fonts: "dist/fonts/",
	},
	src:
	{
		html: ["app/*.html", "!app/inc"],
		css: "app/sass/style.sass",
		js: "app/js/script.js",
		img: "app/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: "app/fonts/*.ttf",
	},
	watch:
	{
		html: "app/**/*.html",
		css: "app/sass/**/*.sass",
		js: "app/js/**/*..js",
		img: "app/img/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	clean: "./dist/"
}

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const cleancss = require('gulp-clean-css');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const del = require('del');

function browsersync() {
	browserSync.init({
		server: { baseDir: "./dist/" }, // Указываем папку сервера
		notify: false,
		online: true
	})
}

function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browserSync.stream())
}

function scripts() {
	return src(path.src.js)
		.pipe(
			rename({
				suffix: "script.min"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browserSync.stream())
}

function styles() {
	return src(path.src.css)
		.pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 10 versions"],
				cascade: true
			})
		)
		.pipe(
			rename({
				suffix: ".min"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browserSync.stream())
}

function images() {
	return src(path.src.img)
		.pipe(dest(path.build.img))
		.pipe(browserSync.stream())
}


function cleandist() {
	return del('dist/**/*', { force: true }) // 
}

function startwatch() {
	watch([path.watch.html], html);
	watch([path.watch.css], styles);
	watch([path.watch.js], scripts);
	watch(["app" + "/img/**/*.{jpg,png,svg,gif,ico,webp}"], images);
}





function htmlBuild() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(path.build.html))
		.pipe(browserSync.stream())
}

function scriptsBuild() {
	return src(path.src.js)
		.pipe(concat('script.min.js'))
		.pipe(uglify())
		.pipe(dest(path.build.js))
		.pipe(browserSync.stream())
}

function stylesBuild() {
	return src(path.src.css)
		.pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 10 versions"],
				cascade: true
			})
		)
		.pipe(cleancss())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browserSync.stream())
}

function imagesBuild() {
	return src(path.src.img)
		.pipe(dest(path.build.img))
		.pipe(browserSync.stream())
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.html = html;

exports.scriptsBuild = scriptsBuild;
exports.stylesBuild = stylesBuild;
exports.htmlBuild = htmlBuild;
exports.imagesBuild = imagesBuild;



exports.build = series(cleandist, htmlBuild, stylesBuild, scriptsBuild, imagesBuild);
exports.default = parallel(cleandist, html, styles, scripts, images, browsersync, startwatch);