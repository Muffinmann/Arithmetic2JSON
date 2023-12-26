# Arithmetic2JSON

Arithmetic2JSON converts arithmetic expressions into a JSON object. 

## Example

```js
console.log(parse("(length - 2.2) * 3 - 10 * 3"))
/**
{
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
*/

// or reversely
console.log(parse(
  {
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
))
/*
(length - 2.2) * 3 - 10 * 3
*/
```