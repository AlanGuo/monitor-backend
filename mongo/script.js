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
      task_id: ObjectId("624d3a959de4cc11d2dbfb15"),
      exchange: "BYBIT",
      position: "long",
      side: "sell",
      datetime: {$gt: "2022-04-06T16:00:00.000+08:00"}
    },
  },
  {
    $group: {
      _id: null,
      totalFill: { $sum: "$fill" },
    },
  },
]);

db.fulfillments.find({exchange: "BYBIT", position: "long",side: "sell", fill:{$gt: 0},task_id: ObjectId("625837c1769eaae6aa090554")}).sort({datetime: -1});

db.fulfillments.update({order_id: "994f1557-1319-4eef-99b4-e412223375e2"}, {$set: {volume: 100, fill: 100, trade_avg_price: 4.6280}});
db.fulfillments.insertOne( { "task_id" : ObjectId("624d3a959de4cc11d2dbfb15"), "datetime" : "2022-04-07T20:34:48.748587190+08:00", "exchange" : "BINANCE", "symbol" : "one", "order_id" : "-", "side" : "buy", "position" : "short", "price" : 0.14183, "volume" : 8398, "fill" : 8398, "fee" : 0.00029947, "fee_asset" : "bnb", "trade_avg_price" : 0.14087 } );
