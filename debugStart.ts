import { stringifyTree } from "./treeprint";
import { parse } from "./parser";
import {parser} from "lezer-python";

const source = "print(max(1,12))" ;
const ast = parse(source);
const t = parser.parse(source);
console.log("*****************");
// console.log(ast);
console.log(JSON.stringify(ast, null, 2))
