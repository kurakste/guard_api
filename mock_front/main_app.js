document.addEventListener('DOMContentLoaded', () => {
  console.log('from on load');
  let lastalarm;

  const destSelector = document.getElementsByName('dest');
  const newAlarm = document.getElementById('newalarm');
  const alarmId = document.getElementById('alarmId');
  const trackUpdate = document.getElementById('trackUpdate');
  const alarmInWork = document.getElementById('alarmInWork');
  const gbrSent = document.getElementById('gbrSent');
  const alarmDecline = document.getElementById('alarmDecline');
  const alarmClose = document.getElementById('alarmClose');

  let url = (destSelector[1].checked)
    ? 'http://localhost:3333/app-clients'
    : 'http://kurakste1.fvds.ru:3333/app-clients';

  const token = localStorage.token;
  const params = { query: `token=${token}` };

  let socket = io(url, params);
  onSelectorChange();

  function onSelectorChange() {

    console.log('change fierd');
    // socket && socket.disconnect();
    socket.disconnect()
    url = (destSelector[1].checked)
      ? 'http://localhost:3333/app-clients'
      : 'http://kurakste1.fvds.ru:3333/app-clients';
    socket = io(url, params);

    (function () {
      console.log('aaa');
      socket.on('connect', function () {
        console.log('App successfull connected');
      });

      socket.on('disconnect', function () {
        console.log('App connection loose');
      });

      newAlarm.onclick = () => {
        console.log('appNewAlarm');
        socket.emit('appNewAlarm', {
          token: 'string',
          payload: {
            id: null,
            UserId: 2,
            track: [[55.749054, 52.457500],],
            regionId: null, // определяем по координатам
            status: 0,
            oid: null, // operator id,
            pickedUpAt: null,
            groupSendAt: null,
            declineAt: null,
            closedAt: null,
            notes: null
          }
        });
      }

      trackUpdate.onclick = () => {
        const alarmIdInput = document.getElementById('alarmId');
        console.log('appNewPointInTrack');
        socket.emit('appNewPointInTrack', {
          token: 'string',
          payload: {
            aid: alarmIdInput.value,
            point: [22.3333, 45.22334]
          }
        });
      }
      //socket.emit('appNewPointInTrack', { id: null, uid: 234, track: [{ lan: 1, lon: 3 }] });

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

    })();
    destSelector[0].onchange = onSelectorChange;
    destSelector[1].onchange = onSelectorChange;
  };
});
