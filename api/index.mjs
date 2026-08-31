var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/double-indexed-kv.js
var require_double_indexed_kv = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/double-indexed-kv.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.DoubleIndexedKV = void 0;
    var DoubleIndexedKV = (
      /** @class */
      (function() {
        function DoubleIndexedKV2() {
          this.keyToValue = /* @__PURE__ */ new Map();
          this.valueToKey = /* @__PURE__ */ new Map();
        }
        DoubleIndexedKV2.prototype.set = function(key, value) {
          this.keyToValue.set(key, value);
          this.valueToKey.set(value, key);
        };
        DoubleIndexedKV2.prototype.getByKey = function(key) {
          return this.keyToValue.get(key);
        };
        DoubleIndexedKV2.prototype.getByValue = function(value) {
          return this.valueToKey.get(value);
        };
        DoubleIndexedKV2.prototype.clear = function() {
          this.keyToValue.clear();
          this.valueToKey.clear();
        };
        return DoubleIndexedKV2;
      })()
    );
    exports.DoubleIndexedKV = DoubleIndexedKV;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/registry.js
var require_registry = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/registry.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.Registry = void 0;
    var double_indexed_kv_1 = require_double_indexed_kv();
    var Registry = (
      /** @class */
      (function() {
        function Registry2(generateIdentifier) {
          this.generateIdentifier = generateIdentifier;
          this.kv = new double_indexed_kv_1.DoubleIndexedKV();
        }
        Registry2.prototype.register = function(value, identifier) {
          if (this.kv.getByValue(value)) {
            return;
          }
          if (!identifier) {
            identifier = this.generateIdentifier(value);
          }
          this.kv.set(identifier, value);
        };
        Registry2.prototype.clear = function() {
          this.kv.clear();
        };
        Registry2.prototype.getIdentifier = function(value) {
          return this.kv.getByValue(value);
        };
        Registry2.prototype.getValue = function(identifier) {
          return this.kv.getByKey(identifier);
        };
        return Registry2;
      })()
    );
    exports.Registry = Registry;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/class-registry.js
var require_class_registry = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/class-registry.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
    exports.__esModule = true;
    exports.ClassRegistry = void 0;
    var registry_1 = require_registry();
    var ClassRegistry = (
      /** @class */
      (function(_super) {
        __extends(ClassRegistry2, _super);
        function ClassRegistry2() {
          var _this = _super.call(this, function(c) {
            return c.name;
          }) || this;
          _this.classToAllowedProps = /* @__PURE__ */ new Map();
          return _this;
        }
        ClassRegistry2.prototype.register = function(value, options) {
          if (typeof options === "object") {
            if (options.allowProps) {
              this.classToAllowedProps.set(value, options.allowProps);
            }
            _super.prototype.register.call(this, value, options.identifier);
          } else {
            _super.prototype.register.call(this, value, options);
          }
        };
        ClassRegistry2.prototype.getAllowedProps = function(value) {
          return this.classToAllowedProps.get(value);
        };
        return ClassRegistry2;
      })(registry_1.Registry)
    );
    exports.ClassRegistry = ClassRegistry;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/util.js
var require_util = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/util.js"(exports) {
    "use strict";
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    exports.__esModule = true;
    exports.findArr = exports.includes = exports.forEach = exports.find = void 0;
    function valuesOfObj(record) {
      if ("values" in Object) {
        return Object.values(record);
      }
      var values = [];
      for (var key in record) {
        if (record.hasOwnProperty(key)) {
          values.push(record[key]);
        }
      }
      return values;
    }
    function find(record, predicate) {
      var values = valuesOfObj(record);
      if ("find" in values) {
        return values.find(predicate);
      }
      var valuesNotNever = values;
      for (var i = 0; i < valuesNotNever.length; i++) {
        var value = valuesNotNever[i];
        if (predicate(value)) {
          return value;
        }
      }
      return void 0;
    }
    exports.find = find;
    function forEach(record, run) {
      Object.entries(record).forEach(function(_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        return run(value, key);
      });
    }
    exports.forEach = forEach;
    function includes(arr, value) {
      return arr.indexOf(value) !== -1;
    }
    exports.includes = includes;
    function findArr(record, predicate) {
      for (var i = 0; i < record.length; i++) {
        var value = record[i];
        if (predicate(value)) {
          return value;
        }
      }
      return void 0;
    }
    exports.findArr = findArr;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/custom-transformer-registry.js
var require_custom_transformer_registry = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/custom-transformer-registry.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.CustomTransformerRegistry = void 0;
    var util_1 = require_util();
    var CustomTransformerRegistry = (
      /** @class */
      (function() {
        function CustomTransformerRegistry2() {
          this.transfomers = {};
        }
        CustomTransformerRegistry2.prototype.register = function(transformer) {
          this.transfomers[transformer.name] = transformer;
        };
        CustomTransformerRegistry2.prototype.findApplicable = function(v) {
          return util_1.find(this.transfomers, function(transformer) {
            return transformer.isApplicable(v);
          });
        };
        CustomTransformerRegistry2.prototype.findByName = function(name) {
          return this.transfomers[name];
        };
        return CustomTransformerRegistry2;
      })()
    );
    exports.CustomTransformerRegistry = CustomTransformerRegistry;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/is.js
var require_is = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/is.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.isURL = exports.isTypedArray = exports.isInfinite = exports.isBigint = exports.isPrimitive = exports.isNaNValue = exports.isError = exports.isDate = exports.isSymbol = exports.isSet = exports.isMap = exports.isRegExp = exports.isBoolean = exports.isNumber = exports.isString = exports.isArray = exports.isEmptyObject = exports.isPlainObject = exports.isNull = exports.isUndefined = void 0;
    var getType = function(payload) {
      return Object.prototype.toString.call(payload).slice(8, -1);
    };
    var isUndefined = function(payload) {
      return typeof payload === "undefined";
    };
    exports.isUndefined = isUndefined;
    var isNull = function(payload) {
      return payload === null;
    };
    exports.isNull = isNull;
    var isPlainObject = function(payload) {
      if (typeof payload !== "object" || payload === null)
        return false;
      if (payload === Object.prototype)
        return false;
      if (Object.getPrototypeOf(payload) === null)
        return true;
      return Object.getPrototypeOf(payload) === Object.prototype;
    };
    exports.isPlainObject = isPlainObject;
    var isEmptyObject = function(payload) {
      return exports.isPlainObject(payload) && Object.keys(payload).length === 0;
    };
    exports.isEmptyObject = isEmptyObject;
    var isArray = function(payload) {
      return Array.isArray(payload);
    };
    exports.isArray = isArray;
    var isString = function(payload) {
      return typeof payload === "string";
    };
    exports.isString = isString;
    var isNumber = function(payload) {
      return typeof payload === "number" && !isNaN(payload);
    };
    exports.isNumber = isNumber;
    var isBoolean = function(payload) {
      return typeof payload === "boolean";
    };
    exports.isBoolean = isBoolean;
    var isRegExp = function(payload) {
      return payload instanceof RegExp;
    };
    exports.isRegExp = isRegExp;
    var isMap = function(payload) {
      return payload instanceof Map;
    };
    exports.isMap = isMap;
    var isSet = function(payload) {
      return payload instanceof Set;
    };
    exports.isSet = isSet;
    var isSymbol = function(payload) {
      return getType(payload) === "Symbol";
    };
    exports.isSymbol = isSymbol;
    var isDate = function(payload) {
      return payload instanceof Date && !isNaN(payload.valueOf());
    };
    exports.isDate = isDate;
    var isError = function(payload) {
      return payload instanceof Error;
    };
    exports.isError = isError;
    var isNaNValue = function(payload) {
      return typeof payload === "number" && isNaN(payload);
    };
    exports.isNaNValue = isNaNValue;
    var isPrimitive = function(payload) {
      return exports.isBoolean(payload) || exports.isNull(payload) || exports.isUndefined(payload) || exports.isNumber(payload) || exports.isString(payload) || exports.isSymbol(payload);
    };
    exports.isPrimitive = isPrimitive;
    var isBigint = function(payload) {
      return typeof payload === "bigint";
    };
    exports.isBigint = isBigint;
    var isInfinite = function(payload) {
      return payload === Infinity || payload === -Infinity;
    };
    exports.isInfinite = isInfinite;
    var isTypedArray = function(payload) {
      return ArrayBuffer.isView(payload) && !(payload instanceof DataView);
    };
    exports.isTypedArray = isTypedArray;
    var isURL = function(payload) {
      return payload instanceof URL;
    };
    exports.isURL = isURL;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/pathstringifier.js
