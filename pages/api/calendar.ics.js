import { COURSES, RAW_SCHEDULE, TIME_SLOTS, TERM } from '../../lib/timetable';

function formatICSDate(dateStr, timeStr) {
  // dateStr: "2026-06-22", timeStr: "08:45"
  const [y, m, d] = dateStr.split('-');
  const [hh, mm] = timeStr.split(':');
  return `${y}${m}${d}T${hh}${mm}00`;
}

function escapeICS(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export default function handler(req, res) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TAPMI Scheduler//T-MINUS//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(TERM.name + ' · ' + TERM.batch)}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
    'X-WR-CALDESC:TAPMI MBA-IB Term 1 Schedule (auto-generated)',
  ];

  RAW_SCHEDULE.forEach(row => {
    const dateStr = row[0];
    TIME_SLOTS.forEach((slot, i) => {
      const cell = row[i + 1];
      if (!cell) return;

      let summary, description;
      if (cell === 'INDUCTION') {
        summary = 'Induction Activity';
        description = 'TAPMI Induction · FF 33, K.K. Pai Block';
      } else {
        const [courseKey, sn] = cell.split('-');
        const course = COURSES[courseKey];
        if (!course) return;
        summary = `${course.name} (S${sn})`;
        description = `${course.faculty} · Session ${sn} · FF 33, K.K. Pai Block`;
      }

      const uid = `${dateStr}-${slot.id}-tapmi-2026@scheduler`;
      const dtstart = formatICSDate(dateStr, slot.start);
      const dtend   = formatICSDate(dateStr, slot.end);
      const now = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;TZID=Asia/Kolkata:${dtstart}`,
        `DTEND;TZID=Asia/Kolkata:${dtend}`,
        `SUMMARY:${escapeICS(summary)}`,
        `DESCRIPTION:${escapeICS(description)}`,
        `LOCATION:${escapeICS('FF 33\\, K.K. Pai Block\\, TAPMI\\, Manipal')}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      );
    });
  });

  lines.push('END:VCALENDAR');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="tapmi-term1.ics"');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(lines.join('\r\n'));
}
