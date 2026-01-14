
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './shared/Button';
import { useTranslation } from '../hooks/useTranslation';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface FullReportProps {
  reading: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  chartData?: any; // Contains numerology or astrology engine data
}

const FullReport: React.FC<FullReportProps> = ({ reading, title, subtitle, imageUrl, chartData }) => {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- RENDERERS FOR ASTROLOGY CHARTS ---

  const renderPlanetaryTable = (planets: any[]) => (
      <div className="overflow-x-auto mb-8 bg-black/20 rounded border border-amber-500/20">
          <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-amber-900/40 text-amber-100 font-cinzel">
                  <tr>
                      <th className="p-2 border-b border-amber-500/20">Planet</th>
                      <th className="p-2 border-b border-amber-500/20">Rashi (Sign)</th>
                      <th className="p-2 border-b border-amber-500/20">Degree</th>
                      <th className="p-2 border-b border-amber-500/20">Nakshatra</th>
                      <th className="p-2 border-b border-amber-500/20">House</th>
                      <th className="p-2 border-b border-amber-500/20 text-center">Retro</th>
                  </tr>
              </thead>
              <tbody className="text-amber-200/80 font-mono">
                  {planets.map((p, i) => (
                      <tr key={i} className="hover:bg-amber-500/5">
                          <td className="p-2 border-b border-amber-500/10 font-bold">{p.name}</td>
                          <td className="p-2 border-b border-amber-500/10">{p.signName}</td>
                          <td className="p-2 border-b border-amber-500/10">
                              {Math.floor(p.normDegree)}°{Math.floor((p.normDegree % 1)*60)}'
                          </td>
                          <td className="p-2 border-b border-amber-500/10">{p.nakshatra} ({p.pada})</td>
                          <td className="p-2 border-b border-amber-500/10">{p.house}</td>
                          <td className="p-2 border-b border-amber-500/10 text-center text-red-400">
                              {p.isRetrograde ? 'R' : '-'}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderHouseTable = (houses: any[]) => (
      <div className="overflow-x-auto mb-8 bg-black/20 rounded border border-amber-500/20">
          <h4 className="text-sm font-bold text-amber-400 p-2 bg-amber-900/20">Bhava Chalit (House Analysis)</h4>
          <table className="w-full text-xs text-left">
              <thead className="text-amber-100/70 border-b border-amber-500/20">
                  <tr>
                      <th className="p-2">House</th>
                      <th className="p-2">Sign</th>
                      <th className="p-2">Lord</th>
                      <th className="p-2">Planets</th>
                      <th className="p-2">Type</th>
                      <th className="p-2 text-right">Strength</th>
                  </tr>
              </thead>
              <tbody className="text-amber-200/80">
                  {houses.map((h, i) => (
                      <tr key={i} className="border-b border-amber-500/10">
                          <td className="p-2 font-bold">{h.number}</td>
                          <td className="p-2">{h.signName}</td>
                          <td className="p-2">{h.lord}</td>
                          <td className="p-2 text-amber-300">{h.planets.join(', ') || '-'}</td>
                          <td className="p-2 opacity-60">{h.type}</td>
                          <td className="p-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-amber-500" style={{ width: `${h.strength}%` }}></div>
                                  </div>
                                  <span>{h.strength}%</span>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  // AUTHENTIC NORTH INDIAN DIAMOND CHART
  const renderVisualKundali = () => {
    if (!chartData || !chartData.planets) return null;

    // Coordinate System for North Indian Chart (0-100 grid)
    // H1=Top, H4=Right, H7=Bottom, H10=Left (Counter-Clockwise Logic for Signs, but fixed House Positions)
    // Standard North Indian:
    // Top Diamond: House 1
    // Top Left Triangle: House 2
    // Left Triangle: House 3
    // Bottom Center Diamond: House 4
    // Bottom Left Triangle: House 5
    // ...
    // Wait, the standard North Indian (Diamond) layout is:
    // Center Top: House 1 (Lagna)
    // Upper Left: House 2
    // Left: House 3
    // Lower Center: House 4
    // Lower Left: House 5?
    
    // Let's use the explicit coordinates for the 12 zones based on standard layout.
    // Fixed House Positions:
    const houses = [
        { id: 1, x: 50, y: 25 },   // Top Center
        { id: 2, x: 25, y: 12 },   // Top Left
        { id: 3, x: 12, y: 25 },   // Left Top
        { id: 4, x: 25, y: 50 },   // Left Center (Kendra 4)
        { id: 5, x: 12, y: 75 },   // Left Bottom
        { id: 6, x: 25, y: 88 },   // Bottom Left
        { id: 7, x: 50, y: 75 },   // Bottom Center (Kendra 7)
        { id: 8, x: 75, y: 88 },   // Bottom Right
        { id: 9, x: 88, y: 75 },   // Right Bottom
        { id: 10, x: 75, y: 50 },  // Right Center (Kendra 10)
        { id: 11, x: 88, y: 25 },  // Right Top
        { id: 12, x: 75, y: 12 },  // Top Right
    ];

    // Corner Labels for Signs (Placed at corners of houses)
    // H1 corners: Top(50,0), Left(25,25), Bottom(50,50), Right(75,25)
    // We place the Sign Number in the center of the house usually, or corner.
    // Standard: Sign Number is prominent.
    
    const ascSign = chartData.lagna.sign;

    return (
        <div className="flex flex-col items-center mb-8 break-inside-avoid">
            <h4 className="text-amber-400 font-cinzel font-bold mb-2 text-sm border-b border-amber-500/30 pb-1 w-full text-center">
                Lagna Kundali (D1)
            </h4>
            <div className="w-full max-w-[400px] aspect-square relative bg-[#0F0F23] border-2 border-amber-600 p-1 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/50">
                    {/* Frame */}
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    
                    {/* Diagonals (The Cross) */}
                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    
                    {/* The Diamond (Kendras) */}
                    <line x1="50" y1="0" x2="0" y2="50" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="100" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="100" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.5" />

                    {/* House Content */}
                    {houses.map(h => {
                        // Calculate Sign in this house
                        // House 1 has Lagna Sign. House 2 has Lagna + 1...
                        let currentSign = (ascSign + h.id - 1) % 12;
                        if (currentSign === 0) currentSign = 12;

                        const planetsInHouse = chartData.planets.filter((p: any) => p.house === h.id);
                        
                        return (
                            <g key={h.id}>
                                {/* Sign Number (Corner/subtle) */}
                                <text 
                                    x={h.x} 
                                    y={h.y + (h.id === 1 || h.id === 7 ? 15 : h.id === 4 || h.id === 10 ? 0 : 0)} // Offset logic complicated, keeping center for simplicity with small font offset
                                    dx={h.id === 1 ? 0 : h.id === 7 ? 0 : h.id === 4 ? 0 : 0}
                                    dy={h.id === 1 ? -18 : h.id === 7 ? 18 : 0}
                                    className="text-[4px] fill-amber-700/80 font-bold"
                                    textAnchor="middle"
                                >
                                    {currentSign}
                                </text>

                                {/* House Number (Tiny, gray) */}
                                {/* <text x={h.x} y={h.y} dy="-2" className="text-[2px] fill-gray-700" textAnchor="middle">{h.id}</text> */}

                                {/* Planets List */}
                                {planetsInHouse.map((p: any, i: number) => (
                                    <text 
                                        key={i}
                                        x={h.x} 
                                        y={h.y - ((planetsInHouse.length - 1) * 2) + (i * 4)} 
                                        className={`text-[3.5px] font-bold ${p.name === 'Sun' ? 'fill-yellow-400' : p.name === 'Moon' ? 'fill-white' : 'fill-amber-300'}`}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                    >
                                        {p.name.substring(0, 2)}{p.isRetrograde ? 'ᴿ' : ''}
                                    </text>
                                ))}
                                
                                {h.id === 1 && planetsInHouse.length === 0 && (
                                    <text x={h.x} y={h.y} className="text-[3px] fill-gray-500" textAnchor="middle">(Lagna)</text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="mt-2 text-xs text-amber-200/60 font-mono">
                Ascendant: {chartData.lagna.signName} | Nakshatra: {chartData.lagna.nakshatra}
            </div>
        </div>
    );
  };

  const renderAstroCharts = () => {
    if (!chartData || !chartData.planets) return null; // Check if it's astro data
    const { planets, houses, dasha, panchang, yogas } = chartData;

    return (
      <div className="space-y-8 mt-8 border-t border-amber-500/30 pt-8">
          
          {/* 1. VISUAL CHART */}
          {renderVisualKundali()}

          {/* 2. PANCHANG VALIDATION */}
          <div className="bg-amber-900/20 p-4 rounded border border-amber-500/30 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div><span className="text-gray-400 block">Tithi</span><span className="text-amber-100 font-bold">{panchang.tithi}</span></div>
              <div><span className="text-gray-400 block">Nakshatra</span><span className="text-amber-100 font-bold">{panchang.nakshatra}</span></div>
              <div><span className="text-gray-400 block">Yoga</span><span className="text-amber-100 font-bold">{panchang.yoga}</span></div>
              <div><span className="text-gray-400 block">Sunrise</span><span className="text-amber-100 font-bold">{panchang.sunrise}</span></div>
          </div>

          {/* 3. PLANETARY DETAILS */}
          {renderPlanetaryTable(planets)}

          {/* 4. HOUSE ANALYSIS */}
          {renderHouseTable(houses)}

          {/* 5. DASHA TIMELINE */}
          <div className="break-inside-avoid">
             <h4 className="text-lg font-cinzel font-bold text-amber-400 mb-3 border-l-4 border-amber-500 pl-2">
                 Vimshottari Dasha (Timeline)
             </h4>
             <div className="bg-black/30 p-3 rounded mb-4 text-sm border border-amber-500/20">
                 <span className="text-gray-400">Current Balance:</span> <span className="text-green-400 font-bold">{dasha.balance}</span>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-xs text-left border-collapse border border-amber-500/20">
                     <thead className="bg-amber-900/30">
                         <tr>
                             <th className="p-2 border border-amber-500/20 text-amber-200">Maha Dasha</th>
                             <th className="p-2 border border-amber-500/20 text-amber-200">Start Date</th>
                             <th className="p-2 border border-amber-500/20 text-amber-200">End Date</th>
                             <th className="p-2 border border-amber-500/20 text-amber-200">Duration</th>
                         </tr>
                     </thead>
                     <tbody>
                         {dasha.timeline.map((d: any, i: number) => (
                             <tr key={i} className={i === 0 ? "bg-amber-900/20 font-bold" : "hover:bg-amber-900/10"}>
                                 <td className="p-2 border border-amber-500/20 text-amber-100">{d.planet}</td>
                                 <td className="p-2 border border-amber-500/20 text-amber-100">{d.start}</td>
                                 <td className="p-2 border border-amber-500/20 text-amber-100">{d.end}</td>
                                 <td className="p-2 border border-amber-500/20 text-amber-100">{d.duration}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>

          {/* 6. YOGAS */}
           <div className="break-inside-avoid">
              <h4 className="text-lg font-cinzel font-bold text-amber-400 mb-3 border-l-4 border-amber-500 pl-2">
                 Important Yogas
             </h4>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 {yogas.map((y: string, i: number) => (
                     <li key={i} className="bg-gray-800/50 p-2 rounded border-l-2 border-green-500 text-xs text-amber-100">
                         {y}
                     </li>
                 ))}
             </ul>
           </div>

      </div>
    );
  };

  const renderVedicGridHTML = () => {
      // Logic for Numerology Grid
      if (!chartData || !chartData.vedicGrid) return null;
      
      const counts = chartData.vedicGrid;
      const grid = [['3', '1', '9'], ['6', '7', '5'], ['2', '8', '4']];

      return (
          <div className="flex flex-col items-center mb-8 break-inside-avoid">
              <h4 className="text-amber-400 font-cinzel font-bold mb-4 uppercase tracking-widest text-sm border-b border-amber-500/30 pb-1">Vedic Numeroscope</h4>
              <div className="relative p-2 rounded-lg border-2 border-amber-500/50 bg-[#0F0F23] shadow-[0_0_30px_rgba(245,158,11,0.2)] print:bg-[#0F0F23] print:border-amber-600 print-color-adjust-exact">
                  <div className="grid grid-rows-3 gap-1">
                      {grid.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-3 gap-1">
                              {row.map((num, cIdx) => (
                                  <div key={cIdx} className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gray-900/80 border border-amber-500/20 text-2xl font-cinzel font-bold text-amber-100 shadow-inner relative print:bg-gray-800 print:text-white">
                                      <span className="absolute top-1 right-1 text-[8px] text-gray-600 opacity-50">{num}</span>
                                      {counts[num] ? <span className="drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">{num.repeat(counts[num])}</span> : <span className="opacity-0">-</span>}
                                  </div>
                              ))}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  // REAL PDF DOWNLOAD using html2canvas + jspdf
  const handleDownloadPDF = async () => {
      if (!reportRef.current) return;
      setIsDownloading(true);

      try {
          // 1. Capture the element
          const canvas = await html2canvas(reportRef.current, {
              scale: 2, // Higher quality
              useCORS: true, // For external images
              backgroundColor: '#0F0F23' // Maintain dark theme in PDF
          });

          // 2. Create PDF
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          // 3. Calc Dimensions
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10; // Margin top

          // If content is very long, we might need multiple pages, but for this summary
          // we will just fit to width and let it scale down or handle multi-page simple logic
          
          const componentHeightInPDF = (imgHeight * pdfWidth) / imgWidth;
          
          if (componentHeightInPDF > pdfHeight) {
             // Simple multi-page logic
             let heightLeft = componentHeightInPDF;
             let position = 0;
             let pageHeight = pdfHeight;

             pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, componentHeightInPDF);
             heightLeft -= pageHeight;

             while (heightLeft >= 0) {
                position = heightLeft - componentHeightInPDF;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, componentHeightInPDF);
                heightLeft -= pageHeight;
             }
          } else {
             pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, componentHeightInPDF);
          }

          pdf.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);

      } catch (err) {
          console.error("PDF Generation failed", err);
          alert("Could not generate PDF. Please try again.");
      } finally {
          setIsDownloading(false);
      }
  };

  const handleEmailReport = () => {
      const subject = encodeURIComponent(`🔮 ${title} - Glyph Circle Report`);
      const cleanReading = reading.replace(/\*\*/g, '').replace(/#/g, '');
      const bodyText = `Namaste Seeker,\n\nHere is your guidance:\n\n${title}\n\n${cleanReading.substring(0, 1000)}...\n\n(Full report too long for mailto link)\n\nGenerated by Glyph Circle`;
      window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
  };

  const renderFormattedText = (text: string) => {
    const cleanText = text.replace(/#+\s*/g, '');
    const lines = cleanText.split('\n');

    return lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-3" />; 

        const isList = /^[-\*•]/.test(trimmed) || /^\d+\./.test(trimmed);
        const isHeader = trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 100;

        if (isHeader) {
            const content = trimmed.replace(/\*\*/g, '');
            return (
                <h4 key={i} className="text-xl font-cinzel font-bold text-amber-300 mt-6 mb-3 border-l-4 border-amber-500 pl-3">
                    {content}
                </h4>
            );
        }

        if (isList) {
            const parts = trimmed.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} className="flex items-start mb-2 pl-2">
                    <span className="text-amber-500 mr-2 mt-1">•</span>
                    <div className="text-amber-100/90 leading-relaxed text-left flex-1">
                        {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j} className="text-amber-200 font-bold">{part.slice(2, -2)}</strong>;
                            }
                            return <span key={j}>{part.replace(/^[-\*•\d+\.]\s*/, '')}</span>;
                        })}
                    </div>
                </div>
            );
        }

        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        return (
            <p key={i} className="mb-3 text-justify leading-relaxed text-amber-100/80">
                {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-amber-400 font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={j}>{part}</span>;
                })}
            </p>
        );
    });
  };

  return (
    <>
      <div className="animate-fade-in-up w-full">
        <div className="w-full text-center bg-gradient-to-b from-green-900/30 to-black/50 p-6 rounded-xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)] mb-6">
          <p className="text-green-400 font-bold mb-6 flex items-center justify-center gap-2 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('paymentSuccessful')}
          </p>
        </div>
          
        {/* REPORT CONTENT (Ref for PDF Capture) */}
        <div ref={reportRef} className="bg-black/90 p-8 rounded-lg border border-amber-500/10 mb-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
              
              {/* Header Logo for PDF */}
              <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4">
                  <div>
                      <h3 className="text-2xl font-cinzel text-amber-200">{title}</h3>
                      {subtitle && <p className="text-amber-500/70 text-xs font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
                  </div>
                  <div className="text-right">
                      <h1 className="text-xl font-cinzel font-bold text-amber-500 tracking-wider">GLYPH CIRCLE</h1>
                      <p className="text-[10px] text-amber-200/50">{new Date().toLocaleDateString()}</p>
                  </div>
              </div>
              
              <div className={`text-amber-100/90 font-lora leading-relaxed space-y-4`}>
                 {/* Visual Charts (Vedic or Astro) */}
                 {renderVedicGridHTML()}
                 
                 {imageUrl && (
                     <div className="md:w-1/3 mb-4 md:mb-0 flex-shrink-0">
                         <img 
                           src={imageUrl} 
                           alt="Chart" 
                           onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                           className="w-full rounded-lg border border-amber-500/20 shadow-lg" 
                         />
                     </div>
                 )}

                 <div className="w-full">
                     <div className="font-lora">
                        {renderFormattedText(reading)}
                     </div>

                     {/* Render New Astrology Tables */}
                     {renderAstroCharts()}
                     
                     <div className="mt-6 pt-4 border-t border-amber-500/10 grid md:grid-cols-2 gap-4">
                        <div className="bg-amber-900/10 p-3 rounded border border-amber-500/10">
                          <strong className="text-amber-400 block mb-1 font-cinzel">Key Insight</strong>
                          <p className="text-sm text-amber-200/80 italic">"Transformation is imminent. Trust the process."</p>
                        </div>
                        <div className="bg-amber-900/10 p-3 rounded border border-amber-500/10">
                          <strong className="text-amber-400 block mb-1 font-cinzel">Actionable Advice</strong>
                          <p className="text-sm text-amber-200/80 italic">"Take a leap of faith today."</p>
                        </div>
                     </div>
                 </div>
              </div>
              
              {/* Footer for PDF */}
              <div className="mt-8 pt-4 border-t border-amber-500/10 text-center text-[10px] text-amber-200/40 font-mono">
                  Generative Insight by Glyph Circle AI • Not a substitute for professional advice.
              </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                className="w-full sm:w-auto text-sm bg-gray-700 hover:bg-gray-600 border-gray-500" 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                  <span className="flex items-center justify-center gap-2">
                      {isDownloading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                          </svg>
                      )}
                      {isDownloading ? t('generating') : t('downloadPDF')}
                  </span>
              </Button>
              <Button className="w-full sm:w-auto text-sm bg-gray-700 hover:bg-gray-600 border-gray-500" onClick={handleEmailReport}>
                   <span className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t('emailReport')}
                  </span>
              </Button>
        </div>
          
        <div>
          <Link to="/home">
              <Button className="w-full bg-gradient-to-r from-amber-700 to-maroon-800 hover:from-amber-600 hover:to-maroon-700 border-amber-500/50 shadow-xl">
                   <span className="flex items-center justify-center gap-2 font-cinzel tracking-wider">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      {t('backToDashboard')}
                  </span>
              </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default FullReport;
