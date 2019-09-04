document.addEventListener('DOMContentLoaded', () => {
  console.log('from on load');

  const socket = io('http://localhost:3333/app-clients');
  // socket = io('/app-clients');
  // const socket = io('http://kurakste1.fvds.ru:3333');
  socket.on('open', function () {
    console.log('App socket connection succesfull');
  });

  socket.on('connect', function () {
    console.log('App successfull connected');
  });

  socket.on('disconnect', function () {
    console.log('App connection loose');
  });


  const newAlert = document.getElementById('newAlert');
  const trackUpdate = document.getElementById('trackUpdate');
  const alertInWork = document.getElementById('alertInWork');
  const gbrSent = document.getElementById('gbrSent');
  const alertDecline = document.getElementById('alertDecline');
  const alertClose = document.getElementById('alertClose');

  newAlert.onclick = () => {
    console.log('newAlert');
    socket.emit('newAlert', {
      auth: 'string',
      payload: {
        id: null,
        UserId: 2,
        track: [[55.749054, 52.457500], ],
        regionId: null, // определяем по координатам
        status: 0,
        oid: null, // operator id,
        pickedUpAt: null,
        groupSendAt: null,
        alertDeclineAt: null,
        alertClosedAt: null,
        notes: null
      }
    });
  }

  trackUpdate.onclick = () => {
    console.log('trackUpdate');
    socket.emit('trackUpdate', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }

  alertInWork.onclick = () => {
    console.log('alertInWork');
    socket.emit('alertInWork', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }

  gbrSent.onclick = () => {
    console.log('gbrSent');
    socket.emit('gbrSent', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }
  
  alertDecline.onclick = () => {
    console.log('alertDecline');
    socket.emit('alertDecline', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }

  alertClose.onclick = () => {
    console.log('alertClose');
    socket.emit('alertClose', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }
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