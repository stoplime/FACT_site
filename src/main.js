import './style.css';
import chartData from './fact-data.json';
import { generateChartTemplate } from './chart-template.js'; // We don't need COLUMN_COUNTS anymore

const chartContainer = document.getElementById('fact-chart-container');

// --- KEY CHANGE: The maximum visual height of the main pyramid is 10 ---
const MAX_PYRAMID_HEIGHT = 10;

function buildChart(data, container) {
    container.innerHTML = '';
    const chartTemplate = generateChartTemplate();
    const dataMap = new Map(data.map(item => [item.id, item]));

    chartTemplate.forEach(slot => {
        const hasData = dataMap.has(slot.id);
        const entryData = hasData ? dataMap.get(slot.id) : null;
        const cell = document.createElement('div');
        
        // --- Add Classes (Unchanged) ---
        cell.id = slot.id;
        cell.classList.add('cell');
        cell.classList.add(hasData ? 'chart-cell' : 'empty-cell');
        if (slot.isParallelPyramid) cell.classList.add('is-parallel');
        
        // --- Positioning Logic using the CORRECT Height ---
        let gridCol, gridRow;

        // User's custom positioning for the ears
        if (slot.position === 'left-ear') {
            gridCol = 2;
            gridRow = 0;
        } else if (slot.position === 'right-ear') {
            gridCol = 8;
            gridRow = slot.row - 16;
        } else {
            // Main pyramid positioning
            gridCol = slot.dof + 2;

            // ** THE CORRECT INVERSION LOGIC **
            // Calculate row from the bottom of a 10-row-high grid.
            gridRow = MAX_PYRAMID_HEIGHT - slot.row + 1;
        }

        cell.style.gridColumn = gridCol;
        cell.style.gridRow = gridRow;
        
        // --- Set Content and Interactivity (Unchanged) ---
        const idText = `${slot.dof}-DOF-${slot.row}`;
        cell.textContent = idText;
        
        if (hasData) {
            cell.addEventListener('click', () => {
                console.log('Clicked on:', entryData);
            });
        }
        
        container.appendChild(cell);
    });
}

// --- INITIALIZE THE CHART ---
buildChart(chartData, chartContainer);