// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {"name": "query", "symbols": ["_", "or", "_"], "postprocess": d => d[1]},
    {"name": "or$ebnf$1", "symbols": ["_r"]},
    {"name": "or$ebnf$1", "symbols": ["or$ebnf$1", "_r"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "or", "symbols": ["and", "or$ebnf$1"], "postprocess": d => ['|',d[0],...d[1]]},
    {"name": "or", "symbols": ["and"], "postprocess": id},
    {"name": "_r", "symbols": ["_", {"literal":"|"}, "_", "and"], "postprocess": d => d[3]},
    {"name": "and$ebnf$1", "symbols": ["_nd"]},
    {"name": "and$ebnf$1", "symbols": ["and$ebnf$1", "_nd"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "and", "symbols": ["named", "and$ebnf$1"], "postprocess": d => ['&',d[0],...d[1]]},
    {"name": "and", "symbols": ["named"], "postprocess": id},
    {"name": "_nd$ebnf$1", "symbols": [/[\s]/]},
    {"name": "_nd$ebnf$1", "symbols": ["_nd$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_nd", "symbols": ["_nd$ebnf$1", "named"], "postprocess": d => d[1]},
    {"name": "named", "symbols": ["word", {"literal":":"}, "group"], "postprocess": d => [d[0],d[2]]},
    {"name": "named", "symbols": ["group"], "postprocess": id},
    {"name": "group", "symbols": [{"literal":"("}, "_", "or", "_", {"literal":")"}], "postprocess": d => d[2]},
    {"name": "group", "symbols": ["word"], "postprocess": id},
    {"name": "word$ebnf$1", "symbols": [/[^\s"'|():]/]},
    {"name": "word$ebnf$1", "symbols": ["word$ebnf$1", /[^\s"'|():]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "word", "symbols": ["word$ebnf$1"], "postprocess": d => d[0].join('')},
    {"name": "word$ebnf$2", "symbols": [/[^']/]},
    {"name": "word$ebnf$2", "symbols": ["word$ebnf$2", /[^']/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "word", "symbols": [/[']/, "word$ebnf$2", /[']/], "postprocess": d => d[1].join('')},
    {"name": "word$ebnf$3", "symbols": [/[^"]/]},
    {"name": "word$ebnf$3", "symbols": ["word$ebnf$3", /[^"]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "word", "symbols": [/["]/, "word$ebnf$3", /["]/], "postprocess": d => d[1].join('')},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": id}
  ],
  ParserStart: "query",
};

export default grammar;
