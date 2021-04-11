/**
 * Zip Service
 */

const ZipCommand = require("./command");

const options = "-r9";

/**
 *
 * @param {string} outputPath
 * @param {string} folderPath
 * @param {array} excludeFolders
 */
module.exports = async (outputPath, folderPath, excludeFolders) => {
  // EXAMPLE: zip -r9 ./asd.zip ./kns-iys -x /\*/node_modules/\* -x /\*/build/\* /\*/dist/\*
  const excludeParams = [];
  excludeFolders.forEach((folderName) =>
    excludeParams.push("-x", `/\*/${folderName}/\*`)
  );

  return ZipCommand([options, outputPath, folderPath, ...excludeParams]);
};