var require_pathstringifier = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/pathstringifier.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.parsePath = exports.stringifyPath = exports.escapeKey = void 0;
    var escapeKey = function(key) {
      return key.replace(/\./g, "\\.");
    };
    exports.escapeKey = escapeKey;
    var stringifyPath = function(path) {
      return path.map(String).map(exports.escapeKey).join(".");
    };
    exports.stringifyPath = stringifyPath;
    var parsePath = function(string) {
      var result = [];
      var segment = "";
      for (var i = 0; i < string.length; i++) {
        var char = string.charAt(i);
        var isEscapedDot = char === "\\" && string.charAt(i + 1) === ".";
        if (isEscapedDot) {
          segment += ".";
          i++;
          continue;
        }
        var isEndOfSegment = char === ".";
        if (isEndOfSegment) {
          result.push(segment);
          segment = "";
          continue;
        }
        segment += char;
      }
      var lastSegment = segment;
      result.push(lastSegment);
      return result;
    };
    exports.parsePath = parsePath;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/transformer.js
var require_transformer = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/transformer.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t2[p] = s[p];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __spreadArray = exports && exports.__spreadArray || function(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
      return to;
    };
    exports.__esModule = true;
    exports.untransformValue = exports.transformValue = exports.isInstanceOfRegisteredClass = void 0;
    var is_1 = require_is();
    var util_1 = require_util();
    function simpleTransformation(isApplicable, annotation, transform, untransform) {
      return {
        isApplicable,
        annotation,
        transform,
        untransform
      };
    }
    var simpleRules = [
      simpleTransformation(is_1.isUndefined, "undefined", function() {
        return null;
      }, function() {
        return void 0;
      }),
      simpleTransformation(is_1.isBigint, "bigint", function(v) {
        return v.toString();
      }, function(v) {
        if (typeof BigInt !== "undefined") {
          return BigInt(v);
        }
        console.error("Please add a BigInt polyfill.");
        return v;
      }),
      simpleTransformation(is_1.isDate, "Date", function(v) {
        return v.toISOString();
      }, function(v) {
        return new Date(v);
      }),
      simpleTransformation(is_1.isError, "Error", function(v, superJson) {
        var baseError = {
          name: v.name,
          message: v.message
        };
        superJson.allowedErrorProps.forEach(function(prop) {
          baseError[prop] = v[prop];
        });
        return baseError;
      }, function(v, superJson) {
        var e = new Error(v.message);
        e.name = v.name;
        e.stack = v.stack;
        superJson.allowedErrorProps.forEach(function(prop) {
          e[prop] = v[prop];
        });
        return e;
      }),
      simpleTransformation(is_1.isRegExp, "regexp", function(v) {
        return "" + v;
      }, function(regex) {
        var body = regex.slice(1, regex.lastIndexOf("/"));
        var flags = regex.slice(regex.lastIndexOf("/") + 1);
        return new RegExp(body, flags);
      }),
      simpleTransformation(
        is_1.isSet,
        "set",
        // (sets only exist in es6+)
        // eslint-disable-next-line es5/no-es6-methods
        function(v) {
          return __spreadArray([], __read(v.values()));
        },
        function(v) {
          return new Set(v);
        }
      ),
      simpleTransformation(is_1.isMap, "map", function(v) {
        return __spreadArray([], __read(v.entries()));
      }, function(v) {
        return new Map(v);
      }),
      simpleTransformation(function(v) {
        return is_1.isNaNValue(v) || is_1.isInfinite(v);
      }, "number", function(v) {
        if (is_1.isNaNValue(v)) {
          return "NaN";
        }
        if (v > 0) {
          return "Infinity";
        } else {
          return "-Infinity";
        }
      }, Number),
      simpleTransformation(function(v) {
        return v === 0 && 1 / v === -Infinity;
      }, "number", function() {
        return "-0";
      }, Number),
      simpleTransformation(is_1.isURL, "URL", function(v) {
        return v.toString();
      }, function(v) {
        return new URL(v);
      })
    ];
    function compositeTransformation(isApplicable, annotation, transform, untransform) {
      return {
        isApplicable,
        annotation,
        transform,
        untransform
      };
    }
    var symbolRule = compositeTransformation(function(s, superJson) {
      if (is_1.isSymbol(s)) {
        var isRegistered = !!superJson.symbolRegistry.getIdentifier(s);
        return isRegistered;
      }
      return false;
    }, function(s, superJson) {
      var identifier = superJson.symbolRegistry.getIdentifier(s);
      return ["symbol", identifier];
    }, function(v) {
      return v.description;
    }, function(_, a, superJson) {
      var value = superJson.symbolRegistry.getValue(a[1]);
      if (!value) {
        throw new Error("Trying to deserialize unknown symbol");
      }
      return value;
    });
    var constructorToName = [
      Int8Array,
      Uint8Array,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
      Uint8ClampedArray
    ].reduce(function(obj, ctor) {
      obj[ctor.name] = ctor;
      return obj;
    }, {});
    var typedArrayRule = compositeTransformation(is_1.isTypedArray, function(v) {
      return ["typed-array", v.constructor.name];
    }, function(v) {
      return __spreadArray([], __read(v));
    }, function(v, a) {
      var ctor = constructorToName[a[1]];
      if (!ctor) {
        throw new Error("Trying to deserialize unknown typed array");
      }
      return new ctor(v);
    });
    function isInstanceOfRegisteredClass(potentialClass, superJson) {
      if (potentialClass === null || potentialClass === void 0 ? void 0 : potentialClass.constructor) {
        var isRegistered = !!superJson.classRegistry.getIdentifier(potentialClass.constructor);
        return isRegistered;
      }
      return false;
    }
    exports.isInstanceOfRegisteredClass = isInstanceOfRegisteredClass;
    var classRule = compositeTransformation(isInstanceOfRegisteredClass, function(clazz, superJson) {
      var identifier = superJson.classRegistry.getIdentifier(clazz.constructor);
      return ["class", identifier];
    }, function(clazz, superJson) {
      var allowedProps = superJson.classRegistry.getAllowedProps(clazz.constructor);
      if (!allowedProps) {
        return __assign({}, clazz);
      }
      var result = {};
      allowedProps.forEach(function(prop) {
        result[prop] = clazz[prop];
      });
      return result;
    }, function(v, a, superJson) {
      var clazz = superJson.classRegistry.getValue(a[1]);
      if (!clazz) {
        throw new Error("Trying to deserialize unknown class - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564");
      }
      return Object.assign(Object.create(clazz.prototype), v);
    });
    var customRule = compositeTransformation(function(value, superJson) {
      return !!superJson.customTransformerRegistry.findApplicable(value);
    }, function(value, superJson) {
      var transformer = superJson.customTransformerRegistry.findApplicable(value);
      return ["custom", transformer.name];
    }, function(value, superJson) {
      var transformer = superJson.customTransformerRegistry.findApplicable(value);
      return transformer.serialize(value);
    }, function(v, a, superJson) {
      var transformer = superJson.customTransformerRegistry.findByName(a[1]);
      if (!transformer) {
        throw new Error("Trying to deserialize unknown custom value");
      }
      return transformer.deserialize(v);
    });
    var compositeRules = [classRule, symbolRule, customRule, typedArrayRule];
    var transformValue = function(value, superJson) {
      var applicableCompositeRule = util_1.findArr(compositeRules, function(rule) {
        return rule.isApplicable(value, superJson);
      });
      if (applicableCompositeRule) {
        return {
          value: applicableCompositeRule.transform(value, superJson),
          type: applicableCompositeRule.annotation(value, superJson)
        };
      }
      var applicableSimpleRule = util_1.findArr(simpleRules, function(rule) {
        return rule.isApplicable(value, superJson);
      });
      if (applicableSimpleRule) {
        return {
          value: applicableSimpleRule.transform(value, superJson),
          type: applicableSimpleRule.annotation
        };
      }
      return void 0;
    };
    exports.transformValue = transformValue;
    var simpleRulesByAnnotation = {};
    simpleRules.forEach(function(rule) {
      simpleRulesByAnnotation[rule.annotation] = rule;
    });
    var untransformValue = function(json, type, superJson) {
      if (is_1.isArray(type)) {
        switch (type[0]) {
          case "symbol":
            return symbolRule.untransform(json, type, superJson);
          case "class":
            return classRule.untransform(json, type, superJson);
          case "custom":
            return customRule.untransform(json, type, superJson);
          case "typed-array":
            return typedArrayRule.untransform(json, type, superJson);
          default:
            throw new Error("Unknown transformation: " + type);
        }
      } else {
        var transformation = simpleRulesByAnnotation[type];
        if (!transformation) {
          throw new Error("Unknown transformation: " + type);
        }
        return transformation.untransform(json, superJson);
      }
    };
    exports.untransformValue = untransformValue;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/accessDeep.js
