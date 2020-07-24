import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript';


@Table({
  timestamps: false
})
export default class OrderItemEntity extends Model<OrderItemEntity>{
  @PrimaryKey
  @Column
  id!: string;

  @Column
  uid!: number;

  @Column
  action_id!: number;

  @Column
  coin_all!: number;

  @Column
  coin_pay!: number;

  @Column
  coin_bns!: number;

  @Column
  coin_lck!: number;

  @Column
  coin_exc!: number;

  @Column
  coin_rfu!: number;

  @Column
  ip!: string;

  @Column
  create_time!: number

  static createEntity(suffix: string) {
    @Table({
      tableName: "order_item_" + suffix,
      timestamps: false
    })
    class WithSuffixDeliverEntity extends OrderItemEntity {};
    return WithSuffixDeliverEntity;
  }
}