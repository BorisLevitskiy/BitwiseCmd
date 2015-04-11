app.set('expression', function() {
    "use strict";

    var exprRegex = /^(-?(?:\d+|0x[\d,a-f]+))\s*(<<|>>|>>>|\||\&|\^)\s*(-?(?:\d+|0x[\d,a-f]+))$/;
    var listRegex = /^(-?(?:\d+|0x[\d,a-f]+)\s?)+$/;

    return {
        canParse: function(string) {
            return exprRegex.test(string) || listRegex.test(string);
        },
        parse: function(string) {
            var trimmed = string.replace(/^\s+|\s+$/, '');

            var matches = exprRegex.exec(trimmed);

            if(matches != null) {
                return createCalculableExpression(matches);
            }

            matches = listRegex.exec(string);
            if(matches != null) {
                return createListOfNumbersExpression(string)
            }
        },
        parseOperand: function(input) {
            return new Operand(input);
        },
        createOperand: function(number, kind) {
            var str = number.toString(getBase(kind));
            if(kind == 'hex') {
                str = "0x" + str;
            }

            return new Operand(str);
        }

    };

    function createCalculableExpression(matches) {

        var m = new app.models.BitwiseOperation();
        m.operand1 = new Operand(matches[1]);
        m.operand2 = new Operand(matches[3]);
        m.sign = matches[2];
        m.string = matches.input;
        //m.result = eval(matches.input);

        return m;
    }

    function createListOfNumbersExpression(input) {
        var operands = [];
        input.split(' ').forEach(function(n){
            if(n.trim().length > 0) {
                operands.push(new Operand(n.trim()));
            }

        });

        return new app.models.BitwiseNumbers(operands);
    }

    function getBase(kind) {
        switch (kind){
            case 'bin': return 2;
            case 'hex': return 16;
            case 'dec': return 10;
        }
    }

    function Operand(input) {
        // console.log('input: ' + input);
        this.input = input;
        this.value = parseInt(input);
        // console.log('value: ' + this.value);
        var hex = this.value.toString(16);
        this.hex = hex.indexOf('-') == 0 ? '-0x' + hex.substr(1) : '0x' + hex;
        this.dec = this.value.toString(10);
        this.bin = (this.value>>>0).toString(2);
        this.kind = this.input.indexOf('0x') > -1 ? 'hex' : 'dec';
        this.other = this.kind == 'dec' ? this.hex : this.dec;
    }

    Operand.prototype.valueOf = function () {
        return this.value;
    };
});