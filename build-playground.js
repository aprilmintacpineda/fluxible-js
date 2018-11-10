/** @format */

const babelCore = require('@babel/core');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '/playground/index.js'), 'utf8');
const lib = fs.readFileSync(path.join(__dirname, '/playground/lib.js'), 'utf8');
const code = babelCore.transform(source, {
  babelrc: false,
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-proposal-object-rest-spread']
}).code;

fs.writeFileSync(path.join(__dirname, '/playground/build/index.js'), code, 'utf8');
fs.writeFileSync(path.join(__dirname, '/playground/build/lib.js'), lib, 'utf8');
