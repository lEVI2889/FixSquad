const pool = require('../config/db');
const PDFDocument = require('pdfkit');

exports.downloadInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Verify user is part of the booking and it is completed
    const [bookings] = await pool.query(`
      SELECT b.*, s.name as service_name, c.name as customer_name, p.name as provider_name 
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users c ON b.customer_id = c.id
      JOIN users p ON b.provider_id = p.id
      WHERE b.id = ? AND (b.customer_id = ? OR b.provider_id = ?)
    `, [bookingId, userId, userId]);

    if (bookings.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized or booking not found.' });
    }

    const booking = bookings[0];

    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Invoices are only available for completed bookings.' });
    }

    // Check if invoice exists, if not create one
    let [invoices] = await pool.query('SELECT * FROM invoices WHERE booking_id = ?', [bookingId]);
    let invoice;
    if (invoices.length === 0) {
      const amount = booking.total_price;
      const [result] = await pool.query(
        'INSERT INTO invoices (booking_id, amount) VALUES (?, ?)',
        [bookingId, amount]
      );
      invoice = { id: result.insertId, booking_id: bookingId, amount, issued_at: new Date() };
    } else {
      invoice = invoices[0];
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-disposition', `attachment; filename=FixSquad_Receipt_${bookingId}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Header section
    doc.fillColor('#4338ca').fontSize(28).text('FixSquad', { align: 'left' });
    doc.fillColor('#64748b').fontSize(10).text('Reliable help for the homes and people of Bangladesh.', { align: 'left' });
    doc.moveDown(2);

    // Title
    doc.fillColor('#0f172a').fontSize(20).text('OFFICIAL RECEIPT', { align: 'right' });
    doc.moveUp(1);
    doc.fillColor('#334155').fontSize(12).text(`Receipt No: #${invoice.id.toString().padStart(5, '0')}`, { align: 'left' });
    doc.text(`Date Issued: ${new Date(invoice.issued_at).toLocaleDateString()}`);
    doc.moveDown(2);
    
    // Draw a separator line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e2e8f0').stroke();
    doc.moveDown(2);

    // Billing info (Two columns)
    const currentY = doc.y;
    doc.fontSize(14).fillColor('#0f172a').text('Billed To:', 50, currentY);
    doc.fontSize(12).fillColor('#475569').text(booking.customer_name, 50, currentY + 20);

    doc.fontSize(14).fillColor('#0f172a').text('Service Provider:', 300, currentY);
    doc.fontSize(12).fillColor('#475569').text(booking.provider_name, 300, currentY + 20);

    doc.moveDown(3);

    // Booking Details
    doc.fontSize(14).fillColor('#0f172a').text('Service Details', 50, doc.y);
    doc.moveDown(0.5);
    
    // Draw box for details
    const detailsY = doc.y;
    doc.rect(50, detailsY, 500, 80).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor('#334155').fontSize(12);
    doc.text(`Booking Ref: #${booking.id}`, 65, detailsY + 15);
    doc.text(`Service: ${booking.service_name}`, 65, detailsY + 35);
    doc.text(`Scheduled Date: ${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}`, 65, detailsY + 55);
    
    doc.moveDown(5);

    // Totals
    const totalY = doc.y;
    doc.rect(300, totalY, 250, 40).fillAndStroke('#eef2ff', '#c7d2fe');
    doc.fillColor('#4338ca').fontSize(16).font('Helvetica-Bold');
    doc.text(`Total Paid: ৳${Number(invoice.amount).toFixed(2)}`, 315, totalY + 13, { align: 'left' });

    doc.moveDown(5);

    // Footer
    doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('Thank you for using FixSquad!', 50, 700, { align: 'center' });
    doc.text('If you have any questions concerning this receipt, please contact support@fixsquad.com', { align: 'center' });

    doc.end();

  } catch (err) {
    console.error('Error generating invoice:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
