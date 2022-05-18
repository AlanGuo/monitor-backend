db.depths.createIndex({binance_okex_close_diff: 1}, {sparse: true});
db.depths.createIndex({binance_bybit_close_diff: 1}, {sparse: true});
db.depths.createIndex({bybit_binance_close_diff: 1}, {sparse: true});
db.depths.createIndex({bybit_okex_close_diff: 1}, {sparse: true});
db.depths.createIndex({okex_binance_close_diff: 1}, {sparse: true});
db.depths.createIndex({okex_bybit_close_diff: 1}, {sparse: true});