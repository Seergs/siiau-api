import { NOW } from 'sequelize';
import { Column, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'analytics',
  timestamps: false,
})
export class Analytic extends Model {
  @Column
  controller: string;

  @Column
  path: string;

  @Column({
    defaultValue: NOW,
  })
  date: Date;
}
