document.addEventListener('DOMContentLoaded', () => {
  console.log('from on load');
  let lastalarm;
  const newAppError = document.getElementById('newAppError');
  const destSelector = document.getElementsByName('dest');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('login');
  const heartBeatSend = document.getElementById('heartBeatSend');
  const trackAddPoint = document.getElementById('trackAddPoint');
  const newAlarm = document.getElementById('newAlarm');
  const appAddNewPointInAlarmTrack = document.getElementById('appAddNewPointInAlarmTrack');
  const appCancelAlarm = document.getElementById('appCancelAlarm');

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
      : 'https://api2.kurakste.ru/sign-in';

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
        console.log('addNewPosition');
        // socket.emit('addNewPosition', {
        //   payload: [23.2345, 34.34235]
        // });
        socket.emit('addNewPosition', {
          payload: [23.2345, 34.34235]
        });
      };

      heartBeatSend.onclick = () => {
        console.log('heartBeatSend');
        socket.emit('heartBeat', {
          payload: null
        });
      };

      newAppError.onclick = () => {
        socket.emit('appError', {
          message: 'Test error',
          data: { data: 'test error data' }
        });
      };

      newAlarm.onclick = () => {
        console.log('appNewAlarm');
        socket.emit('appNewAlarm', {
          token: 'string',
          payload: [55.762325, 52.417567]
        });
      }

      appAddNewPointInAlarmTrack.onclick = () => {
        console.log('appAddNewPointInAlarmTrack');
        socket.emit('appAddNewPointInAlarmTrack', {
          token: 'string',
          payload: [22.3333, 45.22334],
        });
      }

      appCancelAlarm.onclick = () => {
        console.log('appCancelAlarm');
        socket.emit('appCancelAlarm');
      }

      socket.on('srvErrMessage', function (data) {
        console.log('srvErrMessage: ', data);
      });

      socket.on('srvSendAppState', function (data) {
        console.log('srvSendAppState: ', data);
      });

      socket.on('srvAcceptNewTrack', function (data) {
        console.log('srvAcceptNewTrack: ', data);
      });

      socket.on('srvAcceptTrackAddNewPoint', function (data) {
        console.log('srvAcceptTrackAddNewPoint: ');
      });

      socket.on('arvAcceptAppStopTrack', function (data) {
        console.log('srvAcceptAppStopTrack: ');
      });

      socket.on('srvAcceptNewAlarm', function (data) {
        console.log('srvAcceptNewAlarm: ', data);
      });

      socket.on('srvAcceptAddNewPointInAlarmTrack', function (data) {
        console.log('srvAcceptAddNewPointInAlarmTrack: ');
      });

      socket.on('srvAcceptCancelAlarm', function (data) {
        console.log('srvAcceptCancelAlarm: ');
      });

      socket.on('srvAcceptAddNewPosition', function (data) {
        console.log('srvAcceptAddNewPosition: ');
      });

      socket.on('srvAlertMessage', function (data) {
        console.log('srvAlertMessage: ', data);
      });

      socket.on('logger', (data) => {
        console.log('logger: ', data);
      });


    })();
    destSelector[0].onchange = onSelectorChange;
    destSelector[1].onchange = onSelectorChange;
  };
});
