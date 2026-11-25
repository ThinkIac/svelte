var __read, __spreadArray, __values;

__values = this && this.__values || function(o) {
  var i, m, s;
  s = typeof Symbol == 'function' && Symbol.iterator;
  m = s && o[s];
  i = 0;
  if (m) {
    return m.call(o);
  }
  if (o && typeof o.length == 'number') {
    return {
      next: function() {
        if (o && i >= o.length) {
          o = void 0;
        }
        return {
          value: o && o[i++],
          done: !o
        };
      }
    };
  }
  throw new TypeError((s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.'));
};

__read = this && this.__read || function(o, n) {
  var __caught, ar, e, error, i, m, r;
  m = typeof Symbol == 'function' && o[Symbol.iterator];
  if (!m) {
    return o;
  }
  i = m.call(o);
  r = void 0;
  ar = [];
  e = void 0;
  try {
    while ((n == void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error1) {
    error = error1;
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i['return'])) {
        m.call(i);
      }
    } catch (error1) {
      __caught = error1;
      throw __caught;
    } finally {
      if (e) {
        throw e.error;
      }
    }
  }
  return ar;
};

__spreadArray = this && this.__spreadArray || function(to, from, pack) {
  var ar, i, l;
  if (pack || arguments.length == 2) {
    i = 0;
    l = from.length;
    ar = void 0;
    while (i < l) {
      if (ar || !(i in from)) {
        if (!ar) {
          ar = Array.prototype.slice.call(from, 0, i);
        }
        ar[i] = from[i];
      }
      i++;
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};

// Legacy public compatibility implementation, owned by module-svelte.
module.exports = function(require, module, exports, __dirname, __filename, kernel) {
  var transformSharedState;
  // Experimental compilation gate. Not registered in SvelteEngine until the
  // complete frontend contract, including loading and aliases, is validated.
  // Uses the public Svelte AST and public store subscription contract only.
  transformSharedState = function(source) {
    var declaration;
    var d;
    var declaration;
    var statement;
    var __caught, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _loop_1, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, accepted, added, ast, bindings, calls, d, declaration, declarations, declarations_1, declarations_1_1, declarations_2, declarations_2_1, declarations_3, declarations_3_1, declared, dependentHelpers, e_1, e_1_1, e_2, e_2_1, e_3, e_3_1, e_4, e_4_1, e_5, e_5_1, e_6, e_6_1, e_7, e_7_1, e_8, e_8_1, e_9, e_9_1, edit, edits, expression, found, helper, helpers, helpers_1, helpers_1_1, indirect, names, node, parse, prefix, refresh, root, script, statement, walk, wrapExpression;
    e_1 = void 0;
    _a = void 0;
    e_2 = void 0;
    _b = void 0;
    e_3 = void 0;
    _c = void 0;
    e_4 = void 0;
    _d = void 0;
    e_5 = void 0;
    _e = void 0;
    e_6 = void 0;
    _f = void 0;
    e_7 = void 0;
    _g = void 0;
    e_8 = void 0;
    _h = void 0;
    e_9 = void 0;
    _j = void 0;
    _k = void 0;
    _l = void 0;
    parse = require('svelte/compiler').parse;
    ast = parse(source);
    script = ((_k = ast.instance) == null || _k == void 0 ? void 0 : _k.content);
    names = function(pattern) {
      if (!pattern) {
        return;
      }
      if (pattern.type == 'Identifier') {
        declared.add(pattern.name);
      } else if (pattern.type == 'ObjectPattern') {
        pattern.properties.forEach(function(p) {
          var _a;
          _a = void 0;
          return names(((_a = p.value) != null && _a != void 0 ? _a : p.argument));
        });
      } else if (pattern.type == 'ArrayPattern') {
        pattern.elements.forEach(names);
      } else if (pattern.type == 'AssignmentPattern') {
        names(pattern.left);
      } else if (pattern.type == 'RestElement') {
        names(pattern.argument);
      }
    };
    walk = function(node, visit) {
      var _a;
      var _b;
      var _c;
      var _d;
      var __caught, e_10, e_10_1, key, value;
      e_10 = void 0;
      _a = void 0;
      if (!node || typeof node != 'object') {
        return;
      }
      if (typeof node.type == 'string') {
        visit(node);
      }
      try {
        _b = __values(Object.entries(node));
        _c = _b.next();
        while (!_c.done) {
          _d = __read(_c.value, 2);
          key = _d[0];
          value = _d[1];
          if (key == 'parent') {
            _c = _b.next();
            continue;
          }
          if (Array.isArray(value)) {
            value.forEach(function(item) {
              return walk(item, visit);
            });
          } else if (value && typeof value == 'object') {
            walk(value, visit);
          }
          _c = _b.next();
        }
      } catch (error1) {
        e_10_1 = error1;
        e_10 = {
          error: e_10_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) {
            _a.call(_b);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_10) {
            throw e_10.error;
          }
        }
      }
    };
    indirect = function(expression) {
      var matched;
      matched = false;
      walk(expression, function(node) {
        if (node.type == 'CallExpression' && dependentHelpers.has(node.callee.name)) {
          matched = true;
        }
      });
      return matched;
    };
    wrapExpression = function(expression) {
      edits.push({
        start: expression.start,
        end: expression.start,
        value: '($'.concat(prefix, ', ')
      });
      edits.push({
        start: expression.end,
        end: expression.end,
        value: ')'
      });
    };
    if (!script) {
      return source;
    }
    declared = new Set();
    try {
      _m = __values(script.body);
      _o = _m.next();
      while (!_o.done) {
        statement = _o.value;
        node = ((_l = statement.declaration) != null && _l != void 0 ? _l : statement);
        if (node.type == 'ImportDeclaration') {
          node.specifiers.forEach(function(s) {
            return names(s.local);
          });
        }
        if (node.type == 'VariableDeclaration') {
          node.declarations.forEach(function(d) {
            return names(d.id);
          });
        }
        if (node.type == 'FunctionDeclaration' || node.type == 'ClassDeclaration') {
          names(node.id);
        }
        _o = _m.next();
      }
    } catch (error1) {
      e_1_1 = error1;
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_o && !_o.done && (_a = _m.return)) {
          _a.call(_m);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_1) {
          throw e_1.error;
        }
      }
    }
    if (declared.has('useState')) {
      return source;
    }
    calls = [];
    walk(script, function(node) {
      if (node.type == 'CallExpression' && node.callee.type == 'Identifier' && node.callee.name == 'useState') {
        calls.push(node);
      }
    });
    if (!calls.length) {
      return source;
    }
    prefix = '__scriba';
    while (source.includes(prefix)) {
      prefix += '_';
    }
    edits = [];
    bindings = new Set();
    accepted = new Set();
    declarations = script.body.filter(function(s) {
      return s.type == 'VariableDeclaration';
    });
    try {
      declarations_1 = __values(declarations);
      declarations_1_1 = declarations_1.next();
      while (!declarations_1_1.done) {
        declaration = declarations_1_1.value;
        try {
          e_3 = void 0;
          _p = __values(declaration.declarations);
          _q = _p.next();
          while (!_q.done) {
            d = _q.value;
            if (calls.includes(d.init) && d.id.type == 'Identifier') {
              bindings.add(d.id.name);
              accepted.add(d.init);
              edits.push({
                start: d.init.callee.start,
                end: d.init.callee.end,
                value: ''.concat(prefix, '.useState')
              });
            }
            _q = _p.next();
          }
        } catch (error1) {
          e_3_1 = error1;
          e_3 = {
            error: e_3_1
          };
        } finally {
          try {
            if (_q && !_q.done && (_c = _p.return)) {
              _c.call(_p);
            }
          } catch (error1) {
            __caught = error1;
            throw __caught;
          } finally {
            if (e_3) {
              throw e_3.error;
            }
          }
        }
        declarations_1_1 = declarations_1.next();
      }
    } catch (error1) {
      e_2_1 = error1;
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (declarations_1_1 && !declarations_1_1.done && (_b = declarations_1.return)) {
          _b.call(declarations_1);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_2) {
          throw e_2.error;
        }
      }
    }
    if (calls.some((function(call) {
      return !accepted.has(call);
    }))) {
      throw new Error('useState requires a top-level identifier declaration');
    }
    // Track direct nested aliases without turning primitive destructuring into
    // a live binding. Arbitrary helper-returned aliases still need a decision.
    added = true;
    while (added) {
      added = false;
      try {
        e_4 = void 0;
        declarations_2 = __values(declarations);
        declarations_2_1 = declarations_2.next();
        while (!declarations_2_1.done) {
          declaration = declarations_2_1.value;
          try {
            e_5 = void 0;
            _r = __values(declaration.declarations);
            _s = _r.next();
            while (!_s.done) {
              d = _s.value;
              root = d.init;
              while ((root === null || root === void 0 ? void 0 : root.type) == 'MemberExpression') {
                root = root.object;
              }
              if (d.id.type == 'Identifier' && (root === null || root === void 0 ? void 0 : root.type) == 'Identifier' && bindings.has(root.name) && !bindings.has(d.id.name)) {
                bindings.add(d.id.name);
                added = true;
              }
              _s = _r.next();
            }
          } catch (error1) {
            e_5_1 = error1;
            e_5 = {
              error: e_5_1
            };
          } finally {
            try {
              if (_s && !_s.done && (_e = _r.return)) {
                _e.call(_r);
              }
            } catch (error1) {
              __caught = error1;
              throw __caught;
            } finally {
              if (e_5) {
                throw e_5.error;
              }
            }
          }
          declarations_2_1 = declarations_2.next();
        }
      } catch (error1) {
        e_4_1 = error1;
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (declarations_2_1 && !declarations_2_1.done && (_d = declarations_2.return)) {
            _d.call(declarations_2);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_4) {
            throw e_4.error;
          }
        }
      }
    }
    try {
      declarations_3 = __values(declarations);
      declarations_3_1 = declarations_3.next();
      while (!declarations_3_1.done) {
        declaration = declarations_3_1.value;
        if (declaration.kind == 'const' && declaration.declarations.some((function(d) {
          return bindings.has(d.id.name);
        }))) {
          edits.push({
            start: declaration.start,
            end: declaration.start + 5,
            value: 'let'
          });
        }
        declarations_3_1 = declarations_3.next();
      }
    } catch (error1) {
      e_6_1 = error1;
      e_6 = {
        error: e_6_1
      };
    } finally {
      try {
        if (declarations_3_1 && !declarations_3_1.done && (_f = declarations_3.return)) {
          _f.call(declarations_3);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_6) {
          throw e_6.error;
        }
      }
    }
    // Svelte 4 cannot see dependencies hidden inside local helper functions.
    // Follow their lexical references and make those reads explicit, without
    // rerunning unrelated template expressions on every document notification.
    dependentHelpers = new Set();
    helpers = script.body.filter(function(s) {
      return s.type == 'FunctionDeclaration';
    });
    found = true;
    while (found) {
      found = false;
      _loop_1 = function(helper) {
        var depends;
        if (dependentHelpers.has(helper.id.name)) {
          return 'continue';
        }
        depends = false;
        walk(helper.body, function(node) {
          if (node.type == 'Identifier' && (bindings.has(node.name) || dependentHelpers.has(node.name))) {
            depends = true;
          }
        });
        if (depends) {
          dependentHelpers.add(helper.id.name);
          found = true;
        }
      };
      try {
        e_7 = void 0;
        helpers_1 = __values(helpers);
        helpers_1_1 = helpers_1.next();
        while (!helpers_1_1.done) {
          helper = helpers_1_1.value;
          _loop_1(helper);
          helpers_1_1 = helpers_1.next();
        }
      } catch (error1) {
        e_7_1 = error1;
        e_7 = {
          error: e_7_1
        };
      } finally {
        try {
          if (helpers_1_1 && !helpers_1_1.done && (_g = helpers_1.return)) {
            _g.call(helpers_1);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_7) {
            throw e_7.error;
          }
        }
      }
    }
    try {
      _t = __values(script.body);
      _u = _t.next();
      while (!_u.done) {
        statement = _u.value;
        if (statement.type != 'LabeledStatement' || statement.label.name != '$') {
          _u = _t.next();
          continue;
        }
        expression = statement.body.expression;
        if ((expression === null || expression === void 0 ? void 0 : expression.type) == 'AssignmentExpression' && indirect(expression.right)) {
          wrapExpression(expression.right);
        }
        _u = _t.next();
      }
    } catch (error1) {
      e_8_1 = error1;
      e_8 = {
        error: e_8_1
      };
    } finally {
      try {
        if (_u && !_u.done && (_h = _t.return)) {
          _h.call(_t);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_8) {
          throw e_8.error;
        }
      }
    }
    walk(ast.html, function(node) {
      if (['MustacheTag', 'RawMustacheTag', 'IfBlock', 'EachBlock'].includes(node.type) && indirect(node.expression)) {
        wrapExpression(node.expression);
      }
    });
    refresh = __spreadArray([], __read(bindings), false).map(function(name) {
      return ''.concat(name, ' = ').concat(name, ';');
    }).join('\n');
    edits.push({
      start: script.start,
      end: script.start,
      value: '\nimport { createViewScope as '.concat(prefix, 'Create } from \'logos:scriba-view\';\n') + 'import { onDestroy as '.concat(prefix, 'Destroy } from \'svelte\';\n') + 'const '.concat(prefix, ' = ').concat(prefix, 'Create();\n').concat(prefix, 'Destroy(').concat(prefix, '.destroy);\n')
    });
    edits.push({
      start: script.end,
      end: script.end,
      value: '\n$: { $'.concat(prefix, '; ').concat(refresh, ' }\n')
    });
    try {
      _v = __values(edits.sort(function(a, b) {
        return b.start - a.start;
      }));
      _w = _v.next();
      while (!_w.done) {
        edit = _w.value;
        source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
        _w = _v.next();
      }
    } catch (error1) {
      e_9_1 = error1;
      e_9 = {
        error: e_9_1
      };
    } finally {
      try {
        if (_w && !_w.done && (_j = _v.return)) {
          _j.call(_v);
        }
      } catch (error1) {
        __caught = error1;
        throw __caught;
      } finally {
        if (e_9) {
          throw e_9.error;
        }
      }
    }
    return source;
  };
  'use strict';
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.transformSharedState = transformSharedState;
};
