import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn(
      { schema: "public", tableName: "PosVendaMessages" },
      "mimetype",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { schema: "public", tableName: "PosVendaMessages" },
      "media_name",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { schema: "public", tableName: "PosVendaMessages" },
      "media_json",
      {
        type: DataTypes.STRING(65536),
        allowNull: true,
      }
    );

    await queryInterface.addColumn(
      { schema: "public", tableName: "PosVendaMessages" },
      "mediaurl",
      {
        type: DataTypes.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn(
      { schema: "public", tableName: "PosVendaMessages" },
      "mimetype"
    );

    await queryInterface.removeColumn(
      { schema: "public", tableName: "PosVendaMessages" },
      "media_name"
    );

    await queryInterface.removeColumn(
      { schema: "public", tableName: "PosVendaMessages" },
      "media_json"
    );

    await queryInterface.removeColumn(
      { schema: "public", tableName: "PosVendaMessages" },
      "mediaurl"
    );
  },
};
