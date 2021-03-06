var template = require("lodash.template");
var gutil = require("gulp-util");
var api = require("./extra_api");
var extend = require("node.extend");

"use strict";


module.exports = function (reporter, message, options, templateOptions, callback) {
  var self = this;
  callback = callback || function () {};
  if (!reporter) return callback(new gutil.PluginError("gulp-notify", "No reporter specified."));

  // Try/catch the only way to go to ensure catching all errors? Domains?
  try {
    var options = constructOptions(options, message, templateOptions);
    api.logError(options, (message instanceof Error));
    reporter(options, function (err) {
      if (err) return callback(new gutil.PluginError("gulp-notify", err));
      return callback();
    });
  } catch (err) {
    return callback(new gutil.PluginError("gulp-notify", err));
  }
};

function generate (outputData, object, title, message, templateOptions) {
  if (object instanceof Error) {
    var titleTemplate = template(title);
    var messageTemplate = template(message);

    return extend(outputData, {
      title: titleTemplate({
        error: object,
        options: templateOptions
      }),
      message: messageTemplate({
        error: object,
        options: templateOptions
      })
    });
  }

  return extend(outputData, {
    title: gutil.template(title, {
      file: object,
      options: templateOptions
    }),
    message: gutil.template(message, {
      file: object,
      options: templateOptions
    })
  });
}

function constructOptions (options, object, templateOptions) {
  var message = object.path || object.message || object,
      title = !(object instanceof Error) ? "Gulp notification" : "Error running Gulp",
      outputData = {};

  if (typeof options === "function") {
    message = options(object);
  }

  if (typeof options === "string") {
    message = options;
  }

  if (typeof options === "object") {
    outputData = extend(true, {}, options);
    if (typeof outputData.title === "function") {
      title = outputData.title(object);
    } else {
      title = outputData.title || title;
    }

    if (typeof outputData.message === "function") {
      message = outputData.message(object);
    } else {
      message = outputData.message || message;
    }
  }
  return generate(outputData, object, title, message, templateOptions);
}
