import { jsPDF } from 'jspdf';

export const BRAND_TEAL = [0, 102, 102];
export const BRAND_TINT = [240, 248, 248];
export const ORGANISATION_LINES = [
  'MFUKO WA MAENDELEO YA JAMII (TASAF III)',
  'MPANGO WA KUNUSURU KAYA MASIKINI',
];

export const LOGO_TASAF = ['/front/tasafMIS.png', '/tasafMIS.png'];
export const LOGO_GOVERNMENT = ['/front/bibiNabwana.png', '/bibiNabwana.png'];

export function createProtectedPdf(options = {}) {
  const baseOptions = {
    orientation: 'portrait', unit: 'mm', format: 'a4', ...options,
  };
  try {
    return new jsPDF({
      ...baseOptions,
      encryption: {
        userPassword: '',
        ownerPassword: `tasafmis-${Date.now()}`,
        userPermissions: ['print'],
      },
    });
  } catch (e) {
    return new jsPDF(baseOptions);
  }
}

const getImageFormat = (mimeType) => {
  const normalized = (mimeType || '').toLowerCase();
  if (normalized.includes('png')) return 'PNG';
  if (normalized.includes('jpeg') || normalized.includes('jpg')) return 'JPEG';
  if (normalized.includes('webp')) return 'WEBP';
  return null;
};

export async function loadImageAsset(paths) {
  for (const path of paths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(path);
      if (response.ok) {
        const format = getImageFormat(response.headers.get('content-type') || '');
        if (!format) continue;
        // eslint-disable-next-line no-await-in-loop
        const blob = await response.blob();
        // eslint-disable-next-line no-await-in-loop
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return { data, format };
      }
    } catch (e) {
    }
  }
  return null;
}

export const loadTasafLogo = () => loadImageAsset(LOGO_TASAF);
export const loadGovernmentLogo = () => loadImageAsset(LOGO_GOVERNMENT);

export function drawHeader({
  doc, pageWidth, margin, rightLogo, leftLogo, title,
  organisationLines = ORGANISATION_LINES,
}) {
  const headerHeight = 40;
  doc.setFillColor(...BRAND_TEAL);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  if (leftLogo) {
    try {
      doc.addImage(leftLogo.data, leftLogo.format, margin, 8, 24, 24);
    } catch (error) {
      console.warn('Failed to add government logo to PDF header:', error);
    }
  }
  if (rightLogo) {
    try {
      doc.addImage(rightLogo.data, rightLogo.format, pageWidth - margin - 33, 6, 33, 28);
    } catch (error) {
      console.warn('Failed to add TASAF logo to PDF header:', error);
    }
  }

  const centerX = pageWidth / 2;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont(undefined, 'bold');
  doc.text(organisationLines[0], centerX, 12, { align: 'center' });
  doc.setFontSize(11);
  doc.text(organisationLines[1], centerX, 18, { align: 'center' });
  if (title) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(title, centerX, 24, { align: 'center' });
  }
  doc.setTextColor(0, 0, 0);
  return headerHeight;
}

export function addWatermark(doc, logo, pageWidth, pageHeight) {
  if (!logo) return;
  const logoWidth = 150;
  const logoHeight = 130;
  doc.setGState(new doc.GState({ opacity: 0.07 }));
  doc.addImage(
    logo.data,
    logo.format,
    (pageWidth - logoWidth) / 2,
    (pageHeight - logoHeight) / 2,
    logoWidth,
    logoHeight,
  );
  doc.setGState(new doc.GState({ opacity: 1 }));
}

export function addFooter(doc, pageWidth, pageHeight) {
  const { pageNumber } = doc.getCurrentPageInfo();
  doc.setDrawColor(...BRAND_TEAL);
  doc.line(12, pageHeight - 10, pageWidth - 12, pageHeight - 10);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Page ${pageNumber} of ${doc.getNumberOfPages()}`,
    pageWidth - 12,
    pageHeight - 5,
    { align: 'right' },
  );
}

export function drawMetadataBoxes({
  doc, margin, pageWidth, startY, items = [],
}) {
  if (!items.length) return startY;
  const contentWidth = pageWidth - (margin * 2);
  const gap = 3;
  const boxHeight = 14;
  const boxWidth = (contentWidth - (gap * (items.length - 1))) / items.length;

  let x = margin;
  items.forEach((item) => {
    doc.setFillColor(...BRAND_TINT);
    doc.rect(x, startY, boxWidth, boxHeight, 'F');
    doc.setDrawColor(...BRAND_TEAL);
    doc.rect(x, startY, boxWidth, boxHeight);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(item.label, x + 2, startY + 5);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const valueLines = doc.splitTextToSize(String(item.value ?? '-'), boxWidth - 4);
    doc.text(valueLines[0] || '-', x + 2, startY + 11);
    x += boxWidth + gap;
  });
  return startY + boxHeight;
}

export const brandedTableTheme = {
  headStyles: { fillColor: BRAND_TEAL, textColor: 255, fontStyle: 'bold' },
  alternateRowStyles: { fillColor: BRAND_TINT },
  styles: { fontSize: 8, cellPadding: 1.5 },
};
