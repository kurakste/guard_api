document.addEventListener('DOMContentLoaded', main);
//const apiUrl = 'http://localhost:3030/user';
const apiUrl = 'https://api2.kurakste.ru/user';

function main() {
  console.log('loaded ok');
  const userId = document.getElementById('userId');
  const fname = document.getElementById('firstName');
  const lname = document.getElementById('lastName');
  const mname = document.getElementById('middleName');
  console.log(fname, lname, mname, userId);
  fname.addEventListener('change', fnameChange);
  lname.addEventListener('change', lnameChange);
  mname.addEventListener('change', mnameChange);
}

async function fnameChange() {
  const data = this.value;
  await updateData(data, 'firstName');
}
async function lnameChange() {
  const data = this.value;
  await updateData(data, 'lastName');
}
async function mnameChange() {
  const data = this.value;
  await updateData(data, 'middleName');
}

async function updateData(val, fieldName) {
  const uid = parseInt(userId.value);
  const url = `${apiUrl}/${uid}`;
  const data = {};
  data[fieldName] = val;
  const bodyData = JSON.stringify(data);
  //const forSent = bodyData.replace(/\"([^(\")"]+)\":/g, "$1:");
  const setting = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
    body: bodyData,
  };
  console.log('setting', setting, url);
  const res = await fetch(url, setting);
  console.log('res: ', await res.json());

}