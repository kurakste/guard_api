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


  const uid = getParams.uid;
  const params = uid ? { query: `uid=${uid}` } : null;
  const socket = io('http://localhost:3333/cp-clients', params);
  // const socket = io('http://kurakste1.fvds.ru:3333/cp-clients', { query: `uid=${uid}` });

  btnPing.onclick = () => {
    console.log('ping');
    socket.emit('cpPing', {
      token: localStorage.token,
      user: JSON.stringify(localStorage.user),
      payload: { payload: 'payload' },
    });
  }

  btnCpPickedUpAlarm.onclick = () => {
    socket.emit('cpPickedUpAlarm', {
      token: localStorage.token,
      user: localStorage.user,
      payload: {
        id: 54,
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

  btnAlarmGbrSent.onclick = () => {
    socket.emit('cpAlarmGbrSent', {
      token: localStorage.token,
      user: localStorage.user,
      payload: {
        id: 54,
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
  },

    btnClosed.onclick = () => {
      socket.emit('cpAlarmClosed', {
        token: localStorage.token,
        user: localStorage.user,
        payload: {
          id: 54,
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

  btnDecline.onclick = () => {
    socket.emit('cpAlarmDecline', {
      token: localStorage.token,
      user: localStorage.user,
      payload: {
        id: 54,
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

  socket.on('srvLoginResult', (data) => {
    const { token, user } = data;
    localStorage.token = token;
    localStorage.user = JSON.stringify(user);
    console.log('srvLoginResult: ', data);
  });

  socket.on('errMessage', (data) => {
    console.log('errMessage: ', data);
  });

  socket.on('srvNewUserWasCreated', (data) => {
    console.log('srvNewUserWasCreated: ', data);
  });
});
