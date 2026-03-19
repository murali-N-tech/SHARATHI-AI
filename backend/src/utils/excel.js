import ExcelJS from 'exceljs';

export const exportToExcel = async (req, res) => {
  const { domainId } = req.params;
  const sessions = await Session.find({ domainId });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Student Performance');

  worksheet.columns = [
    { header: 'Student Email', key: 'email', width: 30 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Date', key: 'date', width: 20 },
  ];

  sessions.forEach(s => {
    worksheet.addRow({
      email: s.email,
      score: s.payload.score,
      date: s.attemptedAt.toISOString()
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=performance.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};