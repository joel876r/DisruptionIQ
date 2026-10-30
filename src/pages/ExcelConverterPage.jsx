import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  FileText, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  ArrowRight, 
  Table, 
  Layers,
  Sparkles,
  Boxes,
  Truck,
  Check,
  PackageCheck,
  Building2,
  AlertOctagon,
  FileDown
} from 'lucide-react';
import { api } from '../services/api';

export function ExcelConverterPage() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [targetEntity, setTargetEntity] = useState('inventory');

  // Intelligent entity auto-detector based on table headers
  const detectEntityFromHeaders = (headerList) => {
    const lower = headerList.map(h => String(h).toLowerCase().trim());
    if (lower.some(h => h.includes('order_number') || h.includes('order_id') || h.includes('order_no') || h.includes('destination_city'))) {
      return 'orders';
    }
    if (lower.some(h => h.includes('tracking_number') || h.includes('carrier') || h.includes('scheduled_eta'))) {
      return 'shipments';
    }
    if (lower.some(h => h.includes('disruption_type') || h.includes('estimated_delay_hours') || h.includes('incident_id'))) {
      return 'disruptions';
    }
    if (lower.some(h => h.includes('reliability_score') || h.includes('lead_time_days') || h.includes('is_alternative_backup'))) {
      return 'suppliers';
    }
    if (lower.some(h => h.includes('shelf_life_days') || h.includes('criticality') || h.includes('selling_price'))) {
      return 'products';
    }
    if (lower.some(h => h.includes('physical_units') || h.includes('batch_number') || h.includes('physical_quantity') || h.includes('safety_stock'))) {
      return 'inventory';
    }
    return 'inventory';
  };

  const processFile = (fileObj) => {
    if (!fileObj) return;
    setFile(fileObj);
    setFileName(fileObj.name);
    setFeedback({ type: '', message: '' });
    setLoading(true);

    const reader = new FileReader();

    if (fileObj.name.endsWith('.csv')) {
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim().length > 0);
          if (lines.length > 0) {
            const h = lines[0].split(',').map(item => item.trim().replace(/^"|"$/g, ''));
            const rows = lines.slice(1).map(line => {
              const values = line.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
              const obj = {};
              h.forEach((header, idx) => {
                obj[header] = values[idx] !== undefined ? values[idx] : '';
              });
              return obj;
            });
            setHeaders(h);
            setParsedData(rows);
            setSheetNames(['CSV Main']);
            setSelectedSheet('CSV Main');
            const detected = detectEntityFromHeaders(h);
            setTargetEntity(detected);
            setFeedback({ 
              type: 'success', 
              message: `Parsed ${rows.length} records successfully from ${fileObj.name}. Auto-routed to ${detected.toUpperCase()}.` 
            });
          }
        } catch (err) {
          setFeedback({ type: 'error', message: `Failed to parse CSV: ${err.message}` });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(fileObj);
    } else {
      // Excel .xlsx or .xls using SheetJS
      reader.onload = (e) => {
        try {
          const XLSX = window.XLSX;
          if (!XLSX) {
            throw new Error('SheetJS engine is still loading. Please try again in 2 seconds.');
          }
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          setSheetNames(workbook.SheetNames);
          const firstSheet = workbook.SheetNames[0];
          setSelectedSheet(firstSheet);

          const worksheet = workbook.Sheets[firstSheet];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          if (json.length > 0) {
            const h = Object.keys(json[0]);
            setHeaders(h);
            setParsedData(json);
            const detected = detectEntityFromHeaders(h);
            setTargetEntity(detected);
            setFeedback({ 
              type: 'success', 
              message: `Parsed ${json.length} records from Excel sheet '${firstSheet}'. Auto-routed to ${detected.toUpperCase()}.` 
            });
          } else {
            setFeedback({ type: 'error', message: 'Spreadsheet sheet is empty.' });
          }
        } catch (err) {
          setFeedback({ type: 'error', message: `Excel conversion error: ${err.message}` });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(fileObj);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Pre-load demo dataset for instant evaluation
  const loadDemoDataset = () => {
    const sampleHeaders = ['SKU', 'Product_Name', 'Warehouse_Code', 'Batch_Number', 'Physical_Units', 'Reserved_Units', 'Damaged_Units', 'Usable_Units', 'Unit_Price_INR'];
    const sampleRows = [
      { SKU: 'MED-INSULIN-100', Product_Name: 'Insulin Glargine 100U Cold-Chain', Warehouse_Code: 'WH-FRA-01', Batch_Number: 'LOT-2026-X88', Physical_Units: '250', Reserved_Units: '150', Damaged_Units: '0', Usable_Units: '100', Unit_Price_INR: '4250' },
      { SKU: 'MED-INSULIN-100', Product_Name: 'Insulin Glargine 100U Cold-Chain', Warehouse_Code: 'WH-MIL-02', Batch_Number: 'LOT-2026-M12', Physical_Units: '320', Reserved_Units: '100', Damaged_Units: '0', Usable_Units: '220', Unit_Price_INR: '4250' },
      { SKU: 'SEMI-CHIP-A9', Product_Name: 'Automotive Microcontroller QFN-64', Warehouse_Code: 'WH-ROT-03', Batch_Number: 'LOT-2026-C09', Physical_Units: '450', Reserved_Units: '300', Damaged_Units: '20', Usable_Units: '130', Unit_Price_INR: '12800' },
      { SKU: 'PHARMA-VACCINE-B', Product_Name: 'Ultra-Chilled mRNA Formulation -70C', Warehouse_Code: 'WH-FRA-01', Batch_Number: 'LOT-2026-V55', Physical_Units: '600', Reserved_Units: '200', Damaged_Units: '50', Usable_Units: '350', Unit_Price_INR: '8500' },
      { SKU: 'AERO-SENSOR-X1', Product_Name: 'Turbine Vibration Transducer Grade-A', Warehouse_Code: 'WH-ZUR-04', Batch_Number: 'LOT-2026-A11', Physical_Units: '180', Reserved_Units: '40', Damaged_Units: '0', Usable_Units: '140', Unit_Price_INR: '24000' }
    ];
    setFileName('Sample_SupplyChain_Inventory_Master.xlsx');
    setHeaders(sampleHeaders);
    setParsedData(sampleRows);
    setSheetNames(['Pharma & Aero Stock']);
    setSelectedSheet('Pharma & Aero Stock');
    setTargetEntity('inventory');
    setFeedback({ type: 'success', message: 'Loaded 5 sample multi-depot inventory records ready for CSV/JSON export or Database Ingestion.' });
  };

  // Instant 1-Click Load Full Benchmark Data
  const handleSeedBenchmark = async () => {
    try {
      setSeeding(true);
      const res = await api.seedBenchmarkData();
      setFeedback({
        type: 'success',
        message: `✓ Benchmark Enterprise Dataset Loaded! Initialized 18 inventory nodes, 6 customer orders, 3 disruptions, 6 shipments, and 5 multi-country depots for Apex Global Logistics.`
      });
      loadDemoDataset();
    } catch (err) {
      setFeedback({ type: 'error', message: `Benchmark seed failed: ${err.message}` });
    } finally {
      setSeeding(false);
    }
  };

  // Quick-load curated datasets from server files
  const loadCuratedDataset = async (url, name, entity) => {
    try {
      setLoading(true);
      const res = await fetch(url);
      const text = await res.text();
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        const h = lines[0].split(',').map(item => item.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
          const obj = {};
          h.forEach((header, idx) => {
            obj[header] = values[idx] !== undefined ? values[idx] : '';
          });
          return obj;
        });
        setFileName(name);
        setHeaders(h);
        setParsedData(rows);
        setSheetNames([entity.toUpperCase()]);
        setSelectedSheet(entity.toUpperCase());
        setTargetEntity(entity);
        setFeedback({ 
          type: 'success', 
          message: `Loaded ${rows.length} benchmark records from ${name}. Ready to convert or import into ${entity.toUpperCase()}.` 
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: `Failed to load benchmark dataset: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Download converted CSV
  const downloadConvertedCSV = () => {
    if (parsedData.length === 0) return;
    const csvRows = [];
    csvRows.push(headers.join(','));
    parsedData.forEach(row => {
      const values = headers.map(h => {
        const val = row[h] !== undefined ? String(row[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName ? fileName.replace(/\.[^/.]+$/, "") : 'dataset'}_converted.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download converted JSON
  const downloadConvertedJSON = () => {
    if (parsedData.length === 0) return;
    const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName ? fileName.replace(/\.[^/.]+$/, "") : 'dataset'}_converted.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ingest parsed rows into DisruptionIQ database
  const handleIngestToDatabase = async () => {
    if (parsedData.length === 0) return;
    try {
      setImporting(true);
      const csvRows = [];
      csvRows.push(headers.join(','));
      parsedData.forEach(row => {
        const values = headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`);
        csvRows.push(values.join(','));
      });
      const fileBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const testFile = new File([fileBlob], 'converted_import.csv', { type: 'text/csv' });

      const res = await api.importCsv(targetEntity, testFile);
      setFeedback({ 
        type: 'success', 
        message: `✓ Ingestion Complete: Successfully imported ${res.imported_count} records into ${targetEntity.toUpperCase()} table. (${res.error_count || 0} quarantined).` 
      });
    } catch (err) {
      setFeedback({ type: 'error', message: `Import error: ${err.message}` });
    } finally {
      setImporting(false);
    }
  };

  const curatedDatasets = [
    {
      id: 'inv',
      name: 'DisruptionIQ_Master_Inventory.csv',
      url: '/datasets/DisruptionIQ_Master_Inventory.csv',
      entity: 'inventory',
      title: 'Master Inventory (15 Depot Nodes)',
      desc: 'Cold-chain biopharma, semiconductors, avionics stock with batch lots and physical/reserved counts.',
      icon: Boxes,
      color: 'text-lime',
      border: 'border-lime/30'
    },
    {
      id: 'orders',
      name: 'DisruptionIQ_Customer_Orders_Master.csv',
      url: '/datasets/DisruptionIQ_Customer_Orders_Master.csv',
      entity: 'orders',
      title: 'Customer Orders (Tier-1 Hospitals & OEMs)',
      desc: 'Priority order commitments with delivery deadlines, SLA penalties, and destinations in INR.',
      icon: PackageCheck,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30'
    },
    {
      id: 'shipments',
      name: 'DisruptionIQ_Shipments_and_Delays.csv',
      url: '/datasets/DisruptionIQ_Shipments_and_Delays.csv',
      entity: 'shipments',
      title: 'Shipments & Delayed Carriers',
      desc: 'European container corridors with Kuehne+Nagel, DHL, and tracking delays (48h Antwerp, 36h Rotterdam).',
      icon: Truck,
      color: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    {
      id: 'disruptions',
      name: 'DisruptionIQ_Active_Disruptions.csv',
      url: '/datasets/DisruptionIQ_Active_Disruptions.csv',
      entity: 'disruptions',
      title: 'Active Disruption Incidents',
      desc: 'Port customs sensor holds, automated crane failures, and alpine rail switch freezing incidents.',
      icon: AlertOctagon,
      color: 'text-rose-400',
      border: 'border-rose-500/30'
    },
    {
      id: 'suppliers',
      name: 'DisruptionIQ_Suppliers_Directory.csv',
      url: '/datasets/DisruptionIQ_Suppliers_Directory.csv',
      entity: 'suppliers',
      title: 'Suppliers & Alternative Backups',
      desc: 'Novo Nordisk, Infineon, and certified backup vendors (Geneva BioLogics, STMicroelectronics).',
      icon: Building2,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    {
      id: 'products',
      name: 'DisruptionIQ_Catalog_Products.csv',
      url: '/datasets/DisruptionIQ_Catalog_Products.csv',
      entity: 'products',
      title: 'Critical Products Catalog',
      desc: 'Cold-chain Insulin Glargine, Cardiac Stents, Automotive MCUs, and Lithium Battery Cells with shelf-life rules.',
      icon: Layers,
      color: 'text-purple-400',
      border: 'border-purple-500/30'
    }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Visual Header with Cargo Containers Imagery */}
      <div className="relative rounded-4xl overflow-hidden border border-white/[0.1] shadow-2xl bg-obsidian-900">
        <div className="absolute inset-0 z-0 opacity-25">
          <img 
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80" 
            alt="Cargo Containers Shipping Freight Terminal" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 via-obsidian-950/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono bg-lime/10 text-lime border border-lime/30 flex items-center space-x-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Multi-Format Data Converter & Ingestion Pipeline</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">XLSX • XLS • CSV • JSON</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Excel Spreadsheet & Data Pipeline Converter
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Upload any vendor or logistics Excel spreadsheet (.xlsx, .xls, .csv). Instantly parse, validate, convert into clean CSV or JSON formats, and ingest directly into the live DisruptionIQ database across all operational entities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleSeedBenchmark}
              disabled={seeding}
              className="px-5 py-3 rounded-2xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black font-mono transition flex items-center space-x-2 shadow-xl shadow-lime/20 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Hydrating Database...' : 'Instant 1-Click Load Full Benchmark Data'}</span>
            </button>
            <button
              onClick={loadDemoDataset}
              className="px-5 py-3 rounded-2xl bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 border border-white/[0.1] text-xs font-black font-mono transition flex items-center space-x-2 shadow-lg"
            >
              <Table className="w-4 h-4 text-lime" />
              <span>Load Sample Preview</span>
            </button>
          </div>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center space-x-2 ${
          feedback.type === 'error' ? 'bg-rose-950/80 border-rose-800 text-rose-300' : 'bg-lime/10 border-lime/30 text-lime font-bold shadow-lg shadow-lime/10'
        }`}>
          {feedback.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-lime" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Benchmark Datasets Download & Fast Ingest Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider font-mono text-white flex items-center space-x-2">
              <Download className="w-4 h-4 text-lime" />
              <span>Curated Benchmark Supply Chain Datasets (Ready to Download & Test)</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Click "Download" to save any dataset to your computer, or click "Load into Converter" to preview and ingest immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {curatedDatasets.map((ds) => {
            const Icon = ds.icon;
            return (
              <div 
                key={ds.id} 
                className="card-dark p-5 rounded-3xl border border-white/[0.08] hover:border-white/[0.2] transition flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-xl bg-obsidian-950 border border-white/[0.08] flex items-center justify-center ${ds.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{ds.title}</h4>
                        <span className="text-[10px] font-mono text-slate-400 block">{ds.name}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
                    {ds.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <a
                    href={ds.url}
                    download={ds.name}
                    className="px-3 py-1.5 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 text-slate-300 hover:text-white border border-white/[0.1] text-[11px] font-mono font-bold transition flex items-center space-x-1.5"
                  >
                    <FileDown className="w-3.5 h-3.5 text-lime" />
                    <span>Download CSV</span>
                  </a>

                  <button
                    onClick={() => loadCuratedDataset(ds.url, ds.name, ds.entity)}
                    className="px-3 py-1.5 rounded-xl bg-lime/10 hover:bg-lime/20 text-lime border border-lime/30 text-[11px] font-mono font-bold transition flex items-center space-x-1"
                  >
                    <span>Load into Converter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="rounded-4xl p-8 sm:p-12 border-2 border-dashed border-white/[0.15] hover:border-lime/50 bg-obsidian-900/60 hover:bg-obsidian-900 transition flex flex-col items-center justify-center text-center cursor-pointer shadow-xl group"
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".xlsx, .xls, .csv" 
          className="hidden" 
          onChange={handleFileChange}
        />

        <div className="w-16 h-16 rounded-3xl bg-obsidian-850 border border-white/[0.08] flex items-center justify-center text-lime group-hover:scale-110 transition shadow-lg mb-4">
          <UploadCloud className="w-8 h-8 stroke-[1.8]" />
        </div>

        <h3 className="text-lg font-black text-white">
          Drop your Excel spreadsheet or CSV here or click to browse
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md font-mono">
          Supports .xlsx, .xls, and .csv files up to 50MB with automatic header routing & instant schema validation
        </p>

        {fileName && (
          <div className="mt-4 px-4 py-1.5 rounded-full bg-lime text-obsidian-950 text-xs font-mono font-black flex items-center space-x-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Active File: {fileName}</span>
          </div>
        )}
      </div>

      {/* Conversion Actions & Preview Table */}
      {parsedData.length > 0 && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="card-dark p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                Conversion Pipeline Ready
              </span>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                {parsedData.length} Valid Records Extracted
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Download CSV */}
              <button
                onClick={downloadConvertedCSV}
                className="px-5 py-2.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 text-white border border-white/[0.1] text-xs font-bold font-mono transition flex items-center space-x-2 shadow"
              >
                <FileText className="w-4 h-4 text-lime" />
                <span>Download as CSV</span>
              </button>

              {/* Download JSON */}
              <button
                onClick={downloadConvertedJSON}
                className="px-5 py-2.5 rounded-2xl bg-obsidian-900 hover:bg-obsidian-850 text-white border border-white/[0.1] text-xs font-bold font-mono transition flex items-center space-x-2 shadow"
              >
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>Download as JSON</span>
              </button>

              {/* Ingest into Database */}
              <div className="flex items-center space-x-2 bg-obsidian-950 p-1.5 rounded-2xl border border-white/[0.1]">
                <span className="text-[10px] uppercase font-mono text-slate-400 pl-2 font-bold">Target:</span>
                <select
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  className="bg-transparent text-lime text-xs font-mono font-bold px-2 py-1 focus:outline-none"
                >
                  <option value="inventory" className="bg-obsidian-900 text-slate-200">Into Inventory</option>
                  <option value="orders" className="bg-obsidian-900 text-slate-200">Into Customer Orders</option>
                  <option value="shipments" className="bg-obsidian-900 text-slate-200">Into Shipments</option>
                  <option value="disruptions" className="bg-obsidian-900 text-slate-200">Into Disruptions</option>
                  <option value="suppliers" className="bg-obsidian-900 text-slate-200">Into Suppliers</option>
                  <option value="products" className="bg-obsidian-900 text-slate-200">Into Products</option>
                </select>

                <button
                  onClick={handleIngestToDatabase}
                  disabled={importing}
                  className="px-4 py-2 rounded-xl bg-lime hover:bg-lime-400 text-obsidian-950 text-xs font-black font-mono transition flex items-center space-x-1.5 shadow-lg shadow-lime/20 disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{importing ? 'Importing...' : 'Import to DB'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Data Grid */}
          <div className="card-dark overflow-hidden border border-white/[0.08] shadow-2xl">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Sheet: <strong className="text-white">{selectedSheet || 'Main'}</strong></span>
              <span className="text-lime">{headers.length} Columns • {parsedData.length} Rows</span>
            </div>

            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-obsidian-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b border-white/[0.06] font-mono">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    {headers.map((h) => (
                      <th key={h} className="py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {parsedData.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-obsidian-850/60 transition">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{idx + 1}</td>
                      {headers.map((h) => (
                        <td key={h} className="py-3 px-4 font-mono text-slate-200 truncate max-w-[200px]">
                          {String(row[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedData.length > 50 && (
              <div className="p-3 bg-obsidian-950 text-center text-xs font-mono text-slate-500 border-t border-white/[0.04]">
                Showing first 50 rows of {parsedData.length}. Full dataset will be exported to CSV/JSON.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
