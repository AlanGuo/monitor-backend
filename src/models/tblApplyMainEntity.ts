import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';


@Table({
  tableName: "tbl_apply_main",
  timestamps: false
})
export default class TblApplyMainEntity extends Model<TblApplyMainEntity>{
  @PrimaryKey
  @Column
  id!: string;

  @Column
  user_uid!: string;

  @Column
  apply_quantity!: number;

  @Column
  sendtime!: number
}