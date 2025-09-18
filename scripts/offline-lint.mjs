#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = new URL('..', import.meta.url).pathname;

const trackedFiles = [
  'src/app/api/contact/route.ts',
  'src/components/sections/contact-section.tsx',
];

const results = [];

const checkers = [
  {
    name: 'trailing-whitespace',
    run(filePath, lines) {
      lines.forEach((line, index) => {
        if (/[\t ]+$/.test(line)) {
          results.push({
            filePath,
            line: index + 1,
            message: 'Trailing whitespace detected.',
          });
        }
      });
    },
  },
  {
    name: 'tabs',
    run(filePath, lines) {
      lines.forEach((line, index) => {
        if (/\t/.test(line)) {
          results.push({
            filePath,
            line: index + 1,
            message: 'Tab character found. Please use spaces for indentation.',
          });
        }
      });
    },
  },
  {
    name: 'forbidden-var',
    run(filePath, lines) {
      lines.forEach((line, index) => {
        if (/\bvar\b/.test(line)) {
          results.push({
            filePath,
            line: index + 1,
            message: "Avoid using 'var'. Use 'const' or 'let' instead.",
          });
        }
      });
    },
  },
  {
    name: 'todo-comments',
    run(filePath, lines) {
      lines.forEach((line, index) => {
        if (/TODO/i.test(line)) {
          results.push({
            filePath,
            line: index + 1,
            message: 'Remove TODO comments before committing.',
          });
        }
      });
    },
  },
];

function lintFile(relativePath) {
  const filePath = path.join(projectRoot, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const lines = source.split(/\r?\n/);

  checkers.forEach(checker => checker.run(relativePath, lines));

  if (source.length > 0 && !source.endsWith('\n')) {
    results.push({
      filePath: relativePath,
      line: lines.length,
      message: 'File should end with a newline.',
    });
  }
}

trackedFiles.forEach(lintFile);

if (results.length > 0) {
  console.error('\nOffline lint failed with the following issues:');
  results.forEach(issue => {
    console.error(` - ${issue.filePath}:${issue.line} ${issue.message}`);
  });
  process.exit(1);
}

console.log('Offline lint passed for tracked files.');
