import './style.css';
import chartData from './fact-data.json';
import { generateChartTemplate } from './chart-template.js';
import { generateThumbnails } from './thumbnail-renderer.js';
import { init as initModal, show as showModal } from './modal-viewer.js';

const chartContainer = document.getElementById('fact-chart-container');
const MAX_PYRAMID_HEIGHT = 10;

async function buildChart(data, container) {
    container.innerHTML = '';
    
    // 1. Generate all thumbnails first
    const thumbnails = await generateThumbnails(data);
    const chartTemplate = generateChartTemplate();
    const dataMap = new Map(data.map(item => [item.id, item]));

    chartTemplate.forEach(slot => {
        const hasData = dataMap.has(slot.id);
        const cell = document.createElement('div');
        
        cell.id = slot.id;
        cell.classList.add('cell');
        cell.classList.add(hasData ? 'chart-cell' : 'empty-cell');
        if (slot.isParallelPyramid) cell.classList.add('is-parallel');
        
        let gridCol, gridRow;
        if (slot.position === 'left-ear') {
            gridCol = 2;
            gridRow = 0;
        } else if (slot.position === 'right-ear') {
            gridCol = 8;
            gridRow = slot.row - 16;
        } else {
            gridCol = slot.dof + 2;
            gridRow = MAX_PYRAMID_HEIGHT - slot.row + 1;
        }
        cell.style.gridColumn = gridCol;
        cell.style.gridRow = gridRow;
        
        if (hasData) {
            const entryData = dataMap.get(slot.id);
            // 2. Set the background image to the generated thumbnail
            const thumbnailUrl = thumbnails.get(slot.id);
            if (thumbnailUrl) {
                cell.style.backgroundImage = `url(${thumbnailUrl})`;
            }

            // 3. Add click listener to show the modal
            cell.addEventListener('click', () => {
                showModal(entryData);
            });
        } else {
            cell.textContent = `${slot.dof}-DOF-${slot.row}`;
        }
        
        container.appendChild(cell);
    });
}

// --- Main execution ---
// Initialize the (hidden) modal viewer once
initModal();
// Build the chart with thumbnails and click events
buildChart(chartData, chartContainer);