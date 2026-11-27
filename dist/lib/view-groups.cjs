var componentName, discoverGroupedViews, fs, groupedName, isFile, isGroupedViewPath, path, readNames, resolveDirectView, slotImports, slotSource;

fs = require('node:fs');

path = require('node:path');

componentName = function(file) {
  var ref;
  return (ref = file.match(/^(.+)\.(?:svelte|svx)$/)) != null ? ref[1] : void 0;
};

groupedName = function(file) {
  var parts, ref;
  parts = (ref = componentName(file)) != null ? ref.match(/^([^.]+)\.([^.]+)$/) : void 0;
  if (!(parts && parts[2].toLowerCase() !== 'public')) {
    return null;
  }
  return {
    name: parts[1],
    group: parts[2]
  };
};

isGroupedViewPath = function(file) {
  var parts;
  parts = file.split(/[\\\/]/);
  return parts.at(-2) === 'views' && Boolean(groupedName(parts.at(-1)));
};

readNames = function(dir) {
  var error, ref;
  try {
    return fs.readdirSync(dir).sort();
  } catch (error1) {
    error = error1;
    if ((ref = error.code) === 'ENOENT' || ref === 'ENOTDIR' || ref === 'EACCES') {
      return [];
    }
    throw error;
  }
};

isFile = function(file) {
  var error, ref;
  try {
    return fs.statSync(file).isFile();
  } catch (error1) {
    error = error1;
    if ((ref = error.code) === 'ENOENT' || ref === 'ENOTDIR' || ref === 'EACCES') {
      return false;
    }
    throw error;
  }
};

discoverGroupedViews = function(workspace) {
  var add, entries, file, files, i, j, k, legacy, len, len1, len2, name, packageEntries, parsed, pkg, ref, ref1, targets, views;
  entries = [];
  ref = readNames(workspace);
  for (i = 0, len = ref.length; i < len; i++) {
    pkg = ref[i];
    views = path.resolve(workspace, pkg, 'views');
    files = readNames(views);
    targets = new Set();
    packageEntries = [];
    add = function(name, group, component) {
      var target;
      if (!isFile(component)) {
        return;
      }
      target = [pkg, name, group].join(':');
      if (targets.has(target)) {
        return;
      }
      targets.add(target);
      return packageEntries.push({pkg, name, group, target, component});
    };
    for (j = 0, len1 = files.length; j < len1; j++) {
      file = files[j];
      parsed = groupedName(file);
      if (parsed) {
        add(parsed.name, parsed.group, path.join(views, file));
      }
    }
    legacy = files.find(function(name) {
      return name.toLowerCase() === 'widgets';
    });
    if (legacy) {
      ref1 = readNames(path.join(views, legacy));
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        file = ref1[k];
        name = componentName(file);
        if (name) {
          add(name, 'Widget', path.join(views, legacy, file));
        }
      }
    }
    packageEntries.sort(function(a, b) {
      var first, second;
      first = path.basename(a.component);
      second = path.basename(b.component);
      if (first < second) {
        return -1;
      } else if (first > second) {
        return 1;
      } else {
        return 0;
      }
    });
    entries.push(...packageEntries);
  }
  return entries;
};

resolveDirectView = function(workspace, pkg, name) {
  var ext, i, len, ref, target, views;
  views = path.resolve(workspace, pkg, 'views');
  ref = ['svelte', 'svx'];
  for (i = 0, len = ref.length; i < len; i++) {
    ext = ref[i];
    target = path.join(views, `${name}.${ext}`);
    if (isFile(target)) {
      return target;
    }
  }
  return null;
};

slotSource = function(entries) {
  var imports, registry;
  imports = entries.map(function(entry, index) {
    return `import View${index} from ${JSON.stringify(entry.component.replace(/\\/g, '/'))};`;
  });
  registry = entries.map(function({pkg, name, group, target}, index) {
    return `{ ...${JSON.stringify({pkg, name, group, target})}, component: View${index} }`;
  });
  return `<script>
  ${imports.join('\n  ')}
  const registry = [${registry.join(',\n  ')}];
  let { group, filter, sort, workspace, children, ...props } = $props();
  let items = $derived.by(() => {
    const selected = registry.filter(item => item.group === group && (!filter || filter(item)));
    return sort ? selected.sort(sort) : selected;
  });
</script>

{#each items as item (item.target)}
  {@const Component = item.component}
  {#snippet renderItem()}
    <Component {...props} {workspace} />
  {/snippet}
  {#if children}
    {@render children(item, renderItem)}
  {:else}
    {@render renderItem()}
  {/if}
{/each}`;
};

slotImports = function(content) {
  var alias, aliases, edits, i, imports, len, offset, parse, visit;
  ({parse} = require('svelte/compiler'));
  aliases = new Map();
  edits = [];
  visit = function(node) {
    var alias, attr, child, close, group, i, j, len, len1, ref, ref1, ref2, value;
    if (!(node && typeof node === 'object')) {
      return;
    }
    if (node.type === 'Component' && node.name === 'Slot') {
      group = void 0;
      ref = node.attributes;
      for (i = 0, len = ref.length; i < len; i++) {
        attr = ref[i];
        if (attr.type === 'SpreadAttribute') {
          group = void 0;
        }
        if (attr.type === 'Attribute' && attr.name === 'group') {
          value = attr.value;
          value = value.length === 1 ? value[0] : value;
          group = value.type === 'Text' ? value.data : (ref1 = value.expression) != null ? ref1.value : void 0;
        }
      }
      if (typeof group === 'string') {
        alias = aliases.get(group);
        if (!alias) {
          alias = `LogosSlot_${aliases.size}`;
          while (content.includes(alias)) {
            alias += '_';
          }
          aliases.set(group, alias);
        }
        edits.push([node.start + 1, alias]);
        close = content.slice(node.start, node.end).match(/<\/Slot\s*>$/);
        if (close) {
          edits.push([node.end - close[0].length + 2, alias]);
        }
      } else {
        aliases.set(void 0, 'Slot');
      }
    }
    ref2 = Object.values(node);
    for (j = 0, len1 = ref2.length; j < len1; j++) {
      child = ref2[j];
      visit(child);
    }
  };
  visit(parse(content, {
    modern: true
  }).fragment);
  edits.sort(function(a, b) {
    return b[0] - a[0];
  });
  for (i = 0, len = edits.length; i < len; i++) {
    [offset, alias] = edits[i];
    content = content.slice(0, offset) + alias + content.slice(offset + 4);
  }
  imports = Array.from(aliases, function([group, alias]) {
    var key;
    key = group === void 0 ? '' : ':' + Buffer.from(group, 'utf16le').toString('hex');
    return `import ${alias} from 'svelte-view-engine:slot${key}';`;
  });
  return {content, imports};
};

module.exports = {discoverGroupedViews, isGroupedViewPath, resolveDirectView, slotSource, slotImports};
