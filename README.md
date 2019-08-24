For all request API has to reply is like that: 
  {
    success: true,
    message: "If success false, here we have an error a message",
    payload: { payload object...} // if success is false client must ignore payload
  }
=============================================================================
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
  "created_at": "",
  "active": ""
  "password":"sadfdfasdf"
}

role:
0 admin
10 operator
20 user
30 candidate
