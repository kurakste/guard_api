document.addEventListener('DOMContentLoaded', () => {
  console.log('from on load');
  let lastalarm;

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


  const newalarm = document.getElementById('newalarm');
  const alarmId = document.getElementById('alarmId');
  const trackUpdate = document.getElementById('trackUpdate');
  const alarmInWork = document.getElementById('alarmInWork');
  const gbrSent = document.getElementById('gbrSent');
  const alarmDecline = document.getElementById('alarmDecline');
  const alarmClose = document.getElementById('alarmClose');

  newalarm.onclick = () => {
    console.log('appNewalarm');
    socket.emit('appNewalarm', {
      auth: 'string',
      payload: {
        id: null,
        UserId: 2,
        track: [[55.749054, 52.457500],],
        regionId: null, // определяем по координатам
        status: 0,
        oid: null, // operator id,
        pickedUpAt: null,
        groupSendAt: null,
        alarmDeclineAt: null,
        alarmClosedAt: null,
        notes: null
      }
    });
  }

  trackUpdate.onclick = () => {
    const alarmIdInput = document.getElementById('alarmId');
    console.log('appNewPointInTrack', lastalarm);
    const track = lastalarm.track;
    if (track.length > 0) {
      const [lon, lat] = track[track.length - 1];
      lastalarm.track.push([lon + 1, lat + 1]);
      socket.emit('appNewPointInTrack', {
        auth: 'string',
        payload: {
          alarm: lastalarm,
        }
      });
    }
    //socket.emit('appNewPointInTrack', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }

  alarmInWork.onclick = () => {
    console.log('alarmInWork');
    socket.emit('alarmInWork', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }

  gbrSent.onclick = () => {
    console.log('gbrSent');
    socket.emit('gbrSent', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }

  alarmDecline.onclick = () => {
    console.log('alarmDecline');
    socket.emit('alarmDecline', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }

  alarmClose.onclick = () => {
    console.log('alarmClose');
    socket.emit('alarmClose', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });
  }

  socket.on('appalarmWasRegistered', function (data) {
    console.log(data);
    const { alarm } = data;
    lastalarm = alarm;
    const alarmIdInput = document.getElementById('alarmId');
    alarmIdInput.value = alarm.id;
    console.log('alarmWasRegistered: ', alarm)
  });

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