var require_accessDeep = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/accessDeep.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.setDeep = exports.getDeep = void 0;
    var is_1 = require_is();
    var util_1 = require_util();
    var getNthKey = function(value, n) {
      var keys = value.keys();
      while (n > 0) {
        keys.next();
        n--;
      }
      return keys.next().value;
    };
    function validatePath(path) {
      if (util_1.includes(path, "__proto__")) {
        throw new Error("__proto__ is not allowed as a property");
      }
      if (util_1.includes(path, "prototype")) {
        throw new Error("prototype is not allowed as a property");
      }
      if (util_1.includes(path, "constructor")) {
        throw new Error("constructor is not allowed as a property");
      }
    }
    var getDeep = function(object, path) {
      validatePath(path);
      for (var i = 0; i < path.length; i++) {
        var key = path[i];
        if (is_1.isSet(object)) {
          object = getNthKey(object, +key);
        } else if (is_1.isMap(object)) {
          var row = +key;
          var type = +path[++i] === 0 ? "key" : "value";
          var keyOfRow = getNthKey(object, row);
          switch (type) {
            case "key":
              object = keyOfRow;
              break;
            case "value":
              object = object.get(keyOfRow);
              break;
          }
        } else {
          object = object[key];
        }
      }
      return object;
    };
    exports.getDeep = getDeep;
    var setDeep = function(object, path, mapper) {
      validatePath(path);
      if (path.length === 0) {
        return mapper(object);
      }
      var parent = object;
      for (var i = 0; i < path.length - 1; i++) {
        var key = path[i];
        if (is_1.isArray(parent)) {
          var index = +key;
          parent = parent[index];
        } else if (is_1.isPlainObject(parent)) {
          parent = parent[key];
        } else if (is_1.isSet(parent)) {
          var row = +key;
          parent = getNthKey(parent, row);
        } else if (is_1.isMap(parent)) {
          var isEnd = i === path.length - 2;
          if (isEnd) {
            break;
          }
          var row = +key;
          var type = +path[++i] === 0 ? "key" : "value";
          var keyOfRow = getNthKey(parent, row);
          switch (type) {
            case "key":
              parent = keyOfRow;
              break;
            case "value":
              parent = parent.get(keyOfRow);
              break;
          }
        }
      }
      var lastKey = path[path.length - 1];
      if (is_1.isArray(parent)) {
        parent[+lastKey] = mapper(parent[+lastKey]);
      } else if (is_1.isPlainObject(parent)) {
        parent[lastKey] = mapper(parent[lastKey]);
      }
      if (is_1.isSet(parent)) {
        var oldValue = getNthKey(parent, +lastKey);
        var newValue = mapper(oldValue);
        if (oldValue !== newValue) {
          parent["delete"](oldValue);
          parent.add(newValue);
        }
      }
      if (is_1.isMap(parent)) {
        var row = +path[path.length - 2];
        var keyToRow = getNthKey(parent, row);
        var type = +lastKey === 0 ? "key" : "value";
        switch (type) {
          case "key": {
            var newKey = mapper(keyToRow);
            parent.set(newKey, parent.get(keyToRow));
            if (newKey !== keyToRow) {
              parent["delete"](keyToRow);
            }
            break;
          }
          case "value": {
            parent.set(keyToRow, mapper(parent.get(keyToRow)));
            break;
          }
        }
      }
      return object;
    };
    exports.setDeep = setDeep;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/plainer.js
