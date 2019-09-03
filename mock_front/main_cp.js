document.addEventListener('DOMContentLoaded', () => {
  console.log('from on load');

  const socket = io('http://localhost:3333/cp-clients');
  // socket = io('/app-clients');
  // const socket = io('http://kurakste1.fvds.ru:3333');
  socket.on('open', function () {
    console.log('socket connection succesfull');
  });

  socket.on('connect', function () {
    console.log('successfull connected');
  });

  socket.on('disconnect', function () {
    console.log('connection loose');
  });

  socket.on('alertsUpdated', (data) => {
    console.log('Alert updated!: ', data);
  })


});


// window.onload = function () {
//   const name = document.location.href.split('=')[1];
//   console.log(name);
//   const msgList = document.querySelector('#messages');
//   const socket = io('ws://localhost:3333');
// //        const socket = new WebSocket('ws://localhost:3333');

//   const form = document.querySelector('#form');
//   const inp = document.querySelector('#inp');
//   socket.on('open',function(){
//     console.log('socket connection succesfull');
//   });

//   socket.on('connect', function () {
//     socket.emit('username', name);
//     const liEl = document.createElement('li');
//     liEl.innerHTML ='<h3> I get server connection! </h3>';
//     msgList.appendChild(liEl);
//   });

//   socket.on('disconnect', function () {
//     const liEl = document.createElement('li');
//     liEl.innerHTML ='<h3> Loose connection with server .. </h3>';
//     msgList.appendChild(liEl);
//   })



//   socket.on('message',function (data) {
//     console.log('incoming data: \n', data);
//     const liEl = document.createElement('li');
//     liEl.innerHTML = `${data.username}: ${data.message} `;
//     msgList.appendChild(liEl);
//   });

//   console.log('document loaded...', socket);
//   form.onsubmit = function (event) {
//     event.preventDefault();
//     console.log(inp.value);
//     socket.emit('message', inp.value);
//     inp.value = '';
//   }
// };