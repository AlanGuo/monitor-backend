echo "rs init"

check_mongo_status() {
  echo "check"
  mongo1=$(mongo --host mongodb_fans_primary --port 27017 --eval "rs.status().ok" | tail -n1)
  mongo2=$(mongo --host mongodb_fans_replica1 --port 27017 --eval "rs.status().ok" | tail -n1)
  mongo3=$(mongo --host mongodb_fans_replica2 --port 27017 --eval "rs.status().ok" | tail -n1)
  echo "$mongo1", "$mongo2", "$mongo3"
  if [[ $mongo1 == 0 ]] && [[ $mongo1 == 0 ]] && [[ $mongo1 == 0 ]]
  then
    init_rs
  else
    check_mongo_status
  fi
}

init_rs() {
  echo "initiate"
  ret=$(mongo --host mongodb_fans_primary --port 27017 --eval 'rs.initiate({_id: "mongo_replSet",members: [{ _id : 0, host : "mongo_primary:27017" },{ _id : 1, host : "mongo_replica1:27017" },{ _id : 2, host : "mongo_replica2:27017" }]});')
  echo ret
}

check_mongo_status

echo "rs init finished"
exit 0