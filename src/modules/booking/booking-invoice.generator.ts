import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { differenceInCalendarDays, format } from 'date-fns'
import * as fs from 'fs'
import * as path from 'path'

// Helper function to convert numeric amount to Indian Rupee Words
function amountToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only'
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ]
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ]

  const numStr = Math.floor(amount).toString()
  if (numStr.length > 9) return 'Amount too large'

  const paddedStr = ('000000000' + numStr).slice(-9)
  const match = paddedStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
  if (!match) return ''

  const getGroupText = (str: string) => {
    const n = Number(str)
    if (n === 0) return ''
    if (n < 20) return a[n]
    return b[Number(str[0])] + (str[1] !== '0' ? ' ' + a[Number(str[1])] : '')
  }

  let str = ''
  if (Number(match[1]) !== 0) str += getGroupText(match[1]) + ' Crore '
  if (Number(match[2]) !== 0) str += getGroupText(match[2]) + ' Lakh '
  if (Number(match[3]) !== 0) str += getGroupText(match[3]) + ' Thousand '
  if (Number(match[4]) !== 0) str += getGroupText(match[4]) + ' Hundred '
  if (Number(match[5]) !== 0)
    str += (str !== '' ? 'and ' : '') + getGroupText(match[5])

  return str.trim() + ' Rupees Only'
}

function getPngDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24) return null
  const width = buffer.readInt32BE(16)
  const height = buffer.readInt32BE(20)
  return { width, height }
}

function getJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  let i = 0
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null
  i += 2
  while (i < buffer.length) {
    while (buffer[i] === 0xff) i++
    const marker = buffer[i]
    i++
    if (marker === 0xd9 || marker === 0xda) break
    const length = buffer.readUInt16BE(i)
    if (marker >= 0xc0 && marker <= 0xc3) {
      const height = buffer.readUInt16BE(i + 4)
      const width = buffer.readUInt16BE(i + 6)
      return { width, height }
    }
    i += length
  }
  return null
}

function getImageDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return getPngDimensions(buffer)
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return getJpegDimensions(buffer)
  }
  return null
}

const getRoomStayNights = (item: any, f: any, p: any) => {
  const bookingCheckInDate = new Date(f.checkInDate)
  const bookingCheckOutDate = new Date(f.checkOutDate)

  const checkOutTimeStr = format(bookingCheckOutDate, 'HH:mm:ss')
  
  // Parse checkOutTime from settings if it's a JSON string or object
  const propertySettings = (() => {
    if (!p.settings) return null
    try {
      return typeof p.settings === 'string' ? JSON.parse(p.settings) : p.settings
    } catch {
      return null
    }
  })()

  const propCheckOutTime = propertySettings?.checkoutTime
    ? `${propertySettings.checkoutTime}:00`
    : (p.checkOutTime || '07:00:00')

  const itemCheckIn = item.checkInDate ? new Date(item.checkInDate) : bookingCheckInDate
  const itemCheckOut = item.checkOutDate ? new Date(item.checkOutDate) : bookingCheckOutDate

  let roomNights = differenceInCalendarDays(itemCheckOut, itemCheckIn)

  if (checkOutTimeStr > propCheckOutTime) {
    roomNights += 1
  }
  if (f.waiveLastDayCharge) {
    roomNights -= 1
  }

  return Math.max(1, roomNights)
}