var require_plainer = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/plainer.js"(exports) {
    "use strict";
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __spreadArray = exports && exports.__spreadArray || function(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
      return to;
    };
    exports.__esModule = true;
    exports.walker = exports.generateReferentialEqualityAnnotations = exports.applyReferentialEqualityAnnotations = exports.applyValueAnnotations = void 0;
    var is_1 = require_is();
    var pathstringifier_1 = require_pathstringifier();
    var transformer_1 = require_transformer();
    var util_1 = require_util();
    var pathstringifier_2 = require_pathstringifier();
    var accessDeep_1 = require_accessDeep();
    function traverse(tree, walker2, origin) {
      if (origin === void 0) {
        origin = [];
      }
      if (!tree) {
        return;
      }
      if (!is_1.isArray(tree)) {
        util_1.forEach(tree, function(subtree, key) {
          return traverse(subtree, walker2, __spreadArray(__spreadArray([], __read(origin)), __read(pathstringifier_2.parsePath(key))));
        });
        return;
      }
      var _a = __read(tree, 2), nodeValue = _a[0], children = _a[1];
      if (children) {
        util_1.forEach(children, function(child, key) {
          traverse(child, walker2, __spreadArray(__spreadArray([], __read(origin)), __read(pathstringifier_2.parsePath(key))));
        });
      }
      walker2(nodeValue, origin);
    }
    function applyValueAnnotations(plain, annotations, superJson) {
      traverse(annotations, function(type, path) {
        plain = accessDeep_1.setDeep(plain, path, function(v) {
          return transformer_1.untransformValue(v, type, superJson);
        });
      });
      return plain;
    }
    exports.applyValueAnnotations = applyValueAnnotations;
    function applyReferentialEqualityAnnotations(plain, annotations) {
      function apply(identicalPaths, path) {
        var object = accessDeep_1.getDeep(plain, pathstringifier_2.parsePath(path));
        identicalPaths.map(pathstringifier_2.parsePath).forEach(function(identicalObjectPath) {
          plain = accessDeep_1.setDeep(plain, identicalObjectPath, function() {
            return object;
          });
        });
      }
      if (is_1.isArray(annotations)) {
        var _a = __read(annotations, 2), root = _a[0], other = _a[1];
        root.forEach(function(identicalPath) {
          plain = accessDeep_1.setDeep(plain, pathstringifier_2.parsePath(identicalPath), function() {
            return plain;
          });
        });
        if (other) {
          util_1.forEach(other, apply);
        }
      } else {
        util_1.forEach(annotations, apply);
      }
      return plain;
    }
    exports.applyReferentialEqualityAnnotations = applyReferentialEqualityAnnotations;
    var isDeep = function(object, superJson) {
      return is_1.isPlainObject(object) || is_1.isArray(object) || is_1.isMap(object) || is_1.isSet(object) || transformer_1.isInstanceOfRegisteredClass(object, superJson);
    };
    function addIdentity(object, path, identities) {
      var existingSet = identities.get(object);
      if (existingSet) {
        existingSet.push(path);
      } else {
        identities.set(object, [path]);
      }
    }
    function generateReferentialEqualityAnnotations(identitites, dedupe) {
      var result = {};
      var rootEqualityPaths = void 0;
      identitites.forEach(function(paths) {
        if (paths.length <= 1) {
          return;
        }
        if (!dedupe) {
          paths = paths.map(function(path) {
            return path.map(String);
          }).sort(function(a, b) {
            return a.length - b.length;
          });
        }
        var _a = __read(paths), representativePath = _a[0], identicalPaths = _a.slice(1);
        if (representativePath.length === 0) {
          rootEqualityPaths = identicalPaths.map(pathstringifier_1.stringifyPath);
        } else {
          result[pathstringifier_1.stringifyPath(representativePath)] = identicalPaths.map(pathstringifier_1.stringifyPath);
        }
      });
      if (rootEqualityPaths) {
        if (is_1.isEmptyObject(result)) {
          return [rootEqualityPaths];
        } else {
          return [rootEqualityPaths, result];
        }
      } else {
        return is_1.isEmptyObject(result) ? void 0 : result;
      }
    }
    exports.generateReferentialEqualityAnnotations = generateReferentialEqualityAnnotations;
    var walker = function(object, identities, superJson, dedupe, path, objectsInThisPath, seenObjects) {
      var _a;
      if (path === void 0) {
        path = [];
      }
      if (objectsInThisPath === void 0) {
        objectsInThisPath = [];
      }
      if (seenObjects === void 0) {
        seenObjects = /* @__PURE__ */ new Map();
      }
      var primitive = is_1.isPrimitive(object);
      if (!primitive) {
        addIdentity(object, path, identities);
        var seen = seenObjects.get(object);
        if (seen) {
          return dedupe ? {
            transformedValue: null
          } : seen;
        }
      }
      if (!isDeep(object, superJson)) {
        var transformed_1 = transformer_1.transformValue(object, superJson);
        var result_1 = transformed_1 ? {
          transformedValue: transformed_1.value,
          annotations: [transformed_1.type]
        } : {
          transformedValue: object
        };
        if (!primitive) {
          seenObjects.set(object, result_1);
        }
        return result_1;
      }
      if (util_1.includes(objectsInThisPath, object)) {
        return {
          transformedValue: null
        };
      }
      var transformationResult = transformer_1.transformValue(object, superJson);
      var transformed = (_a = transformationResult === null || transformationResult === void 0 ? void 0 : transformationResult.value) !== null && _a !== void 0 ? _a : object;
      var transformedValue = is_1.isArray(transformed) ? [] : {};
      var innerAnnotations = {};
      util_1.forEach(transformed, function(value, index) {
        var recursiveResult = exports.walker(value, identities, superJson, dedupe, __spreadArray(__spreadArray([], __read(path)), [index]), __spreadArray(__spreadArray([], __read(objectsInThisPath)), [object]), seenObjects);
        transformedValue[index] = recursiveResult.transformedValue;
        if (is_1.isArray(recursiveResult.annotations)) {
          innerAnnotations[index] = recursiveResult.annotations;
        } else if (is_1.isPlainObject(recursiveResult.annotations)) {
          util_1.forEach(recursiveResult.annotations, function(tree, key) {
            innerAnnotations[pathstringifier_1.escapeKey(index) + "." + key] = tree;
          });
        }
      });
      var result = is_1.isEmptyObject(innerAnnotations) ? {
        transformedValue,
        annotations: !!transformationResult ? [transformationResult.type] : void 0
      } : {
        transformedValue,
        annotations: !!transformationResult ? [transformationResult.type, innerAnnotations] : innerAnnotations
      };
      if (!primitive) {
        seenObjects.set(object, result);
      }
      return result;
    };
    exports.walker = walker;
  }
});

