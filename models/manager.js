import pool from '../db/connect.js';

export async function add_project(project) {
    try {
        const result = await pool.query(
            `INSERT INTO projects 
            ("Project_Name", "Description", "Tech_Stack", "Link", "Category", "Difficulty", "Image_URL") 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                project.Project_Name,
                project.Description,
                project.Tech_Stack,
                project.Link,
                project.Category || 'Main Quest',
                project.Difficulty || 5,
                project.Image_URL || ''
            ]
        );

        console.log('Project added successfully');
        return result.rows[0];
    }
    catch (err) {
        console.error('Error adding project:', err);
        throw err;
    }
};

export async function delete_project(id) {
    try {
        await pool.query('DELETE FROM projects WHERE id =$1', [id]);
        console.log('Project deleted successfully');
    }
    catch (err) {
        console.error('Error deleting project:', err);
    }
};

export async function update_project(id, project) {
    try {
        const result = await pool.query(
            `UPDATE projects SET 
            "Project_Name" = $1, 
            "Description" = $2, 
            "Tech_Stack" = $3, 
            "Link" = $4,
            "Category" = $5,
            "Difficulty" = $6,
            "Image_URL" = $7
            WHERE id = $8 RETURNING *`,
            [
                project.Project_Name,
                project.Description,
                project.Tech_Stack,
                project.Link,
                project.Category || 'Main Quest',
                project.Difficulty || 5,
                project.Image_URL || '',
                id
            ]
        );
        console.log('Project updated successfully');
        return result.rows[0];
    }
    catch (err) {
        console.error('Error updating project:', err);
        throw err;
    }
};
