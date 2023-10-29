import assert from 'node:assert';
import { tokenizer, buildTree, transform } from './index.js';


const input = "(length - 2.2) * 3 - 10 * 3"

const tokens = [
  { type: 3, content: '(' },
  { type: 2, content: 'length' },
  { type: 0, content: '-' },
  { type: 1, content: '2.2' },
  { type: 3, content: ')' },
  { type: 0, content: '*' },
  { type: 1, content: '3' },
  { type: 0, content: '-' },
  { type: 1, content: '10' },
  { type: 0, content: '*' },
  { type: 1, content: '3' }
]

const tree = {
  "type": "BinaryExpression",
  "value": "-",
  "left": {
    "type": "BinaryExpression",
    "value": "*",
    "left": {
      "type": "BinaryExpression",
      "value": "-",
      "left": {
        "type": "Variable",
        "value": "length"
      },
      "right": {
        "type": "Number",
        "value": "2.2"
      }
    },
    "right": {
      "type": "Number",
      "value": "3"
    }
  },
  "right": {
    "type": "BinaryExpression",
    "value": "*",
    "left": {
      "type": "Number",
      "value": "10"
    },
    "right": {
      "type": "Number",
      "value": "3"
    }
  }
}

const json = {
  "-": [
    {
      "*": [
        {
          "-": [
            {
              "var": "length"
            },
            2.2
          ]
        },
        3
      ]
    },
    {
      "*": [
        10,
        3
      ]
    }
  ]
}


assert.deepEqual(tokenizer(input), tokens, "Tokenizer should turn string into tokens.")
assert.deepEqual(buildTree((tokens)), tree, "buildTree should turn tokens into a tree.")
assert.deepEqual(transform(tree as any), json, "transform should turn tree into a JSON object.")