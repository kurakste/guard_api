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

  const btnCpPickedUpAlarm = document.getElementById('cpPickedUpAlarm');
  const btnAlarmGbrSent = document.getElementById('btnAlarmGbrSent');
  const btnClosed = document.getElementById('btnClosed');
  const btnDecline = document.getElementById('btnDecline');


  const uid = getParams.uid;

  const socket = io('http://localhost:3333/cp-clients', { query: `uid=${uid}` });
  // const socket = io('http://kurakste1.fvds.ru:3333/cp-clients', { query: `uid=${uid}` });

  btnCpPickedUpAlarm.onclick = () => {
    socket.emit('cpPickedUpAlarm', {
      token: { user: { id: 2 }, },
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
      token: { user: { id: 2 }, },
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

  btnClosed.onclick = () => {
    socket.emit('cpAlarmClosed', {
      token: { user: { id: 2 }, },
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
      token: { user: { id: 2 }, },
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
  })
});