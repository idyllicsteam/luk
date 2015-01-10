### Luk

See? First we takes a parsed Lua codes tree diddly-doo from `luaparse`, then we zaps it into some codes! Luk is the ideal dwonker for re-creating Lua code from a `luaparse` AST. Oh, yeah. It's written in JavaScript for Node.js.

```js
var luaparse = require("luaparse"),
		luk = require("luk");

var lukThingy = new luk.Luk(); // Create a Luk Thingy

var tree = luaparse.parse("local x = 103.5");

lukThingy.process(tree);            // Generated code doesn't get outputted until...
console.log(lukThingy.getString()); // You get the string.

lukThingy.clear(); // Make sure you clear the Luk Thingy before parsing some more, unless you want to append to the already existing code
```

~ Idyllic