/// <reference types="cypress" />
describe('Página Principal', () => {
    beforeEach(() => {
        // Asumimos que el usuario no está logueado para ver la landing o redirigir a login
        cy.visit('http://localhost:3000')
    })

    it('debería mostrar el título de la aplicación', () => {
        cy.get('h1').should('exist')
    })

    it('debería permitir navegar a la página de registro', () => {
        // Buscamos un enlace que contenga "Regístrate" o similar
        cy.contains('Regístrate').click()
        cy.url().should('include', '/register')
    })
})