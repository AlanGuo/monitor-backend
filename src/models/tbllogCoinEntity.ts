import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';


@Table({
  timestamps: false
})
export default class TbllogCoinEntity extends Model<TbllogCoinEntity>{
  @PrimaryKey
  @Column
  userid!: string;
  
  @Column
  siteid!: number;

  @Column
  coin!: number;

  @Column
  coin_source!: number;
  
  @Column
  eventid!: string;

  @Column
  level!: number;

  @Column
  createtime!: number

  static createEntity(suffix: string) {
    @Table({
      tableName: "tbllog_coin_" + suffix,
      timestamps: false
    })
    class WithSuffixDeliverEntity extends TbllogCoinEntity {};
    return WithSuffixDeliverEntity;
  }
}