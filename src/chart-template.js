// This file defines the static structure and layout of the FACT chart.

export const COLUMN_COUNTS = [1, 3, 10, 22, 10, 3, 1];
const PARALLEL_PYRAMID_LIMITS = [1, 3, 9, 9, 3, 1, 0]; // Max row number within the pyramid for each DOF

/**
 * Generates an array of 50 objects representing the complete chart layout.
 * @returns {Array<Object>}
 */
export function generateChartTemplate() {
    const template = [];

    // Loop through each DOF column (0 to 6)
    for (let dof = 0; dof < COLUMN_COUNTS.length; dof++) {
        const rowCount = COLUMN_COUNTS[dof];

        // Loop through each row in the current column
        for (let row = 1; row <= rowCount; row++) {
            const entry = {
                id: `${dof}-DOF-${row}`,
                dof: dof,
                row: row,
                isParallelPyramid: row <= PARALLEL_PYRAMID_LIMITS[dof],
                position: 'default', // For special positioning
            };

            // Handle the special "ear" layout for DOF 3
            if (dof === 3) {
                if (row >= 11 && row <= 16) {
                    entry.position = 'left-ear';
                } else if (row >= 17 && row <= 22) {
                    entry.position = 'right-ear';
                }
            }

            template.push(entry);
        }
    }
    return template;
}