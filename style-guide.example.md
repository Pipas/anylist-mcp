# AnyList style guide

How we write things in our AnyList. Follow it whenever you create, import or
edit recipes, meal plans or shopping items.

## Recipe titles

- Title Case, but keep these words lowercase unless they come first:
  a, an, the, and, or, with, of, in, on.
- No leading or trailing spaces.

## Ingredients

- Quantity first, then the name: `200g Cherry tomatoes`, `2 Garlic cloves`.
- Metric units, glued to the number: `200g`, `500ml`, `1kg`.
- Names in sentence case; brand names as the brand writes them.
- "To taste" items have no quantity: `Salt`, `Olive oil`.

## Shopping list

- Use the same names as recipe ingredients; put the quantity in the quantity field.
- Check the list for an existing item before adding a near-duplicate.

## Audit rules

Used by `recipes` → `audit`. Keep this block valid JSON.

```json
{
  "titleLowercaseWords": ["a", "an", "the", "and", "or", "with", "of", "in", "on"],
  "spellings": {
    "cherry tomatos": "cherry tomatoes",
    "parmesan cheese": "parmesan"
  }
}
```
