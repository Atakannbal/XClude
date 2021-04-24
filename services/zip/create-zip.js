const archiver = require("archiver");
const { opendir } = require("fs/promises");
const fs = require("fs");
const path = require("path");

const DirentType = {
  Directory: 1,
  File: 0,
};

class Dirent {
  constructor(path, type) {
    this.path = path;
    this.type = type;
    this.child = [];
  }

  addChild(dirent) {
    this.child.push(dirent);
  }
}

module.exports = async (
  directory,
  destinationDirectory,
  exclude = ["node_modules", ".next", ".git"]
) => {
  const archive = archiver("zip");

  const outputFilePath = destinationDirectory + "/" + Date.now() + ".zip";
  console.log({ outputFilePath });
  const destinationStream = fs.createWriteStream(outputFilePath);
  console.log("Zipping %s to %s", directory, destinationDirectory);

  destinationStream.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log(
      "archiver has been finalized and the output file descriptor has closed."
    );
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(destinationStream);

  try {
    const dirent = await checkFolder(directory);
    const excludeRegex = formatFolderNames(exclude);

    const filtered = dirent.child.filter(
      (dirent) => !dirent.path.match(new RegExp(excludeRegex))
    );

    // console.log(JSON.stringify(filtered, null, 2));

    filtered.forEach((d) => {
      if (d.type === DirentType.Directory) {
        archive.directory(d.path, d.path.replace(directory, ""));
      } else {
        archive.file(d.path, { name: path.basename(d.path) });
      }
    });
    archive.finalize();
  } catch (err) {
    console.error(err);
  }
};

function formatFolderNames(folderNames) {
  return (
    "(" + folderNames.map((folderName) => "/" + folderName).join("|") + ")"
  );
}

async function checkFolder(directory, mainDirentObj) {
  if (!mainDirentObj) {
    mainDirentObj = new Dirent(directory, DirentType.Directory);
  }

  const dir = await opendir(directory);

  for await (const dirent of dir) {
    const childDirentObj = new Dirent(
      directory + "/" + dirent.name,
      dirent.isDirectory() ? DirentType.Directory : DirentType.File
    );
    mainDirentObj.addChild(childDirentObj);

    if (dirent.isDirectory()) {
      await checkFolder(directory + "/" + dirent.name, childDirentObj);
    }
  }

  return mainDirentObj;
}