// node_modules/.pnpm/is-what@4.1.16/node_modules/is-what/dist/cjs/index.cjs
var require_cjs = __commonJS({
  "node_modules/.pnpm/is-what@4.1.16/node_modules/is-what/dist/cjs/index.cjs"(exports) {
    "use strict";
    function getType(payload) {
      return Object.prototype.toString.call(payload).slice(8, -1);
    }
    function isAnyObject(payload) {
      return getType(payload) === "Object";
    }
    function isArray(payload) {
      return getType(payload) === "Array";
    }
    function isBlob(payload) {
      return getType(payload) === "Blob";
    }
    function isBoolean(payload) {
      return getType(payload) === "Boolean";
    }
    function isDate(payload) {
      return getType(payload) === "Date" && !isNaN(payload);
    }
    function isEmptyArray(payload) {
      return isArray(payload) && payload.length === 0;
    }
    function isPlainObject(payload) {
      if (getType(payload) !== "Object")
        return false;
      const prototype = Object.getPrototypeOf(payload);
      return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
    }
    function isEmptyObject(payload) {
      return isPlainObject(payload) && Object.keys(payload).length === 0;
    }
    function isEmptyString(payload) {
      return payload === "";
    }
    function isError(payload) {
      return getType(payload) === "Error" || payload instanceof Error;
    }
    function isFile(payload) {
      return getType(payload) === "File";
    }
    function isFullArray(payload) {
      return isArray(payload) && payload.length > 0;
    }
    function isFullObject(payload) {
      return isPlainObject(payload) && Object.keys(payload).length > 0;
    }
    function isString(payload) {
      return getType(payload) === "String";
    }
    function isFullString(payload) {
      return isString(payload) && payload !== "";
    }
    function isFunction(payload) {
      return typeof payload === "function";
    }
    function isType(payload, type) {
      if (!(type instanceof Function)) {
        throw new TypeError("Type must be a function");
      }
      if (!Object.prototype.hasOwnProperty.call(type, "prototype")) {
        throw new TypeError("Type is not a class");
      }
      const name = type.name;
      return getType(payload) === name || Boolean(payload && payload.constructor === type);
    }
    function isInstanceOf(value, classOrClassName) {
      if (typeof classOrClassName === "function") {
        for (let p = value; p; p = Object.getPrototypeOf(p)) {
          if (isType(p, classOrClassName)) {
            return true;
          }
        }
        return false;
      } else {
        for (let p = value; p; p = Object.getPrototypeOf(p)) {
          if (getType(p) === classOrClassName) {
            return true;
          }
        }
        return false;
      }
    }
    function isMap(payload) {
      return getType(payload) === "Map";
    }
    function isNaNValue(payload) {
      return getType(payload) === "Number" && isNaN(payload);
    }
    function isNumber(payload) {
      return getType(payload) === "Number" && !isNaN(payload);
    }
    function isNegativeNumber(payload) {
      return isNumber(payload) && payload < 0;
    }
    function isNull(payload) {
      return getType(payload) === "Null";
    }
    function isOneOf(a, b, c, d, e) {
      return (value) => a(value) || b(value) || !!c && c(value) || !!d && d(value) || !!e && e(value);
    }
    function isUndefined(payload) {
      return getType(payload) === "Undefined";
    }
    var isNullOrUndefined = isOneOf(isNull, isUndefined);
    function isObject(payload) {
      return isPlainObject(payload);
    }
    function isObjectLike(payload) {
      return isAnyObject(payload);
    }
    function isPositiveNumber(payload) {
      return isNumber(payload) && payload > 0;
    }
    function isSymbol(payload) {
      return getType(payload) === "Symbol";
    }
    function isPrimitive(payload) {
      return isBoolean(payload) || isNull(payload) || isUndefined(payload) || isNumber(payload) || isString(payload) || isSymbol(payload);
    }
    function isPromise(payload) {
      return getType(payload) === "Promise";
    }
    function isRegExp(payload) {
      return getType(payload) === "RegExp";
    }
    function isSet(payload) {
      return getType(payload) === "Set";
    }
    function isWeakMap(payload) {
      return getType(payload) === "WeakMap";
    }
    function isWeakSet(payload) {
      return getType(payload) === "WeakSet";
    }
    exports.getType = getType;
    exports.isAnyObject = isAnyObject;
    exports.isArray = isArray;
    exports.isBlob = isBlob;
    exports.isBoolean = isBoolean;
    exports.isDate = isDate;
    exports.isEmptyArray = isEmptyArray;
    exports.isEmptyObject = isEmptyObject;
    exports.isEmptyString = isEmptyString;
    exports.isError = isError;
    exports.isFile = isFile;
    exports.isFullArray = isFullArray;
    exports.isFullObject = isFullObject;
    exports.isFullString = isFullString;
    exports.isFunction = isFunction;
    exports.isInstanceOf = isInstanceOf;
    exports.isMap = isMap;
    exports.isNaNValue = isNaNValue;
    exports.isNegativeNumber = isNegativeNumber;
    exports.isNull = isNull;
    exports.isNullOrUndefined = isNullOrUndefined;
    exports.isNumber = isNumber;
    exports.isObject = isObject;
    exports.isObjectLike = isObjectLike;
    exports.isOneOf = isOneOf;
    exports.isPlainObject = isPlainObject;
    exports.isPositiveNumber = isPositiveNumber;
    exports.isPrimitive = isPrimitive;
    exports.isPromise = isPromise;
    exports.isRegExp = isRegExp;
    exports.isSet = isSet;
    exports.isString = isString;
    exports.isSymbol = isSymbol;
    exports.isType = isType;
    exports.isUndefined = isUndefined;
    exports.isWeakMap = isWeakMap;
    exports.isWeakSet = isWeakSet;
  }
});

