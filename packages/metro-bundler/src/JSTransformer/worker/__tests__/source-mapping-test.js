const {SourceMapConsumer} = require('source-map');
const {optimize} = require('../index');
const path = require('path');

const typeScriptFile = `export const onLineOne = "this string is on line 1";\n`;

const javaScriptFile = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onLineOne = "this string is on line 1";
//# sourceMappingURL=test.js.map`;

const javaScript2TypeScriptMap = `{
  "version": 3,
  "file": "test.js",
  "sourceRoot": "",
  "sources": [
    "test.ts"
  ],
  "names": [],
  "mappings": ";;AAAa,QAAA,SAAS,GAAG,0BAA0B,CAAC",
  "sourcesContent": [
    "export const onLineOne = \\"this string is on line 1\\";\\n"
  ]
}`;

const expectedOptimizedJavaScriptFile = `"use strict";
Object.defineProperty(exports,"__esModule",{value:true});
exports.onLineOne="this string is on line 1";
//# sourceMappingURL=test.js.map`;

const opts = {
  dev: false,
  minify: true,
  platform: 'ios',
  transform: {
    dev: false,
    generateSourceMaps: true,
    hot: false,
    inlineRequires: false,
    platform: 'ios',
    projectRoot: path.resolve('./'),
  },
};

describe('the minification process', () =>
  it('should produce correct maps', () => {
    const js2tsMap = new SourceMapConsumer(
      JSON.parse(javaScript2TypeScriptMap),
    );

    expect(js2tsMap.originalPositionFor({line: 3, column: 21})).toEqual({
      line: 1,
      column: 25,
      name: null,
      source: 'test.ts',
    });

    const result = optimize(
      'test.js',
      {
        map: js2tsMap,
        code: javaScriptFile,
      },
      opts,
    );

    expect(result.code).toBe(expectedOptimizedJavaScriptFile);

    const resultMapConsumer = new SourceMapConsumer(result.map);

    expect(
      resultMapConsumer.originalPositionFor({line: 3, column: 19}),
    ).toEqual({
      line: 1,
      column: 25,
      name: null,
      source: 'test.ts',
    });
  }));
