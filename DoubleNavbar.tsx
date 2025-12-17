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

// 아이콘 컴포넌트들
const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);

const ResultsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const CalculatorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
  </svg>
);

const iconComponents: { [key: string]: React.FC } = {
  upload: UploadIcon,
  settings: SettingsIcon,
  results: ResultsIcon,
};

export const DoubleNavbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  fileUploaded,
  calculatedProductsLength,
}) => {
  const [activeMainLink, setActiveMainLink] = React.useState('calculator');

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
    <nav className="h-screen bg-gray-900 flex flex-shrink-0">
      {/* 왼쪽 아이콘 바 */}
      <div className="w-16 bg-gray-950 flex flex-col items-center py-4 border-r border-gray-800">
        {/* 로고 */}
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6">
          <span className="text-white font-bold text-lg">R</span>
        </div>

        {/* 메인 아이콘 링크들 */}
        <div className="flex flex-col gap-2 flex-1">
          <button
            onClick={() => setActiveMainLink('home')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative
              ${activeMainLink === 'home'
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:bg-gray-800 hover:text-white'
              }`}
            title="Home"
          >
            <HomeIcon />
          </button>
          <button
            onClick={() => setActiveMainLink('calculator')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative
              ${activeMainLink === 'calculator'
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:bg-gray-800 hover:text-white'
              }`}
            title="Calculator"
          >
            <CalculatorIcon />
          </button>
        </div>
      </div>

      {/* 오른쪽 서브 네비게이션 */}
      <div className="w-48 flex flex-col bg-gray-900 border-r border-gray-800">
        {/* 제목 */}
        <div className="h-14 px-4 flex items-center border-b border-gray-800">
          <h2 className="font-semibold text-gray-200 text-sm">렌탈료 계산기</h2>
        </div>

        {/* 링크 목록 */}
        <div className="flex-1 py-2">
          {linksMockdata.map((link) => {
            const disabled = isLinkDisabled(link.value);
            const active = activeTab === link.value;
            const IconComponent = iconComponents[link.value];

            return (
              <button
                key={link.value}
                onClick={() => handleLinkClick(link.value)}
                disabled={disabled}
                className={`w-full px-4 py-2.5 text-left transition-all duration-200 flex items-center gap-3 text-sm
                  ${active
                    ? 'bg-purple-500/20 text-purple-400 border-l-2 border-purple-500 font-medium'
                    : disabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-l-2 border-transparent'
                  }`}
              >
                {IconComponent && <IconComponent />}
                {link.label}
              </button>
            );
          })}
        </div>

        {/* 하단 정보 */}
        <div className="px-4 py-3 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            {fileUploaded ? 'v1.0.0' : '파일을 업로드하세요'}
          </p>
        </div>
      </div>
    </nav>
  );
};

export default DoubleNavbar;
