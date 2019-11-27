document.addEventListener('DOMContentLoaded', () => {
  console.log('from on load');
  const getParams = (function () {
    const a = window.location.search;
    const b = new Object();
    const aa = a.substring(1).split("&");
    for (let i = 0; i < aa.length; i++) {
      let c = aa[i].split("=");
      b[c[0]] = c[1];
    }
    return b;
  })();

  const destSelector = document.getElementsByName('dest');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const telInput = document.getElementById('tel');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const registerButton = document.getElementById('register');
  const loginButton = document.getElementById('login');
  const btnCpPickedUpAlarm = document.getElementById('cpPickedUpAlarm');
  const btnPing = document.getElementById('btnPing');
  const btnAlarmGbrSent = document.getElementById('btnAlarmGbrSent');
  const btnClosed = document.getElementById('btnClosed');
  const btnDecline = document.getElementById('btnDecline');
  const btnAppUserApprove = document.getElementById('btnAppUserApprove');
  const btnAppUserDecline = document.getElementById('btnAppUserDecline');
  const btnCpUserApprove = document.getElementById('btnCpUserApprove');
  const btnCpUserDecline = document.getElementById('btnCpUserDecline');

  const uid = getParams.uid;
  const token = localStorage.token;
  const params = { query: `token=${token}` };

  let url = (destSelector[1].checked)
    ? 'http://localhost:3333/cp-clients'
    : 'http://kurakste1.fvds.ru:3333/cp-clients';

  let socket = io(url, params);
  onSelectorChange();

  function onSelectorChange() {
    console.log('change fierd');
    socket.disconnect();
    url = (destSelector[1].checked)
      ? 'http://localhost:3333/cp-clients'
      : 'http://kurakste1.fvds.ru:3333/cp-clients';
    socket = io(url, params);
    (function () {
      function getSocketObject(payload) {
        return {
          token: localStorage.token,
          user: localStorage.user,
          rid: 'fjsalkdfjsaldfk',
          payload,
        }
      }

      btnPing.onclick = () => {
        console.log('ping');
        socket.emit('cpPing', getSocketObject({ data: 'payload' }));
      }

      const alarmId = 54;

      btnCpPickedUpAlarm.onclick = () => {
        console.log('cpPickedUpAlarm');
        const dd = {
          id: alarmId,
          UserId: 2,
          track: [[55.749054, 52.457500],],
          regionId: null, // определяем по координатам
          status: 0,
          oid: 2, // operator id,
          pickedUpAt: null,
          groupSendAt: null,
          declineAt: null,
          closedAt: null,
          notes: null
        };
        socket.emit('cpPickedUpAlarm', getSocketObject(dd));
      }

      btnAlarmGbrSent.onclick = () => {
        const dd = {
          id: alarmId,
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
        };
        socket.emit('cpAlarmGbrSent', getSocketObject(dd));
      },

        btnClosed.onclick = () => {
          const dd = {
            id: alarmId,
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
          };

          socket.emit('cpAlarmClosed', getSocketObject(dd));
        }

      btnDecline.onclick = () => {
        const dd = {
          id: alarmId,
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
        };
        socket.emit('cpAlarmDecline', getSocketObject(dd));
      },

        registerButton.onclick = () => {
          const user = {
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            tel: telInput.value,
            email: emailInput.value,
            password: passwordInput.value,
          }

          socket.emit('cpRegisterNewCpUser', {
            token: null,
            payload: user,
          });

          console.log('register', user);
        }

      btnAppUserApprove.onclick = () => {
        console.log('btnAppUserApprove',document.getElementById('uid').value);
        const user = {
          id: document.getElementById('uid').value,
        };

        socket.emit('cpAppUserApprove', {
          token:null,
          payload: user,
        }); 
      };
      
      btnAppUserDecline.onclick = () => {
        const user = {
          id: document.getElementById('uid').value,
        }

        socket.emit('cpAppUserDecline', {
          token:null,
          payload: user,
        }); 
      };

      btnCpUserApprove.onclick = () => {
        const user = {
          id: document.getElementById('uid').value,
        }

        socket.emit('cpCpUserApprove', {
          token:null,
          payload: user,
        }); 
      };
      
      btnCpUserDecline.onclick = () => {
        const user = {
          id: document.getElementById('uid').value,
        }

        socket.emit('cpCpUserDecline', {
          token:null,
          payload: user,
        }); 
      };

      loginButton.onclick = () => {
        const user = {
          firstName: firstNameInput.value,
          lastName: lastNameInput.value,
          tel: telInput.value,
          email: emailInput.value,
          password: passwordInput.value,
        }

        socket.emit('cpSignIn', {
          token: null,
          payload: user,
        });
        console.log('login', user);
      }

      socket.on('open', function () {
        console.log('socket connection succesfull');
      });

      socket.on('connect', function () {
        console.log('successfull connected');
      });

      socket.on('disconnect', function () {
        console.log('connection loose');
      });

      socket.on('srvUpdateAlarmListAll', (data) => {
        console.log('srvUpdateAlarmListAll: ', data);

      });

      socket.on('srvCreateNewAlarm', (data) => {
        console.log('srvCreateNewAlarm: ', data);
      });

      socket.on('srvUpdateAlarm', (data) => {
        console.log('srvUpdateAlarm: ', data);
      });

      socket.on('srvUpdateUserList', (data) => {
        console.log('srvUpdateUserList: ', data);
      });

      socket.on('srvNewUserConnected', (data) => {
        console.log('srvNewUserConnected: ', data);
      });

      socket.on('srvNewUserDisconnected', (data) => {
        console.log('srvNewUserDisconnected: ', data);
      });

      socket.on('srvLoginOk', (data) => {
        const { token, user } = data;
        localStorage.token = token;
        localStorage.user = JSON.stringify(user);
        console.log('srvLoginResult: ', data);
      });

      socket.on('srvErrMessage', (data) => {
        console.log('srvErrMessage: ', data);
      });

      socket.on('srvNewUserWasCreated', (data) => {
        console.log('srvNewUserWasCreated: ', data);
      });

      socket.on('srvSendAllCpUserList', (data) => {
        console.log('srvSendAllCpUserList: ', data);
      });

      socket.on('srvSendAllAppUserList', (data) => {
        console.log('srvSendAllAppUserList: ', data);
      });
      
      socket.on('srvUpdateOneCpUser', (data) => {
        console.log('srvUpdateOneCpUser: ', data);
      });
      
      socket.on('logger', (data) => {
        console.log('logger: ', data);
      });

    })();
  };

  destSelector[0].onchange = onSelectorChange;
  destSelector[1].onchange = onSelectorChange;


});
