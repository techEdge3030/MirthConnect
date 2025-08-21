// server/templates/channelXml.js
import { create } from 'xmlbuilder2';

function buildXmlNode(builder, obj, tagName) {
  let node = builder.ele(tagName);

  if (obj === null) {
    node.att('nil', 'true');
    return node;
  }

  if (typeof obj !== 'object' || obj === null) {
    node.txt(obj?.toString() || '');
    return node;
  }

  // Check if it's a pseudo-array (object with sequential numeric string keys)
  const keys = Object.keys(obj);
  const isPseudoArray = !Array.isArray(obj) &&
    keys.length > 0 &&
    keys.every(k => !isNaN(parseInt(k))) &&
    keys.sort((a, b) => parseInt(a) - parseInt(b)).every((k, i) => parseInt(k) === i);

  if (Array.isArray(obj) || isPseudoArray) {
    // For arrays or pseudo-arrays, create parent tag and add children with singular form if possible
    // But since we don't have singular, we use the tagName for each item
    const items = Array.isArray(obj) ? obj : Object.values(obj).sort((a, b) => {
      const aKey = Object.keys(obj).find(k => obj[k] === a);
      const bKey = Object.keys(obj).find(k => obj[k] === b);
      return parseInt(aKey) - parseInt(bKey);
    });

    items.forEach(item => {
      buildXmlNode(node, item, tagName.slice(0, -1)); // Assume singular by removing 's', adjust if needed
    });
    return node;
  }

  // First handle attributes
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('@')) {
      node.att(key.slice(1), value.toString());
    }
  }

  // Then handle children
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('@')) continue; // Already handled

    if (value === null) {
      // Handle null as xsi:nil="true"
      node.ele(key).att('nil', 'true');
    } else if (Array.isArray(value)) {
      value.forEach(item => {
        buildXmlNode(node, item, key);
      });
    } else if (typeof value === 'object') {
      buildXmlNode(node, value, key);
    } else {
      node.ele(key).txt(value.toString());
    }
  }

  return node;
}

export function buildChannelXml(channel) {
  const doc = create({ version: '1.0', encoding: 'UTF-8' });
  buildXmlNode(doc, channel, 'channel');
  return doc.end({ prettyPrint: true });
} 