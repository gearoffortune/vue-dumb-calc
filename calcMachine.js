let {Machine, interpret, assign} = require('xstate');


const actionSet = {
    addNumToFirstOperand: assign({
        firstOperand: (context, event) => {
            return context.firstOperand === '0' ? event.number : context.firstOperand + event.number;
        }
    }),
    setOperator: assign({
        operator: (_, event) => {
            return event.operator;
        }
    }),
    setResultAsOperand: assign({
        firstOperand: (context) =>{
            return context.result;
        },
        result: () => {
            return 0;
        }
    }),
    addNumToSecondOperand: assign({
        secondOperand: (context, event) => {
            return context.secondOperand === '0' ? event.number : context.secondOperand + event.number;
        }
    }),
    calculateResult: assign({
        result: (context) => {
            return context.operatorSet[context.operator](((-1)**Number(context.firstOperandNegative))*Number(context.firstOperand), Number(context.secondOperand))
        }
    }),
    setFirstOperandNegative: assign({
        firstOperandNegative: true
    })
}
const calcContext = {
    firstOperand: '0',
    firstOperandNegative: false,
    operator: undefined,
    secondOperand: '0',
    secondOperandNegative: false,
    result: 0,
    operatorSet: {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b
    }
}

const calcMachine = Machine({
    id: 'calculator',
    initial: 'start',
    states: {
        start: {
            on: { 
                NUMBER : {
                    target: 'firstOperand', 
                    cond: 'isNonNil',
                    actions: 'addNumToFirstOperand'
                },
                MINUS: {
                    target: 'firstNegative',
                    actions: 'setFirstOperandNegative'
                } 
            }
        },
        firstNegative: {
            on: {
                NUMBER: {
                    target: 'firstOperand',
                    cond: 'isNonNil',
                    actions: 'addNumToFirstOperand'
                }
            }
        },
        firstOperand: {
            on: {
                NUMBER: {
                    target: 'firstOperand', 
                    actions: 'addNumToFirstOperand'
                },
                OPERATOR: {
                    target: 'operator',
                    guards: 'isOperator',
                    actions: 'setOperator'
                }
            },
        },
        operator: {
            on: {
                NUMBER: {
                    target: 'secondOperand',
                    cond: 'isNonNil',
                    actions: 'addNumToSecondOperand'
                }, 
                OPERATOR: {
                    target: 'operator', 
                    cond: 'isOperator'
                }
            }
        },
        secondOperand: {
            on: {
                EQUALS: {
                target: 'result',
                actions: 'calculateResult',
                cond: 'isDivisibleByZero'
                },
                NUMBER: {
                    target: 'secondOperand',
                    actions: 'addNumToSecondOperand'
                }
        },
        },
        result: {
            on: {
                OPERATOR: {
                    target: 'operator',
                    actions: 'setResultAsOperand',
                    cond: 'isOperator'
                }
            }
        }
    },
    context: {...calcContext}
},
{
    guards: {
        isNonNil(_, event) {
            return event.number && event.number !== 0;
        },
        isOperator(_, event) {
            return !!event.operator;
        },
        isDivisibleByZero(context, event) {
            return context.operator !== '/' || context.secondOperand !== 0;
        }
    },
    actions: { ...actionSet }
})

const calc = interpret(calcMachine)
.onTransition((state) => console.log(state.context))
.start();

calc.send({type: 'NUMBER', number: "9"});
calc.send({type: 'OPERATOR', operator: "-"});
calc.send({type: 'NUMBER', number: "3"});
calc.send('EQUALS');