var fsExtra = require("fs-extra");
var rimraf = require("rimraf");
const getSize = require('get-folder-size');
const { PurgeCSS } = require('purgecss')
const minify = require('@node-minify/core');
const cleanCSS = require('@node-minify/clean-css');
const async = require("async");
const uglifyES = require('@node-minify/uglify-es');
const htmlMinifier = require('@node-minify/html-minifier');

const cssFiles = ["style.css",
     "images/atom-one-dark.css",
     "images/bulma.css",
     "images/darkmode.css",
     "images/github-markdown-style.css",
     "images/vs2015.css",
     "images/font-awesome-all.css"]
const jsFiles = [
     "images/reading-time-es5.js"
]

main();
async function main() {
     if (fsExtra.exists("..\\release")) {
          console.log('Release 디렉터리 존재함.')
          rimraf.sync("..\\release");
          console.log("Release 디렉터리 삭제");
     }
     fsExtra.copySync('..\\src', '..\\release');
     console.log("src 디렉터리 복사 성공")

     await RemoveUnusedCSS();
     // minifyHTML();
     await minifyCSS();
     await minifyJS();
     async.waterfall([
          function (callback) {
               getSize("..\\src", (err, size) => {
                    if (err) { throw err; }
                    console.log("원본 디렉터리 사이즈: " + size + "Byte");
                    callback(null, size);
               });
          },
          function (originSize, callback) {
               getSize("..\\release", (err, size) => {
                    if (err) { throw err; }
                    console.log("압축처리된 디렉터리 사이즈: " + size + "Byte");
                    callback(null, originSize, size);
               });
          },
          function (originSize, compressSize, callback) {
               var result = (originSize - compressSize) / (originSize / 100);
               console.log("압축 결과: 100% > " + (100 - Math.floor(result) + "%"));
               callback(null);
          }
     ],
          function (err, result) {
               console.log("종료");
          });

}
async function RemoveUnusedCSS() {
     console.log("사용하지 않은 CSS 삭제");
     const purgeCSSResults = await new PurgeCSS().purge({
          content: ['../release/**/*.html'],
          css: ['../release/images/*.css']
     })
     //style.css는 처리하지 않음

     for (var i = 0; i < purgeCSSResults.length; i++) {
          fsExtra.writeFileSync(purgeCSSResults[i].file, purgeCSSResults[i].css);
     }
}
async function minifyCSS() {
     for (var i = 0; i < cssFiles.length; i++) {
          await minify({
               compressor: cleanCSS,
               input: "../release/" + cssFiles[i],
               output: "../release/" + cssFiles[i],
               options: {
                    advanced: false,
                    aggressiveMerging: false
                  }
          });
          console.log("../release/" + cssFiles[i] + "처리");
     }
}
async function minifyJS() {
     for (var i = 0; i < jsFiles.length; i++) {
          await minify({
               compressor: uglifyES,
               input: "../release/" + jsFiles[i],
               output: "../release/" + jsFiles[i]
          });
          console.log("../release/" + jsFiles[i] + "처리");
     }
}
async function minifyHTML() {
     minify({
          compressor: htmlMinifier,
          input: '../release/skin.html',
          output: '../release/skin.html'
     });
     console.log("../release/skin.html 처리");
}
