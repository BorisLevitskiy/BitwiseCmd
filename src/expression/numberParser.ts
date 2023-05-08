import { INT32_MAX_VALUE, INT32_MIN_VALUE } from "../core/const";
import { NumberBase } from "../core/formatter";
import { BoundedNumber, asBoundedNumber } from "../core/types";

// byte -i8 or b
// single - i16 or s 

const decimalRegex = /^-?\d+[l,L,S,s,B,b]?$/;
const hexRegex = /^-?0x[0-9,a-f]+[l,L,S,s,B,b]?$/i;
const binRegex = /^-?0b[0-1]+[l,L,S,s,B,b]?$/i;

interface ParserConfig {
    regex: RegExp,
    base: NumberBase,
    parse: (input: string) => BoundedNumber 
}

export interface ParsedNumber {
    value: BoundedNumber;
    base: NumberBase;
    input: string;
}

var knownParsers : ParserConfig[] = [
    { regex: decimalRegex, base: 'dec', parse:(s) => parseIntSafe(s, 10) },
    { regex: hexRegex, base: 'hex', parse:(s) => parseIntSafe(s, 16)},
    { regex: binRegex, base: 'bin', parse:(s) => parseIntSafe(s, 2) }];


class NumberParser {

    parsers: ParserConfig[];

    constructor(parsers: ParserConfig[])
    {
        this.parsers = parsers;
    }

    parse (input : string) : ParsedNumber | null {
        return this.parsers.map(p => this.applyParser(p, input)).reduce((c, n) => c || n);
    };

    parseOperator (input: string) : string | null {
        var m = input.match(input);
        
        if(m == null || m.length == 0) {
            return null;
        }

        return m[0];
    };

    applyParser(parser : ParserConfig, rawInput: string) : ParsedNumber | null {
    
        if(!parser.regex.test(rawInput)) {
            return null;
        }
            
        var value = parser.parse(rawInput);
    
        return  {
            value: value,
            base: parser.base,
            input: rawInput
        }    
    }
}

const MAX_SAFE_INTn = BigInt(INT32_MAX_VALUE);
const MIN_SAFE_INTn = BigInt(INT32_MIN_VALUE);

function parseIntSafe(input : string, radix: number)  : BoundedNumber {
    
    const bigIntStr = input.replace('-', '').replace('l', '').replace('L', '');
    let bigInt = BigInt(bigIntStr);
    const isNegative = input.startsWith('-');
    const isBigInt = input.toLowerCase().endsWith('l');

    if(isNegative) bigInt *= BigInt(-1);

    if(isBigInt) return asBoundedNumber(bigInt);

    if(bigInt > MAX_SAFE_INTn)
        return asBoundedNumber(bigInt);

    if(bigInt < MIN_SAFE_INTn)
        return asBoundedNumber(bigInt);

    return asBoundedNumber(parseInt(input.replace(/0(x|b)/, ''), radix));
}

const numberParser = new NumberParser(knownParsers);

export {numberParser};