"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "todos",
      [
        {
          title: "Todo 1",
          description: "Belajar Node Js",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Todo 2",
          description: "Belajar React Js",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("todos", null, {});
  },
};
