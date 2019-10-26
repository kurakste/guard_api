const dotenv = require('dotenv');
const models = require('../../models');

dotenv.config();

const { User, Bill } = models;
const fullBillingSum = process.env.BILLINGSUM;
const dailyBillingSum = fullBillingSum / 30;

async function doBilling() {
  const users = await User.findAll({
    where: { role: 35, active: true, lowBallance: false },
  });

  const a = users.map(el => addBillingRecordById(el.id));
  await Promise.all(a);
  const promBunch = users.map(el => updateBallanceById(el.id));
  await Promise.all(promBunch);
  console.log('===---- Done');
  return null;
}

async function addBillingRecordById(id) {
  const bill = new Bill();
  bill.UserId = id;
  bill.sum = -1 * dailyBillingSum;
  bill.comment = 'Daily billing';
  bill.operationType = 'Daily billing';
  bill.isPaymentFinished = true;
  await bill.save();
  console.log('done addBillingRecordById for id: ', id);
  return null;
}

async function updateBallanceById(id) {
  const sum = await Bill.sum('sum', { where: { UserId: id, isPaymentFinished: true } });
  const user = await User.findByPk(id);
  user.lowBallance = (sum < 0);
  user.balance = sum;
  await user.save();
  console.log('done updateBallanceById for id: ', id);
  return null;
}

module.exports = doBilling;
