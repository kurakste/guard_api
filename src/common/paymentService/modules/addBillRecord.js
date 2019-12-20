const models = require('../../../../models');

const { Bill } = models;

async function addBillRecord(userId, sum, operationType, comment, subscriptionId) {
  const billRecord = await Bill.build({
    UserId: userId,
    sum,
    operationType,
    comment,
    isPaymentFinished: null,
    subscriptionId,
  });
  await billRecord.save();
  const out = billRecord.id;
  return out;
}

module.exports = addBillRecord;
