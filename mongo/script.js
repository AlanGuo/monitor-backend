db.depths.aggregate([
  {
    $match: {
      symbol: "sushi"
    }
  },
  {$limit: 10080},
  {
    $project:{
      binance_ask: 1, binance_bid: 1, huobi_ask: 1, huobi_bid: 1, okex_ask: 1, okex_bid: 1, ts:1,
      close_price_diff: { 
        $subtract: [ "$binance_ask", "$huobi_bid" ] 
      },
      open_price_diff: { 
        $subtract: [ "$binance_bid", "$huobi_ask" ] 
      }
    }
  },
  {
    $project: {
      _id: 0,
      binance_ask: 1, binance_bid: 1, huobi_ask: 1, huobi_bid: 1, ts: 1,
      closePriceLte0: {$lte:["$close_price_diff", 0]},
    }
  },
  {
    $match: {
      closePriceLte0: true
    }
  },
]);
