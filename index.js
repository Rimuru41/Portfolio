import express from 'express';
import { dirname, sep } from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import bcrypt from 'bcrypt';
import pool from './db/connect.js';
import { add_project, delete_project, update_project } from './models/manager.js';
const __dirname = fileURLToPath(dirname(import.meta.url));

const app = express();
const cfg = {
    port: process.env.PORT,
    dir: {
        root: __dirname,
        static: __dirname + sep + 'static',
        views: __dirname + sep + 'views',

    }
}

app.use(express.static(cfg.dir.static))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', cfg.dir.views);

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'whatever',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Auth middleware
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized' });
}

app.get('/', async (req, res) => {
    try {
        const resultProjs = await pool.query('SELECT * FROM projects ORDER BY id ASC');
        const resultExp = await pool.query('SELECT * FROM experience ORDER BY id ASC');
        const resultAchv = await pool.query('SELECT * FROM achievements ORDER BY id ASC');

        const projects = resultProjs.rows;
        const experience = resultExp.rows;
        const achievements = resultAchv.rows;
        const isAdmin = req.session?.isAdmin || false;

        res.render('projects', { projects, experience, achievements, isAdmin });

    }
    catch (err) {
        console.error('Error fetching data:', err);
        res.send("Error fetching data from database");

    }
})

// Skills API - GET all skills
app.get('/api/skills', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, skill_name FROM skills ORDER BY id');
        const skills = result.rows;
        res.json({ skills });
    }
    catch (err) {
        console.error('Error fetching skills:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST - Add new skill (protected)
app.post('/api/skills', requireAdmin, async (req, res) => {
    try {
        const { skill_name } = req.body;
        const result = await pool.query('INSERT INTO skills (skill_name) VALUES ($1) RETURNING *', [skill_name]);
        res.json({ success: true, skill: result.rows[0] });
    } catch (err) {
        console.error('Error adding skill:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE - Delete skill (protected)
app.delete('/api/skills/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM skills WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting skill:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        req.session.isAdmin = true;
        res.json({ success: true });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

// POST - Add new project (protected)
app.post('/api/projects', requireAdmin, async (req, res) => {
    try {
        const project = await add_project(req.body);
        res.json({ success: true, project });
    } catch (err) {
        console.error('Error adding project:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT - Update project (protected)
app.put('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const project = await update_project(id, req.body);
        res.json({ success: true, project });
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE - Delete project (protected)
app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await delete_project(id);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get((req, res) => {
    res.status(404).render('404');
})
// Change this:
app.listen(cfg.port, "0.0.0.0", () => {
    console.log(`Server is running on port ${cfg.port}`);
});
