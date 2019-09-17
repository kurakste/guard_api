const extractParamsFromUrl = require('./extractParamsFromUrl');
// TODO: Как исправить настройки линтера? 
test('test extract url', () => {
  const testString = '/socket.io/?uid=3&EIO=3&transport=polling&t=Mq-166I';
  const res = extractParamsFromUrl(testString);
  expect(res['uid']).toBe('3');
});