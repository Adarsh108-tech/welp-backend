import express from 'express';
import { generateNotesForSyllabus } from '../services/openaiService.mjs';
import { createPdfFromNotes } from '../services/pdfService.mjs';


const router = express.Router();

function parseSyllabus(syllabus) {
  return syllabus
    .split(/[\n,.]/)              // split on both newlines and commas
    .map(topic => topic.trim()) // trim spaces
    .filter(topic => topic !== ''); // remove empty entries
}

router.post('/generate', async (req, res) => {
  try {
    const { syllabus } = req.body;
    const topics = parseSyllabus(syllabus);

    const notes = [];

    for (const topic of topics) {
      const noteText = await generateNotesForSyllabus(topic); // already returns .content
      notes.push({ topic, content: noteText });
    }

    const pdfBuffer = await createPdfFromNotes(notes);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="notes.pdf"',
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ Error generating notes:", err.message || err);
    res.status(500).send('Failed to generate notes');
  }
});

export default router;
