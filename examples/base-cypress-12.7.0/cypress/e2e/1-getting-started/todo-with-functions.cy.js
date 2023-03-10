describe('example to-do app', () => {
  beforeEach(() => {
    gotoPage();
  });

  it('displays two todo items by default', () => {
    validateItemsAsArrowFunction();
  });

  it('can add new todo items', () => {
    const newItem = 'Feed the cat';

    cy.get('[data-test=new-todo]').type(`${newItem}{enter}`);
    cy.get('.todo-list li').should('have.length', 3);
    cy.get('.todo-list li').last().should('have.text', newItem);
  });
});

function gotoPage() {
  cy.visit("https://example.cypress.io/todo");
}

const validateItemsAsArrowFunction = () => {
  cy.get(".todo-list li").should("have.length", 2);
  cy.get(".todo-list li").first().should("have.text", "Pay electric bill");
  cy.get(".todo-list li").last().should("have.text", "Walk the dog");
}
