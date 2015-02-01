/*
luk.js

A Lua code generator. Not a pretty code generator. The code ain't too pretty,
either.
*/

// ***** //

// Code builder
function Luk() {
	var out = [];
	
	// Get generated Lua string
	this.getString = function () {
		return out.join("");
	}
	
	// Clear generated Lua string
	this.clear = function () {
		out = [];
	}
	
	// Process a parsed tree
	this.process = function (t) {
		if (t.inParens) out.push("(");
		switch (t.type) {
			// Identifier
			case "Identifier": {
				out.push(t.name);
				break;
			}

			// String literal
			case "StringLiteral": case "NumericLiteral": case "BooleanLiteral": case "NilLiteral": case "VarargLiteral": {
				out.push(t.raw);
				break;
			}
			
			// Unary expression
			case "UnaryExpression": {
				out.push(t.operator);
				if (t.operator === "not") out.push(" ");
				this.process(t.argument);
				break;
			}

			// Binary expression
			case "BinaryExpression": case "LogicalExpression": {
				this.process(t.left);
				if (t.type === "LogicalExpression") out.push(" ");
				out.push(t.operator);
				if (t.type === "LogicalExpression") out.push(" ");
				this.process(t.right);
				break;
			}

			// Table constructor expression
			case "TableConstructorExpression": {
				out.push("{");
				for (var i = 0; i < t.fields.length; i++) {
					if (i > 0) out.push(",");
					if (t.fields[i].type === "TableKey") {
						out.push("[");
						this.process(t.fields[i].key);
						out.push("]");
						out.push("=");
						this.process(t.fields[i].value);
					} else if (t.fields[i].type === "TableKeyString") {
						this.process(t.fields[i].key);
						out.push("=");
						this.process(t.fields[i].value);
					} else if (t.fields[i].type === "TableValue") {
						this.process(t.fields[i].value);
					}
				}
				out.push("}");
				break;
			}
			
			// Member expression
			case "MemberExpression": {
				this.process(t.base);
				out.push(t.indexer);
				this.process(t.identifier);
				break;
			}
			
			// Index expression
			case "IndexExpression": {
				this.process(t.base);
				out.push("[");
				this.process(t.index);
				out.push("]");
				break;
			}
			
			case "BreakStatement": {
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("break");
				break;
			}

			// Local statement
			case "LocalStatement": {
				out.push("local ");
				for (var i = 0; i < t.variables.length; i++) {
					if (i > 0) out.push(",");
					this.process(t.variables[i]);
				}
				if (t.init.length > 0) {
					out.push("=");
					for (var i = 0; i < t.init.length; i++) {
						if (i > 0) out.push(",");
						this.process(t.init[i]);
					}
				}
				if (out[out.length - 1] !== " ") out.push(" ");
				break;
			}

			// Assignment statement
			case "AssignmentStatement": {
				for (var i = 0; i < t.variables.length; i++) {
					if (i > 0) out.push(",");
					this.process(t.variables[i]);
				}
				out.push("=");
				for (var i = 0; i < t.init.length; i++) {
					if (i > 0) out.push(",");
					this.process(t.init[i]);
				}
				if (out[out.length - 1] !== " ") out.push(" ");
				break;
			}
			
			// Call statement
			case "CallStatement": {
				this.process(t.expression);
				break;
			}
			
			// Call expressions (all forms)
			case "CallExpression": case "TableCallExpression": case "StringCallExpression": {
				this.process(t.base);
				if (t.type === "TableCallExpression") t.arguments = [t.arguments];
				t.arguments = t.arguments || [t.argument];
				if (t.arguments.length == 1 && (t.arguments[0].type === "StringLiteral" || t.arguments[0].type === "TableConstructorExpression")) {
					this.process(t.arguments[0]);
					break;
				}
				out.push("(");
				for (var i = 0; i < t.arguments.length; i++) {
					if (i > 0) out.push(",");
					this.process(t.arguments[i]);
				}
				out.push(")");
				break;
			}
			
			// Function declaration
			case "FunctionDeclaration": {
				if (t.isLocal) out.push("local");
				if (out[out.length - 1] !== " ") out.push(" ");
				
				out.push("function");
				if (t.identifier) {
					out.push(" ");
					this.process(t.identifier);
				}
				out.push("(");
				for (var i = 0; i < t.parameters.length; i++) {
					if (i > 0) out.push(",");
					this.process(t.parameters[i]);
				}
				out.push(")");
				this.process(t.body);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("end");
				out.push(" ");
				break;
			}
			
			// If statement
			case "IfStatement": {
				for (var i = 0; i < t.clauses.length; i++)
					this.process(t.clauses[i]);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("end");
				out.push(" ");
				break;
			}
			
			// If/elseif clauses
			case "IfClause": case "ElseifClause": {
				out.push((t.type === "ElseifClause" ? "else" : "") + "if");
				out.push(" ");
				this.process(t.condition);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("then");
				this.process(t.body);
				if (out[out.length - 1] !== " ") out.push(" ");
				break;
			}
			
			// Else clause
			case "ElseClause": {
				out.push("else");
				out.push(" ");
				this.process(t.body);
				if (out[out.length - 1] !== " ") out.push(" ");
				break;
			}
			
			// Return statement
			case "ReturnStatement": {
				out.push("return");
				out.push(" ");
				for (var i = 0; i < t.arguments.length; i++) {
					if (i > 0) out.push(",");
					this.process(t.arguments[i]);
				}
				if (out[out.length - 1] !== " ") out.push(" ");
				break;
			}
			
			// For numeric statement (for i = 1, 10 do)
			case "ForNumericStatement": {
				out.push("for");
				out.push(" ");
				this.process(t.variable);
				out.push("=");
				this.process(t.start);
				out.push(",");
				this.process(t.end);
				if (t.step) {
					out.push(",");
					this.process(t.step);
				}
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("do");
				this.process(t.body);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("end");
				out.push(" ");
				break;
			}
			
			// For generic statement (for a, b in func() do)
			case "ForGenericStatement": {
				out.push("for");
				out.push(" ");
				for (var i = 0; i < t.variables.length; i++) {
					if (i > 0) out.push(",");
					this.process(t.variables[i]);
				}
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("in");
				out.push(" ");
				for (var i = 0; i < t.iterators.length; i++) {
					if (i > 0) out.push(",");
					this.process(t.iterators[i]);
				}
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("do");
				this.process(t.body);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("end");
				out.push(" ");
				break;
			}
			
			// While statement
			case "WhileStatement": {
				out.push("while");
				out.push(" ");
				this.process(t.condition);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("do");
				out.push(" ");
				this.process(t.body);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("end");
				out.push(" ");
				break;
			}
			
			// Repeat statement
			case "RepeatStatement": {
				out.push("repeat");
				out.push(" ");
				this.process(t.body);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("until");
				out.push(" ");
				this.process(t.condition);
				break;
			}

			// Do statement
			case "DoStatement": {
				out.push("do");
				out.push(" ");
				this.process(t.body);
				if (out[out.length - 1] !== " ") out.push(" ");
				out.push("end");
				out.push(" ");
				break;
			}
				
			// Chunk
			case "Chunk": {
				for (var i = 0; i < t.body.length; i++) this.process(t.body[i]);
				break;
			}
			
			// Something else (we use this for function bodies)
			default: {
				if (t.type) throw new Error("Unsupported tree element type \"" + t.type + "\". Generated code will be incorrect.");
				for (var i = 0; i < t.length; i++) {
					if (out[out.length - 1] !== " ") out.push(" ");
					this.process(t[i]);
				}
				break;
			}
		}
		if (t.inParens) out.push(")");
	}
}

module.exports.Luk = Luk;