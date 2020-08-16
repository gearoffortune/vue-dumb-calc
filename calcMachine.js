let {Machine, interpret} = require('xstate');


const numInputMachine = Machine({
    initial: 'allNil',
    states: {
        allNil: {
            on: {ZERO: 'allNil' , NON_ZERO: 'nonAllNil'} 
        },
        nonAllNil: {
            on: {ZERO: 'nonAllNil', NON_ZERO: 'nonAllNil'}
        }
    }
})

const calcMachine = Machine({
    id: 'calculator',
    initial: 'start',
    states: {
        start: {
            on: { NUMBER : 'firstOperand', MINUS: 'firstNegative' }
        },
        firstNegative: {
            on: {NUMBER: 'firstOperand'}
        },
        firstOperand: {
            on: {NUMBER: 'firstOperand', OPERATOR: 'operator'},
        initial: 'allNil',
            states: {
                allNil: {
                    on: {ZERO: 'allNil' , NON_ZERO: 'nonAllNil'} 
                },
                nonAllNil: {
                    on: {ZERO: 'nonAllNil', NON_ZERO: 'nonAllNil'}
                }
    }
        },
        operator: {
            on: {NUMBER: 'secondOperand', OPERATOR: 'operator', MINUS: 'secondNegative'}
        },
        secondNegative: {
            on: {NUMBER: 'secondOperand'}
        },
        secondOperand: {
            on: {EQUALS: 'result'},
        initial: 'allNil',
            states: {
                allNil: {
                    on: {ZERO: 'allNil' , NON_ZERO: 'nonAllNil'} 
                },
                nonAllNil: {
                    on: {ZERO: 'nonAllNil', NON_ZERO: 'nonAllNil'}
                }
    }
        },
        result: {
            on: {OPERATOR: 'operator'}
        }
    }
})

const calc = interpret(calcMachine)
.onTransition((state) => console.log(state.value))
.start();

calc.send('NUMBER');
calc.send('ZERO');
calc.send('ZERO');
calc.send('ZERO');
calc.send('NON_ZERO');
calc.send('OPERATOR');
calc.send('NUMBER');
calc.send('NON_ZERO');