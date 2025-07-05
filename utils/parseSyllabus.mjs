export function parseSyllabus(syllabus) {
  return syllabus.split('\n').filter(t => t.trim() !== '');
}
