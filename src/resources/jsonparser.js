import {fields} from './elements/index'

/**
 * Parse an object into a {@link Field}.
 * @param  {String} id       The ID for the field.
 * @param  {Object} obj      The parameters for the field.
 * @param  {Field}  [parent] The parent of the new field.
 * @return {Field}           The field created from the given data.
 */
export function parseJSON(id, obj, parent = undefined) {
  const createdObj = new fields[obj.type]()
  if (obj.type === 'object') {
    for (const [key, field] of Object.entries(obj.children)) {
      obj.children[key] = parseJSON(key, field, createdObj)
    }
    if (obj.legendChildren) {
      for (const [key, field] of Object.entries(obj.legendChildren)) {
        obj.legendChildren[key] = parseJSON(key, field, createdObj)
      }
    }
  } else if (obj.type === 'array') {
    obj.item = parseJSON(obj.item.id, obj.item, createdObj)
  }
  obj.parent = parent
  return createdObj.init(id, obj)
}
