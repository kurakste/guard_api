====================================================
api: post: _server_/user-new-ap
do: add new application user in database. It hase to be approved. 
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
==================================================
api: post: _server_/user-new-cp
do: add new control panel user in database. It hase to be approved.
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





