
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
  chartData?: any; // Contains numerology, astrology, or generic vedic data
}

const FullReport: React.FC<FullReportProps> = ({ reading, title, subtitle, imageUrl, chartData }) => {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- NUMEROLOGY DASHBOARD RENDERER ---
  const renderNumerologyDashboard = () => {
      if (!chartData || !chartData.coreNumbers || !chartData.vedicGrid) return null;

      const { coreNumbers, vedicGrid } = chartData;
      
      // Standard Vedic Grid Layout (Loshu/Vedic style)
      // 3 1 9
      // 6 7 5
      // 2 8 4
      const gridMap = [
          [3, 1, 9],
          [6, 7, 5],
          [2, 8, 4]
      ];

      return (
          <div className="space-y-8 mb-8 animate-fade-in-up break-inside-avoid">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* CHART: VEDIC GRID */}
                  <div className="bg-[#0F0F23] border-2 border-amber-500/40 p-1 rounded-lg shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center">
                      <h4 className="text-amber-400 font-cinzel font-bold mb-3 mt-2 tracking-widest text-sm uppercase">Vedic Birth Chart</h4>
                      <div className="grid grid-cols-3 gap-1 bg-amber-900/50 p-1 rounded border border-amber-500/30 w-48 h-48">
                          {gridMap.flat().map((num) => {
                              const count = vedicGrid[num.toString()] || 0;
                              const isPresent = count > 0;
                              return (
                                  <div 
                                    key={num} 
                                    className={`flex flex-col items-center justify-center rounded border transition-all duration-500
                                        ${isPresent 
                                            ? 'bg-gradient-to-br from-amber-700 via-amber-900 to-black border-amber-400/50 shadow-inner' 
                                            : 'bg-black/40 border-gray-800 opacity-50'}
                                    `}
                                  >
                                      {isPresent ? (
                                          <span className="text-xl font-bold text-amber-100 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">
                                              {num.toString().repeat(count)}
                                          </span>
                                      ) : (
                                          <span className="text-xs text-gray-700">{num}</span>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                      <p className="text-[10px] text-amber-200/50 mt-2 mb-2 italic">Based on Date of Birth</p>
                  </div>

                  {/* STATS: CORE NUMBERS */}
                  <div className="flex flex-col justify-center space-y-4">
                      <div className="bg-black/30 p-4 rounded border-l-4 border-purple-500">
                          <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Mulank (Psychic)</p>
                          <div className="flex justify-between items-end">
                              <span className="text-3xl font-bold text-white">{coreNumbers.mulank}</span>
                              <span className="text-xs text-gray-400">Ruling Planet: <span className="text-purple-200">Sun/Moon</span></span>
                          </div>
                      </div>
                      <div className="bg-black/30 p-4 rounded border-l-4 border-green-500">
                          <p className="text-xs text-green-400 uppercase tracking-widest mb-1">Bhagyank (Destiny)</p>
                          <div className="flex justify-between items-end">
                              <span className="text-3xl font-bold text-white">{coreNumbers.bhagyank}</span>
                              <span className="text-xs text-gray-400">Life Path</span>
                          </div>
                      </div>
                      <div className="bg-black/30 p-4 rounded border-l-4 border-blue-500">
                          <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">Namank (Name)</p>
                          <div className="flex justify-between items-end">
                              <span className="text-3xl font-bold text-white">{coreNumbers.namank}</span>
                              <span className="text-xs text-gray-400">Expression</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* ANCIENT IMAGERY SECTION */}
              <div className="grid grid-cols-2 gap-2 mt-4 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="relative h-24 overflow-hidden rounded border border-amber-500/20">
                      <img src="https://images.unsplash.com/photo-1600609842388-3e4b489d71c6?q=80&w=400" alt="Crystal" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-xs text-amber-100 font-cinzel">Yantra</span>
                      </div>
                  </div>
                  <div className="relative h-24 overflow-hidden rounded border border-amber-500/20">
                      <img src="https://images.unsplash.com/photo-1542645976-7973d4177b9c?q=80&w=400" alt="Vedic Script" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-xs text-amber-100 font-cinzel">Sutra</span>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  // --- GENERIC VEDIC CHART RENDERER (For Tarot, Dreams, Remedy, Face, Palm) ---
  const renderGenericVedicCharts = () => {
      if (!chartData || chartData.planets || chartData.coreNumbers) return null; // Skip if Astrology or Numerology

      // Check for specific Vedic structures in chartData
      const { vedicMetrics, elementalBalance, doshaState } = chartData;

      if (!vedicMetrics && !elementalBalance && !doshaState) return null;

      return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 break-inside-avoid">
              
              {/* 1. Pancha Maha Bhuta (Elemental Balance) */}
              {elementalBalance && (
                  <div className="bg-black/30 p-4 rounded border border-amber-500/20">
                      <h4 className="text-amber-400 font-cinzel font-bold text-xs uppercase tracking-widest mb-3 border-b border-amber-500/10 pb-1">
                          Pancha Bhuta (Elements)
                      </h4>
                      <div className="space-y-3">
                          {elementalBalance.map((item: any, i: number) => (
                              <div key={i}>
                                  <div className="flex justify-between text-xs mb-1">
                                      <span className="text-amber-100">{item.element} <span className="text-gray-500 text-[10px]">({item.sanskrit})</span></span>
                                      <span className="text-amber-400 font-bold">{item.score}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-gray-800 rounded-full">
                                      <div 
                                        className={`h-full rounded-full ${
                                            item.element === 'Fire' ? 'bg-red-500' : 
                                            item.element === 'Water' ? 'bg-blue-500' : 
                                            item.element === 'Air' ? 'bg-gray-300' : 
                                            item.element === 'Earth' ? 'bg-green-600' : 'bg-purple-500'
                                        }`} 
                                        style={{ width: `${item.score}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* 2. Dosha / Guna / Energy State */}
              {(doshaState || vedicMetrics) && (
                  <div className="bg-black/30 p-4 rounded border border-amber-500/20">
                      <h4 className="text-amber-400 font-cinzel font-bold text-xs uppercase tracking-widest mb-3 border-b border-amber-500/10 pb-1">
                          Prana & Energy Flow
                      </h4>
                      <div className="flex justify-around items-end h-32 pt-4">
                          {(doshaState || vedicMetrics).map((item: any, i: number) => (
                              <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group w-full">
                                  <div 
                                    className="w-8 sm:w-12 bg-gradient-to-t from-amber-800 to-amber-500 rounded-t relative transition-all duration-500"
                                    style={{ height: `${item.value}%` }}
                                  >
                                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                          {item.value}%
                                      </span>
                                  </div>
                                  <div className="text-center">
                                      <span className="block text-xs font-bold text-amber-200">{item.label}</span>
                                      <span className="block text-[9px] text-gray-500 uppercase">{item.sub}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  // --- ASTROLOGY CHART RENDERERS ---
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

  const renderVisualKundali = () => {
    if (!chartData || !chartData.planets) return null;
    // Fixed House Positions for Diamond Chart
    const houses = [
        { id: 1, x: 50, y: 25 }, { id: 2, x: 25, y: 12 }, { id: 3, x: 12, y: 25 },
        { id: 4, x: 25, y: 50 }, { id: 5, x: 12, y: 75 }, { id: 6, x: 25, y: 88 },
        { id: 7, x: 50, y: 75 }, { id: 8, x: 75, y: 88 }, { id: 9, x: 88, y: 75 },
        { id: 10, x: 75, y: 50 }, { id: 11, x: 88, y: 25 }, { id: 12, x: 75, y: 12 },
    ];
    const ascSign = chartData.lagna.sign;

    return (
        <div className="flex flex-col items-center mb-8 break-inside-avoid">
            <h4 className="text-amber-400 font-cinzel font-bold mb-2 text-sm border-b border-amber-500/30 pb-1 w-full text-center">
                Lagna Kundali (D1)
            </h4>
            <div className="w-full max-w-[300px] aspect-square relative bg-[#0F0F23] border-2 border-amber-600 p-1 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/50">
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="0" x2="0" y2="50" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="100" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="100" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="0.5" />
                    {houses.map(h => {
                        let currentSign = (ascSign + h.id - 1) % 12;
                        if (currentSign === 0) currentSign = 12;
                        const planetsInHouse = chartData.planets.filter((p: any) => p.house === h.id);
                        return (
                            <g key={h.id}>
                                <text x={h.x} y={h.y + (h.id===1||h.id===7?15:0)} dx={h.id===1?0:0} dy={h.id===1?-18:h.id===7?18:0} className="text-[4px] fill-amber-700/80 font-bold" textAnchor="middle">{currentSign}</text>
                                {planetsInHouse.map((p: any, i: number) => (
                                    <text key={i} x={h.x} y={h.y - ((planetsInHouse.length - 1) * 2) + (i * 4)} className={`text-[3.5px] font-bold ${p.name==='Sun'?'fill-yellow-400':p.name==='Moon'?'fill-white':'fill-amber-300'}`} textAnchor="middle" alignmentBaseline="middle">{p.name.substring(0, 2)}</text>
                                ))}
                                {h.id === 1 && planetsInHouse.length === 0 && <text x={h.x} y={h.y} className="text-[3px] fill-gray-500" textAnchor="middle">(Lagna)</text>}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
  };

  const renderAstroCharts = () => {
    if (!chartData || !chartData.planets) return null;
    const { planets, houses, dasha, panchang } = chartData;
    return (
      <div className="space-y-8 mt-8 border-t border-amber-500/30 pt-8">
          {renderVisualKundali()}
          <div className="bg-amber-900/20 p-4 rounded border border-amber-500/30 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div><span className="text-gray-400 block">Tithi</span><span className="text-amber-100 font-bold">{panchang.tithi}</span></div>
              <div><span className="text-gray-400 block">Nakshatra</span><span className="text-amber-100 font-bold">{panchang.nakshatra}</span></div>
              <div><span className="text-gray-400 block">Yoga</span><span className="text-amber-100 font-bold">{panchang.yoga}</span></div>
              <div><span className="text-gray-400 block">Sunrise</span><span className="text-amber-100 font-bold">{panchang.sunrise}</span></div>
          </div>
          {renderPlanetaryTable(planets)}
          <div className="break-inside-avoid">
             <h4 className="text-lg font-cinzel font-bold text-amber-400 mb-3 border-l-4 border-amber-500 pl-2">Vimshottari Dasha</h4>
             <div className="overflow-x-auto">
                 <table className="w-full text-xs text-left border-collapse border border-amber-500/20">
                     <thead className="bg-amber-900/30">
                         <tr><th className="p-2 border border-amber-500/20 text-amber-200">Maha Dasha</th><th className="p-2 border border-amber-500/20 text-amber-200">End Date</th></tr>
                     </thead>
                     <tbody>
                         {dasha.timeline.map((d: any, i: number) => (
                             <tr key={i} className="hover:bg-amber-900/10">
                                 <td className="p-2 border border-amber-500/20 text-amber-100">{d.planet}</td>
                                 <td className="p-2 border border-amber-500/20 text-amber-100">{d.end}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
      </div>
    );
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
                    <span className="text-amber-500 mr-2 mt-1">✦</span>
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

  // --- PDF & EMAIL HANDLERS ---
  const handleDownloadPDF = async () => {
      if (!reportRef.current) return;
      setIsDownloading(true);
      try {
          const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#0F0F23' });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const componentHeightInPDF = (imgHeight * pdfWidth) / imgWidth;
          
          if (componentHeightInPDF > pdfHeight) {
             let heightLeft = componentHeightInPDF;
             let position = 0;
             pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, componentHeightInPDF);
             heightLeft -= pdfHeight;
             while (heightLeft >= 0) {
                position = heightLeft - componentHeightInPDF;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, componentHeightInPDF);
                heightLeft -= pdfHeight;
             }
          } else {
             pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, componentHeightInPDF);
          }
          pdf.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);
      } catch (err) {
          alert("Could not generate PDF.");
      } finally {
          setIsDownloading(false);
      }
  };

  const handleEmailReport = () => {
      const subject = encodeURIComponent(`🔮 ${title} - Glyph Circle Report`);
      window.location.href = `mailto:?subject=${subject}&body=Your report is attached in spirit.`;
  };

  return (
    <div className="animate-fade-in-up w-full">
        {/* REPORT CONTENT */}
        <div ref={reportRef} className="bg-black/90 p-8 rounded-lg border border-amber-500/10 mb-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
              
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
              
              <div className="w-full">
                 {/* Vedic Image or Chart */}
                 {imageUrl && (
                     <div className="mb-6 flex justify-center">
                         <img src={imageUrl} alt="Chart" className="rounded-lg border border-amber-500/20 shadow-lg max-h-64 object-cover" />
                     </div>
                 )}

                 {/* Custom Renderers per Type */}
                 {renderNumerologyDashboard()}
                 {renderGenericVedicCharts()}
                 {renderAstroCharts()}

                 <div className="font-lora text-amber-100/90 leading-relaxed">
                    {renderFormattedText(reading)}
                 </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-amber-500/10 text-center text-[10px] text-amber-200/40 font-mono">
                  Generative Insight by Glyph Circle AI • Ancient Wisdom Reimagined
              </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full sm:w-auto text-sm bg-gray-700 hover:bg-gray-600 border-gray-500">
                  {isDownloading ? 'Generating...' : t('downloadPDF')}
              </Button>
              <Button onClick={handleEmailReport} className="w-full sm:w-auto text-sm bg-gray-700 hover:bg-gray-600 border-gray-500">
                  {t('emailReport')}
              </Button>
        </div>
          
        <Link to="/home">
            <Button className="w-full bg-gradient-to-r from-amber-700 to-maroon-800 border-amber-500/50">
                {t('backToDashboard')}
            </Button>
        </Link>
    </div>
  );
};

export default FullReport;
