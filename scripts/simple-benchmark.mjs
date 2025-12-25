#!/usr/bin/env node
/**
 * Simple benchmark using compiled code
 */

import { TokenOptimizer } from '../dist/optimizer/token-optimizer.js';

const optimizer = new TokenOptimizer();

const testCases = [
  {
    name: 'Small JSON - Simple Object',
    category: 'JSON-Small',
    data: JSON.stringify({
      user: {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        active: true
      }
    }, null, 2)
  },
  {
    name: 'Medium JSON - Product List',
    category: 'JSON-Medium',
    data: JSON.stringify({
      products: [
        { id: 101, name: 'Laptop Pro', price: 1299, stock: 45, category: 'Electronics' },
        { id: 102, name: 'Wireless Mouse', price: 29, stock: 150, category: 'Accessories' },
        { id: 103, name: 'USB-C Cable', price: 15, stock: 200, category: 'Accessories' },
        { id: 104, name: 'Monitor 27"', price: 399, stock: 30, category: 'Electronics' },
        { id: 105, name: 'Keyboard RGB', price: 89, stock: 75, category: 'Accessories' }
      ],
      metadata: {
        total: 5,
        timestamp: '2024-01-15T10:30:00Z',
        store: 'TechStore'
      }
    }, null, 2)
  },
  {
    name: 'Large JSON - User Records',
    category: 'JSON-Large',
    data: JSON.stringify({
      users: Array.from({ length: 20 }, (_, i) => ({
        id: 1000 + i,
        username: `user${i}`,
        email: `user${i}@example.com`,
        profile: {
          firstName: `First${i}`,
          lastName: `Last${i}`,
          age: 20 + (i % 50),
          country: ['USA', 'UK', 'Canada', 'Australia'][i % 4]
        },
        settings: {
          notifications: true,
          theme: 'dark',
          language: 'en'
        }
      }))
    }, null, 2)
  },
  {
    name: 'Multilingual - English',
    category: 'Multilingual',
    data: JSON.stringify({
      messages: [
        { id: 1, text: 'Hello, how are you today?', sender: 'Alice' },
        { id: 2, text: 'I am doing great, thanks for asking!', sender: 'Bob' },
        { id: 3, text: 'Would you like to grab coffee later?', sender: 'Alice' }
      ]
    }, null, 2)
  },
  {
    name: 'Multilingual - Chinese',
    category: 'Multilingual',
    data: JSON.stringify({
      messages: [
        { id: 1, text: '你好，今天過得怎麼樣？', sender: 'Alice' },
        { id: 2, text: '我很好，謝謝你的關心！', sender: 'Bob' },
        { id: 3, text: '等一下要一起喝咖啡嗎？', sender: 'Alice' }
      ]
    }, null, 2)
  },
  {
    name: 'Multilingual - Japanese',
    category: 'Multilingual',
    data: JSON.stringify({
      messages: [
        { id: 1, text: 'こんにちは、今日はどうですか？', sender: 'Alice' },
        { id: 2, text: '元気です、ありがとうございます！', sender: 'Bob' },
        { id: 3, text: '後でコーヒーを飲みませんか？', sender: 'Alice' }
      ]
    }, null, 2)
  }
];

console.log('\n' + '='.repeat(80));
console.log('TOKEN SAVINGS BENCHMARK');
console.log('='.repeat(80) + '\n');

const results = [];

for (const testCase of testCases) {
  try {
    const originalTokens = optimizer.countTokens(testCase.data);
    const optimized = optimizer.optimize(testCase.data, 'benchmark');
    const optimizedTokens = optimizer.countTokens(optimized.optimizedContent);

    const savings = originalTokens - optimizedTokens;
    const savingsPercent = (savings / originalTokens) * 100;

    console.log(`\n${testCase.name}`);
    console.log(`  Category:   ${testCase.category}`);
    console.log(`  Original:   ${originalTokens.toString().padStart(5)} tokens`);
    console.log(`  Optimized:  ${optimizedTokens.toString().padStart(5)} tokens`);
    console.log(`  Savings:    ${savings.toString().padStart(5)} tokens (${savingsPercent.toFixed(1)}%)`);

    results.push({
      name: testCase.name,
      category: testCase.category,
      savingsPercent
    });
  } catch (error) {
    console.error(`\n❌ Error with ${testCase.name}:`, error.message);
  }
}

// Statistics
if (results.length > 0) {
  const percents = results.map(r => r.savingsPercent);
  const avg = percents.reduce((a, b) => a + b) / percents.length;
  const sorted = [...percents].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const min = Math.min(...percents);
  const max = Math.max(...percents);

  console.log('\n' + '='.repeat(80));
  console.log('STATISTICS');
  console.log('='.repeat(80));
  console.log(`\n  Tests:    ${results.length}`);
  console.log(`  Average:  ${avg.toFixed(1)}%`);
  console.log(`  Median:   ${median.toFixed(1)}%`);
  console.log(`  Range:    ${min.toFixed(1)}% - ${max.toFixed(1)}%`);

  console.log('\n' + '='.repeat(80));
  console.log('RECOMMENDATION');
  console.log('='.repeat(80));

  if (avg >= 60) {
    console.log(`\n  ✅ Current "60%+ on average" is ACCURATE`);
  } else {
    console.log(`\n  ❌ Current "60%+ on average" is TOO HIGH`);
    console.log(`  💡 Suggest: "${Math.floor(avg / 10) * 10}%+ on average" or "${min.toFixed(0)}-${max.toFixed(0)}% typical range"`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}
