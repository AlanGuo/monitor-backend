db.fulfillments.aggregate([
  {
    $match: {
      task_id: ObjectId("624d3a959de4cc11d2dbfb15"),
      exchange: "BINANCE",
      position: "short",
      side: "buy",
      datetime: {$gt: "2022-04-06T1:00:00.000+08:00"}
    },
  },
  {
    $group: {
      _id: null,
      totalFill: { $sum: "$fill" },
    },
  },
]);

db.fulfillments.aggregate([
  {
    $match: {
      task_id: ObjectId("625cd8e66115c69bcb179458"),
      exchange: "BYBIT",
      position: "short",
      side: "buy",
      fill:{$gt: 0}
    },
  },
  {$project:{fill:1, total: { $multiply: [ "$trade_avg_price", "$fill" ] }}},
  {
    $group: {
      _id: null,
      totalFill: { $sum: "$fill" },
      totalPrice:{$sum:"$total"}
    },
  },
]);

db.fulfillments.find({exchange: "BYBIT", position: "short",side: "buy", fill:{$gt: 0},task_id: ObjectId("625cd8e66115c69bcb179458")}).sort({datetime: -1});

db.fulfillments.update({order_id: "14190c98-fa1c-470e-928d-23fb7986919e"}, {$set: {trade_avg_price: 2.6009}});
db.fulfillments.insertOne( { "task_id" : ObjectId("624d3a959de4cc11d2dbfb15"), "datetime" : "2022-04-07T20:34:48.748587190+08:00", "exchange" : "BINANCE", "symbol" : "one", "order_id" : "-", "side" : "buy", "position" : "short", "price" : 0.14183, "volume" : 8398, "fill" : 8398, "fee" : 0.00029947, "fee_asset" : "bnb", "trade_avg_price" : 0.14087 } );
db.records.update({"_id" : ObjectId("625837c1769eaae6aa090554")}, {$set: {price_diff_profit: 0 }})