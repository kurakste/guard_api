const socketController = {
  newAlert: (data) => {
    console.log('new alert: ', data);
  },

  trackUpdate: (data) => {
    console.log('track update: ', data);
  },

  alertInWork: (data) => {
    console.log('alert in work: ', data);
  },

  gbrSent: (data) => {
    console.log('gbr sent: ', data);
  },

  alertDecline: (data) => {
    console.log('alertDecline: ', data);
  },

  alertClose: (data) => {
    console.log('alert Close : ', data);
  },

  disconnect: (data) => {
    console.log('disconected: ', data);
  },
};

module.exports = socketController;
