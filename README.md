This it API for GuarApp & GuardControlPanel.

For all request API has to reply like that: 
  {
    success: true,
    message: "If success false, here we have an error a message",
    payload: { payload object...} // if success is false client must ignore payload
  }

  Users
{
	"uid": 1223441,
	"name": "Bob",
	"email": "bob@gmail.com",
	"tel": "+70172345678",
	"role": 10,
	"img": "uid.jpg",
	"pas1": "uid_pas1.jpg",
	"pas2": "uid_pas2.jpg"
  "createdAt": "",
  "updatedAt": "",
  "active": ""
  "password":"sadfdfasdf"
}


