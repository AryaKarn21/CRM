import PDFDocument from "pdfkit";

export const generatePayslipPDF = (payslip, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const employeeName = payslip.employee
    ? `${payslip.employee.firstName}-${payslip.employee.lastName}`
    : "Employee";
  const fileName = `Payslip-${employeeName}-${payslip.period.replace(/\s+/g, "")}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  doc.pipe(res);

  doc.fontSize(22).fillColor("#2563eb").text("OS GROUP CRM", { align: "center" });
  doc.moveDown(0.3).fontSize(16).fillColor("#111827").text("Payslip", { align: "center" });
  doc.moveDown();
  doc.strokeColor("#d1d5db").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(14).fillColor("#111827").text("Employee", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#374151")
    .text(`Name : ${payslip.employee ? `${payslip.employee.firstName} ${payslip.employee.lastName}` : "-"}`)
    .text(`Employee ID : ${payslip.employee?.employeeId || "-"}`)
    .text(`Pay Period : ${payslip.period}`);
  doc.moveDown();

  doc.fontSize(14).fillColor("#111827").text("Earnings & Deductions", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#374151")
    .text(`Basic Salary : NPR ${Number(payslip.basicSalary || 0).toLocaleString()}`)
    .text(`Allowances : NPR ${Number(payslip.allowances || 0).toLocaleString()}`)
    .text(`Gross Pay : NPR ${Number(payslip.grossPay || 0).toLocaleString()}`)
    .text(`Tax : NPR ${Number(payslip.tax || 0).toLocaleString()}`)
    .text(`Deductions : NPR ${Number(payslip.deductions || 0).toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(13).fillColor("#1P11827").text(
    `Net Pay : NPR ${Number(payslip.netPay || 0).toLocaleString()}`,
    { underline: true }
  );
  doc.moveDown(2);

  doc.strokeColor("#d1d5db").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
  doc.fontSize(9).fillColor("#6b7280")
    .text("This payslip was generated electronically by OS Group CRM Enterprise Platform.", { align: "center" });

  doc.end();
};