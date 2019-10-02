document.addEventListener('DOMContentLoaded', () => {
  console.log('from on load');
  let lastalarm;

  const destSelector = document.getElementsByName('dest');
  const newTrack = document.getElementById('newTrack');
  const trackAddPoint = document.getElementById('trackAddPoint');
  const stopTrack = document.getElementById('stopTrack');
  const newAlarm = document.getElementById('newAlarm');
  const userId = document.getElementById('userId');
  const alarmId = document.getElementById('alarmId');
  const trackUpdate = document.getElementById('trackUpdate');

  let url = (destSelector[1].checked)
    ? 'http://localhost:3333/app-clients'
    : 'http://kurakste1.fvds.ru:3333/app-clients';

  let token = localStorage.token;
  let params = { query: `token=${token}` };

  let socket = io(url, params);
  onSelectorChange();

  loginButton.onclick = async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    const body = { email, password };
    let url = (destSelector[1].checked)
      ? 'http://localhost:3030/sign-in'
      : 'http://kurakste1.fvds.ru:3030/sign-in';

    console.log(body);
    const rawResp = await fetch(url,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(body)
      });
    const res = await rawResp.json();
    const { payload, success, message } = res;
    if (success) {
      const { token } = payload;
      localStorage.token = token;
      console.log('login is ok', token);

    } else {
      localStorage.token = null;
      console.log(message);

    }

  }


  function onSelectorChange() {

    console.log('change fierd');
    // socket && socket.disconnect();
    socket.disconnect()
    url = (destSelector[1].checked)
      ? 'http://localhost:3333/app-clients'
      : 'http://kurakste1.fvds.ru:3333/app-clients';

    token = localStorage.token;
    params = { query: `token=${token}` };
    socket = io(url, params);

    (function () {
      socket.on('connect', function () {
        console.log('App successfull connected');
      });

      socket.on('disconnect', function () {
        console.log('App connection loose');
      });

      trackAddPoint.onclick = () => {
        console.log('appTrackAddPoint');
        socket.emit('appTrackAddPoint', {
          payload: [23.2345, 34.34235]
        });
      },

        stopTrack.onclick = () => {
          console.log('appStopTrack');
          socket.emit('appStopTrack', {
            payload: null
          });
        },

        newTrack.onclick = () => {
          console.log('appNewTrack');
          socket.emit('appNewTrack', {
            payload: [23.2345, 34.34235]
          });
        }

      newAlarm.onclick = () => {
        console.log('appNewAlarm');
        socket.emit('appNewAlarm', {
          token: 'string',
          payload: [55.749054, 52.457500]
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

      socket.on('srvErrMessage', function (data) {
        console.log('srvErrMessage: ', data);
      });

      socket.on('srvSendAppState', function (data) {
        console.log('srvSendAppState: ', data);
      });

      socket.on('srvAcceptNewTrack', function (data) {
        console.log('srvAcceptNewTrack: ', data);
      });

    })();
    destSelector[0].onchange = onSelectorChange;
    destSelector[1].onchange = onSelectorChange;
  };
});