// node_modules/.pnpm/copy-anything@3.0.5/node_modules/copy-anything/dist/cjs/index.cjs
var require_cjs2 = __commonJS({
  "node_modules/.pnpm/copy-anything@3.0.5/node_modules/copy-anything/dist/cjs/index.cjs"(exports) {
    "use strict";
    var isWhat = require_cjs();
    function assignProp(carry, key, newVal, originalObject, includeNonenumerable) {
      const propType = {}.propertyIsEnumerable.call(originalObject, key) ? "enumerable" : "nonenumerable";
      if (propType === "enumerable")
        carry[key] = newVal;
      if (includeNonenumerable && propType === "nonenumerable") {
        Object.defineProperty(carry, key, {
          value: newVal,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
    }
    function copy(target, options = {}) {
      if (isWhat.isArray(target)) {
        return target.map((item) => copy(item, options));
      }
      if (!isWhat.isPlainObject(target)) {
        return target;
      }
      const props = Object.getOwnPropertyNames(target);
      const symbols = Object.getOwnPropertySymbols(target);
      return [...props, ...symbols].reduce((carry, key) => {
        if (isWhat.isArray(options.props) && !options.props.includes(key)) {
          return carry;
        }
        const val = target[key];
        const newVal = copy(val, options);
        assignProp(carry, key, newVal, target, options.nonenumerable);
        return carry;
      }, {});
    }
    exports.copy = copy;
  }
});

// node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/superjson@1.13.3/node_modules/superjson/dist/index.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t2[p] = s[p];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    var __read = exports && exports.__read || function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    var __spreadArray = exports && exports.__spreadArray || function(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
      return to;
    };
    exports.__esModule = true;
    exports.allowErrorProps = exports.registerSymbol = exports.registerCustom = exports.registerClass = exports.parse = exports.stringify = exports.deserialize = exports.serialize = exports.SuperJSON = void 0;
    var class_registry_1 = require_class_registry();
    var registry_1 = require_registry();
    var custom_transformer_registry_1 = require_custom_transformer_registry();
    var plainer_1 = require_plainer();
    var copy_anything_1 = require_cjs2();
    var SuperJSON = (
      /** @class */
      (function() {
        function SuperJSON2(_a) {
          var _b = _a === void 0 ? {} : _a, _c = _b.dedupe, dedupe = _c === void 0 ? false : _c;
          this.classRegistry = new class_registry_1.ClassRegistry();
          this.symbolRegistry = new registry_1.Registry(function(s) {
            var _a2;
            return (_a2 = s.description) !== null && _a2 !== void 0 ? _a2 : "";
          });
          this.customTransformerRegistry = new custom_transformer_registry_1.CustomTransformerRegistry();
          this.allowedErrorProps = [];
          this.dedupe = dedupe;
        }
        SuperJSON2.prototype.serialize = function(object) {
          var identities = /* @__PURE__ */ new Map();
          var output = plainer_1.walker(object, identities, this, this.dedupe);
          var res = {
            json: output.transformedValue
          };
          if (output.annotations) {
            res.meta = __assign(__assign({}, res.meta), { values: output.annotations });
          }
          var equalityAnnotations = plainer_1.generateReferentialEqualityAnnotations(identities, this.dedupe);
          if (equalityAnnotations) {
            res.meta = __assign(__assign({}, res.meta), { referentialEqualities: equalityAnnotations });
          }
          return res;
        };
        SuperJSON2.prototype.deserialize = function(payload) {
          var json = payload.json, meta = payload.meta;
          var result = copy_anything_1.copy(json);
          if (meta === null || meta === void 0 ? void 0 : meta.values) {
            result = plainer_1.applyValueAnnotations(result, meta.values, this);
          }
          if (meta === null || meta === void 0 ? void 0 : meta.referentialEqualities) {
            result = plainer_1.applyReferentialEqualityAnnotations(result, meta.referentialEqualities);
          }
          return result;
        };
        SuperJSON2.prototype.stringify = function(object) {
          return JSON.stringify(this.serialize(object));
        };
        SuperJSON2.prototype.parse = function(string) {
          return this.deserialize(JSON.parse(string));
        };
        SuperJSON2.prototype.registerClass = function(v, options) {
          this.classRegistry.register(v, options);
        };
        SuperJSON2.prototype.registerSymbol = function(v, identifier) {
          this.symbolRegistry.register(v, identifier);
        };
        SuperJSON2.prototype.registerCustom = function(transformer, name) {
          this.customTransformerRegistry.register(__assign({ name }, transformer));
        };
        SuperJSON2.prototype.allowErrorProps = function() {
          var _a;
          var props = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            props[_i] = arguments[_i];
          }
          (_a = this.allowedErrorProps).push.apply(_a, __spreadArray([], __read(props)));
        };
        SuperJSON2.defaultInstance = new SuperJSON2();
        SuperJSON2.serialize = SuperJSON2.defaultInstance.serialize.bind(SuperJSON2.defaultInstance);
        SuperJSON2.deserialize = SuperJSON2.defaultInstance.deserialize.bind(SuperJSON2.defaultInstance);
        SuperJSON2.stringify = SuperJSON2.defaultInstance.stringify.bind(SuperJSON2.defaultInstance);
        SuperJSON2.parse = SuperJSON2.defaultInstance.parse.bind(SuperJSON2.defaultInstance);
        SuperJSON2.registerClass = SuperJSON2.defaultInstance.registerClass.bind(SuperJSON2.defaultInstance);
        SuperJSON2.registerSymbol = SuperJSON2.defaultInstance.registerSymbol.bind(SuperJSON2.defaultInstance);
        SuperJSON2.registerCustom = SuperJSON2.defaultInstance.registerCustom.bind(SuperJSON2.defaultInstance);
        SuperJSON2.allowErrorProps = SuperJSON2.defaultInstance.allowErrorProps.bind(SuperJSON2.defaultInstance);
        return SuperJSON2;
      })()
    );
    exports.SuperJSON = SuperJSON;
    exports["default"] = SuperJSON;
    exports.serialize = SuperJSON.serialize;
    exports.deserialize = SuperJSON.deserialize;
    exports.stringify = SuperJSON.stringify;
    exports.parse = SuperJSON.parse;
    exports.registerClass = SuperJSON.registerClass;
    exports.registerCustom = SuperJSON.registerCustom;
    exports.registerSymbol = SuperJSON.registerSymbol;
    exports.allowErrorProps = SuperJSON.allowErrorProps;
  }
});

// api/index.source.ts
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
var import_superjson = __toESM(require_dist(), 1);
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
var t = initTRPC.context().create({
  transformer: import_superjson.default
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/registrationUploads.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}
async function storageGetSignedUrl(relKey) {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = normalizeKey(relKey);
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }
  const { url } = await resp.json();
  return url;
}

// server/registrationUploads.ts
var MAX_PHOTO_BYTES = 3 * 1024 * 1024;
var MAX_CV_BYTES = 5 * 1024 * 1024;
var MAX_IDENTITY_BYTES = 5 * 1024 * 1024;
var attachmentInput = z2.object({
  name: z2.string().min(1).max(140),
  mimeType: z2.string().min(1).max(100),
  dataUrl: z2.string().min(32).max(71e5)
});
var registrationUploadsInput = z2.object({
  photo: attachmentInput.optional(),
  cv: attachmentInput.optional(),
  identity: attachmentInput.optional()
});
function configuredPublicOrigin() {
  const configured = process.env.PUBLIC_APP_URL || process.env.APP_URL || process.env.VITE_APP_URL;
  if (!configured) return "";
  try {
    const url = new URL(configured);
    url.protocol = "https:";
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}
function toHttpsAbsoluteUrl(value, req) {
  const candidate = value.trim();
  if (!candidate) return "";
  const origin = configuredPublicOrigin() || `https://${req.get("x-forwarded-host") || req.get("host") || "localhost"}`;
  const url = new URL(candidate, `${origin}/`);
  url.protocol = "https:";
  return url.toString();
}
function policyFor(kind) {
  if (kind === "photo") return { allowed: ["image/jpeg", "image/png", "image/webp"], maxBytes: MAX_PHOTO_BYTES, folder: "photo" };
  if (kind === "identity") return { allowed: ["image/jpeg", "image/png", "application/pdf"], maxBytes: MAX_IDENTITY_BYTES, folder: "identity" };
  return { allowed: ["application/pdf"], maxBytes: MAX_CV_BYTES, folder: "cv" };
}
function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "attachment";
}
function prepareRegistrationAttachment(kind, attachment) {
  const policy = policyFor(kind);
  if (!policy.allowed.includes(attachment.mimeType)) {
    throw new TRPCError3({ code: "BAD_REQUEST", message: `Unsupported ${kind} file type.` });
  }
  const prefix = `data:${attachment.mimeType};base64,`;
  if (!attachment.dataUrl.startsWith(prefix)) {
    throw new TRPCError3({ code: "BAD_REQUEST", message: `Invalid ${kind} file payload.` });
  }
  const encoded = attachment.dataUrl.slice(prefix.length);
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new TRPCError3({ code: "BAD_REQUEST", message: `Invalid ${kind} file encoding.` });
  }
  const bytes = Buffer.from(encoded, "base64");
  if (!bytes.length || bytes.length > policy.maxBytes) {
    throw new TRPCError3({ code: "PAYLOAD_TOO_LARGE", message: `${kind === "photo" ? "Photo" : kind === "identity" ? "CIN or passport" : "CV"} exceeds the allowed size.` });
  }
  return { bytes, safeName: safeFilename(attachment.name), mimeType: attachment.mimeType, folder: policy.folder };
}
async function uploadRegistrationDocuments(input, req) {
  const documents = {};
  if (input.photo) {
    const photo = prepareRegistrationAttachment("photo", input.photo);
    const stored = await storagePut(`registrations/attachments/${photo.folder}/${Date.now()}-${photo.safeName}`, photo.bytes, photo.mimeType);
    documents.photo = { name: input.photo.name, url: toHttpsAbsoluteUrl(stored.url, req) };
  }
  if (input.cv) {
    const cv = prepareRegistrationAttachment("cv", input.cv);
    const stored = await storagePut(`registrations/attachments/${cv.folder}/${Date.now()}-${cv.safeName}`, cv.bytes, cv.mimeType);
    documents.cv = { name: input.cv.name, url: toHttpsAbsoluteUrl(stored.url, req) };
  }
  if (input.identity) {
    const identity = prepareRegistrationAttachment("identity", input.identity);
    const stored = await storagePut(`registrations/attachments/${identity.folder}/${Date.now()}-${identity.safeName}`, identity.bytes, identity.mimeType);
    documents.identity = { name: input.identity.name, url: toHttpsAbsoluteUrl(stored.url, req) };
  }
  return documents;
}

