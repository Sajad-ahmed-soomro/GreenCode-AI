const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

app.post('/analyze', async (req, res) => {
    const { code, language, filePath } = req.body;
    
    try {
        // Call your existing analyzers
        const issues = await analyzeWithAllTools(code, language, filePath);
        res.json({ issues });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`GreenCode API running on port ${port}`);
});