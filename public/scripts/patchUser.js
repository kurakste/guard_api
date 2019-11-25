document.addEventListener('DOMContentLoaded', main);

function main() {
  console.log('loaded ok');
  const userId = document.getElementById('userId');
  const fname = document.getElementById('firstName');
  const lname = document.getElementById('lastName');
  const mname = document.getElementById('middleName');
  console.log(fname, lname, mname, userId);
  fname.addEventListener('change', fnameChange);
}

async function fnameChange() {
  const data = this.value;
  await updateData(data, 'firstName');
}

async function updateData(val, fieldName) {
  const uid = parseInt(userId.value);
  const url = `http://localhost:3030/user/${uid}`;
  const data = {firstName: val};
  // if (fieldName === 'firstName') data.firstName = val;
  const bodyData = JSON.stringify(data);
  console.log('data:', bodyData);
  const forSent = bodyData.replace(/\"([^(\")"]+)\":/g,"$1:");
  console.log('for sent: ', forSent);
  const setting = {
    method: 'PATCH',
    body: forSent,
  };
  console.log('setting', setting, url);
  const res = await fetch(url, setting);
  console.log('res: ', await res.json());

}