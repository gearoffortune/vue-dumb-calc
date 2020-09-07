<template>
    <div id="app">
        <div class="output">
            <div v-if="state.matches('start')||state.matches('firstOperand')">{{state.context.firstOperand}}</div>
            <div v-if="state.matches('operator')">{{state.context.operator}}</div>
            <div v-if="state.matches('secondOperand')">{{state.context.secondOperand}}</div>
            <div v-if="state.matches('result')">{{state.context.result}}</div>
        </div>
        <button @click="send(getNumberEvent('1'))">1</button>
        <button @click="send(getNumberEvent('2'))">2</button>
        <button @click="send(getNumberEvent('3'))">3</button>
        <button @click="send(getNumberEvent('4'))">4</button>
        <button @click="send(getNumberEvent('5'))">5</button>
        <button @click="send(getNumberEvent('6'))">6</button>
        <button @click="send(getNumberEvent('7'))">7</button>
        <button @click="send(getNumberEvent('8'))">8</button>
        <button @click="send(getNumberEvent('9'))">9</button>
        <button @click="send(getNumberEvent('0'))">0</button>
        <button @click="send(getOperatorEvent('+'))">+</button>
        <button @click="send(getOperatorEvent('-'))">-</button>
        <button @click="send(getOperatorEvent('/'))">/</button>
        <button @click="send(getOperatorEvent('*'))">*</button>
        <button @click="send('EQUALS')">=</button>
        <button @click="send('CLEAR_EVERYTHING')">CE</button>
    </div>
</template>

<script>
//TODO: investigate why state machine doesn't work when imported but works
//when copy-pasted
import { useMachine } from "@xstate/vue";
import {Machine, assign} from'xstate';


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
        },
        secondOperand: () => {
            return '0';
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
    }),
    resetAll: assign({
        firstOperand: () => '0',
        firstOperandNegative: () => false,
        operator:() => undefined,
        secondOperand: () => '0',
        secondOperandNegative:() => false,
        result: () => 0,
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
                    actions: ['setResultAsOperand', 'setOperator'],
                    cond: 'isOperator'
                }
            }
        }
    },
    context: {...calcContext},
    on: {
        CLEAR_EVERYTHING: {target: 'start', actions: 'resetAll'}
    }
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
function getNumberEvent(number) {
    return {
        type: 'NUMBER',
        number
    }
}

function getOperatorEvent(operator) {
    return {
        type: 'OPERATOR',
        operator
    }
}

export default {
    name: 'App',
    setup() {
    const { state, send } = useMachine(calcMachine);
    return { state, send, getNumberEvent, getOperatorEvent };
  }
}
</script>