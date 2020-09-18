echo "rs init"

check_mongo_status() {
  echo "check"
  mongo1=$(mongo --host mongo1 --port 27017 --eval "rs.status().ok" | tail -n1)
  mongo2=$(mongo --host mongo2 --port 27018 --eval "rs.status().ok" | tail -n1)
  mongo3=$(mongo --host mongo3 --port 27019 --eval "rs.status().ok" | tail -n1)
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
  ret=$(mongo --host mongo1 --port 27017 --eval 'rs.initiate({_id: "mongo_replSet",members: [{ _id : 0, host : "mongo1:27017" },{ _id : 1, host : "mongo2:27018" },{ _id : 2, host : "mongo3:27019" }]});')
  echo ret
}

check_mongo_status

echo "rs init finished"
exit 0