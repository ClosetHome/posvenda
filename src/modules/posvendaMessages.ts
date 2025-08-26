import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../db.js' ;

class PosVendaMessages extends Model {
  public id!: number;
  public title!: string;
  public message_text?: string; 
  public sent!: boolean;
  public schadule?: Date;
  public leadId!: number;
}

PosVendaMessages.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message_text: {
    type: DataTypes.STRING(65536),
    allowNull: true
  },
  schadule: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue:false
  },
  leadId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  sequelize,
  schema: 'public',
  tableName: 'PosVendaMessages',
  timestamps: true
});

export default PosVendaMessages