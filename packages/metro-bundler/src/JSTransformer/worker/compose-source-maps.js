/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

const {SourceMapGenerator, SourceMapConsumer} = require('source-map');

// Note: This assumes that there is only one source file. The way metro works,
// it seems like a certainty that this will be the case.
const composeSourceMaps = (
  inputMap: Object,
  outputMap: Object,
  inputFileName: string,
): Object => {
  const resultMap = new SourceMapGenerator();
  const inputConsumer = new SourceMapConsumer(inputMap);
  const outputConsumer = new SourceMapConsumer(outputMap);

  const sourceContent = inputConsumer.sourceContentFor(inputFileName);
  if (sourceContent) {
    resultMap.setSourceContent(inputFileName, inputMap);
  }

  outputConsumer.eachMapping(
    ({
      source,
      generatedLine,
      generatedColumn,
      originalLine,
      originalColumn,
      name,
    }) => {
      if (originalLine) {
        const original = inputConsumer.originalPositionFor({
          line: originalLine,
          column: originalColumn,
        });
        if (original.line) {
          resultMap.addMapping({
            generated: {line: generatedLine, column: generatedColumn},
            original: {line: original.line, column: original.column},
            source: inputFileName,
            name,
          });
        }
      }
    },
  );

  return resultMap.toJSON();
};

module.exports = composeSourceMaps;
