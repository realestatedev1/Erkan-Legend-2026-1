import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';

const PropertyPDF = ({ property }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price);
  };

  // Türkçe karakterleri ASCII'ye çevir
  const normalizeTurkish = (text) => {
    if (!text) return '';
    return text
      .replace(/İ/g, 'I')
      .replace(/ı/g, 'i')
      .replace(/Ş/g, 'S')
      .replace(/ş/g, 's')
      .replace(/Ğ/g, 'G')
      .replace(/ğ/g, 'g')
      .replace(/Ü/g, 'U')
      .replace(/ü/g, 'u')
      .replace(/Ö/g, 'O')
      .replace(/ö/g, 'o')
      .replace(/Ç/g, 'C')
      .replace(/ç/g, 'c');
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const generatePDF = async () => {
    setLoading(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 15;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(220, 38, 38);
      doc.text('LEGEND CITIES', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Emlak Ilani Detaylari', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Try to add property image
      if (property.images && property.images.length > 0) {
        try {
          let imageUrl = property.images[0];
          if (!imageUrl.startsWith('http')) {
            imageUrl = `${window.location.origin}${imageUrl}`;
          }
          
          const imageData = await loadImage(imageUrl);
          if (imageData) {
            // Add image centered, max width 170, maintain aspect ratio
            const imgWidth = 170;
            const imgHeight = 95;
            const xPos = (pageWidth - imgWidth) / 2;
            doc.addImage(imageData, 'JPEG', xPos, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;
          }
        } catch (imgError) {
          console.log('Could not load image:', imgError);
        }
      }

      // Horizontal line
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Property Title
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      const titleLines = doc.splitTextToSize(normalizeTurkish(property.title), pageWidth - 40);
      doc.text(titleLines, 20, yPos);
      yPos += titleLines.length * 6 + 5;

      // Price
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38);
      doc.text(`${formatPrice(property.price)} ${property.currency}`, 20, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(property.property_type === 'sale' ? 'Satilik' : 'Kiralik', 20, yPos);
      yPos += 10;

      // Location
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Konum', 20, yPos);
      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(normalizeTurkish(`${property.city}, ${property.district}${property.neighborhood ? ', ' + property.neighborhood : ''}`), 20, yPos);
      if (property.address) {
        yPos += 5;
        doc.text(normalizeTurkish(property.address), 20, yPos);
      }
      yPos += 10;

      // Property Details Box
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(20, yPos, pageWidth - 40, 35, 3, 3, 'F');
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const details = [];
      if (property.rooms) details.push(`Oda: ${property.rooms}`);
      if (property.area_gross) details.push(`Brut Alan: ${property.area_gross} m2`);
      if (property.area_net) details.push(`Net Alan: ${property.area_net} m2`);
      if (property.floor) details.push(`Kat: ${property.floor}`);
      if (property.total_floors) details.push(`Bina Kat: ${property.total_floors}`);
      if (property.age !== undefined && property.age !== null) details.push(`Bina Yasi: ${property.age === 0 ? 'Sifir' : property.age}`);
      if (property.heating) details.push(`Isitma: ${normalizeTurkish(property.heating)}`);
      if (property.bathrooms) details.push(`Banyo: ${property.bathrooms}`);

      const midPoint = Math.ceil(details.length / 2);
      const leftCol = details.slice(0, midPoint);
      const rightCol = details.slice(midPoint);

      leftCol.forEach((detail, index) => {
        doc.text(normalizeTurkish(detail), 30, yPos + (index * 6));
      });

      rightCol.forEach((detail, index) => {
        doc.text(normalizeTurkish(detail), pageWidth / 2 + 10, yPos + (index * 6));
      });

      yPos += Math.max(leftCol.length, rightCol.length) * 6 + 12;

      // Features
      if (property.features && property.features.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Ozellikler', 20, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        
        const featuresPerRow = 3;
        const featureWidth = (pageWidth - 40) / featuresPerRow;
        
        property.features.forEach((feature, index) => {
          const col = index % featuresPerRow;
          const row = Math.floor(index / featuresPerRow);
          doc.text(`* ${normalizeTurkish(feature)}`, 20 + (col * featureWidth), yPos + (row * 5));
        });
        
        yPos += Math.ceil(property.features.length / featuresPerRow) * 5 + 8;
      }

      // Description
      if (property.description) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Aciklama', 20, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(normalizeTurkish(property.description), pageWidth - 40);
        doc.text(descLines.slice(0, 8), 20, yPos);
        yPos += Math.min(descLines.length, 8) * 4 + 8;
      }

      // Additional Info
      const additionalInfo = [];
      if (property.credit_eligible) additionalInfo.push('Krediye Uygun');
      if (property.exchange) additionalInfo.push('Takasa Acik');
      if (property.in_complex) additionalInfo.push('Site Icinde');
      if (property.elevator) additionalInfo.push('Asansor');
      if (property.parking) additionalInfo.push(`Otopark: ${normalizeTurkish(property.parking)}`);
      if (property.security) additionalInfo.push('Guvenlik');
      if (property.pool) additionalInfo.push('Havuz');

      if (additionalInfo.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(34, 139, 34);
        doc.text(normalizeTurkish(additionalInfo.join(' | ')), 20, yPos);
        yPos += 10;
      }

      // Footer
      doc.setDrawColor(220, 38, 38);
      doc.line(20, doc.internal.pageSize.getHeight() - 20, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Legend Cities - ${new Date().toLocaleDateString('tr-TR')}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 14, { align: 'center' });
      doc.text(`${window.location.origin}/properties/${property.id}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 9, { align: 'center' });

      // Save PDF
      doc.save(`ilan-${property.id}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(t('pdf.error', 'PDF oluşturulurken bir hata oluştu'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      title={t('pdf.download', 'PDF İndir')}
    >
      {loading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      <span>PDF {t('pdf.download', 'İndir')}</span>
    </button>
  );
};

export default PropertyPDF;
