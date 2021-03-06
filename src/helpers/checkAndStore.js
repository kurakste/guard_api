const fs = require('fs');

function getExt(path) {
  const ext = path.split('.')[1];
  return ext;
}
async function checkAndStoreFiles(uid, files) {
  if (!files.img) throw new Error('Personal photo is required.');
  if (!files.pasImg1) throw new Error('2 photo of user ID is required.');
  if (!files.pasImg2) throw new Error('2 photo of user ID is required.');
  const returnObject = {
    img: `${uid}_img.${getExt(files.img.path)}`,
    pasImg1: `${uid}_pasImg1.${getExt(files.pasImg1.path)}`,
    pasImg2: `${uid}_pasImg2.${getExt(files.pasImg2.path)}`,
  };
  // TODO: add check for file type & drop non image file with error.
  fs.copyFileSync(files.img.path, `public/img/${uid}_img.${getExt(files.img.path)}`);
  fs.unlinkSync(files.img.path);
  fs.copyFileSync(files.pasImg1.path, `public/img/${uid}_pasImg1.${getExt(files.img.path)}`);
  fs.unlinkSync(files.pasImg1.path);
  fs.copyFileSync(files.pasImg2.path, `public/img/${uid}_pasImg2.${getExt(files.pasImg2.path)}`);
  fs.unlinkSync(files.pasImg2.path);
  return returnObject;
}

module.exports = checkAndStoreFiles;
