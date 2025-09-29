import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../db.js' ;

class PosVendaMessages extends Model {
  public id!: number;
  public title!: string;
  public message_text?: string; 
  public sent!: boolean;
  public schadule?: Date;
  public mimetype!: string;
  public media_name!: string;
  public media_json!: string;
  public mediaurl!: string;
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
   mimetype: {
    type: DataTypes.STRING,
    allowNull: true
  },
  media_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  media_json: {
    type: DataTypes.STRING(65536),
    allowNull: true,
  },
  mediaurl: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      if (this.getDataValue("mediaurl")) {
        return `${process.env.BACKEND_URL}/api/files/${this.getDataValue("mediaurl")}`;
      }
      return null;
    }
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