#!/usr/bin/env python3
import json

# ─────────── Hardcoded Java Code ───────────
java_code = """
class Demo {
  void test(int x, int y) {
    if (x > 0) {
      if (y > 0) {
        System.out.println("both positive");
      } else if (y < 0) {
        System.out.println("y negative");
      } else {
        System.out.println("y zero");
      }
    } else if (x < 0) {
      System.out.println("x negative");
    } else {
      System.out.println("x zero");
    }
  }
}
"""

# ─────────── Helpers ───────────
def skip_ws(src, i):
    while i < len(src) and src[i].isspace():
        i += 1
    return i

def read_balanced(src, i, open_ch, close_ch):
    """Read (...) or {...} with nesting."""
    assert src[i] == open_ch
    depth, out = 1, []
    i += 1
    while i < len(src) and depth > 0:
        ch = src[i]
        if ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                i += 1
                break
        out.append(ch)
        i += 1
    return ''.join(out).strip(), i

# ─────────── Core Parsing ───────────
def parse_statement(src, i):
    """Parse one statement or block."""
    i = skip_ws(src, i)
    if i >= len(src): return None, i

    if src.startswith("if", i) and not src[i+2].isalnum():
        return parse_if(src, i)

    if src[i] == "{":
        block, i = read_balanced(src, i, "{", "}")
        return {"type":"Block","stmts":parse_block(block)}, i

    # normal statement
    stmt = []
    while i < len(src) and src[i] != ";":
        stmt.append(src[i]); i += 1
    if i < len(src) and src[i] == ";": i += 1
    return {"type":"Stmt","code":''.join(stmt).strip()}, i

def parse_if(src, i):
    """Parse if / else-if / else."""
    assert src.startswith("if", i)
    i += 2
    i = skip_ws(src, i)

    cond, i = read_balanced(src, i, "(", ")")
    then, i = parse_statement(src, i)

    node = {"type":"If","condition":cond,"then":[then],"elif":[],"else":None}

    i = skip_ws(src, i)
    while i < len(src) and src.startswith("else", i):
        i += 4
        i = skip_ws(src, i)
        if src.startswith("if", i):
            i += 2
            i = skip_ws(src, i)
            econd, i = read_balanced(src, i, "(", ")")
            estmt, i = parse_statement(src, i)
            node["elif"].append({"condition":econd,"then":[estmt]})
        else:
            estmt, i = parse_statement(src, i)
            node["else"] = [estmt]
            break
        i = skip_ws(src, i)
    return node, i

def parse_block(src):
    i, out = 0, []
    while i < len(src):
        i = skip_ws(src, i)
        if i >= len(src): break
        stmt, i = parse_statement(src, i)
        if stmt: out.append(stmt)
    return out

# ─────────── Main ───────────
def main():
    ast = parse_block(java_code)
    out = {"file":"Hardcoded.java","ast":ast}
    print(json.dumps(out, indent=2))
    with open("ASTParsed.json","w") as f:
        json.dump(out,f,indent=2)
    print("\n[OK] AST also saved to ASTParsed.json")

if __name__ == "__main__":
    main()
