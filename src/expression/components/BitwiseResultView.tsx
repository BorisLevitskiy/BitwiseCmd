import React from 'react';
import formatter from '../../core/formatter';
import BinaryStringView, { FlipBitEventArg } from '../../core/components/BinaryString';
import BitwiseResultViewModel from './BitwiseResultViewModel';
import { Expression, ExpressionElement } from '../expression-interfaces';
import { Operator, Operand, ListOfNumbers } from '../expression';
import calc from '../../core/calc';

type BitwiseResultViewProps = {
    expression: Expression;
    emphasizeBytes: boolean;
}

type BitwiseResultViewState = {

}

export default class BitwiseResultView extends React.Component<BitwiseResultViewProps, BitwiseResultViewState>  {
    maxSeenLengthNumberOfBits: number;

    constructor(props: BitwiseResultViewProps) {
        super(props);
        this.state = {};
        this.maxSeenLengthNumberOfBits = 0;
    }

    render() {

         let model : BitwiseResultViewModel | null = null
         const isListOfNumbers = this.props.expression instanceof ListOfNumbers;
        
        try
        { 
            model = BitwiseResultViewModel.createModel(this.props.expression, this.props.emphasizeBytes);
        }
        catch(err) {
            const text = (err as any).message;
            return <div className='error'>Error: {text}</div>
        }

        var rows = this.getRows(model!, isListOfNumbers);

        return <table className="expression">
            <tbody>
                {rows}
            </tbody>
        </table>
    }

    getRows(model: BitwiseResultViewModel, allowSignChange : boolean): JSX.Element[] {

        this.maxSeenLengthNumberOfBits = Math.max(model.maxNumberOfBits, this.maxSeenLengthNumberOfBits);

        return model.items.map((itm, i) =>
            <ExpressionRow
                key={i}
                sign={itm.sign}
                css={itm.css}
                bitSize={itm.maxBitSize}
                allowFlipBits={itm.allowFlipBits}
                allowSignChange={allowSignChange}
                expressionItem={itm.expression}
                emphasizeBytes={this.props.emphasizeBytes}
                maxNumberOfBits={this.maxSeenLengthNumberOfBits}
                onBitFlipped={() => this.onBitFlipped()} />);
    }

    onBitFlipped() {
        this.forceUpdate();
        //this.setState({d:new Date()});
    }
}

type ExpressionRowProps = {
    sign: string,
    css: string,
    bitSize: number,
    maxNumberOfBits: number,
    emphasizeBytes: boolean,
    allowFlipBits: boolean,
    allowSignChange: boolean,
    expressionItem: ExpressionElement,
    onBitFlipped: any
}

class ExpressionRow extends React.Component<ExpressionRowProps> {
    
    infoWasShown: boolean = false;

    constructor(props: ExpressionRowProps) {
        super(props);
        this.state = { operand: null };
    }

    render() {
        const { sign, css, maxNumberOfBits, emphasizeBytes, allowFlipBits } = this.props;
        const scalar =  this.props.expressionItem.evaluate();
        const bin = formatter.numberToString(scalar.value, 'bin').padStart(maxNumberOfBits, '0');
        const signBitIndex = scalar.value.signed && bin.length >= scalar.value.maxBitSize ? bin.length - scalar.value.maxBitSize : -1;

        return <tr className={"row-with-bits " + css}>
            <td className="sign">{sign}</td>
            <td className="label">{this.getLabel()}</td>
            <td className="bin">
                <BinaryStringView
                    emphasizeBytes={emphasizeBytes}
                    binaryString={bin}
                    allowFlipBits={allowFlipBits}
                    signBitIndex={signBitIndex}
                    onFlipBit={args => this.flipBit(args)} />
            </td>
            <td className="other">{this.getAlternative()}</td>
            <td className="info accent1" data-test-name='ignore'>{this.getInfo(maxNumberOfBits)}</td>
        </tr>;;
    }

    getLabel(): string {

        // For expressions like |~2 
        // TODO: find a better way...
        if (this.props.expressionItem.isOperator) {
            const ex = this.props.expressionItem as Operator;
            return ex.operator + this.getLabelString(ex.getUnderlyingOperand());
        }

        return this.getLabelString(this.props.expressionItem.getUnderlyingOperand());
    }

    getAlternative() {

        if (this.props.expressionItem.isOperator) {
            const ex = this.props.expressionItem as Operator;
            const res = ex.evaluate();

            return formatter.numberToString(res.value, res.base);
        }

        const v = this.props.expressionItem.evaluate();
        const altBase = formatter.getAlternativeBase(v.base);
        return formatter.numberToString(v.value, altBase);
    }

    getLabelString(op: Operand): string {
        return formatter.numberToString(op.value, op.base == 'bin' ? 'dec' : op.base);
    }

    flipBit(args: FlipBitEventArg) {

        const op = this.props.expressionItem.getUnderlyingOperand();
        const { bitIndex: index, binaryStringLength: totalLength } = args;

        const maxBitSize = op.value.maxBitSize;
        const space = (totalLength - index - maxBitSize);
        if(totalLength > op.value.maxBitSize && space > 0) {
            op.setValue(calc.addSpace(op.value, space));
        }

        const pad = op.value.maxBitSize - totalLength;
        const newValue = calc.flipBit(op.value, pad + index);
        op.setValue(newValue);
        this.props.onBitFlipped();
    }

    onChangeSign () {
        var op = this.props.expressionItem.getUnderlyingOperand();
        op.setValue(op.value.signed ? op.value.toUnsigned() : op.value.toSigned());
        this.forceUpdate();
    }

    getInfo(maxNumberOfBits:number) {
        
        const op = this.props.expressionItem.getUnderlyingOperand();
        const allBitsDisplayed = op.value.maxBitSize != 32 || op.value.maxBitSize <= maxNumberOfBits;
        const { allowSignChange } = this.props;
        const hasLabel = op.label.length > 0;

        if(!allBitsDisplayed && !hasLabel && !this.infoWasShown)
            return null;

        this.infoWasShown = true;

        const children = [];
        let title = `BitwiseCmd treats this number as ${op.value.maxBitSize}-bit integer`;
        let text = `${op.value.maxBitSize}-bit `;
        const signedStr = op.value.signed ? 'signed' : 'unsigned';
        const signedOther = op.value.signed ? 'usigned' : 'signed'; 
        const signedTitle = `Click to change to ${signedOther} preserving the same bits`; 

        if(op.label.length > 0)
        {
            text += " (converted)";
            title += ". This number was converted to facilitate bitwise operation with an operand of a different type";
        }

        children.push(<span title={title} style={{cursor:"help"}}>{text.trim()}</span>);
                
        if(allBitsDisplayed)
        {
            if(allowSignChange)
                children.push(<button className='accent1' title={signedTitle} onClick={() => this.onChangeSign()}>{signedStr}</button>);
            else if(!op.value.signed)
                children.push(<span className='accent1'> {signedStr}</span>)
        }

        return <React.Fragment>{children}</React.Fragment>
    }
}