export async function generateInvoiceBuffer(booking: any): Promise<Buffer> {
  const doc = new jsPDF({
    format: 'a4',
    compress: true,
  })

  const margin = 15
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let currentY = 15

  const property = booking.Property
  const assignments = booking.BookingRoom || []
  const services = booking.BookingService || []
  const payments = booking.Payment || []

  // Parse checkOutTime from settings if it's a JSON string or object
  const propertySettings = (() => {
    if (!property.settings) return null
    try {
      return typeof property.settings === 'string' ? JSON.parse(property.settings) : property.settings
    } catch {
      return null
    }
  })()

  // --- Calculate Totals ---
  const bookingCheckInDate = new Date(booking.checkInDate)
  const bookingCheckOutDate = new Date(booking.checkOutDate)

  const checkOutTimeStr = format(bookingCheckOutDate, 'HH:mm:ss')
  const propCheckOutTime = propertySettings?.checkoutTime
    ? `${propertySettings.checkoutTime}:00`
    : (property.checkOutTime || '07:00:00')

  let defaultNights = differenceInCalendarDays(bookingCheckOutDate, bookingCheckInDate)
  if (checkOutTimeStr > propCheckOutTime) {
    defaultNights += 1
  }
  if (booking.waiveLastDayCharge) {
    defaultNights -= 1
  }
  defaultNights = Math.max(1, defaultNights)

  const totalRoomCharges = assignments.reduce((sum: number, item: any) => {
    const roomNights = getRoomStayNights(item, booking, property)
    const price = Number(item.priceOverride) || Number(item.RoomType?.defaultPrice) || 0
    return sum + (price * roomNights)
  }, 0)

  const serviceSubtotal = services.reduce(
    (sum: number, item: any) => sum + Number(item.totalPrice),
    0,
  )
  const subtotal = totalRoomCharges + serviceSubtotal
  const discount =
    booking.discountType === 'PERCENTAGE'
      ? subtotal * (Number(booking.discountAmount) / 100)
      : Number(booking.discountAmount || 0)

  const showTax = propertySettings?.defaultTaxEnabled !== false
  const tax = showTax
    ? (subtotal - discount) * ((propertySettings?.taxAmount ?? property.taxPercentage ?? 0) / 100)
    : 0
  const grandTotal = subtotal - discount + tax

  const totalPaid = payments
    .filter((p: any) => ['PAID', 'PARTIAL'].includes(p.status || ''))
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  const balance = Math.max(0, grandTotal - totalPaid)

  // --- 1. Header Block ---
  try {
    // Left: Our Logo (local assets/logo_large.png)
    const logoPath = path.join(__dirname, 'assets', 'logo_large.png')
    if (fs.existsSync(logoPath)) {
      const logoBase64 = fs.readFileSync(logoPath).toString('base64')
      doc.addImage(logoBase64, 'PNG', margin, currentY, 80, 30, undefined, 'FAST')
    } else {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text('TRAVELS PURI 13', margin, currentY + 10)
    }

    // Right: Property Logo (if available, fetched over network)
    if (property.logoUrl) {
      try {
        const response = await fetch(property.logoUrl)
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const contentType = response.headers.get('content-type') || 'image/png'
          const formatType = contentType.includes('jpeg') || contentType.includes('jpg') ? 'JPEG' : 'PNG'
          const propLogoBase64 = buffer.toString('base64')

          const dimensions = getImageDimensions(buffer)
          const maxLogoWidth = 50
          const maxLogoHeight = 30

          let finalLogoWidth = dimensions?.width || 100
          let finalLogoHeight = dimensions?.height || 60

          const ratio = Math.min(maxLogoWidth / finalLogoWidth, maxLogoHeight / finalLogoHeight)

          finalLogoWidth = finalLogoWidth * ratio
          finalLogoHeight = finalLogoHeight * ratio

          doc.addImage(
            propLogoBase64,
            formatType,
            pageWidth - margin - finalLogoWidth,
            currentY + (maxLogoHeight - finalLogoHeight) / 2,
            finalLogoWidth,
            finalLogoHeight,
            undefined,
            'FAST',
          )
        }
      } catch (e) {
        console.error('Property logo load error', e)
      }
    }
  } catch (e) {
    console.error('Logo error', e)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text('TRAVELS PURI 13', margin, currentY + 10)
  }

  currentY += 35

  // Property Details
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59) // Slate-800
  doc.text(property.name.toUpperCase(), pageWidth / 2, currentY, {
    align: 'center',
  })

  currentY += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105) // Slate-600
  doc.text(
    property.address || 'Address not available',
    pageWidth / 2,
    currentY,
    { align: 'center' },
  )

  currentY += 5
  const contactInfo = [
    property.phone && `Ph: ${property.phone}`,
    property.email && `Email: ${property.email}`,
  ]
    .filter(Boolean)
    .join(' | ')
  doc.text(contactInfo, pageWidth / 2, currentY, { align: 'center' })

  // INVOICE label
  currentY += 5
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', margin, currentY)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(
    `DATE: ${format(new Date(), 'dd/MM/yyyy')}`,
    pageWidth - margin,
    currentY,
    { align: 'right' },
  )

  // --- 2. Booking Guest Details ---
  currentY += 10
  doc.setFillColor(248, 250, 252) // Slate-50
  doc.rect(margin, currentY, pageWidth - margin * 2, 45, 'F')

  currentY += 8
  const col1 = margin + 5
  const col2 = pageWidth / 2 + 10
  const labelW = 28

  const drawDetail = (label: string, value: string, x: number, y: number, isWrapped = false) => {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text(label, x, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 41, 59)

    const valStr = String(value || 'N/A')
    if (isWrapped) {
      const maxWidth = (pageWidth / 2) - margin - labelW
      const lines = doc.splitTextToSize(valStr, maxWidth)
      doc.text(lines, x + labelW, y)
      return lines.length
    } else {
      doc.text(valStr, x + labelW, y)
      return 1
    }
  }

  drawDetail('Guest Name:', booking.Guest.name, col1, currentY)
  const gstin = booking.Guest?.gstin
  if (gstin) {
    currentY += 7
    drawDetail('GSTIN:', gstin, col1, currentY)
  }

  drawDetail(
    'Invoice ID:',
    `#${booking.id.toUpperCase().slice(0, 8)}`,
    col2,
    currentY,
  )

  currentY += 7
  drawDetail('Phone:', booking.Guest?.phone ?? '', col1, currentY)
  drawDetail('Channel:', booking.source || 'Direct', col2, currentY)

  currentY += 7
  const addressLinesCount = drawDetail('Address:', booking.Guest?.address || 'N/A', col1, currentY, true)
  drawDetail(
    'Check-In:',
    format(new Date(booking.checkInDate), 'dd MMM yyyy, hh:mm a'),
    col2,
    currentY,
  )

  if (addressLinesCount > 1) {
    currentY += (addressLinesCount - 1) * 5
  }

  currentY += 7
  drawDetail(
    'Guests:',
    `${booking.adults} Adults, ${booking.children} Children`,
    col1,
    currentY,
  )
  drawDetail(
    'Check-Out:',
    format(new Date(booking.checkOutDate), 'dd MMM yyyy, hh:mm a'),
    col2,
    currentY,
  )

  currentY += 7
  drawDetail('Total Rooms:', `${assignments.length}`, col1, currentY)

  currentY += 15

  // --- 3. Charges & Services ---
  doc.setFont('helvetica', 'bold')
  doc.text('CHARGES & SERVICES', margin, currentY)
  currentY += 7
  const chargesData: Array<string[]> = []

  assignments.forEach((a: any) => {
    const roomNights = getRoomStayNights(a, booking, property)
    const itemCheckIn = a.checkInDate ? new Date(a.checkInDate) : new Date(booking.checkInDate)
    const itemCheckOut = a.checkOutDate ? new Date(a.checkOutDate) : new Date(booking.checkOutDate)
    const datesStr = `${format(itemCheckIn, 'dd MMM yyyy')} - ${format(itemCheckOut, 'dd MMM yyyy')}`
    const roomNum = a.Room?.roomNumber || 'N/A'
    const roomType = a.RoomType?.name || 'Standard'
    const rate = Number(a.priceOverride) || Number(a.RoomType?.defaultPrice) || 0
    const total = rate * roomNights

    chargesData.push([
      `Room ${roomNum} (${roomType}) - ${roomNights} Night(s) [${datesStr}] @ INR ${rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}/night`,
      `INR ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ])
  })

  services.forEach((s: any) => {
    chargesData.push([
      `${s.Service?.name || 'Service'} (Price: ${Number(s.totalPrice).toLocaleString()} x Qty: ${s.quantity})`,
      `INR ${Number(s.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ])
  })

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Amount']],
    body: chargesData,
    theme: 'striped',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 10

  // --- 4. Totals Section ---
  doc.setFillColor(248, 250, 252)
  doc.rect(margin, currentY, pageWidth - margin * 2, 45, 'F')

  currentY += 8
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Amount in Words:', margin + 5, currentY)
  doc.setFont('helvetica', 'normal')
  doc.text(amountToWords(grandTotal), margin + 5, currentY + 5, {
    maxWidth: 80,
  })

  const totalColX = pageWidth - margin - 60
  const totalValX = pageWidth - margin - 5

  const drawTotalRow = (
    label: string,
    value: number,
    y: number,
    isBold = false,
  ) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setTextColor(isBold ? 0 : 70)
    doc.text(label, totalColX, y)
    doc.text(
      `INR ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      totalValX,
      y,
      { align: 'right' },
    )
  }

  drawTotalRow('Sub Total:', subtotal, currentY)
  if (discount > 0) {
    drawTotalRow('Discount:', discount, currentY + 6)
  }
  if (tax > 0 || showTax) {
    drawTotalRow(`Tax (${propertySettings?.taxAmount ?? property.taxPercentage}%):`, tax, currentY + 12)
  }

  currentY += 18
  doc.setDrawColor(203, 213, 225)
  doc.line(totalColX, currentY - 5, totalValX, currentY - 5)

  drawTotalRow('Grand Total:', grandTotal, currentY, true)
  drawTotalRow('Paid Amount:', totalPaid, currentY + 6)
  if (balance > 0) {
    drawTotalRow('Balance Due:', balance, currentY + 12, true)
  }

  currentY += 25

  // --- 5. Payment Breakup ---
  if (payments.length > 0) {
    if (currentY > pageHeight - 60) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT BREAKUP', margin, currentY)
    currentY += 5

    const paymentData = payments.map((p: any) => [
      format(new Date(p.createdAt ?? ''), 'dd MMM yyyy, hh:mm a'),
      p.method || 'N/A',
      `#${p.id.slice(0, 8).toUpperCase()}`,
      `INR ${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Date & Time', 'Payment Mode', 'Reference ID', 'Amount']],
      body: paymentData,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
    })
    currentY = (doc as any).lastAutoTable.finalY + 25
  } else {
    currentY += 10
  }

  // Footer / Signatures
  if (currentY > pageHeight - 40) {
    doc.addPage()
    currentY = 30
  }

  doc.setDrawColor(203, 213, 225)
  doc.line(margin, currentY, margin + 50, currentY)
  doc.line(pageWidth - margin - 50, currentY, pageWidth - margin, currentY)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Guest Signature', margin + 10, currentY + 5)
  doc.text('Authorized Signatory', pageWidth - margin - 45, currentY + 5)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(148, 163, 184)
  doc.text('TravelsPuri13 v1.2', pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })

  const pdfArrayBuffer = doc.output('arraybuffer')
  return Buffer.from(pdfArrayBuffer)
}
