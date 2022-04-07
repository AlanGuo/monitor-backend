db.depths.aggregate([
  {
    $match: {
      symbol: "sushi"
    }
  },
  {$limit: 10080},
  {
    $project:{
      binance_ask: 1, binance_bid: 1, bybit_ask: 1, bybit_bid: 1, okex_ask: 1, okex_bid: 1, ts:1,
      close_price_diff: { 
        $subtract: [ "$binance_ask", "$bybit_bid" ] 
      },
      open_price_diff: { 
        $subtract: [ "$binance_bid", "$bybit_ask" ] 
      }
    }
  },
  {
    $project: {
      _id: 0,
      ts:1,
      closePriceLte0: {$lte:["$close_price_diff", 0]},
    }
  },
  {
    $match: {
      closePriceLte0: true
    }
  },
  {
    $count: "count"
  }
]);
