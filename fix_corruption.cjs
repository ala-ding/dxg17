const fs = require('fs');
let content = fs.readFileSync('src/pages/MatchPage.tsx', 'utf8');

// Remove null characters and other common corruption markers
content = content.replace(/\0/g, '');
// Replace the weird character I saw 
content = content.replace(/\uFFFD/g, '');

const lines = content.split('\n');

// Specific fix for the budget tab ending and AI tab inclusion
// We want to remove lines 1341 to 1349 (0-indexed 1340 to 1348 approx)
// and make sure planTab === 'ai' is inside the return.

// Actually, it's safer to just re-read the file and find the target string.
// Let's find:
// 1334:                            </section>
// 1335:                         </div>
// 1336:                      </div>
// 1337:                   </div>
// 1338:                </div>
// 1339:             </div>
// 1340:           )}
// 1341:         </div>
// 1342:       </div>
// 1343:     );
// 1344: 取优化报价</button>

// I will just use a regex to fix the specific corruption at line 1344.
// Find the pattern: );[garbage]{planTab === 'ai' && (
// And replace it with just: {planTab === 'ai' && (

// Let's try a more surgical approach.
const brokenRegex = /\);[\s\S]*?\{planTab === 'ai' && \(/;
if (brokenRegex.test(content)) {
  console.log('Found the broken block at line 1344. Fixing...');
  content = content.replace(brokenRegex, '{planTab === \'ai\' && (');
}

// Also, the previous fix might have left a trailing brace error if we have too many or too few.
// TSC complained about line 2235: '}' expected.
// Let's check the end of file braces.

fs.writeFileSync('src/pages/MatchPage.tsx', content);
console.log('File cleaned and fixed.');
