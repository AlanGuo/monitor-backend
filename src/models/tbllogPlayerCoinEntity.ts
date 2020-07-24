import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';


@Table({
  timestamps: false
})
export default class TbllogPlayerCoinEntity extends Model<TbllogPlayerCoinEntity>{
  @PrimaryKey
  @Column
  siteid!: string;

  @PrimaryKey
  @Column
  userid!: number;

  @Column
  coin_source!: number;

  @Column
  coin_type!: number;

  @PrimaryKey
  @Column
  actionid!: number;

  @Column
  coin!: number;

  @PrimaryKey
  @Column
  flag!: number;

  @Column
  ip!: string;
  
  @Column
  eventid!: string;

  @Column
  level!: number;

  @PrimaryKey
  @Column
  createtime!: number

  static createEntity(suffix: string) {
    @Table({
      tableName: "tbllog_playercoin_" + suffix,
      timestamps: false
    })
    class WithSuffixDeliverEntity extends TbllogPlayerCoinEntity {};
    return WithSuffixDeliverEntity;
  }
}