import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

class Tasks extends Model {
public id!: string;
public name!: string;
public listId!: number;
public status!: string;
public leadId!: number;
public data!: any;
}

Tasks.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  listId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  leadId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true
  },
}, {
  sequelize,
  schema: 'public',
  tableName: 'tasks',
  timestamps: true
});



export default Tasks;