// server/registrationLeaderboard.ts
import { createHash } from "node:crypto";
import { asc, count, desc } from "drizzle-orm";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var registrationLeaderboardEntries = mysqlTable("registration_leaderboard_entries", {
  id: int("id").autoincrement().primaryKey(),
  lc: varchar("lc", { length: 64 }).notNull(),
  emailHash: varchar("email_hash", { length: 64 }).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull()
}, (table) => [uniqueIndex("registration_leaderboard_entries_email_hash_unique").on(table.emailHash)]);

// shared/registration.ts
var LOCAL_COMMITTEES = [
  "LC Thyna",
  "LC University",
  "SU Bullaregia",
  "LC Tacapes",
  "LC Ruspina",
  "LC Carthage",
  "LC Bardo",
  "LC Medina",
  "LC Hadrumet",
  "LC Nabel",
  "LC Sfax",
  "LC Bizerte"
];

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/registrationLeaderboard.ts
var aliases = {
  "lc bellaregia": "SU Bullaregia",
  "lc bullaregia": "SU Bullaregia",
  "su bullaregia": "SU Bullaregia",
  "lc nabeul": "LC Nabel",
  "lc nabel": "LC Nabel"
};
function normalizeLocalCommittee(value) {
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  const canonical = LOCAL_COMMITTEES.find((lc) => lc.toLowerCase() === normalized);
  return canonical ?? aliases[normalized] ?? null;
}
function hashRegistrationEmail(email) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}
async function recordLeaderboardRegistration(lc, email) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(registrationLeaderboardEntries).values({
    lc,
    emailHash: hashRegistrationEmail(email)
  }).onDuplicateKeyUpdate({ set: { lc } });
  return true;
}

// server/sheetsLeaderboard.ts
function parseSheetLeaderboard(payload) {
  if (!payload || typeof payload !== "object" || payload.ok !== true) {
    throw new Error("The registration sheet did not confirm leaderboard data.");
  }
  const entries = Array.isArray(payload.leaderboard) ? payload.leaderboard : [];
  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry;
    if (typeof candidate.lc !== "string" || !LOCAL_COMMITTEES.includes(candidate.lc)) return [];
    const registrations = Number(candidate.registrations);
    return Number.isInteger(registrations) && registrations > 0 ? [{ lc: candidate.lc, registrations }] : [];
  }).sort((left, right) => right.registrations - left.registrations || left.lc.localeCompare(right.lc)).slice(0, 3);
}
async function getSheetLeaderboard(endpoint = process.env.VITE_SHEETS_WEB_APP_URL) {
  if (!endpoint) throw new Error("The registration sheet endpoint is not configured.");
  const url = new URL(endpoint);
  url.searchParams.set("view", "leaderboard");
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15e3) });
  if (!response.ok) throw new Error("The registration sheet could not be reached.");
  return parseSheetLeaderboard(await response.json());
}

// server/registrationSubmission.ts
import { z as z3 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";

// shared/sheetsDelivery.ts
function confirmSheetsDelivery(httpOk, body) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error("The registration service returned an unreadable response. Please try again shortly.");
  }
  const response = parsed && typeof parsed === "object" ? parsed : {};
  if (!httpOk || response.ok !== true) {
    const message = typeof response.error === "string" && response.error.trim() ? response.error.trim() : "The registration service did not confirm your record.";
    throw new Error(message);
  }
  const documents = response.documents && typeof response.documents === "object" ? response.documents : void 0;
  return { ok: true, row: typeof response.row === "number" ? response.row : void 0, documents };
}

