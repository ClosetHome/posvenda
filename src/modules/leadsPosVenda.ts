import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.js';


class LeadsPosVenda extends Model {
  public id!: number;
  public name!: string;
  public email?: string;
  public city?: string;
  public state?: string;
  public street?:string;
  public neighborhood?: string;
  public number?: string;
  public cep?: string;
  public cpf?: string;
  public birthday?: Date;
  public phone!: string;
  public subscriberbot?:number;
  public customFields?: object
}

LeadsPosVenda.init({
  id: {
   type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  street: {
    type: DataTypes.STRING,
    allowNull: true
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: true
  },
  number: {
    type: DataTypes.STRING,
    allowNull: true
  },
   subscriberbot: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: true
  },
   birthday: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },

  customFields: {
    type: DataTypes.JSON,
    allowNull: true
  },
}, {
  sequelize,
  schema: 'public',
  tableName: 'leadsPosVenda',
  timestamps: true,
});



export default LeadsPosVenda;
