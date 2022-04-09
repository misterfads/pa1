import {parser} from "lezer-python";
import {TreeCursor} from "lezer-tree";
import {BinOp, Expr, Stmt} from "./ast";
import { stringifyTree } from "./treeprint";

export function traverseArgs(c : TreeCursor, s : string) : Array<Expr> {
  var args : Array<Expr> = [];
  c.firstChild(); // go into arglist
  while (c.nextSibling()) {
    //console.log("FIRST ARG IS", s.substring(c.from,c.to))
    args.push(traverseExpr(c,s));
    //console.log(s.substring(c.from,c.to))
    c.nextSibling()
    //console.log("NEXT IS", s.substring(c.from,c.to))
  }

  c.parent(); // pop CallExpression
  return args;
}

export function checkIsInt(s : string) : boolean {
  var n = Number(s);
  if(isNaN(n) || n % 1 !== 0)
    return false;
  return true;
}

export function traverseExpr(c : TreeCursor, s : string) : Expr {
  switch(c.type.name) {
    case "Number":
      var sub : string = s.substring(c.from, c.to);
      if (!checkIsInt(sub))
         throw new Error("ParseError: number not an integer");
      return {
        tag: "num",
        value: Number(sub)
      }
    case "VariableName":
      return {
        tag: "id",
        name: s.substring(c.from, c.to)
      }
    case "CallExpression":
      c.firstChild();
      const callName = s.substring(c.from, c.to);
      // console.log("HEERRE CALLNAME IS", callName)
      c.nextSibling(); //go to arglist node
      var args = traverseArgs(c, s);
      //console.log("ARGS ARE", args)
      if (args.length == 1) {
        if (callName !== "abs" && callName !== "print")
        throw new Error("ParseError: unknown builtin1");
        c.parent(); // pop arglist
        return {
          tag: "builtin1",
          name: callName,
          arg: args[0]
        };
      } else if (args.length == 2) {
        if (callName !== "max" && callName !== "min" && callName !== "pow")
        throw new Error("ParseError: unknown builtin2");
        c.parent(); // pop arglist
        return {
          tag: "builtin2",
          name: callName,
          arg1: args[0],
          arg2: args[1]
        };
      }
      throw new Error("ParseError: can't make function calls with not 1 or not 2 args");

    case "UnaryExpression":
      c.firstChild();
      var uniOp = s.substring(c.from, c.to);
      if (uniOp !== "-" && uniOp !== "+")
        throw new Error("ParseError: unsupported unary operator");
      c.parent()
      const num = Number(s.substring(c.from, c.to))
      var sub : string = s.substring(c.from, c.to);
      if (!checkIsInt(sub))
         throw new Error("ParseError: number not an integer");
      return { tag: "num", value: num }
    case "BinaryExpression":
      c.firstChild();
      const left = traverseExpr(c, s);
      c.nextSibling();
      var op : BinOp;
      switch(s.substring(c.from, c.to)) {
        case "+":
          op = BinOp.Plus;
          break;
        case "-":
          op = BinOp.Minus;
          break;
        case "*":
          op = BinOp.Mul;
          break;
        default:
          throw new Error("ParseError: unknown binary operator");
      }
      c.nextSibling();
      const right = traverseExpr(c,s);
      c.parent();
      return { tag: "binexpr", op: op, left: left, right: right};
    default:
      throw new Error("ParseError:Could not parse expr at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
  }
}

//check if 
//function checkEmpty(s)

export function traverseStmt(c : TreeCursor, s : string) : Stmt {
  var checkEmpty : string = s.substring(c.from,c.to);
  // console.log("HHHHH",checkEmpty)
  // .log("test","hi","test", checkEmpty,"tt")
  // console.log("GGGGGG",c.node.type.name)
  switch(c.node.type.name) {
    case "AssignStatement":
      c.firstChild(); // go to name
      const name = s.substring(c.from, c.to);
      c.nextSibling(); // go to equals
      c.nextSibling(); // go to value
      const value = traverseExpr(c, s);
      c.parent();
      return {
        tag: "define",
        name: name,
        value: value
      }
    case "ExpressionStatement":
      c.firstChild();
      const expr = traverseExpr(c, s);
      c.parent(); // pop going into stmt
      return { tag: "expr", expr: expr }
    default:
      throw new Error("ParseError:Could not parse stmt at " + c.node.from + " " + c.node.to + ": " + s.substring(c.from, c.to));
  }
}

export function traverse(c : TreeCursor, s : string) : Array<Stmt> {
  switch(c.node.type.name) {
    case "Script":
      const stmts : Array<Stmt>= [];
      c.firstChild();
      // if (s.substring(c.from, c.to) === "")
      //   return stmts
      var re : RegExp = /\s+/;
      var emptySource : string = s.substring(c.from,c.to);
      // console.log("BEFORE:",emptySource,".");
      emptySource = emptySource.replace(re,"");
      // console.log("AFTER:",emptySource,".");
      //emptySource = emptySource.replace("\n","");
      if (emptySource !== "") {
        do {
          // console.log("EMPTY SOURCE IS:",emptySource,".");
          stmts.push(traverseStmt(c, s));
        } while(c.nextSibling())
      }

      //console.log("traversed " + stmts.length + " statements ", stmts, "stopped at " , c.node);
      //console.log(stmts)
      return stmts;
    default:
      throw new Error("ParseError:Could not parse program at " + c.node.from + " " + c.node.to);
  }
}
export function parse(source : string) : Array<Stmt> {
  const t = parser.parse(source);
  console.log(stringifyTree(t.cursor(),source,0));
  return traverse(t.cursor(), source);
}
