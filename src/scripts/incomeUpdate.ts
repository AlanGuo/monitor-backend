import {dbConnect} from "@src/infrastructure/mongo";
import BillModel from "@src/models/bill";
import {BillType} from "@src/infrastructure/utils/constants";

async function updateIncome() {
  await dbConnect();

  // 更新所有bill
  const consumeBills = await BillModel.find({type: BillType.consume});

  // 插入新规则bill
  consumeBills.forEach(item => {
    console.log(item.toJSON())
  })

  // 取消所有订单
}

updateIncome().then(()=>{console.log("end")})