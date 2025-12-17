import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import * as Checkbox from '@radix-ui/react-checkbox';
import {
  CloudArrowUpIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  DocumentArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const RentalCalculator = () => {
  const [products, setProducts] = useState([]);
  const [supplyRatePercent, setSupplyRatePercent] = useState(75);
  const [rentalPeriods] = useState([12, 24, 36, 48]);
  const [selectedPeriods, setSelectedPeriods] = useState([12]);
  const [discountRates, setDiscountRates] = useState({ 12: 100, 24: 106, 36: 111, 48: 116 });
  const [rentalFeeRates, setRentalFeeRates] = useState({ 12: 8, 24: 15, 36: 21, 48: 25 });
  const [operatingFeeRates, setOperatingFeeRates] = useState({ 12: 2.75, 24: 2.75, 36: 2.75, 48: 2.75 });
  const [calculatedProducts, setCalculatedProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [viewPeriod, setViewPeriod] = useState('all');
  const [singleProduct, setSingleProduct] = useState({ productName: '', modelName: '', price: '' });

  const handleSupplyRateChange = (e) => {
    const value = e.target.value;
    if (value === '' || value === '.') { setSupplyRatePercent(value); return; }
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) setSupplyRatePercent(num);
  };

  const handleDiscountRateChange = (period, e) => {
    const value = e.target.value;
    if (value === '' || value === '.') { setDiscountRates({ ...discountRates, [period]: value }); return; }
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) setDiscountRates({ ...discountRates, [period]: num });
  };

  const handleRentalFeeRateChange = (period, e) => {
    const value = e.target.value;
    if (value === '' || value === '.') { setRentalFeeRates({ ...rentalFeeRates, [period]: value }); return; }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) setRentalFeeRates({ ...rentalFeeRates, [period]: num });
  };

  const handleOperatingFeeRateChange = (period, e) => {
    const value = e.target.value;
    if (value === '' || value === '.') { setOperatingFeeRates({ ...operatingFeeRates, [period]: value }); return; }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) setOperatingFeeRates({ ...operatingFeeRates, [period]: num });
  };

  const handlePeriodToggle = (period) => {
    if (selectedPeriods.includes(period)) {
      if (selectedPeriods.length > 1) setSelectedPeriods(selectedPeriods.filter(p => p !== period));
    } else {
      setSelectedPeriods([...selectedPeriods, period].sort((a, b) => a - b));
    }
  };

  const handleSingleProductChange = (e) => {
    setSingleProduct({ ...singleProduct, [e.target.name]: e.target.value });
  };

  const handleAddSingleProduct = () => {
    if (!singleProduct.productName || !singleProduct.modelName || !singleProduct.price) {
      setError('모든 필드를 입력해주세요.'); return;
    }
    const price = parseFloat(singleProduct.price.replace(/,/g, ''));
    if (isNaN(price) || price <= 0) { setError('유효한 가격을 입력해주세요.'); return; }
    setProducts([...products, { productName: singleProduct.productName, modelName: singleProduct.modelName, price }]);
    setFileUploaded(true);
    setSingleProduct({ productName: '', modelName: '', price: '' });
    setActiveTab('settings');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) { setError('xlsx, xls, csv 파일만 지원됩니다.'); return; }
    setLoading(true); setError('');
    try {
      const data = await readFile(file);
      setProducts(data); setFileUploaded(true); setActiveTab('settings');
    } catch (err) { setError('파일 처리 오류: ' + err.message); }
    setLoading(false);
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let parsed = [];
          if (file.name.endsWith('.csv') && typeof data === 'string') {
            const result = Papa.parse(data, { header: true, skipEmptyLines: true, dynamicTyping: true });
            if (result.errors?.length) { reject(new Error('CSV 파싱 오류')); return; }
            parsed = result.data;
          } else if (data) {
            const wb = XLSX.read(new Uint8Array(data), { type: 'array', cellDates: true });
            const ws = wb.Sheets[wb.SheetNames[0]];
            parsed = XLSX.utils.sheet_to_json(ws);
          }
          if (!parsed?.length) { reject(new Error('데이터가 없습니다.')); return; }
          const findField = (obj, names) => names.find(n => obj[n] !== undefined || Object.keys(obj).find(k => k.replace(/\s+/g, '').toLowerCase() === n.replace(/\s+/g, '').toLowerCase()));
          const first = parsed[0];
          const pf = findField(first, ['제품명', '품명', 'productName']);
          const mf = findField(first, ['모델명', '모델', 'modelName']);
          const rf = findField(first, ['일시불단가', '단가', '가격', 'price']);
          if (!pf || !mf || !rf) { reject(new Error('필수 필드를 찾을 수 없습니다.')); return; }
          resolve(parsed.map(item => ({
            productName: item[pf]?.toString() || '',
            modelName: item[mf]?.toString() || '',
            price: parseFloat(item[rf]?.toString().replace(/,/g, '') || '0')
          })));
        } catch { reject(new Error('파일 처리 오류')); }
      };
      reader.onerror = () => reject(new Error('파일 읽기 오류'));
      file.name.endsWith('.csv') ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
    });
  };

  const calculateRental = useCallback(() => {
    if (!products.length) return;
    const calculated = products.map(product => {
      const supplyPrice = product.price * (supplyRatePercent / 100);
      const adjustedPrice = Math.round(supplyPrice / 10) * 10;
      const rentalInfos = selectedPeriods.map(period => {
        const discountRate = discountRates[period] / 100;
        const totalRentalFee = product.price * discountRate;
        const monthlyRentalFee = Math.round(totalRentalFee / period / 10) * 10;
        const rentalFee = Math.round(totalRentalFee * (rentalFeeRates[period] / 100) / 10) * 10;
        const operatingFee = Math.round(monthlyRentalFee * (operatingFeeRates[period] / 100) / 10) * 10;
        return { period, discountRate: discountRates[period], totalRentalFee, monthlyRentalFee, rentalFee, operatingFee };
      });
      return { ...product, supplyPrice, adjustedPrice, rentalInfos };
    });
    setCalculatedProducts(calculated);
  }, [products, supplyRatePercent, discountRates, rentalFeeRates, operatingFeeRates, selectedPeriods]);

  useEffect(() => {
    if (fileUploaded && products.length) calculateRental();
  }, [fileUploaded, products, supplyRatePercent, discountRates, rentalFeeRates, operatingFeeRates, selectedPeriods, calculateRental]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length) handleFileUpload({ target: { files: e.dataTransfer.files } });
  };

  const downloadSample = () => {
    const ws = XLSX.utils.json_to_sheet([
      { '제품명': '에어컨', '모델명': 'AC-2000', '일시불단가': 1200000 },
      { '제품명': '냉장고', '모델명': 'REF-500', '일시불단가': 1500000 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '샘플');
    XLSX.writeFile(wb, '렌탈계산기_샘플양식.xlsx');
  };

  const exportResults = () => {
    const data = [];
    calculatedProducts.forEach(p => {
      const filtered = viewPeriod === 'all' ? p.rentalInfos : p.rentalInfos.filter(r => r.period === parseInt(viewPeriod));
      filtered.forEach(r => {
        const profitRate = ((r.totalRentalFee - r.rentalFee - r.operatingFee - p.supplyPrice) / r.totalRentalFee * 100).toFixed(1);
        data.push({
          '제품명': p.productName, '모델명': p.modelName, '일시불단가': p.price,
          '공급물대': Math.round(p.supplyPrice), '월렌탈료': r.monthlyRentalFee,
          '렌탈기간': `${r.period}개월`, '총렌탈료': Math.round(r.totalRentalFee),
          '카드수수료': r.rentalFee, '운영수수료': r.operatingFee, '수익률(%)': parseFloat(profitRate)
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '결과');
    XLSX.writeFile(wb, `렌탈계산결과_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Soft Blue Theme NavItem
  const NavItem = ({ tab, icon: Icon, label }) => (
    <button
      onClick={() => {
        if (tab === 'upload' || (tab === 'settings' && fileUploaded) || (tab === 'results' && calculatedProducts.length)) setActiveTab(tab);
      }}
      disabled={(tab === 'settings' && !fileUploaded) || (tab === 'results' && !calculatedProducts.length)}
      className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-2.5 rounded-lg transition-all
        ${activeTab === tab
          ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-200'
          : ((tab === 'settings' && !fileUploaded) || (tab === 'results' && !calculatedProducts.length))
            ? 'text-slate-400 cursor-not-allowed'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  // Soft Blue Theme Input
  const Input = ({ label, ...props }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <input {...props} className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 text-slate-900 flex">
      {/* Sidebar */}
      <nav className="w-56 bg-white/80 backdrop-blur-sm border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-200">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-base text-slate-800">렌탈료 계산기</span>
        </div>
        <div className="flex-1 p-3 space-y-1.5">
          <NavItem tab="upload" icon={CloudArrowUpIcon} label="데이터입력" />
          <NavItem tab="settings" icon={Cog6ToothIcon} label="계산설정" />
          <NavItem tab="results" icon={ChartBarIcon} label="계산결과" />
        </div>
        <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
          {fileUploaded ? (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              {products.length}개 상품 등록됨
            </span>
          ) : '상품을 등록하세요'}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-5 overflow-auto">
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl h-full flex flex-col shadow-xl shadow-slate-200/50">
          <div className="flex-1 p-6 overflow-auto">
            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-2xl">
                  <div className="animate-spin w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-sm text-slate-600 font-medium">처리중...</p>
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="grid grid-cols-2 gap-5">
                {/* Single Product Input Card */}
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                    단일 상품 입력
                  </h3>
                  <div className="space-y-3">
                    <Input label="제품명" name="productName" value={singleProduct.productName} onChange={handleSingleProductChange} placeholder="예: 냉장고" />
                    <Input label="모델명" name="modelName" value={singleProduct.modelName} onChange={handleSingleProductChange} placeholder="예: ABC-123" />
                    <Input label="일시불 단가" name="price" value={singleProduct.price} onChange={handleSingleProductChange} placeholder="예: 1000000" />
                    <button
                      onClick={handleAddSingleProduct}
                      className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
                    >
                      <PlusIcon className="w-4 h-4" /> 상품 추가
                    </button>
                  </div>
                </div>

                {/* File Upload Card */}
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                    파일 업로드
                  </h3>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                    }`}
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <DocumentArrowUpIcon className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p className="text-sm text-slate-600 font-medium">드래그 또는 클릭하여 업로드</p>
                    <p className="text-xs text-slate-400 mt-1">xlsx, xls, csv 파일 지원</p>
                    <input id="file-input" type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                  </div>
                  <button
                    onClick={downloadSample}
                    className="w-full mt-3 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" /> 샘플 양식 다운로드
                  </button>
                </div>

                {/* Registered Products Table */}
                {products.length > 0 && (
                  <div className="col-span-2 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                        등록된 상품 ({products.length})
                      </h3>
                      <button
                        onClick={() => { setProducts([]); setFileUploaded(false); setCalculatedProducts([]); }}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" /> 전체 삭제
                      </button>
                    </div>
                    <div className="max-h-44 overflow-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">제품명</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">모델명</th>
                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">단가</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products.map((p, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-2.5 text-slate-800 font-medium">{p.productName}</td>
                              <td className="px-4 py-2.5 text-slate-500">{p.modelName}</td>
                              <td className="px-4 py-2.5 text-right text-indigo-600 font-semibold">{p.price.toLocaleString()}원</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && fileUploaded && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  {/* Rental Period Selection */}
                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-indigo-500 rounded-full"></span>
                      렌탈 기간 선택
                    </h3>
                    <div className="flex gap-4">
                      {rentalPeriods.map(p => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer group">
                          <Checkbox.Root
                            checked={selectedPeriods.includes(p)}
                            onCheckedChange={() => handlePeriodToggle(p)}
                            className="w-5 h-5 bg-white border-2 border-slate-300 rounded-md flex items-center justify-center data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 transition-all group-hover:border-indigo-400"
                          >
                            <Checkbox.Indicator><CheckIcon className="w-3 h-3 text-white" /></Checkbox.Indicator>
                          </Checkbox.Root>
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">{p}개월</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Supply Rate */}
                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                      공급단가율
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={supplyRatePercent}
                        onChange={handleSupplyRateChange}
                        className="w-28 px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                      />
                      <span className="text-sm text-slate-500 font-medium">%</span>
                    </div>
                  </div>
                </div>

                {/* Rate Settings Table */}
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                    기간별 요율 설정
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">기간</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">할인률 (%)</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">카드수수료율 (%)</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide">운영수수료율 (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rentalPeriods.map(p => (
                          <tr key={p} className={`${!selectedPeriods.includes(p) ? 'opacity-40 bg-slate-50' : 'hover:bg-slate-50'} transition-all`}>
                            <td className="px-4 py-3 font-semibold text-slate-800">{p}개월</td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={discountRates[p]}
                                onChange={(e) => handleDiscountRateChange(p, e)}
                                disabled={!selectedPeriods.includes(p)}
                                className="w-20 px-2 py-1.5 text-center bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={rentalFeeRates[p]}
                                onChange={(e) => handleRentalFeeRateChange(p, e)}
                                disabled={!selectedPeriods.includes(p)}
                                className="w-20 px-2 py-1.5 text-center bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={operatingFeeRates[p]}
                                onChange={(e) => handleOperatingFeeRateChange(p, e)}
                                disabled={!selectedPeriods.includes(p)}
                                className="w-20 px-2 py-1.5 text-center bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={() => { calculateRental(); setActiveTab('results'); }}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
                >
                  계산하기
                </button>
              </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && calculatedProducts.length > 0 && (
              <div className="space-y-5">
                {/* Filters and Export */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 font-medium">기간 필터:</span>
                    <select
                      value={viewPeriod}
                      onChange={(e) => setViewPeriod(e.target.value)}
                      className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="all">전체</option>
                      {selectedPeriods.map(p => <option key={p} value={p}>{p}개월</option>)}
                    </select>
                  </div>
                  <button
                    onClick={exportResults}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-200"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" /> 엑셀 다운로드
                  </button>
                </div>

                {/* Results Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="max-h-[calc(100vh-280px)] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">제품명</th>
                          <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">모델명</th>
                          <th className="px-3 py-3 text-right text-xs font-bold text-violet-600 uppercase tracking-wide">일시불</th>
                          <th className="px-3 py-3 text-right text-xs font-bold text-amber-600 uppercase tracking-wide">공급물대</th>
                          <th className="px-3 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wide">월렌탈료</th>
                          <th className="px-3 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wide">기간</th>
                          <th className="px-3 py-3 text-right text-xs font-bold text-indigo-600 uppercase tracking-wide">총렌탈료</th>
                          <th className="px-3 py-3 text-right text-xs font-bold text-emerald-600 uppercase tracking-wide">카드수수료</th>
                          <th className="px-3 py-3 text-right text-xs font-bold text-cyan-600 uppercase tracking-wide">운영수수료</th>
                          <th className="px-3 py-3 text-right text-xs font-bold text-rose-600 uppercase tracking-wide">수익률</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {calculatedProducts.map((p, i) => {
                          const infos = viewPeriod === 'all' ? p.rentalInfos : p.rentalInfos.filter(r => r.period === parseInt(viewPeriod));
                          return infos.map((r, j) => {
                            const profitRate = ((r.totalRentalFee - r.rentalFee - r.operatingFee - p.supplyPrice) / r.totalRentalFee * 100);
                            return (
                              <tr key={`${i}-${j}`} className="hover:bg-slate-50 transition-colors">
                                <td className="px-3 py-3 text-slate-800 font-semibold">{p.productName}</td>
                                <td className="px-3 py-3 text-slate-500">{p.modelName}</td>
                                <td className="px-3 py-3 text-right text-violet-600 font-semibold">{p.price.toLocaleString()}</td>
                                <td className="px-3 py-3 text-right text-amber-600 font-semibold">{Math.round(p.supplyPrice).toLocaleString()}</td>
                                <td className="px-3 py-3 text-right font-bold text-blue-600">{r.monthlyRentalFee.toLocaleString()}</td>
                                <td className="px-3 py-3 text-center">
                                  <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">{r.period}개월</span>
                                </td>
                                <td className="px-3 py-3 text-right text-indigo-600 font-semibold">{Math.round(r.totalRentalFee).toLocaleString()}</td>
                                <td className="px-3 py-3 text-right text-emerald-600 font-semibold">{r.rentalFee.toLocaleString()}</td>
                                <td className="px-3 py-3 text-right text-cyan-600 font-semibold">{r.operatingFee.toLocaleString()}</td>
                                <td className="px-3 py-3 text-right font-bold text-rose-600">
                                  {profitRate.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          });
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200 text-center text-xs text-slate-400">
            2025 렌탈료 계산기
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><RentalCalculator /></React.StrictMode>);
