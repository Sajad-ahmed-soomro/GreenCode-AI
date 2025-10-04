#!/usr/bin/env node
import { parse } from "java-parser";

/* ---------------- helpers: generic CST walking ---------------- */
function gatherTokens(node, out) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const n of node) gatherTokens(n, out);
    return;
  }
  // Chevrotain tokens have .image and .tokenType
  if (node.image !== undefined) {
    out.push(node);
    return;
  }
  if (node.children) {
    for (const childArr of Object.values(node.children)) {
      gatherTokens(childArr, out);
    }
  }
}

function findFirstNodeByName(node, name) {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const found = findFirstNodeByName(n, name);
      if (found) return found;
    }
    return null;
  }
  if (node.name === name) return node;
  if (node.children) {
    for (const childArr of Object.values(node.children)) {
      const found = findFirstNodeByName(childArr, name);
      if (found) return found;
    }
  }
  return null;
}

function tokensText(tokens) {
  const txt = tokens.map(t => t.image).join(" ").replace(/\s+/g, " ").trim();
  // Pretty up array brackets & varargs
  return txt.replace(/\[\s*\]/g, "[]").replace(/\.\s*\.\s*\./g, "...");
}

function extractIdentifierText(node) {
  const toks = [];
  gatherTokens(node, toks);
  // Prefer the last Identifier token in the subtree (name sits at the end)
  const ids = toks.filter(t => t.tokenType && t.tokenType.name === "Identifier");
  if (ids.length) return ids[ids.length - 1].image;
  // Fallback: last token’s image
  return toks.length ? toks[toks.length - 1].image : "";
}

/* ---- handle both grammars: direct and variableParaRegularParameter ---- */
function extractParamTypeAndName(paramNode) {
  // Some grammars wrap inside variableParaRegularParameter
  const core =
    paramNode.children?.variableParaRegularParameter?.[0] || paramNode;

  // Try standard locations first
  let typeNode = core.children?.unannType?.[0];
  let nameNode = core.children?.variableDeclaratorId?.[0];

  // If still missing, search by name anywhere under this parameter
  if (!typeNode) typeNode = findFirstNodeByName(paramNode, "unannType");
  if (!nameNode) nameNode = findFirstNodeByName(paramNode, "variableDeclaratorId");

  // Gather text
  const typeTokens = [];
  gatherTokens(typeNode, typeTokens);
  const typeText = typeTokens.length ? tokensText(typeTokens) : "UnknownType";

  const nameText = nameNode ? extractIdentifierText(nameNode) : "UnknownName";

  return { type: typeText || "UnknownType", name: nameText || "UnknownName" };
}

/* ---------------- main extraction ---------------- */
function parseMethodsAndParams(code) {
  const cst = parse(code);
  const methods = [];

  function walk(node) {
    if (!node || typeof node !== "object") return;

    if (node.name === "methodDeclaration") {
      const decl = node.children?.methodHeader?.[0]?.children?.methodDeclarator?.[0];
      const methodName = decl?.children?.Identifier?.[0]?.image || "UnknownMethod";

      const params = [];
      const formals = decl?.children?.formalParameterList?.[0];

      if (formals) {
        // Regular parameters
        const regulars = formals.children?.formalParameter || [];
        regulars.forEach((p, idx) => {
          const { type, name } = extractParamTypeAndName(p);
          // quick debug if unknown
          if (type === "UnknownType" || name === "UnknownName") {
            const keys = Object.keys(p.children || {});
            console.error(`[debug] ${methodName} param#${idx + 1} keys:`, keys);
          }
          params.push({ type, name });
        });

        // Last parameter may be varargs or normal
        const last = formals.children?.lastFormalParameter?.[0];
        if (last) {
          // It can be either a nested formalParameter or variableArityParameter
          const varArity = last.children?.variableArityParameter?.[0];
          const nestedFormal = last.children?.formalParameter?.[0];

          if (varArity) {
            // varargs structure: unannType + ELLIPSIS + variableDeclaratorId
            const typeNode = varArity.children?.unannType?.[0] || findFirstNodeByName(varArity, "unannType");
            const nameNode = varArity.children?.variableDeclaratorId?.[0] || findFirstNodeByName(varArity, "variableDeclaratorId");

            const typeToks = [];
            gatherTokens(typeNode, typeToks);
            // Add "..." if present
            const dots = [];
            gatherTokens(varArity.children?.ELLIPSIS, dots);
            const typeText = tokensText(typeToks) + (dots.length ? "..." : "");
            const nameText = nameNode ? extractIdentifierText(nameNode) : "UnknownName";

            if (typeText.trim() === "" || nameText === "UnknownName") {
              const keys = Object.keys(varArity.children || {});
              console.error(`[debug] ${methodName} varargs keys:`, keys);
            }
            params.push({ type: typeText || "UnknownType", name: nameText || "UnknownName" });
          } else if (nestedFormal) {
            const { type, name } = extractParamTypeAndName(nestedFormal);
            if (type === "UnknownType" || name === "UnknownName") {
              const keys = Object.keys(nestedFormal.children || {});
              console.error(`[debug] ${methodName} lastFormal (formal) keys:`, keys);
            }
            params.push({ type, name });
          }
        }
      }

      methods.push({ method: methodName, params });
    }

    // recurse
    if (node.children) {
      for (const arr of Object.values(node.children)) {
        if (Array.isArray(arr)) arr.forEach(walk);
      }
    }
  }

  walk(cst);
  return methods;
}

/* ---------------- run with hardcoded sample (you can swap to file later) ---------------- */
const javaCode = `
package com.example;

import java.util.*;

public class TestClass {

    // Simple method
    public void greet(String firstName, String lastName, int age) {
        System.out.println("Hello " + firstName + " " + lastName + ", age: " + age);
    }

    // Method with array + boolean
    private static boolean checkFlags(boolean[] flags, int count) {
        return flags.length == count;
    }

    // Method with 2D array
    protected double sumMatrix(double[][] matrix) {
        double sum = 0;
        for (double[] row : matrix) {
            for (double val : row) {
                sum += val;
            }
        }
        return sum;
    }

    // Method with varargs
    void logMessages(String prefix, String... messages) {
        for (String m : messages) {
            System.out.println(prefix + m);
        }
    }

    // Generic method
    public <T> T pickFirst(List<T> items, int index) {
        if (items == null || items.isEmpty()) return null;
        return items.get(index);
    }

    // Generic with two types
    public <K,V> void putEntry(Map<K, V> map, K key, V value) {
        map.put(key, value);
    }

    // Static utility
    public static int max(int a, int b, int c, int d) {
        return Math.max(Math.max(a, b), Math.max(c, d));
    }

    // Inner class with its own method
    class Inner {
        void compute(String task, double rate, boolean active) {
            if (active) {
                System.out.println(task + "@" + rate);
            }
        }
    }

    // Method with array of generics
    List<String>[] groupNames(List<String>[] nameGroups, int total) {
        return nameGroups;
    }

    // Method with mixed wrapper types
    public void registerUser(UUID id, String username, Integer age, Double balance) {
        System.out.println("User registered: " + username);
    }

    // Main method
    public static void main(String[] args) {
        System.out.println("Running TestClass");
    }
}

`;

const out = parseMethodsAndParams(javaCode);
console.log(JSON.stringify(out, null, 2));