// server/registrationSubmission.ts
var DEFAULT_SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbykExcZ-IACxWONFqSMz-BQ4hg1dYF6zu_q-SgmYTp2auDyeuKeIrxWlYmoymi90RXB/exec";
var LEGACY_SHEETS_WEB_APP_URLS = /* @__PURE__ */ new Set([
  "https://script.google.com/macros/s/AKfycbxGWI8ZmEG80Hl8r0GciT4AnFGyCGc6QiQDzQ9kTyhkaDltfFtrddbtAMHGgV_m7lS4/exec",
  "https://script.google.com/macros/s/AKfycbxW5E8LFwz8FqDPSRovruq7mwi6LQ0BlLCIaSK4vADR-ZBTIeR8_F7n644FQGNqdn2b/exec",
  "https://script.google.com/macros/s/AKfycbyS16hLcvvCg4eqj7OpjI3qZV8WLRa_33qBtmBT6DJLCpUfeE8NNZBBNDySBCR9hKHa/exec"
]);
var documentUrl = z3.string().trim().refine((value) => !value || value.startsWith("https://"), "Document URLs must use HTTPS.");
var documentDataUrl = z3.string().trim().max(8e6).optional();
var registrationSubmissionInput = z3.object({
  firstName: z3.string().trim().min(1),
  lastName: z3.string().trim().min(1),
  passportNumber: z3.string().trim().min(1),
  gender: z3.enum(["Male", "Female"]),
  phoneCountry: z3.string().trim().min(1),
  phone: z3.string().trim().min(1),
  email: z3.string().trim().email(),
  track: z3.enum(["International AIESECer", "EP"]),
  position: z3.enum([
    "None",
    "MMB",
    "Manager",
    "Team Leader",
    "LCVP",
    "LCP",
    "MCVP",
    "MCP"
  ]),
  singleRoom: z3.boolean(),
  department: z3.string().trim().min(1),
  lcName: z3.string().trim().min(1),
  entityName: z3.string().trim().min(1),
  mcPosition: z3.string().trim().min(1),
  countryOfOrigin: z3.string().trim().min(1),
  hostingLc: z3.string().trim().min(1),
  allergies: z3.string().trim().min(1),
  note: z3.string().trim().min(1),
  price: z3.number().int().nonnegative(),
  currency: z3.literal("EUR"),
  photoUrl: documentUrl,
  photoDataUrl: documentDataUrl,
  photoName: z3.string().trim().min(1),
  cvUrl: documentUrl,
  cvDataUrl: documentDataUrl,
  cvName: z3.string().trim().min(1),
  identityUrl: documentUrl,
  identityDataUrl: documentDataUrl,
  identityName: z3.string().trim().min(1),
  indemnitySignature: z3.string().trim().min(1),
  indemnityAccepted: z3.boolean().refine((value) => value, "Indemnity consent is required.")
}).superRefine((input, ctx) => {
  const leadershipPosition = [
    "LCVP",
    "LCP",
    "MCVP",
    "MCP"
  ].includes(input.position);
  const stayNights = leadershipPosition ? 4 : 3;
  const expectedPrice = (leadershipPosition ? 90 : 65) + (input.singleRoom ? 20 * stayNights : 0);
  if (input.price !== expectedPrice) {
    ctx.addIssue({
      code: z3.ZodIssueCode.custom,
      path: ["price"],
      message: `Price must be ${expectedPrice} EUR for the selected room type.`
    });
  }
  if (input.track === "EP") {
    if (input.position !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["position"],
        message: "EP registrations must not include an AIESEC position."
      });
    }
    if (input.department !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["department"],
        message: "EP registrations must not include an AIESEC department."
      });
    }
    if (input.lcName !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["lcName"],
        message: "EP registrations must not include an LC name."
      });
    }
    if (input.entityName !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["entityName"],
        message: "EP registrations must not include an entity name."
      });
    }
    if (input.mcPosition !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["mcPosition"],
        message: "EP registrations must not include an MC position."
      });
    }
    if (input.hostingLc === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["hostingLc"],
        message: "Hosting LC is required for EP registrations."
      });
    }
  } else {
    if (input.position === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["position"],
        message: "International AIESECer registrations require a position."
      });
    }
    if (input.department === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["department"],
        message: "International AIESECer registrations require a department."
      });
    }
    const mcPosition = ["MCVP", "MCP"].includes(input.position);
    if (!mcPosition && input.lcName === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["lcName"],
        message: "International AIESECer registrations require an LC name unless the position is MCVP or MCP."
      });
    }
    if (mcPosition && input.lcName !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["lcName"],
        message: "MCVP and MCP registrations must not include an LC name."
      });
    }
    if (input.mcPosition !== "None" && input.position === "MCP") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["mcPosition"],
        message: "MCP registrations must not include an MC position."
      });
    }
    if (input.position === "MCVP" && input.mcPosition === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["mcPosition"],
        message: "MCVP registrations require an MC position."
      });
    }
    if (!["MCVP", "MCP"].includes(input.position) && input.mcPosition !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["mcPosition"],
        message: "Only MCVP registrations may include an MC position."
      });
    }
    if (input.entityName === "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["entityName"],
        message: "International AIESECer registrations require an entity name."
      });
    }
    if (input.countryOfOrigin !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["countryOfOrigin"],
        message: "International AIESECer registrations do not require a country of origin."
      });
    }
    if (input.hostingLc !== "None") {
      ctx.addIssue({
        code: z3.ZodIssueCode.custom,
        path: ["hostingLc"],
        message: "International AIESECer registrations do not require a hosting LC."
      });
    }
  }
});
async function submitRegistrationToSheets(input) {
  const configuredEndpoint = process.env.VITE_SHEETS_WEB_APP_URL || process.env.SHEETS_WEB_APP_URL;
  const endpoint = configuredEndpoint && !LEGACY_SHEETS_WEB_APP_URLS.has(configuredEndpoint) ? configuredEndpoint : DEFAULT_SHEETS_WEB_APP_URL;
  if (!endpoint) {
    throw new TRPCError4({
      code: "PRECONDITION_FAILED",
      message: "Registration setup is incomplete. Please contact the organising team before retrying."
    });
  }
  let url;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:" || !url.pathname.endsWith("/exec"))
      throw new Error("Invalid registration endpoint.");
  } catch {
    throw new TRPCError4({
      code: "PRECONDITION_FAILED",
      message: "Registration setup is incomplete. Please contact the organising team before retrying."
    });
  }
  try {
    const requestBody = JSON.stringify(input);
    const requestHeaders = {
      "Content-Type": "text/plain;charset=utf-8",
      Accept: "application/json"
    };
    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: requestBody,
      // Apps Script executes doPost() at /exec and returns a temporary
      // content-service URL for the JSON response. Capture that redirect
      // explicitly, then fetch the temporary URL as GET.
      redirect: "manual",
      signal: AbortSignal.timeout(3e4)
    });
    const finalResponse = response.status >= 300 && response.status < 400 ? await (async () => {
      const location = response.headers.get("location");
      if (!location)
        throw new Error(
          "The registration service did not provide a response location."
        );
      return fetch(location, {
        headers: { Accept: "application/json" },
        redirect: "follow",
        signal: AbortSignal.timeout(3e4)
      });
    })() : response;
    const confirmation = confirmSheetsDelivery(
      finalResponse.ok,
      await finalResponse.text()
    );
    return confirmation;
  } catch (error) {
    if (error instanceof TRPCError4) throw error;
    const message = error instanceof Error ? error.message : "The registration service could not confirm your record.";
    throw new TRPCError4({ code: "BAD_GATEWAY", message });
  }
}

// server/routers.ts
import { TRPCError as TRPCError5 } from "@trpc/server";
import { z as z4 } from "zod";
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  registration: router({
    uploadDocuments: publicProcedure.input(registrationUploadsInput).mutation(({ input, ctx }) => uploadRegistrationDocuments(input, ctx.req)),
    submit: publicProcedure.input(registrationSubmissionInput).mutation(({ input }) => submitRegistrationToSheets(input)),
    leaderboard: publicProcedure.query(() => getSheetLeaderboard()),
    record: publicProcedure.input(z4.object({ lc: z4.string().min(1), email: z4.string().email() })).mutation(async ({ input }) => {
      const lc = normalizeLocalCommittee(input.lc);
      if (!lc) throw new TRPCError5({ code: "BAD_REQUEST", message: "Select a valid local committee." });
      const recorded = await recordLeaderboardRegistration(lc, input.email);
      if (!recorded) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Registration leaderboard is unavailable." });
      return { lc };
    })
  })
  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api/index.source.ts
function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
async function handleStorage(req, res) {
  const requestUrl = new URL(req.url ?? "/", "https://vercel.local");
  const key = decodeURIComponent(
    requestUrl.pathname.replace(/^\/manus-storage\//, "")
  );
  if (!key) {
    sendJson(res, 400, { error: "Missing storage key" });
    return;
  }
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    sendJson(res, 500, { error: "Storage proxy not configured" });
    return;
  }
  try {
    const signedUrl = await storageGetSignedUrl(key);
    res.statusCode = 307;
    res.setHeader("Location", signedUrl);
    res.end();
  } catch (error) {
    console.error("[StorageProxy] failed:", error);
    sendJson(res, 502, { error: "Storage proxy error" });
  }
}
async function handler(req, res) {
  const requestUrl = new URL(req.url ?? "/", "https://vercel.local");
  if (requestUrl.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "lead-lead-api" });
    return;
  }
  if (requestUrl.pathname.startsWith("/manus-storage/")) {
    await handleStorage(req, res);
    return;
  }
  const path = requestUrl.pathname.replace(/^\/api\/trpc\/?/, "");
  await nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext: (options) => createContext(options)
  });
}
export {
  handler as default
};
