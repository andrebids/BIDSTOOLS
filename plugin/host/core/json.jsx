(function (global) {
  if (typeof global.JSON !== "undefined" && global.JSON &&
      typeof global.JSON.stringify === "function" &&
      typeof global.JSON.parse === "function") {
    return;
  }

  function padEscape(character) {
    var code = character.charCodeAt(0).toString(16);
    while (code.length < 4) {
      code = "0" + code;
    }
    return "\\u" + code;
  }

  function quoteString(value) {
    return "\"" + String(value).replace(/["\\\u0000-\u001F]/g, function (character) {
      switch (character) {
        case "\"":
          return "\\\"";
        case "\\":
          return "\\\\";
        case "\b":
          return "\\b";
        case "\f":
          return "\\f";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\t":
          return "\\t";
        default:
          return padEscape(character);
      }
    }) + "\"";
  }

  function stringifyValue(value) {
    var index;
    var partial;
    var key;

    if (value === null) {
      return "null";
    }

    switch (typeof value) {
      case "string":
        return quoteString(value);
      case "number":
        return isFinite(value) ? String(value) : "null";
      case "boolean":
        return value ? "true" : "false";
      case "object":
        if (value instanceof Array) {
          partial = [];
          for (index = 0; index < value.length; index += 1) {
            partial.push(stringifyValue(value[index]));
          }
          return "[" + partial.join(",") + "]";
        }

        partial = [];
        for (key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            partial.push(quoteString(key) + ":" + stringifyValue(value[key]));
          }
        }
        return "{" + partial.join(",") + "}";
      default:
        return "null";
    }
  }

  global.JSON = {
    stringify: function (value) {
      return stringifyValue(value);
    },
    parse: function (text) {
      return eval("(" + text + ")");
    }
  };
})(this);
