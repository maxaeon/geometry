describe('standards badge', () => {
  it('displays HS standards for equilateral triangle activity', () => {
    cy.visit('/');
    cy.contains('Start').click();
    cy.get('#activity-select').select('hs_equilateral_triangle_in_circle');
    cy.get('#standards-chip').should('be.visible').and('contain', 'G-CO.D.13');
    cy.get('#state-selector').select('MI');
    cy.get('#standards-chip').should('contain', 'G-CO.D.13');
  });
});
