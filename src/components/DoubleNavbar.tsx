import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  fileUploaded: boolean;
  calculatedProductsLength: number;
}

const linksMockdata = [
  { label: '데이터입력', value: 'upload' },
  { label: '계산설정', value: 'settings' },
  { label: '계산결과', value: 'results' },
];

export const DoubleNavbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  fileUploaded,
  calculatedProductsLength,
}) => {
  const handleLinkClick = (value: string) => {
    if (value === 'upload') {
      setActiveTab(value);
    } else if (value === 'settings' && fileUploaded) {
      setActiveTab(value);
    } else if (value === 'results' && calculatedProductsLength > 0) {
      setActiveTab(value);
    }
  };

  const isLinkDisabled = (value: string) => {
    if (value === 'settings' && !fileUploaded) return true;
    if (value === 'results' && calculatedProductsLength === 0) return true;
    return false;
  };

  return (
    <nav className="h-screen bg-gray-900 border-r border-gray-700 flex flex-col w-56 flex-shrink-0">
      {/* 로고 & 제목 */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-gray-700">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <h2 className="font-semibold text-gray-100 text-base">렌탈료 계산기</h2>
      </div>

      {/* 링크 목록 */}
      <div className="flex-1 py-4">
        {linksMockdata.map((link) => {
          const disabled = isLinkDisabled(link.value);
          const active = activeTab === link.value;

          return (
            <button
              key={link.value}
              onClick={() => handleLinkClick(link.value)}
              disabled={disabled}
              className={`w-full px-5 py-3 text-left transition-all duration-200 flex items-center gap-3
                ${active
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500 font-medium'
                  : disabled
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
            >
              {link.value === 'upload' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              )}
              {link.value === 'settings' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              )}
              {link.value === 'results' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              )}
              {link.label}
            </button>
          );
        })}
      </div>

      {/* 하단 정보 */}
      <div className="px-5 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          {fileUploaded ? '파일 업로드 완료' : '파일을 업로드하세요'}
        </p>
      </div>
    </nav>
  );
};

export default DoubleNavbar;
