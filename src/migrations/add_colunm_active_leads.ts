import { QueryInterface, DataTypes } from "sequelize";


export default {
 up: async (queryInterface: QueryInterface): Promise<void> => {
    
    await queryInterface.addColumn(
      { schema: "public", tableName: "leadsPosVenda" },
      "active",
      {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      
    );

     await queryInterface.addColumn(
      { schema: "public", tableName: "leadsPosVenda" },
      "nameconfirm",
      {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      
    );
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn(
      { schema: "public", tableName: "leadsPosVenda" },
      "active"
    );
    await queryInterface.removeColumn(
      { schema: "public", tableName: "leadsPosVenda" },
      "nameconfirm"
    );
  }
};
