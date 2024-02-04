import assert from 'node:assert';
import parse, { tokenizer, buildTree, transform, transformObject } from './index.js';


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
  "type": 0,
  "value": "-",
  "left": {
    "type": 0,
    "value": "*",
    "left": {
      "type": 0,
      "value": "-",
      "left": {
        "type": 1,
        "value": "length"
      },
      "right": {
        "type": 2,
        "value": "2.2"
      }
    },
    "right": {
      "type": 2,
      "value": "3"
    }
  },
  "right": {
    "type": 0,
    "value": "*",
    "left": {
      "type": 2,
      "value": "10"
    },
    "right": {
      "type": 2,
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
assert.deepEqual(transformObject(json), input, "should turn object back to string")
assert.deepEqual(parse(json), input, "should parse object")
assert.deepEqual(parse(input), json, "should parse string")



const input2 = "(a1-length - 10) * 2"

const tokens2 = [
  { type: 3, content: '(' },
  { type: 2, content: 'a1-length' },
  { type: 0, content: '-' },
  { type: 1, content: '10' },
  { type: 3, content: ')' },
  { type: 0, content: '*' },
  { type: 1, content: '2' },
]


assert.deepEqual(tokenizer(input2), tokens2, "Tokenizer should turn key string into token correctly.")