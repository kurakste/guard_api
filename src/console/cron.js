const doBilling = require('./billing');

async function main() {
  await doBilling();
  console.log('work done');
  process.exit(0);
}

main();
