require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/database');
const Report = require('./models/Report');

const { fetchRSSFeeds, filterArticles } = require('./server/rss');
const { summarizeArticles } = require('./server/summarize');
const { generatePDF } = require('./server/generatePDF');
const { getFirstTwoLines } = require('./server/pdfReader');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('reports'));

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit if we can't connect to the database
  }
};

// Initialize database before starting the server
initializeDatabase();

app.post('/generate-report', async (req, res) => {
    const { country, organization, keywords } = req.body;
  
    try {
      const articles = await fetchRSSFeeds(country, keywords);
      const filtered = filterArticles(articles, country, keywords);
      const summary = await summarizeArticles(filtered, country, organization);
      const filename = `${country}_${organization}_${Date.now()}.pdf`;
      const filepath = path.join('reports', filename);
      await generatePDF(summary, filepath);

      // Save report data to database
      const report = await Report.create({
        country,
        organization,
        keywords,
        reportPath: filename
      });

      res.json({ 
        message: 'Report ready', 
        reportPath: filename,
        reportId: report.id 
      });
    } catch (err) {
      console.error('Error generating report:', err);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

app.get('/recent-reports', async (req, res) => {
  try {
    // Get total count of reports
    const totalReports = await Report.count();

    // Get count of unique countries
    const uniqueCountries = await Report.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('country')), 'country']],
      raw: true
    });
    const totalCountries = uniqueCountries.length;

    // Get 5 most recent reports
    const recentReports = await Report.findAll({
      attributes: ['id', 'country', 'organization', 'reportPath', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      message: 'Recent reports retrieved successfully',
      totalReports: totalReports,
      totalCountries: totalCountries,
      reports: recentReports
    });
  } catch (err) {
    console.error('Error fetching recent reports:', err);
    res.status(500).json({ error: 'Failed to fetch recent reports' });
  }
});

app.get('/all-reports', async (req, res) => {
    try {
        const reports = await Report.findAll({
            attributes: ['id', 'country', 'organization', 'reportPath', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        const detailedReports = await Promise.all(reports.map(async (report) => {
            const pdfPath = path.join(__dirname, 'reports', report.reportPath);
            const previewText = await getFirstTwoLines(pdfPath);
            
            return {
                id: report.id,
                country: report.country,
                organization: report.organization,
                generatedDate: report.createdAt,
                reportPath: report.reportPath,
                previewText: previewText
            };
        }));

        res.json({
            message: 'All reports retrieved successfully',
            reports: detailedReports
        });
    } catch (err) {
        console.error('Error fetching all reports:', err);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

app.get('/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(__dirname, 'reports', filename);
        
        // Check if file exists
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        // Stream the file
        const fileStream = fs.createReadStream(filepath);
        fileStream.pipe(res);
    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));