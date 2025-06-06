// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const path = require('path');

// const { fetchRSSFeeds, filterArticles } = require('./rss');
// const { summarizeArticles } = require('./summarize');
// const { generatePDF } = require('./generatePDF');

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.static('reports'));

// app.post('/generate-report', async (req, res) => {
//   const { country, organization, keywords } = req.body;

//   try {
//     const articles = await fetchRSSFeeds(country, keywords);
//     const filtered = filterArticles(articles, country, keywords);
//     const summary = await summarizeArticles(filtered, country, organization);
//     const filename = `${country}_${organization}_${Date.now()}.pdf`;
//     const filepath = path.join('reports', filename);

//     generatePDF(summary, filepath);
//     res.json({ message: 'Report ready', reportPath: filename });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to generate report' });
//   }
// });

// app.listen(3001, () => console.log('Server running on http://localhost:3001'));
