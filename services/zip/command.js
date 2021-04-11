/**
 * Execute zip command
 */
const execFile = require("child_process").execFile;

const zipBinary = "zip";

/**
 *
 * @param {Array} params
 * @returns Promise
 */
module.exports = async (params = []) => {
  return new Promise((resolve, reject) => {
    execFile(zipBinary, [...params], (error, stdout, stderr) => {
      if (error) {
        return reject({ error, stdout, stderr });
      }

      if (stderr) {
        return reject({ error, stdout, stderr });
      }

      resolve({ stdout });
    });
  });
};
