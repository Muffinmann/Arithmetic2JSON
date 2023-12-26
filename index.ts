enum TokenType {
  OPERATOR,
  NUMBER,
  VARIABLE,
  PARENTHESES,
}

enum TreeNodeType {
  BINARY_EXPRESSION,
  VARIABLE,
  NUMBER,
  NULL,
}

type Token = {
  type: TokenType,
  content: string,
}

type TreeNode = {
  value: string,
} & (
    {
      type: TreeNodeType.BINARY_EXPRESSION,
      left: TreeNode,
      right: TreeNode
    }
    | {
      type: TreeNodeType.NUMBER | TreeNodeType.VARIABLE | TreeNodeType.NULL
    }
  )



const WHITE_SPACE = /^\s/
const INTEGER = /^[0-9]/
const OPERATOR = /^[+\-*/]/
const VARIABLE = /^[a-zA-Z_-]/
const PARENTHESES = /^[()]/

export const tokenizer = (input: string): Token[] => {
  let charIndex = 0;
  const tokens = [];
  const forward = () => {
    charIndex++;
  }
  while (charIndex < input.length) {
    let char = input[charIndex]
    if (WHITE_SPACE.test(char)) {
      forward()
      continue;
    }

    if (OPERATOR.test(char)) {
      tokens.push({
        type: TokenType.OPERATOR,
        content: char
      })
      forward()
      continue;
    }

    if (INTEGER.test(char)) {
      // collect all continuous integers as well as '.' for float numbers
      let num = ''
      while (INTEGER.test(char) || char === '.') {
        num += char
        forward()
        char = input[charIndex]
      }
      tokens.push({
        type: TokenType.NUMBER,
        content: num
      })
      continue;
    }

    if (VARIABLE.test(char)) {
      let word = ''
      while (VARIABLE.test(char)) {
        word += char
        forward()
        char = input[charIndex]
      }
      tokens.push({
        type: TokenType.VARIABLE,
        content: word,
      })
      continue;
    }

    if (PARENTHESES.test(char)) {
      tokens.push({
        type: TokenType.PARENTHESES,
        content: char
      })
      forward()
    }

  }
  return tokens;
}

// TODO shunting-yard algorithm
export const buildTree = (tokens: Token[]): TreeNode => {
  let nodeStack: TreeNode[] = []
  let index = 0;

  const forward = () => {
    index++
  }

  const consumeNext = () => {
    index++
    return tokens[index]
  }

  while (index < tokens.length) {
    let token = tokens[index]
    if (token.type === TokenType.PARENTHESES && token.content === "(") {
      // stack for collecting tokens inside parentheses
      const stack = []
      // do not collect parentheses
      token = consumeNext()
      while (token.content !== ")") {
        stack.push(token)
        token = consumeNext()
      }

      nodeStack.push(buildTree(stack))
      // skip the end parentheses
      forward()
      continue;
    }

    if (token.type === TokenType.OPERATOR) {
      const left = nodeStack.pop()
      if (!left) {
        throw (new Error("Stack empty."))
      }
      const value = token.content
      if (token.content === "*" || token.content === "/") {
        const right = consumeNext()
        if (right.type === TokenType.PARENTHESES) {
          const stack = []
          // do not collect parentheses
          token = consumeNext()
          while (token.content !== ")") {
            stack.push(token)
            token = consumeNext()
          }

          nodeStack.push({
            type: TreeNodeType.BINARY_EXPRESSION,
            value,
            left,
            right: buildTree(stack),
          })
          // skip the end parentheses
          forward()
        } else {
          nodeStack.push({
            type: TreeNodeType.BINARY_EXPRESSION,
            value,
            left,
            right: buildTree([right]),
          })
          forward()
        }
      } else {
        const stack = []
        forward()
        while (index < tokens.length) {
          const token = tokens[index]
          stack.push(token)
          forward()
        }

        const right = buildTree(stack)
        nodeStack.push({
          type: TreeNodeType.BINARY_EXPRESSION,
          value,
          left,
          right,
        })
      }
      continue;
    }

    if (token.type === TokenType.NUMBER) {
      nodeStack.push({
        type: TreeNodeType.NUMBER,
        value: token.content
      })
      forward()
      continue;
    }

    if (token.type === TokenType.VARIABLE) {
      nodeStack.push({
        type: TreeNodeType.VARIABLE,
        value: token.content
      })
      forward()
      continue;
    }
  }

  return nodeStack.pop() || { type: TreeNodeType.NULL, value: "No Token Found." }
}


export const transform = (node: TreeNode) => {
  const transformTree: any = {}
  if (node.type === TreeNodeType.NULL) {
    console.log(node.value)
    return transformTree
  }
  if (node.type === TreeNodeType.BINARY_EXPRESSION) {
    transformTree[node.value] = [transform(node.left), transform(node.right)]
  } else if (node.type === TreeNodeType.VARIABLE) {
    return { var: node.value }
  } else if (node.type === TreeNodeType.NUMBER) {
    return Number(node.value)
  }
  return transformTree
}

const isObject = (val: unknown): val is object => Object.prototype.toString.call(val) === '[object Object]'

export const transformObject = (obj: object): string => {

  const transformNode = (node: unknown): any => {
    if (Array.isArray(node)) {
      return node.map(transformNode)
    }
    if (isObject(node)) {
      const operator = Object.keys(node)[0]
      const operands = node[operator as keyof typeof node]
      if (operator === 'var') {
        return Array.isArray(operands) ? operands[0] : operands
      }
      return {
        operator,
        left: transformNode(operands[0]),
        right: transformNode(operands[1]),
      }
    }

    return node
  }
  const stringify = (node: any, parent: any = null): string => {
    if (isObject(node) && 'operator' in node && 'left' in node && 'right' in node) {
      if (parent && (parent.operator === '*' || parent.operator === '/') && (
        node.operator === '+' || node.operator === '-'
      )) {
        return `(${stringify(node.left, node)} ${node.operator} ${stringify(node.right, node)})`
      }
      return `${stringify(node.left, node)} ${node.operator} ${stringify(node.right, node)}`
    }
    return String(node)
  }

  return stringify(transformNode(obj))
}


const parse = (input: string) => {
  return transform(
    buildTree(
      tokenizer(input)
    )
  )
}

export default parse;