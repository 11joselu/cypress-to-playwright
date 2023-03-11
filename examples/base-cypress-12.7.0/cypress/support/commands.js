Cypress.Commands.add('addTodo', (newItem) => {
  cy.get('[data-test=new-todo]').type(`${newItem}{enter}`);
});
