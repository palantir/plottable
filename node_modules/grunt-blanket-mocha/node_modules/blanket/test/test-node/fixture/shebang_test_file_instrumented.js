if (typeof _$jscoverage === 'undefined') _$jscoverage = {};
if (typeof _$jscoverage['shebang_test_file.js'] === 'undefined'){_$jscoverage['shebang_test_file.js']=[];
_$jscoverage['shebang_test_file.js'].source=['#!/usr/bin/env node',
'',
'//this is test source',
'var test=\'1234\';',
'if (test === \'1234\')',
'  console.log(true);',
'//comment',
'console.log(test);',
''];
_$jscoverage['shebang_test_file.js'][4]=0;
_$jscoverage['shebang_test_file.js'][5]=0;
_$jscoverage['shebang_test_file.js'][6]=0;
_$jscoverage['shebang_test_file.js'][8]=0;
}
//this is test source
_$jscoverage['shebang_test_file.js'][4]++;
var test='1234';
_$jscoverage['shebang_test_file.js'][5]++;
if (test === '1234')
  {
_$jscoverage['shebang_test_file.js'][6]++;
console.log(true);}

//comment
_$jscoverage['shebang_test_file.js'][8]++;
console.log(test);
