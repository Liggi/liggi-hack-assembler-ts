import { argv } from 'process';
import { parse } from './parser';

(async function main() {
  const filename:string = argv[2];
  if (!filename) { console.error('No file specified for assembly'); return null };

  const input: string = await Bun.file(filename).text();

  const output = parse(input);

  const outputFilename: string = filename.replace('.asm', '.hack');
  Bun.write(outputFilename, output.join('\n'));
}());

