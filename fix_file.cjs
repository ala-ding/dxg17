const fs = require('fs');
const content = fs.readFileSync('src/pages/MatchPage.tsx', 'utf8');
const lines = content.split('\n');
// Line 873 is index 872
// Line 874 is index 873
const fixedLines = [
  ...lines.slice(0, 873), // lines 1 to 873
  '            <p className="text-[17px] text-white/40 font-medium">这些信息将被用于生成你的定制方案。</p>',
  '          </header>',
  '          <button ',
  '             onClick={() => setViewState(\'PLAN_DETAIL\')}',
  '             className="px-12 py-5 bg-white text-black rounded-[32px] text-[16px] font-black shadow-xl"',
  '          >',
  '            进入并更新我的方案',
  '          </button>',
  '        </div>',
  '      );',
  '    }',
  '  };',
  '',
  '  const renderPlanDetail = () => {',
  '    const completenessInfo = getCompletenessText();',
  ...lines.slice(874) // from line 875
];
fs.writeFileSync('src/pages/MatchPage.tsx', fixedLines.join('\n'));
console.log('File fixed successfully');
