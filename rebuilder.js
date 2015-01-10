#!/usr/bin/env node
/*
rebuilder.js

Routes a Lua file through Luk to rebuild it in semi-minified form. Really just a
way to test Luk, though it currently doesn't check for semantics being the same
as the original. *Sniffle*

It goes totally overkill and uses Yargs for parsing --file and --out from the
command line.
*/

var fs = require("fs"),
		luaparse = require("luaparse"),
	 	luk = require("./luk.js");

var argv = require("yargs")
	.demand(["file", "out"])
	.argv;

var ast = luaparse.parse(fs.readFileSync(argv.file, "utf-8")),
		lukThingy = new luk.Luk();

lukThingy.process(ast);

fs.writeFileSync(argv.out, lukThingy.getString());