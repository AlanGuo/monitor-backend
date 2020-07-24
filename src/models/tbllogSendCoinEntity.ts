import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';


@Table({
  timestamps: false
})
export default class TbllogSendCoinEntity extends Model<TbllogSendCoinEntity>{
  @PrimaryKey
  @Column
  userid!: string;

  @Column
  coin!: number;

  @Column
  presentcoin!: number;

  @Column
  totalcoin!: number;
  
  @Column
  eventid!: string;

  @Column
  createtime!: number

  static createEntity(suffix: string) {
    @Table({
      tableName: "tbllog_sendcoin_" + suffix,
      timestamps: false
    })
    class WithSuffixDeliverEntity extends TbllogSendCoinEntity {};
    return WithSuffixDeliverEntity;
  }
}