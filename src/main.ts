// src/main.ts (Actualizado)

import { TonalpoualiCore } from './core/TonalpoualiCore.js';

// Elementos de la interfaz
const fechaInput = document.getElementById('fechaInput') as HTMLInputElement;
const horaInput = document.getElementById('horaInput') as HTMLInputElement;
const calcularBtn = document.getElementById('calcularBtn') as HTMLButtonElement;
const resultadoDiv = document.getElementById('resultado') as HTMLPreElement;

// Creamos una instancia de nuestra calculadora
const calculator = new TonalpoualiCore();

// Establecemos la fecha y hora actuales por defecto
const ahora = new Date();
fechaInput.value = ahora.toISOString().split('T')[0];
horaInput.value = ahora.toTimeString().split(' ')[0].substring(0, 5);


// Añadimos el evento al botón
calcularBtn.addEventListener('click', () => {
    const fechaStr = fechaInput.value;
    const horaStr = horaInput.value;

    if (fechaStr && horaStr) {
        // Combinamos la fecha y la hora en un objeto Date
        const fechaCompleta = new Date(`${fechaStr}T${horaStr}`);
        
        // Llamamos a nuestro método principal
        const resultado = calculator.calculate(fechaCompleta);
        
        // Mostramos el resultado formateado
        resultadoDiv.textContent = JSON.stringify(resultado, null, 2);
    }
});

// Hacemos un cálculo inicial al cargar la página
//calcularBtn.click();
const añoParaAuditar = 1901; // Cambia este valor según el año que quieras auditar
console.log(`Realizando auditoría para el año ${añoParaAuditar}...`);
calculator.auditNemontemiForYear(añoParaAuditar);