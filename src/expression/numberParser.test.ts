import exp from 'constants';
import calc from '../core/calc';
import {numberParser, ParsedNumber} from './numberParser';

describe("parser", () => {

    it('parses decimal number', () => {
        const result = numberParser.parse('10');
        expect(result).not.toBeNull();

        var number = result as ParsedNumber;
        expect(number.value).toBe(10);
        expect(number.base).toBe('dec');
        expect(number.input).toBe('10');
    });

    it('parses bigint numbers', () => {
        const dec = numberParser.parse('10L');
        expect(dec).not.toBeNull();

        expect(dec?.value).toBe(BigInt(10));
        expect(typeof dec?.value).toBe("bigint");
        expect(dec?.base).toBe('dec');
        expect(dec?.input).toBe('10L');
        
        const bin = numberParser.parse('0b10l');
        expect(bin).not.toBeNull();

        expect(bin?.value).toBe(BigInt(2));
        expect(typeof bin?.value).toBe("bigint");
        expect(bin?.base).toBe('bin');
        expect(bin?.input).toBe('0b10l');

        const hex = numberParser.parse('0xfL');
        expect(hex).not.toBeNull();

        expect(hex?.value.toString()).toBe(BigInt(15).toString());
        expect(typeof hex?.value).toBe("bigint");
        expect(hex?.base).toBe('hex');
        expect(hex?.input).toBe('0xfL');
    });


    it('switches to bigint if value exceeds max safe int', () => {
        const unsafeInt = BigInt(Number.MAX_SAFE_INTEGER)+BigInt(1);
        
        const dec = numberParser.parse(unsafeInt.toString());
        expect(dec?.value).toEqual(unsafeInt);
        expect(dec?.base).toBe('dec');

        const bin = numberParser.parse("0b" + unsafeInt.toString(2));
        expect(bin?.value).toEqual(unsafeInt);
        expect(bin?.base).toEqual('bin');

        const hex = numberParser.parse("0x" + unsafeInt.toString(16));
        expect(hex?.value).toEqual(unsafeInt);
        expect(hex?.base).toEqual('hex');
    });

    it('switches to bigint if value exceeds max safe negative int', () => {
        const unsafeInt = BigInt(Number.MIN_SAFE_INTEGER)-BigInt(1);
        
        const dec = numberParser.parse(unsafeInt.toString());
        expect(dec?.value.toString()).toEqual(unsafeInt.toString());
        expect(dec?.base).toBe('dec');

        const bin = numberParser.parse("-0b" + unsafeInt.toString(2).replace('-', ''));
        expect(bin?.value.toString()).toEqual(unsafeInt.toString());
        expect(bin?.base).toEqual('bin');

        const hex = numberParser.parse("-0x" + unsafeInt.toString(16).replace('-',''));
        expect(hex?.value.toString()).toEqual(unsafeInt.toString());
        expect(hex?.base).toEqual('hex');
    });

    it('parses hex number', () => {
        const result = numberParser.parse('0xab');
        expect(result).not.toBeNull();

        var number = result as ParsedNumber;
        expect(number.value).toBe(171);
        expect(number.base).toBe('hex');
        expect(number.input).toBe('0xab');
    });

    it('parses bin number', () => {
        var result = numberParser.parse('0b0110');
        expect(result).not.toBeNull();

        var number = result as ParsedNumber;
        expect(number.value).toBe(6);
        expect(number.base).toBe('bin');
        expect(number.input).toBe('0b0110');
    });

    it('returns null on bad inputs', () => {
        expect(numberParser.parse('abc')).toBeNull();
        expect(numberParser.parse('')).toBeNull();
    });

    it('parses big int', () => {
        var v =  numberParser.parse('1l')?.value
        expect(typeof v).toBe("bigint");
        expect(v?.toString()).toBe("1");
    })
});