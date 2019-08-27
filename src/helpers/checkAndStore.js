const fs = require('fs');

function getExt(path) {
  const ext = path.split('.')[1];
  return ext;
}
async function checkAndStoreFiles(uid, files) {
  const returnObject = {
    img: `${uid}_img.${getExt(files.img.path)}`,
    passImg1: `${uid}_passImg1.${getExt(files.img.path)}`,
    passImg2: `${uid}_passImg2.${getExt(files.pasImg2.path)}`,
  };
  // TODO: add check for file type & drop non image file with error.
  fs.copyFileSync(files.img.path, `public/img/${uid}_img.${getExt(files.img.path)}`);
  fs.unlinkSync(files.img.path);
  fs.copyFileSync(files.pasImg1.path, `public/img/${uid}_passImg1.${getExt(files.img.path)}`);
  fs.unlinkSync(files.pasImg1.path);
  fs.copyFileSync(files.pasImg2.path, `public/img/${uid}_passImg2.${getExt(files.pasImg2.path)}`);
  fs.unlinkSync(files.pasImg2.path);
  return returnObject;
}

module.exports = checkAndStoreFiles;
