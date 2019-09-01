✔====================================================
  api: POST: _server_/user-new-ap
  do: add new application user in database. It has to be approved. 
  permissions: // status code range
  data: form/data
  Content-type: multipart/form-data
  params: 
    firstName: string,
    lastName: string,
    email: string,
    tel: string,
    password: string,
    img: file,
    pasImg1: file,
    pasImg2: file,
  returns:
    firstName: string,
    lastName: string,
    email:string,
    tel:string,
    img: file,
    pasImg1: file,
    pasImg2: file, 
✔==================================================
  api: POST: _server_/users/new-app-users
  do: add new control panel user in database. It has to be approved.
  permissions: // status code range
  data: form/data
  Content-type: multipart/form-data
  params: 
    firstName: string,
    lastName: string,
    email: string,
    tel: string,
    password: string,
  returns:
    firstName: string,
    lastName: string,
    email:string,
    tel:string,
==================================================
api: GET: _server_/new-users-ap
do: returns all
permissions: // status code range
data: -
returns: 
 [
   {
    firstName: string,
    lastName: string,
    email:string,
    tel:string,
    img: file,
    pasImg1: file,
    pasImg2: file,  
   },
   ...
 ]
====================================================
api: GET: _server_/user/_id_
do: returns all
permissions: // status code range
data: -
returns: 
   {
    firstName: string,
    lastName: string,
    email:string,
    tel:string,
    img: file,
    pasImg1: file,
    pasImg2: file,  
   }
====================================================
api: PATCH: _server_/user
do: patch user in database. 
permissions: // status code range
data: json
Content-type: application/json
params: 
  // these fields can be updated
  firstName: string,
  lastName: string,
  email: string,
  tel: string,
  img: file,
  pasImg1: file,
  pasImg2: file,
returns:
{
  "success": true,
  "message": "",
  "payload": {
  }
}
  firstName: string,
  lastName: string,
  email:string,
  tel:string,
  img: file,
  pasImg1: file,
  pasImg2: file, 
====================================================
api: DELETE: _server_/user/_id_
do: delete user in database. 
permissions: // status code range
data: -
Content-type: -
params: 
  
returns:
{
  "success": true,
  "message": "",
  "payload": {
    "message": "User was deleted."
  }
}
==================================================



