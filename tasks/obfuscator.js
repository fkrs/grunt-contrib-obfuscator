'use strict';

var chalk = require('chalk');

var JavaScriptObfuscator = require('javascript-obfuscator');

function obfuscate(source, options) {
  var obfuscationResult = JavaScriptObfuscator.obfuscate(source, options);
  return obfuscationResult.getObfuscatedCode();
}

// Converts \r\n to \n
function normalizeLf(string) {
  return string.replace(/\r\n/g, '\n');
}

module.exports = function (grunt) {
  var getAvailableFiles = function (filesArray) {
    return filesArray.filter(function (filepath) {
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn('Source file ' + chalk.cyan(filepath) + ' not found');
        return false;
      }
      return true;
    });
  };

  grunt.registerMultiTask('obfuscator', 'Obfuscate JavaScript', function () {
    var created = {
      maps: 0,
      files: 0
    };

    this.files.forEach(function (file) {
      var options = this.options({
        banner: ''
      });

      var banner = normalizeLf(options.banner);

      var availableFiles = getAvailableFiles(file.src);

      if (options.sourceMap) {
        grunt.log.error('Source Maps are not available yet.');
        return;
      }

      var obfuscated = '';

      try {
        var totalCode = availableFiles.map(function (file) {
            return grunt.file.read(file);
        }).join('');

        obfuscated = obfuscate(totalCode, options);

      } catch (err) {
        grunt.log.error(err);
        grunt.warn('JavaScript Obfuscation failed at ' + availableFiles + '.');
      }

      var output = banner + obfuscated;

      grunt.file.write(file.dest, output);
      created.files++;

    }, this);

    if (created.files > 0) {
      grunt.log.ok(created.files + ' ' + grunt.util.pluralize(this.files.length, 'file/files') + ' created');
    } else {
      grunt.log.warn('No files created.');
    }
  });
};