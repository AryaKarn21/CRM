import PDFDocument from "pdfkit";

export const generateExpensePDF = (expense, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const fileName = `Expense-${expense.expenseNo || expense.id}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName}"`
  );

  doc.pipe(res);

  /* Header */
  doc.fontSize(22).fillColor("#2563eb").text("OS GROUP CRM", { align: "center" });
  doc.moveDown(0.3).fontSize(16).fillColor("#111827").text("Expense Report", { align: "center" });
  doc.moveDown();
  doc.strokeColor("#d1d5db").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  /* Company */
  doc.fontSize(14).fillColor("#111827").text("Company Information", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#374151")
    .text(`Company : ${expense.company?.name || "-"}`)
    .text(`Generated : ${new Date().toLocaleString()}`);
  doc.moveDown();

  /* Expense */
  doc.fontSize(14).fillColor("#111827").text("Expense Details", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#374151")
    .text(`Expense No : ${expense.expenseNo || "-"}`)
    .text(`Category : ${expense.category || "-"}`)
    .text(`Amount : NPR ${Number(expense.amount || 0).toLocaleString()}`)
    .text(`Status : ${expense.status || "-"}`)
    .text(`Expense Date : ${expense.date ? new Date(expense.date).toLocaleDateString() : "-"}`);
  doc.moveDown();

  /* Employee */
  doc.fontSize(14).fillColor("#111827").text("Employee", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#374151")
    .text(`Submitted By : ${expense.submittedBy?.name || "-"}`);

  if (expense.approvedBy) {
    doc.text(`Approved By : ${expense.approvedBy.name}`);
  }

  if (expense.approvedAt) {
    doc.text(`Approved On : ${new Date(expense.approvedAt).toLocaleString()}`);
  }

  doc.moveDown();

  /* Description */
  doc.fontSize(14).fillColor("#111827").text("Description", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#374151")
    .text(expense.description || "No description provided.", { width: 480 });

  doc.moveDown(2);

  /* Footer */
  doc.strokeColor("#d1d5db").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
  doc.fontSize(9).fillColor("#6b7280")
    .text("This report was generated electronically by OS Group CRM Enterprise Platform.", { align: "center" });

  doc.end();
};