import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';


@Table({
  timestamps: false
})
export default class LogDeliverEntity extends Model<LogDeliverEntity>{
  @PrimaryKey
  @Column
  id!: string;

  @Column
  site_id!: string;

  @Column
  user_id!: string;

  @Column
  starcoin!: number;

  @Column
  starcoin_gift!: number;

  @Column
  starcoin_total!: number;

  @Column
  ip!: string;

  @Column
  deliver_time!: number

  static createEntity(suffix: string) {
    @Table({
      tableName: "log_deliver_" + suffix,
      timestamps: false
    })
    class WithSuffixDeliverEntity extends LogDeliverEntity {};
    return WithSuffixDeliverEntity;
  }
}