import { InstructionType, computations, destinations, jumps } from './types';
import Symbols from './symbols';

function parse(input: string) {
  let lines = formatToLines(input);

  // Run over the labels to parse relevant symbols, then strip the labels out
  parseLabels(lines);
  lines = lines.filter(line => !line.startsWith('('));

  return lines.map((line) => parseInstruction(line));
};

function parseLabels(lines: string[]) {
  let lineNumber = 0;
  lines.forEach((line, index) => {
    const instructionType = getInstructionType(line);
    if (instructionType === 'L') {
      // Add symbol to symbol table
      const label = line.replace('(', '').replace(')', '');
      const value = lineNumber.toString(2).padStart(16, '0');
      Symbols.add(label, value);
      return;
    } else {
      lineNumber++;
    }
  });
}

function parseInstruction(line: string): string {
  const instructionType = getInstructionType(line);
  switch (instructionType) {
    case 'A':
      return parseAInstruction(line);
    case 'C':
      return parseCInstruction(line);
    default:
      return;
  }
};

function formatToLines(input: string) {
  let lines = input.replace(/\r/g, '').split('\n');

  return lines
    .filter(line => isInstruction(line))
    .map(line => line.split('//')[0])
    .map(line => line.trim());
}

function parseAInstruction(line: string): string {
  let binary = '0'; // A instructions always start with 0

  const value = line.replace('@', '');

  // If it doesn't start with a digit, it's a symbol
  if (!value.match(/^\d/)) {
    if (Symbols.contains(value)) {
      return Symbols.get(value);
    } else {
      // Add symbol to symbol table
      Symbols.add(value);
      return Symbols.get(value);
    }
  }

  const binaryAddress = Number(value).toString(2).padStart(15, '0');
  
  // Convert the value to binary
  binary += binaryAddress;

  return binary;
}

function parseCInstruction(line: string): string {
  let currentLine = line;
  let binary = '111'; // C instructions always start with 111
  let destinationSegment = '000';
  let jumpSegment = '000';

  if (line.includes('=')) {
    const [destination, rest] = currentLine.split('=');
    currentLine = rest;
    
    if (destination in destinations) {
      destinationSegment = destinations[destination];
    }
  }

  if (line.includes(';')) {
    const [rest, jump] = currentLine.split(';');
    currentLine = rest;

    if (jump in jumps) {
      jumpSegment = jumps[jump];
    }
  }

  const computationSegment = computations[currentLine];

  return binary + computationSegment + destinationSegment + jumpSegment;
}

function isInstruction(line: string): boolean {
  if (line.trim() === '') return false;;
  if (line.startsWith('//')) return false;
  return true;
}

function getInstructionType(line: string): InstructionType {
  if (line.startsWith('@')) return 'A';
  if (line.startsWith('(')) return 'L';
  return 'C';
};

export { parse };